/**
 * 遊戲常數
 */
export class GameConst {
  /**橫軸列數 */
  public static REEL_COL: number = 7;
  /**縱軸列數 */
  public static REEL_ROW: number = 7;
  /**Scatter中獎數量(觸發免費遊戲的條件數量) */
  public static BONUS_WIN_COUNT: number = 3;
  /**圖示權重(越大越上層) */
  public static symbolWeight: number[] = [0, 0, 0, 0, 0, 0, 0, 99, 100];
  /**倍數清單 */
  // public static multiplierList: number[] = [1, 2, 4, 8, 16, 32, 64, 128, 256, 512, 1024];
  /**FS初始倍數 */
  // public static FS_INIT_MULTIPLIER: number = 8;
  // public static FS_INIT_MULTIPLIER_INDEX: number = GameConst.multiplierList.indexOf(GameConst.FS_INIT_MULTIPLIER);

  /**FS獲得次數累加毫秒(Retrigger或增加spin時使用) */
  public static BONUS_TIME_ADD_INTERVAL = 0.2;

  /**充能符號隨機值 */
  public static RANDOM_CHARGE: number = 0.01;
  /**金scatter隨機值 */
  // public static RANDOM_SCATTER_CHARGE: number = 0.4;
}

export enum SymbolID {
  H1 = 1,
  H2,
  H3,
  H4,
  L1 = 11,
  L2,
  L3,
  Scatter = 30,
  SuperScatter = 31,
}

/**SymbolID 對應數字索引的映射 (共用映射) */
export const symbolToIndexMap: Map<number, number> = new Map([
  [SymbolID.H1, 0],
  [SymbolID.H2, 1],
  [SymbolID.H3, 2],
  [SymbolID.H4, 3],
  [SymbolID.L1, 4],
  [SymbolID.L2, 5],
  [SymbolID.L3, 6],
  [SymbolID.Scatter, 7],
  [SymbolID.SuperScatter, 8],
]);

/**數字索引對應 SymbolID 的映射 (共用映射) */
export const indexToSymbolMap: Map<number, number> = new Map([
  [0, SymbolID.H1],
  [1, SymbolID.H2],
  [2, SymbolID.H3],
  [3, SymbolID.H4],
  [4, SymbolID.L1],
  [5, SymbolID.L2],
  [6, SymbolID.L3],
  [7, SymbolID.Scatter],
  [8, SymbolID.SuperScatter],
]);

export enum GameBundleDir {
  audio = 'audio',
  // horse = "horse",
  // check = "check",
  // BS_random_vfx = "BS_random_vfx",
  // fs_mahjong = "fs_mahjong",
  // trans_choice = "trans_choice"
}

export enum LangBundleDir {
  banner = 'banner',
  bigwin = 'bigwin',
  board = 'board',
  bs = 'bs',
  featureBuy = 'buyfeature',
  fs = 'fs',
  paytable = 'paytable',
  // win = "win",
}

export enum GameAnimationName {
  /**scale:0(0s)->scale:1.2(in 0.2s)->scale:1(in 0.1s) */
  scaleTxt = 'scaleTxt',
  ScaleJumpWinTxt = 'ScaleJumpWinTxt',
  ScaleJumpMultipleTxt = 'ScaleJumpMultTxt',
  gameShakeUp = 'gameShakeUp',
  gameShakeLeft = 'gameShakeLeft',
  fadeInSpine = 'fadeInSpine',
  fadeOutSpine = 'fadeOutSpine',
  bannerWinShow = 'bannerWinShow',
}

/**
 * 共用音樂音效Key
 */
export enum GameAudioKey {
  //BGM----------------------------
  // bs_music = 'bs_music',
  // fs_music = 'fs_music',

  //老虎機----------------------------
  /**瞇牌 */
  board_waiting = 'board_waiting',
  board_spin = 'reel_spin',
  /**第一軸掉落到定位 */
  reel_stop_1 = 'reel_stop_1',
  /**第二軸掉落到定位 */
  reel_stop_2 = 'reel_stop_2',
  /**第三軸掉落到定位 */
  reel_stop_3 = 'reel_stop_3',
  /**第四軸掉落到定位 */
  reel_stop_4 = 'reel_stop_4',
  /**第五軸掉落到定位 */
  reel_stop_5 = 'reel_stop_5',
  /**第六軸掉落到定位 */
  reel_stop_6 = 'reel_stop_6',
  /**第七軸掉落到定位 */
  reel_stop_7 = 'reel_stop_7',
  /**消除後掉落 */
  board_fill = 'board_fill',

  //倍率音效----------------------------
  multiplier_combine = 'multiplier_combine',
  multiplier_up_1_win = 'multiplier_up_1_win',
  multiplier_up_2_win = 'multiplier_up_2_win',
  multiplier_up_3_upto = 'multiplier_up_3_upto',
  multiplier_up_3_loop = 'multiplier_up_3_loop',
  multiplier_up_3_win = 'multiplier_up_3_win',
  multiplier_up_4_upto = 'multiplier_up_4_upto',
  multiplier_up_4_loop = 'multiplier_up_4_loop',
  multiplier_up_4_win = 'multiplier_up_4_win',

  //連線消除----------------------------
  /**連線音效 */
  payline_hit_1 = 'payline_hit_1',
  payline_hit_2 = 'payline_hit_2',
  payline_hit_3 = 'payline_hit_3',
  symbol_explode = 'symbol_explode',

  //symbol----------------------------
  /**scatter中獎 */
  scatter_win = 'scatter_win',
  /**scatter出現 */
  scatter_hit_1 = 'scatter_hit_1',
  scatter_hit_2 = 'scatter_hit_2',
  scatter_hit_3 = 'scatter_hit_3',
  /**wild出現 */
  // wild = 'wild',

  //FS----------------------------
  free_game_transition_1 = 'free_game_transition_1',
  free_game_transition_2 = 'free_game_transition_2',
  free_game_skip = 'free_game_skip',
  free_game_start = 'free_game_start',
  free_game_total_win = 'free_game_total_win',

  //幸運一擊----------------------------
  buy_feature_click = 'buy_feature_click',
  buy_click = 'buy_click',

  //其他----------------------------
  /**跑分 */
  score_count_loop = 'score_count_loop',
  retrigger = 'retrigger',
  win_bar = 'win_bar',
}

export enum BlackKey {
  DiceBlack = 'DiceBlack',
  UIBlack = 'UIBlack',
}

export enum GameLayer {
  Reel = 0,
  Reel2 = 1,
  Scatter = 2,
}

export enum SlotMachineID {
  BS = 0,
  FS = 1,
}
