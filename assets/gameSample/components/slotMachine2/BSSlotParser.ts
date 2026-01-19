// import { BaseDataManager } from 'db://assets/base/script/main/BaseDataManager';
import { GameConst, SymbolID } from '../../script/constant/GameConst';
import { BaseSlotParser2 } from './base/slotMachine2/BaseSlotData2';
import { BaseSymbolData2 } from './base/slotMachine2/BaseSymbolData2';

/**
 * BSX5軸 遊戲客製化分析盤面
 */
export class BSSlotParser extends BaseSlotParser2 {
  public buyFS: boolean = false;

  private symbolPattern: number[];
  /**
   * 每一轉設定輪帶, 遇到scatter要隨機或依照最終盤面設定
   * @param stripTable 一般輪帶資料表
   * @param rngList 輪帶索引
   * @param symbolPattern 盤面
   */
  public setStripTable(stripTable: number[][], rngList: number[], symbolPattern: number[]): void {
    this.rngList = rngList;
    this.stripTable = stripTable;
    this.symbolPattern = symbolPattern;
  }

  /**
   * 更新輪帶資料表
   * @param stripTable 一般輪帶資料表
   * @param coinOverlap 金幣蒐集框
   * @param winPos 中獎位置(該軸有中獎的位置要改為respin輪帶)
   */
  public updateStripTable(stripTable: number[][], coinOverlap: boolean[], winPos?: number[]): number[][] {
    const reelCol = GameConst.REEL_COL;
    const reelRow = GameConst.REEL_ROW;
    // 深拷貝二維數組，避免修改原始 stripTable
    let newStripTable: number[][] = stripTable.map((col) => [...col]);
    let coinStripArray: boolean[] = Array(reelCol).fill(false);
    for (let i = 0; i < reelRow; ++i) {
      for (let j = 0; j < reelCol; ++j) {
        if (coinOverlap[i * reelRow + j]) coinStripArray[j] = true;
      }
    }
    let respinStripArray: boolean[] = Array(reelCol).fill(false);
    if (winPos) {
      winPos.forEach((pos) => {
        const col = Math.floor(pos / 10);
        respinStripArray[col] = true;
      });
    }
    //替換該軸為coin輪帶
    coinStripArray.forEach((isTrue, col) => {
      if (isTrue) {
        //取第3個輪帶值(金幣輪帶)
        newStripTable[col] = stripTable[col + reelCol * 2];
      } else if (respinStripArray[col]) {
        //如果沒有金幣但有掉落，取第2個輪帶值(respin輪帶)
        newStripTable[col] = stripTable[col + reelCol];
      }
    });
    return newStripTable;
  }

  /**
   * 轉動瞇牌
   * @returns
   */
  public getMiList(): boolean[] {
    let miList: boolean[] = [];
    let scatterCount: number = 0;
    for (let col: number = 0; col < GameConst.REEL_COL; ++col) {
      miList.push(scatterCount >= 2);
      for (let row: number = 0; row < GameConst.REEL_ROW; ++row) {
        let symbolID = this.symbolPattern[row * GameConst.REEL_COL + col];
        if (symbolID === SymbolID.Scatter || symbolID === SymbolID.SuperScatter) {
          scatterCount++;
        }
      }
    }
    return miList;
  }

  /**
   * 用上一盤盤面判斷掉落是否需要瞇牌
   * @param fromMap
   * @returns
   */
  public getMiList2(fromMap: BaseSymbolData2[][]): boolean[] {
    // let gameData = BaseDataManager.getInstance().getData<GameData>();
    let miList: boolean[] = [];
    let scatterCount: number = 0;
    fromMap.forEach((symbolOfReel: BaseSymbolData2[], col) => {
      scatterCount += symbolOfReel.filter(
        (symbolData: BaseSymbolData2) => symbolData.symbolID === SymbolID.Scatter || symbolData.symbolID === SymbolID.SuperScatter,
      ).length;
    });

    //有足夠的scatter時，所有軸都可以瞇牌
    miList = scatterCount >= GameConst.BONUS_WIN_COUNT - 1 ? fromMap.map(() => true) : fromMap.map(() => false);

    //================================ 移除scatter軸不瞇牌邏輯 ======================================
    // if (scatterCount >= GameConst.BONUS_WIN_COUNT - 1) {
    //     miList = [];
    //     fromMap.forEach((symbolOfReel: BaseSymbolData2[], col) => {
    //         //該軸沒有sc就可以瞇牌
    //         miList.push(symbolOfReel.filter((symbolData: BaseSymbolData2) => symbolData.symbolID === SymbolID.Scatter).length == 0);
    //     });
    // }
    // else {
    //     miList = [false, false, false, false, false, false];
    // }
    //================================ 移除scatter軸不瞇牌邏輯 ======================================
    return miList;
  }
  public getNudgeTypeList(): number[] {
    return null;
  }

  public canSkip(): boolean {
    // if (this.buyFS) {
    return true;
    // }
    // else {
    //     return this.getMiList().every((mi) => mi === false);
    // }
  }
}
