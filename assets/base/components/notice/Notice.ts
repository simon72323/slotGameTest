import { _decorator, Button, Component, Label, Node } from 'cc';
import { XEvent1, XEvent2 } from 'db://assets/base/script/event/XEvent';
import { addBtnClickEvent, Utils } from 'db://assets/base/script/utils/Utils';
import { BaseConst } from 'db://assets/base/script/data/BaseConst';
import { UrlParam } from '../../script/data/UrlParam';

const { ccclass } = _decorator;

/**
 * 畫面提示
 */
@ccclass('Notice')
export class Notice extends Component {
    public static showError: XEvent1<ErrorCode> = new XEvent1();

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
    public async showError(code: ErrorCode) {
        if (this.errorMessage === null) {
            //載入錯誤訊息
            this.errorMessage = await Utils.loadJson('data/ErrorMessage');
        }
        Utils.fadeIn(this.node, 0.2, 0, 255);
        Utils.tweenScaleTo(this.node, 0.2, 0.5, 1);

        //獲取錯誤訊息
        const lang = UrlParam.lang || 'en';
        const errorString = code.toString();
        const messageKey = this.errorMessage[errorString] || this.errorMessage['default'].Message;
        const messageText = this.errorMessage.ErrorMessage[messageKey][lang];
        this.infoErrorLabel.string = messageText.replace('{0}', errorString);
        this.node.active = true;

        // SocketManager.getInstance().disconnect();//斷開Socket連接
        // audioManager().setSoundMute(true);//音效關
        // audioManager().setMusicMute(true);//音樂關
        // TracingManager.getInstance().logError(`發生錯誤 error code:${code}`, { errorCode: code }, { category: code });
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
}

export enum ErrorCode {
    MSG_TOKEN_ERROR = 0,
    MSG_DISCONNECT = 1,
    MSG_HOMEPAGE = 2,
    MSG_ACCOUNT_ERROR = 3,
    MSG_SHORT_BALANCE = 4,
    MSG_ACCOUNT_LOCKED = 5,
    MSG_TRADE_LOCK = 6,
    MSG_VERSION_ERROR = 7,
    LOGIN_TIMEOUT = 8,
}

export enum ErrorType {
    NOTICE = 0, //unlock
    WARNING = 1, //unlock
    ALARM = 2, //lock
    INSUFFICIENT_BALANCE = 3,
    INSUFFICIENT_BALANCE_DO_NOT_LOCK = 4,
}
