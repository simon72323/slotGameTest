// import { AudioManager } from 'db://assets/base/script/audio/AudioManager';
// import { GameTask } from '../../../base/script/tasks/GameTask';
// import { SlotMachine2 } from '../../components/slotMachine2/base/slotMachine2/SlotMachine2';
// import { SymbolData2 } from '../../components/slotMachine2/SymbolData2';
// import { GameAudioKey, GameConst, SlotMachineID, SymbolID } from '../constant/GameConst';
// import { gameData } from '../main/GameData';
// import { XUtils } from 'db://assets/base/script/utils/XUtils';

// /**
//  * 掉落
//  */
// export class DropTask extends GameTask {
//   protected name: string = 'DropTask';

//   //舊盤面
//   public preSymbolPattern: number[];
//   //新盤面
//   public newSymbolPattern: number[];
//   /**是否為scatter中獎 */
//   public isScatterWin: boolean = false;
//   /**是否為最後一盤 */
//   public isLastPlane: boolean = false;

//   async execute(): Promise<void> {
//     // 建立從舊盤面到新盤面的符號資料陣列
//     let fromAllToReel: SymbolData2[][] = [];
//     // 建立新盤面的符號資料陣列
//     let allToReel: SymbolData2[][] = [];

//     const reelCol = gameData().REEL_COL;
//     const reelRow = gameData().REEL_ROW;

//     // let isSymbolShake = false;//是否表演震動
//     // let shakeSymbols: any[] = [];
//     // 遍歷每一列（轉軸）
//     for (let col: number = 0; col < reelCol; col++) {
//       // 當前轉軸的新符號資料
//       let toReel: SymbolData2[] = [];
//       // 當前轉軸的舊符號資料
//       let fromReel: SymbolData2[] = [];

//       // 遍歷每一行（符號位置）
//       for (let row: number = 0; row < reelRow; row++) {
//         // 建立舊符號資料
//         let fromData = new SymbolData2();
//         fromData.symbolID = this.preSymbolPattern[col + reelCol * row]; // 取得舊符號 ID
//         // fromData.isBadge = false;  // 舊符號沒有金框效果
//         fromReel.push(fromData);

//         // 建立新符號資料
//         let data = new SymbolData2();
//         data.symbolID = this.newSymbolPattern[col + reelCol * row]; // 取得新符號 ID
//         // data.isBadge = this.goldenPattern[col + reelCol * row] > 0;  // 根據金框圖案設定金框效果
//         toReel.push(data);
//       }
//       // 將舊符號資料加入陣列
//       fromAllToReel.push(fromReel);
//       // 將新符號資料加入陣列
//       allToReel.push(toReel);
//     }

//     // console.log('fromAllToReel', fromAllToReel);
//     // console.log('allToReel', allToReel);
//     //如果要表演震動
//     // if (isSymbolShake) {
//     //     shakeSymbols.forEach((symbol) => {
//     //         symbol.symbolShake();
//     //     });
//     //     await delay(gameData().getTurboSetting().dropShakeTime);
//     //     shakeSymbols.forEach((symbol) => {
//     //         symbol.stopShake();
//     //     });
//     // }

//     /** 瞇牌掉落 */
//     let scatterCount = this.preSymbolPattern.filter(
//       (symbolID) => symbolID === SymbolID.Scatter || symbolID === SymbolID.SuperScatter,
//     ).length;

//     //瞇牌掉落
//     if (scatterCount >= GameConst.BONUS_WIN_COUNT - 1) {
//       SlotMachine2.drop.emit(SlotMachineID.BS, () => {
//         SlotMachine2.fill.emit(SlotMachineID.BS, fromAllToReel, allToReel, () => {
//           this.finish();
//         });
//       });
//     }
//     //一般掉落
//     else {
//       SlotMachine2.fill.emit(SlotMachineID.BS, fromAllToReel, allToReel, () => {
//         this.finish();
//       });
//     }
//   }

//   update(deltaTime: number): void {
//     // throw new Error("Method not implemented.");
//   }
// }
