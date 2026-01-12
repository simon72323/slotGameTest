
// import { BigWinUI } from '@game/components/BigWinUI/BigWinUI';

// import { BaseConst } from '@common/script/data/BaseConst';
// import { dataManager } from '@common/script/data/DataManager';
// import { GameTask } from '@common/script/tasks/GameTask';
// import { BigWinType } from '@common/script/types/BaseType';
// import { Utils } from '@common/script/utils/Utils';

// import { IWinFishData, IWinLineData } from 'db://assets/game/script/data/SlotType';


// /**
//  * 一局結束(判斷bigwin表演)
//  */
// export class EndGameTask extends GameTask {
//     protected name: string = 'EndGameTask';
//     /**中線資料 */
//     public winLineData: IWinLineData[];
//     /**總贏分 */
//     public payCreditTotal: number = 0;

//     /**剩餘額度 */
//     // public userCredit: number = 0;

//     /**執行 */
//     async execute(): Promise<void> {
//         const dataManager = DataManager.getInstance();
//         //MG單轉總分達到BigWin額外演示
//         if (dataManager.getBigWinTypeByValue(this.payCreditTotal) !== BigWinType.non) {
//             console.log('waitForBigWinComplete');
//             await this.waitForBigWinComplete();
//         }
//         await Utils.delay(BaseConst.SLOT_TIME[dataManager().curTurboMode].showWinTime);
//         this.finish();
//     }

//     /**等待BigWin完成 */
//     private waitForBigWinComplete(): Promise<void> {
//         return new Promise<void>((resolve) => {
//             BigWinUI.complete.once(() => {
//                 resolve();
//             }, this);
//             BigWinUI.show.emit(this.payCreditTotal);
//         });
//     }

//     update(deltaTime: number): void {
//         // throw 
//         // new Error('Method not implemented.');
//     }
// }