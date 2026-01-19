import {
  Animation,
  AnimationState,
  Button,
  director,
  Node,
  Scheduler,
  sp,
  SpriteFrame,
  tween,
  UIOpacity,
  Vec3,
} from 'cc';
// import { CHEAT } from 'cc/userland/macro';
// import { BaseConst } from '../constant/BaseConst';
// import { Grid, SpreadObject } from '../types/BaseType';

/**
 * 共用工具方法類
 */
export class XUtils {
  /**
   * 轉換Long
   * @param low
   * @param high
   * @param unsigned
   * @returns
   */
  public static convertToLong(data: number | { low: number; high: number; unsigned: boolean }): number {
    if (typeof data === 'object' && 'low' in data && 'high' in data) {
      const { low, high, unsigned } = data;
      data.low = data.low | 0;
      data.high = data.high | 0;
      data.unsigned = !!data.unsigned;
      if (data.unsigned) return (data.high >>> 0) * 4294967296 + (data.low >>> 0);
      return data.high * 4294967296 + (data.low >>> 0);
    } else {
      return data;
    }
  }

  /**
   * 從陣列隨機取出一筆資料
   * @param list
   * @returns
   */
  public static getRandomFromList<T>(list: T[]): T {
    return list[Math.floor(Math.random() * list.length)];
  }

  /**
   * 資料索引轉換為視覺盤面索引
   * @param mapCol
   * @param mapRow
   * @param index
   */
  // public static getMapIndex(idx: number, maxRow: number): number {
  //   let row = idx % maxRow;
  //   let col = Math.floor(idx / maxRow);
  //   let mapIdx = row * BaseConst.MAP_MAX_COLUMN + col;
  //   return mapIdx;
  // }

  /**
   * 視覺盤面索引轉為資料索引
   * @param mapIdx
   * @param maxCol
   * @returns
   */
  // public static mapIndexToIndex(mapIdx: number, maxCol: number): number {
  //   let row = mapIdx % BaseConst.MAP_MAX_COLUMN;
  //   let col = Math.floor(mapIdx / BaseConst.MAP_MAX_COLUMN);
  //   let idx = row * maxCol + col;
  //   return idx;
  // }

  /**
   * 切割文字
   * @param text 被切割的文字
   * @param split 切割的文字
   * @param index 陣列第幾個(負的為倒數)
   * @returns
   */
  public static getSplit(text: string, split: string = '', index: number = 0): string {
    let textArr = text.split(split);
    if (index < 0) {
      index = textArr.length + index;
    }
    return textArr[index];
  }

  /**
   * 中獎位置軸索引清單
   * @param pos
   * @returns
   */
  public static getWinPosColumns(pos: number[]): number[] {
    let result: number[] = [];
    pos.forEach((pos, index) => {
      let col: number = Math.floor(pos / 10);
      result.indexOf(col) == -1 && result.push(col);
    });
    return result;
  }

  /**
   * winPos轉換col,row
   * @param pos
   * @returns
   */
  public static posToGrid(pos: number): { col: number; row: number } {
    let col = Math.floor(pos / 10);
    let row = (pos % 10) - 1;
    return { col: col, row: row };
  }

  public static gridToPos(col: number, row: number): number {
    return col * 10 + row + 1;
  }

  /**
   * winPos轉換位置索引
   * @param pos
   * @param reelRow 軸列數
   * @returns
   */
  public static posToPosID(pos: number, reelRow: number): number {
    const col = Math.floor(pos / 10);
    const row = (pos % 10) - 1;
    return row * reelRow + col;
  }

  /**
   * 切割陣列
   * @param arr
   * @param size
   * @returns
   */
  public static chunk<T>(arr: T[], size: number): T[][] {
    let result: T[][] = [];
    for (let i = 0; i < arr.length; i += size) {
      let chunk = arr.slice(i, i + size);
      result.push(chunk);
    }
    return result;
  }

  public static ShowSpine(obj: sp.Skeleton, trackIndex: number, anmName: string, loop: boolean, skin: string) {
    obj.clearTracks();
    obj.setToSetupPose();
    obj.addAnimation(trackIndex, anmName, loop);
    if (skin !== null) obj.setSkin(skin);
  }

