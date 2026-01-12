import { TurboMode } from 'db://assets/base/script/types/BaseType';

/**
 * 公版全域常量
 */
export class BaseConst {
    /**逾時時間 */
    public static TIMEOUT_TIME = {
        loading: 120,  // 讀取畫面逾時設定(2分鐘)
        idleMute: 5,  // 待機5秒後靜音
        featureWaitStart: 10,  // FreeGame 倒數10秒後自動進入
        resultRecall: 30  // spin30秒內需回應
    };

    /**遊戲時間 */
    public static GAME_TIME = {
        bigWinLevelTime: 5,  // BIGWIN表演時間
        totalWinScrollTime: 1,  // TOTALWIN表演時間
        winEndDelay: 2  // BigWin/totalWin播放完畢後等待時間
    };

    /**遊戲轉動時間 */
    public static SLOT_TIME = {
        [TurboMode.Normal]: {
            spinIntervalTime: 0.04,  // 轉動/停止間隔秒數
            stopIntervalTime: 0.2,  // 停止間隔秒數
            beginTime: 0.5,   // 啟動秒數
            loopTime: 0.25,   // 循環秒數
            stopTime: 0.5,  // 停止秒數
            skipStopTime: 0.3,  // 急停秒數
            spinTime: 1,  // 至少滾動N秒
            mipieTime: 2,   // 瞇牌秒數
            showWinTime: 2,      // 中獎演示時間
            waitNextSpinTime: 0.1      // 下一輪轉動等待秒數
        },
        [TurboMode.Fast]: {
            spinIntervalTime: 0,  // 轉動/停止間隔秒數
            stopIntervalTime: 0.1,  // 停止間隔秒數
            beginTime: 0.4,   // 啟動秒數
            loopTime: 0.2,   // 循環秒
            stopTime: 0.4,  // 停止秒數
            skipStopTime: 0.3,  // 急停秒數
            spinTime: 0.7,  // 至少滾動N秒
            mipieTime: 2,   // 瞇牌秒數
            showWinTime: 2,      // 中獎演示時間
            waitNextSpinTime: 0.1       // 下一輪轉動等待秒數
        },
        [TurboMode.Turbo]: {
            spinIntervalTime: 0,  // 轉動/停止間隔秒數
            stopIntervalTime: 0,  // 停止間隔秒數
            beginTime: 0.3,   // 啟動秒數
            loopTime: 0.15,   // 循環秒數
            stopTime: 0.3,  // 停止秒數
            skipStopTime: 0.3,  // 急停秒數
            spinTime: 0.4,  // 至少滾動N秒
            mipieTime: 2,   // 瞇牌秒數
            showWinTime: 2,      // 中獎演示時間
            waitNextSpinTime: 0.1       // 下一輪轉動等待秒數
        }
    };

    /** 網站 */
    public static Sites = {
        /** 開發網站 */
        Develop: [
            'gc.prep.lab',
            'gc.playhard.name',
            'gc.ifun7.vip',
            'localhost',
            'gs.prep.lab'],
        QA: []
    };

    /** 版本 */
    public static Version = 'Ver:';

    /** 貨幣符號 */
    public static CurrencySymbol = 'A$';

    /** 小數點位數 */
    public static DecimalPlaces = 2;
}