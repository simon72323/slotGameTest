import { JsonAsset, resources, _decorator, game, Node, tween, Vec3, UIOpacity, director, Scheduler, Component, Button, sp, Label } from 'cc';

import { BaseConst } from 'db://assets/base/script/data/BaseConst';
import { RunNumber } from 'db://assets/base/script/types/BaseType';


export class Utils {
    //===================================== 數字相關 =====================================
    /**
     * 數字格式化，添加千分位逗號
     * @param value 要格式化的數字
     * @returns 格式化後的字符串
     */
    public static numberFormat(value: number): string {
        const digits = BaseConst.DecimalPlaces;
        const preciseValue = Utils.accMul(value, 1);
        return preciseValue.toLocaleString('en', { minimumFractionDigits: digits, maximumFractionDigits: digits });
    }

    /**
     * 數字格式化，添加千分位逗號(KMB)
     * @param value 要格式化的數字
     * @returns 格式化後的字符串
     */
    public static numberFormatKMB(value: number): string {
        const digits = BaseConst.DecimalPlaces;
        const preciseValue = Utils.accMul(value, 1);
        if (preciseValue >= 1_000_000_000) {
            const value = preciseValue / 1_000_000_000;
            return value.toLocaleString('en', { minimumFractionDigits: 0, maximumFractionDigits: 2 }) + 'B';
        } else if (preciseValue >= 1_000_000) {
            const value = preciseValue / 1_000_000;
            return value.toLocaleString('en', { minimumFractionDigits: 0, maximumFractionDigits: 2 }) + 'M';
        } else if (preciseValue >= 1_000) {
            const value = preciseValue / 1_000;
            return value.toLocaleString('en', { minimumFractionDigits: 0, maximumFractionDigits: 2 }) + 'K';
        } else {
            return preciseValue.toLocaleString('en', { minimumFractionDigits: digits, maximumFractionDigits: digits });
        }
    }

    /**
     * 數字格式化，添加幣別符號
     * @param value 要格式化的數字
     * @returns 格式化後的字符串
     */
    public static numberFormatCurrency(value: number): string {
        return BaseConst.CurrencySymbol + ' ' + Utils.numberFormat(value);
    }

    /**
     * 數字格式化，添加幣別符號(KMB)
     * @param value 要格式化的數字
     * @returns 格式化後的字符串
     */
    public static numberFormatKMBCurrency(value: number): string {
        return BaseConst.CurrencySymbol + ' ' + Utils.numberFormatKMB(value);
    }

    /**
     * 獲取幣別符號
     * @returns 幣別符號
     */
    public static getCurrencySymbol(): string {
        return BaseConst.CurrencySymbol;
    }

    /**
     * 精確數字
     * @param value 要精確的數字
     * @returns 精確的數字
     */
    public static accNumber(value: number): number {
        return Utils.accMul(value, 1);
    }

    /**
     * 精確乘法
     * @param arg1 第一個數
     * @param arg2 第二個數
     * @returns 精確的乘積
     */
    public static accMul(arg1: number, arg2: number): number {
        const s1 = `${arg1}`, s2 = `${arg2}`;
        const m = (s1.split('.')[1]?.length || 0) + (s2.split('.')[1]?.length || 0);
        return Number(s1.replace('.', '')) * Number(s2.replace('.', '')) / Math.pow(10, m);
    }

    /**
     * 精確除法
     * @param arg1 被除數
     * @param arg2 除數
     * @returns 精確的商
     */
    public static accDiv(arg1: number, arg2: number): number {
        const s1 = `${arg1}`,s2 = `${arg2}`;
        const t1 = s1.split('.')[1]?.length || 0;
        const t2 = s2.split('.')[1]?.length || 0;
        return Utils.accMul(Number(s1.replace('.', '')) / Number(s2.replace('.', '')), Math.pow(10, t2 - t1));
    }

    /**
     * 精確加法
     * @param arg1 第一個數
     * @param arg2 第二個數
     * @returns 精確的和
     */
    public static accAdd(arg1: number, arg2: number): number {
        const r1 = (`${arg1}`.split('.')[1]?.length || 0);
        const r2 = (`${arg2}`.split('.')[1]?.length || 0);
        const m = Math.pow(10, Math.max(r1, r2));
        return (Utils.accMul(arg1, m) + Utils.accMul(arg2, m)) / m;
    }

    /**
     * 精確減法
     * @param arg1 被減數
     * @param arg2 減數
     * @returns 精確的差
     */
    public static accSub(arg1: number, arg2: number): number {
        const r1 = (`${arg1}`.split('.')[1]?.length || 0);
        const r2 = (`${arg2}`.split('.')[1]?.length || 0);
        const m = Math.pow(10, Math.max(r1, r2));
        return (Utils.accMul(arg1, m) - Utils.accMul(arg2, m)) / m;
    }
    //===================================== 數字相關 =====================================

