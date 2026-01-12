import { BaseEvent } from 'db://assets/base/script/event/BaseEvent';
import { IGameResult, ISpinData } from 'db://assets/base/script/network/HttpApi';
import { taskManager } from 'db://assets/base/script/tasks/TaskManager';
import { Utils } from 'db://assets/base/script/utils/Utils';

import { GameConst, SymbolID } from 'db://assets/game/script/data/GameConst';
import { AutoSpinDelayTask } from 'db://assets/game/script/task/AutoSpinDelayTask';
import { IdleTask } from 'db://assets/game/script/task/IdleTask';
import { StopTask } from 'db://assets/game/script/task/StopTask';
import { FreeTotalWinTask } from 'db://assets/game/script/task/FreeTotalWinTask';
import { TransTask } from 'db://assets/game/script/task/TransTask';
import { UpdateFreeTimesTask } from 'db://assets/game/script/task/UpdateFreeTimesTask';
import { WinScatterTask } from 'db://assets/game/script/task/WinScatterTask';
import { WinSymbolTask } from 'db://assets/game/script/task/WinSymbolTask';
import { IWinFishData, IWinLineData } from 'db://assets/game/script/data/SlotType';
import { XEvent } from 'db://assets/base/script/event/XEvent';
import { BackMainGameTaskk } from '../task/BackMainGameTask';

/**
 * 消息處理
 */
export class MessageHandler {
    public static init: XEvent = new XEvent();

    private fgBonus1: boolean = false;//是否啟用額外免費遊戲1
    private fgBonus2: boolean = false;//是否啟用額外免費遊戲2
    private fsTotalWin: number = 0;//免費遊戲總贏分
    private freeSpinTimes: number = 0;//免費遊戲次數

    onLoad(): void {
        MessageHandler.init.on(this.initialize, this);
    }

    /**
     * 初始化
     */
    private initialize(): void {
        //監聽Spin結果
        BaseEvent.onSpinResult.on(this.parseMGResult, this);
    }

    /**
     * 接收Spin結果並開始排腳本
     * @param slotResult 結果
     */
    private parseMGResult(slotResult: ISpinData): void {
        // console.log('接收Spin結果', slotResult);
        //執行主遊戲結果
        const mainGame = slotResult.main_game;
        // console.log('======執行主遊戲結果======');
        this.handleGameResult(mainGame, false);//處理盤面停止結果流程
        this.fsTotalWin = 0;//重置免費遊戲總贏分
        this.freeSpinTimes = 0;//重置免費遊戲次數


        //如果有子遊戲，則執行子遊戲(免費遊戲)結果
        if (slotResult.get_sub_game) {
            this.fgBonus1 = false;//重置bonus狀態
            this.fgBonus2 = false;//重置bonus狀態

            //執行scatter表演
            const winScatterPos = slotResult.main_game.scatter_info.position.map((pos) => pos[0] * GameConst.REEL_ROW + pos[1]);
            const winScatterTask = new WinScatterTask();
            winScatterTask.winPos = winScatterPos;
            taskManager().addTask(winScatterTask);

            //獲得免費遊戲次數
            this.freeSpinTimes = GameConst.SCATTER_MAPPING[slotResult.main_game.scatter_info.amount];

            //執行轉場
            const transTask = new TransTask();
            transTask.freeSpinTimes = this.freeSpinTimes;
            transTask.isFirstTrans = true;
            transTask.wildMultiplier = 1;
            taskManager().addTask(transTask);

            //執行子遊戲(免費遊戲)結果
            slotResult.sub_game.game_result.forEach((subGame, index) => {
                this.freeSpinTimes--;  // 免費遊戲次數-1
                const updateFreeTimesTask = new UpdateFreeTimesTask();
                updateFreeTimesTask.freeSpinTimes = this.freeSpinTimes;
                taskManager().addTask(updateFreeTimesTask);

                // console.log('======執行子遊戲結果======');
                this.handleGameResult(subGame, true);
                //如果剩餘免費遊戲次數為0，則判斷是否表演retrigger
                if (this.freeSpinTimes === 0) {
                    this.handleRetrigger(subGame);
                }
            });

            //FG結算
            const freeTotalWinTask = new FreeTotalWinTask();
            freeTotalWinTask.totalWin = slotResult.sub_game.pay_credit_total;//FG中獎總金額
            freeTotalWinTask.backMGParser = slotResult.main_game.game_result;
            freeTotalWinTask.totalFreeSpinTimes = slotResult.sub_game.game_result.length;
            taskManager().addTask(freeTotalWinTask);

            //返回MG
            const backMainGameTask = new BackMainGameTaskk();
            backMainGameTask.userCredit = slotResult.user_credit;
            taskManager().addTask(backMainGameTask);
        }
        // console.log('======回到待機======');
        taskManager().addTask(new AutoSpinDelayTask());
        taskManager().addTask(new IdleTask());
    }

