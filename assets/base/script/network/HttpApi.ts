export enum HttpApi {
    RENEW_TOKEN = 'renew_token', // 更新 token
    GET_USER_DATA = 'get_user_data', // 獲取用戶資料
    GET_GAME_DATA = 'get_game_data', // 獲取遊戲資料
    GET_JACKPOT = 'get_jackpot', // 獲取累積獎金
    GET_CASH_DROP = 'get_cash_drop', // 獲取現金掉落活動
    GET_TOURNAMENT = 'get_tournament', // 獲取錦標賽活動
    GET_PROMOTION_BRIEF = 'get_promotion_brief', // 獲取促銷簡介
    GET_CASH_DROP_PRIZE_RECORD = 'get_cash_drop_prize_record', // 獲取現金掉落中獎紀錄
    GET_TOURNAMENT_PRIZE_RECORD = 'get_tournament_prize_record', // 獲取錦標賽排行榜
    GET_JP = 'get_jp', // 獲取 JP 資料
    GET_JP_AMOUNT = 'get_jp_amount', // 獲取 JP 金額
    GET_JP_PRIZE_RECORD = 'get_jp_prize_record', // 獲取 JP 中獎紀錄
    GET_IN_GAME_MENU_STATUS = 'get_in_game_menu_status', // 獲取遊戲內選單狀態
    GET_EXTRA_DATA = 'get_extra_data', // 獲取額外資料
    SPIN = 'spin', // 投注
    GET_IN_GAME_MENU = 'get_in_game_menu', // 獲取遊戲內選單
    UPDATE_IN_GAME_MENU_FAVORITE_GAME = 'update_in_game_menu_favorite_game', // 更新收藏遊戲
    GET_IN_GAME_MENU_GAME_URL = 'get_in_game_menu_game_url', // 獲取遊戲 URL
    GET_FREE_SPIN_TOTAL_PAYOUT = 'get_free_spin_total_payout', // 獲取免費旋轉結算
    REEL_STOP = 'reel_stop' // 滾輪停止（主播用）
}

//========================= 接收用戶資料 =========================
export interface IUserData {
    account: string; // 用戶帳號
    agent_account: string; // 用戶所屬代理商
    credit: number; // 用戶當前的錢
    currency: string; // 用戶的幣別，string IDR=印尼,CNY=人民幣,MYR=馬幣,THB=泰銖,VND=越南盾,韓元=KRW, 美金=USD,披索=PHP
    free_spin_data: IFreeSpinData[]; // free spin 資料。每次只回傳一筆資料
    is_anchor: boolean; // 是否為主播
}

export interface IFreeSpinData {
    free_spin_id: string; // 此為目前資料中最小 free spin id 字串，優先使用它的次數
    bet: number; // 此為每次下注的額度
    end_date: string; // 此為免費轉結束時間
    rounds_left: number; // 此為免費轉剩餘次數
}
//========================= 接收用戶資料 =========================


//========================= 接收遊戲資料 =========================
export interface IGameData {
    game_id: number; // 遊戲 ID
    line_bet: number[]; // 線注選項
    coin_value: number[]; // 下注倍數選項
    bet_available_idx: number; // 錢倍數
    line_total: number; // 總線數
    line_available: number[]; // 合法的線數，用於檢查 LineNum 是否合法

    line_bet_default_index: number; // 線注預設索引
    coin_value_default_index: number; // 下注倍數預設索引

    win: number; // total bet 的幾倍秀 win
    big_win: number; // total bet 的幾倍秀 big_win
    super_win: number; // total bet 的幾倍秀 super_win
    mega_win: number; // total bet 的幾倍秀 mega_win

    spin_mode: number; // spin 速度 0=normal, 1=quick, 2=turbo
    buy_spin: IBuySpin; // 購買免費遊戲設定
    jackpot?: IJackpotSetting; // 遊戲本身有 jackpot 才有用
}

export interface IBuySpin {
    allow_buy: number; // 遊戲是否允許 buy
    multiplier: number; // buy 的倍數（總投注額的倍數）
    limit_total: number; // total bet 超過這個金額就不能買
}

export interface IJackpotSetting {
    grand_multiplier: number; // 倍數，-1 表示沒用
    major_multiplier: number; // 倍數
    minor_multiplier: number; // 倍數
    mini_multiplier: number; // 倍數
}
//========================= 接收遊戲資料 =========================


