import { SettingsBetInfo } from 'db://assets/base/components/settingsController/SettingsBetInfo';
import { dataManager } from 'db://assets/base/script/data/DataManager';
import { audioManager } from 'db://assets/base/script/manager/AudioManager';
import { GameTask } from 'db://assets/base/script/tasks/GameTask';

import { FeatureBuyBtn } from 'db://assets/game/components/FeatureBuyUI/FeatureBuyBtn';
import { AudioKey } from 'db://assets/game/script/data/AudioKey';

/**
 * FS返回MG總結算(先BigWin再橫幅)
 */
export class BackMainGameTaskk extends GameTask {

    protected name: string = 'BackMainGameTask';

    /**目前累計獲得金額(右下角Win) */
    public userCredit: number;


    execute(): void {
        audioManager().playMusic(AudioKey.bgmMg);

        //更新玩家餘額
        SettingsBetInfo.refreshCredit.emit(this.userCredit);
        dataManager().userCredit = this.userCredit;
        FeatureBuyBtn.show.emit();

        //回復盤面
        // SlotMachine.backMGParser.emit(this.backMGParser);
        // SlotMachine.change.emit(SlotMachineID.MG, dataManager().getGameData().bsLastMap);
        // UIController
        // SettingsPage1.setSpinState.emit(SpinButtonState.Disabled);
        this.finish();
    }

    update(deltaTime: number): void {
        // throw new Error('Method not implemented.');
    }
}