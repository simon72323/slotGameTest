import {
  _decorator,
  CCInteger,
  Component,
  easing,
  instantiate,
  Node,
  Tween,
  tween,
  UIOpacity,
  UITransform,
  Vec3,
} from 'cc';
import { delay, XUtils } from 'db://assets/base/script/utils/XUtils';
import { BaseSymbol2 } from './BaseSymbol2';
import { BaseSymbolData2 } from './BaseSymbolData2';
import { ReelState2, SlotReelConfig2, SymbolState2 } from './SlotType2';

const { ccclass, property } = _decorator;

/**
 * 老虎機軸元件
 */
@ccclass('SlotReel2')
export class SlotReel2 extends Component {
  @property({ type: CCInteger, tooltip: '畫面列數' })
  public viewRow: number = 3;
  @property({ type: CCInteger, tooltip: '上下保留列數' })
  public keepRow: number = 2;
  @property({ type: CCInteger, tooltip: '上方reel節點Y軸偏移單位' })
  private upReelAddYPos: number = 0;
  @property({ tooltip: '是否為無滾動盤面軸' })
  public isFixedReel: boolean = false;

  /**啟動完成 */
  public static BEGIN_COMPLETE: string = 'BEGIN_COMPLETE';
  /**停止完成 */
  public static STOP_COMPLETE: string = 'STOP_COMPLETE';
  /**掉落完成 */
  public static DROP_COMPLETE: string = 'DROP_COMPLETE';
  /**新盤面掉落完成 */
  public static FILL_COMPLETE: string = 'FILL_COMPLETE';

  /**無滾動盤面spin輪帶退場完成 */
  public static FIXED_OUT_COMPLETE: string = 'FIXED_OUT_COMPLETE';
  /**單軸停止完成 */
  public static STOP_ON_REEL: string = 'STOP_ON_REEL';

  /**節點位置 */
  private posList: Node[] = [];

  /**輪帶資料 */
  private strip: number[] = [];
  /**當期輪帶索引 */
  private currentRng: number = -1;
  /**最終輪帶索引 */
  private finalRng: number = -1;

  /**輪帶上圖示 */
  private symbolList: BaseSymbol2[] = [];

  /**輪帶上的所有圖示 */
  private allSymbolList: BaseSymbol2[] = [];

  /**軸索引 */
  public reelIndex: number = -1;

  /**老虎機狀態 */
  private reelState: ReelState2 = ReelState2.IDLE;

  /**是否已要求停止 */
  private requestStop: boolean = false;

  /**軸參數 */
  public config: SlotReelConfig2;

  /**目前累計秒數 */
  private curveTime = 0;

  /**loop持續時間 */
  private curSpinTime = 0;
  private curSpinCount = 0;

  /**強制結果盤面 */
  private forceResult: number[] = [];

  /**圖示顯示時透明度 */
  private static VISIBLE_OPACITY = 255;
  /**圖示隱藏時透明度 */
  private static HIDE_OPACITY = 0;

  private isMi: boolean = false;

  private randomSeed: number = 0;

  /**戲謔類型 */
  private nudgeType: number = -1;

  /**輪帶上的symbol是否已執行停止 */
  private symbolRunStop: boolean[] = [];

  private slowMotionLoopCurveTime: number = 0;

  /**loop持續時間 */
  private slowMotionLoopContinueTime: number = 0;
  /**
   * 設置輪帶
   * @param strip
   */
  public setStrip(strip: number[]): void {
    this.strip = strip;
  }

  /**
   * 初始化
   * @param reelIndex
   * @param config
   */
  public init(reelIndex: number, config: SlotReelConfig2): void {
    this.reelIndex = reelIndex;
    this.config = config;

    //先列出所有位置
    let idx: number = 0;
    let posNode = this.node.getChildByName(`NodePos${idx}`);
    while (posNode != null) {
      posNode.destroyAllChildren();
      posNode.removeAllChildren();
      //轉換成ReelLayer坐標系
      let worldPos = this.node.getComponent(UITransform).convertToWorldSpaceAR(posNode.getPosition());
      //沒有設定layer就不調整層級
      let targetLayerList = config.layerList.length > 0 ? config.layerList : config.reelLayerList;
      if (config.layerList.length > 0) {
        let layerPos = config.layerList[0].getComponent(UITransform).convertToNodeSpaceAR(worldPos);
        posNode.setPosition(layerPos);
      } else if (config.reelLayerList.length > 0) {
        let layerPos = config.reelLayerList[0].getComponent(UITransform).convertToNodeSpaceAR(worldPos);
        posNode.setPosition(layerPos);
      }

      this.posList.push(posNode);
      let symbol = instantiate(config.symbolPrefab).getComponent(BaseSymbol2);
      symbol.setLayerList(targetLayerList);
      targetLayerList[0].addChild(symbol.node);
      symbol.setPosIndex(idx);
      // symbol.setGrid({ col: reelIndex, row: idx });
      this.allSymbolList.push(symbol); //保存所有輪帶上的symbol到allSymbolList
      this.symbolList.push(symbol); //添加輪帶上的symbol到symbolList
      symbol.node.setPosition(posNode.getPosition());
      symbol.node.setScale(posNode.getScale(symbol.node.scale));
      idx++;
      posNode = this.node.getChildByName(`NodePos${idx}`);
    }
  }

