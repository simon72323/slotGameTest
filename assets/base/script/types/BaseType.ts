
/**
 * 大獎類型
 */
export enum BigWinType {
    big = 0,
    super = 1,
    mega = 2,
    non = 9,
}

/**場景方向模式 */
export enum OrientationtMode {
    /**直式 */
    Portrait = 'Portrait',
    /**橫式 */
    Landscape = 'Landscape',
}

/**場景類型 */
export enum ModuleID {
    /**一般遊戲 */
    MG = 'MG',
    /**免費遊戲 */
    FG = 'FG',
}

/**
 * 快速模式
 */
export enum TurboMode {
    Normal = 0,
    Fast,
    Turbo
}

/**
 * 音效模式
 */
export enum AudioMode {
    AudioOn = 0,
    MusicOff,
    AudioOff
}

/**
 * 跑分數據
 */
export type RunNumber = {
    curValue: number;
    finalValue: number;
}