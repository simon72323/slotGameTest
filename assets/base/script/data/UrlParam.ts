export class UrlParam {
    /** 用戶token */
    public static token: string = '';
    /** 遊戲id */
    public static gameId: number = 0;
    /** 語言 */
    public static lang: string = '';
    /** 投注記錄url */
    public static betRecordUrl: string = '';
    /** 主頁url */
    public static homeUrl: string = '';
    /** 模式 */
    public static mode: string = '';
    /** 伺服器url */
    public static serverUrl: string = '';
    /** 依據參數顯示不同 loading 頁 */
    public static b: string = '';

    /**
     * 初始化並快取所有URL參數
     */
    public static initUrlParameters(): void {
        const hostname = window.location.hostname;
        const isLocal = hostname === 'localhost' || hostname === '127.0.0.1';
        if (isLocal) {
            // this.token = 'testtokenUSD5800';
            this.token = 'testtoken5800';
            this.gameId = 5800;
            this.lang = 'zh-cn';
            this.betRecordUrl = 'https://gc.ifun7.vip/betrecord/';
            this.homeUrl = '';
            this.mode = '0';
            this.serverUrl = 'https://gs.ifun7.vip';
            this.b = 'iqazwsxi';
        } else {
            const urlParams = new URLSearchParams(window.location.search);
            this.token = urlParams.get(urlParamKey.TOKEN) || '';
            this.gameId = parseInt(urlParams.get(urlParamKey.GAME_ID) || '0');
            this.lang = urlParams.get(urlParamKey.LANGUAGE) || '';
            this.betRecordUrl = urlParams.get(urlParamKey.BET_RECORD_URL) || '';
            this.homeUrl = urlParams.get(urlParamKey.HOME_URL) || '';
            this.mode = urlParams.get(urlParamKey.MODE) || '';
            this.serverUrl = urlParams.get(urlParamKey.SERVER_URL) || '';
            this.b = urlParams.get(urlParamKey.B) || '';
        }
    }
}

// export const gerUrlParam = new UrlParam();

enum urlParamKey {
    TOKEN = 'token',
    GAME_ID = 'gameid',
    LANGUAGE = 'lang',
    BET_RECORD_URL = 'betrecordurl',
    HOME_URL = 'homeurl',
    MODE = 'mode',
    SERVER_URL = 'serverurl',
    B = 'b',
}