//========================= 接收遊戲選單資料 =========================
export interface IGameMenu {
    game_name: IGameName[]; // 遊戲名稱
    game: IGameCategory[]; // 每個遊戲分類，是新遊戲還是熱門
    favorite: number[]; // 收藏遊戲，顯示在 Favorite 頁面
    image: string; // 所有遊戲圖片 url，後面自己補上 gameid.png
}

export interface IGameName {
    game_id: number; // 遊戲 ID
    language: IGameLanguage; // 各語系遊戲名稱
}

export interface IGameCategory {
    game_id: number; // 遊戲 ID
    status: number; // 0=none, 1=新遊戲, 2=熱門遊戲
}

// 遊戲語言資料
export interface IGameLanguage {
    en: string; // 英文
    id: string; // 印尼文
    ko: string; // 韓文
    ms: string; // 馬來西亞文
    ph: string; // 菲律賓文
    th: string; // 泰文
    vi: string; // 越南文
    'zh-cn': string; // 簡體中文
}
//========================= 接收遊戲選單資料 =========================


//========================= 接收下注資料 =========================
export interface ISpinData {
    game_id: number; // 遊戲 ID
    main_game: IGameResult; // 主遊戲結果
    get_sub_game: boolean; // 是否中 sub game
    sub_game: {
        game_result: IGameResult[]; // 子遊戲結果
        pay_credit_total: number; // 總金額
        over_win?: boolean; // 贏倍超出最大值
    };

    user_credit: number; // 用戶目前金額
    bet_credit: number; // 總投注金額
    payout_credit: number; // 總派彩金額
    change_credit: number; // 改變金額，如果沒中獎，是負的
    effect_credit: number; // 有效投注，就是總投注額

    buy_spin: number; // 0=normal, 1=buy
    buy_spin_multiplier: number; // 購買花費（bet 的幾倍）
    extra: IExtraData | null; // 額外資料

    get_jackpot?: boolean; // 是否中 jackpot
    jackpot?: IJackpotResult; // jackpot 結果
    get_jackpot_increment?: boolean; // 是否獲取 jackpot 增量
    jackpot_increment?: IJackpotIncrement; // jackpot 增量
    grand?: number; // 水池
    major?: number; // 水池
    minor?: number; // 水池
    mini?: number; // 水池
}

export interface IGameResult {
    pay_credit_total: number; // 該盤面金額
    game_result: number[][]; // 盤面 3X5 symbolID
    pay_line: IPayLine[]; // 中獎線
    scatter_info?: ISymbolInfo; // scatter 資訊
    wild_info?: ISymbolInfo; // wild 資訊
    scatter_extra?: any[]; // scatter 額外資訊
    extra?: IExtraInfo; // 額外資訊
}

export interface IJackpotResult {
    jackpot_id: string; // jackpot ID
    jackpot_credit: number; // jackpot 金額
    symbol_id: any; // symbol ID
}

export interface IJackpotIncrement {
    grand: number; // grand 增量
    major: number; // major 增量
    minor: number; // minor 增量
    mini: number; // mini 增量
    pool: number; // pool 增量
}

export interface IPayLine {
    pay_line: number; // pay line id
    symbol_id: number; // 這條線的 symbol id
    amount: number; // 中幾個 symbol
    pay_credit: number; // 本條線金額
    multiplier?: number; // 倍數
}

export interface ISymbolInfo {
    id: number[]; // symbol ID 陣列
    position: number[][]; // 盤面位置
    amount?: number; // 數量
    multiplier?: number; // 倍數
    pay_credit?: number; // 派彩金額
    pay_rate?: number; // 派彩率
}

export interface IExtraInfo {
    no_m_add_spin: boolean; // 是否有額外加spin
    total_wild_count: number; // 總wild數量
    wild_pos: number[][]; // 當局wild位置
    // game_result: number[][]; // 遊戲結果
    // near_win: number; // 接近中獎
    // free_spin: IFreeSpinInfo; // 免費旋轉資訊
    // all_wild_position: number[][]; // 所有 wild 位置
}

export interface IFreeSpinInfo {
    times: number; // 次數
    init_result?: number[][]; // 初始結果
    scatter_info?: ISymbolInfo; // scatter 資訊
}

export interface IExtraData {
    user_data: {
        random_wild_gem: number; // 隨機 wild 寶石
        wildX2_gem: number; // wildX2 寶石
    };
    free_spin_times: number; // 免費旋轉次數
}
//========================= 接收下注資料 =========================


//========================= 傳送下注資料 =========================
export interface ISpinDataRequest {
    game_id: number; // 遊戲 ID
    line_bet: number; // 線注
    line_num: number; // 線數
    coin_value: number; // 倍數
    bet_credit: number; // 總下注金額
    free_spin_id: string; // 免費旋轉 ID
    buy_spin?: number; // 本次 spin 是否是 buy free game。0=no, 1=yes
}
//========================= 傳送下注資料 =========================