  /**
   * 動態更新輪帶列數資料
   * @param newReelRowList 新輪帶列數列表
   * @param newNodeHeightList 新輪帶節點高度列表
   */
  public updateRowData(newReelRowList: number[], newNodeHeightList: number[]) {
    const newReelRow = newReelRowList[this.reelIndex];
    const newNodeHeight = newNodeHeightList[this.reelIndex];
    this.posList.length = 0;
    this.symbolList.length = 0;
    this.viewRow = newReelRow;
    this.keepRow = newReelRow;
    const maxRowCount = newReelRow * 3;
    const topPos = (newNodeHeight * (maxRowCount - 1)) / 2; //最高位置
    for (let i = 0; i < this.allSymbolList.length; i++) {
      const symbol = this.allSymbolList[i]; //取得輪帶上的symbol
      if (i < maxRowCount) {
        let yPos = 0;
        if (i < newReelRow) {
          yPos = topPos - i * newNodeHeight + this.upReelAddYPos;
        } else {
          yPos = topPos - i * newNodeHeight;
        }
        const posNode = this.node.getChildByName(`NodePos${i}`);
        const newPos = new Vec3(this.node.getPosition().x, yPos, 0);
        posNode.setPosition(newPos);
        this.posList.push(posNode);
        symbol.setPosIndex(i);
        // symbol.setGrid({ col: this.reelIndex, row: i });
        symbol.node.setPosition(newPos);
        symbol.node.active = true;
        this.symbolList.push(symbol);
        const symbolID = symbol.symbolID;
        symbol.setSymbolID(symbolID, -1); //重新設置symbolID
      } else {
        symbol.node.active = false;
      }
    }
  }

  /**
   * 初始化盤面
   * @param strip 輪帶資料
   * @param rng 輪帶索引
   */
  public setupStripAndRng(strip: number[], rng: number): void {
    this.setStrip(strip);

    this.currentRng = this.getRng(rng - 1);
    this.symbolList.forEach((symbol, idx) => {
      let stripIdx = this.getRng(this.currentRng - this.keepRow + symbol.getPosIndex());
      symbol.isInView = this.isInView(symbol.getPosIndex());
      symbol.setSymbolID(this.strip[stripIdx], stripIdx);
    });
    this.setSymbolState(SymbolState2.Normal);
  }

  private getPosIdx(idx: number): number {
    return (idx + this.posList.length) % this.posList.length;
  }

  /**
   * 開始轉動
   * @returns
   */
  public spin(): void {
    if (this.reelState !== ReelState2.IDLE) {
      return;
    }

    this.randomSeed = Math.random();
    this.requestStop = false;
    this.reelState = ReelState2.BEGIN;
    this.symbolList.forEach((symbol, idx) => {
      this.debug(`${this.reelIndex}, symbol ${idx} posIndex ${symbol.symbolID}`);
      let hidePos: number = this.config.direction > 0 ? this.posList.length - 1 : 0;
      symbol.getComponent(UIOpacity).opacity =
        symbol.getPosIndex() === hidePos ? SlotReel2.HIDE_OPACITY : SlotReel2.VISIBLE_OPACITY;
      if (symbol.symbolID == -1) {
        symbol.randomSymbol();
      }
      symbol.onSpin();
      symbol.setIsEmpty(false);
    });
    this.setSymbolState(SymbolState2.Normal);
    this.reset();
  }

  private reset(): void {
    this.curveTime = 0;
    this.curSpinTime = 0;
    this.curSpinCount = 0;
    this.nudgeType = -1;
    this.slowMotionLoopCurveTime = this.config.getSpeedConfig().slowMotionLoopCurveTime;
  }

  /**
   * 要求停止
   * @param rng
   */
  public stop(rng: number): void {
    this.requestStop = true;
    this.slowMotionLoopContinueTime = 0;
    this.finalRng = this.getRng(rng - 1);
    this.curSpinTime = 0;
  }

  public skip(): void {
    this.reelState = ReelState2.END;
    this.curveTime = 0; //this.config.getSpeedConfig().endCurveTime * .8;
    this.currentRng = this.finalRng;
    this.setSymbolState(SymbolState2.Normal);
    this.symbolList.forEach((symbol, idx) => {
      let stripIdx = this.getRng(this.currentRng - this.keepRow + symbol.getPosIndex() + this.config.direction);
      symbol.setSymbolID(this.strip[stripIdx], stripIdx);
    });
  }

  /**
   * 是否已停止
   * @returns
   */
  public isEnd(): boolean {
    return this.curSpinTime >= this.config.getSpeedConfig().spinTime;
  }

  public update(deltaTime: number): void {
    if (this.isFixedReel) return; //無滾動盤面軸不更新
    //累積時間
    this.curveTime += deltaTime;
    //閒置
    if (this.reelState === ReelState2.IDLE) {
    }
    //啟動
    else if (this.reelState === ReelState2.BEGIN) {
      this.debug('BEGIN');
      this.updateBeginState();
    }
    //循環(線性)
    else if (this.reelState === ReelState2.LOOP) {
      this.debug('LOOP');
      //累積spin時間
      this.curSpinTime += deltaTime;
      if (this.requestStop) {
        this.slowMotionLoopContinueTime += deltaTime;
      }
      this.updateLoopState();
    }
    //最後N顆(線性)
    else if (this.reelState === ReelState2.STOPPING_1) {
      this.updateSymbols(1, 0);
      let lastCount: number = this.config.maxRow + this.config.maxRow; //最後顆數以最列數最多的軸為準, 避免後面的軸顆數比較少的話會比前面的軸先停
      this.setCurrentRng(this.finalRng + lastCount);
      this.reelState = ReelState2.STOPPING;
      this.setSymbolState(SymbolState2.Normal);
      console.log('最後N顆強塞盤面finalRng', this.finalRng);
      this.updateStoppingState();
    }
    //最後N顆(線性)
    else if (this.reelState === ReelState2.STOPPING) {
      this.debug('STOPPING');
      this.updateStoppingState();
    }
    //煞車
    else if (this.reelState === ReelState2.END) {
      this.debug('END');
      this.updateEndState();
    }
    //煞車
    else if (this.reelState === ReelState2.NUDGE) {
      this.debug('NUDGE');
      this.updateEndState();
    }
  }

  /**
   * 內插
   * @param a
   * @param b
   * @param ratio
   * @returns
   */
  private interpolate(a: Vec3, b: Vec3, ratio: number): Vec3 {
    let newX: number = a.x + (b.x - a.x) * ratio;
    let newY: number = a.y + (b.y - a.y) * ratio;
    let newZ: number = a.z + (b.z - a.z) * ratio;
    return new Vec3(newX, newY, newZ);
  }

