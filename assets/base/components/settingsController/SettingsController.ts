import { _decorator, Animation, Button, Component, KeyCode, Label, Node, screen, tween, Vec3 } from 'cc';
import { dataManager } from 'db://assets/base/script/data/DataManager';
import { BaseEvent } from 'db://assets/base/script/event/BaseEvent';
import { XEvent, XEvent1 } from 'db://assets/base/script/event/XEvent';
import { audioManager } from 'db://assets/base/script/manager/AudioManager';
import { AudioMode, ModuleID, TurboMode } from 'db://assets/base/script/types/BaseType';
import { addBtnClickEvent, Utils } from 'db://assets/base/script/utils/Utils';
import { AudioKey } from 'db://assets/game/script/data/AudioKey';

const { ccclass, property } = _decorator;

@ccclass('SettingsController')

export class SettingsController extends Component {
    public static init: XEvent = new XEvent();
    public static setEnabled: XEvent1<boolean> = new XEvent1();
    /**更新自動Spin次數 */
    public static updateAutoSpinCount: XEvent = new XEvent();
    /**更新免費Spin次數 */
    public static updateFreeSpinCount: XEvent1<number> = new XEvent1();
    /**處理點擊Spin按鈕 */
    public static clickSpin: XEvent1<boolean> = new XEvent1();
    /**執行自動遊戲 */
    public static runAutoSpin: XEvent = new XEvent();

    @property({ type: Node, tooltip: 'SPIN節點' })
    private spinNode: Node = null;
    @property({ type: Node, tooltip: '自動按鈕' })
    private autoBtn: Node = null;
    @property({ type: Node, tooltip: '加速按鈕' })
    private turboBtn: Node = null;
    @property({ type: Node, tooltip: '選項按鈕' })
    private optionBtn: Node = null;
    @property({ type: Node, tooltip: '全螢幕按鈕' })
    private screenBtn: Node = null;
    @property({ type: Node, tooltip: '聲音按鈕' })
    private audioBtn: Node = null;
    @property({ type: Node, tooltip: '下注紀錄按鈕' })
    private recordBtn: Node = null;
    @property({ type: Node, tooltip: '收藏按鈕' })
    private favoritesBtn: Node = null;
    @property({ type: Node, tooltip: '資訊說明按鈕' })
    private informationBtn: Node = null;
    @property({ type: Node, tooltip: '返回按鈕' })
    private backBtn: Node = null;
    @property({ type: Node, tooltip: '增加下注按鈕' })
    private addBetBtn: Node = null;
    @property({ type: Node, tooltip: '減少下注按鈕' })
    private minusBetBtn: Node = null;
    @property({ type: Node, tooltip: '直式全螢幕節點' })
    private porScreenPosNode: Node = null;
    @property({ type: Node, tooltip: '橫式全螢幕節點' })
    private landScreenPosNode: Node = null;

    private porControllerBtns: Node = null;//直式控制器
    private porOptionMenu: Node = null;//直式選單
    // private landControllerBtns: Node = null;//橫式控制器
    private landOptionMenu: Node = null;//橫式選單

    private isOpenOption: boolean = false;//是否開啟選單
    private isFullScreen: boolean = false;//是否全螢幕
    private audioMode: number = AudioMode.AudioOn;//音效模式
    // private turboMode: TurboMode = TurboMode.Normal;//加速模式

    private spinBtn: Node = null;//Spin主要按鈕
    private stopSpinBtn: Node = null;//Spin停止按鈕
    private freeSpin: Node = null;//Spin免費節點
    private stopAutoSpinBtn: Node = null;//自動停止按鈕
    private optionBackBtn: Node = null;//選單返回按鈕

    /**
     * 遊戲初始化設定
     */
    protected onLoad() {
        this.setNode();//設定節點
        this.setupBtnEvent();//設定按鈕Click事件
        this.setEventListen();//設定事件監聽
    }

    /**
     * 設定節點
     */
    private setNode() {
        this.porControllerBtns = this.node.getChildByName('Por_ControllerBtns');
        this.porOptionMenu = this.node.getChildByName('Por_OptionMenu');
        this.landOptionMenu = this.node.getChildByName('Land_OptionMenu');
        this.optionBackBtn = this.node.getChildByName('OptionBackBtn');

        this.spinBtn = this.spinNode.getChildByName('SpinBtn');
        this.stopSpinBtn = this.spinNode.getChildByName('StopSpinBtn');
        this.freeSpin = this.spinNode.getChildByName('FreeSpin');
        this.stopAutoSpinBtn = this.spinNode.getChildByName('StopAutoSpinBtn');
    }

