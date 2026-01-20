import { _decorator, Component, Node, tween, instantiate, UITransform, Vec3, Tween, easing, Button } from 'cc';
import { BaseSymbol } from 'db://assets/base/components/slotMachine/BaseSymbol';
import { BaseConst } from 'db://assets/base/script/data/BaseConst';
import { dataManager } from 'db://assets/base/script/data/DataManager';
import { BaseEvent } from 'db://assets/base/script/event/BaseEvent';
import { XEvent, XEvent1 } from 'db://assets/base/script/event/XEvent';
import { Utils } from 'db://assets/base/script/utils/Utils';
import { SlotMachine } from './SlotMachine';

const { ccclass, property } = _decorator;
/**
 * 老虎機
 */
@ccclass('SlotCluster')
export class SlotCluster extends Component {
    private static instance: SlotCluster;

    public static getInstance(): SlotCluster {
        return SlotCluster.instance;
    }
    /**初始化老虎機類型 */
    public static initCreatReels: XEvent = new XEvent();
    public static initResultParser: XEvent1<number[][]> = new XEvent1();
    /**開始轉動slot */
    public static slotRun: XEvent = new XEvent();

    /**
     * 建立物件
     */
    onLoad() {
        SlotCluster.initCreatReels.on(this.onInitCreatReels, this);
        SlotCluster.initResultParser.on(this.onInitResultParser, this);
        SlotCluster.slotRun.on(this.onSlotRun, this);

        BaseEvent.clickStop.on(this.onSlotSkip, this);
    }

    /**
     * 初始化建立reelNode
     */
    private onInitCreatReels() {
        const slotData = SlotMachine.getSlotData();
        //建立reelNode
        for (let i = 0; i < slotData.reelList.length; i++) {
            let reelNode = slotData.reelList[i];
            reelNode.children.forEach((child, index) => {
                const pos = new Vec3(reelNode.position.x, child.position.y, 0);
                //設置scatter層位置
                const scatterPosNode = instantiate(child);
                scatterPosNode.name = `PosNode_${i}_${index}`;
                scatterPosNode.setParent(slotData.scatterLayer);
                scatterPosNode.setPosition(pos);
                //設置勝利層位置
                const winPosNode = instantiate(child);
                winPosNode.name = `PosNode_${i}_${index}`;
                winPosNode.setParent(slotData.winLayer);
                winPosNode.setPosition(pos);
            });
        }
    }

