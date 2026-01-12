import { SlotMachine } from 'db://assets/base/components/slotMachine/SlotMachine';
import { dataManager } from 'db://assets/base/script/data/DataManager';
import { BaseEvent } from 'db://assets/base/script/event/BaseEvent';
import { audioManager } from 'db://assets/base/script/manager/AudioManager';
import { GameTask } from 'db://assets/base/script/tasks/GameTask';
import { Utils } from 'db://assets/base/script/utils/Utils';

import { ReelBlackUI } from 'db://assets/game/components/ReelBlackUI/ReelBlackUI';
import { AudioKey } from 'db://assets/game/script/data/AudioKey';

/**
 * Scatter中獎
 */
export class WinScatterTask extends GameTask {
    protected name: string = 'WinScatterTask';
    /**中獎位置 */
    public winPos: number[];
    /**派彩金額 */
    public payCredit: number;

    public async execute(): Promise<void> {
        audioManager().playSound(AudioKey.scatterWin);
        ReelBlackUI.show.emit(); //壓黑
        SlotMachine.showSymbolWin.emit(this.winPos); //顯示中獎位置
        audioManager().editMusicVolume(0);
        //如果設定停止直到免費轉，則停止自動遊戲
        if (dataManager().isStopUntilFeature) {
            BaseEvent.stopAutoSpin.emit();//停止自動遊戲
        }

        await Utils.delay(2);
        ReelBlackUI.hide.emit();
        this.finish();
    }

    update(deltaTime: number): void {
        // throw new Error('Method not implemented.');
    }
}