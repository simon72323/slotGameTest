import { _decorator, Component, Node } from 'cc';

const { ccclass } = _decorator;

/**
 * Symbol介面
 */
@ccclass('BaseSymbol')
export class BaseSymbol extends Component {
    /**圖示編號 */
    public symbolID: number = -1;
    /**對應pos節點索引 */
    public posID: number = -1;
    /**原父節點 */
    public parentNode: Node = null;
    /**scatter層 */
    public scatterLayer: Node = null;
    /**win層 */
    public winLayer: Node = null;
    /**盤面欄列位置 */
    // public grid: Grid = { col: 0, row: 0 };
    /**是否為空圖示 */
    // private empty: boolean = false;
    /**是否停止 */
    public isStop: boolean = true;

    /**
     * 設定圖示ID
     * @param newSymbolID 
     */
    public setSymbolID(_newSymbolID: number, _isFinal: boolean = false): void {
        //override
    }

    /**
     * 設定圖示ID
     * @param newSymbolID 
     */
    // public setSymbolData(_data: BaseSymbolData): void {
    //     //override
    // }

    /** 模糊貼圖顯示 */
    public blurShow(): void {
        //override
    }

    /** 模糊貼圖隱藏 */
    public blurHide(): void {
        //override
    }

    /**中獎 */
    public symbolWin(): void {
        //override
    }

    /**未中獎 */
    public symbolLose(): void {
        //override
    }

    /**設定隨機圖示ID */
    public setRandomSymbolID(): void {
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
    public setIsMi(_isMi: boolean): void {
        //override
    }

    /**
     * 回復MG盤面symbol
     * @param symbolID 圖示ID
     */
    public backMG(symbolID: number): void {
        //override
    }
}