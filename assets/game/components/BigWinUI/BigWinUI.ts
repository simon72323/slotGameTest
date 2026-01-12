import { _decorator, Button, Color, Component, KeyCode, Label, sp, tween, Tween } from 'cc';
import { BaseConst } from 'db://assets/base/script/data/BaseConst';
import { BetData } from 'db://assets/base/script/data/BetData';
import { dataManager } from 'db://assets/base/script/data/DataManager';
import { BaseEvent } from 'db://assets/base/script/event/BaseEvent';
import { XEvent, XEvent1 } from 'db://assets/base/script/event/XEvent';
import { audioManager } from 'db://assets/base/script/manager/AudioManager';
import { BigWinType } from 'db://assets/base/script/types/BaseType';
import { Utils } from 'db://assets/base/script/utils/Utils';

import { AudioKey } from 'db://assets/game/script/data/AudioKey';

type BigWinConfig = {
    sound: AudioKey
    in: string
    loop: string
    duration: number //跑分時間
}

type ScrollingData = {
    currentRateValue: number,
    endRateValue: number,
    finalRateValue: number,
    currentType: BigWinType,
    finalType: BigWinType,
}

enum CoinAnimation {
    superWin_loop = 'superWin_loop',
    superWin_in = 'superWin_in',
}

enum WinAnimation {
    big_loop = 'big_loop',
    big_in = 'big_in',
    mega_loop = 'mega_loop',
    mega_in = 'mega_in',
    super_loop = 'super_loop',
    super_in = 'super_in',
}

const { ccclass } = _decorator;

/**
 * BigWin演示
 */
@ccclass('BigWinUI')
export class BigWinUI extends Component {
    /** 顯示大獎 (BigWin終值, 顯示時會被除100) */
    public static show: XEvent1<number> = new XEvent1();
    /**演示完畢通知 */
    public static complete: XEvent = new XEvent();
    /**是否正在滾動 */
    private isPlaying: boolean = false;
    /**數字label */
    private winLabel: Label;
    private currencyLabel: Label;

    private aniWin: sp.Skeleton;
    private aniCoin: sp.Skeleton;

    /**獎項參數 */
    private bigWinConfig: BigWinConfig[] = [
        {
            sound: AudioKey.bigWin,
            in: WinAnimation.big_in,
            loop: WinAnimation.big_loop,
            duration: 3
        },
        {
            sound: AudioKey.superWin,
            in: WinAnimation.super_in,
            loop: WinAnimation.super_loop,
            duration: 3
        },
        {
            sound: AudioKey.megaWin,
            in: WinAnimation.mega_in,
            loop: WinAnimation.mega_loop,
            duration: 3
        }
    ];

    /**跑分資料 */
    private data: ScrollingData = {
        currentType: BigWinType.big,
        finalType: BigWinType.big,
        currentRateValue: 0, //當前起點跑分值
        endRateValue: 0, //當前終點跑分值
        finalRateValue: 0 //最終跑分值
    };

    /**大獎值 */
    private bigWinValue: number = 0;
    /**SUPER獎值 */
    private superWinValue: number = 0;
    /**MEGA獎值 */
    private megaWinValue: number = 0;

    onLoad() {
        BigWinUI.show.on(this.onShow, this);

        this.aniWin = this.node.getChildByPath('bigWinNode/ani_win').getComponent(sp.Skeleton);
        this.aniCoin = this.node.getChildByPath('bigWinNode/ani_coin').getComponent(sp.Skeleton);
        this.currencyLabel = this.node.getChildByPath('bigWinNode/numLayout/currency').getComponent(Label);
        this.winLabel = this.node.getChildByPath('bigWinNode/numLayout/num_totalwin').getComponent(Label);
        this.node.active = false;
    }


    /**
     * 大獎演示
     * @param value 
     */
    private onShow(value: number): void {
        audioManager().editMusicVolume(0.1);//降低背景音樂音量
        audioManager().playSound(AudioKey.afterMusic);//報獎音效
        this.currencyLabel.string = Utils.getCurrencySymbol();
        //skip
        this.node.getChildByPath('SkipSensor').once(Button.EventType.CLICK, this.onSkip, this);
        BaseEvent.keyDown.once((code: KeyCode) => {
            if (code === KeyCode.SPACE) {
                this.onSkip();
            }
        }, this);

        Utils.fadeIn(this.node, 0.3, 0, 255);

        //設定終值
        this.data.currentRateValue = 0;
        this.data.endRateValue = 0;
        this.data.finalRateValue = value;
        this.data.currentType = BigWinType.big;
        this.data.finalType = dataManager().getBigWinTypeByValue(value);

        this.node.active = true;
        this.isPlaying = true;

        this.winLabel.string = '';
        this.winLabel.color = Color.WHITE;

        this.aniCoin.setAnimation(0, CoinAnimation.superWin_in, false);
        this.aniCoin.addAnimation(0, CoinAnimation.superWin_loop, true);

        this.bigWinValue = dataManager().bigWinMultiple[BigWinType.big] * BetData.getBetTotal();
        this.superWinValue = dataManager().bigWinMultiple[BigWinType.super] * BetData.getBetTotal();
        this.megaWinValue = dataManager().bigWinMultiple[BigWinType.mega] * BetData.getBetTotal();
        this.tweenAtLevel();
    }