//========================= Free Spin 相關 =========================
export interface IFreeSpinTotalPayoutRequest {
    free_spin_id: string; // free spin id
}

export interface IFreeSpinTotalPayoutResponse {
    free_spin_id: string; // free spin id
    total_payout: number; // 結算金額
}
//========================= Free Spin 相關 =========================

//========================= 促銷活動相關 =========================
export interface IPromotionBrief {
    promotion_type: number; // 0=cash drop, 1=tournament, 2=jackpot
    promotion_id: string; // 活動 id
    promotion_name: string; // 活動名稱
    min_bet: number; // 最小投注
    time_zone: string; // 時區
    end_date: string; // 結束時間
    currency: string; // 幣別
    budget: number; // 總預算
    begin_date: string; // 開始時間
}

/**
 * 現金掉落活動相關
 */
export interface ICashDrop {
    promotion_id: string; // 活動 id
    promotion_content: string; // 活動內容
    mode: number; // 派發方式，0=range 1=column, 2=multiplier
    mode_rule: number[]; // 派發規則，依不同方式有不同的規則
}

/**
 * 現金掉落中獎紀錄相關
 */
export interface ICashDropPrizeRecord {
    promotion_id: string; // 活動 id
    winner: IPrizeRecord[]; // 中獎者列表
    user: IPrizeRecord[]; // 用戶中獎記錄
}

/**
 * 中獎紀錄相關
 */
export interface IPrizeRecord {
    account: string; // 帳號
    bet_credit: number; // 投注金額
    prize_credit: number; // 獎金金額
    multiplier: number; // 倍數
    date: string; // 日期
}

/**
 * 錦標賽活動相關
 */
export interface ITournament {
    promotion_id: string; // 活動 id
    promotion_content: string; // 活動內容
    payout_status: number; // 派發狀態，0=未派發 1=已派發 2=派發中
    bonus_setting: IBonusSetting[]; // 獎金設定
}

/**
 * 錦標賽獎金設定相關
 */
export interface IBonusSetting {
    start_rank: number; // 開始排名
    end_rank: number; // 結束排名
    bonus: number; // 獎金
}

/**
 * 錦標賽中獎紀錄相關
 */
export interface ITournamentPrizeRecord {
    promotion_id: string; // 活動 id
    winner: ITournamentWinner[]; // 獲勝者列表
    user: ITournamentUser; // 用戶資料
}

/**
 * 錦標賽獲勝者相關
 */
export interface ITournamentWinner {
    account: string; // 帳號
    credit: number; // 累積的投注額（score）
    prize_credit: number; // 獎金，沒派獎前是 0
}

/**
 * 錦標賽用戶相關
 */
export interface ITournamentUser {
    rank: number; // 排名，-1= 還沒排
    account: string; // 帳號
    credit: number; // 累積的投注額（score）
    prize_credit: number; // 獎金，沒派獎前是 0
}
//========================= 促銷活動相關 =========================


//========================= 額外資料相關 =========================
export interface IExtraDataRequest {
    interval: number; // get 間隔秒數，預設 60 秒
}

export interface IExtraDataResponse {
    cash_drop: ICashDropPrize | null; // 現金掉落中獎
    jackpot: IJackpotPrize | null; // jackpot 中獎
}

export interface ICashDropPrize {
    promotion_id: string; // promotion id
    account: string; // 玩家帳號
    game_id: number; // game id
    prize_credit: number; // 給的 promotion 金額
    prize_type: string; // 中獎類型 for jackpot grand,major,minor,mini
}

export interface IJackpotPrize {
    promotion_id: string; // promotion id
    account: string; // 玩家帳號
    game_id: number; // game id
    prize_credit: number; // 給的 promotion 金額
    prize_type: string; // 中獎類型 for jackpot grand,major,minor,mini
}
//========================= 額外資料相關 =========================


//========================= 遊戲內選單相關 =========================

/**
 * 遊戲內選單遊戲 URL 相關
 */
export interface IInGameMenuGameUrlRequest {
    game_id: number; // 遊戲 ID
    lang: string; // 語言
    b: string; // loading 頁面底圖
}


/**
 * 更新收藏遊戲相關
 */
// export interface IUpdateFavoriteGameRequest {
//     favorite: number[]; // 收藏遊戲列表
// }
//========================= 遊戲內選單相關 =========================
