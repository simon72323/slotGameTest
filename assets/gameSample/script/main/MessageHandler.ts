// import { CHEAT } from 'cc/userland/macro';
// import { BaseDataManager } from 'db://assets/base/script/main/BaseDataManager';
// import { BaseEvent } from 'db://assets/base/script/main/BaseEvent';
// import { DelayTask } from 'db://assets/base/script/tasks/DelayTask';
// import { TaskManager } from 'db://assets/base/script/tasks/TaskManager';
// import { ModuleID } from 'db://assets/base/script/types/BaseType';
// import { XUtils } from 'db://assets/base/script/utils/XUtils';
// import { SlotMachine2 } from '../../components/slotMachine2/base/slotMachine2/SlotMachine2';
// import { GameConst, SlotMachineID, SymbolID } from '../constant/GameConst';

// import { BackBSSettleTask } from '../task/BackBSSettleTask';
// import { DropTask } from '../task/DropTask';
// import { EndGameTask } from '../task/EndGameTask';
// import { ExplodeTask } from '../task/ExplodeTask';
// import { FSSettleTask } from '../task/FSSettleTask';
// import { FSUpdateRemainTimesTask } from '../task/FSUpdateRemainTimesTask';
// import { IdleTask } from '../task/IdleTask';
// import { RetriggerTask } from '../task/RetriggerTask';
// import { ScatterWinTask } from '../task/ScatterWinTask';
// import { ShowWinTask } from '../task/ShowWinTask';
// import { SpinTask } from '../task/SpinTask';
// import { StopTask } from '../task/StopTask';
// import { TransTask } from '../task/TransTask';
// import { gameData } from './GameData';
// import { XEvent1 } from 'db://assets/base/script/utils/XEvent';
// /**
//  * 消息處理
//  */
// export class MessageHandler {
//   public static fakeData: XEvent1<string> = new XEvent1();
//   private static instance: MessageHandler;
//   public static getInstance(): MessageHandler {
//     if (!MessageHandler.instance) {
//       MessageHandler.instance = new MessageHandler();
//     }
//     return MessageHandler.instance;
//   }

//   private fakeData: string = '';

//   /**
//    * 初始化
//    */
//   public initialize(): void {
//     BaseEvent.onResultRecall.on(this.onResultRecallMessage, this);
//     MessageHandler.fakeData.on((data) => {
//       this.fakeData = data;
//     }, this);
//   }

//   /**
//    * 結果回呼消息處理
//    * @param message
//    */
//   private onResultRecallMessage(message: s5g.game.proto.ResultRecall): void {
//     //有debug功能才使用自定義資料
//     if (CHEAT) {
//       if (this.fakeData) {
//         message = s5g.game.proto.ResultRecall.fromObject(JSON.parse(this.fakeData));
//       }
//       const msgStr = JSON.stringify(message);
//       console.log(msgStr); //spin回傳資料
//       this.fakeData = '';
//     }
//     this.parseBSResult(message.result, message.cur_module_total_times - message.cur_module_play_times);
//   }

//   /**
//    * 要求Spin結果成功開始排腳本
//    * @param slotResult
//    * @param fsRemainTimes
//    */
//   public parseBSResult(slotResult: s5g.game.proto.ISlotResult, fsRemainTimes: number = -1): void {
//     const baseDataManager = BaseDataManager.getInstance();
//     baseDataManager.setState(s5g.game.proto.ESTATEID.K_SPINSTOPING); //狀態:轉軸停止中
//     const isBS = baseDataManager.isBS();

//     //過程計算加總用(右下角win用)
//     if (isBS) baseDataManager.winTotal = 0;
//     let sumWin: number = baseDataManager.winTotal;
//     let sumPlayerCent: number = baseDataManager.playerCent;

//     let winPos: number[]; //中獎位置
//     let winPosList: number[][]; //中獎位置列表
//     let winSymbolID: number[]; //中獎符號 ID
//     let winSymbolCredit: number[]; //中獎符號金額
//     let planeWin: number; //此盤面中獎金額
//     let planeOriginalWin: number; //此盤面尚未乘上倍率金額
//     let isMaxWin = false;

