import { _decorator, Component, Node, Prefab, Vec3 } from 'cc';
import { BaseSymbol } from 'db://assets/base/components/slotMachine/BaseSymbol';
import { SlotData } from 'db://assets/base/components/slotMachine/SlotData';
import { XEvent, XEvent1, XEvent2 } from 'db://assets/base/script/event/XEvent';
import { SlotCluster } from './SlotCluster';


export enum SlotType {
    Line = 0,
    Cascade = 1,
    Cluster = 2,
}
const { ccclass, property } = _decorator;
/**
 * 老虎機
 */
@ccclass('SlotMachine')
export class SlotMachine extends Component {
    private static instance: SlotMachine;

    public static getInstance(): SlotMachine {
        return SlotMachine.instance;
    }

    /**
     * 取得老虎機數據（供其他腳本使用）
     * @returns 老虎機數據
     */
    public static getSlotData(): SlotData {
        return SlotMachine.instance?.slotData;
    }

    /**
     * 取得所有主層symbol
     * @returns 所有主層symbol
     */
    public static getSymbolList(): Node[] {
        return SlotMachine.instance.slotData.allMainSymbols;
    }

    /**
     * 取得所有主層symbol位置
     * @returns 所有主層symbol位置
     */
    public static getSymbolPosList(): Vec3[] {
        return SlotMachine.instance.slotData.allMainSymbolPos;
    }


    /**初始化老虎機類型 */
    public static initType: XEvent1<SlotType> = new XEvent1();
    //======================================= XEvent ========================================
    /**初始化盤面結果 */
    public static initResultParser: XEvent1<number[][]> = new XEvent1();
    /**開始轉動slot */
    public static slotRun: XEvent2<number[][], boolean[]> = new XEvent2();
    /**中獎(winPos) */
    public static showSymbolWin: XEvent1<number[]> = new XEvent1();
    /**返回MG盤面 */
    public static backMGParser: XEvent1<number[][]> = new XEvent1();

    
    public static slotStopSound: XEvent1<number> = new XEvent1();
    /**轉動結束 */
    public static slotRunFinish: XEvent = new XEvent();
    /**開始瞇牌 */
    public static startMi: XEvent1<number> = new XEvent1();
    /**停止瞇牌 */
    public static stopMi: XEvent = new XEvent();
    //======================================= XEvent ========================================

    private slotType: SlotType = SlotType.Line;
    /**老虎機數據 */
    public slotData: SlotData = new SlotData();

    @property({ type: Node, tooltip: '轉動軸(順序),注意子節點下層需要多長一個symbol節點' })
    private reelList: Node[] = [];

    @property({ type: Node, tooltip: 'scatter層' })
    private scatterLayer: Node = null!;

    @property({ type: Node, tooltip: '勝利層' })
    private winLayer: Node = null!;

    @property({ type: Node, tooltip: '急停節點' })
    private skipUI: Node = null!;

    @property({ type: Prefab, tooltip: 'symbol' })
    private symbolPrefab: Prefab = null!;

    // private miNodeCount: number = 5;//每軸新增的瞇牌數量(必須比reelRow值大)

    /**
     * 建立物件
     */
    onLoad() {
        SlotMachine.instance = this;

        // 初始化數據類
        this.slotData.reelList = this.reelList;
        this.slotData.scatterLayer = this.scatterLayer;
        this.slotData.winLayer = this.winLayer;
        this.slotData.skipUI = this.skipUI;
        this.slotData.symbolPrefab = this.symbolPrefab;
        // this.slotData.miNodeCount = this.miNodeCount;
        this.slotData.init();

        // this.initCreatReel();//生成節點
        SlotMachine.initResultParser.on(this.initResultParser, this);
        SlotMachine.slotRun.on(this.onSlotRun, this);
        SlotMachine.backMGParser.on(this.onBackMGParser, this);
        SlotMachine.showSymbolWin.on(this.onShowSymbolWin, this);
    }

    /**
     * 初始化老虎機類型
     * @param type 老虎機類型
     */
    private initType(type: SlotType) {
        this.slotType = type;
        switch (type) {
            case SlotType.Line:
                break;
            case SlotType.Cascade:
                break;
            case SlotType.Cluster:
                SlotCluster.initCreatReels.emit();
                break;
        }
    }

    /**
     * 初始畫盤面符號
     * @param initParset 初始化盤面符號
     */
    private initResultParser(initParser: number[][]) {
        switch (this.slotType) {
            case SlotType.Line:
                break;
            case SlotType.Cascade:
                break;
            case SlotType.Cluster:
                SlotCluster.initResultParser.emit(initParser);
                break;
        }
    }

    /**
     * 處理開始轉動slot流程
     * @param resultPattern 盤面結果
     * @param mipieList 各軸瞇牌狀態
     */
    private async onSlotRun(resultPattern: number[][], mipieList: boolean[]) {
        const slotData = this.slotData;
        slotData.reelStopping = Array(slotData.reelList.length).fill(false);//重置各軸是否停止中
        slotData.reelStopped = Array(slotData.reelList.length).fill(false);//重置各軸完全停止
        slotData.resultPattern = resultPattern;//設定盤面結果
        slotData.mipieList = mipieList;//設定各軸瞇牌狀態

        switch (this.slotType) {
            case SlotType.Line:
                break;
            case SlotType.Cascade:
                break;
            case SlotType.Cluster:
                SlotCluster.slotRun.emit();
                break;
        }
    }

    /**
     * 返回MG盤面
     * @param backMGParser 返回MG盤面
     */
    private onBackMGParser(backMGParser: number[][]) {
        for (let i = 0; i < backMGParser.length; i++) {
            for (let j = 0; j < backMGParser[i].length; j++) {
                const symbol = this.slotData.reelMainSymbol[i][j];
                symbol.backMG(backMGParser[i][j]);
            }
        }
    }

    /**
     * 中獎
     * @param winPos 
     */
    private onShowSymbolWin(winPos: number[]): void {
        // const winPos = Utils.uniq(winLineData.flatMap((data) => data.winPos)); //全部中獎位置(不重複)
        const losePos = Array.from({ length: this.slotData.allMainSymbols.length }, (_, i) => i)
            .filter(pos => !winPos.includes(pos));
        for (let i = 0; i < winPos.length; i++) {
            const winSymbol = this.slotData.allMainSymbols[winPos[i]];
            winSymbol.getComponent(BaseSymbol).symbolWin();
        }
        for (let i = 0; i < losePos.length; i++) {
            const loseSymbol = this.slotData.allMainSymbols[losePos[i]];
            loseSymbol.getComponent(BaseSymbol).symbolLose();
        }
    }

}