    //===================================== 動畫相關 =====================================
    /**
     * 跑分動畫
     * @param time 動畫時間
     * @param nodeLabel 顯示label
     * @param runNum 跑分數據(curValue: 起點值, finalValue: 最終值)
     * @param callback 
     */
    public static runNumber(time: number, nodeLabel: Label, runNum: RunNumber, callback?: () => void) {
        tween(runNum)
            .to(time, { curValue: runNum.finalValue }, {
                onUpdate: () => {
                    nodeLabel.string = Utils.numberFormat(runNum.curValue);
                },
                easing: Utils.noisyEasing
            })
            .call(() => {
                callback?.();
            })
            .start();
    }

    /**
     * 跑分動畫(帶幣別，無return)
     * @param time 動畫時間
     * @param nodeLabel 顯示label
     * @param runNum 跑分數據(curValue: 起點值, finalValue: 最終值)
     */
    public static runNumberCurrency(time: number, nodeLabel: Label, runNum: RunNumber) {
        tween(runNum)
            .to(time, { curValue: runNum.finalValue }, {
                onUpdate: () => {
                    nodeLabel.string = Utils.numberFormatCurrency(runNum.curValue);
                },
                easing: Utils.noisyEasing
            })
            .call(() => {
                nodeLabel.string = Utils.numberFormatCurrency(runNum.curValue);
                // callback?.();
            })
            .start();
    }

    /**
     * 跑分隨機值
     * @param t 
     * @returns 
     */
    public static noisyEasing(t: number): number {
        // 加一點正向亂數，但不能超過1，也不能比t小
        const noise = Math.random() * 0.01; // 隨機減少最多 0.1
        return t < 0.9 ? t - t * noise : t;
    }

    /**
     * 淡入
     * @param node 
     * @param time 
     * @param startOpacity 起始透明度
     * @param endOpacity 結束透明度
     * @param callback 
     */
    public static fadeIn(node: Node, time: number, startOpacity: number, endOpacity: number, callback?: () => void) {
        if (node.getComponent(UIOpacity) == null) {
            node.addComponent(UIOpacity);
        }
        node.getComponent(UIOpacity).opacity = startOpacity;
        tween(node.getComponent(UIOpacity))
            .to(time, { opacity: endOpacity })
            .call(() => {
                if (callback) callback();
            })
            .start();
    }

    /**
     * 淡出
     * @param node 
     * @param time 
     * @param startOpacity 起始透明度
     * @param endOpacity 結束透明度
     * @param callback 
     */
    public static fadeOut(node: Node, time: number, startOpacity: number, endOpacity: number, callback?: () => void) {
        if (node.getComponent(UIOpacity) == null) {
            node.addComponent(UIOpacity);
        }
        node.getComponent(UIOpacity).opacity = startOpacity;
        tween(node.getComponent(UIOpacity))
            .to(time, { opacity: endOpacity })
            .call(() => {
                if (callback) callback();
            })
            .start();
    }

    /**
     * 縮放動態
     * @param node 
     * @param time 
     * @param startScale 起始縮放
     * @param endScale 結束縮放
     * @param callback 
     */
    public static tweenScaleTo(node: Node, time: number, startScale: number, endScale: number, callback?: () => void) {
        node.scale = new Vec3(startScale, startScale, 1);
        tween(node)
            .to(time, { scale: new Vec3(endScale, endScale, 1) }, { easing: 'sineOut' })
            .call(() => {
                if (callback) callback();
            })
            .start();
    }
    //===================================== 動畫相關 =====================================

    //===================================== 延遲相關 =====================================
    /**
     * 一次性延遲執行
     * @param callback 要執行的回調函數
     * @param delay 延遲秒數
     * @param scope 作用域（this 指向）
     */
    public static scheduleOnce(callback: (dt?: number) => void, delay: number, scope: any) {
        Utils.schedule(callback, scope, 0, 0, delay);
    }

    /**
     * 重複延遲執行
     * @param callback 要執行的回調函數
     * @param scope 作用域（this 指向）
     * @param interval 間隔秒數
     * @param repeat 重複次數
     * @param delay 延遲秒數
     */
    public static schedule(callback: (dt?: number) => void, scope: any, interval: number, repeat?: number, delay?: number) {
        Scheduler.enableForTarget(scope);
        director.getScheduler().schedule(callback, scope, interval, repeat, delay, false);
    }

    /**
     * 取消重複延遲執行
     * @param callback 要執行的回調函數
     * @param scope 作用域（this 指向）
     */
    public static unschedule(callback: (dt?: number) => void, scope: any) {
        director.getScheduler().unschedule(callback, scope);
    }

