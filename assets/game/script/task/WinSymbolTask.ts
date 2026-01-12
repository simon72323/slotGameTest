import { Tween, tween, Vec3 } from 'cc';
import { SettingsBetInfo } from 'db://assets/base/components/settingsController/SettingsBetInfo';
import { SlotMachine } from 'db://assets/base/components/slotMachine/SlotMachine';
import { BaseConst } from 'db://assets/base/script/data/BaseConst';
import { BetData } from 'db://assets/base/script/data/BetData';
import { dataManager } from 'db://assets/base/script/data/DataManager';
import { BaseEvent } from 'db://assets/base/script/event/BaseEvent';
import { audioManager } from 'db://assets/base/script/manager/AudioManager';
import { GameTask } from 'db://assets/base/script/tasks/GameTask';
import { BigWinType } from 'db://assets/base/script/types/BaseType';
import { Utils } from 'db://assets/base/script/utils/Utils';

import { BigWinUI } from 'db://assets/game/components/BigWinUI/BigWinUI';
import { CharacterUI } from 'db://assets/game/components/CharacterUI/CharacterUI';
import { ReelBlackUI } from 'db://assets/game/components/ReelBlackUI/ReelBlackUI';
import { Symbol } from 'db://assets/game/components/Symbol/Symbol';
import { WinScoreUI } from 'db://assets/game/components/WinScoreUI/WinScoreUI';
import { AudioKey } from 'db://assets/game/script/data/AudioKey';
import { FISH_ODDS } from 'db://assets/game/script/data/GameConst';
import { IWinFishData, IWinLineData } from 'db://assets/game/script/data/SlotType';


/**
 * 顯示贏分
 */
export class WinSymbolTask extends GameTask {
    protected name: string = 'WinSymbolTask';
    /**中線資料 */
    public winLineData: IWinLineData[];
    /**漁夫與魚的表演資料 */
    public winFishData: IWinFishData;
    /**賠付金額 */
    public payCreditTotal: number;
    /**免費遊戲總贏分 */
    public curFsTotalWin: number;
    /**是否子遊戲資料(免費遊戲) */
    public isSubGame: boolean = false;

    private moveTime: number = 0.4;//移動時間
    private moveIntervalTime: number = 0.3;//移動間隔時間

    private loopData: {} = {};

    async execute(): Promise<void> {
        //處理魚與漁夫表演
        if (this.winFishData) {
            await this.showWinFish();
        }

        //如果沒有贏分，則直接結束
        if (this.payCreditTotal <= 0) {
            this.complete();
            return;
        }

        CharacterUI.win.emit();//表演角色贏分動態
        audioManager().playSound(AudioKey.win);//播放獲得分數音效

        //處裡中獎線
        if (this.winLineData.length > 0) {
            ReelBlackUI.show.emit(); //壓黑
            const allWinPos = Utils.uniq(this.winLineData.flatMap((data) => data.winPos)); //全部中獎位置(不重複)
            this.showWinLine(allWinPos);//表演全部中線

            //監聽停止中獎線輪播(StopTask會觸發此事件)
            BaseEvent.stopLineLoop.once(() => {
                CharacterUI.idle.emit();//表演角色idle動態
                WinScoreUI.hideWin.emit();//立即隱藏贏得分數
                Tween.stopAllByTarget(this.loopData);
            }, this);

        } else {
            WinScoreUI.showWin.emit(this.payCreditTotal);
        }

        if (this.isSubGame) {
            const finalFsTotalWin = this.curFsTotalWin + this.payCreditTotal;
            SettingsBetInfo.refreshWin.emit(this.curFsTotalWin, finalFsTotalWin);//更新公版分數
        } else {
            SettingsBetInfo.refreshWin.emit(0, this.payCreditTotal);//更新公版分數
            //非子遊戲資料才更新玩家餘額
            const finalCredit = dataManager().userCredit + this.payCreditTotal;
            SettingsBetInfo.refreshCredit.emit(finalCredit);
            dataManager().userCredit = finalCredit;
        }

        await Utils.delay(BaseConst.SLOT_TIME[dataManager().curTurboMode].showWinTime);

        //判斷bigWin額外演示
        if (dataManager().getBigWinTypeByValue(this.payCreditTotal) !== BigWinType.non) {
            await this.waitForBigWinComplete();
        }

        this.complete();
    }

