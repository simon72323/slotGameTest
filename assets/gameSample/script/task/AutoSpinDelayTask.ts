// import { BaseDataManager } from 'db://assets/base/script/main/BaseDataManager';
// import { GameTask } from 'db://assets/base/script/tasks/GameTask';
// import { XUtils } from 'db://assets/base/script/utils/XUtils';
// import { gameData } from '../main/GameData';

// /**
//  * 自動轉等待時間
//  */
// export class AutoSpinDelayTask extends GameTask {
//   execute(): void {
//     //自動轉 & 沒有skip 才延遲0.3秒
//     // if (BaseDataManager.getInstance().auto.isAutoPlay() == true && gameData().hasSkip === false) {
//     //   //延遲時間依照速度模式
//     //   let delay = gameData().getTurboSetting().autoSpinRoundDelay;
//     //   XUtils.scheduleOnce(
//     //     () => {
//     //       this.finish();
//     //     },
//     //     delay,
//     //     this,
//     //   );
//     // } else {
//     //   this.finish();
//     // }
//   }

//   update(deltaTime: number): void {
//     //
//   }
// }