//     //把第一盤和N盤結果合併, 取用資料時再決定轉型成SlotResult或SubResult
//     const allResult = slotResult.sub_result ? [slotResult, ...slotResult.sub_result] : [slotResult];

//     //獲得額外局數
//     const winBonusGroup = slotResult.win_bonus_group;
//     const getExtraTimes = winBonusGroup && winBonusGroup.length > 0 ? winBonusGroup[0].times : 0;

//     //盤面資料
//     let preSymbolPattern: number[];
//     let newSymbolPattern: number[];
//     let scatterCount: number = 0; //目前盤面出現的scatter數量
//     let superScatterCount: number = 0; //目前盤面出現的超級scatter數量
//     let saveScatterCount: number = 0; //紀錄已出現的scatter數量
//     let lastMultiplierList: number[] = Array(gameData().REEL_COL * gameData().REEL_ROW).fill(0); //紀錄最後一盤的倍率分布

//     //總共幾盤
//     let numResult: number = allResult.length;
//     for (let msgResultIndex = 0; msgResultIndex < numResult; msgResultIndex++) {
//       //盤面起始倍數
//       let temp = allResult[msgResultIndex];
//       const subResult = temp as s5g.game.proto.SlotResult.SubResult;
//       const isSubResult = subResult.sub_game_id !== undefined;
//       const multiplierLayout = slotResult.multiplier_info.layouts[msgResultIndex];
//       const nextMultiplierLayout = slotResult.multiplier_info.layouts[msgResultIndex + 1];

//       //是否達到最大贏分(只剩一盤才能看外層的is_win_capped)
//       isMaxWin = msgResultIndex === numResult - 1 ? slotResult.is_win_capped : false;

//       winPos = []; //中獎位置
//       winPosList = []; //中獎位置列表
//       winSymbolID = []; //中獎符號 ID
//       winSymbolCredit = []; //中獎符號金額

//       //第幾個subResult(allResult[0]是SlotResult)
//       const subIdx = msgResultIndex - 1;
//       preSymbolPattern = newSymbolPattern || [];
//       //取得新盤面
//       newSymbolPattern = isSubResult ? slotResult.total_star_times[subIdx].times : slotResult.full_symbol_pattern;
//       //取得新盤面中的scatter數量
//       scatterCount = newSymbolPattern.filter(
//         (symbolID) => symbolID === SymbolID.Scatter || symbolID === SymbolID.SuperScatter,
//       ).length;
//       superScatterCount = newSymbolPattern.filter((symbolID) => symbolID === SymbolID.SuperScatter).length;
//       //是否為scatter中獎
//       const isScatterWin = scatterCount >= GameConst.BONUS_WIN_COUNT && msgResultIndex == allResult.length - 1;

//       //中獎線群組資料
//       const winLineGroupList = isSubResult ? subResult.win_line_group : slotResult.win_line_group;
//       //篩選出普通中獎線（排除 Scatter 符號）
//       const normalWinLineList = winLineGroupList.filter(
//         (winLineGroup) =>
//           winLineGroup.symbol_id !== SymbolID.Scatter && winLineGroup.symbol_id !== SymbolID.SuperScatter,
//       );

//       // 如果有普通中獎線
//       if (normalWinLineList && normalWinLineList.length > 0) {
//         planeWin = 0; // 重置盤面中獎金額
//         planeOriginalWin = 0; // 重置原始中獎金額（未乘倍率）

//         // 遍歷每條普通中獎線
//         normalWinLineList.forEach((winLineGroup) => {
//           winPos = winPos.concat(winLineGroup.pos); // 合併中獎位置到 winPos 陣列
//           winSymbolID.push(winLineGroup.symbol_id); // 加入中獎符號 ID
//           winSymbolCredit.push(winLineGroup.credit); // 加入中獎符號金額
//           planeOriginalWin += winLineGroup.credit; // 累加原始中獎金額
//           planeWin += winLineGroup.credit_long; // 累加盤面中獎金額（長整數格式）
//         });
//       }