    /**等待BigWin完成 */
    private waitForBigWinComplete(): Promise<void> {
        return new Promise<void>((resolve) => {
            BigWinUI.complete.once(() => {
                resolve();
            }, this);
            BigWinUI.show.emit(this.payCreditTotal);
        });
    }

    /**
     * 漁夫與魚的表演
     */
    private async showWinFish(): Promise<void> {
        const { allWildPos } = this.winFishData;

        //==========表演間隔時間模式
        // const wildWaitTime: number = 0.4;//漁夫表演等待時間
        // let promiseList: Promise<void>[] = [];
        // for (let i = 0; i < allWildPos.length; i++) {
        //     promiseList.push(this.wildScoreMove(i));
        //     await Utils.delay(wildWaitTime);//漁夫表演間隔時間
        // }
        // await Promise.all(promiseList);

        //=======漁夫個別表演模式
        for (let i = 0; i < allWildPos.length; i++) {
            CharacterUI.win.emit();
            await this.wildScoreMove(i);
        }
    }

    /**
     * wild分數移動與變化
     * @param wildIndex wild索引
     */
    private async wildScoreMove(wildIndex: number): Promise<void> {
        return new Promise(async (resolve) => {
            let promiseList: Promise<void>[] = [];
            let wildScore = 0;//紀錄wild分數變化
            const { allWildPos, allFishPos, fishSymbolIDs, totalWildCount } = this.winFishData;
            const wildSymbolNode = SlotMachine.getSymbolList()[allWildPos[wildIndex]];
            const wildPos: Vec3 = SlotMachine.getSymbolPosList()[allWildPos[wildIndex]];
            const wildSymbol = wildSymbolNode.getComponent('Symbol') as Symbol;
            wildSymbol.symbolWin();
            for (let i = 0; i < allFishPos.length; i++) {
                const betCredit = BetData.getBetTotal();
                const fishScore = FISH_ODDS[fishSymbolIDs[i]] * betCredit;
                const fishPos: Vec3 = SlotMachine.getSymbolPosList()[allFishPos[i]];
                wildScore += fishScore;
                promiseList.push(this.moveScore(fishScore, fishPos, wildPos, wildSymbol, wildScore));
                await Utils.delay(this.moveIntervalTime);
            }
            await Promise.all(promiseList);
            if (wildScore > 0) {
                await wildSymbol.wildScoreFinish(wildScore);
                await Utils.delay(0.4);
            }
            resolve();
        });
    }

    /**
     * 移動分數
     * @param fishScore 魚分數
     * @param fishPos 魚位置
     * @param wildPos wild位置
     * @param wildSymbol wild節點
     * @param wildScore wild分數
     */
    private async moveScore(fishScore: number, fishPos: Vec3, wildPos: Vec3, wildSymbol: Symbol, wildScore: number): Promise<void> {
        await Utils.delay(this.moveTime);
        wildSymbol.showWildScore(wildScore);
    }

    /**
     * 顯示全部中線(輪播)
     * @param allWinPos 
     */
    private showWinLine(allWinPos: number[]): void {
        Tween.stopAllByTarget(this.loopData);

        let winPosResult: number[][] = [allWinPos, ...this.winLineData.map((data) => data.winPos)];
        let chainTween = tween();
        for (let i = 0; i < winPosResult.length; i++) {
            chainTween = chainTween
                .call(() => {
                    SlotMachine.showSymbolWin.emit(winPosResult[i]);
                    if (i === 0) {
                        WinScoreUI.showWin.emit(this.payCreditTotal);
                    }
                })
                .delay(BaseConst.SLOT_TIME[dataManager().curTurboMode].showWinTime);
        }
        tween(this.loopData)
            .repeatForever(chainTween)
            .start();
    }

    /**完成 */
    async complete(): Promise<void> {
        //如果沒有中獎線，則等待一下時間
        if (this.winLineData.length === 0) {
            await Utils.delay(BaseConst.SLOT_TIME[dataManager().curTurboMode].waitNextSpinTime);
        }
        this.finish();
    }

    update(deltaTime: number): void {
        // throw new Error('Method not implemented.');
    }
}