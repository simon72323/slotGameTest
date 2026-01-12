import { SettingsController } from 'db://assets/base/components/settingsController/SettingsController';
import { GameTask } from 'db://assets/base/script/tasks/GameTask';

import { SlotData } from 'db://assets/game/script/data/SlotData';

/**
 * 更新免費遊戲次數
 */
export class UpdateFreeTimesTask extends GameTask {
    protected name: string = 'UpdateFreeTimesTask';
    public wildMultiplier: number = 0;
    public freeSpinTimes: number;

    async execute(): Promise<void> {
        if (this.wildMultiplier > 0) {
            SlotData.fsWildMultiply = this.wildMultiplier;//變更免費遊戲 wild倍率
        }
        SettingsController.updateFreeSpinCount.emit(this.freeSpinTimes);
        this.finish();
    }

    update(deltaTime: number): void {
        // throw new Error('Method not implemented.');
    }
}