    /**
     * 跑分
     */
    private tweenAtLevel() {
        let config = this.bigWinConfig[this.data.currentType];

        //設定bigWin等級樣式
        this.setTypeStyle(this.data.currentType);

        switch (this.data.currentType) {
            case BigWinType.big:
                this.data.currentRateValue = 0;
                this.data.endRateValue = this.bigWinValue;
                break;
            case BigWinType.super:
                this.data.currentRateValue = this.bigWinValue;
                this.data.endRateValue = this.superWinValue;
                break;
            case BigWinType.mega:
                this.data.currentRateValue = this.superWinValue;
                this.data.endRateValue = this.megaWinValue;
                break;
        }

        let endType = this.data.currentType + 1;
        let duration: number = 0;
        let endDelay: number = 0;

        //超過極限
        if (endType > dataManager().bigWinMultiple.length - 1) {
            this.data.endRateValue = this.data.finalRateValue;
            duration = config.duration;
        }
        //最後等級,直接到終值,時間等比例換算
        else if (this.data.currentType === this.data.finalType) {
            this.data.endRateValue = this.data.finalRateValue;
            let levelEndValue = dataManager().bigWinMultiple[endType] * BetData.getBetTotal();
            duration = config.duration * (this.data.finalRateValue - this.data.currentRateValue) / (levelEndValue - this.data.currentRateValue);
            endDelay = config.duration - duration;
        }
        else {
            duration = config.duration;
        }

        tween(this.data)
            .to(duration, { currentRateValue: this.data.endRateValue }, {
                onUpdate: (obj: ScrollingData) => {
                    this.winLabel.string = Utils.numberFormat(obj.currentRateValue);
                }
            })
            .call(() => {
                //停止跑分音效
                // if (this.data.endRateValue === this.data.finalRateValue) {
                // audioManager().stopSound(AudioKey.WinRolling);
                // }
            })
            .delay(endDelay)
            .call(() => {
                //繼續下一等級
                if (this.data.currentType !== this.data.finalType) {
                    //停止播放前一等級音效
                    audioManager().stopSound(this.bigWinConfig[this.data.currentType].sound);

                    this.data.currentType++;
                    this.tweenAtLevel();
                }
                //BigWin結束
                else if (this.data.endRateValue === this.data.finalRateValue) {
                    this.onBigWinEnd();
                }
            })
            .start();
    }

    /**
     * 依照等級設定樣式
     * @param type 
     */
    private setTypeStyle(type: BigWinType) {
        let config = this.bigWinConfig[type];
        audioManager().playSound(config.sound);

        Utils.ClearSpine(this.aniWin);
        this.aniWin.setAnimation(0, config.in, false);
        this.aniWin.addAnimation(0, config.loop, true);
    }

    /**
     * 跳過大獎演示
     * @returns 
     */
    private onSkip() {
        this.node.getChildByPath('SkipSensor').off(Button.EventType.CLICK, this.onSkip, this);
        BaseEvent.keyDown.off(this);

        //正在播放才能skip
        if (!this.isPlaying) {
            return;
        }

        if (this.data.currentType !== this.data.finalType) {
            //停止播放前一等級音效
            audioManager().stopSound(this.bigWinConfig[this.data.currentType].sound);
            //補最後一次等級設定
            this.data.currentType = this.data.finalType;
            this.setTypeStyle(this.data.currentType);
        }
        // this.isSkip = true;
        this.onBigWinEnd();
    }

    /**
     * 到達終值
     */
    private async onBigWinEnd(): Promise<void> {
        let config = this.bigWinConfig[this.data.finalType];
        this.isPlaying = false;
        Tween.stopAllByTarget(this.data);
        this.winLabel.string = Utils.numberFormat(this.data.finalRateValue);
        audioManager().playSound(AudioKey.winEnd);
        audioManager().stopSound(config.sound);
        audioManager().stopSound(AudioKey.afterMusic);

        await Utils.delay(BaseConst.GAME_TIME.winEndDelay);
        Utils.fadeOut(this.node, 1, 255, 0, () => {
            this.onBigWinComplete();
        });
    }

    /**
     * 演示完畢
     */
    private onBigWinComplete() {
        audioManager().editMusicVolume(1);//恢復背景音樂
        this.node.active = false;
        BigWinUI.complete.emit();
    }

    onDestroy() {
        BigWinUI.complete.off(this);
        BigWinUI.show.off(this);
    }
}