  /**
   * 啟動
   */
  private updateBeginState(): void {
    //超過begin就切換到loop
    if (this.curveTime >= this.config.getSpeedConfig().beginCurveTime) {
      this.node.emit(SlotReel2.BEGIN_COMPLETE, this.reelIndex);
      this.reelState = ReelState2.LOOP;
      this.curveTime = this.curveTime % this.config.getSpeedConfig().beginCurveTime;
      this.updateSymbols(1, this.getBeginCurveTime(this.curveTime));
      this.setSymbolState(SymbolState2.Blur);
      this.setCurrentRng(this.currentRng - this.config.direction);
    } else {
      let curveValue = this.getBeginCurveTime(this.curveTime);
      this.updateSymbols(0, curveValue);
    }
  }

  private getBeginCurveTime(time: number): number {
    let curve = this.config.beginCurve;
    let curveTime = time / this.config.getSpeedConfig().beginCurveTime;
    let curveValue = curve.evaluate(curveTime) / 0.5;
    return curveValue;
  }

  /**
   * 循環
   */
  private updateLoopState(): void {
    //一顆進度內(ratio = 0 ~ 0.9)
    let loopCurveTime = this.isMi ? this.slowMotionLoopCurveTime : this.config.getSpeedConfig().loopCurveTime;
    if (this.curveTime < loopCurveTime) {
      this.updateSymbols(0, this.getLoopCurveTime(this.curveTime));
    }
    //走完一顆進度(ratio = 1)
    else {
      let reelCanStop = false;
      //第一軸達停軸基本秒數 or 後續軸達第一軸基本顆數
      if (this.isMi) {
        reelCanStop =
          this.curSpinTime >= this.config.getSpeedConfig().spinTime &&
          this.slowMotionLoopContinueTime >= this.config.getSpeedConfig().slowMotionBeginTime;
      } else {
        reelCanStop = this.curSpinTime >= this.config.getSpeedConfig().spinTime;
      }
      //滿足停軸條件
      if (this.requestStop && reelCanStop) {
        //要再刷新一次座標,否則會卡一幀
        this.updateSymbols(0, this.getLoopCurveTime(this.curveTime));
        //開始替換最終輪帶
        this.reelState = ReelState2.STOPPING_1;
        this.curveTime = this.curveTime % loopCurveTime;
      }
      //繼續loop
      else {
        this.curveTime = this.curveTime % loopCurveTime;
        this.updateSymbols(1, this.getLoopCurveTime(this.curveTime));
        this.setCurrentRng(this.currentRng - this.config.direction);
        this.curSpinCount++;
      }
    }
  }

  private getLoopCurveTime(time: number): number {
    let curveTime;
    let curveValue;
    if (this.isMi) {
      if (this.slowMotionLoopContinueTime >= this.config.getSpeedConfig().slowMotionBeginTime) {
        curveTime = this.isMi ? time / this.slowMotionLoopCurveTime : time / this.config.getSpeedConfig().loopCurveTime;
      } else {
        curveTime = time / this.config.getSpeedConfig().loopCurveTime;
      }
    } else {
      curveTime = this.isMi ? time / this.slowMotionLoopCurveTime : time / this.config.getSpeedConfig().loopCurveTime;
    }
    //線性
    curveValue = curveTime;
    return curveValue;
  }

  /**
   * 最後N顆
   */
  private updateStoppingState(): void {
    let loopCurveTime = this.isMi ? this.slowMotionLoopCurveTime : this.config.getSpeedConfig().loopCurveTime;
    //到達終點
    if (this.currentRng === this.getRng(this.finalRng + this.config.direction)) {
      this.reelState = this.nudgeType !== -1 ? ReelState2.NUDGE : ReelState2.END;

      this.setSymbolState(SymbolState2.Normal);
    }
    //繼續loop
    else {
      if (this.curveTime >= loopCurveTime) {
        // 方案A：使用指數曲線平滑減速
        if (this.isMi) {
          let totalDistance = this.config.maxRow * 2;
          //計算當前位置到終點的數量距離
          let remainingDistance =
            XUtils.circularDistance(this.getRng(this.currentRng), this.getRng(this.finalRng), this.strip.length) - 1;
          // 計算進度 (0 = 開始, 1 = 接近結束)
          let progress = 1 - remainingDistance / totalDistance;
          progress = Math.max(0, Math.min(1, progress)); // 限制在 0-1 之間

          // 使用反向三次方曲線：前期快速減速，後期保持慢速
          let minSpeed = this.config.getSpeedConfig().slowMotionLoopCurveTime; // 0.08
          let maxSpeed = 0.5;
          this.slowMotionLoopCurveTime = minSpeed + (maxSpeed - minSpeed) * Math.pow(progress, 2);
          // this.slowMotionLoopCurveTime = minSpeed + (maxSpeed - minSpeed) * (1 - Math.pow(1 - progress, 3));
        }

        this.curveTime = this.curveTime % loopCurveTime;
        this.updateSymbols(1, this.getLoopCurveTime(this.curveTime));
        this.setCurrentRng(this.currentRng - this.config.direction, true);
      } else {
        this.updateSymbols(0, this.getLoopCurveTime(this.curveTime));
      }
    }
  }

  /**
   * 剎車
   */
  private updateEndState(): void {
    let isCurveFinish = false;
    if (this.reelState === ReelState2.NUDGE) {
      isCurveFinish = this.curveTime >= this.config.getSpeedConfig().nudgeCurveTime;
    } else if (this.reelState === ReelState2.END) {
      isCurveFinish = this.isMi
        ? this.curveTime >= this.config.getSpeedConfig().slowMotionEndTime
        : this.curveTime >= this.config.getSpeedConfig().endCurveTime;
    }
    if (isCurveFinish) {
      this.currentRng = this.finalRng;
      this.reelState = ReelState2.STOPPED;
      this.updateSymbols(1, 0);
      this.setSymbolState(SymbolState2.Normal);
      this.symbolList.forEach((symbol, idx) => {
        //針對畫面內、外圖示演示到定位動畫
        let isInView = this.isInView(symbol.getPosIndex());
        symbol.hit(isInView);
      });
      //停輪時強制刷新盤面, 否則下次spin開始時, 畫面上的symbol會與輪帶資料不符
      this.setCurrentRng(this.finalRng, true);
      this.reset();

      this.node.emit(SlotReel2.STOP_COMPLETE, this.reelIndex);
    } else {
      if (this.reelState === ReelState2.NUDGE) {
        this.updateSymbols(0, this.getNudgeCurveTime(this.curveTime));
      } else {
        this.updateSymbols(0, this.getEndCurveTime(this.curveTime));
      }
    }
  }

