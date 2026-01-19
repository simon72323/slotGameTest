import {
  _decorator,
  Label,
  sp,
  Sprite,
  Node,
  Button,
  randomRangeInt,
  UITransform,
  Vec3,
  UIOpacity,
  tween,
  SpriteFrame,
  Animation,
} from 'cc';
// import { AudioManager } from 'db://assets/base/script/audio/AudioManager';
// import { BaseDataManager } from 'db://assets/base/script/main/BaseDataManager';
// import {
//   GameAudioKey,
//   GameConst,
//   indexToSymbolMap,
//   SymbolID,
//   symbolToIndexMap,
// } from 'db://assets/game/script/constant/GameConst';
// import { gameData, gameTimeScale } from 'db://assets/game/script/main/GameData';
// import { PayTableUI } from 'db://assets/game/components/PayTableUI/PayTableUI';
import { BaseSymbol2 } from './base/slotMachine2/BaseSymbol2';
import { SlotMachine2 } from './base/slotMachine2/SlotMachine2';
import { SymbolState2 } from './base/slotMachine2/SlotType2';
import { SymbolData2 } from './SymbolData2';
import { XEvent, XEvent2 } from 'db://assets/base/script/event/XEvent';
// import { SymbolExploUI } from './SymbolExploUI/SymbolExploUI';
import { XUtils } from 'db://assets/base/script/utils/XUtils';
import { DataManager } from 'db://assets/base/script/data/DataManager';
import { SymbolID } from '../../script/constant/GameConst';
import { AudioManager } from 'db://assets/base/script/manager/AudioManager';
const { ccclass, property } = _decorator;

@ccclass('Symbol2')
export class Symbol2 extends BaseSymbol2 {
  public static resetHideWin: XEvent = new XEvent();
  public static moveSymbol: XEvent2<number, Vec3> = new XEvent2();
  public static showIdLabel: XEvent = new XEvent();

  /**圖示(一般狀態) */
  @property({ type: SpriteFrame })
  private normalImageList: SpriteFrame[] = [];

  /**圖示(降彩度狀態) */
  @property({ type: SpriteFrame })
  private noImageList: SpriteFrame[] = [];

  /**Spine動畫 */
  @property({ type: sp.SkeletonData })
  private skeletonData: sp.SkeletonData[] = [];

  /**symbolID標籤 */
  private idLabel: Label;
  /**位置標籤 */
  private posLabel: Label;

  /**模糊圖 */
  // private blur: Sprite;
  /**清晰圖 */
  private normal: Sprite;
  /**動畫 */
  private spine: sp.Skeleton;
  /**連線方框動畫 */
  private line: sp.Skeleton;

  private sens: Node;

  /**瞇牌狀態要把scatter放到更高層級 */
  private isMi: boolean = false;
  /**狀態 */
  private state: SymbolState2 = SymbolState2.Normal;

  /**權重 */
  public weight: number = 0;

  /**當前wild倍率 */
  public wildMultiplier: number = 0;

  /**是否已經獲得scatter */
  private isScatterGot: boolean = true;

  /**整體盤面位置ID */
  private posID: number = -1;

  /**
   * 初始化
   */
  onLoad() {
    this.setupNode(); //設定節點
    this.setupEvent(); //設定事件
  }

  /**
   * 設定節點
   */
  private setupNode(): void {
    // this.blur = this.node.getChildByName('Blur').getComponent(Sprite);
    this.normal = this.node.getChildByName('Normal').getComponent(Sprite);
    this.idLabel = this.node.getChildByName('idLabel').getComponent(Label);
    this.posLabel = this.node.getChildByName('posLabel').getComponent(Label);
    this.spine = this.node.getChildByName('Spine').getComponent(sp.Skeleton);
    this.line = this.node.getChildByName('Line').getComponent(sp.Skeleton);
    this.sens = this.node.getChildByName('Sens');
  }
  /**
   * 設定事件
   */
  private setupEvent(): void {
    this.sens.on(Button.EventType.CLICK, this.showPayTable, this);
    Symbol2.showIdLabel.on(this.showIdLabel, this);
    Symbol2.resetHideWin.on(this.resetHideWin, this);
    // Symbol2.moveSymbol.on(this.moveSymbol, this);

    // SlotMachine2.startMi.on((id, column) => {
    //   this.isMi = true;
    // }, this);

    // SlotMachine2.stopMi.on((id) => {
    //   this.isMi = false;
    // if (this.isScatter()) {
    //   this.setState(this.state);
    // }
    // this.reset();
    // }, this);
  }

