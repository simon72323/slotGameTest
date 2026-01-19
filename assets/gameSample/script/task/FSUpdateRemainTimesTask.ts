// import { GameTask } from 'db://assets/base/script/tasks/GameTask';
// import { FreeSpinTimes } from '../../components/FreeSpinTimes/FreeSpinTimes';

// /**
//  * 更新剩餘次數
//  */
// export class FSUpdateRemainTimesTask extends GameTask {
//   protected name: string = 'FSUpdateRemainTimesTask';

//   /**免費轉次數 */
//   public fsRemainTimes: number;

//   execute(): void {
//     //主畫面
//     FreeSpinTimes.refreshRemainTimes.emit(this.fsRemainTimes);

//     this.finish();
//   }

//   update(deltaTime: number): void {
//     // throw new Error("Method not implemented.");
//   }
// }
