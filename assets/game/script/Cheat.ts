import { _decorator, Button, Component, Node, Toggle } from 'cc';
import { GameConst } from 'db://assets/game/script/data/GameConst';
import { UrlParam } from 'db://assets/base/script/data/UrlParam';
import { XEvent } from 'db://assets/base/script/event/XEvent';
const { ccclass, property } = _decorator;

@ccclass('Cheat')
export class Cheat extends Component {

    public static showCheat: XEvent = new XEvent();
    private buyToggle: Toggle = null;
    private catchToggle40: Toggle = null;
    private backBtn: Node = null;
    // private catchToggle100: Toggle = null;

    private cheatUI: Node = null;

    onLoad() {
        this.buyToggle = this.node.getChildByPath('CheatUI/Setting/Buy').getComponent(Toggle);
        this.catchToggle40 = this.node.getChildByPath('CheatUI/Setting/CatchScatter/Catch40').getComponent(Toggle);
        this.backBtn = this.node.getChildByPath('CheatUI/BackBtn');
        this.backBtn.on(Button.EventType.CLICK, this.onBack, this);
        // this.catchToggle100 = this.node.getChildByPath('CheatUI/CatchScatter/Catch100').getComponent(Toggle);
        this.cheatUI = this.node.getChildByPath('CheatUI');
        this.node.active = false;
        Cheat.showCheat.on(this.showCheat, this);
    }

    private showCheat(): void {
        if (UrlParam.token === 'testtoken5800') {
            this.node.active = true;
        }
    }

    private onBack() {
        this.cheatUI.active = false;
    }

    public onCheat() {
        /**如果是測試token，則顯示作弊UI */
        if (UrlParam.token === 'testtoken5800') {
            this.node.active = true;
            this.cheatUI.active = !this.cheatUI.active;
            this.buyToggle.isChecked = GameConst.buyFgCatchScatter;
            this.catchToggle40.isChecked = GameConst.catchScatterRate === 0.4;
            // this.catchToggle100.isChecked = GameConst.catchScatterRate === 1;
            // this.updateToggle();
        }
    }

    public updateToggle() {
        this.scheduleOnce(() => {
            GameConst.buyFgCatchScatter = this.buyToggle.isChecked;
            GameConst.catchScatterRate = this.catchToggle40.isChecked ? 0.4 : 1;
            // console.log('釣SC機率', GameConst.catchScatterRate);
        }, 0);
    }

    update(deltaTime: number) {

    }
}