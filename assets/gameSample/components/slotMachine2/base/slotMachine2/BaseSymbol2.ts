import { _decorator, Component, Node } from 'cc';
// import { Grid } from 'db://assets/base/script/types/BaseType';
import { BaseSymbolData2 } from './BaseSymbolData2';
import { SymbolState2 } from './SlotType2';

const { ccclass, property } = _decorator;

/**
 * Symbol介面
 */
@ccclass('BaseSymbol2')
export class BaseSymbol2 extends Component {
  /**圖示編號 */
  public symbolID = -1;

  /**對應pos節點索引 */
  protected posIndex: number = -1;

  /**盤面欄列位置 */
  // protected grid: Grid = { col: 0, row: 0 };

  /**是否為空圖示 */
  private empty: boolean = false;

  /**層級清單 */
  protected layerList: Node[] = [];

  /**是否在畫面中 */
  public isInView: boolean = true;

  /**
   * 設定圖示層級清單
   * @param list
   */
  public setLayerList(list: Node[]): void {
    this.layerList = list;
  }

  public setIsEmpty(v: boolean): void {
    this.empty = v;
  }

  public getIsEmpty(): boolean {
    return this.empty;
  }

  /**
   * 設定圖示ID
   * @param newSymbolID
   */
  public setSymbolID(newSymbolID: number, stripIdx: number, isFinal: boolean = false): void {
    //override
  }

  /**
   * 設定圖示ID
   * @param newSymbolID
   */
  public setSymbolData(data: BaseSymbolData2): void {
    //override
  }
  /**
   * 設定圖示ID
   * @param newSymbolID
   */
  public changeSymbolData(data: BaseSymbolData2): void {
    //override
  }

  /**
   * 設定圖示狀態
   * @param newSymbolID
   */
  public setState(state: SymbolState2): void {
    //override
  }

  // public setGrid(grid: Grid): void {
  //   this.grid = grid;
  //   this.node.name = `symbol_${grid.col}_${grid.row}`;
  // }

  // public getGrid(): Grid {
  //   return this.grid;
  // }

  public setPosIndex(index: number): void {
    this.posIndex = index;
  }

  public copyPositionAndScaleFrom(node: Node): void {
    this.node.setPosition(node.getPosition());
    this.node.setScale(node.getScale());
  }

  public getPosIndex(): number {
    return this.posIndex;
  }

  public showWin(): void {
    //override
  }

  public hideWin(): void {
    //override
  }

  public explode(): void {
    //override
  }

  public randomSymbol(): void {
    //override
  }

  /**掉落到盤面時(轉動消去都會觸發, 只有畫面內的symbol會觸發) */
  public hit(isInView: boolean): void {
    //override
  }

  /**Spin時(所有symbol) */
  public onSpin(): void {
    //override
  }

  /**停輪時(所有symbol) */
  public onStop(): void {
    //override
  }

  /**開始瞇牌 */
  public setIsMi(isMi: boolean): void {
    //override
  }
  /**設定是否可見 */
  public setVisible(visible: boolean): void {
    //override
  }
}
