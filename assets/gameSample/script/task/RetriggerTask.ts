// import { AudioKey } from 'db://assets/base/script/audio/AudioKey';
// import { AudioManager } from 'db://assets/base/script/audio/AudioManager';
// import { XUtils } from 'db://assets/base/script/utils/XUtils';
// import { GameTask } from '../../../base/script/tasks/GameTask';
// import { GameAudioKey, GameConst } from '../constant/GameConst';
// import { RetriggerUI } from '../../components/RetriggerUI/RetriggerUI';
// import { FreeSpinTimes } from '../../components/FreeSpinTimes/FreeSpinTimes';

// /**
//  * 增加次數
//  */
// export class RetriggerTask extends GameTask {
//   protected name: string = 'RetriggerTask';

//   /**當前剩餘次數 */
//   public from: number;
//   /**目標次數 */
//   public to: number;

//   execute(): void {
//     AudioManager.getInstance().play(AudioKey.Retrigger);

//     //直接設定
//     if (this.from === -1 || this.from === this.to) {
//       FreeSpinTimes.refreshRemainTimes.emit(this.to);
//       this.finish();
//     }
//     //增加轉數
//     else if (this.from !== this.to) {
//       let round: number = this.to - this.from;
//       let repeat: number = round - 1; //schedule內會自動+1, 所以次數要-1
//       AudioManager.getInstance().play(GameAudioKey.retrigger);
//       RetriggerUI.show.emit(round); //播放retrigger特效動畫
//       FreeSpinTimes.refreshRemainTimes.emit(this.from);
//       XUtils.schedule(
//         () => {
//           FreeSpinTimes.refreshRemainTimes.emit(++this.from);
//         },
//         this,
//         GameConst.BONUS_TIME_ADD_INTERVAL,
//         repeat,
//       );

//       XUtils.scheduleOnce(
//         () => {
//           RetriggerUI.hide.emit();
//           this.finish();
//         },
//         GameConst.BONUS_TIME_ADD_INTERVAL * (round + 1),
//         this,
//       );
//     }
//   }
//   update(deltaTime: number): void {
//     // throw new Error("Method not implemented.");
//   }
// }
