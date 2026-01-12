import { BaseConst } from 'db://assets/base/script/data/BaseConst';
import { TurboMode } from 'db://assets/base/script/types/BaseType';

/**
 * 遊戲常數
 */
export class GameConst extends BaseConst {
    /**Scatter中獎數量 */
    public static SCATTER_WIN_COUNT: number = 3;

    /** 中獎線路配置 (3x5盤面) */
    public static payLineData: number[][] = [
        [1, 1, 1, 1, 1], [0, 0, 0, 0, 0], [2, 2, 2, 2, 2], [1, 0, 0, 0, 1], [1, 2, 2, 2, 1],
        [2, 1, 0, 1, 2], [0, 1, 2, 1, 0], [2, 2, 1, 0, 0], [0, 0, 1, 2, 2], [2, 1, 1, 1, 0]
    ];

    /**橫軸列數 */
    public static REEL_COL: number = 5;

    /**縱軸列數 */
    public static REEL_ROW: number = 3;

    /**scatter中獎次數 */
    public static SCATTER_MAPPING: { [key: number]: number } = {
        3: 10,  // 索引1對應3個scatter，10次
        4: 15,  // 索引2對應4個scatter，15次
        5: 20   // 索引3對應5個scatter，20次
    };

    /**MG初始盤面結果 */
    public static MG_INIT_RESULT: number[][] = [
        [15, 16, 17],
        [1, 6, 2],
        [8, 0, 7],
        [3, 5, 4],
        [18, 19, 20]
    ];

    /**釣起scatter機率 */
    public static catchScatterRate: number = 0.4;
    /**購買免費遊戲是否釣起scatter */
    public static buyFgCatchScatter: boolean = false;

    /**遊戲轉動時間(遊戲可覆寫BaseConst的SLOT_TIME) */
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

    /**版本號 */
    public static Version = 'Ver:5800.005';
}

/**覆蓋BaseConst資料 */
BaseConst.SLOT_TIME = GameConst.SLOT_TIME;
BaseConst.Version = GameConst.Version;

/**符號ID */
export enum SymbolID {
    Wild = 0,
    H1 = 1,
    H2,
    H3,
    H4,
    F1 = 5,
    F2 = 6,
    F3 = 7,
    F4 = 8,
    F5 = 9,
    F6 = 10,
    F7 = 11,
    F8 = 12,
    LA = 15,
    LK,
    LQ,
    LJ,
    LT,
    Scatter = 20,
}

/**魚倍率 */
export const FISH_ODDS = {
    [SymbolID.F1]: 2,
    [SymbolID.F2]: 5,
    [SymbolID.F3]: 10,
    [SymbolID.F4]: 15,
    [SymbolID.F5]: 20,
    [SymbolID.F6]: 25,
    [SymbolID.F7]: 50,
    [SymbolID.F8]: 2000
} as const;

/**老虎機ID */
// export enum SlotMachineID {
//     MG = 0,
//     FG = 1
// }