    /**
     * 設定按鈕Click事件
     */
    private setupBtnEvent() {
        const scriptName = 'SettingsController';
        addBtnClickEvent(this.node, scriptName, this.spinBtn.getComponent(Button), 'onClickSpin');
        addBtnClickEvent(this.node, scriptName, this.stopSpinBtn.getComponent(Button), 'onClickStopSpin');
        addBtnClickEvent(this.node, scriptName, this.autoBtn.getComponent(Button), 'onClickAuto');
        addBtnClickEvent(this.node, scriptName, this.turboBtn.getComponent(Button), 'onClickTurbo');
        addBtnClickEvent(this.node, scriptName, this.optionBtn.getComponent(Button), 'onClickOption');
        addBtnClickEvent(this.node, scriptName, this.screenBtn.getComponent(Button), 'onClickScreen');
        addBtnClickEvent(this.node, scriptName, this.audioBtn.getComponent(Button), 'onClickAudio');
        addBtnClickEvent(this.node, scriptName, this.recordBtn.getComponent(Button), 'onClickRecord');
        addBtnClickEvent(this.node, scriptName, this.favoritesBtn.getComponent(Button), 'onClickFavorites');
        addBtnClickEvent(this.node, scriptName, this.informationBtn.getComponent(Button), 'onClickInformation');
        addBtnClickEvent(this.node, scriptName, this.optionBackBtn.getComponent(Button), 'onClickOption');

        addBtnClickEvent(this.node, scriptName, this.backBtn.getComponent(Button), 'onClickOption');
        addBtnClickEvent(this.node, scriptName, this.stopAutoSpinBtn.getComponent(Button), 'onStopAutoSpin');
        addBtnClickEvent(this.node, scriptName, this.addBetBtn.getComponent(Button), 'changeBet', '1');
        addBtnClickEvent(this.node, scriptName, this.minusBetBtn.getComponent(Button), 'changeBet', '-1');
    }

    /**
     * 設定事件監聽
     */
    private setEventListen() {
        BaseEvent.resetSpin.on(this.onResetSpin, this);
        BaseEvent.changeScene.on(this.sceneChange, this);
        BaseEvent.setTurboBtnState.on(this.setTurboBtnState, this);//設定快速模式按鈕狀態
        BaseEvent.runAutoSpin.on(this.runAutoSpin, this);//執行自動遊戲
        BaseEvent.stopAutoSpin.on(this.onStopAutoSpin, this);//停止自動遊戲

        SettingsController.init.on(this.initialize, this);
        SettingsController.setEnabled.on(this.setBtnInteractable, this);//監聽設定是否可用事件
        SettingsController.updateAutoSpinCount.on(this.updateAutoSpinCount, this);
        SettingsController.updateFreeSpinCount.on(this.updateFreeSpinCount, this);
        SettingsController.clickSpin.on(this.handleClickSpin, this);//點擊Spin按鈕
    }

    /**
     * 清除事件監聽
     */
    protected onDestroy() {
        BaseEvent.resetSpin.off(this);
        SettingsController.setEnabled.off(this);
        SettingsController.updateAutoSpinCount.off(this);
        SettingsController.updateFreeSpinCount.off(this);
    }

    /**
     * 檢測是否為iOS系統
     */
    private isIOS(): boolean {
        const ua = navigator.userAgent;
        return /iP(hone|od|ad)/.test(ua);
    }

    /**
     * 開始遊戲初始化
     */
    public initialize() {
        BaseEvent.keyDown.on((keyCode: KeyCode) => {
            if (keyCode == KeyCode.SPACE || keyCode == KeyCode.ENTER) {
                this.handleClickSpin();
            }
        }, this);
        // 只在iOS系統時隱藏全螢幕按鈕
        const isIOSDevice = this.isIOS();
        this.porScreenPosNode.active = !isIOSDevice;
        this.landScreenPosNode.active = !isIOSDevice;
    }

    /**
     * 啟用/禁用所有控制類按鈕
     * @param enabled {boolean} 啟用/禁用
     */
    private setBtnInteractable(enabled: boolean) {
        this.spinBtn.getComponent(Button).interactable = enabled;
        this.autoBtn.getComponent(Button).interactable = enabled;
        this.turboBtn.getComponent(Button).interactable = enabled;
        this.optionBtn.getComponent(Button).interactable = enabled;
        this.informationBtn.getComponent(Button).interactable = enabled;

        dataManager().lockKeyboard = !enabled;//鎖定/解除鍵盤功能

        //true時要判斷更新+-按鈕是否可用，false時直接禁用
        if (enabled) {
            this.addBetBtn.getComponent(Button).interactable = true;
            this.minusBetBtn.getComponent(Button).interactable = true;
        } else {
            this.addBetBtn.getComponent(Button).interactable = false;
            this.minusBetBtn.getComponent(Button).interactable = false;
        }
    }

