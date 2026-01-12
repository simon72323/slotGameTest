import { _decorator, Component, Node, Prefab, tween, instantiate, UITransform, Vec3, Tween, easing, Button } from 'cc';
import { BaseSymbol } from 'db://assets/base/components/slotMachine/BaseSymbol';
import { BaseConst } from 'db://assets/base/script/data/BaseConst';
import { dataManager } from 'db://assets/base/script/data/DataManager';
import { BaseEvent } from 'db://assets/base/script/event/BaseEvent';
import { XEvent, XEvent1, XEvent2 } from 'db://assets/base/script/event/XEvent';
import { Utils } from 'db://assets/base/script/utils/Utils';


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

    //======================================= XEvent ========================================
    /**初始化盤面結果 */
    public static initResultParser: XEvent1<number[][]> = new XEvent1();
    /**開始轉動slot */
    public static slotRun: XEvent2<number[][], boolean[]> = new XEvent2();
    public static slotStopSound: XEvent1<number> = new XEvent1();
    /**停止轉動slot */
    public static slotStop: XEvent = new XEvent();
    /**急停 */
    public static slotSkip: XEvent = new XEvent();
    /**轉動結束 */
    public static slotRunFinish: XEvent = new XEvent();
    /**開始瞇牌 */
    public static startMi: XEvent1<number> = new XEvent1();
    /**停止瞇牌 */
    public static stopMi: XEvent = new XEvent();
    /**中獎(winPos) */
    public static showSymbolWin: XEvent1<number[]> = new XEvent1();
    /**顯示壓黑 */
    public static showBlack: XEvent = new XEvent();
    /**返回MG盤面 */
    public static backMGParser: XEvent1<number[][]> = new XEvent1();
    //======================================= XEvent ========================================

    private reelCol: number = 5;//橫軸列數
    private reelRow: number[] = [];//每軸縱軸列數

    @property({ type: Node, tooltip: '轉動軸(順序),注意子節點下層需要多長一個symbol節點' })
    public reelList: Node[] = [];

    @property({ type: Node, tooltip: 'scatter層' })
    public scatterLayer: Node = null!;

    @property({ type: Node, tooltip: '勝利層' })
    public winLayer: Node = null!;

    @property({ type: Node, tooltip: '急停節點' })
    private skipUI: Node = null!;

    @property({ type: Prefab, tooltip: 'symbol' })
    private symbolPrefab: Prefab = null!;

    private symbolWidth: number;
    private symbolHeight: number;
    private miNodeCount: number = 5;//每軸新增的瞇牌數量(必須比reelRow值大)

    private reelMainSymbol: BaseSymbol[][] = [];//各軸主層symbol節點(順序)
    private reelTopSymbol: BaseSymbol[][] = [];//各軸上層symbol節點(順序)
    private reelBottomSymbol: BaseSymbol[][] = [];//各軸下層symbol節點(順序)
    private reelSymbols: BaseSymbol[][] = [];//各軸symbol節點
    private allMainSymbols: Node[] = [];//所有主層symbol節點(Node)
    private allMainSymbolPos: Vec3[] = [];//所有主層symbol位置(以畫面中心點為基準)

    private isRunMi = false;//是否執行瞇牌
    private resultPattern: number[][] = [];//結果符號
    private mipieList: boolean[] = [];//各軸瞇牌狀態
    private reelStopping: boolean[] = [];//各軸是否停止中
    private reelStopped: boolean[] = [];//各軸完全停止

    /**
     * 建立物件
     */
    onLoad() {
        SlotMachine.instance = this;

        this.reelMainSymbol = Array.from({ length: this.reelList.length }, () => []);
        this.reelTopSymbol = Array.from({ length: this.reelList.length }, () => []);
        this.reelBottomSymbol = Array.from({ length: this.reelList.length }, () => []);
        this.reelSymbols = Array.from({ length: this.reelList.length }, () => []);

        this.reelCol = this.reelList.length;
        this.reelRow = this.reelList.map((reel) => reel.children.length / 3);
        this.symbolWidth = this.reelList[0].children[0].getComponent(UITransform)!.contentSize.width;
        this.symbolHeight = this.reelList[0].children[0].getComponent(UITransform)!.contentSize.height;

        this.initCreatReel();//生成節點
        SlotMachine.initResultParser.on(this.initResultParser, this);
        SlotMachine.slotRun.on(this.onSlotRun, this);
        SlotMachine.backMGParser.on(this.onBackMGParser, this);
        BaseEvent.clickStop.on(this.onSlotSkip, this);

        SlotMachine.showSymbolWin.on(this.onShowSymbolWin, this);
    }

    /**
     * 初始化建立reelNode
     */
    private initCreatReel() {
        //建立reelNode
        for (let i = 0; i < this.reelList.length; i++) {
            let reelNode = this.reelList[i];
            reelNode.children.forEach((child, index) => {
                const pos = new Vec3(reelNode.position.x, child.position.y, 0);
                if (index >= this.reelRow[i] && index < this.reelRow[i] * 2) {
                    //設置scatter層位置
                    const scatterPosNode = instantiate(child);
                    scatterPosNode.name = `PosNode_${i}_${index}`;
                    scatterPosNode.setParent(this.scatterLayer);
                    scatterPosNode.setPosition(pos);
                    //設置勝利層位置
                    const winPosNode = instantiate(child);
                    winPosNode.name = `PosNode_${i}_${index}`;
                    winPosNode.setParent(this.winLayer);
                    winPosNode.setPosition(pos);
                }
            });
        }
    }

    /**
     * 初始畫盤面符號
     * @param initParset 初始化盤面符號
     */
    private initResultParser(initParser: number[][]) {
        for (let i = 0; i < this.reelList.length; i++) {
            const reelNode = this.reelList[i];
            const row1x = this.reelRow[i];//row1倍數量
            const row2x = this.reelRow[i] * 2;//row2倍數量
            const row3x = this.reelRow[i] * 3;//row3倍數量
            reelNode.children.forEach((child, idx) => {
                if (idx > row3x - 1) return;
                const symbol = instantiate(this.symbolPrefab).getComponent(BaseSymbol);
                symbol.scatterLayer = this.scatterLayer;
                symbol.winLayer = this.winLayer;
                symbol.parentNode = child;
                symbol.node.setParent(child);
                if (idx < row1x) {
                    //設置上層symbol
                    this.reelTopSymbol[i].push(symbol);
                    this.reelSymbols[i].push(symbol);
                    symbol.setRandomSymbolID();
                    symbol.node.active = false;//初始隱藏
                } else if (idx < row2x) {
                    //設置主層symbol
                    this.reelMainSymbol[i].push(symbol);
                    this.reelSymbols[i].push(symbol);
                    symbol.posID = i * row1x + idx - row1x;
                    // symbol.grid = { col: i, row: idx };
                    symbol.setSymbolID(initParser[i][idx - row1x]);
                    this.allMainSymbols.push(symbol.node);
                    this.allMainSymbolPos.push(new Vec3(reelNode.x, child.position.y, 0));
                }
                else {
                    //設置下層symbol
                    this.reelBottomSymbol[i].push(symbol);
                    this.reelSymbols[i].push(symbol);
                    symbol.setRandomSymbolID();
                    symbol.node.active = false;//初始隱藏
                }
            });
        }

        //生成瞇牌用節點
        for (let i = 0; i < this.reelList.length; i++) {
            let reelNode = this.reelList[i];
            let miNode = new Node(`MiNode_${i}`);
            miNode.addComponent(UITransform);
            miNode.getComponent(UITransform)!.setContentSize(this.symbolWidth, this.symbolHeight * this.miNodeCount);
            miNode.getComponent(UITransform)!.anchorY = 1;
            for (let j = 0; j < this.miNodeCount; j++) {
                //設置咪牌節點
                const pos = new Vec3(0, -this.symbolHeight * j - this.symbolHeight / 2, 0);
                const miSymbol = instantiate(this.symbolPrefab).getComponent(BaseSymbol);
                miSymbol.scatterLayer = this.scatterLayer;
                miSymbol.winLayer = this.winLayer;
                miSymbol.parentNode = miNode;
                miSymbol.node.name = `Symbol_${i}_${j}`;
                miSymbol.node.setParent(miNode);
                miSymbol.node.setPosition(pos);
                this.reelSymbols[i].push(miSymbol);
            }
            miNode.setParent(reelNode);
            const reelHeight = reelNode.getComponent(UITransform)!.contentSize.height;
            miNode.setPosition(new Vec3(0, -reelHeight / 2, 0));
            miNode.active = false;
        }
    }

    /**
     * 返回MG盤面
     * @param backMGParser 返回MG盤面
     */
    private onBackMGParser(backMGParser: number[][]) {
        for (let i = 0; i < backMGParser.length; i++) {
            for (let j = 0; j < backMGParser[i].length; j++) {
                const symbol = this.reelMainSymbol[i][j];
                symbol.backMG(backMGParser[i][j]);
            }
        }
    }

    //====================================== slot轉動流程 ======================================
    /**
     * 處理開始轉動slot流程
     * @param resultPattern 盤面結果
     * @param mipieList 各軸瞇牌狀態
     */
    private async onSlotRun(resultPattern: number[][], mipieList: boolean[]) {
        this.reelStopping = Array(this.reelList.length).fill(false);//重置各軸是否停止中
        this.reelStopped = Array(this.reelList.length).fill(false);//重置各軸完全停止
        this.resultPattern = resultPattern;//設定盤面結果
        this.mipieList = mipieList;//設定各軸瞇牌狀態

        //至少轉動spinTime秒後才發送轉動結束事件
        const spinTime = BaseConst.SLOT_TIME[dataManager().curTurboMode].spinTime;
        tween(this.node).delay(spinTime).call(() => {
            this.onSlotStop();//開始停輪
        }).start();

        //所有symbol進入spin狀態
        this.reelSymbols.forEach((symbols) => {
            symbols.forEach((symbol) => {
                symbol.onSpin();
            });
        });

        //監聽急停
        this.scheduleOnce(() => {
            this.skipUI.once(Button.EventType.CLICK, this.onSlotSkip, this);
        }, BaseConst.SLOT_TIME[dataManager().curTurboMode].beginTime);

        //開始轉動
        for (let i = 0; i < this.reelList.length; i++) {
            this.showHideTopBottomNode(i, true);//顯示上下節點
            this.startSlotRun(i);
            const spinIntervalTime = BaseConst.SLOT_TIME[dataManager().curTurboMode].spinIntervalTime;
            if (spinIntervalTime > 0) {
                await Utils.delay(spinIntervalTime);
            }
        }
    }

    /**
     * 處理停止轉動slot流程
     */
    private async onSlotStop() {
        for (let i = 0; i < this.reelList.length; i++) {
            const { runTime, backTime } = this.handleMi(i);//判斷是否執行咪牌與回傳停止時間
            await this.stopSlotRun(i, runTime, backTime);
        }
    }

    /**
     * 開始轉動slot
     * @param reelIndex 哪行slot
     */
    private startSlotRun(reelIndex: number) {
        if (this.reelStopping[reelIndex]) return;//如果停止中就不再執行
        const beginTime = BaseConst.SLOT_TIME[dataManager().curTurboMode].beginTime;//啟動時間
        const loopTime = BaseConst.SLOT_TIME[dataManager().curTurboMode].loopTime;//循環時間
        const reelNode = this.reelList[reelIndex];//該行slotRun
        const singleHeight = this.symbolHeight * this.reelRow[reelIndex];//單區塊高度

        const bottomSymbols = this.reelBottomSymbol[reelIndex];
        const mainSymbols = this.reelMainSymbol[reelIndex];
        const topSymbols = this.reelTopSymbol[reelIndex];
        const topPosition = new Vec3(reelNode.x, singleHeight, 0);
        const bottomPosition = new Vec3(reelNode.x, -singleHeight, 0);

        //循環轉動
        const LoopSlotRun = () => {
            //先設置下層的symbolID = 上層的symbolID
            for (let i = 0; i < bottomSymbols.length; i++) {
                bottomSymbols[i].setSymbolID(topSymbols[i].symbolID);
            }
            //設置主層的symbolID = 隨機symbolID
            for (let i = 0; i < mainSymbols.length; i++) {
                mainSymbols[i].setRandomSymbolID();
            }

            //設置上層的symbolID = 隨機symbolID
            for (let i = 0; i < topSymbols.length; i++) {
                topSymbols[i].setRandomSymbolID();
            }
            reelNode.position = topPosition;//reelNode移到上面
            tween(reelNode)
                .to(loopTime, { position: bottomPosition })
                .call(LoopSlotRun)
                .start();
        };

        //起始轉動後持續循環轉動
        tween(reelNode)
            .to(beginTime, { position: bottomPosition }, { easing: easing.backIn })
            .call(() => {
                this.blurShow(reelIndex);//顯示模糊貼圖
                LoopSlotRun();
            })
            .start();
    }

    /**
     * 停止轉動
     * @param reelIndex 哪行reel
     * @param runTime 轉動時間e
     */
    private async stopSlotRun(reelIndex: number, runTime: number, backTime: number): Promise<void> {
        return new Promise(async resolve => {
            //如果停止中就不再執行
            if (this.reelStopping[reelIndex]) {
                resolve();
                return;
            }
            this.reelStopping[reelIndex] = true;//設定該行停止中
            let isResolve = false;

            //重置reel到最上面，並回傳最下層symbol陣列
            const stopSymbolIDs = this.resultPattern[reelIndex];//該軸的結果符號
            this.resetReelToTop(reelIndex, stopSymbolIDs);

            this.blurHide(reelIndex);//模糊貼圖隱藏
            //執行停止轉動
            this.tweenSlotStop(reelIndex, runTime, backTime, () => {
                if (!isResolve) resolve();
            });

            //如果此軸不是瞇牌且不是最後一軸，則等待stopIntervalTime後就結束
            if (!this.mipieList[reelIndex] && reelIndex !== this.reelList.length - 1) {
                const stopIntervalTime = BaseConst.SLOT_TIME[dataManager().curTurboMode].stopIntervalTime;
                if (stopIntervalTime > 0) {
                    await Utils.delay(stopIntervalTime);
                }
                isResolve = true;
                resolve();
            }
        });
    }

    /**
     * 停止轉動slot
     * @param reelIndex 哪行reel
     * @param runTime 轉動時間
     * @param backTime 回彈時間
     * @param callback 完成後的callback
     */
    private tweenSlotStop(reelIndex: number, runTime: number, backTime: number, callback?: () => void) {
        const reelNode = this.reelList[reelIndex];
        tween(reelNode)
            .to(runTime, { position: new Vec3(reelNode.x, -10, 0) }, { easing: easing.cubicOut })
            .call(() => {
                SlotMachine.slotStopSound.emit(reelIndex);//發送輪軸停止音效事件
            })
            .to(backTime, { position: new Vec3(reelNode.x, 0, 0) })
            .call(async () => {
                this.reelStopped[reelIndex] = true;//設定該行完全停止

                this.showHideTopBottomNode(reelIndex, false);//隱藏上下節點
                reelNode.getChildByName(`MiNode_${reelIndex}`).active = false;//隱藏咪牌節點
                this.reelMainSymbol[reelIndex].forEach((symbol) => {
                    symbol.onStop();
                });
                //是否是最後一軸停止
                if (reelIndex === this.reelList.length - 1) {
                    this.stopMiAll();//停止咪牌
                    SlotMachine.slotRunFinish.emit();//發送轉動完成事件
                }
                callback?.();
            }).start();
    }

    /**
     * 隱藏上下節點
     * @param reelIndex 哪行reel
     * @param active 是否顯示
     */
    private showHideTopBottomNode(reelIndex: number, active: boolean): void {
        this.reelTopSymbol[reelIndex].forEach((symbol) => {
            symbol.node.active = active;
        });
        this.reelBottomSymbol[reelIndex].forEach((symbol) => {
            symbol.node.active = active;
        });
    }

    /**
     * 處理咪牌
     * @param reelIndex 哪行reel
     * @returns 輪軸停止時間和回彈時間
     */
    private handleMi(reelIndex: number): { runTime: number, backTime: number } {
        //判斷此軸是否咪牌
        if (!this.mipieList[reelIndex]) {
            //回傳正常停止時間
            const stopTime = BaseConst.SLOT_TIME[dataManager().curTurboMode].stopTime;
            return { runTime: stopTime * 0.8, backTime: stopTime * 0.2 };
        } else {
            this.isRunMi = true;//執行咪牌狀態
            SlotMachine.startMi.emit(reelIndex);//傳送該軸咪牌事件
            //回傳咪牌停止時間
            const mipieTime = BaseConst.SLOT_TIME[dataManager().curTurboMode].mipieTime;
            return { runTime: mipieTime * 0.9, backTime: mipieTime * 0.1 };
        }
    }

    /**
     * 計算，重置reel到最上面，並回傳最下層symbol陣列
     * @param reelNode 哪行reelNode
     * @param stopSymbolIDs 停止symbolID陣列(未帶值就隨機產生)
     * @returns 最下層symbol陣列
     */
    private resetReelToTop(reelIndex: number, stopSymbolIDs?: number[]) {
        const reelNode = this.reelList[reelIndex];
        const singleHeight = this.symbolHeight * this.reelRow[reelIndex];//單區塊高度
        const row1x = this.reelRow[reelIndex];//row1倍數量
        const row2x = this.reelRow[reelIndex] * 2;//row2倍數量
        Tween.stopAllByTarget(reelNode);//停止該行轉動
        //根據目前Y軸位置判斷是否需要重最上面掉落
        const curPosY = reelNode.position.y;//當前的位置
        const backNumber = Math.ceil((singleHeight - curPosY) / this.symbolHeight);//需要回推的symbol數量

        //獲取停止前最下層的symbolID(+1代表要多獲取到下層最後一個symbol)
        let bottomSymbolIDs: number[] = [];
        for (let i = 0; i < row1x; i++) {
            const idx = row2x - (backNumber - i);
            const symbolID = this.reelSymbols[reelIndex][idx].symbolID;
            bottomSymbolIDs.push(symbolID);
        }

        //設置上層的symbolID
        for (let i = 0; i < this.reelTopSymbol[reelIndex].length; i++) {
            this.reelTopSymbol[reelIndex][i].setRandomSymbolID();//上層的symbolID
        }

        //設置主層的symbolID
        for (let i = 0; i < this.reelMainSymbol[reelIndex].length; i++) {
            if (stopSymbolIDs) {
                this.reelMainSymbol[reelIndex][i].setSymbolID(stopSymbolIDs[i]);
            } else {
                this.reelMainSymbol[reelIndex][i].setRandomSymbolID();//主層的symbolID
            }
        }

        //如果此軸是瞇牌，則多顯示咪牌symbol層
        if (this.mipieList[reelIndex]) {
            //設置下層的symbolID
            for (let i = 0; i < this.reelBottomSymbol[reelIndex].length; i++) {
                this.reelBottomSymbol[reelIndex][i].setRandomSymbolID();//下層的symbolID
            }
            const miNode = reelNode.getChildByName(`MiNode_${reelIndex}`);
            miNode.active = true;
            const miNodeHeight = miNode.getComponent(UITransform)!.contentSize.height;
            const miNodeChildrenLength = miNode.children.length;
            const lastIndex = miNodeChildrenLength - row1x;//最後要設置的symbol起點索引
            for (let i = 0; i < miNodeChildrenLength; i++) {
                const symbol = miNode.children[i].getComponent(BaseSymbol);
                if (i < lastIndex) {
                    symbol.setRandomSymbolID();
                } else {
                    symbol.setSymbolID(bottomSymbolIDs[i - lastIndex]);
                }
                reelNode.position = new Vec3(reelNode.x, singleHeight + miNodeHeight, 0);//slot回歸到上面(加上咪牌高度)
            }
        } else {
            //設置下層的symbolID
            for (let i = 0; i < this.reelBottomSymbol[reelIndex].length; i++) {
                this.reelBottomSymbol[reelIndex][i].setSymbolID(bottomSymbolIDs[i]);//下層的symbolID
            }
            reelNode.position = new Vec3(reelNode.x, singleHeight, 0);//slot回歸到上面(加上偏移量)
        }
    }

    /**
     * 立即停止
     */
    public onSlotSkip() {
        // if (this.isRunMi) return;//瞇牌不能skip
        Tween.stopAllByTarget(this.node);
        this.skipUI.off(Node.EventType.TOUCH_END, this.onSlotSkip, this);
        const skipStopTime = BaseConst.SLOT_TIME[dataManager().curTurboMode].skipStopTime;
        const runTime = skipStopTime * 0.8;
        const backTime = skipStopTime * 0.2;

        for (let i = 0; i < this.reelStopped.length; i++) {
            //未完全停止的reel
            if (!this.reelStopped[i]) {
                Tween.stopAllByTarget(this.reelList[i]);//停止該行tween動畫
                if (this.reelStopping[i]) {
                    //停止中的，當前位置直接落下
                    this.tweenSlotStop(i, runTime, backTime);
                } else {
                    //未停止中的reel執行重置停止
                    this.stopSlotRun(i, runTime, backTime);//執行停止slot轉動
                }
            }
            this.mipieList[i] = false;
        }
    }
    //====================================== slot轉動流程 ======================================

    /**
     * 停止咪牌
     */
    private stopMiAll() {
        if (this.isRunMi) {
            SlotMachine.stopMi.emit();
            this.isRunMi = false;//停止咪牌狀態
        }
    }

    /**
     * 模糊貼圖顯示
     * @param reelIndex 哪行reel
     */
    private blurShow(reelIndex: number) {
        this.reelSymbols[reelIndex].forEach((symbol) => {
            symbol.blurShow();
        });
    }

    /**
     * 模糊貼圖隱藏
     * @param reelIndex 哪行reel
     */
    private blurHide(reelIndex: number) {
        this.reelSymbols[reelIndex].forEach((symbol) => {
            symbol.blurHide();
        });
    }

    //====================================== 中獎流程 ======================================

    /**
     * 中獎
     * @param winPos 
     */
    private onShowSymbolWin(winPos: number[]): void {
        // const winPos = Utils.uniq(winLineData.flatMap((data) => data.winPos)); //全部中獎位置(不重複)
        const losePos = Array.from({ length: this.allMainSymbols.length }, (_, i) => i)
            .filter(pos => !winPos.includes(pos));
        for (let i = 0; i < winPos.length; i++) {
            const winSymbol = this.allMainSymbols[winPos[i]];
            winSymbol.getComponent(BaseSymbol).symbolWin();
        }
        for (let i = 0; i < losePos.length; i++) {
            const loseSymbol = this.allMainSymbols[losePos[i]];
            loseSymbol.getComponent(BaseSymbol).symbolLose();
        }
    }

    /**
     * 取得所有主層symbol
     * @returns 所有主層symbol
     */
    public static getSymbolList(): Node[] {
        return SlotMachine.instance.allMainSymbols;
    }

    /**
     * 取得所有主層symbol位置
     * @returns 所有主層symbol位置
     */
    public static getSymbolPosList(): Vec3[] {
        return SlotMachine.instance.allMainSymbolPos;
    }
    //====================================== 中獎流程 ======================================
}