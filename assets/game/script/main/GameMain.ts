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
import { Loading } from 'db://assets/base/components/loading/Loading';

import { FeatureBuyBtn } from 'db://assets/game/components/FeatureBuyUI/FeatureBuyBtn';
import { FeatureBuyPage } from 'db://assets/game/components/FeatureBuyUI/FeatureBuyPage';
import { AudioKey } from 'db://assets/game/script/data/AudioKey';
import { GameConst } from 'db://assets/game/script/data/GameConst';
import { MessageHandler } from 'db://assets/game/script/main/MessageHandler';
import { IdleTask } from 'db://assets/game/script/task/IdleTask';
import { CharacterUI } from 'db://assets/game/components/CharacterUI/CharacterUI';
import { Cheat } from 'db://assets/game/script/Cheat';
import { SettingsBetInfo } from 'db://assets/base/components/settingsController/SettingsBetInfo';

const { ccclass, property } = _decorator;

@ccclass('GameMain')
export class GameMain extends Component {
    /**畫面震動(動畫名稱) */
    public static shake: XEvent = new XEvent();
    public static fsOpening: XEvent = new XEvent();

    @property({ tooltip: '是否為假老虎機' })
    private isFake: boolean = false;

    async onLoad() {
        await audioManager().loadBundleAudios();//初始化音效
        // slotAudioKey.reelStop = AudioKey.reelStop;//指定公版輪軸停止音效名稱

        if (this.isFake === false) {
            this.initGame();
        } else {
            //獲取促銷簡介、遊戲內選單狀態、遊戲內選單
            const fakeData1 = { 'name': '', 'account': 'token5800', 'agent_account': 'CS8901', 'credit': 500000000, 'currency': 'IDR', 'free_spin_data': [{ 'free_spin_id': '', 'bet': 0, 'end_date': '', 'rounds_left': 0 }], 'is_anchor': false, 'simulator_data': {} };
            dataManager().setUserData(fakeData1);
            const fakeData2 = { 'game_id': 5800, 'line_bet': [10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10], 'coin_value': [0.01, 0.02, 0.03, 0.04, 0.05, 0.06, 0.07, 0.08, 0.09, 0.1, 0.12, 0.13, 0.14, 0.15, 0.16, 0.17, 0.18, 0.19, 0.2, 0.22, 0.24, 0.26, 0.28, 0.3, 0.32, 0.34], 'bet_available_idx': 0, 'line_total': 30, 'line_available': [30], 'line_bet_default_index': 0, 'coin_value_default_index': 0, 'win': 1, 'big_win': 20, 'super_win': 50, 'mega_win': 100, 'spin_mode': 1, 'buy_spin': { 'allow_buy': 1, 'multiplier': 50, 'limit_total': 6000000 } };
            dataManager().setGameData(fakeData2);
            this.scheduleOnce(() => {
                this.initGame();
            }, 0);
        }


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
     * 遊戲初始化內容
     */
    private initGame() {
        ScreenAdapter.handleResize();
        Cheat.showCheat.emit();//顯示作弊UI
        Loading.remove.emit();//移除載入畫面
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

        KeyboardManager.getInstance().initialize();//初始化鍵盤管理器
        SettingsController.init.emit();//初始化設定控制器
        MessageHandler.init.emit();//初始化消息處理

        //開始遊戲--------------------------------------------------------
        // console.log('開始遊戲');
        taskManager().addTask(new IdleTask());
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