import { _decorator, Component } from 'cc';
import { XEvent } from 'db://assets/base/script/event/XEvent';
import { Utils } from 'db://assets/base/script/utils/Utils';

const { ccclass, property } = _decorator;
@ccclass('ReelBlackUI')
export class ReelBlackUI extends Component {
    public static show: XEvent = new XEvent();
    public static hide: XEvent = new XEvent();

    onLoad() {
        ReelBlackUI.show.on(this.show, this);
        ReelBlackUI.hide.on(this.hide, this);
        this.node.active = false;
    }

    private show(): void {
        if (this.node.active) return;
        this.node.active = true;
        Utils.fadeIn(this.node, 0.1, 0, 255);
    }

    private hide(): void {
        if (!this.node.active) return;
        Utils.fadeOut(this.node, 0.1, 255, 0, () => {
            this.node.active = false;
        });
    }

    onDestroy() {
        ReelBlackUI.show.off(this);
        ReelBlackUI.hide.off(this);
    }
}