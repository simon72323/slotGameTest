import { IGameData } from 'db://assets/base/script/network/HttpApi';
import { Utils } from 'db://assets/base/script/utils/Utils';

/**
 * 下注相關資料
 */
export class BetData {
    /** 當前下注索引 */
    public static betIdx: number = 1;
    /** 當前線注索引 */
    public static lineIdx: number = 0;
    /** 遊戲數據引用 */
    public static gameData: IGameData;
    /** 當前下注額 */
    public static coinValue: number = 0;

    //================ 下注相關資料 ======================

    /**
     * 獲取總下注金額
     * @returns 總下注金額(總線數 x 下注值 x 線注)
     */
    public static getBetTotal(): number {
        //當前下注額 x 線注
        const curBetXCurLine = Utils.accMul(this.coinValue, this.getLineBet());
        //總線數 x 當前下注額 x 線注
        const betTotal = Utils.accMul(this.gameData.line_total, curBetXCurLine);
        return betTotal;
    }

    /**
    * 獲取當前下注額
    * @returns 當前下注額
    */
    public static getCoinValue(): number {
        return this.coinValue;
    }

    /**
     * 獲取線注
     * @returns 線注
     */
    public static getLineBet(): number {
        return this.gameData.line_bet[this.lineIdx];
    }

    /**
     * 獲取總線數
     * @returns 
     */
    public static getLineTotal(): number {
        return this.gameData.line_total;
    }

    /**
     * 取得免費遊戲總購買金額(免費遊戲購買倍率 x 總下注)
     * @returns 
     */
    public static getBuyFeatureTotal(): number {
        const multiple = this.gameData.buy_spin.multiplier;
        const totalBuy = multiple * this.getBetTotal();//總購買金額
        return totalBuy;
    }

    /**
     * 改變下注並回傳下注值
     * @param changeValue 改變值（正數為增加，負數為減少）
     */
    public static getChangeBetValue(changeValue: number): number {
        this.betIdx += changeValue;
        const length = this.gameData.coin_value.length;
        const betIdxMin = this.gameData.bet_available_idx;

        if (changeValue > 0) {
            // 增加下注
            if (this.betIdx >= length) {
                this.betIdx = betIdxMin;
            }
        } else {
            // 減少下注
            if (this.betIdx < betIdxMin) {
                this.betIdx = length - 1;
            }
        }

        // 更新下注值
        this.coinValue = this.gameData.coin_value[this.betIdx];
        return this.coinValue;
    }

    /**
     * 增加下注
     */
    public static plus(): void {
        this.betIdx = Math.min(this.betIdx + 1, this.gameData.coin_value.length - 1);
    }

    /**
     * 減少下注
     */
    public static less(): void {
        this.betIdx = Math.max(this.betIdx - 1, 0);
    }

    /**
     * 取得加下注按鈕是否可用
     * @returns 
     */
    public static getPlusEnabled(): boolean {
        return this.betIdx < this.gameData.coin_value.length - 1;
    }

    /**
     * 取得減下注按鈕是否可用
     * @returns 
     */
    public static getLessEnabled(): boolean {
        return this.betIdx > 0;
    }

    /**
     * 取得贏錢倍數
     * @param value 
     * @returns 
     */
    public static getWinMultipleByValue(value: number): number {
        // return Utils.accDiv(value, this.getCurBetXCurLine());
        return value / this.getBetTotal();
    }

    //================ 下注相關資料 ======================
}