  /**
   * 顯示symbolID標籤
   */
  private showIdLabel(): void {
    this.idLabel.node.active = !this.idLabel.node.active;
  }

  /**
   * 顯示賠率表
   */
  private showPayTable(): void {
    // if (!DataManager.getInstance().isIdle() || DataManager.getInstance().auto.isAutoPlay()) {
    //   return;
    // }
    if (!this.isInView) {
      return;
    }
    let worldPos = this.node.parent.getComponent(UITransform).convertToWorldSpaceAR(this.node.getPosition());
    // let payData = gameData().getPayBySymbolID(symbolToIndexMap.get(this.symbolID));
    // const skeletonData = this.skeletonData[symbolToIndexMap.get(this.symbolID)];
    // PayTableUI.show.emit(this.grid, this.symbolID, skeletonData, worldPos, payData);
  }

  /**
   * 開始spin時空的圖示要隨機給symbolID
   */
  public randomSymbol(): void {
    // let randomID = randomRangeInt(0, GameConst.symbolWeight.length);
    // this.symbolID = indexToSymbolMap.get(randomID);
  }

  /**
   * 設定圖示ID
   * @param newSymbolID
   * @param stripIdx
   * @returns
   */
  public setSymbolID(newSymbolID: number, posIndex: number): void {
    //圖示沒變動不重覆設定
    this.symbolID = newSymbolID;
    // let symImageID: number = symbolToIndexMap.get(newSymbolID);
    // this.weight = GameConst.symbolWeight[symImageID];
    this.addChildToLayer(SymbolLayer.Reel);
    this.setState(this.state);
    let posID = posIndex; //此為symbol在reel排序的位置索引
    if (posIndex === -1) {
      //掉落狀態時直接取得posIndex
      posID = this.posIndex;
    }
    /**設置整體盤面位置ID */
    // const rol = this.grid.col;
    // this.posID = this.posIndex * gameData().REEL_COL + rol;

    this.idLabel.string = this.symbolID.toString();
    this.posLabel.string = this.posID.toString();

    if (newSymbolID != -1) {
      // this.spine.skeletonData = this.skeletonData[symImageID];
      //設定一般圖
      // this.normal.spriteFrame = this.normalImageList[symImageID];
      //設定模糊圖
      // this.blur.spriteFrame = this.blurImageList[symImageID];
    } else {
      this.spine.node.active = false;
      this.normal.node.active = false;
      // this.blur.node.active = false;
    }
  }

  /**
   * 設置初始化盤面符號
   * @param symbolID 圖示ID
   * @param isInView 是否在畫面中
   */
  public setInitSymbolID(symbolID: number, isInView: boolean): void {
    this.reset(); //重置圖示
    this.isInView = isInView;
    this.symbolID = symbolID;
    this.setSymbolID(symbolID, -1);
  }

  /**
   * 掉落補充
   * @param data
   */
  public setSymbolData(data: SymbolData2): void {
    this.setSymbolID(data.symbolID, -1); // 設定符號 ID
  }

  /**
   * 回歸BS圖示ID
   * @param symbolID
   */
  public backBSSymbolID(symbolID: number): void {
    this.isInView = true; //因為傳送過來的是場內的symbol，所以設為true
    this.reset(); //重置圖示
    this.setSymbolID(symbolID, -1);
  }

  /**
   * 開始轉動
   */
  public onSpin(): void {
    this.isScatterGot = false; //重置scatter got狀態
    this.reset();
    this.isInView = false;
  }

