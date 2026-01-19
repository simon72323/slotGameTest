// import { SettingsPage1 } from 'db://assets/base/components/settingsPage/SettingsPage1';
// import { XUtils } from 'db://assets/base/script/utils/XUtils';
// import { BaseDataManager } from '../../../base/script/main/BaseDataManager';
// import { BaseEvent } from '../../../base/script/main/BaseEvent';
// import { GameTask } from '../../../base/script/tasks/GameTask';
// import { BigWinType, ModuleID, SpinButtonState } from '../../../base/script/types/BaseType';
// import { BannerUI } from '../../components/BannerUI/BannerUI';
// import { BigWinUI } from '../../components/BigWinUI/BigWinUI';
// import { gameTimeScale } from '../main/GameData';
// import { CharacterUI } from '../../components/CharacterUI/CharacterUI';
// import { MaxWin } from 'db://assets/base/components/MaxWin/MaxWin';

// /**
//  * 一局結束
//  */
// export class EndGameTask extends GameTask {
//   protected name: string = 'EndGameTask';

//   /**單轉總贏分(尚未xRate) */
//   public win: number = 0;

//   /**剩餘額度 */
//   public playerCent: number = 0;
//   /**角色等級 */
//   public chrLevel: number = 0;

//   /**是否為最大贏分 */
//   public isMaxWin: boolean = false;

//   execute(): void {
//     //BS單轉總分達到BigWin額外演示
//     if (BaseDataManager.getInstance().getBigWinTypeByValue(this.win) != BigWinType.non) {
//       if (BaseDataManager.getInstance().isBS() === true) {
//         BigWinUI.complete.once(() => {
//           this.showTotalWin();
//         }, this);
//         BigWinUI.show.emit(this.win);
//       } else {
//         BigWinUI.complete.once(() => {
//           this.showTotalWin();
//         }, this);
//         BigWinUI.show.emit(this.win);
//       }
//     }
//     //一般獎項
//     else if (this.win > 0) {
//       this.showTotalWin();
//     }
//     //沒中
//     else {
//       this.finish();
//     }
//     // }
//   }

//   private showTotalWin(): void {
//     SettingsPage1.setSpinState.emit(SpinButtonState.Disabled);
//     BaseEvent.refreshCredit.emit(this.playerCent);

//     const rateWin = this.win * BaseDataManager.getInstance().bet.getCurRate();

//     if (this.isMaxWin) {
//       this.handleMaxWin(rateWin);
//     } else {
//       const isBS = BaseDataManager.getInstance().isBS();
//       if (isBS) {
//         BaseEvent.refreshWin.emit(rateWin);
//       }
//       //因為可能要跑分, 收到totalWinComplete才能完成任務
//       BannerUI.totalWinComplete.once(() => {
//         this.handleNormalWin();
//       }, this);
//     }

//     BannerUI.showTotalWin.emit(rateWin);
//   }

//   /**
//    * 處理最大贏分情況
//    */
//   private handleMaxWin(rateWin: number): void {
//     const isBS = BaseDataManager.getInstance().isBS();

//     if (isBS) {
//       // BS遇到maxWin要補刷贏分
//       MaxWin.show.emit(null);
//       BaseEvent.refreshWin.emit(rateWin);
//       this.finish();
//     } else {
//       // FS遇到maxWin要點擊後才能finish
//       MaxWin.show.emit(() => {
//         this.finish();
//       });
//     }
//   }

//   /**
//    * 處理一般贏分情況
//    */
//   private handleNormalWin(): void {
//     CharacterUI.characterWin.emit(this.chrLevel);
//     //TotalWin顯示1秒
//     XUtils.scheduleOnce(
//       () => {
//         this.finish();
//       },
//       1 / gameTimeScale(),
//       this,
//     );
//   }

//   update(deltaTime: number): void {
//     // throw
//     // new Error("Method not implemented.");
//   }
// }
