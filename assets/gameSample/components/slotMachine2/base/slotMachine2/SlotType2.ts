import { _decorator, CCFloat, Node, Prefab, RealCurve, TweenEasing } from 'cc';
import { DataManager } from 'db://assets/base/script/data/DataManager';
const { ccclass, property } = _decorator;
/**
 * 軸參數
 */
export class SlotReelConfig2 {
  /**Symbol */
  symbolPrefab: Prefab;
  /**啟動曲線 */
  beginCurve: RealCurve;
  /**結尾曲線 */
  endCurve: RealCurve;
  /**結尾曲線 */
  nudgeCurveList: RealCurve[];
  /**方向 */
  direction: number = 1;
  /**速度參數 */
  speedConfigList: SpeedConfig2[];
  /**層級 */
  public layerList: Node[] = [];
  /**層級 */
  public reelLayerList: Node[] = [];
  /**最大列數 */
  public maxRow: number = 0;
  /**瞇牌個數 */
  // public miCount: number = 0;
  /**掉落曲線 */
  public dropEasing: TweenEasing = 'bounceOut';

  public getSpeedConfig(): SpeedConfig2 {
    let turboMode = DataManager.getInstance().curTurboMode;
    return this.speedConfigList[turboMode];
  }

  /**
   * 取得完整滾動時間
   * @returns 完整滾動時間
   */
  public getTotalScrollTime(): number {
    let speedConfig = this.getSpeedConfig();
    return speedConfig.spinTime + speedConfig.loopCurveTime * this.maxRow * 2 + speedConfig.endCurveTime;
  }

  public getSlowMotionTotalScrollTime(): number {
    let speedConfig = this.getSpeedConfig();
    return (
      speedConfig.slowMotionBeginTime +
      speedConfig.slowMotionLoopCurveTime * this.maxRow * 2 +
      speedConfig.slowMotionEndTime +
      speedConfig.slowMotionEndStayTime
    );
  }
}

/**
 * 速度參數
 */
@ccclass('SpeedConfig2')
export class SpeedConfig2 {
  /**轉動軸間隔秒數 */
  @property({ type: CCFloat, tooltip: '轉動軸間隔秒數' })
  spinInterval: number = 0.1;
  @property({ type: CCFloat, tooltip: '轉動軸間隔秒數' })
  stopInterval: number = 0;
  /**啟動秒數 */
  @property({ type: CCFloat, tooltip: '啟動曲線秒數' })
  beginCurveTime: number = 0.5;
  /**循環秒數 */
  @property({ type: CCFloat, tooltip: '循環曲線秒數' })
  loopCurveTime: number = 0.05;
  /**結尾秒數 */
  @property({ type: CCFloat, tooltip: '結尾曲線秒數' })
  endCurveTime: number = 0.1;
  /**結尾秒數 */
  @property({ type: CCFloat, tooltip: '戲謔曲線秒數' })
  nudgeCurveTime: number = 1;
  /**至少滾動N秒 */
  @property({ type: CCFloat, tooltip: '至少滾動N秒' })
  spinTime: number = 1;
  /**轉動軸間隔秒數 */
  @property({ type: CCFloat, tooltip: '掉落軸間隔秒數' })
  dropInterval: number = 0.1;
  /**掉落秒數 */
  @property({ type: CCFloat, tooltip: '掉落秒數' })
  dropTime: number = 0.1;
  /**單顆symbol掉落間隔 */
  @property({ type: CCFloat, tooltip: '單顆symbol掉落間隔秒數' })
  dropSymbolDelay: number = 0;
  @property({ type: CCFloat, tooltip: '瞇牌啟動快速轉時間' })
  slowMotionBeginTime: number = 1;
  /**瞇牌秒數 */
  @property({ type: CCFloat, tooltip: '瞇牌循環曲線秒數' })
  slowMotionLoopCurveTime: number = 0.08;
  /**瞇牌停止秒數 */
  @property({ type: CCFloat, tooltip: '瞇牌結束曲線秒數' })
  slowMotionEndTime: number = 0.4;
  /**瞇牌結束停留秒數 */
  @property({ type: CCFloat, tooltip: '瞇牌結束停留秒數' })
  slowMotionEndStayTime: number = 0;
  /**瞇牌等待掉落秒數 */
  @property({ type: CCFloat, tooltip: '瞇牌等待掉落秒數' })
  slowMotionWaitDropTime: number = 0;
  @property({ tooltip: '是否瞇全部軸' })
  miAllReel: boolean = true;
}

/**
 * 圖示狀態
 */
export enum SymbolState2 {
  Normal = 0,
  Blur,
  Ani,
}

/**
 * 軸狀態定義
 */
export enum ReelState2 {
  /**待機 */
  IDLE = 0,
  /**啟動 */
  BEGIN,
  /**循環 */
  LOOP,
  /**最後N顆(先校正位置,才不會把替換到畫面中圖示) */
  STOPPING_1,
  /**最後N顆 */
  STOPPING,
  /**結尾 */
  END,
  /**已停止 */
  STOPPED,
  /**戲謔 */
  NUDGE,
}
