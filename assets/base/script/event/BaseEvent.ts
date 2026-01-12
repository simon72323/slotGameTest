import { KeyCode } from 'cc';

import { XEvent, XEvent1 } from 'db://assets/base/script/event/XEvent';
import { ISpinData } from 'db://assets/base/script/network/HttpApi';
import { ModuleID, OrientationtMode, TurboMode } from 'db://assets/base/script/types/BaseType';

/**
 * 共用遊戲事件
 */
export class BaseEvent {
    /**開啟'開始遊戲'按鈕 */
    public static showStartBtn: XEvent = new XEvent();
    /**切換直橫式 */
    public static changeOrientation: XEvent1<OrientationtMode> = new XEvent1();
    /**點擊開始 */
    public static clickStart: XEvent = new XEvent();
    /**點擊停止Spin */
    public static clickStop: XEvent = new XEvent();
    /**重置Spin */
    public static resetSpin: XEvent = new XEvent();

    //========================= server回傳事件 =========================
    /**傳送Spin結果 */
    public static onSpinResult: XEvent1<ISpinData> = new XEvent1();
    //========================= server事件 =========================

    //=========================== settingsController事件 =========================
    /**開啟遊戲說明 */
    public static showGameInformation: XEvent = new XEvent();
    /**開啟自動遊戲 */
    public static showAutoSpin: XEvent = new XEvent();

    /**設定快速模式按鈕狀態 */
    public static setTurboBtnState: XEvent1<TurboMode> = new XEvent1();
    /**執行自動遊戲 */
    public static runAutoSpin: XEvent = new XEvent();
    /**停止自動遊戲 */
    public static stopAutoSpin: XEvent = new XEvent();
    //=========================== settingsController事件 =========================

    /**初始化封包完成 */
    public static initMessageComplete: XEvent = new XEvent();
    /**遊戲資源讀取完成 */
    public static initResourceComplete: XEvent = new XEvent();
    /**通知LoadingUI關閉(必須和initMessageComplete錯開,否則可能會有順序問題) */
    public static hideLoading: XEvent = new XEvent();
    /**讀取畫面關閉,開始遊戲 */
    public static startGame: XEvent = new XEvent();

    /**點擊SPIN */
    public static clickSpin: XEvent1<boolean> = new XEvent1();

    /**停止中獎線輪播 */
    public static stopLineLoop: XEvent = new XEvent();

    /**點擊加速 */
    public static clickTurbo: XEvent1<boolean> = new XEvent1();
    /**點擊SKIP */
    public static clickSkip: XEvent = new XEvent();

    /**SPIN結果是否成功(失敗回idle) */
    public static spinResult: XEvent1<boolean> = new XEvent1();

    /**購買功能 */
    public static buyFeature: XEvent = new XEvent();
    /**廣播是否可看見購買功能 */
    public static buyFeatureVisible: XEvent1<boolean> = new XEvent1();
    /**廣播是否可點擊購買功能 */
    public static buyFeatureEnabled: XEvent1<boolean> = new XEvent1();

    /**切換場景(MG/FS) */
    public static changeScene: XEvent1<ModuleID> = new XEvent1();

    /**按下鍵盤 */
    public static keyDown: XEvent1<KeyCode> = new XEvent1<KeyCode>();

    /**停止自動轉通知 */
    public static onStopAuto: XEvent = new XEvent();

    /**淡入FeatureBuy */
    public static fadeInFeatureBuy: XEvent = new XEvent();
    /**淡出FeatureBuy */
    public static fadeOutFeatureBuy: XEvent = new XEvent();

    /**
     * 清除所有 BaseEvent 的事件監聽
     */
    public static clearAll(): void {
        //獲取 BaseEvent 類別的所有靜態屬性名稱
        const eventKeys = Object.getOwnPropertyNames(BaseEvent);

        //清空所有事件
        eventKeys.forEach(key => {
            const event = (BaseEvent as any)[key];
            if (event && event.clear) {
                event.clear();
            }
        });
    }
}