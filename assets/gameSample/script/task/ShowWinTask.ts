// import { SettingsPage1 } from 'db://assets/base/components/settingsPage/SettingsPage1';
// import { AudioManager } from 'db://assets/base/script/audio/AudioManager';
// import { BaseDataManager } from 'db://assets/base/script/main/BaseDataManager';
// import { delay, XUtils } from 'db://assets/base/script/utils/XUtils';
// import { BaseEvent } from '../../../base/script/main/BaseEvent';
// import { GameTask } from '../../../base/script/tasks/GameTask';
// import { SpinButtonState } from '../../../base/script/types/BaseType';
// import { BannerUI } from '../../components/BannerUI/BannerUI';
// import { SlotMachine2 } from '../../components/slotMachine2/base/slotMachine2/SlotMachine2';
// import { GameAudioKey, SlotMachineID } from '../constant/GameConst';
// import { GAME_TIMES, gameData, gameTimeScale } from '../main/GameData';
// import { Node, Vec3 } from 'cc';
// import { MultiplierScoreUI } from '../../components/MultiplierScoreUI/MultiplierScoreUI';
// import { CharacterUI } from '../../components/CharacterUI/CharacterUI';
// import { MultiplierUI } from '../../components/MultiplierUI/MultiplierUI';
// import { Symbol2 } from '../../components/slotMachine2/Symbol2';

// /**
//  * 顯示贏分
//  */
// export class ShowWinTask extends GameTask {
//   protected name: string = 'ShowWinTask';

//   /**中獎位置 */
//   public winPos: number[];
//   /**中獎位置列表(每條中獎線的位置) */
//   public winLineList: s5g.game.proto.SlotResult.IWinLine[];
//   /**下一個倍率布局 */
//   public multiplierLayout: s5g.game.proto.MultiplierInfo.ILayout;
//   /**中獎圖示 */
//   public winSymbolID: number[];
//   /**中獎符號金額 */
//   public winSymbolCredit: number[];
//   /**獲得金額(尚未乘上倍率xRate) */
//   public planeWin: number;
//   /**目前累計獲得金額(尚未xRate) */
//   public sumWin: number;
//   /**玩家分數 */
//   public playerCent: number;
//   /**第幾次消除 */
//   // public lineLevel: number;
//   /**角色等級 */
//   public chrLevel: number;
//   /**是否達到最大倍數 */
//   public isMaxWin: boolean = false;

//   async execute(): Promise<void> {
//     // console.log('showWinTask sumWin', this.sumWin);
//     // console.log('showWinTask playerCent', this.playerCent);
//     SlotMachine2.showWin.emit(SlotMachineID.BS, this.winPos, GAME_TIMES.reelWinDelay);
//     SettingsPage1.setSpinState.emit(SpinButtonState.Disabled);

//     //壓黑
//     // UIBlack.show.emit();
//     CharacterUI.characterLevel.emit(this.chrLevel);

//     //將winPos轉換為位置索引
//     const posIdList = this.winPos.map((pos) => XUtils.posToPosID(pos, gameData().REEL_ROW));
//     //灰化未中獎倍率
//     MultiplierUI.grayMutiplier.emit(posIdList);

//     //計算得分顯示位置
//     const reelController = gameData().slotMachine.node;
//     const xPosList = reelController.children.map((reel: Node) => reel.getPosition().x);
//     const yPosList = reelController.children.map((reel: Node) =>
//       reel.children.map((node: Node) => node.getPosition().y),
//     );

//     const winLinePosList: number[][] = [];
//     const winPosIDList: number[][] = [];
//     const originalWinList: number[] = [];
//     const sumWinList: number[] = [];
//     const multiplierList: number[][] = [];
//     if (this.winLineList && this.winLineList.length > 0) {
//       // 遍歷每條普通中獎線
//       this.winLineList.forEach((winLineGroup) => {
//         winLinePosList.push(winLineGroup.pos);
//         originalWinList.push(winLineGroup.credit);
//         sumWinList.push(winLineGroup.credit_long);
//         //將winPos轉換為位置索引
//         const posIdList = winLineGroup.pos.map((pos) => XUtils.posToPosID(pos, gameData().REEL_ROW));
//         winPosIDList.push(posIdList);
//         //設置倍率
//         let multipliers = Array(posIdList.length).fill(0);
//         this.multiplierLayout.positions.forEach((position, i) => {
//           const index = posIdList.indexOf(position);
//           const multiplier = this.multiplierLayout.multiplier[i];
//           if (index !== -1 && multiplier > 1) {
//             multipliers[index] = multiplier;
//           }
//         });
//         multiplierList.push(multipliers);
//       });
//     }

//     winLinePosList.forEach((winPosList, index) => {
//       let scoreXPos: number[] = [];
//       let scoreYPos: number[] = [];
//       winPosList.forEach((winPos) => {
//         scoreXPos.push(xPosList[Math.floor(winPos / 10)]);
//         scoreYPos.push(yPosList[Math.floor(winPos / 10)][(winPos % 10) - 1]);
//       });
//       scoreXPos = XUtils.uniq(scoreXPos); //去除重複位置
//       scoreYPos = XUtils.uniq(scoreYPos); //去除重複位置
//       //計算座標平均值
//       const avgX = scoreXPos.reduce((sum, val) => sum + val, 0) / scoreXPos.length;
//       const avgY = scoreYPos.reduce((sum, val) => sum + val, 0) / scoreYPos.length;
//       const scorePos = new Vec3(avgX, avgY, 0);
//       const winPosID = winPosIDList[index];
//       const multiplier = multiplierList[index];
//       const originalWin = originalWinList[index] * BaseDataManager.getInstance().bet.getCurRate();
//       const sumWin = sumWinList[index] * BaseDataManager.getInstance().bet.getCurRate();
//       MultiplierScoreUI.showMultiplierScore.emit(winPosID, multiplier, originalWin, scorePos, sumWin);
//     });

//     const audioKey =
//       this.chrLevel === 1
//         ? GameAudioKey.payline_hit_1
//         : this.chrLevel === 2
//         ? GameAudioKey.payline_hit_2
//         : GameAudioKey.payline_hit_3;
//     AudioManager.getInstance().play(audioKey);

//     //顯示贏分
//     let ratePlaneWin = this.planeWin * BaseDataManager.getInstance().bet.getCurRate();
//     BannerUI.showWin.emit(ratePlaneWin);
//     //同參考:一倍時才顯示WIN及刷新贏分
//     let rateSumWin = this.sumWin * BaseDataManager.getInstance().bet.getCurRate();

//     BaseEvent.refreshWin.emit(rateSumWin);
//     BaseEvent.refreshCredit.emit(this.playerCent);
//     // }

//     const showTime = GAME_TIMES.showWinDuration / gameTimeScale(); //顯示時間
//     const scoreMoveTime = GAME_TIMES.scoreMoveTime / gameTimeScale(); //分數移動時間
//     XUtils.scheduleOnce(
//       async () => {
//         // CharacterUI.characterWin.emit(this.chrLevel);
//         if (this.isMaxWin) {
//           Symbol2.resetHideWin.emit(); //重置隱藏圖示
//           //這款頂倍等分數表演完後才跳出
//           await delay(scoreMoveTime - showTime);
//         }
//         this.finish();
//       },
//       showTime,
//       this,
//     );
//   }

//   update(deltaTime: number): void {
//     // throw new Error("Method not implemented.");
//   }
// }
