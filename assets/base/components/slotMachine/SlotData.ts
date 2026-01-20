import { Node, Prefab, Vec3, UITransform } from 'cc';
import { BaseSymbol } from 'db://assets/base/components/slotMachine/BaseSymbol';

/**
 * 老虎機數據類
 * 存儲老虎機的配置、運行時數據和狀態
 */
export class SlotData {
    /**橫軸列數 */
    public reelCol: number = 6;
    /**每軸縱軸列數 */
    public reelRow: number = 5;

    /**轉動軸(順序),注意子節點下層需要多長一個symbol節點 */
    public reelList: Node[] = [];

    /**scatter層 */
    public scatterLayer: Node = null!;
    /**勝利層 */
    public winLayer: Node = null!;
    /**急停節點 */
    public skipUI: Node = null!;
    /**symbol預製體 */
    public symbolPrefab: Prefab = null!;

    /**symbol寬度 */
    public symbolWidth: number = 0;
    /**symbol高度 */
    public symbolHeight: number = 0;
    /**每軸新增的瞇牌數量(必須比reelRow值大) */
    public miNodeCount: number = 5;

    /**各軸主層symbol節點(順序) */
    public reelMainSymbol: BaseSymbol[][] = [];
    /**各軸上層symbol節點(順序) */
    public reelTopSymbol: BaseSymbol[][] = [];
    /**各軸下層symbol節點(順序) */
    public reelBottomSymbol: BaseSymbol[][] = [];
    /**各軸symbol節點 */
    public reelSymbols: BaseSymbol[][] = [];
    /**所有主層symbol節點(Node) */
    public allMainSymbols: Node[] = [];
    /**所有主層symbol位置(以畫面中心點為基準) */
    public allMainSymbolPos: Vec3[] = [];

    /**是否執行瞇牌 */
    public isRunMi: boolean = false;
    /**結果符號 */
    public resultPattern: number[][] = [];
    /**各軸瞇牌狀態 */
    public mipieList: boolean[] = [];
    /**各軸是否停止中 */
    public reelStopping: boolean[] = [];
    /**各軸完全停止 */
    public reelStopped: boolean[] = [];

    /**
     * 初始化數據
     */
    public init(): void {
        this.reelMainSymbol = Array.from({ length: this.reelList.length }, () => []);
        this.reelTopSymbol = Array.from({ length: this.reelList.length }, () => []);
        this.reelBottomSymbol = Array.from({ length: this.reelList.length }, () => []);
        this.reelSymbols = Array.from({ length: this.reelList.length }, () => []);

        this.reelCol = this.reelList.length;
        if (this.reelList.length > 0) {
            // this.reelRow = this.reelList.map((reel) => reel.children.length / 3);
            const firstChild = this.reelList[0].children[0];
            if (firstChild) {
                const uiTransform = firstChild.getComponent(UITransform);
                if (uiTransform) {
                    this.symbolWidth = uiTransform.contentSize.width;
                    this.symbolHeight = uiTransform.contentSize.height;
                }
            }
        }
    }

    /**
     * 重置狀態數據
     */
    public resetState(): void {
        this.isRunMi = false;
        this.resultPattern = [];
        this.mipieList = [];
        this.reelStopping = [];
        this.reelStopped = [];
    }
}

