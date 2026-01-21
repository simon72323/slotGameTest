import { _decorator, Component, Node, UIOpacity } from 'cc';
import { SettingsController } from 'db://assets/base/components/settingsController/SettingsController';
import { SlotMachine } from 'db://assets/base/components/slotMachine/SlotMachine';
import { dataManager } from 'db://assets/base/script/data/DataManager';
import { BaseEvent } from 'db://assets/base/script/event/BaseEvent';
import { XEvent } from 'db://assets/base/script/event/XEvent';
import { audioManager } from 'db://assets/base/script/manager/AudioManager';
import { KeyboardManager } from 'db://assets/base/script/manager/KeyboardManager';
import { taskManager } from 'db://assets/base/script/tasks/TaskManager';
import { ScreenAdapter } from 'db://assets/base/script/utils/ScreenAdapter';
import { BetData } from 'db://assets/base/script/data/BetData';
import { Loading } from 'db://assets/base/script/main/Loading';

import { FeatureBuyBtn } from 'db://assets/game/components/FeatureBuyUI/FeatureBuyBtn';
import { FeatureBuyPage } from 'db://assets/game/components/FeatureBuyUI/FeatureBuyPage';
import { AudioKey } from 'db://assets/game/script/data/AudioKey';
import { GameConst } from 'db://assets/game/script/data/GameConst';
import { MessageHandler } from 'db://assets/game/script/main/MessageHandler';
import { IdleTask } from 'db://assets/game/script/task/IdleTask';
import { CharacterUI } from 'db://assets/game/components/CharacterUI/CharacterUI';
import { Cheat } from 'db://assets/game/script/Cheat';
import { SettingsBetInfo } from 'db://assets/base/components/settingsController/SettingsBetInfo';
import { BaseGame } from 'db://assets/base/script/main/BaseGame';
import { BaseConst } from 'db://assets/base/script/data/BaseConst';

const { ccclass, property } = _decorator;

@ccclass('Game')
export class Game extends BaseGame {
    /**畫面震動(動畫名稱) */
    public static shake: XEvent = new XEvent();
    public static fsOpening: XEvent = new XEvent();

    @property({ tooltip: '是否為假老虎機' })
    private isFake: boolean = false;

    /**
   * 子類別資料載入實作
   */
    childOnLoad() {
        /**設定全畫面節點 */
        this.node.getChildByName('gameTop').children.forEach((child) => {
            this.gameTopList.push(child);
        });
        this.onListenEvent();//監聽事件
    }

    /**監聽事件 */
    private onListenEvent() {
        BaseEvent.initMessageComplete.once(this.netReady, this);
        FeatureBuyBtn.click.on(this.clickFeatureBuyBtn, this);//監聽點擊免費遊戲事件
        SlotMachine.startMi.on((column: number) => {
            audioManager().playSound(AudioKey.teasing);
            audioManager().editMusicVolume(0.1);
            CharacterUI.win.emit();
        }, this);

        SlotMachine.stopMi.on(() => {
            audioManager().stopSound(AudioKey.teasing);
            audioManager().editMusicVolume(1);
        }, this);
    }

    /**
     * 網路準備完成
     */
    private netReady() {
        //設定遊戲資料
        // dataManager().setGameData(new GameData());
        Cheat.showCheat.emit();//顯示作弊UI
        // Loading.remove.emit();//移除載入畫面
        //初始化盤面
        SlotMachine.initResultParser.emit(GameConst.MG_INIT_RESULT);

        //更新玩家資料
        // console.log('更新玩家資料', dataManager().userCredit, BetData.getBetTotal());
        SettingsBetInfo.refreshCredit.emit(dataManager().userCredit);
        SettingsBetInfo.refreshBet.emit(BetData.getBetTotal());
        SettingsBetInfo.refreshWin.emit(0, 0);//刷新贏分=0

        //設置購買功能是否可見、啟用
        const buyFeatureVisible = dataManager().getGameData().buy_spin.allow_buy === 1;
        BaseEvent.buyFeatureVisible.emit(buyFeatureVisible);//設置購買功能是否可見
        const buyFeatureEnabled = dataManager().getBuyFeatureEnabled();
        BaseEvent.buyFeatureEnabled.emit(buyFeatureEnabled);//設置購買功能是否啟用

        SettingsController.init.emit();//初始化設定控制器
        MessageHandler.init.emit();//初始化消息處理


        BaseEvent.initGameComplete.emit();//初始化遊戲完成(通知Loading頁關閉)
        //開始遊戲--------------------------------------------------------
        // console.log('開始遊戲');
        taskManager().addTask(new IdleTask());
    }

    /**
    * 後載資源
    */
    protected async childPostponeLoad(): Promise<void> {
        //加載音效資源
        await audioManager().loadBundleAudios();
        audioManager().playMusic(AudioKey.bgmMg);//播放背景音樂
    }

    /**點擊免費遊戲 */
    private clickFeatureBuyBtn(): void {
        FeatureBuyPage.show.emit();
    }

    /**持續更新任務 */
    update(deltaTime: number) {
        taskManager().update(deltaTime);
    }
}