    private sceneChange(moduleID: ModuleID) {
        if (moduleID === ModuleID.MG) {
            if (dataManager().isAutoMode) {
                //自動轉模式，則顯示停止按鈕
                this.spinBtn.active = false;
                this.stopSpinBtn.active = true;
                this.stopAutoSpinBtn.active = true;
                this.freeSpin.active = false;
            } else {
                this.onResetSpin();
            }
        } else {
            this.spinBtn.active = false;
            this.stopSpinBtn.active = false;
            this.stopAutoSpinBtn.active = false;
            this.freeSpin.active = true;
        }
    }

    //===============================spinNode相關操作=================================
    /**
     * 按下Spin按鈕事件(按鈕會有event事件，所以需要分開處理，不然handleClickSpin會傳入true)
     */
    private async onClickSpin() {
        this.handleClickSpin();
    }

    /**
     * 處理點擊Spin按鈕
     * @param isBuyFg 是否購買免費遊戲
     */
    private handleClickSpin(isBuyFg: boolean = false) {
        this.clickAnim(this.spinBtn);
        this.rotateAnim(this.spinBtn);
        this.setBtnInteractable(false);//禁用控制器按鈕
        //切換成停止按鈕
        Utils.fadeOut(this.spinBtn, 0.1, 255, 0, () => {
            this.spinBtn.active = false;
            this.stopSpinBtn.active = true;
            this.stopSpinBtn.getComponent(Button).interactable = true;
            this.stopSpinBtn.getComponent(Animation).play('stopSpinShow');
        });

        BaseEvent.clickSpin.emit(isBuyFg);
    }

    /**
     * 按下按鈕動畫
     */
    private clickAnim(node: Node) {
        tween(node).to(0.1, { scale: new Vec3(0.7, 0.7, 0.7) }).to(0.15, { scale: new Vec3(1, 1, 1) }, { easing: 'backOut' }).start();
    }

    /**
     * 旋轉按鈕動畫
     * @param node 節點
     */
    private rotateAnim(node: Node) {
        tween(node).by(0.2, { angle: -180 }, { easing: 'linear' })
            .call(() => {
                node.angle = 0;
            })
            .start();
    }

    /**
     * 執行回歸重置Spin按鈕
     */
    private onResetSpin() {
        if (this.spinBtn.active) return;
        Utils.fadeOut(this.stopSpinBtn, 0.1, 255, 0, () => {
            this.stopSpinBtn.active = false;
            this.freeSpin.active = false;
            this.stopAutoSpinBtn.active = false;
            this.spinBtn.active = true;
            this.spinBtn.getComponent(Animation).play('spinBtnShow');
            this.setBtnInteractable(true);//啟用控制器按鈕
        });
    }

    /**
     * 按下停止spin按鈕事件
     */
    private onClickStopSpin() {
        this.clickAnim(this.stopSpinBtn);
        this.stopSpinBtn.getComponent(Button).interactable = false;
        BaseEvent.clickStop.emit();
        // SlotMachine.slotSkip.
    }

    /**
     * 停止自動Spin
     */
    private onStopAutoSpin() {
        this.stopAutoSpinBtn.active = false;
        dataManager().isAutoMode = false;
        dataManager().autoSpinCount = 0;
        this.stopSpinBtn.getComponent(Button).interactable = false;
    }

    /**
     * 執行自動遊戲
     */
    private runAutoSpin() {
        if (dataManager().autoSpinCount === 0) {
            this.onStopAutoSpin();
            return;
        }
        this.stopAutoSpinBtn.active = true;
        if (dataManager().autoSpinCount > 0) {
            dataManager().autoSpinCount--;//自動遊戲次數減1
        }
        this.updateAutoSpinCount();
        this.handleClickSpin();
    }

    /**
     * 更新自動Spin次數
     */
    private updateAutoSpinCount() {
        const stopAutoLabel = this.stopAutoSpinBtn.getChildByName('Label').getComponent(Label);
        //數字跳動
        this.tweenScale(stopAutoLabel.node);
        if (dataManager().autoSpinCount < 0)
            stopAutoLabel.string = '∞';
        else
            stopAutoLabel.string = dataManager().autoSpinCount.toString();
    }

    /**
     * 更新自動Spin次數
     */
    private updateFreeSpinCount(times: number) {
        const freeSpinLabel = this.freeSpin.getChildByName('Label').getComponent(Label);
        //數字跳動
        this.tweenScale(freeSpinLabel.node);
        freeSpinLabel.string = times.toString();
    }

    /**
     * 數字跳動動畫
     * @param node 節點
     */
    private tweenScale(node: Node) {
        tween(node).to(0.1, { scale: new Vec3(1.5, 1.5, 1) }).to(0.2, { scale: new Vec3(1, 1, 1) }).start();
    }

    //===============================spinNode相關操作=================================

