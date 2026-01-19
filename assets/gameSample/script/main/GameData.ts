import { Node, Vec3 } from 'cc';
// import { BaseDataManager } from 'db://assets/base/script/main/BaseDataManager';
import { BaseData } from 'db://assets/base/script/data/BaseData';
import { XUtils } from '../../../base/script/utils/XUtils';
import { BSSlotParser } from '../../components/slotMachine2/BSSlotParser';
import { GameConst } from '../constant/GameConst';
import { Symbol2 } from '../../components/slotMachine2/Symbol2';
import { SymbolData2 } from '../../components/slotMachine2/SymbolData2';
import { DataManager } from 'db://assets/base/script/data/DataManager';
// import { FeatureBuyManager } from 'db://assets/base/script/main/FeatureBuyManager';
// import { FeatureBuyType } from 'db://assets/base/script/types/BaseType';

export class GameData extends BaseData {
  /**剩餘次數紀錄(提早結束特殊處理) */
  public fsRemainTimes: number = -1;
  /**FS內總贏分 */
  public fsWin: number = 0;

  /**是否剛進入FS */
  public fsInitialize: boolean = false;

  /**老虎機資料 */
  public slotParser: BSSlotParser = new BSSlotParser();

  /**盤面圖示賠率 */
  private payloadKeyList: string[] = ['H1', 'H2', 'H3', 'H4', 'L1', 'L2', 'L3', 'Scatter', 'SuperScatter'];
  /**BS初始化盤面 */
  public bsInitGoldenPattern: number[] = new Array(49).fill(0);
  /**FS初始化盤面 */
  public fsInitGoldenPattern: number[] = new Array(49).fill(0);
  /**初始化充能符號 */
  public initChargePattern: number[] = new Array(49).fill(0);

  /**BS初始化隨機數 */
  public bsInitRng: number[] = [89, 12, 48, 37, 51, 20, 20];
  /**FS初始化隨機數 */
  public fsInitRng: number[] = [75, 79, 39, 38, 62, 25, 20];

  /**BS最後盤面 */
  public bsLastPattern: SymbolData2[] = [];

  /**可能出現scatter軸(0為第一軸) */
  public scatterRange: number[] = [0, 1, 2, 3, 4, 5, 6];

  /**免費轉次數列表 */
  // public fsTimeList: number[] = [10, 12, 15, 20, 30];

  /**此轉是否有skip(決定自動轉延遲時間) */
  public hasSkip: boolean = false;

  /**當前RNG */
  public curRng: number[] = [];

  /**老虎機實例 */
  public slotMachine: any = null;

  /**軸節點位置列表 */
  public reelPosList: Vec3[] = [];

  /**當前Scatter數量 */
  public curScatterCount: number = 0;
  public isDropMipie: boolean = false;

  private timeScaleList: number[] = [1.1, 1.4, 2.2];
  public isSuperMode: boolean = false;

  constructor() {
    super();
    this.REEL_COL = 7;
    this.REEL_ROW = 7;
    this.BIG_WIN_MULTIPLE = [15, 30, 50];
  }

  /**
   * 取得速度對應參數
   * @returns
   */
  public getTurboSetting(): number {
    return this.timeScaleList[DataManager.getInstance().curTurboMode];
  }

  /**
   * 判斷scatter數量是否需要瞇牌
   * @param count
   * @returns
   */
  public needMi(count: number): boolean {
    return count === GameConst.BONUS_WIN_COUNT - 1;
  }

  /**
   * 設置軸節點位置列表
   * @param reelController 軸控制器
   */
  public setReelPosList(reelController: Node): void {
    this.reelPosList = Array(this.REEL_COL * this.REEL_ROW).fill(new Vec3(0, 0, 0));
    reelController.children.forEach((reel, reelIndex) => {
      reel.children.forEach((nodePos, index) => {
        if (index >= this.REEL_ROW && index < this.REEL_ROW * 2) {
          const posX = reel.getPosition().x; //取得父節點X軸
          const posY = nodePos.getPosition().y; //取得子節點Y軸
          const row = index - this.REEL_ROW;
          this.reelPosList[reelIndex + row * this.REEL_COL] = new Vec3(posX, posY, 0); //保存節點位置
        }
      });
    });
  }

  /**
   * 取得圖示
   * @param posID 位置ID
   * @returns 圖示
   */
  public getSymbolByPosID(posID: number): Symbol2 {
    // 轉換位置索引
    const col = posID % this.REEL_COL;
    const row = Math.floor(posID / this.REEL_COL);
    const slotMachine = this.slotMachine;
    const reel = slotMachine.dataList[col];
    const symbolList = reel.getReelSymbolList();
    const symbol = symbolList.find((symbol: Symbol2) => symbol.getPosIndex() === row + reel.keepRow) as Symbol2;
    return symbol;
  }

