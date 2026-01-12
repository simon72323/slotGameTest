import { _decorator, Component, Label, Tween, tween, Vec3 } from 'cc';
import { BaseConst } from 'db://assets/base/script/data/BaseConst';
import { dataManager } from 'db://assets/base/script/data/DataManager';
import { XEvent, XEvent1 } from 'db://assets/base/script/event/XEvent';
import { RunNumber } from 'db://assets/base/script/types/BaseType';
import { Utils } from 'db://assets/base/script/utils/Utils';

const { ccclass } = _decorator;
@ccclass('WinScoreUI')
export class WinScoreUI extends Component {
    public static showWin: XEvent1<number> = new XEvent1();
    public static hideWin: XEvent = new XEvent();
    private winLabel: Label = null;
    private currencyLabel: Label = null;
    private runNum: RunNumber = {
        curValue: 0,
        finalValue: 0
    };

    onLoad(): void {
        this.currencyLabel = this.node.getChildByName('currency').getComponent(Label);
        this.winLabel = this.node.getChildByName('WinNum').getComponent(Label);
        WinScoreUI.showWin.on(this.showWin, this);
        WinScoreUI.hideWin.on(this.hideWin, this);
        this.node.active = false;
    }

    /**
     * 顯示贏得分數
     * @param value 贏得分數
     */
    private showWin(value: number): void {
        this.currencyLabel.string = Utils.getCurrencySymbol();
        const time = BaseConst.SLOT_TIME[dataManager().curTurboMode].showWinTime;
        this.node.active = true;
        Utils.fadeIn(this.node, 0.1, 0, 255);
        this.node.scale = new Vec3(0.5, 0.5, 1);
        tween(this.node)
            .to(time * 0.1, { scale: new Vec3(1.2, 1.2, 1) })
            .to(time * 0.1, { scale: new Vec3(1, 1, 1) })
            .delay(time * 0.6)
            .call(() => {
                Utils.fadeOut(this.node, 0.2, 255, 0, () => {
                    this.node.active = false;
                });
            })
            .start();
        //跑分動畫
        this.runNum.curValue = 0;//初始化跑分數據
        this.runNum.finalValue = value;
        Utils.runNumber(0.5, this.winLabel, this.runNum);
    }

    /**
     * 隱藏贏得分數
     */
    private hideWin(): void {
        Tween.stopAllByTarget(this.node);
        this.node.active = false;
    }

    onDestroy() {
        WinScoreUI.showWin.off(this);
        WinScoreUI.hideWin.off(this);
    }
}