import { _decorator } from 'cc';
const { ccclass, property } = _decorator;

/**
 * 圖示盤面資料基礎(遊戲有額外資料可繼承再添加客製化資料)
 */
@ccclass('BaseSymbolData2')
export class BaseSymbolData2 {
  public symbolID: number = -1;
  /**區分變盤或返回BS盤面 */
  public isChange: boolean = false;
}
