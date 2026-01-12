import { Notice } from 'db://assets/base/components/notice/Notice';
import { SettingsBetInfo } from 'db://assets/base/components/settingsController/SettingsBetInfo';
import { SettingsController } from 'db://assets/base/components/settingsController/SettingsController';
import { BetData } from 'db://assets/base/script/data/BetData';
import { dataManager } from 'db://assets/base/script/data/DataManager';
import { BaseEvent } from 'db://assets/base/script/event/BaseEvent';
import { GameTask } from 'db://assets/base/script/tasks/GameTask';
import { taskManager } from 'db://assets/base/script/tasks/TaskManager';
import { ModuleID } from 'db://assets/base/script/types/BaseType';

import { SpinTask } from 'db://assets/game/script/task/SpinTask';
/**
 * 待機
 */
export class IdleTask extends GameTask {
    protected name: string = 'IdleTask';
    execute(): void {
        dataManager().curModuleID = ModuleID.MG;

        if (dataManager().isAutoMode) {
            if (dataManager().isAutoTimes && dataManager().autoSpinCount > 0) {
                dataManager().autoSpinCount -= 1;
                SettingsController.updateAutoSpinCount.emit();
            }
            this.onSpin(false);
        }
        // 待機狀態
        else {
            this.idleState();
        }
    }

    /**
     * 待機狀態
     */
    private idleState(): void {
        BaseEvent.resetSpin.emit();//重置Spin按鈕
        BaseEvent.buyFeatureEnabled.emit(true);//啟用購買功能
        SettingsBetInfo.refreshBet.emit(BetData.getBetTotal());//刷新下注

        BaseEvent.clickSpin.on(this.onSpin, this);

        //購買功能
        BaseEvent.buyFeature.on(() => {
            SettingsController.clickSpin.emit(true);//透過點擊Spin按鈕(購買免費遊戲)
            dataManager().isBuyFg = true;//設置為購買免費遊戲
        }, this);
    }

    /**
     * 執行Spin
     * @param buyFs 是否購買免費遊
     */
    private onSpin(buyFs: boolean = false): void {
        let betCredit = buyFs ? BetData.getBuyFeatureTotal()
            : BetData.getBetTotal();

        SettingsBetInfo.refreshWin.emit(0, 0);//刷新贏分=0

        if (dataManager().userCredit < betCredit) {
            // 餘額不足
            SettingsBetInfo.refreshCredit.emit(dataManager().userCredit);
            Notice.showError.emit(220);
            this.idleState();
        }
        else {
            // 成功SPIN
            BaseEvent.clickSpin.off(this);
            BaseEvent.buyFeature.off(this);

            const spinTask = new SpinTask();
            spinTask.isBuyFg = buyFs;
            spinTask.betCredit = betCredit;
            taskManager().addTask(spinTask);

            this.finish();
        }
    }

    public update(_deltaTime: number): void {
        // throw new Error('Method not implemented.');
    }
}