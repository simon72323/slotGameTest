import { SettingsController } from 'db://assets/base/components/settingsController/SettingsController';
import { dataManager } from 'db://assets/base/script/data/DataManager';
import { BaseEvent } from 'db://assets/base/script/event/BaseEvent';
import { audioManager } from 'db://assets/base/script/manager/AudioManager';
import { GameTask } from 'db://assets/base/script/tasks/GameTask';
import { ModuleID } from 'db://assets/base/script/types/BaseType';

import { FeatureBuyBtn } from 'db://assets/game/components/FeatureBuyUI/FeatureBuyBtn';
import { AudioKey } from 'db://assets/game/script/data/AudioKey';
import { TransUI } from 'db://assets/game/components/TransUI/TransUI';

/**
 * 轉場
 */
export class TransTask extends GameTask {
    protected name: string = 'TransTask';
    /**免費遊戲次數 */
    public freeSpinTimes: number = 0;
    /**是否第一次轉場 */
    public isFirstTrans: boolean = true;
    /**wild倍率 */
    public wildMultiplier: number = 0;

    execute(): void {
        //第一次進入轉場
        if (this.isFirstTrans) {
            dataManager().curModuleID = ModuleID.FG;
            audioManager().playMusic(AudioKey.bgmFg);
            FeatureBuyBtn.hide.emit();
            //中免費轉停止Auto模式
            if (dataManager().isAutoMode && dataManager().autoSpinCount === 0) {
                dataManager().isAutoMode = false;
            }
        }

        //轉場開始
        SettingsController.updateFreeSpinCount.emit(this.freeSpinTimes);
        TransUI.show.emit(this.freeSpinTimes, this.wildMultiplier,
            () => {
                //轉場全遮(更換場景資源)
                if (this.isFirstTrans) {
                    BaseEvent.changeScene.emit(ModuleID.FG);
                }
            },
            () => {
                this.finish();
            });
    }

    update(deltaTime: number): void {
        // throw new Error('Method not implemented.');
    }
}