  private getEndCurveTime(time: number): number {
    // 方案A：瞇牌時也使用緩動曲線，讓煞車更有彈性
    let curve = this.config.endCurve;
    let curveTime = this.isMi
      ? time / this.config.getSpeedConfig().slowMotionEndTime
      : time / this.config.getSpeedConfig().endCurveTime;
    let curveValue = curve ? curve.evaluate(curveTime) / 0.5 : curveTime;
    return curveValue;
  }

  private getNudgeCurveTime(time: number): number {
    let curve = this.config.nudgeCurveList[this.nudgeType];
    let curveTime = time / this.config.getSpeedConfig().nudgeCurveTime;
    let curveValue = curve.evaluate(curveTime) / 0.5;
    return curveValue;
  }

  private getRng(value: number): number {
    return (value + this.strip.length) % this.strip.length;
  }

  /**
   * 設定目前輪帶索引位置
   * @param rng
   */
  private setCurrentRng(rng: number, isFinal: boolean = false): void {
    this.currentRng = this.getRng(rng);
    let symbol = this.symbolList.find((symbol) => symbol.getPosIndex() === 0);
    if (!symbol) return;

    let symbolID: number;
    //最後N顆強塞盤面
    if (
      this.reelState === ReelState2.STOPPING &&
      this.forceResult.length > 0 &&
      XUtils.circularDistance(this.getRng(rng), this.getRng(this.finalRng), this.strip.length) <= this.keepRow * 2
    ) {
      symbolID = this.forceResult.pop();
      symbol.setSymbolID(symbolID, -1, isFinal);
    } else {
      let symbol0Rng = this.getRng(this.currentRng - this.config.direction * this.keepRow); //轉換成拿來換圖的那一顆索引
      symbolID = this.strip[symbol0Rng];
      symbol.setSymbolID(symbolID, symbol0Rng, isFinal);
    }
  }

  /**
   * 更新位置資訊
   * @param step 要移動步數
   * @param ratio 目前Node進度
   */
  private updateSymbols(step: number, ratio: number): void {
    this.symbolList.forEach((symbol, idx) => {
      //這次update要走的步數刷新posIndex
      symbol.setPosIndex(this.getPosIdx(symbol.getPosIndex() + this.config.direction * step));
      // symbol.node.setSiblingIndex(symbol.getPosIndex());//由上至下,深度排序, 改由Symbol自定義
      symbol.getComponent(UIOpacity).opacity =
        symbol.getPosIndex() === this.symbolList.length - 1 ? SlotReel2.HIDE_OPACITY : SlotReel2.VISIBLE_OPACITY;

      let curNode = this.posList[this.getPosIdx(symbol.getPosIndex())];
      let nextNode = this.posList[this.getPosIdx(symbol.getPosIndex() + this.config.direction)];

      //座標
      symbol.node.setPosition(this.interpolate(curNode.getPosition(), nextNode.getPosition(), ratio));

      //縮放
      symbol.node.setScale(this.interpolate(curNode.getScale(), nextNode.getScale(), ratio));
    });
  }

  /**
   * 設定symbol狀態
   * @param state
   */
  private setSymbolState(state: SymbolState2): void {
    this.symbolList.forEach((symbol, idx) => {
      symbol.setState(state);
    });
  }

  private debug(data: any): void {
    // console.warn(data);
  }

  //====================================== 無滾動盤面流程 ==================================

  /**
   * 無滾動盤面預處理
   */
  public fixedPreSpin(): void {
    this.symbolRunStop = Array(this.symbolList.length).fill(false);
    this.symbolList.forEach((symbol, i) => {
      symbol.onSpin();
      symbol.setState(SymbolState2.Normal);
    });
  }

  /**
   * 無滾動盤面退場
   */
  public async fixedSpin(): Promise<void> {
    if (this.reelState !== ReelState2.IDLE) return;
    this.reelState = ReelState2.BEGIN;
    this.reset();

    //由下往上, 檢查可見區域的symbol
    const len = this.symbolList.length;
    const height = this.symbolList[0].getComponent(UITransform).height;
    const reelHeight = height * this.viewRow;
    for (let i = len - 1; i >= 0; i--) {
      //從最下面一顆開始
      const symbol: BaseSymbol2 = this.symbolList[i];
      const curPos = this.posList[i].getPosition();
      const outPos = new Vec3(curPos.x, curPos.y - reelHeight, 0); //設置終點位置
      const beginOutTime = this.config.getSpeedConfig().beginCurveTime;
      //退場移動
      tween(symbol.node)
        .to(beginOutTime, { position: outPos }, { easing: easing.cubicIn })
        .call(() => {
          symbol.node.active = false; //隱藏symbol
          //如果是最後一顆, 則通知該軸輪帶退場完成
          if (i === 0) {
            this.node.emit(SlotReel2.FIXED_OUT_COMPLETE, this.reelIndex);
          }
        })
        .start();

      //單顆symbol掉落間隔大於0才做延遲
      const stopIntervalDelay = this.config.getSpeedConfig().stopInterval;
      if (stopIntervalDelay > 0) {
        await delay(stopIntervalDelay);
      }
      if (this.reelState !== ReelState2.BEGIN) {
        return;
      }
    }
  }