    /**
     * 初始畫盤面符號
     * @param initParset 初始化盤面符號
     */
    private onInitResultParser(initParser: number[][]) {
        const slotData = SlotMachine.getSlotData();
        for (let i = 0; i < slotData.reelList.length; i++) {
            const reelNode = slotData.reelList[i];
            const row1x = slotData.reelRow[i];//row1倍數量
            const row2x = slotData.reelRow[i] * 2;//row2倍數量
            const row3x = slotData.reelRow[i] * 3;//row3倍數量
            reelNode.children.forEach((child, idx) => {
                if (idx > row3x - 1) return;
                const symbol = instantiate(slotData.symbolPrefab).getComponent(BaseSymbol);
                symbol.scatterLayer = slotData.scatterLayer;
                symbol.winLayer = slotData.winLayer;
                symbol.parentNode = child;
                symbol.node.setParent(child);
                if (idx < row1x) {
                    //設置上層symbol
                    slotData.reelTopSymbol[i].push(symbol);
                    slotData.reelSymbols[i].push(symbol);
                    symbol.setRandomSymbolID();
                    symbol.node.active = false;//初始隱藏
                } else if (idx < row2x) {
                    //設置主層symbol
                    slotData.reelMainSymbol[i].push(symbol);
                    slotData.reelSymbols[i].push(symbol);
                    symbol.posID = i * row1x + idx - row1x;
                    // symbol.grid = { col: i, row: idx };
                    symbol.setSymbolID(initParser[i][idx - row1x]);
                    slotData.allMainSymbols.push(symbol.node);
                    slotData.allMainSymbolPos.push(new Vec3(reelNode.x, child.position.y, 0));
                }
                else {
                    //設置下層symbol
                    slotData.reelBottomSymbol[i].push(symbol);
                    slotData.reelSymbols[i].push(symbol);
                    symbol.setRandomSymbolID();
                    symbol.node.active = false;//初始隱藏
                }
            });
        }

        //生成瞇牌用節點
        for (let i = 0; i < slotData.reelList.length; i++) {
            let reelNode = slotData.reelList[i];
            let miNode = new Node(`MiNode_${i}`);
            miNode.addComponent(UITransform);
            miNode.getComponent(UITransform)!.setContentSize(slotData.symbolWidth, slotData.symbolHeight * slotData.miNodeCount);
            miNode.getComponent(UITransform)!.anchorY = 1;
            for (let j = 0; j < slotData.miNodeCount; j++) {
                //設置咪牌節點
                const pos = new Vec3(0, -slotData.symbolHeight * j - slotData.symbolHeight / 2, 0);
                const miSymbol = instantiate(slotData.symbolPrefab).getComponent(BaseSymbol);
                miSymbol.scatterLayer = slotData.scatterLayer;
                miSymbol.winLayer = slotData.winLayer;
                miSymbol.parentNode = miNode;
                miSymbol.node.name = `Symbol_${i}_${j}`;
                miSymbol.node.setParent(miNode);
                miSymbol.node.setPosition(pos);
                slotData.reelSymbols[i].push(miSymbol);
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
    // private onBackMGParser(backMGParser: number[][]) {
    //     for (let i = 0; i < backMGParser.length; i++) {
    //         for (let j = 0; j < backMGParser[i].length; j++) {
    //             const symbol = this.slotData.reelMainSymbol[i][j];
    //             symbol.backMG(backMGParser[i][j]);
    //         }
    //     }
    // }

    //====================================== slot轉動流程 ======================================
    /**
     * 處理開始轉動slot流程
     * @param resultPattern 盤面結果
     * @param mipieList 各軸瞇牌狀態
     */
    private async onSlotRun() {
        const slotData = SlotMachine.getSlotData();

        //至少轉動spinTime秒後才發送轉動結束事件
        const spinTime = BaseConst.SLOT_TIME[dataManager().curTurboMode].spinTime;
        tween(this.node).delay(spinTime).call(() => {
            this.onSlotStop();//開始停輪
        }).start();

        //所有symbol進入spin狀態
        slotData.reelSymbols.forEach((symbols) => {
            symbols.forEach((symbol) => {
                symbol.onSpin();
            });
        });

        //監聽急停
        this.scheduleOnce(() => {
            slotData.skipUI.once(Button.EventType.CLICK, this.onSlotSkip, this);
        }, BaseConst.SLOT_TIME[dataManager().curTurboMode].beginTime);

        //開始轉動
        for (let i = 0; i < slotData.reelList.length; i++) {
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
        const slotData = SlotMachine.getSlotData();
        for (let i = 0; i < slotData.reelList.length; i++) {
            const { runTime, backTime } = this.handleMi(i);//判斷是否執行咪牌與回傳停止時間
            await this.stopSlotRun(i, runTime, backTime);
        }
    }

    /**
     * 開始轉動slot
     * @param reelIndex 哪行slot
     */
    private startSlotRun(reelIndex: number) {
        const slotData = SlotMachine.getSlotData();
        if (slotData.reelStopping[reelIndex]) return;//如果停止中就不再執行
        const beginTime = BaseConst.SLOT_TIME[dataManager().curTurboMode].beginTime;//啟動時間
        const loopTime = BaseConst.SLOT_TIME[dataManager().curTurboMode].loopTime;//循環時間
        const reelNode = slotData.reelList[reelIndex];//該行slotRun
        const singleHeight = slotData.symbolHeight * slotData.reelRow[reelIndex];//單區塊高度

        const bottomSymbols = slotData.reelBottomSymbol[reelIndex];
        const mainSymbols = slotData.reelMainSymbol[reelIndex];
        const topSymbols = slotData.reelTopSymbol[reelIndex];
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
                slotData.reelSymbols[reelIndex].forEach((symbol) => {
                    symbol.blurShow();//顯示模糊貼圖
                });
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
        const slotData = SlotMachine.getSlotData();
        return new Promise(async resolve => {
            //如果停止中就不再執行
            if (slotData.reelStopping[reelIndex]) {
                resolve();
                return;
            }
            slotData.reelStopping[reelIndex] = true;//設定該行停止中
            let isResolve = false;

            //重置reel到最上面，並回傳最下層symbol陣列
            const stopSymbolIDs = slotData.resultPattern[reelIndex];//該軸的結果符號
            this.resetReelToTop(reelIndex, stopSymbolIDs);

            //模糊貼圖隱藏
            slotData.reelSymbols[reelIndex].forEach((symbol) => {
                symbol.blurHide();
            });

            //執行停止轉動
            this.tweenSlotStop(reelIndex, runTime, backTime, () => {
                if (!isResolve) resolve();
            });

            //如果此軸不是瞇牌且不是最後一軸，則等待stopIntervalTime後就結束
            if (!slotData.mipieList[reelIndex] && reelIndex !== slotData.reelList.length - 1) {
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
        const slotData = SlotMachine.getSlotData();
        const reelNode = slotData.reelList[reelIndex];
        tween(reelNode)
            .to(runTime, { position: new Vec3(reelNode.x, -10, 0) }, { easing: easing.cubicOut })
            .call(() => {
                SlotMachine.slotStopSound.emit(reelIndex);//發送輪軸停止音效事件
            })
            .to(backTime, { position: new Vec3(reelNode.x, 0, 0) })
            .call(async () => {
                slotData.reelStopped[reelIndex] = true;//設定該行完全停止

                this.showHideTopBottomNode(reelIndex, false);//隱藏上下節點
                reelNode.getChildByName(`MiNode_${reelIndex}`).active = false;//隱藏咪牌節點
                slotData.reelMainSymbol[reelIndex].forEach((symbol) => {
                    symbol.onStop();
                });
                //是否是最後一軸停止
                if (reelIndex === slotData.reelList.length - 1) {
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
        const slotData = SlotMachine.getSlotData();
        slotData.reelTopSymbol[reelIndex].forEach((symbol) => {
            symbol.node.active = active;
        });
        slotData.reelBottomSymbol[reelIndex].forEach((symbol) => {
            symbol.node.active = active;
        });
    }

    /**
     * 處理咪牌
     * @param reelIndex 哪行reel
     * @returns 輪軸停止時間和回彈時間
     */
    private handleMi(reelIndex: number): { runTime: number, backTime: number } {
        const slotData = SlotMachine.getSlotData();
        //判斷此軸是否咪牌
        if (!slotData.mipieList[reelIndex]) {
            //回傳正常停止時間
            const stopTime = BaseConst.SLOT_TIME[dataManager().curTurboMode].stopTime;
            return { runTime: stopTime * 0.8, backTime: stopTime * 0.2 };
        } else {
            slotData.isRunMi = true;//執行咪牌狀態
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
        const slotData = SlotMachine.getSlotData();
        const reelNode = slotData.reelList[reelIndex];
        const singleHeight = slotData.symbolHeight * slotData.reelRow[reelIndex];//單區塊高度
        const row1x = slotData.reelRow[reelIndex];//row1倍數量
        const row2x = slotData.reelRow[reelIndex] * 2;//row2倍數量
        Tween.stopAllByTarget(reelNode);//停止該行轉動
        //根據目前Y軸位置判斷是否需要重最上面掉落
        const curPosY = reelNode.position.y;//當前的位置
        const backNumber = Math.ceil((singleHeight - curPosY) / slotData.symbolHeight);//需要回推的symbol數量

        //獲取停止前最下層的symbolID(+1代表要多獲取到下層最後一個symbol)
        let bottomSymbolIDs: number[] = [];
        for (let i = 0; i < row1x; i++) {
            const idx = row2x - (backNumber - i);
            const symbolID = slotData.reelSymbols[reelIndex][idx].symbolID;
            bottomSymbolIDs.push(symbolID);
        }

        //設置上層的symbolID
        for (let i = 0; i < slotData.reelTopSymbol[reelIndex].length; i++) {
            slotData.reelTopSymbol[reelIndex][i].setRandomSymbolID();//上層的symbolID
        }

        //設置主層的symbolID
        for (let i = 0; i < slotData.reelMainSymbol[reelIndex].length; i++) {
            if (stopSymbolIDs) {
                slotData.reelMainSymbol[reelIndex][i].setSymbolID(stopSymbolIDs[i]);
            } else {
                slotData.reelMainSymbol[reelIndex][i].setRandomSymbolID();//主層的symbolID
            }
        }

        //如果此軸是瞇牌，則多顯示咪牌symbol層
        if (slotData.mipieList[reelIndex]) {
            //設置下層的symbolID
            for (let i = 0; i < slotData.reelBottomSymbol[reelIndex].length; i++) {
                slotData.reelBottomSymbol[reelIndex][i].setRandomSymbolID();//下層的symbolID
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
            for (let i = 0; i < slotData.reelBottomSymbol[reelIndex].length; i++) {
                slotData.reelBottomSymbol[reelIndex][i].setSymbolID(bottomSymbolIDs[i]);//下層的symbolID
            }
            reelNode.position = new Vec3(reelNode.x, singleHeight, 0);//slot回歸到上面(加上偏移量)
        }
    }

    /**
     * 立即停止
     */
    public onSlotSkip() {
        const slotData = SlotMachine.getSlotData();
        // if (this.slotData.isRunMi) return;//瞇牌不能skip
        Tween.stopAllByTarget(this.node);
        slotData.skipUI.off(Node.EventType.TOUCH_END, this.onSlotSkip, this);
        const skipStopTime = BaseConst.SLOT_TIME[dataManager().curTurboMode].skipStopTime;
        const runTime = skipStopTime * 0.8;
        const backTime = skipStopTime * 0.2;

        for (let i = 0; i < slotData.reelStopped.length; i++) {
            //未完全停止的reel
            if (!slotData.reelStopped[i]) {
                Tween.stopAllByTarget(slotData.reelList[i]);//停止該行tween動畫
                if (slotData.reelStopping[i]) {
                    //停止中的，當前位置直接落下
                    this.tweenSlotStop(i, runTime, backTime);
                } else {
                    //未停止中的reel執行重置停止
                    this.stopSlotRun(i, runTime, backTime);//執行停止slot轉動
                }
            }
            slotData.mipieList[i] = false;
        }
    }
    //====================================== slot轉動流程 ======================================

    /**
     * 停止咪牌
     */
    private stopMiAll() {
        const slotData = SlotMachine.getSlotData();
        if (slotData.isRunMi) {
            SlotMachine.stopMi.emit();
            slotData.isRunMi = false;//停止咪牌狀態
        }
    }
}