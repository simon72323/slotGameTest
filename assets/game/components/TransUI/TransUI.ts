import { _decorator, Button, Component, KeyCode, Label, Node, sp, Sprite, Tween, tween } from 'cc';
import { UrlParam } from 'db://assets/base/script/data/UrlParam';
import { BaseEvent } from 'db://assets/base/script/event/BaseEvent';
import { XEvent, XEvent4 } from 'db://assets/base/script/event/XEvent';
import { BundleLoader } from 'db://assets/base/script/loading/BundleLoader';
import { audioManager } from 'db://assets/base/script/manager/AudioManager';
import { Utils } from 'db://assets/base/script/utils/Utils';

import { AudioKey } from 'db://assets/game/script/data/AudioKey';

enum CutsceneAni {
    fg_loop = 'fg_loop',
    fg_in = 'fg_in'
}

const { ccclass, property } = _decorator;
/**
 * 轉場UI
 */
@ccclass('TransUI')
export class TransUI extends Component {
    /**轉場淡入(times:次數) */
    public static show: XEvent4<number, number, () => void, () => void> = new XEvent4();
    /**點擊 */
    public static click: XEvent = new XEvent();

    /**面板動畫 */
    private cutscene_ani: sp.Skeleton;
    /**次數 */
    private num_freeSpin: Label;
    /**顯示時間 */
    private showTime: Label;
    /**wild 節點*/
    private wildNode: Node;
    /**wild倍率 */
    private wildLabel: Label;

    /**畫面自動關閉計時器 */
    private countdown = {
        curTime: 0,
        finalTime: 10
    };

    /**skip感應區 */
    private sens: Node;
    private cbComplete: () => void;

    onLoad() {
        this.setLanguage();
        this.cutscene_ani = this.node.getChildByName('cutscene_ani').getComponent(sp.Skeleton);
        this.num_freeSpin = this.node.getChildByPath('cutscene_ani/Content/num_freeSpin').getComponent(Label);
        this.showTime = this.node.getChildByPath('cutscene_ani/Content/Layout/ShowTime').getComponent(Label);
        this.wildNode = this.node.getChildByPath('cutscene_ani/Content/Wild');
        this.wildLabel = this.wildNode.getChildByName('Label').getComponent(Label);
        this.sens = this.node.getChildByName('Sens');
        TransUI.show.on(this.show, this);//轉場淡入
        this.node.active = false;
        this.wildNode.active = false;
    }

    /**
     * 設定語言
     */
    private setLanguage(): void {
        const lang = UrlParam.lang;
        BundleLoader.onLoaded('language', `${lang}/texture`, (langRes: any) => {
            this.node.getChildByPath('cutscene_ani/ribbon/tx_get').getComponent(Sprite).spriteFrame = langRes['tx_get'];
            this.node.getChildByPath('cutscene_ani/Content/tx_getFree').getComponent(Sprite).spriteFrame = langRes['tx_getFree'];
        });
    }

    /**
     * 顯示轉場
     * @param times 次數
     * @param wildMultiplier wild倍率
     * @param onCover 覆蓋事件
     * @param onComplete 完成事件
     */
    private async show(times: number, wildMultiplier: number, onCover: () => void, onComplete: () => void): Promise<void> {
        audioManager().editMusicVolume(0.1);//降低背景音樂音量
        audioManager().playSound(AudioKey.bgTrans);
        audioManager().playSound(AudioKey.trans);
        this.node.active = true;
        if (wildMultiplier > 1) {
            this.wildNode.active = true;
            this.wildLabel.string = `x${wildMultiplier}`;
        } else {
            this.wildNode.active = false;
        }
        this.cbComplete = onComplete;

        Utils.fadeIn(this.node, 0.3, 0, 255);

        this.cutscene_ani.setAnimation(0, CutsceneAni.fg_in, false);
        this.cutscene_ani.addAnimation(0, CutsceneAni.fg_loop, true);
        this.num_freeSpin.string = times.toString();

        this.runCountdown();//倒數計時器

        //1秒後才可以跳過
        await Utils.delay(1);
        onCover?.();//全遮蔽被覆蓋，可執行轉場
        this.sens.once(Button.EventType.CLICK, this.onComplete, this);
        BaseEvent.keyDown.once((code: KeyCode) => {
            if (code == KeyCode.SPACE) {
                this.onComplete();
            }
        }, this);
    }

    /**
     * 倒數計時器
     */
    private runCountdown(): void {
        this.showTime.string = this.countdown.finalTime.toString();
        this.countdown.curTime = this.countdown.finalTime;//重置倒數計時器
        tween(this.countdown)
            .to(this.countdown.finalTime, { curTime: 0 }, {
                onUpdate: () => {
                    this.showTime.string = Math.ceil(this.countdown.curTime).toString();
                },
                onComplete: () => {
                    this.onComplete();
                }
            })
            .start();
    }

    /**
     * 完成
     */
    private async onComplete(): Promise<void> {
        audioManager().editMusicVolume(1);//恢復背景音樂
        audioManager().stopSound(AudioKey.bgTrans);
        this.sens.off(Button.EventType.CLICK, this.onComplete, this);
        BaseEvent.keyDown.off(this);
        Tween.stopAllByTarget(this.countdown);
        this.showTime.string = '0';

        // await Utils.delay(1);
        Utils.fadeOut(this.node, 0.3, 255, 0, () => {
            this.node.active = false;
            this.cbComplete?.();
        });
    }

    onDestroy() {
        TransUI.show.off(this);
        TransUI.click.off(this);
    }
}