  /**
   * 無滾動盤面入場
   * @param newPattern 新盤面資料
   * @param symbolDelay 單顆symbol延遲時間
   */
  public async fixedStop(newPattern: number[], symbolDelay: number): Promise<void> {
    this.reelState = ReelState2.LOOP;
    //由下往上, 檢查可見區域的symbol
    const len = this.symbolList.length;
    const height = this.symbolList[0].getComponent(UITransform).height;
    const reelHeight = height * this.viewRow;
    for (let i = len - 1; i >= 0; i--) {
      //咪牌時，最後一軸才需要延遲

      //從最下面一顆開始
      const symbol: BaseSymbol2 = this.symbolList[i];
      this.symbolRunStop[i] = true;
      symbol.node.active = true; //顯示symbol
      const endPos = this.posList[i].getPosition(); //落點位置
      const symbolID = newPattern[i];
      symbol.setSymbolID(symbolID, i, false);
      const startPos = new Vec3(endPos.x, endPos.y + reelHeight, 0); //設置起點位置
      symbol.node.setPosition(startPos);
      const endTime = this.config.getSpeedConfig().endCurveTime;
      const easingFunc = this.isMi ? easing.expoOut : easing.cubicOut;
      //入場移動
      tween(symbol.node)
        .delay(symbolDelay)
        .to(endTime, { position: endPos }, { easing: easingFunc })
        .call(() => {
          symbol.hit(true);
          //如果是最後一顆, 則通知該軸輪帶入場完成
          if (i === len - 1) {
            this.node.emit(SlotReel2.STOP_ON_REEL, this.reelIndex);
          }
          if (i === 0) {
            this.fixedReelEnd();
          }
        })
        .start();

      if (symbolDelay > 0) {
        await delay(symbolDelay);
      }
      if (this.reelState !== ReelState2.LOOP) {
        return;
      }

      //單顆symbol掉落間隔大於0才做延遲
      // const stopIntervalDelay = this.config.getSpeedConfig().stopInterval;
      // if (this.reelState !== ReelState2.LOOP) {
      //   return;
      // }
    }
  }

  /**
   * 無滾動盤面急停
   * @param newPattern 新盤面資料
   */
  public fixedSkip(newPattern: number[]): void {
    this.reelState = ReelState2.END;
    const len = this.symbolList.length;
    const height = this.symbolList[0].getComponent(UITransform).height;
    const reelHeight = height * this.viewRow;
    for (let i = len - 1; i >= 0; i--) {
      const symbol: BaseSymbol2 = this.symbolList[i];
      Tween.stopAllByTarget(symbol.node);
      const endPos = this.posList[i].getPosition(); //落點位置
      if (!this.symbolRunStop[i]) {
        const startPos = new Vec3(endPos.x, endPos.y + reelHeight, 0); //設置起點位置
        symbol.node.setPosition(startPos);
        symbol.node.active = true; //顯示symbol
        const symbolID = newPattern[i];
        symbol.setSymbolID(symbolID, i, false);
      }
      //急停入場移動
      tween(symbol.node)
        .to(0.1, { position: endPos }, { easing: easing.cubicOut })
        .call(() => {
          if (!symbol.isInView) {
            symbol.hit(true);
          }
          if (i === len - 1 && !this.symbolRunStop[i]) {
            this.node.emit(SlotReel2.STOP_ON_REEL, this.reelIndex);
          }
          this.symbolRunStop[i] = true;
          //如果是最後一顆, 則通知該軸輪帶入場完成
          if (i === 0) {
            this.fixedReelEnd();
          }
        })
        .start();
    }
  }

  /**
   * 無滾動盤面結束
   */
  private fixedReelEnd(): void {
    this.node.emit(SlotReel2.STOP_COMPLETE, this.reelIndex);
  }

  /**
   * 無滾動盤面掉落
   */
  public async fixedDrop(): Promise<void> {
    let dropSymbolList: BaseSymbol2[] = []; //要掉落的symbol列表

    //由下往上, 檢查可見的symbol
    for (let i = this.symbolList.length - 1; i >= 0; i--) {
      const emptySymbol = this.symbolList[i];
      //跳過實心圖示
      if (emptySymbol.getIsEmpty() === false) {
        continue;
      }
      //從該位置向上找實心圖示
      let solidPos = i - 1;
      while (true) {
        const solidSymbol = this.symbolList[solidPos]; //向上實心symbol
        if (!solidSymbol) {
          break;
        }
        //此位置已標記空, 繼續向上找
        if (solidSymbol.getIsEmpty() == true) {
          solidPos = solidPos - 1;
        } else {
          //找到可用實心圖示
          solidSymbol.setPosIndex(i); //設置實心圖示位置
          solidSymbol.node.name = `symbol_${this.reelIndex}_${i}`;
          solidSymbol.setIsEmpty(true); //該節點會掉落，所以設置為空圖示
          // solidSymbol.setSymbolID(toMap[i].symbolID, i);
          dropSymbolList.push(solidSymbol);
          break;
        }
      }
    }

    //沒有可掉落的symbol
    if (dropSymbolList.length <= 0) {
      this.node.emit(SlotReel2.DROP_COMPLETE, this.reelIndex);
      return;
    }

    for (let i = 0; i < dropSymbolList.length; i++) {
      const symbol = dropSymbolList[i];
      const posIndex = symbol.getPosIndex();

      this.dropAnim(symbol, this.posList[posIndex].getPosition(), easing.sineOut, () => {
        symbol.setIsEmpty(false);
        //該軸實心圖示掉落完成
        if (i === dropSymbolList.length - 1) {
          this.node.emit(SlotReel2.DROP_COMPLETE, this.reelIndex);
        }
      });

      //單顆symbol掉落間隔大於0才做延遲
      // const dropSymbolDelay = this.config.getSpeedConfig().dropSymbolDelay;
      // if (dropSymbolDelay > 0) {
      //   await delay(dropSymbolDelay);
      // }
    }
    // 根據位置重新調整 symbolList排序
    this.symbolList.sort((a, b) => a.getPosIndex() - b.getPosIndex());
  }

