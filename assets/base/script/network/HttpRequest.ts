import { _decorator } from 'cc';
import { Notice } from 'db://assets/base/components/notice/Notice';

export class HttpRequest {
    /**
     * 發送請求
     * @param data 請求資料
     * @param callback 回傳回應
     * @returns 
     */
    public static async send(data: IHttpPayload, callback: Function): Promise<void> {
        try {
            // 使用 fetch 發送 HTTP 請求
            const response = await fetch(data.url, {
                method: data.method,                    // 請求方法 (GET/POST)
                body: data.content,                      // 請求內容 (JSON 字串)
                headers: {
                    'Content-Type': 'application/json'   // 設定內容類型為 JSON
                },
                signal: AbortSignal.timeout(4 * 60 * 1000) // 設定 4 分鐘超時
            });

            // 檢查回應狀態是否成功
            if (!response.ok) {
                if (response.status === 404) {
                    // 404 錯誤：資源不存在
                    Notice.showError.emit(107);
                    throw new Error('404');
                } else {
                    // 其他 HTTP 錯誤狀態碼
                    Notice.showError.emit(response.status);
                    throw new Error(`HTTP_ERROR_${response.status}`);
                }
            }

            // 解析 JSON 回應
            const result = await response.json();
            if (result && result.data) {
                // 回應格式正確，執行回調函數
                callback(result);
            } else {
                // 回應格式無效
                Notice.showError.emit(107);
                throw new Error('INVALID_RESPONSE');
            }
        } catch (error) {
            // 錯誤處理
            if (error.name === 'TimeoutError') {
                // 超時錯誤
                Notice.showError.emit(107);
                throw new Error('TIMEOUT');
            } else if (error.name === 'TypeError') {
                // 網路連線錯誤
                Notice.showError.emit(107);
                throw new Error('NETWORK_ERROR');
            } else {
                // 其他錯誤直接拋出
                throw error;
            }
        }
    }
}

export interface IHttpPayload {
    url: string;
    method: HTTP_METHODS;
    content: string;
}

export enum HTTP_METHODS {
    POST = 'POST',
    GET = 'GET'
}

