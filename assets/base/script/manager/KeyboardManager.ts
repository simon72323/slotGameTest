import { EventKeyboard, input, Input } from 'cc';

import { dataManager } from 'db://assets/base/script/data/DataManager';
import { BaseEvent } from 'db://assets/base/script/event/BaseEvent';

/**
 * 鍵盤控制器
 */
export class KeyboardManager {
    private static instance: KeyboardManager;
    public static getInstance(): KeyboardManager {
        if (!KeyboardManager.instance) {
            KeyboardManager.instance = new KeyboardManager();
        }
        return KeyboardManager.instance;
    }

    /**
     * 初始化
     */
    public initialize(): void {
        input.on(Input.EventType.KEY_DOWN, this.onKeyDown, this);
    }

    /**
     * 按下鍵盤
     * @param event 事件
     */
    private onKeyDown(event: EventKeyboard) {

        if (dataManager().lockKeyboard
            || dataManager().isAutoMode
            || !dataManager().isMG()) {
            return;
        }

        BaseEvent.keyDown.emit(event.keyCode);
    }
}