  /**
   * 全部軸停下時
   */
  public onStop(): void {
    //要先設定完isMi狀態才能刷新layer
  }

  /**
   * 設定圖示狀態
   * @param state
   */
  public setState(state: SymbolState2): void {
    // if (this.isMi && this.isScatter()) {
    //   return;
    // }
    this.state = state;
    this.spine.node.active = false;

    if (this.symbolID !== -1) {
      this.normal.node.active = state === SymbolState2.Normal;
      // this.blur.node.active = state === SymbolState2.Blur;
    } else {
      this.normal.node.active = false;
      // this.blur.node.active = false;
    }
  }

  /**
   * 設定中獎倍率
   * @param multiplier
   */
  public setMultiplier(multiplier: number): void {
    this.wildMultiplier = multiplier;
  }

  /**
   * symbol中獎演示
   */
  public showWin(): void {
    if (this.isScatter()) {
      const scatterAni = this.symbolID === SymbolID.Scatter ? ScatterAni.start_normal : ScatterAni.start_super;
      this.playSymbolAni(scatterAni, false);
      const animName = this.symbolID === SymbolID.Scatter ? ScatterAni.loop_normal : ScatterAni.loop_super;
      this.spine.addAnimation(0, animName, true);
    } else {
      this.line.node.active = true;
      // this.line.timeScale = gameTimeScale();
      this.line.setAnimation(0, SymbolAni.win, false);
      this.playSymbolAni(SymbolAni.win, false);
    }
  }

  /**
   * 縮放隱藏
   * @param time
   */
  public scaleHide(): void {
    tween(this.spine.node)
      .to(0.3, { scale: new Vec3(1.1, 1.1, 1) }, { easing: 'cubicIn' })
      .call(() => {
        this.spine.node.setScale(Vec3.ONE);
      })
      .start();
  }

  /**
   * 取消中獎效果
   */
  public hideWin(): void {
    this.spine.node.active = false;
    this.normal.node.active = true;
    // this.normal.spriteFrame = this.noImageList[symbolToIndexMap.get(this.symbolID)];

    if (this.isInView && this.isScatter()) {
      return;
    }
    this.reset();
  }

  private resetHideWin(): void {
    // this.normal.spriteFrame = this.normalImageList[symbolToIndexMap.get(this.symbolID)];
    this.line.node.active = false;
  }

  /**
   * 重置圖示
   */
  private reset(): void {
    this.node.getComponent(UIOpacity).opacity = 255;

    if (this.state === SymbolState2.Blur) {
      // this.blur.node.active = true;
      this.normal.node.active = false;
    } else {
      // this.blur.node.active = false;
      this.normal.node.active = true;
    }

    this.spine.node.active = false;

    this.wildMultiplier = 0;
    this.addChildToLayer(SymbolLayer.Reel);
  }

  /**
   * 爆炸演示
   */
  public explode() {
    if (!this.isScatter()) {
      const skeletonData = this.spine.skeletonData;
      // SymbolExploUI.createExplo.emit(this.node.getPosition(), skeletonData);
      this.spine.node.active = false;
      this.line.node.active = false;
    }
  }

  /**
   * 圖示落地
   * @returns
   */
  public hit(isInView: boolean): void {
    if (isInView) {
      // AudioManager.getInstance().play(GameAudio.board_fill);
      if (this.isScatter()) {
        if (!this.isScatterGot) {
          this.isScatterGot = true;
          const scatterAni = this.symbolID === SymbolID.Scatter ? ScatterAni.got_normal : ScatterAni.got_super;
          this.playSymbolAni(scatterAni, false);
          // gameData().curScatterCount++; //更新scatter數量
          //根據scatter數量播放音效
          // let scatterCount = gameData().curScatterCount;
          // const scatterAudioName =
          //   scatterCount > 2 ? GameAudioKey.scatter_hit_3 : GameAudioKey[`scatter_hit_${scatterCount}`];
          // AudioManager.getInstance().playOneShot(scatterAudioName);
        } else {
          this.node.getComponent(Animation).play('symbolHit');
        }
      } else {
        //其他symbol是否播放落下動態?(目前動態沒給)
        this.playSymbolAni(SymbolAni.drop, false);
      }
    }
    //改透過setSymbolID時就提前判斷設置isInView狀態
    this.isInView = isInView;
  }

