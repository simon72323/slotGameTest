/**
 * 預設遊戲基本資料(遊戲需要擴充再繼承)
 */
export class BaseData {
  /**欄數 */
  REEL_COL = 7;
  /**列數 */
  REEL_ROW = 7;
  /**保留列數 */
  KEEP_ROW = 0;
  /**實際物件列數 */
  REAL_REEL_ROW = 7 + 0;
  /**圖示寬度 */
  REEL_SYMBOL_W = 102;
  /**圖示高度 */
  REEL_SYMBOL_H = 120;
  /**回彈高度 */
  SWINGHEIGHT = 0;
  /**軸X中心 */
  REEL_CENTER_X = 360;
  /**軸Y中心 */
  REEL_CENTER_Y = 816;
  /**軸寬 */
  REEL_WIDTH = 714;
  /**軸高 */
  REEL_HEIGHT = 700;
  /**軸X間隔 */
  REEL_GAP_X = 0;
  /**軸Y間隔 */
  REEL_GAP_Y = 0;
  /**BigWin倍數定義 */
  BIG_WIN_MULTIPLE: number[] = [15, 30, 50, 100, 200];

  /**FS是否鎖定一般速度 */
  public lockTurboInFS: boolean = true;

  /**自訂資源讀取完成時機 */
  public customLoadComplete: boolean = false;

  /**DTM隨機時要帶入的mode */
  public dtmRandomMode: number = 0;

  /**回傳GameHelp資料給WebView */
  public getGameHelpPayload() {
    //override
  }
}