//       winPos = XUtils.uniq(winPos); //去除重複位置
//       const errorWinPos = winPos.filter((pos, idx, arr) => pos % 10 > gameData().REEL_COL); //檢查個位數是否>reel_col
//       if (errorWinPos.length > 0) {
//         throw new Error('winPos異常!!');
//       }

//       //首次停輪
//       if (!isSubResult) {
//         //更新剩餘次數
//         if (baseDataManager.isBS() === false) {
//           let fsTask = new FSUpdateRemainTimesTask();
//           fsTask.fsRemainTimes = --gameData().fsRemainTimes;
//           TaskManager.getInstance().addTask(fsTask);
//         }

//         //因為要處理輪帶金框, 只有第一轉設定, 否則slotParser內的資料會被子盤面覆蓋
//         let stripTable: number[][] = [];
//         for (let i = 0; i < gameData().REEL_COL; i++) {
//           stripTable[i] = [];
//           for (let j = 0; j < gameData().REEL_ROW; j++) {
//             stripTable[i].push(newSymbolPattern[j * gameData().REEL_COL + i]);
//           }
//         }

//         let rngList = Array(gameData().REEL_COL).fill(1);
//         gameData().slotParser.setStripTable(stripTable, rngList, newSymbolPattern);
//         gameData().slotParser.buyFS = baseDataManager.buyFs;
//         SlotMachine2.changeStrip.emit(SlotMachineID.BS, gameData().slotParser);

//         //記錄當前rng
//         gameData().curRng = rngList;

//         const stop = new StopTask();
//         stop.newSymbolPattern = newSymbolPattern;
//         //第一盤就中FS, 如果還有得分的話要在掉落後的盤面處理
//         stop.isScatterWin = isScatterWin;
//         stop.isLastPlane = msgResultIndex === allResult.length - 1;
//         TaskManager.getInstance().addTask(stop);
//       } else {
//         //處裡子遊戲結果掉落
//         const drop: DropTask = new DropTask();
//         drop.preSymbolPattern = preSymbolPattern;
//         drop.newSymbolPattern = newSymbolPattern; //下一盤的結果
//         drop.isScatterWin = isScatterWin;
//         drop.isLastPlane = msgResultIndex === allResult.length - 1;
//         TaskManager.getInstance().addTask(drop);
//       }

//       let waitTime = 0.1;
//       //判斷scatter數量是否有增加
//       if (scatterCount > saveScatterCount) {
//         saveScatterCount = scatterCount; //更新已出現的scatter數量
//         waitTime = 0.2;
//       }
//       TaskManager.getInstance().addTask(new DelayTask(waitTime)); //有新的scatter出現時要停留久一點

//       // 有贏分資料才演示後續
//       if (winPos && winPos.length > 0) {
//         //中獎線
//         const winTask = new ShowWinTask();
//         winTask.planeWin = planeWin;
//         winTask.winPos = winPos;
//         winTask.winLineList = normalWinLineList;
//         winTask.multiplierLayout = multiplierLayout;
//         winTask.winSymbolID = winSymbolID;
//         winTask.winSymbolCredit = winSymbolCredit;
//         winTask.sumWin = sumWin + planeWin; //還不能真的加入
//         winTask.chrLevel = msgResultIndex + 1;
//         winTask.playerCent = sumPlayerCent + planeWin * baseDataManager.bet.getCurRate(); //還不能真的加入
//         winTask.isMaxWin = isMaxWin;
//         TaskManager.getInstance().addTask(winTask);

//         //如果達到最大倍數，則直接跳出
//         if (isMaxWin) {
//           break;
//         }

//         //計算累計連線分數用(還不會真的更新到baseDataManager)
//         sumWin += planeWin;
//         sumPlayerCent += planeWin * baseDataManager.bet.getCurRate();

//         //爆炸
//         const explode = new ExplodeTask();
//         explode.winPos = winPos;
//         explode.nextMultiplierLayout = nextMultiplierLayout;
//         explode.win = planeWin;
//         explode.sumWin = sumWin;
//         explode.playerCent = sumPlayerCent;
//         TaskManager.getInstance().addTask(explode);

