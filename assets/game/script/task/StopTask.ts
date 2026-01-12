import { SettingsController } from 'db://assets/base/components/settingsController/SettingsController';
import { SlotMachine } from 'db://assets/base/components/slotMachine/SlotMachine';
import { dataManager } from 'db://assets/base/script/data/DataManager';
import { BaseEvent } from 'db://assets/base/script/event/BaseEvent';
import { ISymbolInfo } from 'db://assets/base/script/network/HttpApi';
import { GameTask } from 'db://assets/base/script/tasks/GameTask';

import { ReelBlackUI } from 'db://assets/game/components/ReelBlackUI/ReelBlackUI';
import { GameConst, SymbolID } from 'db://assets/game/script/data/GameConst';
import { audioManager } from 'db://assets/base/script/manager/AudioManager';
import { AudioKey } from '../data/AudioKey';

/**
 * 老虎機停輪
 */
export class StopTask extends GameTask {
    protected name: string = 'StopTask';

    /**盤面停止符號(二維陣列) */
    public resultPattern: number[][];
    /**盤面停止符號(拷貝resultPattern) */
    private stopResultPattern: number[][];
    /**免費遊戲次數 */
    public freeSpinTimes: number;
    /**scatter資訊 */
    public scatterInfo: ISymbolInfo;

    execute(): void {
        ReelBlackUI.hide.emit();//隱藏壓黑
        BaseEvent.stopLineLoop.emit();//停止中獎線輪播
        this.stopResultPattern = this.resultPattern.map(row => [...row]);

        //是否表演釣scatter(40%機率)
        // let isCatchScatter: boolean = false;
        /**如果購買免費遊戲可釣起scatter，則isBuyFg重置為false */
        if (GameConst.buyFgCatchScatter) {
            dataManager().isBuyFg = false;//購買免費遊戲重置為false
        }

        dataManager().isBuyFg = false;//購買免費遊戲重置為false
        const mipieList = this.getMipieList();//獲取該次咪牌狀態
        SlotMachine.slotRun.emit(this.stopResultPattern, mipieList);//開始轉動盤面
        SettingsController.setEnabled.emit(false);//公版規定, 停盤後Spin按鈕禁用

        //監聽輪軸停止音效
        SlotMachine.slotStopSound.on((reelIndex: number) => {
            audioManager().playOnceSound(AudioKey.reelStop);//播放輪軸停止音效
        }, this);

        //監聽轉動結束
        SlotMachine.slotRunFinish.once(() => {
            this.complete();
        }, this);
    }

    /**
     * 完成
     */
    private complete(): void {
        SlotMachine.slotStopSound.off(this);
        this.finish();
    }

    /**
     * 獲取該次咪牌狀態
     * @returns 
     */
    public getMipieList(): boolean[] {
        let mipieList: boolean[] = [];
        let scatterCount: number = 0;
        for (let col: number = 0; col < GameConst.REEL_COL; col++) {
            mipieList.push(scatterCount >= GameConst.SCATTER_WIN_COUNT - 1);
            for (let row: number = 0; row < GameConst.REEL_ROW; row++) {
                let symbolID = this.stopResultPattern[col][row];
                if (symbolID === SymbolID.Scatter) {
                    scatterCount++;
                }
            }
        }
        return mipieList;
    }

    update(deltaTime: number): void {
        // throw new Error('Method not implemented.');
    }
}