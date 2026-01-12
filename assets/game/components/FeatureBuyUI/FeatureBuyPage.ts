import { _decorator, Button, Component, EventTouch, Label, Node, tween, Vec3 } from 'cc';
import { SettingsBetInfo } from 'db://assets/base/components/settingsController/SettingsBetInfo';
import { BetData } from 'db://assets/base/script/data/BetData';
import { dataManager } from 'db://assets/base/script/data/DataManager';
import { BaseEvent } from 'db://assets/base/script/event/BaseEvent';
import { XEvent } from 'db://assets/base/script/event/XEvent';
import { audioManager } from 'db://assets/base/script/manager/AudioManager';
import { addBtnClickEvent, Utils } from 'db://assets/base/script/utils/Utils';

import { AudioKey } from 'db://assets/game/script/data/AudioKey';

const { ccclass } = _decorator;

/**
 * 購買功能頁面
 */
@ccclass('FeatureBuyPage')
export class FeatureBuyPage extends Component {
    /**顯示(免費遊戲花費) */
    public static show: XEvent = new XEvent();
    /**隱藏 */
    public static hide: XEvent = new XEvent();

    private isHiding: boolean = false;

    /**底板 */
    private buyUI: Node;
    /**花費 */
    private costLabel: Label;
    private currencyLabel: Label;
    /**購買按鈕 */
    private buyBtn: Button;
    /**增加按鈕 */
    private addBtn: Button;
    /**減少按鈕 */
    private lessBtn: Button;

    onLoad() {
        this.buyUI = this.node.getChildByName('pic_buy');
        this.currencyLabel = this.node.getChildByPath('pic_buy/numLayout/currency').getComponent(Label);
        this.costLabel = this.node.getChildByPath('pic_buy/numLayout/num_totalwin').getComponent(Label);

        const cancelBtn = this.node.getChildByPath('pic_buy/btn_cancel').getComponent(Button);
        cancelBtn.node.on(Button.EventType.CLICK, () => {
            this.hide();
        }, this);

        this.buyBtn = this.node.getChildByPath('pic_buy/btn_buy').getComponent(Button);
        this.addBtn = this.node.getChildByPath('pic_buy/btn_add').getComponent(Button);
        this.lessBtn = this.node.getChildByPath('pic_buy/btn_less').getComponent(Button);
        const scriptName = 'FeatureBuyPage';
        addBtnClickEvent(this.node, scriptName, this.buyBtn, 'onClickBuy');
        addBtnClickEvent(this.node, scriptName, this.addBtn, 'onClickChangeBet', '1');
        addBtnClickEvent(this.node, scriptName, this.lessBtn, 'onClickChangeBet', '-1');

        //關閉
        this.node.getChildByName('Block').on(Button.EventType.CLICK, this.hide, this);

        FeatureBuyPage.show.on(this.show, this);
        FeatureBuyPage.hide.on(this.hide, this);

        this.node.active = false;
    }

    /**
     * 開啟FeatureBuy介面
     */
    private show(): void {
        dataManager().lockKeyboard = true;//鎖定鍵盤功能
        audioManager().playSound(AudioKey.showBuyWindow);
        this.currencyLabel.string = Utils.getCurrencySymbol();
        this.updateBuyTotal();//更新購買花費
        this.node.active = true;
        Utils.fadeIn(this.buyUI, 0.3, 0, 255);
        this.buyUI.scale = new Vec3(0.8, 0.8, 1);
        tween(this.buyUI)
            .to(0.15, { scale: new Vec3(1.1, 1.1, 1) }, { easing: 'sineOut' })
            .to(0.15, { scale: new Vec3(1, 1, 1) }, { easing: 'sineIn' })
            .start();
    }

    /**
     * 關閉FeatureBuy介面
     */
    private hide(): void {
        if (this.isHiding) {
            return;
        }
        dataManager().lockKeyboard = false;//解除鎖定鍵盤功能
        audioManager().playSound(AudioKey.btnBuyCancle);
        this.isHiding = true;
        this.forceHide();
    }

    /**
     * 點擊購買
     */
    private onClickBuy(): void {
        if (this.isHiding) {
            return;
        }
        audioManager().playSound(AudioKey.btnBuyConfirm);
        this.forceHide();
        BaseEvent.buyFeature.emit();
    }

    /**
     * 點擊改變下注
     * @param event 事件
     * @param eventData 事件數據
     */
    private onClickChangeBet(event: EventTouch, eventData: string): void {
        audioManager().playSound(AudioKey.btnClick);
        const changeValue = parseInt(eventData);
        SettingsBetInfo.changeBetValue.emit(changeValue);
        this.updateBuyTotal();
        // this.updateBetBtnInteractable();
    }

    /**
     * 更新購買資訊
     */
    private updateBuyTotal(): void {
        const buyFeatureTotal = BetData.getBuyFeatureTotal();
        this.costLabel.string = Utils.numberFormat(buyFeatureTotal);
        this.buyBtn.interactable = dataManager().getBuyFeatureEnabled();
    }

    /**
     * 更新下注+-按鈕是否可用
     */
    // private updateBetBtnInteractable() {
    //     this.addBtn.getComponent(Button).interactable = BetData.getPlusEnabled();
    //     this.lessBtn.getComponent(Button).interactable = BetData.getLessEnabled();
    // }

    /**
     * 購買退出
     */
    private forceHide(): void {
        Utils.fadeOut(this.buyUI, 0.2, 255, 0, () => {
            this.node.active = false;
            this.isHiding = false;
        });
        tween(this.buyUI)
            .to(0.2, { scale: new Vec3(0.8, 0.8, 1) }, { easing: 'sineOut' })
            .start();
    }

    onDestroy() {
        FeatureBuyPage.show.off(this);
        FeatureBuyPage.hide.off(this);
    }
}