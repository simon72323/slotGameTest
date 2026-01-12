/**
 * 背景工作管理器 (WorkOnBlurManager) - 處理遊戲切換至背景時的持續運行
 * 
 * 【使用說明】
 * 1. 初始化：
 *    // 在遊戲啟動時初始化
 *    const workManager = WorkOnBlurManager.getInstance();
 * 功能特點：
 * - 自動處理遊戲切換至背景時的持續運行
 * - 確保遊戲動畫、計時器、緩動等效果不會因切換至背景而卡頓
 * 
 * 注意事項：
 * - 建議與 WorkTimerManager 配合使用
 * - 切換至背景時會自動啟動，無需手動調用
 * - 返回前台時會自動停止背景更新
 * 
 * 實現原理：
 * - 使用 setTimeout 在背景持續調用 director.tick()
 * - 通過控制 deltaTime 確保遊戲邏輯正常運行
 * - 自動監聽遊戲的 hide/show 事件進行處理
 */

import { _decorator, Component, Game, Node, director, game } from 'cc';
const { ccclass } = _decorator;

@ccclass('WorkOnBlurManager')
export class WorkOnBlurManager extends Component {
    private static _instance: WorkOnBlurManager | null = null;
    private workTimeOut: number | null = null;
    private lastTickTime: number = 0;

    /**
     * 在遊戲隱藏時，持續執行遊戲，以避免遊戲因隱藏而卡頓
     */
    protected onLoad() {
        game.on(Game.EVENT_HIDE, this.onGameHide, this);
        game.on(Game.EVENT_SHOW, this.onGameShow, this);
    }

    /**
     * 獲取對象池實例
     */
    public static getInstance(): WorkOnBlurManager {
        if (!WorkOnBlurManager._instance) {
            const node = new Node('WorkOnBlurManager');
            director.getScene()!.addChild(node);
            WorkOnBlurManager._instance = node.addComponent(WorkOnBlurManager);
        }
        return WorkOnBlurManager._instance;
    }

    /**
     * 釋放實例
     */
    protected onDestroy() {
        if (this !== WorkOnBlurManager._instance) {
            return;
        }
        game.off(Game.EVENT_HIDE, this.onGameHide, this);
        game.off(Game.EVENT_SHOW, this.onGameShow, this);
        if (this.workTimeOut !== null) {
            clearTimeout(this.workTimeOut);
            this.workTimeOut = null;
        }
        this.lastTickTime = 0;
        WorkOnBlurManager._instance = null;
    }


    /**
     * 遊戲隱藏時，持續執行遊戲
     */
    private onGameHide() {
        this.lastTickTime = Date.now();
        this.run();
    }

    /**
     * 遊戲顯示時，停止持續執行遊戲
     */
    private onGameShow() {
        if (this.workTimeOut !== null) {
            clearTimeout(this.workTimeOut);
            this.workTimeOut = null;
            this.lastTickTime = 0; // 重置時間戳
        }
    }

    /**
     * 持續執行遊戲(背景更新頻率:100ms)
     */
    private run() {
        const currentTime = Date.now();
        const deltaTime = Math.min((currentTime - this.lastTickTime) / 1000, 1 / 10);
        this.lastTickTime = currentTime;

        director.tick(deltaTime);
        this.workTimeOut = setTimeout(() => {
            this.run();
        }, 100);
    }
}