  /**
   * 無滾動盤面填充
   * @param toMap 要填充的symbol資料
   */
  public async fixedFill(toMap: BaseSymbolData2[]): Promise<void> {
    //記錄空的symbol
    let emptySymbolList: BaseSymbol2[] = [];
    for (let i = 0; i < this.symbolList.length; i++) {
      if (this.symbolList[i].getIsEmpty() === true) {
        emptySymbolList.push(this.symbolList[i]);
      }
    }

    //沒有空格
    if (emptySymbolList.length <= 0) {
      this.node.emit(SlotReel2.FILL_COMPLETE, this.reelIndex);
      return;
    }

    let fillSymbolList: BaseSymbol2[] = []; //要填充的symbol列表

    //沒有瞇牌才需要多檢查可見的symbol
    if (!this.isMi) {
      //由下往上, 檢查可見的symbol
      for (let i = this.symbolList.length - 1; i >= 0; i--) {
        const emptySymbol = this.symbolList[i];
        //跳過實心圖示
        if (emptySymbol.getIsEmpty() === false) {
          continue;
        }
        //從該位置向上找實心圖示
        let solidPos = i - 1;
        while (true) {
          const solidSymbol = this.symbolList[solidPos]; //向上實心symbol
          if (!solidSymbol) {
            break;
          }
          //此位置已標記空, 繼續向上找
          if (solidSymbol.getIsEmpty() == true) {
            solidPos = solidPos - 1;
          } else {
            //找到可用實心圖示
            solidSymbol.setPosIndex(i); //設置實心圖示位置
            solidSymbol.node.name = `symbol_${this.reelIndex}_${i}`;
            solidSymbol.setIsEmpty(true); //該節點會掉落，所以設置為空圖示
            solidSymbol.setSymbolID(toMap[i].symbolID, i);
            fillSymbolList.push(solidSymbol);
            break;
          }
        }
      }
    }

    //把空的symbol添加到fillSymbolList
    const emptyCount = emptySymbolList.length;
    for (let i = 0; i < emptySymbolList.length; i++) {
      const symbol = emptySymbolList[i];
      const posIndex = emptyCount - 1 - i;
      symbol.setPosIndex(posIndex);
      symbol.node.name = `symbol_${this.reelIndex}_${posIndex}`;
      const height = symbol.getComponent(UITransform).height;
      const firstPos = this.posList[0].getPosition();
      symbol.node.setPosition(new Vec3(firstPos.x, firstPos.y + height * (i + 1), 0));
      symbol.setSymbolID(toMap[posIndex].symbolID, posIndex);
      fillSymbolList.push(symbol);
    }

    let script = tween(this.node);

    for (let i = 0; i < fillSymbolList.length; i++) {
      const symbol = fillSymbolList[i];
      const posIndex = symbol.getPosIndex();
      script.call(() => {
        const easingFunc = this.isMi ? easing.expoOut : easing.sineOut;
        this.dropAnim(symbol, this.posList[posIndex].getPosition(), easingFunc, () => {
          symbol.setIsEmpty(false);
          //該軸實心圖示掉落完成
          if (i === fillSymbolList.length - 1) {
            this.symbolList.forEach((v) => {
              v.setIsEmpty(false);
            }, this);

            this.node.emit(SlotReel2.FILL_COMPLETE, this.reelIndex);
          }
        });
      });
      if (this.isMi) {
        script.delay(this.config.getSpeedConfig().dropSymbolDelay);
      }

      //單顆symbol掉落間隔大於0才做延遲
      // const dropSymbolDelay = this.config.getSpeedConfig().dropSymbolDelay;
      // if (dropSymbolDelay > 0) {
      //   await delay(dropSymbolDelay);
      // }
    }
    // 根據位置重新調整 symbolList排序
    this.symbolList.sort((a, b) => a.getPosIndex() - b.getPosIndex());
    script.start();
  }

  /**
   * 掉落動畫
   * @param symbol
   * @param endPos
   * @param easingFunc
   * @param onComplete
   */
  private dropAnim(symbol: BaseSymbol2, endPos: Vec3, easingFunc: (k: number) => number, onComplete: () => void): void {
    const dropTime = this.config.getSpeedConfig().dropTime;
    //判斷掉落距離多少symbol高度，來決定增加多少下移時間
    const dropDistance = symbol.node.getPosition().y - endPos.y; //掉落距離高度
    const baseDropTime = dropTime * 0.5; //小於一個單位的下移時間
    const distanceRatio = dropDistance / 250; //高度距離比例(一單位200距離)
    const newDropTime = distanceRatio > 1 ? ((1 + distanceRatio) * baseDropTime) / 2 : baseDropTime; //超過一個單位增加1/2下移時間
    tween(symbol.node)
      .to(newDropTime, { position: endPos }, { easing: easingFunc })
      .call(() => {
        symbol.hit(true);
        onComplete?.();
      })
      .start();
  }
  //====================================== 無滾動盤面流程 ==================================