//         //更新最後一盤的倍率分布
//         const posIdList = winPos.map((pos) => XUtils.posToPosID(pos, gameData().REEL_ROW));
//         posIdList.forEach((posId) => {
//           if (lastMultiplierList[posId] === 0) {
//             lastMultiplierList[posId] = 1;
//           } else {
//             lastMultiplierList[posId] *= 2;
//           }
//         });
//       }
//     }

//     //因為有maxWin的關係, 不能每個planeWin都加入, 改成一轉結束再加入整個spinWin(spinWin會受到maxWin限制)
//     let spinWin = XUtils.convertToLong(slotResult.credit);
//     baseDataManager.winTotal += spinWin;
//     baseDataManager.playerCent += spinWin * baseDataManager.bet.getCurRate();

//     //一轉結束
//     const end = new EndGameTask();
//     end.win = spinWin;
//     end.isMaxWin = isMaxWin;
//     end.playerCent = baseDataManager.playerCent;
//     end.chrLevel = allResult.length - 1;
//     TaskManager.getInstance().addTask(end);

//     //等待下一轉任務
//     TaskManager.getInstance().addTask(new DelayTask(0.2));

//     // gameData().fsWin += spinWin;

//     //BS:檢查是否要進FS
//     if (baseDataManager.curModuleID === ModuleID.BS) {
//       //進入FS
//       if (baseDataManager.nextModuleID !== ModuleID.BS) {
//         const scatterWin = new ScatterWinTask();
//         scatterWin.bsMultiplier = lastMultiplierList;
//         scatterWin.symbolPattern = newSymbolPattern;
//         scatterWin.isSuperWin = superScatterCount > 0;
//         TaskManager.getInstance().addTask(scatterWin);

//         gameData().resetFS();
//         gameData().fsRemainTimes =
//           slotResult.win_bonus_group && slotResult.win_bonus_group.length > 0 ? slotResult.win_bonus_group[0].times : 0;

//         //轉場
//         const trans = new TransTask();
//         trans.to = baseDataManager.nextModuleID;
//         trans.times = gameData().fsRemainTimes;
//         trans.superScatterCount = superScatterCount;
//         TaskManager.getInstance().addTask(trans);

//         baseDataManager.setState(s5g.game.proto.ESTATEID.K_FEATURE_WAIT_START);
//         baseDataManager.buyFs = false;
//         const task = new SpinTask();
//         TaskManager.getInstance().addTask(task);
//       }
//       //相同模式
//       else {
//         // TaskManager.getInstance().addTask(new AutoSpinDelayTask());
//         TaskManager.getInstance().addTask(new IdleTask());
//       }
//     }
//     //FS
//     else {
//       //FS獲得局數
//       if (getExtraTimes > 0) {
//         const task = new RetriggerTask();
//         task.from = gameData().fsRemainTimes;
//         task.to = gameData().fsRemainTimes + getExtraTimes;
//         gameData().fsRemainTimes += getExtraTimes;
//         TaskManager.getInstance().addTask(task);
//       }
//       //返回BS
//       if (baseDataManager.nextModuleID === ModuleID.BS) {
//         // 在最後一轉結束後，延遲 1 秒再顯示結算畫面
//         // TaskManager.getInstance().addTask(new DelayTask(1));

//         const settle = new FSSettleTask();
//         settle.win = baseDataManager.winTotal;
//         TaskManager.getInstance().addTask(settle);

//         const backBSSettle = new BackBSSettleTask();
//         backBSSettle.sumWin = baseDataManager.winTotal;
//         backBSSettle.playerCent = baseDataManager.playerCent;
//         TaskManager.getInstance().addTask(backBSSettle);

//         TaskManager.getInstance().addTask(new IdleTask());
//       }
//       //繼續FS下一轉
//       else {
//         const task = new SpinTask();
//         TaskManager.getInstance().addTask(task);
//       }
//     }
//   }
// }
