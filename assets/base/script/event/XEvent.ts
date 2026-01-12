/**
 * 無參數事件回調函數接口
 * 定義了不帶任何參數的事件處理函數類型
 */
interface XEventCallback {
    (): any;
}

/**
 * 無參數事件類別
 * 用於處理不需要傳遞參數的事件通信
 * 特點：同一個 scope 只能註冊一次事件，避免重複監聽
 */
export class XEvent {

    /** 持續監聽的事件回調函數集合，key 為 scope，value 為綁定後的回調函數 */
    private listeners: Map<any, XEventCallback> = new Map();

    /** 只執行一次的事件回調函數集合，key 為 scope，value 為綁定後的回調函數 */
    private listenersOnce: Map<any, XEventCallback> = new Map();

    /**
     * 註冊持續監聽的事件
     * @param callback 事件回調函數
     * @param scope 作用域對象，用於標識和移除事件
     */
    public on(callback: XEventCallback, scope: any) {
        this.listeners.set(scope, callback.bind(scope));
    }

    /**
     * 註冊只執行一次的事件
     * @param callback 事件回調函數
     * @param scope 作用域對象，用於標識和移除事件
     */
    public once(callback: XEventCallback, scope: any) {
        this.listenersOnce.set(scope, callback.bind(scope));
    }

    /**
     * 移除指定作用域的事件監聽
     * @param scope 要移除的作用域對象
     */
    public off(scope: any) {
        this.listeners.delete(scope);
        this.listenersOnce.delete(scope);
    }

    /**
     * 觸發事件，執行所有註冊的回調函數
     * 安全機制：複製 Map 避免在事件執行過程中修改 Map 導致錯誤
     */
    public emit() {
        //把 listeners Clone 出來，避免事件中 Map 被增減
        let temp: Map<any, XEventCallback> = new Map<any, XEventCallback>(this.listeners);

        // 執行所有持續監聽的事件
        temp.forEach((callback) => callback());

        // 處理只執行一次的事件
        if (this.listenersOnce.size > 0) {
            let tempOnce: Map<any, XEventCallback> = this.listenersOnce;
            this.listenersOnce = new Map<any, XEventCallback>();

            tempOnce.forEach(callback => callback());
        }
    }

    /** 清空所有事件監聽 */
    public clear() {
        this.listeners.clear();
        this.listenersOnce.clear();
    }
}

/**
 * 單參數事件回調函數接口
 * @template T1 第一個參數的類型
 */
interface XEventCallback1<T1> {
    (val: T1): any;
}

/**
 * 單參數事件類別
 * 用於處理需要傳遞一個參數的事件通信
 * @template T1 事件參數的類型
 */
export class XEvent1<T1> {

    private listeners: Map<any, XEventCallback1<T1>> = new Map();
    private listenersOnce: Map<any, XEventCallback1<T1>> = new Map();

    public on(callback: XEventCallback1<T1>, scope: any) {
        this.listeners.set(scope, callback.bind(scope));
    }

    public once(callback: XEventCallback1<T1>, scope: any) {
        this.listenersOnce.set(scope, callback.bind(scope));
    }

    public off(target: any) {
        this.listeners.delete(target);
        this.listenersOnce.delete(target);
    }

    /**
     * 觸發事件
     * @param val1 事件的第一個參數
     */
    public emit(val1: T1) {
        //把 listeners Clone 出來，避免事件中 Map 被增減
        let temp: Map<any, XEventCallback1<T1>> = new Map<any, XEventCallback1<T1>>(this.listeners);

        temp.forEach((callback) => callback(val1));

        if (this.listenersOnce.size > 0) {
            let tempOnce: Map<any, XEventCallback1<T1>> = this.listenersOnce;
            this.listenersOnce = new Map<any, XEventCallback1<T1>>();

            tempOnce.forEach(callback => callback(val1));
        }
    }

    public clear() {
        this.listeners.clear();
        this.listenersOnce.clear();
    }
}

//
interface XEventCallback2<T1, T2> {
    (val1: T1, val2: T2): any;
}
export class XEvent2<T1, T2> {

    private listeners: Map<any, XEventCallback2<T1, T2>> = new Map();
    private listenersOnce: Map<any, XEventCallback2<T1, T2>> = new Map();

    public on(callback: XEventCallback2<T1, T2>, scope: any) {
        this.listeners.set(scope, callback.bind(scope));
    }

    public once(callback: XEventCallback2<T1, T2>, scope: any) {
        this.listenersOnce.set(scope, callback.bind(scope));
    }

    public off(scope: any) {
        this.listeners.delete(scope);
        this.listenersOnce.delete(scope);
    }

    public emit(val1: T1, val2: T2) {
        //把 listeners Clone 出來，避免事件中 Map 被增減
        let temp: Map<any, XEventCallback2<T1, T2>> = new Map<any, XEventCallback2<T1, T2>>(this.listeners);

        temp.forEach((callback) => callback(val1, val2));

        if (this.listenersOnce.size > 0) {
            let tempOnce: Map<any, XEventCallback2<T1, T2>> = this.listenersOnce;
            this.listenersOnce = new Map<any, XEventCallback2<T1, T2>>();

            tempOnce.forEach(callback => callback(val1, val2));
        }
    }

