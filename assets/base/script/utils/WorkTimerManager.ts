/**
 * Web Worker 計時器管理器 (WorkTimerManager) - 使用 Web Worker 實現背景計時功能
 * 
 * 【使用說明】
 * 獲取實例：
 * const timerManager = WorkTimerManager.getInstance();//自動執行onEnable
 * 
 * 功能特點：
 * - 使用 Web Worker 實現背景計時，確保計時器在背景標籤頁中正常運行
 * - 自動覆蓋原生的 setTimeout 和 clearTimeout
 * - 支持傳遞參數給回調函數
 * - 自動清理未使用的計時器資源
 * 
 * 注意事項：
 * - 需要與 WorkOnBlurManager 配合使用
 * - 瀏覽器必須支援 Web Worker、Blob 和 URL API
 * - 在不支援必要 API 的環境下會自動降級使用原生計時器
 * 
 * 實現原理：
 * - 使用 Web Worker 在獨立線程中運行計時器
 * - 通過消息傳遞機制與主線程通信
 * - 自動管理計時器的創建和清理
 */
import { _decorator, Component, Node, director } from 'cc';
const { ccclass } = _decorator;

@ccclass('WorkTimerManager')
export class WorkTimerManager extends Component {
    private static _instance: WorkTimerManager | null = null;
    // 定時器 ID 計數器
    private timeoutId = 0;
    // 儲存所有定時器的 Map，鍵為 ID，值為回調函數及其參數
    private timeouts = new Map<number, { fn: TimerHandler; args: any[] }>();
    // Worker 的程式碼內容，以字串形式儲存
    private readonly workerContent = `
        const timeouts = new Map();
        self.addEventListener("message", ({ data }) => {
            const { command, id, timeout = 0 } = data;
            switch (command) {
                case "setTimeout":
                    const timerId = setTimeout(() => {
                        self.postMessage({ id });
                        timeouts.delete(id);
                    }, timeout);
                    timeouts.set(id, timerId);
                    break;
                case "clearTimeout":
                    const existingTimer = timeouts.get(id);
                    if (existingTimer) {
                        clearTimeout(existingTimer);
                        timeouts.delete(id);
                    }
                    break;
            }
        });
    `;

    private worker: Worker | null = null;

    /**
     * 獲取對象池實例
     */
    public static getInstance(): WorkTimerManager {
        if (!WorkTimerManager._instance) {
            const node = new Node('WorkTimerManager');
            director.getScene()!.addChild(node);
            WorkTimerManager._instance = node.addComponent(WorkTimerManager);
            WorkTimerManager._instance.enabled = true;
        }
        return WorkTimerManager._instance;
    }

    /**
     * 啟用 Worker
     */
    protected onEnable(): void {
        if (this.worker == null)
            this.worker = this.init();
    }

    /**
     * 釋放實例
     */
    protected onDestroy(): void {
        if (this !== WorkTimerManager._instance) {
            return;
        }
        // 1. 恢復原生的計時器函數
        if (window) {
            //@ts-ignore
            window.setTimeout = window.originalSetTimeout || setTimeout;
            //@ts-ignore
            window.clearTimeout = window.originalClearTimeout || clearTimeout;
        }

        // 2. 終止 Web Worker
        if (this.worker) {
            this.worker.terminate();
            this.worker = null;
        }

        // 3. 清理計時器集合
        this.timeouts.clear();

        // 4. 重置計時器 ID
        this.timeoutId = 0;
        WorkTimerManager._instance = null;
    }

    private init(): Worker | null {
        // 檢查瀏覽器是否支援必要的 API
        if (window.URL && window.Blob && window.Worker && !this.worker) {
            // 將 Worker 程式碼轉換為 Blob 物件
            const blob = new Blob([this.workerContent], { type: 'text/javascript' });
            const url = URL.createObjectURL(blob);
            const worker = new Worker(url);
            // 釋放 URL 物件
            URL.revokeObjectURL(url);

            // 監聽來自 Worker 的消息
            worker.addEventListener('message', ({ data }) => {
                const { id } = data;
                const timeout = this.timeouts.get(id);
                if (timeout) {
                    const { fn, args } = timeout;
                    // 執行回調函數
                    if (typeof fn === 'function') {
                        fn.apply(null, args);
                    } else if (typeof fn === 'string') {
                        eval(fn);
                    }
                    this.timeouts.delete(id);
                }
            });
            // 覆蓋原生的 setTimeout 和 clearTimeout
            //@ts-ignore
            window.originalSetTimeout = window.setTimeout;
            //@ts-ignore
            window.originalClearTimeout = window.clearTimeout;
            //@ts-ignore
            window.setTimeout = this._setTimeout.bind(this);
            //@ts-ignore
            window.clearTimeout = this._clearTimeout.bind(this);
            return worker;
        }
        else {
            return null;
        }
    }

    /**
     * 自定義的 setTimeout 實現
     * @param handler 回調函數
     * @param timeout 延遲時間
     * @param args 參數
     * @returns 定時器 ID
     */
    private _setTimeout(handler: TimerHandler, timeout = 0, ...args: any[]): number {
        const id = ++this.timeoutId;
        // 儲存回調函數和參數
        this.timeouts.set(id, { fn: handler, args });
        // 向 Worker 發送消息，通知其設置定時器
        this.worker?.postMessage({ command: 'setTimeout', id, timeout });
        return id;
    }

    /**
     * 自定義的 clearTimeout 實現
     * @param id 定時器 ID
     */
    private _clearTimeout(id: number) {
        // 向 Worker 發送消息，通知其清除定時器
        this.worker?.postMessage({ command: 'clearTimeout', id });
        // 刪除定時器
        this.timeouts.delete(id);
    }
}