  public static ClearSpine(obj: sp.Skeleton) {
    obj.clearTracks();
    obj.setToSetupPose();
  }

  public static isEqual(obj1, obj2) {
    return JSON.stringify(obj1) === JSON.stringify(obj2);
  }

  public static scheduleOnce(callback: (dt?: number) => void, delay: number, scope: any) {
    XUtils.schedule(callback, scope, 0, 0, delay);
  }
  public static schedule(
    callback: (dt?: number) => void,
    scope: any,
    interval: number,
    repeat?: number,
    delay?: number,
  ) {
    Scheduler.enableForTarget(scope);
    director.getScheduler().schedule(callback, scope, interval, repeat, delay, false);
  }

  public static unschedule(callback: (dt?: number) => void, scope: any) {
    director.getScheduler().unschedule(callback, scope);
  }

  /**
   * 將N筆WinLine轉換為Spread2維陣列動作清單
   * 第一層表示N回合, 用來控制動畫間隔
   * 第二層表示該回合所有需要表演的節點位置及動畫方向(up, down, left, right)
   * 先從第一欄找出起點, 再從起點向右擴展找出後續起點, 依此類推
   * @param winLine
   * @returns
   */
  // public static winLineToSpread(winLine: number[]): SpreadObject[][] {
  //   let result: SpreadObject[][] = [];
  //   let round: SpreadObject[] = [];
  //   //不重覆處理已檢查過的節點
  //   let checkedPos: number[] = [];

  //   let findNextRoots = (root: SpreadObject) => {
  //     let result: SpreadObject[] = [];
  //     let target: number = 0;
  //     //加入右邊節點
  //     target = root.pos + 10;
  //     if (winLine.indexOf(target) != -1 && checkedPos.indexOf(target) == -1) {
  //       result.push(new SpreadObject(target, 'right'));
  //       checkedPos.push(target);
  //     }
  //     //加入左邊節點
  //     target = root.pos - 10;
  //     if (winLine.indexOf(target) != -1 && checkedPos.indexOf(target) == -1) {
  //       result.push(new SpreadObject(target, 'left'));
  //       checkedPos.push(target);
  //     }
  //     //加入上方節點
  //     target = root.pos - 1;
  //     if (winLine.indexOf(target) != -1 && checkedPos.indexOf(target) == -1) {
  //       result.push(new SpreadObject(target, 'up'));
  //       checkedPos.push(target);
  //     }
  //     //加入下方節點
  //     target = root.pos + 1;
  //     if (winLine.indexOf(target) != -1 && checkedPos.indexOf(target) == -1) {
  //       result.push(new SpreadObject(target, 'down'));
  //       checkedPos.push(target);
  //     }
  //     return result;
  //   };
  //   //第一欄起點
  //   let roots = [];
  //   winLine.forEach((pos) => {
  //     //第一欄動畫方向為right
  //     if (pos < 11) {
  //       roots.push(new SpreadObject(pos, 'right'));
  //       checkedPos.push(pos);
  //     }
  //   }, this);
  //   let nextRoots: SpreadObject[] = [];
  //   while (roots.length > 0) {
  //     roots.forEach((root) => {
  //       //先加入當前節點, 並找出可擴展節點下一回合使用
  //       round.push(root);
  //       nextRoots = nextRoots.concat(findNextRoots(root));
  //     });
  //     result.push(round);
  //     //替換roots,直到再無節點為止
  //     roots = nextRoots;
  //     round = [];
  //     nextRoots = [];
  //   }

  //   return result;
  // }

  /**
   * 複製到剪貼簿
   * @param value
   */
  public static copyToClipboard(value: string) {
    const el = document.createElement('textarea');
    el.value = value;
    document.body.appendChild(el);
    el.select();
    document.execCommand('copy');
    document.body.removeChild(el);

    //複製完要把focus還給遊戲
    let game = document.getElementById('GameCanvas');
    game.focus();
  }

  /**
   * 排除陣列重複資料
   * @param list
   * @returns
   */
  public static uniq(list: any[]) {
    return Array.from(new Set(list));
  }