    public clear() {
        this.listeners.clear();
        this.listenersOnce.clear();
    }
}

//
interface XEventCallback3<T1, T2, T3> {
    (val1: T1, val2: T2, val3: T3): any;
}
export class XEvent3<T1, T2, T3> {

    private listeners: Map<any, XEventCallback3<T1, T2, T3>> = new Map();
    private listenersOnce: Map<any, XEventCallback3<T1, T2, T3>> = new Map();

    public on(callback: XEventCallback3<T1, T2, T3>, scope: any) {
        this.listeners.set(scope, callback.bind(scope));
    }

    public once(callback: XEventCallback3<T1, T2, T3>, scope: any) {
        this.listenersOnce.set(scope, callback.bind(scope));
    }

    public off(scope: any) {
        this.listeners.delete(scope);
        this.listenersOnce.delete(scope);
    }

    public emit(val1: T1, val2: T2, val3: T3) {
        //把 listeners Clone 出來，避免事件中 Map 被增減
        let temp: Map<any, XEventCallback3<T1, T2, T3>> = new Map<any, XEventCallback3<T1, T2, T3>>(this.listeners);

        temp.forEach((callback) => callback(val1, val2, val3));

        if (this.listenersOnce.size > 0) {
            let tempOnce: Map<any, XEventCallback3<T1, T2, T3>> = this.listenersOnce;
            this.listenersOnce = new Map<any, XEventCallback3<T1, T2, T3>>();

            tempOnce.forEach(callback => callback(val1, val2, val3));
        }
    }

    public clear() {
        this.listeners.clear();
        this.listenersOnce.clear();
    }
}

//
interface XEventCallback4<T1, T2, T3, T4> {
    (val1: T1, val2: T2, val3: T3, val4: T4): any;
}
export class XEvent4<T1, T2, T3, T4> {

    private listeners: Map<any, XEventCallback4<T1, T2, T3, T4>> = new Map();
    private listenersOnce: Map<any, XEventCallback4<T1, T2, T3, T4>> = new Map();

    public on(callback: XEventCallback4<T1, T2, T3, T4>, scope: any) {
        this.listeners.set(scope, callback.bind(scope));
    }

    public once(callback: XEventCallback4<T1, T2, T3, T4>, scope: any) {
        this.listenersOnce.set(scope, callback.bind(scope));
    }

    public off(scope: any) {
        this.listeners.delete(scope);
        this.listenersOnce.delete(scope);
    }

    public emit(val1: T1, val2: T2, val3: T3, val4: T4) {
        //把 listeners Clone 出來，避免事件中 Map 被增減
        let temp: Map<any, XEventCallback4<T1, T2, T3, T4>> = new Map<any, XEventCallback4<T1, T2, T3, T4>>(this.listeners);

        temp.forEach((callback) => callback(val1, val2, val3, val4));

        if (this.listenersOnce.size > 0) {
            let tempOnce: Map<any, XEventCallback4<T1, T2, T3, T4>> = this.listenersOnce;
            this.listenersOnce = new Map<any, XEventCallback4<T1, T2, T3, T4>>();

            tempOnce.forEach(callback => callback(val1, val2, val3, val4));
        }
    }

    public clear() {
        this.listeners.clear();
        this.listenersOnce.clear();
    }
}


//
interface XEventCallback5<T1, T2, T3, T4, T5> {
    (val1: T1, val2: T2, val3: T3, val4: T4, val5: T5): any;
}

export class XEvent5<T1, T2, T3, T4, T5> {

    private listeners: Map<any, XEventCallback5<T1, T2, T3, T4, T5>> = new Map();
    private listenersOnce: Map<any, XEventCallback5<T1, T2, T3, T4, T5>> = new Map();

    public on(callback: XEventCallback5<T1, T2, T3, T4, T5>, scope: any) {
        this.listeners.set(scope, callback.bind(scope));
    }

    public once(callback: XEventCallback5<T1, T2, T3, T4, T5>, scope: any) {
        this.listenersOnce.set(scope, callback.bind(scope));
    }

    public off(scope: any) {
        this.listeners.delete(scope);
        this.listenersOnce.delete(scope);
    }

    public emit(val1: T1, val2: T2, val3: T3, val4: T4, val5: T5) {
        //把 listeners Clone 出來，避免事件中 Map 被增減
        let temp: Map<any, XEventCallback5<T1, T2, T3, T4, T5>> = new Map<any, XEventCallback5<T1, T2, T3, T4, T5>>(this.listeners);

        temp.forEach((callback) => callback(val1, val2, val3, val4, val5));

        if (this.listenersOnce.size > 0) {
            let tempOnce: Map<any, XEventCallback5<T1, T2, T3, T4, T5>> = this.listenersOnce;
            this.listenersOnce = new Map<any, XEventCallback5<T1, T2, T3, T4, T5>>();

            tempOnce.forEach(callback => callback(val1, val2, val3, val4, val5));
        }
    }

    public clear() {
        this.listeners.clear();
        this.listenersOnce.clear();
    }
}