  /**
   * 向下掉落補空
   * @param toMap
   */
  public async drop(): Promise<void> {
    //該軸消去顆數
    let numDrop = this.getNumDrop();

    //沒有空格
    if (numDrop <= 0) {
      this.node.emit(SlotReel2.DROP_COMPLETE, this.reelIndex);
      return;
    }

    /**找到實心可掉落數量 */
    let numExpectDrop = 0;

    //由下往上, 檢查可見的5格(4~0)
    let len = this.symbolList.length;
    for (let i = len - 1; i > 0; i--) {
      let toPos = i;
      let solidPos: number;

      let emptySymbol: BaseSymbol2 = this.findSymbolByPosIndex(toPos);
      let solidSymbol: BaseSymbol2;

      //跳過實心圖示
      if (emptySymbol.getIsEmpty() === false) {
        continue;
      }

      //找到空心圖示
      this.debug(`位置 ${this.reelIndex},${toPos} 已空`);

      //從該位置向上找實心圖示
      solidPos = toPos - 1;

      while (true) {
        solidSymbol = this.findSymbolByPosIndex(solidPos);
        if (this.isInView(solidPos) === false) {
          //畫面內已找不到需要掉落物件
          solidSymbol = null;
          break;
        }
        if (!solidSymbol) {
          //空心以上已經沒有圖示物件
          break;
        }
        //此位置已標記空, 繼續向上找
        else if (solidSymbol.getIsEmpty() == true) {
          solidPos = solidPos - 1;
        }
        //找到可用實心圖示
        else {
          numExpectDrop++;
          break;
        }
      }

      if (!solidSymbol) {
        continue;
      }

      //把空的向上移動(交換位置)
      this.debug(`target 拿 ${solidSymbol.getPosIndex()} 來補`);
      emptySymbol.setPosIndex(solidSymbol.getPosIndex());
      emptySymbol.copyPositionAndScaleFrom(this.posList[emptySymbol.getPosIndex()]);

      //準備落下物件先標記空, 避免後續掉落取到相同目標
      solidSymbol.setIsEmpty(true);
      //先校正回掉落前的位置, 再開始掉落
      solidSymbol.setPosIndex(toPos);

      //====================================== 待調整 ==================================
      //提前設置symbol的isInView, 避免掉落時才設置, 導致掉落時間不準確
      let isInView = this.isInView(toPos);
      solidSymbol.isInView = isInView;

      this.bounceDrop(solidSymbol.node, this.posList[toPos].getPosition(), () => {
        solidSymbol.setIsEmpty(false);
        solidSymbol.hit(isInView);
        numExpectDrop--;
        //該軸實心圖示掉落完成
        if (numExpectDrop <= 0) {
          this.node.emit(SlotReel2.DROP_COMPLETE, this.reelIndex);
        }
      });
      //====================================== 待調整 ==================================

      //單顆symbol掉落間隔大於0才做延遲
      const dropSymbolDelay = this.config.getSpeedConfig().dropSymbolDelay;
      if (dropSymbolDelay > 0) {
        await delay(dropSymbolDelay);
      }
    }
  }

  //====================================== 掉落彈跳移動，待調整整合方式 ==================================
  /**
   * 掉落彈跳
   * @param node
   * @param endPos
   * @param onComplete
   */
  private bounceDrop(node: Node, endPos: Vec3, onComplete: () => void): void {
    const dropTime = this.config.getSpeedConfig().dropTime;

    // 預計算所有位置
    const bouncePositions = [
      new Vec3(endPos.x, endPos.y - 6, 0), // 第一次下降
      new Vec3(endPos.x, endPos.y + 20, 0), // 第一次反彈
      new Vec3(endPos.x, endPos.y - 3, 0), // 第二次下降
      endPos, // 最終位置
    ];

    //判斷掉落距離多少symbol高度，來決定增加多少下移時間
    const dropDistance = node.getPosition().y - endPos.y; //掉落距離高度
    const baseDropTime = dropTime * 0.5; //小於一個單位的下移時間
    const distanceRatio = dropDistance / 250; //高度距離比例(一單位200距離)
    const newDropTime = distanceRatio > 1 ? ((1 + distanceRatio) * baseDropTime) / 2 : baseDropTime; //超過一個單位增加1/2下移時間
    const durationsTimes = [
      newDropTime, //根據掉落距離調整下移時間
      dropTime * 0.2,
      dropTime * 0.2,
      dropTime * 0.1,
    ];
    const easings = [easing.sineIn, easing.sineOut, easing.sineIn, easing.sineOut];

    // 循環構建動畫序列
    let tweenSequence = tween(node);

    for (let i = 0; i < bouncePositions.length; i++) {
      tweenSequence = tweenSequence.to(
        durationsTimes[i],
        {
          position: bouncePositions[i],
        },
        {
          easing: easings[i],
        },
      );
    }

    tweenSequence
      .call(() => {
        onComplete?.();
      })
      .start();
  }
  //====================================== 掉落彈跳移動，待調整整合方式 ==================================

  public getNumEmpty(): number {
    return this.symbolList.filter((symbol) => symbol.getIsEmpty() == true).length;
  }