  /**
   * 轉換為KMB格式
   * @param value
   * @param digit 顯示小數位數(預設0)
   * @returns
   */
  public static convertToKMB(value: number, digit: number = 1): string {
    let result: string;
    //B
    if (value >= 1_000_000_000) {
      value = XUtils.floorToDecimal(value / 1_000_000_000, digit);
      result = this.fmtKMB.format(value) + 'B';
    }
    //M
    else if (value >= 1_000_000) {
      value = XUtils.floorToDecimal(value / 1_000_000, digit);
      result = this.fmtKMB.format(value) + 'M';
    }
    //K
    else if (value >= 1_000) {
      value = XUtils.floorToDecimal(value / 1_000, digit);
      result = this.fmtKMB.format(value) + 'K';
    } else {
      result = this.fmtKMB.format(value);
    }

    return result;
  }

  /**
   * 轉換為KMB, 指定小數位數
   * @param value
   * @param minDigits 最小小數位數
   * @param maxDigits 最大小數位數
   * @returns
   */
  public static convertToKMB2(value: number, minDigits: number, maxDigits: number): string {
    //Ai表示動態生成的效能很小可以不計
    let fmt = new Intl.NumberFormat(XUtils.locale, {
      style: 'decimal', // 可選：currency（貨幣）、percent（百分比）或單純數字
      currency: XUtils.currency, // 貨幣類型，如 "USD", "EUR"
      minimumFractionDigits: minDigits, // 最小小數位數
      maximumFractionDigits: maxDigits, // 最大小數位數
    });

    let result: string;
    //B
    if (value >= 1_000_000_000) {
      value = XUtils.floorToDecimal(value / 1_000_000_000, maxDigits);
      result = fmt.format(value) + 'B';
    }
    //M
    else if (value >= 1_000_000) {
      value = XUtils.floorToDecimal(value / 1_000_000, maxDigits);
      result = fmt.format(value) + 'M';
    }
    //K (100_000 <= value < 1_000_000)
    else if (value >= 1_000) {
      value = XUtils.floorToDecimal(value / 1_000, maxDigits);
      result = fmt.format(value) + 'K';
    } else {
      result = fmt.format(value);
    }
    return result;
  }

  /**數字格式化物件(小數位數2-2) */
  private static fmtCent: Intl.NumberFormat;
  /**數字格式化物件(小數位數0-2) */
  private static fmtCentNoDigit: Intl.NumberFormat;
  /**KMB格式化物件(小數位數0-1) */
  private static fmtKMB: Intl.NumberFormat;

  /**幣別 */
  private static currency: string;
  /**地區 */
  private static locale: string;

  /**
   * 初始化
   * @param currency
   * @param locale
   */
  public static initFormat(currency: string, locale: string): void {
    XUtils.currency = currency;
    XUtils.locale = locale;

    this.fmtCent = new Intl.NumberFormat(locale, {
      style: 'decimal', // 可選：currency（貨幣）、percent（百分比）或單純數字
      currency: currency, // 貨幣類型，如 "USD", "EUR"
      minimumFractionDigits: 2, // 最小小數位數
      maximumFractionDigits: 2, // 最大小數位數
    });
    this.fmtCentNoDigit = new Intl.NumberFormat(locale, {
      style: 'decimal', // 可選：currency（貨幣）、percent（百分比）或單純數字
      currency: currency, // 貨幣類型，如 "USD", "EUR"
      minimumFractionDigits: 0, // 最小小數位數
      maximumFractionDigits: 2, // 最大小數位數
    });
    this.fmtKMB = new Intl.NumberFormat(locale, {
      style: 'decimal', // 可選：currency（貨幣）、percent（百分比）或單純數字
      currency: currency, // 貨幣類型，如 "USD", "EUR"
      minimumFractionDigits: 0, // 最小小數位數
      maximumFractionDigits: 1, // 最大小數位數
    });
  }

  /**
   * 測試網址 https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/NumberFormat
   * locale決定千分位用","或"."
   * @param value
   * @param 是否保留小數
   * @returns 帶入資料會以除100後格式化顯示 ex:123456 = 1,234.56
   */
  public static NumberToCentString(value: number, keepDigit: boolean = true): string {
    return this.format(XUtils.numberToFloor(value), keepDigit);
  }

