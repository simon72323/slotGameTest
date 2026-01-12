import { BetData } from 'db://assets/base/script/data/BetData';
import { UrlParam } from 'db://assets/base/script/data/UrlParam';
import { IGameData, IPromotionBrief, ISpinData, IUserData } from 'db://assets/base/script/network/HttpApi';
import { BigWinType, ModuleID, TurboMode } from 'db://assets/base/script/types/BaseType';
/** 遊戲內選單資料 */
type InGameMenuStore = {
    imageURL: string,
    isAvailable: boolean,
    hot: number[],
    new: number[],
    gameList: number[],
    favList: number[]
};

/**
     * 遊戲資料控制器
     */
export class DataManager {
    private static instance: DataManager = null;
    public static getInstance(): DataManager {
        if (!DataManager.instance) {
            DataManager.instance = new DataManager();
        }
        return DataManager.instance;
    }

    /** 玩家餘額 */
    public userCredit: number = 0;

    /** 是否自動旋轉模式 */
    public isAutoMode: boolean = false;
    /** 剩餘自動旋轉次數 */
    public autoSpinCount: number = 0;
    /** 是否選擇自動旋轉次數 */
    public isAutoTimes: boolean = false;
    /** 停止直到免費轉 */
    public isStopUntilFeature: boolean = false;

    /** 當前模式 */
    public curModuleID: ModuleID = ModuleID.MG;
    /** 當前加速模式(免費遊戲會強制設為Normal) */
    public curTurboMode: TurboMode = TurboMode.Fast;

    /** 音效狀態 */
    public isSoundEnabled: boolean = true;
    /** 音樂狀態 */
    public isMusicEnabled: boolean = true;

    /** 是否鎖定鍵盤 */
    public lockKeyboard: boolean = false;

    /** 是否購買免費遊戲 */
    public isBuyFg: boolean = false;

    //============================= server資料 =====================================
    /** 用戶資料 */
    private userData: IUserData;
    public getUserData(): IUserData {
        return this.userData;
    }

    public setUserData(userData: IUserData): void {
        this.userData = userData;
        this.userCredit = userData.credit;
        this.currency = userData.currency;
    }

    /** 遊戲資料 */
    private gameData: IGameData;
    public getGameData(): IGameData {
        return this.gameData;
    }

    public setGameData(gameData: IGameData) {
        this.gameData = gameData;
        this.bigWinMultiple.push(gameData.big_win);
        this.bigWinMultiple.push(gameData.super_win);
        this.bigWinMultiple.push(gameData.mega_win);

        // 初始化 BetData 的數據依賴
        BetData.gameData = gameData;
        BetData.lineIdx = gameData.line_bet_default_index;
        BetData.betIdx = gameData.coin_value_default_index;
        BetData.coinValue = gameData.coin_value[gameData.coin_value_default_index];
    }

    /** 下注回傳資料 */
    // public spinResult: ISpinData;

    /** 幣別 */
    public currency: string = '';
    /** 大贏跑分倍率 */
    public bigWinMultiple: number[] = [];
    /** 促銷資料 */
    public promotionData: IPromotionBrief[];
    /** 遊戲內選單狀態(0=off，1=on) */
    public inGameMenuStatus: boolean;
    /** 遊戲內選單資料 */
    public inGameMenuStore: InGameMenuStore = {
        new: [],
        hot: [],
        gameList: [],
        favList: [],
        imageURL: '',
        isAvailable: false
    };

    /** 遊戲選單資料(語系ID: 遊戲名稱) */
    public gameNameList: { [key: number]: string } = {};
    //============================= server資料 ======================================

    /**
     * 取得完整下注紀錄網址
     * @returns 
     */
    public getFullBetrecordurl(): string {
        const { betRecordUrl, token, serverUrl, lang } = UrlParam;
        return `${betRecordUrl}?token=${token}&lang=${lang}&serverurl=${serverUrl}`;
    }

    /**
     * 是否為MG模式(一般遊戲)
     * @returns 
     */
    public isMG(): boolean {
        return this.curModuleID === ModuleID.MG;
    }

    /**
     * 取得value對應BigWin類型
     * @param value 
     */
    public getBigWinTypeByValue(value: number): BigWinType {
        if (!this.bigWinMultiple || this.bigWinMultiple.length === 0) {
            // console.warn('BetData: bigWinMultiple not initialized');
            return BigWinType.non;
        }

        let bigWinLevel: BigWinType = BigWinType.non;
        //取得贏錢倍數
        const multiple: number = BetData.getWinMultipleByValue(value);
        for (let i = 0; i < this.bigWinMultiple.length; i++) {
            if (multiple >= this.bigWinMultiple[i]) {
                bigWinLevel = i;
            }
        }
        return bigWinLevel;
    }

    /**
     * 取得免費遊戲購買金額
     * @returns 
     */
    public getBuySpinValue(): number {
        if (!this.gameData.buy_spin) {
            return -1;//代表沒有購買功能
        }
        const multiple = this.gameData.buy_spin.multiplier;
        const limit_total = this.gameData.buy_spin.limit_total;
        //總購買金額
        const totalBuy = multiple * BetData.getBetTotal();
        if (totalBuy > limit_total) {
            return -1;//代表超過限額
        }
        return totalBuy;
    }

    /**
     * 是否鎖定鍵盤
     * @returns 
     */
    public isBlockKeyboard(): boolean {
        return this.lockKeyboard;
    }

    /**
     * 取得免費遊戲是否可用
     * @returns 
     */
    public getBuyFeatureEnabled(): boolean {
        if (!this.gameData.buy_spin) {
            return false;//代表沒有購買功能
        }
        // const limit_total = this.gameData.buy_spin.limit_total;
        const totalBuy = BetData.getBuyFeatureTotal();//總購買金額
        if (this.userCredit < totalBuy) {
            return false;//代表餘額不足
        }
        return true;
    }
}

export const dataManager = (): DataManager => DataManager.getInstance();