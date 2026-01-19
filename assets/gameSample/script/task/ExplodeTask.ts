// import { Vec3 } from 'cc';
// import { BaseDataManager } from 'db://assets/base/script/main/BaseDataManager';
// import { BaseEvent } from 'db://assets/base/script/main/BaseEvent';
// import { delay, XUtils } from 'db://assets/base/script/utils/XUtils';
// import { GameTask } from '../../../base/script/tasks/GameTask';
// import { SlotMachine2 } from '../../components/slotMachine2/base/slotMachine2/SlotMachine2';
// import { GameAudioKey, SlotMachineID } from '../constant/GameConst';
// import { GAME_TIMES, gameData, gameTimeScale } from '../main/GameData';
// import { MultiplierUI } from '../../components/MultiplierUI/MultiplierUI';
// import { Stage } from '../../components/stage/Stage';
// import { AudioManager } from 'db://assets/base/script/audio/AudioManager';
// import { Symbol2 } from '../../components/slotMachine2/Symbol2';

// /**
//  * 爆炸
//  */
// export class ExplodeTask extends GameTask {
//   protected name: string = 'ExplodeTask';

//   /**消去位置 */
//   public winPos: number[];
//   /**下一個倍率布局 */
//   public nextMultiplierLayout: s5g.game.proto.MultiplierInfo.ILayout;
//   /**獲得金額(尚未xRate) */
//   public win: number;
//   /**目前累計獲得金額(尚未xRate) */
//   public sumWin: number;
//   /**玩家分數 */
//   public playerCent: number;
//   /**角色等級 */
//   public chrLevel: number;

//   async execute(): Promise<void> {
//     SlotMachine2.explode.emit(SlotMachineID.BS, this.winPos);

//     //將winPos轉換為位置索引
//     const posIdList = this.winPos.map((pos) => XUtils.posToPosID(pos, gameData().REEL_ROW));

//     //設置倍率
//     let newMultipliers = Array(posIdList.length).fill(1);
//     this.nextMultiplierLayout.positions.forEach((position, i) => {
//       const index = posIdList.indexOf(position);
//       if (index !== -1) {
//         newMultipliers[index] = this.nextMultiplierLayout.multiplier[i];
//       }
//     });

//     //刷新贏分
//     let rateSumWin = this.sumWin * BaseDataManager.getInstance().bet.getCurRate();
//     BaseEvent.refreshWin.emit(rateSumWin);
//     BaseEvent.refreshCredit.emit(this.playerCent);
//     const explodeTime = GAME_TIMES.explodeDuration / gameTimeScale();

//     await delay(0.55 / gameTimeScale());
//     Symbol2.resetHideWin.emit(); //重置隱藏圖示
//     MultiplierUI.resetGrayMutiplier.emit(); //重置灰化倍率
//     AudioManager.getInstance().play(GameAudioKey.symbol_explode);
//     Stage.shake.emit();
//     //獲取周圍位置並移動
//     const surroundingPosList = this.getSurroundingPositions(posIdList);
//     surroundingPosList.forEach((pos) => {
//       Symbol2.moveSymbol.emit(pos.posId, pos.pos);
//     });

//     await delay(0.2 / gameTimeScale());
//     MultiplierUI.updateMutiplier.emit(posIdList, newMultipliers);
//     let delayTime = explodeTime - 0.8;

//     //判斷是否有*2以上倍率
//     const isBigMultiplier = newMultipliers.some((multiplier) => multiplier > 1);
//     if (!isBigMultiplier) {
//       delayTime = 0;
//     }

//     await delay(delayTime / gameTimeScale());
//     this.finish();
//   }

//   /**
//    * 更新贏分
//    * @param time 等待完成時間
//    * @returns Promise<void>
//    */
//   // private async updateWinCredit(time: number): Promise<void> {
//   //   //刷新贏分
//   //   let rateSumWin = this.sumWin * BaseDataManager.getInstance().bet.getCurRate();
//   //   BaseEvent.refreshWin.emit(rateSumWin);
//   //   BaseEvent.refreshCredit.emit(this.playerCent);
//   //   await delay(time);
//   //   this.finish();
//   // }

//   /**
//    * 獲取指定位置列表周圍的所有相鄰位置
//    * @param posIdList 位置ID列表
//    * @returns 周圍位置ID列表（不包含原始位置）
//    */
//   private getSurroundingPositions(posIdList: number[]): { posId: number; pos: Vec3 }[] {
//     const REEL_COL = gameData().REEL_COL;
//     const REEL_ROW = gameData().REEL_ROW;
//     const originalSet = new Set(posIdList);
//     const mergedMap = new Map<number, Vec3>();

//     // 方向配置：{ row, col, offset } - offset為偏移量倍數
//     const offset1 = 8; //正向位移量
//     const offset2 = 4; //斜向位移量
//     const directions = [
//       { row: -1, col: 0, offset: offset1 }, // 上
//       { row: 1, col: 0, offset: offset1 }, // 下
//       { row: 0, col: -1, offset: offset1 }, // 左
//       { row: 0, col: 1, offset: offset1 }, // 右
//       { row: -1, col: -1, offset: offset2 }, // 左上
//       { row: -1, col: 1, offset: offset2 }, // 右上
//       { row: 1, col: -1, offset: offset2 }, // 左下
//       { row: 1, col: 1, offset: offset2 }, // 右下
//     ];

//     // 遍歷每個位置，獲取其周圍位置
//     posIdList.forEach((posID) => {
//       const col = posID % REEL_COL;
//       const row = Math.floor(posID / REEL_COL);

//       directions.forEach((dir) => {
//         const newRow = row + dir.row;
//         const newCol = col + dir.col;

//         // 檢查是否在有效範圍內
//         if (newRow >= 0 && newRow < REEL_ROW && newCol >= 0 && newCol < REEL_COL) {
//           const newPosID = newRow * REEL_COL + newCol;

//           // 只處理不在原始位置列表中的位置
//           if (!originalSet.has(newPosID)) {
//             const posX = (newCol - col) * dir.offset;
//             const posY = (row - newRow) * dir.offset;
//             const offsetVec = new Vec3(posX, posY, 0);

//             // 直接在Map中累加，避免後續合併步驟
//             const existingPos = mergedMap.get(newPosID);
//             if (existingPos) {
//               existingPos.add(offsetVec);
//             } else {
//               mergedMap.set(newPosID, offsetVec);
//             }
//           }
//         }
//       });
//     });

//     // 轉換為數組格式
//     return Array.from(mergedMap.entries()).map(([posId, pos]) => ({
//       posId: posId,
//       pos: pos,
//     }));
//   }

//   update(deltaTime: number): void {
//     // throw new Error("Method not implemented.");
//   }
// }
