import { SlotMachine } from 'db://assets/base/components/slotMachine/SlotMachine';
import { BaseEvent } from 'db://assets/base/script/event/BaseEvent';
import { GameTask } from 'db://assets/base/script/tasks/GameTask';
import { ModuleID } from 'db://assets/base/script/types/BaseType';

import { ReelBlackUI } from 'db://assets/game/components/ReelBlackUI/ReelBlackUI';
import { FreeTotalWinUI } from 'db://assets/game/components/FreeTotalWinUI/FreeTotalWinUI';
import { SlotData } from 'db://assets/game/script/data/SlotData';
/**
 * FS總結算
 */
export class FreeTotalWinTask extends GameTask {
    protected name: string = 'FreeTotalWinTask';

    /**目前累計獲得金額 */
    public totalWin: number;
    /**返回MG盤面 */
    public backMGParser: number[][];
    /**總免費遊戲次數 */
    public totalFreeSpinTimes: number;

    execute(): void {
        FreeTotalWinUI.show.emit(this.totalWin, this.totalFreeSpinTimes,
            //轉場全遮蔽
            () => {
                //回復MG盤面
                BaseEvent.stopLineLoop.emit();//停止中獎線輪播
                ReelBlackUI.hide.emit();//隱藏遮黑
                BaseEvent.changeScene.emit(ModuleID.MG);
                SlotData.fsWildMultiply = 1;//重置免費遊戲 wild倍率
                SlotMachine.backMGParser.emit(this.backMGParser);//回復MG盤面
            },
            //演示完畢
            () => {
                this.finish();
            });

    }

    update(deltaTime: number): void {
        // throw new Error('Method not implemented.');
    }
}