  /**
   * 圖示賠率模板
   */
  private payloadTemplate = {
    symbolPoints: {
      H1: [
        { count: 15, point: 3000 },
        { count: 14, point: 1400 },
        { count: 13, point: 700 },
        { count: 12, point: 300 },
        { count: 11, point: 150 },
        { count: 10, point: 100 },
        { count: 9, point: 50 },
        { count: 8, point: 40 },
        { count: 7, point: 35 },
        { count: 6, point: 30 },
        { count: 5, point: 20 },
      ],
      H2: [
        { count: 15, point: 2000 },
        { count: 14, point: 1200 },
        { count: 13, point: 600 },
        { count: 12, point: 250 },
        { count: 11, point: 120 },
        { count: 10, point: 80 },
        { count: 9, point: 40 },
        { count: 8, point: 30 },
        { count: 7, point: 25 },
        { count: 6, point: 20 },
        { count: 5, point: 15 },
      ],
      H3: [
        { count: 15, point: 1200 },
        { count: 14, point: 800 },
        { count: 13, point: 400 },
        { count: 12, point: 200 },
        { count: 11, point: 90 },
        { count: 10, point: 60 },
        { count: 9, point: 30 },
        { count: 8, point: 25 },
        { count: 7, point: 20 },
        { count: 6, point: 15 },
        { count: 5, point: 10 },
      ],
      H4: [
        { count: 15, point: 800 },
        { count: 14, point: 400 },
        { count: 13, point: 200 },
        { count: 12, point: 100 },
        { count: 11, point: 60 },
        { count: 10, point: 40 },
        { count: 9, point: 25 },
        { count: 8, point: 20 },
        { count: 7, point: 15 },
        { count: 6, point: 10 },
        { count: 5, point: 8 },
      ],
      L1: [
        { count: 15, point: 600 },
        { count: 14, point: 300 },
        { count: 13, point: 160 },
        { count: 12, point: 70 },
        { count: 11, point: 50 },
        { count: 10, point: 30 },
        { count: 9, point: 20 },
        { count: 8, point: 15 },
        { count: 7, point: 10 },
        { count: 6, point: 8 },
        { count: 5, point: 6 },
      ],
      L2: [
        { count: 15, point: 500 },
        { count: 14, point: 240 },
        { count: 13, point: 120 },
        { count: 12, point: 60 },
        { count: 11, point: 40 },
        { count: 10, point: 25 },
        { count: 9, point: 15 },
        { count: 8, point: 10 },
        { count: 7, point: 8 },
        { count: 6, point: 6 },
        { count: 5, point: 5 },
      ],
      L3: [
        { count: 15, point: 400 },
        { count: 14, point: 200 },
        { count: 13, point: 100 },
        { count: 12, point: 50 },
        { count: 11, point: 30 },
        { count: 10, point: 20 },
        { count: 9, point: 10 },
        { count: 8, point: 8 },
        { count: 7, point: 6 },
        { count: 6, point: 5 },
        { count: 5, point: 4 },
      ],
      superScatter: [
        { count: 3, point: 2500 },
        { count: 2, point: 500 },
        { count: 1, point: 100 },
      ],
    },
    bet: {
      //以下參數會由getGameHelpPayload()設置
      maxWinLimit: 5000,
      featureLimit: '100,000',
      featureMultipleClassic: 75,
      featureMultipleLuxury: 200,
    },
  };

  /**
   * 取得遊戲幫助資料
   * @returns
   */
  // public getGameHelpPayload(): any {
  //   //重新clone一份新資料並覆寫
  //   let responsePayload = JSON.parse(JSON.stringify(this.payloadTemplate));
  //   for (let key in responsePayload.symbolPoints) {
  //     //牌型
  //     let payDataList = responsePayload.symbolPoints[key];
  //     payDataList.forEach((data) => {
  //       data.point = XUtils.NumberToCentString(data.point * BaseDataManager.getInstance().bet.getCurRateXCurBet());
  //     }, this);
  //   }
  //   responsePayload.bet.maxWinLimit = BaseDataManager.getInstance().bet.maxWinLimit;
  //   responsePayload.bet.min = XUtils.NumberToCentString(BaseDataManager.getInstance().bet.getTotalAt(0));
  //   responsePayload.bet.max = XUtils.NumberToCentString(BaseDataManager.getInstance().bet.getMaxTotal());
  //   responsePayload.bet.featureLimit = FeatureBuyManager.getInstance().getFeatureBuyMaxBet().toString();
  //   responsePayload.bet.featureMultipleClassic = FeatureBuyManager.getInstance().getFeatureBuyMultipleByType(
  //     FeatureBuyType.Type1,
  //   );
  //   responsePayload.bet.featureMultipleLuxury = FeatureBuyManager.getInstance().getFeatureBuyMultipleByType(
  //     FeatureBuyType.Type2,
  //   );

  //   return responsePayload;
  // }

  /**
   * 取得圖示賠率
   * @param symbolID
   * @returns
   */
  public getPayBySymbolID(symbolID: number): { count: number; cent: string }[] {
    let key = this.payloadKeyList[symbolID];
    let result = [];
    let payData = this.payloadTemplate.symbolPoints[key];
    if (payData) {
      payData.forEach((data: { count: number; point: number }) => {
        result.push({
          count: data.count,
          // cent: XUtils.NumberToCentString(data.point * BaseDataManager.getInstance().bet.getCurRateXCurBet()),
        });
      }, this);
    }
    return result;
  }

  /**
   * 重置累積資料
   */
  public resetFS(): void {
    this.fsRemainTimes = -1;
    this.fsWin = 0;
    this.fsInitialize = false;
  }
}

export const GAME_TIMES = {
  showWinDuration: 0.6,
  explodeDuration: 1.4,
  reelWinDelay: 0, //輪帶中獎延遲時間
  totalWinDelayTime: 2,
  scoreMoveTime: 1.6, //分數移動時間
};

//遊戲資料
export const gameData = () => DataManager.getInstance().getGameData();
//取得遊戲速度縮放參數
// export const gameTimeScale = (): number => gameData().getTurboSetting();
