// import { AudioManager } from 'db://assets/base/script/audio/AudioManager';
// import { GameTask } from 'db://assets/base/script/tasks/GameTask';
// import { SlotMachine2 } from '../../components/slotMachine2/base/slotMachine2/SlotMachine2';
// import { GameAudioKey, SlotMachineID, SymbolID } from '../constant/GameConst';
// import { gameData } from '../main/GameData';
// import { SymbolData2 } from '../../components/slotMachine2/SymbolData2';
// import { CharacterUI } from '../../components/CharacterUI/CharacterUI';
// import { XUtils } from 'db://assets/base/script/utils/XUtils';
// import { ReelBgUI } from '../../components/ReelBgUI/ReelBgUI';
// import { Stage } from '../../components/stage/Stage';
// /**
//  * Scatter中獎
//  */
// export class ScatterWinTask extends GameTask {
//   protected name: string = 'ScatterWinTask';
//   /**最後一盤的倍率分布 */
//   public bsMultiplier: number[];
//   /**最終盤視覺盤面資料 */
//   public symbolPattern: number[];
//   /**是否為超級scatter中獎 */
//   public isSuperWin: boolean;

//   public execute(): void {
//     AudioManager.getInstance().play(GameAudioKey.scatter_win);
//     const reelCol = gameData().REEL_COL;
//     const winPos: number[] = [];

//     /**設置BS盤面資料 */
//     gameData().bsLastPattern.length = 0;
//     this.symbolPattern.forEach((symbolID, posID) => {
//       const data = new SymbolData2();
//       data.symbolID = symbolID;
//       data.multiplier = this.bsMultiplier[posID];
//       gameData().bsLastPattern.push(data);
//     });

//     //整理出中獎位置
//     this.symbolPattern.forEach((symbolID, mapIdx) => {
//       if (symbolID === SymbolID.Scatter || symbolID === SymbolID.SuperScatter) {
//         let row = mapIdx % reelCol;
//         let col = Math.floor(mapIdx / reelCol);
//         winPos.push(row * 10 + col + 1);
//       }
//     }, this);

//     SlotMachine2.showWin.emit(SlotMachineID.BS, winPos, 0);
//     AudioManager.getInstance().play(GameAudioKey.free_game_transition_1);

//     if (this.isSuperWin) {
//       ReelBgUI.showReelBg.emit(2); //切換reelBg
//       Stage.shake.emit();
//     }
//     //小熊跳出
//     CharacterUI.characterTrans.emit();

//     XUtils.scheduleOnce(
//       () => {
//         this.finish();
//       },
//       2,
//       this,
//     );
//   }

//   update(deltaTime: number): void {
//     // throw new Error("Method not implemented.");
//   }
// }