  public getNumDrop(): number {
    let count = 0;
    let len = this.symbolList.length;
    let findEmpty: boolean = false;
    for (let i = len - 1; i > -1; --i) {
      let symbol = this.findSymbolByPosIndex(i);
      //找到空的,開始向上計算實心物件個數
      if (findEmpty) {
        if (symbol.getIsEmpty() === false && this.isInView(symbol.getPosIndex())) {
          count++;
        }
      } else if (symbol.getIsEmpty() === true) {
        findEmpty = true;
      }
    }
    return count;
  }
  /**
   *
   * @param toMap
   */
  public async fill(toMap: BaseSymbolData2[], dropRowDelay: number): Promise<void> {
    //該軸消去顆數
    let numEmpty = this.getNumEmpty();
    //沒有空格
    if (numEmpty <= 0) {
      this.node.emit(SlotReel2.FILL_COMPLETE, this.reelIndex);
      return;
    }

    /**找到實心可掉落數量 */
    let numExpectDrop = 0;

    //由下往上, 檢查可見的5格(4~0)
    let len = this.symbolList.length;
    for (let i = len - 1; i > 0; i--) {
      let toPos = i;
      let solidPos: number;

      let emptySymbol: BaseSymbol2 = this.findSymbolByPosIndex(toPos);
      let solidSymbol: BaseSymbol2;

      //跳過實心圖示
      if (emptySymbol.getIsEmpty() === false) {
        continue;
      }

      //找到空心圖示
      this.debug(`位置 ${this.reelIndex},${toPos} 已空`);

      //從該位置向上找實心圖示
      solidPos = toPos - 1;

      while (true) {
        solidSymbol = this.findSymbolByPosIndex(solidPos);
        if (!solidSymbol) {
          //空心以上已經沒有圖示物件
          break;
        }
        //此位置已標記空, 繼續向上找
        else if (solidSymbol.getIsEmpty() == true) {
          solidPos = solidPos - 1;
        }
        //找到可用實心圖示
        else {
          numExpectDrop++;
          break;
        }
      }

      if (!solidSymbol) {
        continue;
      }

      //把空的向上移動(交換位置)
      this.debug(`target 拿 ${solidSymbol.getPosIndex()} 來補`);
      emptySymbol.setPosIndex(solidSymbol.getPosIndex());
      emptySymbol.copyPositionAndScaleFrom(this.posList[emptySymbol.getPosIndex()]);

      //準備落下物件先標記空, 避免後續掉落取到相同目標
      solidSymbol.setIsEmpty(true);
      //先校正回掉落前的位置, 再開始掉落
      solidSymbol.setPosIndex(toPos);

      //有給最終盤面
      if (toMap) {
        if (this.isInView(toPos) === true) {
          solidSymbol.setSymbolData(toMap[i - this.keepRow]);
        }
        //盤面外(上方4-0)
        else {
          //預覽 = 最終位置(輪帶-消去數量) -1(往上一格) -(4~0)
          let previewStripIdx = this.getRng(this.finalRng - numEmpty - (this.keepRow - i));
          let symbolID = this.strip[previewStripIdx];
          solidSymbol.setSymbolID(symbolID, previewStripIdx);
        }
      }
      //沒給最終盤面
      else {
        //預覽 = 最終位置(輪帶-消去數量) -1(往上一格) -(4~0)
        let previewStripIdx = this.getRng(this.finalRng - numEmpty - (this.keepRow - i));
        let symbolID = this.strip[previewStripIdx];
        solidSymbol.setSymbolID(symbolID, previewStripIdx);
      }

      //====================================== 待調整 ==================================
      //提前設置symbol的isInView, 避免掉落時才設置, 導致掉落時間不準確
      let isInView = this.isInView(toPos);
      solidSymbol.isInView = isInView;

      this.bounceDrop(solidSymbol.node, this.posList[toPos].getPosition(), () => {
        solidSymbol.setIsEmpty(false);
        solidSymbol.hit(isInView);

        numExpectDrop--;
        //該軸實心圖示掉落完成
        if (numExpectDrop <= 0) {
          //更新rng
          this.finalRng -= numEmpty;
          this.symbolList.forEach((v) => {
            v.setIsEmpty(false);
          }, this);

          this.node.emit(SlotReel2.FILL_COMPLETE, this.reelIndex);
        }
      });
      //====================================== 待調整 ==================================

      //單顆symbol掉落間隔大於0才做延遲
      const dropSymbolDelay = this.config.getSpeedConfig().dropSymbolDelay;
      if (dropSymbolDelay > 0) {
        await delay(dropSymbolDelay);
      }
    }
  }

  /**是否在畫面內(目前因為是base無法與GameData共用判斷式, 後續再想解決辦法) */
  private isInView(posIndex: number): boolean {
    return posIndex >= this.keepRow && posIndex <= this.keepRow + this.viewRow - 1;
  }

  /**
   * 取得位置圖示
   * @param posIndex
   * @returns
   */
  private findSymbolByPosIndex(posIndex: number): BaseSymbol2 {
    return this.symbolList.find((symbol) => symbol.getPosIndex() == posIndex);
  }

  /**
   * 消去
   * @param pos
   */
  public explode(pos: number[]): void {
    let explodeRow = [];
    pos.forEach((v) => {
      let grid = XUtils.posToGrid(v);
      explodeRow.push(grid.row + this.keepRow);
    });

    this.symbolList.forEach((symbol) => {
      let posIdx = symbol.getPosIndex();
      if (explodeRow.indexOf(posIdx) !== -1) {
        if (this.isInView(posIdx) === false) {
          throw new Error('資料異常:消去畫面外圖示!!');
        }
        symbol.setIsEmpty(true);
        symbol.setSymbolID(-1, -1);
        symbol.explode();
      }
    }, this);
  }

  /**
   * 得分位置
   * @param pos
   */
  public showWin(pos: number[]): void {
    let winRow = [];
    pos.forEach((v) => {
      let grid = XUtils.posToGrid(v);
      winRow.push(grid.row + this.keepRow);
    });

    this.symbolList.forEach((symbol) => {
      let posIdx = symbol.getPosIndex();
      if (winRow.indexOf(posIdx) !== -1) {
        symbol.showWin();
      } else {
        symbol.hideWin();
      }
    }, this);
  }

  /**
   * 關閉中獎效果
   * @param pos
   */
  public hideWin(): void {
    this.symbolList.forEach((symbol) => {
      symbol.hideWin();
    }, this);
  }

  /**
   * 設定強制結果盤面
   * @param forceResult
   */
  public setForceResult(forceResult: number[]) {
    this.forceResult = forceResult;
  }

  /**
   * 全部軸已停止
   */
  public onStop(): void {
    this.reelState = ReelState2.IDLE;
    this.symbolList.forEach((symbol) => {
      symbol.onStop();
    }, this);
  }

  /**
   * 開始瞇牌
   */
  public setIsMi(mi: boolean): void {
    this.isMi = mi;
    this.symbolList.forEach((symbol) => {
      symbol.setIsMi(mi);
    }, this);

    if (this.isMi === true && this.config.getSpeedConfig().miAllReel === false) {
      this.curSpinTime = 0;
    }
  }
  public setNudgeType(type: number): void {
    this.nudgeType = type;
  }

  /**
   * 開始瞇牌
   */
  public setVisible(visible: boolean): void {
    this.symbolList.forEach((symbol) => {
      symbol.setVisible(visible);
    }, this);
  }

  /**
   * 直接變盤
   * @param toMap
   */
  public change(toMap: BaseSymbolData2[]): void {
    if (!toMap) {
      return;
    }

    toMap.forEach((value, idx) => {
      let symbol = this.findSymbolByPosIndex(idx + this.keepRow);
      symbol.changeSymbolData(value);
      if (value) {
        symbol.setIsEmpty(false);
      }
    }, this);
  }

  public isEnding(): boolean {
    return this.reelState === ReelState2.STOPPED || this.reelState === ReelState2.END;
  }

  public isStopped(): boolean {
    return this.reelState === ReelState2.STOPPED;
  }

  /**
   * 取得軸上圖示列表
   * @returns
   */
  public getReelSymbolList(): BaseSymbol2[] {
    return this.symbolList;
  }
}
