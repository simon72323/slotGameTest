import { game, ResolutionPolicy, view, Game } from 'cc';
import { EDITOR } from 'cc/env';

import { BaseEvent } from 'db://assets/base/script/event/BaseEvent';
import { OrientationtMode } from 'db://assets/base/script/types/BaseType';

/**
 * 屏幕適配管理器 - 靜態類
 * 在遊戲啟動時自動初始化，無需掛載到任何組件
 */
export class ScreenAdapter {
    private static resizeObserver: ResizeObserver | null = null;

    /**
     * 初始化屏幕適配
     */
    public static setupResize() {
        if (EDITOR) return;
        // 等待遊戲完全加載後再設置監聽
        game.on(Game.EVENT_ENGINE_INITED, () => {
            // // 優先使用 ResizeObserver
            if (typeof ResizeObserver !== 'undefined') {
                ScreenAdapter.resizeObserver = new ResizeObserver(() => ScreenAdapter.handleResize());
                ScreenAdapter.resizeObserver.observe(game.canvas);
            } else {
                window.addEventListener('resize', ScreenAdapter.handleResize);
            }
            // 初始設置一次
            // console.log('初始設置一次');
            ScreenAdapter.handleResize();
        });
    }

    /**
     * 清理屏幕適配
     */
    public static cleanupResize() {
        if (typeof ResizeObserver !== 'undefined' && ScreenAdapter.resizeObserver) {
            ScreenAdapter.resizeObserver.disconnect();
            ScreenAdapter.resizeObserver = null;
        } else {
            window.removeEventListener('resize', ScreenAdapter.handleResize);
        }
    }

    /** 
     * 處理畫面大小變化 
     */
    public static handleResize() {
        if (!game.canvas) return;

        const rect = game.canvas.getBoundingClientRect();
        const aspectRatio = rect.width / rect.height;

        // 判斷橫豎屏並設置對應分辨率
        if (aspectRatio > 1) {
            // if (aspectRatio > 1280 / 720) {
            view.setDesignResolutionSize(1280, 720, ResolutionPolicy.SHOW_ALL);
            // } else {
            //     view.setDesignResolutionSize(1280, 720, ResolutionPolicy.SHOW_ALL);
            // }
            // console.log('橫屏模式');
            BaseEvent.changeOrientation.emit(OrientationtMode.Landscape);
        } else {
            // if (aspectRatio < 720 / 1280) {
            view.setDesignResolutionSize(720, 1280, ResolutionPolicy.SHOW_ALL);
            // } else {
            // view.setDesignResolutionSize(720, 1280, ResolutionPolicy.SHOW_ALL);
            // }
            // console.log('豎屏模式');
            BaseEvent.changeOrientation.emit(OrientationtMode.Portrait);
        }
    }

    /**
     * 銷毀屏幕適配（如果需要）
     */
    public static destroy() {
        // console.log('銷毀屏幕適配');
        ScreenAdapter.cleanupResize();
    }
}