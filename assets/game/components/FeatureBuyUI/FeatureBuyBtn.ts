import { _decorator, Button, Component, Node } from 'cc';
import { BaseEvent } from 'db://assets/base/script/event/BaseEvent';
import { XEvent } from 'db://assets/base/script/event/XEvent';
import { audioManager } from 'db://assets/base/script/manager/AudioManager';

import { AudioKey } from 'db://assets/game/script/data/AudioKey';

const { ccclass } = _decorator;

/**
 * 免費遊戲按鈕
 */
@ccclass('FeatureBuyBtn')
export class FeatureBuyBtn extends Component {
    /**點擊免費遊戲 */
    public static click: XEvent = new XEvent();
    public static show: XEvent = new XEvent();
    public static hide: XEvent = new XEvent();

    /**購買功能按鈕 */
    private FeatureBuyButton: Node = null;

    private isVisible: boolean = false;
    private isEnabled: boolean = false;

    onLoad() {
        //點擊免費遊戲
        this.FeatureBuyButton = this.node.getChildByName('btn');
        this.FeatureBuyButton.on(Button.EventType.CLICK, () => {
            audioManager().playSound(AudioKey.btnBuyClick);
            FeatureBuyBtn.click.emit();
        }, this);

        FeatureBuyBtn.show.on(this.show, this);
        FeatureBuyBtn.hide.on(this.hide, this);

        //設定是否可見(後台設定)
        BaseEvent.buyFeatureVisible.on((visible) => {
            this.isVisible = visible;
            this.refresh();
        }, this);

        //設定是否可用(各階段)
        BaseEvent.buyFeatureEnabled.on((enabled) => {
            this.isEnabled = enabled;
            this.refresh();
        }, this);
    }

    private show(): void {
        this.node.active = true;
    }

    private hide(): void {
        this.node.active = false;
    }

    /**刷新 */
    private refresh(): void {
        if (!this.FeatureBuyButton.isValid) {
            return;
        }
        this.node.active = this.isVisible;
        this.FeatureBuyButton.active = this.isVisible;
        this.FeatureBuyButton.getComponent(Button).interactable = this.isEnabled;
    }

    onDestroy() {
        FeatureBuyBtn.click.off(this);
        FeatureBuyBtn.show.off(this);
        FeatureBuyBtn.hide.off(this);
    }
}