    /**
    * 處理盤面停止結果
    * @param gameResult 盤面結果
    * @param isSubGame 是否子遊戲(免費遊戲)
    */
    private handleGameResult(gameResult: IGameResult, isSubGame: boolean = false): void {
        //執行盤面停止
        const stopTask = new StopTask();
        stopTask.resultPattern = gameResult.game_result;
        stopTask.scatterInfo = gameResult.scatter_info;
        taskManager().addTask(stopTask);

        //是否表演額外加次數(釣起靴子)
        if (gameResult.extra?.no_m_add_spin) {
            // const hookCatchTask = new HookCatchTask();
            // taskManager().addTask(hookCatchTask);

            //更新免費遊戲次數
            this.freeSpinTimes += 1;// 免費遊戲次數+1
            const updateFreeTimesTask = new UpdateFreeTimesTask();
            updateFreeTimesTask.freeSpinTimes = this.freeSpinTimes;
            taskManager().addTask(updateFreeTimesTask);
        }

        //子遊戲漁夫與魚的表演資料
        let winFishData: IWinFishData = null;
        if (isSubGame && gameResult.extra?.wild_pos) {
            const flatResult = gameResult.game_result.flat();//盤面結果扁平化
            const allFishPos: number[] = [];
            const fishSymbolIDs: number[] = [];
            flatResult.forEach((symbolID, index) => {
                if (symbolID >= SymbolID.F1 && symbolID <= SymbolID.F8) {
                    allFishPos.push(index);
                    fishSymbolIDs.push(symbolID);
                }
            });
            const allWildPos = gameResult.extra?.wild_pos.map((pos) => pos[0] * GameConst.REEL_ROW + pos[1]);
            winFishData = {
                allWildPos,
                allFishPos,
                fishSymbolIDs,
                totalWildCount: gameResult.extra?.total_wild_count
            };
        }

        //中獎線資料
        let winLineData: IWinLineData[] = [];//此盤面細部中獎資料
        if (gameResult.pay_line.length > 0) {
            //轉換中獎線資料
            gameResult.pay_line.forEach((payLine) => {
                const data = Utils.getLinePathPosition(payLine.pay_line, payLine.amount, gameResult.game_result, GameConst.payLineData);
                winLineData.push({
                    payLineID: payLine.pay_line,
                    winPos: data.winPos,
                    winSymbolIDs: data.winSymbolIDs,
                    payCredit: payLine.pay_credit
                });
            });
        }

        //表演中獎流程
        const winTask = new WinSymbolTask();
        winTask.winLineData = winLineData;
        winTask.winFishData = winFishData;
        winTask.isSubGame = isSubGame;
        winTask.curFsTotalWin = this.fsTotalWin;
        winTask.payCreditTotal = gameResult.pay_credit_total;
        taskManager().addTask(winTask);
        this.fsTotalWin += gameResult.pay_credit_total;//累計免費遊戲總贏分
    }

    /**
     * 處理額外免費遊戲retrigger
     * @param subGame 免費遊戲結果
     */
    private handleRetrigger(subGame: IGameResult): void {
        //如果wild次數大於等於4，且未啟用第一個bouns，則表演額外加10次，倍率變2倍
        if (subGame.extra.total_wild_count >= 4 && this.fgBonus1 === false) {
            //執行轉場
            const transTask = new TransTask();
            transTask.freeSpinTimes = 10;
            transTask.isFirstTrans = false;
            transTask.wildMultiplier = 2;
            taskManager().addTask(transTask);
            this.fgBonus1 = true;//已啟用第一個bouns

            //更新免費遊戲次數
            this.freeSpinTimes += 10;// 免費遊戲次數+10
            const updateFreeTimesTask = new UpdateFreeTimesTask();
            updateFreeTimesTask.wildMultiplier = 2;
            updateFreeTimesTask.freeSpinTimes = this.freeSpinTimes;
            taskManager().addTask(updateFreeTimesTask);

        } else if (subGame.extra.total_wild_count >= 8 && this.fgBonus2 === false) {
            //執行轉場
            const transTask = new TransTask();
            transTask.freeSpinTimes = 10;
            transTask.isFirstTrans = false;
            transTask.wildMultiplier = 4;
            taskManager().addTask(transTask);
            this.fgBonus2 = true;//已啟用第二個bouns

            //更新免費遊戲次數
            this.freeSpinTimes += 10;// 免費遊戲次數+10
            const updateFreeTimesTask = new UpdateFreeTimesTask();
            updateFreeTimesTask.wildMultiplier = 4;
            updateFreeTimesTask.freeSpinTimes = this.freeSpinTimes;
            taskManager().addTask(updateFreeTimesTask);
        }
    }
}