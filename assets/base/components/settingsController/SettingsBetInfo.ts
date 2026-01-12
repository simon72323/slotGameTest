import { _decorator, Component, EventTouch, Label, Node, tween, Tween, Vec3 } from 'cc';
import { Utils } from '../../script/utils/Utils';
import { dataManager } from '../../script/data/DataManager';
import { audioManager } from '../../script/manager/AudioManager';
import { AudioKey } from 'db://assets/game/script/data/AudioKey';
import { BetData } from '../../script/data/BetData';
import { BaseEvent } from '../../script/event/BaseEvent';
import { XEvent1, XEvent2 } from '../../script/event/XEvent';

const { ccclass, property } = _decorator;
/**
 * 轉場UI
 */
@ccclass('SettingsBetInfo')
export class SettingsBetInfo extends Component {
    /**刷新獲得 */
    public static refreshWin: XEvent2<number, number> = new XEvent2();
    /**刷新額度 */
    public static refreshCredit: XEvent1<number> = new XEvent1();
    /**刷新額度 */
    public static refreshBet: XEvent1<number> = new XEvent1();
    /**改變下注 */
    public static changeBetValue: XEvent1<number> = new XEvent1();
    /**添加到中獎層級 */
    public static addToWinLayer: XEvent1<Node> = new XEvent1();
    private balanceValue: Label = null;//剩餘額度
    private totalWinValue: Label = null;//總贏得
    private totalBetValue: Label = null;//總下注
    private totalBet: number = 0;//總下注
    private winLayer: Node = null;//中獎層級節點

    private timeInterval: any = null;
    private timeLabel: Label = null;
    private playTimeLabel: Label = null;
    private startGameTime: number = 0;

    onLoad() {
        this.setNode();//設定節點
        this.setEventListen();//設定事件監聽
        this.setTimes();//設定時間
    }

    /**設定節點 */
    private setNode() {
        this.balanceValue = this.node.getChildByPath('Balance/Value').getComponent(Label);
        this.totalWinValue = this.node.getChildByPath('TotalWin/Value').getComponent(Label);
        this.totalBetValue = this.node.getChildByPath('TotalBet/Value').getComponent(Label);
        this.timeLabel = this.node.getChildByPath('Times/Time/Value').getComponent(Label);
        this.playTimeLabel = this.node.getChildByPath('Times/PlayTime/Value').getComponent(Label);
        this.winLayer = this.node.getChildByPath('WinLayer');
    }

    /**設定事件監聽 */
    private setEventListen() {
        SettingsBetInfo.refreshCredit.on(this.refreshCredit, this);//監聽刷新餘額事件
        SettingsBetInfo.refreshBet.on(this.refreshBet, this);//監聽刷新下注事件
        SettingsBetInfo.refreshWin.on(this.refreshWin, this);//監聽刷新獲得事件
        SettingsBetInfo.changeBetValue.on(this.changeBetValue, this);
        SettingsBetInfo.addToWinLayer.on(this.addToWinLayer, this);//監聽添加到中獎層級事件
    }

    /**
     * 添加到中獎層級
     * @param node 中獎層級節點
     */
    private addToWinLayer(node: Node) {
        this.winLayer.addChild(node);
    }

    /**設定時間 */
    private setTimes() {
        this.startGameTime = Date.now();
        this.updateTime();
        // 每秒更新一次时间
        this.timeInterval = setInterval(() => {
            this.updateTime();
        }, 1000);
        document.addEventListener('visibilitychange', this.onVisibilityChange, false);
    }

    /**
     * 改變下注+-
     * @param event 事件
     * @param eventData 事件數據
     */
    private changeBet(event: EventTouch, eventData: string) {
        audioManager().playSound(AudioKey.btnClick);
        const changeValue = parseInt(eventData);
        this.changeBetValue(changeValue);
    }

    /**
     * 改變下注值
     * @param changeValue 改變值(1為增加，-1為減少)
     * @param callback 回調函數
     */
    private changeBetValue(changeValue: number) {
        //下注數值更新(添加幣別符號與格式化)
        BetData.getChangeBetValue(changeValue);
        const betTotal = BetData.getBetTotal();
        this.refreshBet(betTotal);
        // this.totalBetValue.string = Utils.numberFormatCurrency(betValue);
        // this.updateBetBtnInteractable();

        //更新購買功能是否可用
        const buyFeatureEnabled = dataManager().getBuyFeatureEnabled();
        BaseEvent.buyFeatureEnabled.emit(buyFeatureEnabled);//更新購買功能是否可用
    }

    /**刷新可用餘額 */
    private refreshCredit(value: number): void {
        const userCredit = dataManager().userCredit;
        if (userCredit === value) {
            this.balanceValue.string = Utils.numberFormatCurrency(value);
            return;
        }
        Utils.runNumberCurrency(0.3, this.balanceValue, { curValue: userCredit, finalValue: value });
    }

    /**刷新下注 */
    private refreshBet(newBet: number): void {
        Tween.stopAllByTarget(this.totalBetValue.node);
        let oldBet = this.totalBet;
        //資料有異動才跳動
        if (newBet !== oldBet) {
            tween(this.totalBetValue.node)
                .to(0.1, { scale: new Vec3(1.2, 1.2, 1) })
                .to(0.1, { scale: new Vec3(1, 1, 1) })
                .start();
        }
        this.totalBet = newBet;
        this.totalBetValue.string = Utils.numberFormatCurrency(newBet);
    }

    /**刷新獲得 */
    private refreshWin(startValue: number, endValue: number): void {
        if (endValue <= 0) {
            this.totalWinValue.string = '';
            return;
        }
        Utils.runNumberCurrency(0.3, this.totalWinValue, { curValue: startValue, finalValue: endValue });
    }


    /**更新時間 */
    updateTime() {
        const now = new Date();
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        // const seconds = String(now.getSeconds()).padStart(2, '0');
        const timeString = `${hours}:${minutes}`;
        this.timeLabel.string = timeString;
        const playTime = Date.now() - this.startGameTime;
        const playTimeHours = String(Math.floor(playTime / 3600000)).padStart(2, '0');
        const playTimeMinutes = String(Math.floor((playTime % 3600000) / 60000)).padStart(2, '0');
        // const playTimeSeconds = String(Math.floor((playTime % 60000) / 1000)).padStart(2, '0');
        this.playTimeLabel.string = `${playTimeHours}:${playTimeMinutes}`;
    }

    /**視窗可見性變化 */
    private onVisibilityChange = (): void => {
        if (!document.hidden) {
            this.updateTime();
        }
    };

    /**銷毀 */
    onDestroy() {
        if (this.timeInterval) {
            clearInterval(this.timeInterval);
            this.timeInterval = null;
        }
        document.removeEventListener('visibilitychange', this.onVisibilityChange, false);
        SettingsBetInfo.refreshCredit.off(this.refreshCredit);//移除刷新餘額事件
        SettingsBetInfo.refreshBet.off(this.refreshBet);//移除刷新下注事件
        SettingsBetInfo.refreshWin.off(this.refreshWin);//移除刷新獲得事件
        SettingsBetInfo.changeBetValue.off(this.changeBetValue);//移除改變下注事件
    }
}