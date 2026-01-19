//ts
import { _decorator, Component, macro, Node, profiler, SpriteFrame, Vec2 } from 'cc';
import { KeyboardManager } from '../manager/KeyboardManager';
import { BundleLoader } from '../utils/BundleLoader';
import { UrlParam } from '../data/UrlParam';
import { BaseConst } from '../data/BaseConst';
import { taskManager, TaskManager } from '../tasks/TaskManager';
import { BaseEvent } from '../event/BaseEvent';
import { dataManager } from '../data/DataManager';
import { ScreenAdapter } from '../utils/ScreenAdapter';
const { ccclass, property } = _decorator;
/**
 * 共用遊戲主程式
 */
@ccclass('BaseGame')
export class BaseGame extends Component {
    @property({ type: Node })
    public gameTopList: Node[] = [];

    // @property({ type: Vec2, tooltip: 'Blitz按鈕位置' })
    // public blitzBtnPos: Vec2 = new Vec2(305, -300);

    // @property({ type: Vec2, tooltip: '活動按鈕位置' })
    // public fsbBtnPos: Vec2 = new Vec2(-260, -340);

    //   private languageLader: BundleLoader;

    /**
     *
     */
    async onLoad(): Promise<void> {
        //註冊封包
        // {
        //   SocketManager.getInstance().registerSendMessage(new LoginCall());
        //   SocketManager.getInstance().registerReceiveMessage(new LoginRecall());

        //   SocketManager.getInstance().registerSendMessage(new ConfigCall());
        //   SocketManager.getInstance().registerReceiveMessage(new ConfigRecall());

        //   SocketManager.getInstance().registerSendMessage(new StripsCall());
        //   SocketManager.getInstance().registerReceiveMessage(new StripsRecall());

        //   SocketManager.getInstance().registerSendMessage(new ResultCall());
        //   SocketManager.getInstance().registerReceiveMessage(new ResultRecall());

        //   SocketManager.getInstance().registerSendMessage(new StateCall());
        //   SocketManager.getInstance().registerReceiveMessage(new StateRecall());

        //   SocketManager.getInstance().registerSendMessage(new CampaignCall());
        //   SocketManager.getInstance().registerReceiveMessage(new CampaignRecall());

        //   SocketManager.getInstance().registerSendMessage(new BalanceCall());
        //   SocketManager.getInstance().registerReceiveMessage(new BalanceRecall());

        //   SocketManager.getInstance().registerSendMessage(new OptionCall());
        //   SocketManager.getInstance().registerReceiveMessage(new OptionRecall());

        //   SocketManager.getInstance().registerSendMessage(new HeartbeatCall());
        //   SocketManager.getInstance().registerReceiveMessage(new HeartbeatRecall());

        //非DEMO模式才註冊活動封包
        //   if (BaseDataManager.getInstance().isDemoMode() === false) {
        //     SocketManager.getInstance().registerReceiveMessage(new CampaignEventRecall());
        //     SocketManager.getInstance().registerReceiveMessage(new CampaignInfoNotify());
        //     SocketManager.getInstance().registerReceiveMessage(new CampaignWinRecall());
        //   }
        // }


        KeyboardManager.getInstance().initialize();//初始化鍵盤管理器
        // ScreenAdapter.handleResize();//適配畫面

        //需要注意各UI onLoad時機
        // UIManager.getInstance().initialize();

        //載入遊戲語系圖
        const languageLoader = new BundleLoader();
        languageLoader.add(BaseConst.bundle.baseLanguage, `${UrlParam.lang}/${BaseConst.dir.ui}`, SpriteFrame);
        // languageLoader.add(BaseConst.bundle.currency, '', SpriteFrame);

        this.childOnLoad();

        //Socket
        // SocketEvent.open.on(this.onOpen, this);
        // SocketEvent.close.on(this.onClose, this);
        // await SocketManager.getInstance().connect(BaseDataManager.getInstance().getSocketUrl());

        //載入遊戲語系圖
        await languageLoader.load();

        //遊戲資源讀取完成，通知LoadingPage可以關閉
        BaseEvent.initResourceComplete.emit();

        //遊戲後載資源必須放在languageLader之後, 避免下載順序導致太晚進入遊戲
        this.childPostponeLoad();
    }

    start() {
        //cheat
        // CheatUI.registerButton.emit('共用', '按鈕', 'FPS', () => {
        //   profiler.isShowingStats() ? profiler.hideStats() : profiler.showStats();
        // });
        // CheatUI.registerButton.emit('共用', '按鈕', '斷線', () => {
        //   SocketManager.getInstance().disconnect();
        // });
        // CheatUI.registerButton.emit('共用', '按鈕', '極速', () => {
        //   BaseDataManager.getInstance().getTurboMode = () => {
        //     return TurboMode.Turbo;
        //   };
        // });
        // CheatUI.registerButton.emit('共用', '按鈕', '心跳', () => {
        //   HeartbeatRecall.printLog = !HeartbeatRecall.printLog;
        // });

        this.childOnStart();
    }

    // component ===========================================================================
    // component ===========================================================================
    // component ===========================================================================

    update(deltaTime: number) {
        taskManager().update(deltaTime);
    }

    // socket ===========================================================================
    // socket ===========================================================================
    // socket ===========================================================================

    /**
     * 開啟連線
     */
    //   private onOpen(): void {
    //     //連線完成自動登入
    //     SocketManager.getInstance().sendMessage(s5g.game.proto.EMSGID.eLoginCall);

    //     //連線完成後每秒發送心跳
    //     XUtils.schedule(
    //       () => {
    //         SocketManager.getInstance().sendMessage(s5g.game.proto.EMSGID.eHeartbeatCall);
    //       },
    //       this,
    //       1,
    //       macro.REPEAT_FOREVER,
    //       1,
    //     );
    //   }

    /**
     * 斷線
     */
    //   private onClose(): void {
    //     ErrorManager.getInstance().showError(ErrorCode.NetDisconnect);
    //   }


    // override ===========================================================================
    // override ===========================================================================
    // override ===========================================================================
    /**
     * 遊戲初始設定
     */
    protected childOnLoad(): void {
        //override
    }
    protected childOnStart(): void {
        //override
    }

    /**
     * 遊戲後載資源
     */
    protected childPostponeLoad(): void {
        //override
    }
}
