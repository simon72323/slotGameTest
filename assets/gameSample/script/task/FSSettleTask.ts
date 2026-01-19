// import { BaseEvent } from 'db://assets/base/script/main/BaseEvent';
// import { ModuleID } from 'db://assets/base/script/types/BaseType';
// import { GameTask } from '../../../base/script/tasks/GameTask';
// import { BaseDataManager } from 'db://assets/base/script/main/BaseDataManager';
// import { FSSettleUI } from '../../components/FSSettleUI/FSSettleUI';
// import { gameData } from '../main/GameData';
// import { Symbol2 } from '../../components/slotMachine2/Symbol2';
// import { SymbolState2 } from '../../components/slotMachine2/base/slotMachine2/SlotType2';
// import { MultiplierUI } from '../../components/MultiplierUI/MultiplierUI';
// import { CharacterUI } from '../../components/CharacterUI/CharacterUI';
// import { ReelBgUI } from '../../components/ReelBgUI/ReelBgUI';
// /**
//  * FS總結算
//  */
// export class FSSettleTask extends GameTask {
//   protected name: string = 'FSSettleTask';

//   /**目前累計獲得金額 */
//   public win: number;

//   async execute(): Promise<void> {
//     // await delay(0.3);//等待0.3秒(倍率變化後)
//     const value = this.win * BaseDataManager.getInstance().bet.getCurRate();

//     //等fg結束噴煙火動畫結束後再執行結算
//     FSSettleUI.show.emit(
//       value,
//       //等全遮蔽時再進行轉場
//       () => {
//         // MultiplierUI.resetBSMultiplier.emit();//回復進入前BS倍率
//         // LockSymbolUI.removeLock.emit();//移除鎖定符號
//         BaseEvent.changeScene.emit(ModuleID.BS);
//         ReelBgUI.showReelBg.emit(0); //切換reelBg
//         CharacterUI.characterIdle.emit();
//         this.resetBSReel();
//       },
//       () => {
//         this.finish();
//       },
//     );
//   }

//   /**
//    * 回復BS盤面
//    */
//   private resetBSReel() {
//     const bsLastPattern = gameData().bsLastPattern;
//     let multiplierList: number[] = Array(bsLastPattern.length).fill(0);
//     const reelCol = gameData().REEL_COL;
//     //重新生成盤面
//     for (let col = 0; col < reelCol; col++) {
//       let reel = gameData().slotMachine.dataList[col];
//       reel.symbolList.forEach((symbol: Symbol2, row: number) => {
//         symbol.setState(SymbolState2.Normal);
//         const posID = row * reelCol + col;
//         const data = bsLastPattern[posID];
//         symbol.backBSSymbolID(data.symbolID);
//         multiplierList[posID] = data.multiplier;
//       });
//     }
//     MultiplierUI.resetBSMultiplier.emit(multiplierList);
//   }

//   update(deltaTime: number): void {
//     // throw new Error("Method not implemented.");
//   }
// }