    /**
     * 延遲
     * @param s 延遲秒數
     * @returns 
     */
    public static async delay(s: number): Promise<void> {
        return new Promise<void>(resolve => {
            Utils.scheduleOnce(() => resolve(), s, this);
        });
    }

    /**
     * 等待下一幀
     * @returns 
     */
    public static async waitNextFrame(): Promise<void> {
        return new Promise<void>(resolve => {
            Utils.scheduleOnce(() => resolve(), 0, this);
        });
    }
    //===================================== 延遲相關 =====================================

    /**
     * 根據中獎線ID獲取路徑位置
     * @param payLineId 中獎線ID (從1開始)
     * @param amount 需要的位置数量
     * @param slotPattern 盤面符號
     * @param payLineData 中獎線路徑配置
     * @returns 路徑位置數組
     */
    public static getLinePathPosition(payLineId: number, amount: number, slotPattern: number[][], payLineData: number[][]): { winPos: number[], winSymbolIDs: number[] } {
        const linePath = payLineData[payLineId];
        let winPos: number[] = [];
        let winSymbolIDs: number[] = [];

        // 從payLineData推導出行數 (假設所有路徑都有相同的行數)
        const flattened = payLineData.reduce((acc, val) => acc.concat(val), []); // 展平數組
        const rowCount = Math.max(...flattened) + 1; // 最大行號 + 1

        // 根據amount限制返回的位置數量
        for (let col = 0; col < linePath.length && col < amount; col++) {
            const row = linePath[col];
            const pos = col * rowCount + row;
            winPos.push(pos);
            winSymbolIDs.push(slotPattern[row][col]);
        }

        return { winPos, winSymbolIDs };
    }

    /**
     * 排除陣列重複資料
     * @param list 
     * @returns 
     */
    public static uniq(list: any[]) {
        return Array.from(new Set(list));
    }

    /**
     * 清除Spine
     * @param obj 
     */
    public static ClearSpine(obj: sp.Skeleton) {
        obj.clearTracks();
        obj.setToSetupPose();
        obj.setCompleteListener(null);
    }

    /**
     * 計算角度
     * @param startPos 起始位置
     * @param endPos 結束位置
     * @returns 角度
     */
    public static calculateAngle(startPos: Vec3, endPos: Vec3): number {
        const direction = endPos.clone().subtract(startPos);
        return Math.atan2(direction.y, direction.x) * 180 / Math.PI;
    }

    /**
     * 添加手型懸停事件
     * @param target 目標節點
     */
    public static AddHandHoverEvent(target: Node) {
        target.on(Node.EventType.MOUSE_ENTER, () => { game.canvas.style.cursor = 'pointer'; });
        target.on(Node.EventType.MOUSE_LEAVE, () => { game.canvas.style.cursor = 'default'; });
    }

    /**
     * 載入Json文件
     * @param path 文件路徑
     * @returns Json文件資料
     */
    public static async loadJson(path: string) {
        return new Promise((resolve, reject) => {
            resources.load(path, JsonAsset, (err, json) => {
                if (err) return reject(err);
                resolve(json.json);
            });
        });
    }
}

export enum DATA_TYPE {
    NODE = 0, // object node
    COMPONENT = 1, // object component
    TYPE = 2, // object component type
    NODE_PATH = 3, // node path for init object
    CLICK_EVENT = 4, // click event
    SCENE_PATH = 5, // scene path
}

/**
* 添加button Click事件監聽器
* @param target 目標(掛腳本的節點)
* @param component 組件名稱
* @param button 按鈕
* @param handler 處理器名稱
* @param eventData 事件數據(可選)
*/
export function addBtnClickEvent(target: Node, component: string, button: Button, handler: string, eventData?: string) {
    const eventHandler = new Component.EventHandler();
    eventHandler.target = target;
    eventHandler.component = component;
    eventHandler.handler = handler;
    if (eventData) eventHandler.customEventData = eventData;
    button.clickEvents.push(eventHandler);
}

// /**
// * 添加toggle事件監聽器（包含check和uncheck）
// * @param target 目標(掛腳本的節點)
// * @param component 組件名稱
// * @param toggle 切換按鈕
// * @param handler 處理器名稱
// * @param eventData 事件數據(可選)
// */
// export function addToggleClickEvent(target: Node, component: string, toggle: Toggle, handler: string, eventData?: string) {
//     const eventHandler = new Component.EventHandler();
//     eventHandler.target = target;
//     eventHandler.component = component;
//     eventHandler.handler = handler;
//     if (eventData) eventHandler.customEventData = eventData;
//     toggle.checkEvents.push(eventHandler);
// }
