import { _decorator } from 'cc';
import { Notice } from 'db://assets/base/components/notice/Notice';
import { dataManager } from 'db://assets/base/script/data/DataManager';
import { HTTP_METHODS, HttpRequest, IHttpPayload } from 'db://assets/base/script/network/HttpRequest';
import { ISpinData, HttpApi } from 'db://assets/base/script/network/HttpApi';
import { UrlParam } from 'db://assets/base/script/data/UrlParam';
import { BetData } from 'db://assets/base/script/data/BetData';

const { ccclass, property } = _decorator;

@ccclass('HttpManager')
export class HttpManager {
    protected static _instance: HttpManager;
    public static getInstance() {
        if (!HttpManager._instance) {
            HttpManager._instance = new HttpManager();
        }
        return HttpManager._instance;
    }

    /**
     * 發送網路請求
     * @param command 命令
     * @param data 請求資料
     * @returns 回應資料
     */
    private async sendRequest(command: string, data: any = {}): Promise<IResponseData> {
        const content: IRequestData = {
            command,
            token: UrlParam.token,
            data
        };

        // 設置請求資料
        const httpPayload: IHttpPayload = {
            url: UrlParam.serverUrl,
            method: HTTP_METHODS.POST,
            content: JSON.stringify(content)
        };

        return new Promise((resolve, reject) => {
            HttpRequest.send(httpPayload, (response: IResponseData) => {
                if (response.error_code !== 0) {
                    Notice.showError.emit(response.error_code);
                } else {
                    resolve(response);  //回傳回應資料
                }
            }).catch((error) => {
                reject(error);
            });
        });
    }

    /**
     * 發送更新 token 請求
     */
    public async sendRenewToken(): Promise<string> {
        const response = await this.sendRequest(HttpApi.RENEW_TOKEN);
        // console.log('[HttpManager] onRenewTokenReceived =>', response);
        return response.data[0].token as string;
    }

    /**
     * 發送spin請求（支援免費旋轉）
     * @param SpinID 0=一般投注，1=免費投注
     * @param callback spinResult=回傳spin結果（失敗回傳null）
     */
    public async sendSpin(SpinID: number, callback: (spinResult: ISpinData) => void): Promise<void> {
        try {
            const data = {
                game_id: UrlParam.gameId,
                coin_value: BetData.coinValue,
                line_bet: BetData.getLineBet(),
                line_num: BetData.getLineTotal(),
                bet_credit: BetData.getBetTotal(),
                buy_spin: SpinID
            };
            const response = await this.sendRequest(HttpApi.SPIN, data);
            callback(response.data);// 成功回調
        } catch (error) {
            // console.error('[HttpManager] sendSpin error =>', error);
            callback(null);// 失敗回調
        }
    }

    /**
     * 發送獲取用戶資料請求UserData
     */
    public async sendUserData(): Promise<void> {
        const response = await this.sendRequest(HttpApi.GET_USER_DATA);
        dataManager().setUserData(response.data[0]);
    }

    /**
     * 發送獲取遊戲資料請求GameData
     */
    public async sendGameData(): Promise<void> {
        const response = await this.sendRequest(HttpApi.GET_GAME_DATA, {
            game_id: UrlParam.gameId
        });
        dataManager().setGameData(response.data[0]);
    }

    /**
     * 獲取免費旋轉結算
     * @param freeSpinId 免費旋轉 ID
     */
    // public async sendFreeSpinTotalPayout(freeSpinId: string): Promise<IFreeSpinTotalPayoutResponse> {
    //     const response = await this.sendRequest(HttpApi.GET_FREE_SPIN_TOTAL_PAYOUT, {
    //         free_spin_id: freeSpinId
    //     });
    //     // console.log('[HttpManager] onGetFreeSpinTotalPayoutReceived =>', response);
    //     return response.data[0] as IFreeSpinTotalPayoutResponse;
    // }

    /**
     * 發送滾輪停止通知（主播用）
     */
    // public async sendReelStop(): Promise<void> {
    //     const response = await this.sendRequest(HttpApi.REEL_STOP);
    //     // console.log('[HttpManager] onReelStopReceived =>', response);
    // }

    /**
     * 發送獲取累積獎金資料請求
     */
    // public async sendJackpot(): Promise<void> {
    //     const response = await this.sendRequest(HttpApi.GET_JACKPOT);
    //     // console.log('[HttpManager] onGetJackpotReceived =>', response);
    //     // TODO: 處理累積獎金資料
    // }
}

//傳送格式
export interface IRequestData {
    command: string,
    token: string,
    data: any
}

//回應格式
export interface IResponseData {
    command: string,
    error_code: number,
    message?: string,
    data: any
}

export const httpManager = (): HttpManager => HttpManager.getInstance();