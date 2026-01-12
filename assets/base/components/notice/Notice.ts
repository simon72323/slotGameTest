import { _decorator, Button, Component, Label, Node } from 'cc';
import { XEvent1 } from 'db://assets/base/script/event/XEvent';
import { addBtnClickEvent, Utils } from 'db://assets/base/script/utils/Utils';
import { UrlParam } from 'db://assets/base/script/data/UrlParam';
import { BaseConst } from 'db://assets/base/script/data/BaseConst';

const { ccclass } = _decorator;

/**
 * 畫面提示
 */
@ccclass('Notice')
export class Notice extends Component {
    public static showError: XEvent1<number> = new XEvent1();

    /**錯誤提示 */
    private infoErrorConfirm: Node = null;
    private infoErrorLabel: Label;
    private versionLabel: Label;
    private backMask: Node;
    public errorMessage: any = null;

    async onLoad() {
        this.infoErrorConfirm = this.node.getChildByPath('InfoError/Confirm');
        this.infoErrorLabel = this.node.getChildByPath('InfoError/Label').getComponent(Label);
        this.backMask = this.node.getChildByName('BackMask');
        this.versionLabel = this.node.getChildByPath('InfoError/Version').getComponent(Label);
        this.versionLabel.string = BaseConst.Version;
        Notice.showError.on(this.showError, this);

        addBtnClickEvent(this.infoErrorConfirm, 'Notice', this.infoErrorConfirm.getComponent(Button), 'onCloseNotice');
        addBtnClickEvent(this.backMask, 'Notice', this.backMask.getComponent(Button), 'onCloseNotice');

        this.node.active = false;
    }

    /**
     * 顯示錯誤提示
     * @param errorCode {number} 錯誤代碼
     */
    public async showError(errorCode: number) {
        await this.loadErrorMessage();
        Utils.fadeIn(this.node, 0.2, 0, 255);
        Utils.tweenScaleTo(this.node, 0.2, 0.5, 1);

        //獲取錯誤訊息
        const lang = UrlParam.lang || 'en';
        const messageKey = this.errorMessage[String(errorCode)] || this.errorMessage['default'].Message;
        const messageText = this.errorMessage.ErrorMessage[messageKey][lang];
        this.infoErrorLabel.string = messageText.replace('{0}', String(errorCode));
        this.node.active = true;
    }

    /**
     * 關閉提示
     */
    private onCloseNotice() {
        Utils.fadeOut(this.node, 0.2, 255, 0, () => {
            this.node.active = false;
        });
        Utils.tweenScaleTo(this.node, 0.2, 1, 0.5);
    }

    /**
     * 載入錯誤訊息
     */
    private async loadErrorMessage() {
        if (this.errorMessage !== null) return;
        this.errorMessage = await Utils.loadJson('data/ErrorMessage');
    }
}