  public static numberToFloor(value: number): number {
    return Math.floor(value * 100) / 10000;
  }

  /**
   * 轉換為KMB字串, 指定小數位數
   * @param value
   * @returns
   */
  public static NumberToKMBString(value: number, maxDigits: number): string {
    return this.convertToKMB2(XUtils.numberToFloor(value), 0, maxDigits);
  }

  /**
   * 無條件捨去至小數N位
   * @param val
   * @param decimalPlaces
   * @returns
   */
  public static floorToDecimal(val: number, decimalPlaces: number): number {
    const factor = Math.pow(10, decimalPlaces);
    const epsilon = 1e-10; // 小小修正值
    return Math.floor((val + epsilon) * factor) / factor;
  }

  /**
   * 格式化
   * @param value
   * @param keepDigit
   * @returns
   */
  public static format(value: number, keepDigit: boolean = true): string {
    if (keepDigit) {
      return XUtils.fmtCent.format(value);
    } else {
      return XUtils.fmtCentNoDigit.format(value);
    }
  }

  /**
   * 播放Animation
   * @param node
   * @param clipName
   * @param durationInSeconds
   * @param onFinished
   * @returns
   */
  public static playAnimation(node: Node, clipName: string, durationInSeconds?: number, onFinished?: () => void): void {
    const anim = node.getComponent(Animation);
    if (!anim) {
      console.warn(`Animation component not found on node: ${node.name}`);
      return;
    }

    anim.clips.forEach((clip) => {
      if (clip) {
        let state = anim.getState(clip.name);
        if (state && state.isPlaying) {
          state.stop();
        }
      }
    });
    let state = anim.getState(clipName);

    if (!state) {
      const clip = anim.clips.find((c) => c.name === clipName);
      if (!clip) {
        console.warn(`AnimationClip "${clipName}" not found on node: ${node.name}`);
        return;
      }
      state = anim.createState(clip);
    }

    // 換算 speed
    const originalDuration = state.duration;
    if (originalDuration === 0) {
      console.warn(`AnimationClip "${clipName}" has zero duration.`);
      return;
    }

    // 設定速度
    if (durationInSeconds) {
      const speed = originalDuration / durationInSeconds;
      state.speed = speed;
    }

    // 移除先前綁定的完成事件，避免多次觸發
    anim.off(Animation.EventType.FINISHED);

    if (onFinished) {
      anim.once(Animation.EventType.FINISHED, (type: string, finishedState: AnimationState) => {
        if (finishedState.name === clipName) {
          finishedState.stop();
          onFinished();
        } else {
          console.warn(`完成動畫不一致 ${finishedState.name} !== ${clipName}`);
        }
      });
    }

    //目前測試要強制設定setTime(0)和update(0)才不會殘留上一個動畫的畫面
    // state.setTime(0);
    // state.update(0);
    // state.play();

    state.stop(); // 停止動畫保證狀態乾淨
    state.time = 0; // 從頭開始
    state.sample(); // 先強制以time=0動畫播放前，提前準備第一幀狀態
    state.play(); // 播放動畫（這樣會有補間效果）
  }

  public static setupAnimationTimeScale(node: Node, timeScale: number): void {
    const animation = node.getComponent(Animation);
    if (!animation) {
      return;
    }

    // 設置所有 clips 的 speed (timeScale)
    animation.clips.forEach((clip) => {
      if (clip) {
        let state = animation.getState(clip.name);
        if (!state) {
          state = animation.createState(clip);
        }
        state.speed = timeScale;
      }
    });
  }

  /**
   * 計算環狀距離
   * @param a
   * @param b
   * @param length
   * @returns
   */
  public static circularDistance(a: number, b: number, length: number): number {
    return Math.min(Math.abs(a - b), length - Math.abs(a - b));
  }

  /**
   * 設定按鈕圖片(簡潔程式碼)
   * @param btn
   * @param normal
   * @param press
   */
  public static setButtonSprite(btn: Button, normal: SpriteFrame, press: SpriteFrame): void {
    if (!normal || !press) {
      throw new Error('圖片素材不存在!!');
    }
    btn.normalSprite = btn.hoverSprite = normal;
    btn.pressedSprite = btn.disabledSprite = press;
  }