    /**
     * 點擊自動下注按鈕
     */
    private onClickAuto() {
        audioManager().playSound(AudioKey.btnClick);
        // console.log('onClickAuto');
        BaseEvent.showAutoSpin.emit();
    }

    /**
     * 切換加速模式
     */
    private onClickTurbo() {
        audioManager().playSound(AudioKey.btnClick);
        let tempTurboMode = dataManager().curTurboMode;
        tempTurboMode = (tempTurboMode + 1) % 3;
        dataManager().curTurboMode = tempTurboMode;
        this.setTurboBtnState(tempTurboMode);
    }

    /**
     * 設定快速模式按鈕狀態
     * @param turboMode 快速模式
     */
    private setTurboBtnState(turboMode: TurboMode) {
        const normalNode = this.turboBtn.getChildByName('Normal');
        const speedNode = this.turboBtn.getChildByName('Speed');
        const turboNode = this.turboBtn.getChildByName('Turbo');
        normalNode.active = turboMode === TurboMode.Normal;
        speedNode.active = turboMode === TurboMode.Fast;
        turboNode.active = turboMode === TurboMode.Turbo;
    }

    /**
     * 開啟/關閉選單
     */
    private onClickOption() {
        audioManager().playSound(AudioKey.btnClick);
        this.isOpenOption = !this.isOpenOption;
        dataManager().lockKeyboard = this.isOpenOption;//鎖定/解除鍵盤功能
        this.optionBackBtn.active = this.isOpenOption;//關閉返回按鈕
        if (this.isOpenOption) {
            this.porControllerBtns.getComponent(Animation).play('optionMenuHide');
            this.porOptionMenu.getComponent(Animation).play('optionMenuShow');
            this.landOptionMenu.getComponent(Animation).play('optionMenuShow');
            Utils.fadeIn(this.landOptionMenu, 0.2, 0, 255);
            Utils.fadeIn(this.porOptionMenu, 0.2, 0, 255);
            Utils.fadeOut(this.porControllerBtns, 0.2, 255, 0);
        } else {
            this.porControllerBtns.getComponent(Animation).play('optionMenuShow');
            this.porOptionMenu.getComponent(Animation).play('optionMenuHide');
            this.landOptionMenu.getComponent(Animation).play('optionMenuHide');
            Utils.fadeIn(this.porControllerBtns, 0.2, 0, 255);
            Utils.fadeOut(this.landOptionMenu, 0.2, 255, 0);
            Utils.fadeOut(this.porOptionMenu, 0.2, 255, 0);
        }
    }

    /**
     * 切換全螢幕
     */
    private onClickScreen() {
        audioManager().playSound(AudioKey.btnClick);
        this.isFullScreen = !this.isFullScreen;
        const fullScreenOn = this.screenBtn.getChildByName('FullScreenOn');
        const fullScreenOff = this.screenBtn.getChildByName('FullScreenOff');

        fullScreenOn.active = !this.isFullScreen;
        fullScreenOff.active = this.isFullScreen;

        if (this.isFullScreen) {
            screen.requestFullScreen();//請求全螢幕
        } else {
            screen.exitFullScreen();//退出全螢幕
        }
    }

    /**
     * 切換音效狀態
     */
    private onClickAudio() {
        audioManager().playSound(AudioKey.btnClick);
        this.audioMode = (this.audioMode + 1) % 3;
        const audioOnNode = this.audioBtn.getChildByName('AudioOn');
        const musicOffNode = this.audioBtn.getChildByName('MusicOff');
        const audioOffNode = this.audioBtn.getChildByName('AudioOff');

        // 先隱藏所有狀態圖示
        audioOnNode.active = this.audioMode === AudioMode.AudioOn;
        musicOffNode.active = this.audioMode === AudioMode.MusicOff;
        audioOffNode.active = this.audioMode === AudioMode.AudioOff;

        // 根據當前狀態顯示對應圖示
        switch (this.audioMode) {
            case AudioMode.AudioOn:
                audioManager().setSoundMute(false);//音效開
                audioManager().setMusicMute(false);//音樂開
                break;
            case AudioMode.MusicOff:
                audioManager().setMusicMute(true);//音樂關
                audioManager().setSoundMute(false);//音效開
                break;
            case AudioMode.AudioOff:
                audioManager().setSoundMute(true);//音效關
                audioManager().setMusicMute(true);//音樂關
                break;
        }
    }

    /**
     * 開啟下注紀錄
     */
    private onClickRecord() {
        audioManager().playSound(AudioKey.btnClick);
        const betrecordurl = dataManager().getFullBetrecordurl();
        window.open(betrecordurl, '_blank');
    }

    /**
     * 開啟遊戲說明
     */
    private onClickInformation() {
        audioManager().playSound(AudioKey.btnClick);
        BaseEvent.showGameInformation.emit();
    }
}