  /**
   * 播放圖示動畫, 完成後放回原層級
   * @param name
   * @param onComplete
   */
  private playSymbolAni(name: string, loop: boolean): void {
    this.spine.node.active = true;
    this.normal.node.active = false;
    // this.spine.timeScale = gameTimeScale();
    XUtils.ClearSpine(this.spine);
    this.spine.setAnimation(0, name, loop);

    if (name !== SymbolAni.drop) {
      this.addChildToLayer(SymbolLayer.Win);
    }
  }

  /**
   * 移動圖示
   * @param posID 位置ID
   * @param pos
   */
  // private moveSymbol(posID: number, pos: Vec3): void {
  //   if (this.posID !== posID) return;
  //   const backPos = new Vec3(-pos.x / 4, -pos.y / 4, 0);
  //   const time1 = 0.1 / gameTimeScale();
  //   const time2 = 0.2 / gameTimeScale();
  //   const time3 = 0.05 / gameTimeScale();
  //   tween(this.spine.node)
  //     .to(time1, { position: pos }, { easing: 'sineOut' })
  //     .to(time2, { position: backPos }, { easing: 'sineIn' })
  //     .to(time3, { position: Vec3.ZERO })
  //     .call(() => {
  //       this.spine.node.setPosition(Vec3.ZERO);
  //     })
  //     .start();
  //   tween(this.normal.node)
  //     .to(time1, { position: pos }, { easing: 'sineOut' })
  //     .to(time2, { position: backPos }, { easing: 'sineIn' })
  //     .to(time3, { position: Vec3.ZERO })
  //     .call(() => {
  //       this.normal.node.setPosition(Vec3.ZERO);
  //     })
  //     .start();
  // }

  /**
   * 開始瞇牌
   */
  public setIsMi(isMi: boolean): void {
    // this.isMi = isMi;
  }

  private isScatter(): boolean {
    return this.symbolID === SymbolID.Scatter || this.symbolID === SymbolID.SuperScatter;
  }

  /**
   * 調整圖示層級
   * @param layerIdx
   */
  private addChildToLayer(layerIdx: SymbolLayer): void {
    let layer = this.layerList[layerIdx];
    layer.addChild(this.node);
    let sortChildren = layer.children.concat();
    // sortChildren.sort((a, b) => {
    //   const aCol = a.getComponent(Symbol2).grid.col;
    //   const bCol = b.getComponent(Symbol2).grid.col;
    //   if (aCol > bCol) {
    //     return 1;
    //   } else {
    //     return -1;
    //   }
    // });
    sortChildren.forEach((a, i) => a.setSiblingIndex(i));
    sortChildren.sort((a, b) => {
      if (a.getComponent(Symbol2).weight > b.getComponent(Symbol2).weight) {
        return 1;
      } else if (a.getComponent(Symbol2).weight < b.getComponent(Symbol2).weight) {
        return -1;
      } else {
        return a.getComponent(Symbol2).posIndex - b.getComponent(Symbol2).posIndex;
      }
    });
    sortChildren.forEach((a, i) => a.setSiblingIndex(i));
  }

  onDestroy(): void {
    SlotMachine2.stopMi.off(this);
    SlotMachine2.startMi.off(this);
    SlotMachine2.spinComplete.off(this);
    Symbol2.showIdLabel.off(this);
    this.sens.off(Button.EventType.CLICK, this.showPayTable, this);
  }
}

enum SymbolLayer {
  Reel = 0,
  Scatter,
  Win,
  Charge,
}

enum ScatterAni {
  got_normal = 'got_normal',
  got_super = 'got_super',
  loop_normal = 'loop_normal',
  loop_super = 'loop_super',
  start_normal = 'start_normal',
  start_super = 'start_super',
}

enum SymbolAni {
  drop = 'drop',
  win = 'win',
  explo = 'explo',
}