  public static fillArray<T>(value: T, length: number): T[] {
    return Array(length).fill(value);
  }

  // 把 boolean[] 轉成整數 index
  public static boolsToIdx(bools: boolean[]): number {
    return bools.reduce((acc, b, i) => acc | (+b << i), 0);
  }

  // 把 index 轉回 boolean[]
  public static idxToBools(idx: number, n: number): boolean[] {
    return Array.from({ length: n }, (_, i) => Boolean(idx & (1 << i)));
  }

  /**
   * 貝茲曲線座標
   * @param start
   * @param end
   * @param height
   * @param ratio
   * @param upAxis
   * @returns
   */
  public static getParabolaPosition(
    start: Vec3,
    end: Vec3,
    height: number,
    ratio: number,
    upAxis: Axis = Axis.Y,
  ): Vec3 {
    // 中間控制點
    const control = new Vec3((start.x + end.x) / 2, (start.y + end.y) / 2, (start.z + end.z) / 2);

    // 把對應軸加上高度
    if (upAxis === Axis.X) control.x += height;
    else if (upAxis === Axis.Y) control.y += height;
    else if (upAxis === Axis.Z) control.z += height;

    // 二階貝塞爾
    const x = (1 - ratio) * (1 - ratio) * start.x + 2 * (1 - ratio) * ratio * control.x + ratio * ratio * end.x;
    const y = (1 - ratio) * (1 - ratio) * start.y + 2 * (1 - ratio) * ratio * control.y + ratio * ratio * end.y;
    const z = (1 - ratio) * (1 - ratio) * start.z + 2 * (1 - ratio) * ratio * control.z + ratio * ratio * end.z;

    return new Vec3(x, y, z);
  }

  /**
   * 遊戲內統一KMB規則
   * @param ratePay
   * @returns
   */
  public static getCoinKMB(ratePay: number): string {
    let floorRatePay = XUtils.numberToFloor(ratePay);
    let result;
    if (floorRatePay >= 1000) {
      result = XUtils.convertToKMB2(XUtils.numberToFloor(ratePay), 0, 2);
    } else {
      result = XUtils.format(floorRatePay, false);
    }
    result = result.replace(/,/g, '');
    return result;
  }

  /**
   * 產生 UUID
   * @returns 一組 UUID
   */
  public static generateUUID = (): string => {
    let d = Date.now();
    if (typeof performance !== 'undefined' && typeof performance.now === 'function') {
      d += performance.now(); //use high-precision timer if available
    }
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      const r = (d + Math.random() * 16) % 16 | 0;
      d = Math.floor(d / 16);
      return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
    });
  };

  /**
   * UIOpacity淡入
   * @param node 節點
   * @param duration 時間
   */
  public static fadeIn(node: Node, duration: number, callback?: () => void): void {
    const uiOpacity = node.getComponent(UIOpacity) || node.addComponent(UIOpacity);
    uiOpacity.opacity = 0;
    tween(uiOpacity)
      .to(duration, { opacity: 255 })
      .call(() => {
        uiOpacity.opacity = 255;
        callback?.();
      })
      .start();
  }

  /**
   * UIOpacity淡出
   * @param node 節點
   * @param duration 時間
   */
  public static fadeOut(node: Node, duration: number, callback?: () => void): void {
    const uiOpacity = node.getComponent(UIOpacity) || node.addComponent(UIOpacity);
    tween(uiOpacity)
      .to(duration, { opacity: 0 })
      .call(() => {
        uiOpacity.opacity = 0;
        callback?.();
      })
      .start();
  }
}

/**
 * 延遲時間
 * @param seconds 延遲秒數
 * @returns Promise<void>
 */
export async function delay(seconds: number): Promise<void> {
  return new Promise((resolve) => {
    XUtils.scheduleOnce(
      () => {
        resolve();
      },
      seconds,
      {},
    );
  });
}

export function logger(str: string) {
  // if (CHEAT) {
    console.warn(`logger:${str}`);
  // }
}

/**
 * 軸
 */
export enum Axis {
  X = 'x',
  Y = 'y',
  Z = 'z',
}
