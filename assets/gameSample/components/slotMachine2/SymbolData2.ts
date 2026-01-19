import { _decorator } from 'cc';
import { BaseSymbolData2 } from './base/slotMachine2/BaseSymbolData2';
const { ccclass, property } = _decorator;

/**
 * 圖示盤面資料基礎(遊戲有額外資料可繼承客製化)
 */
@ccclass('SymbolData2')
export class SymbolData2 extends BaseSymbolData2 {
  /**格子倍率 */
  public multiplier: number = 0;
}
