import { _decorator, Button, Component, Label, Node, Vec3 } from 'cc';

import { dataManager } from 'db://assets/base/script/data/DataManager';
import { BaseEvent } from 'db://assets/base/script/event/BaseEvent';
import { XEvent } from 'db://assets/base/script/event/XEvent';
import { Utils } from 'db://assets/base/script/utils/Utils';
import { audioManager } from 'db://assets/base/script/manager/AudioManager';

import { SlotData } from 'db://assets/game/script/data/SlotData';
import { GameConst } from 'db://assets/game/script/data/GameConst';
import { AudioKey } from 'db://assets/game/script/data/AudioKey';

const { ccclass, property } = _decorator;

@ccclass('GameInformationUI')
export class GameInformationUI extends Component {
    public static show: XEvent = new XEvent();

    private backMask: Node = null;
    private closeBtn: Node = null;
    private content: Node = null;

    @property([Node])
    private symbolOdds: Node[] = [];

    @property(Label)
    private verLabel: Label = null;

    onLoad() {
        BaseEvent.showGameInformation.on(this.show, this);
        this.setupNode();
        this.node.active = false;
        this.verLabel.string = GameConst.Version;
    }

    /**
     * 設定節點
     */
    private setupNode() {
        this.backMask = this.node.getChildByName('BackMask');
        this.closeBtn = this.node.getChildByPath('ScrollView/CloseBtn');
        this.content = this.node.getChildByPath('ScrollView/view/content');
    }

    /**
     * 顯示
     */
    private show() {
        this.updateSymbolOdds();//更新符號賠率
        dataManager().lockKeyboard = true;//鎖定鍵盤功能
        Utils.fadeIn(this.node, 0.15, 0, 255);
        Utils.tweenScaleTo(this.node, 0.15, 0.8, 1);
        this.content.setPosition(new Vec3(0, 0, 0));
        this.node.active = true;
        this.backMask.once(Button.EventType.CLICK, this.hide, this);
        this.closeBtn.once(Button.EventType.CLICK, this.hide, this);
    }

    /**
     * 更新符號賠率
     */
    private updateSymbolOdds() {
        for (let i = 0; i < this.symbolOdds.length; i++) {
            const symbolID = parseInt(this.symbolOdds[i].name.split('_')[1]);
            let payData = SlotData.getPayBySymbolID(symbolID);
            let lineString = '';
            let scoreString = '';
            payData.forEach((data: { count: number, cent: string }, index: number) => {
                // string += data.count + ' ' + data.cent;
                scoreString += data.cent;
                lineString += data.count;
                if (index < payData.length - 1) {
                    scoreString += '\n';
                    lineString += '\n';
                }
            });
            this.symbolOdds[i].getChildByPath('Line').getComponent(Label).string = lineString;
            this.symbolOdds[i].getChildByPath('Score').getComponent(Label).string = scoreString;
        }
    }

    /**
     * 隱藏
     */
    private hide() {
        audioManager().playSound(AudioKey.btnClick);
        dataManager().lockKeyboard = false;//解除鎖定鍵盤功能
        Utils.tweenScaleTo(this.node, 0.1, 1, 0.9);
        Utils.fadeOut(this.node, 0.1, 255, 0, () => {
            this.node.active = false;
        });
        this.backMask.off(Button.EventType.CLICK, this.hide, this);
        this.closeBtn.off(Button.EventType.CLICK, this.hide, this);
    }

    onDestroy() {
        BaseEvent.showGameInformation.off(this);
    }
}