import { BaseSymbolData2 } from './BaseSymbolData2';

/**
 * 老虎機資料&解析盤面
 */
export abstract class BaseSlotParser2 {
  /**輪帶表 */
  public stripTable: number[][];
  /**輪帶索引 */
  public rngList: number[];

  /**強制結果 */
  public forceResult: number[][];
  /**子類別分析盤面,回傳瞇牌結果[true, false, ...] */
  abstract getMiList(): boolean[];
  abstract getMiList2(fromMap: BaseSymbolData2[][]): boolean[];

  /**軸圖示清單 */
  public symbols: number[][];

  /**取得各軸戲謔狀態(用不到回傳null) */
  abstract getNudgeTypeList(): number[];

  abstract canSkip(): boolean;
}
