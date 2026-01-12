
import { _decorator, Component, Layout, Node, Size, Sprite, SpriteFrame, UITransform, Vec2, Vec3 } from 'cc';
import { EDITOR } from 'cc/env';

import { BaseEvent } from 'db://assets/base/script/event/BaseEvent';
import { OrientationtMode } from 'db://assets/base/script/types/BaseType';

/**
 * 直橫式管理器
 */
const { ccclass, property } = _decorator;

/**
 * 直橫式節點搬移
 */
@ccclass('OrientationNode')
class OrientationNode {
    @property({ type: Node, tooltip: '目標節點' })
    public target: Node = null!;

    @property({ type: Node, tooltip: '直式位置節點' })
    public portraitPos: Node = null!;

    @property({ type: Node, tooltip: '橫式位置節點' })
    public landscapePos: Node = null!;
}

/**
 * 直橫式顯示/隱藏
 */
@ccclass('OrientationActive')
class OrientationActive {
    @property({ type: Node, tooltip: '目標節點' })
    public target: Node = null!;

    @property({ tooltip: '直式顯示/隱藏' })
    public portraitActive: boolean = false;

    @property({ tooltip: '橫式顯示/隱藏' })
    public landscapeActive: boolean = false;
}

/**
 * 直橫式節點縮放
 */
@ccclass('OrientationScale')
class OrientationScale {
    @property({ type: Node, tooltip: '目標節點' })
    public target: Node = null!;

    @property({ tooltip: '直式縮放比例' })
    public portraitScale: Vec3 = new Vec3(1, 1, 1);

    @property({ tooltip: '橫式縮放比例' })
    public landscapeScale: Vec3 = new Vec3(1, 1, 1);
}

/**
 * 直橫式節點位置
 */
@ccclass('OrientationPosition')
class OrientationPosition {
    @property({ type: Node, tooltip: '目標節點' })
    public target: Node = null!;

    @property({ tooltip: '直式位置' })
    public portraitPosition: Vec3 = new Vec3(0, 0, 0);

    @property({ tooltip: '橫式位置' })
    public landscapePosition: Vec3 = new Vec3(0, 0, 0);
}

/**
 * 直橫式節點Y位置
 */
@ccclass('OrientationPosY')
class OrientationPosY {
    @property({ type: Node, tooltip: '目標節點' })
    public target: Node = null!;

    @property({ tooltip: '直式Y位置' })
    public portraitPosY: number = 0;

    @property({ tooltip: '橫式Y位置' })
    public landscapePosY: number = 0;
}

/**
 * 直橫式節點尺寸
 */
@ccclass('OrientationSize')
class OrientationSize {
    @property({ type: Node, tooltip: '目標節點' })
    public target: Node = null!;

    @property({ tooltip: '直式尺寸' })
    public portraitSize: Size = new Size(0, 0);

    @property({ tooltip: '橫式尺寸' })
    public landscapeSize: Size = new Size(0, 0);
}

/**
 * 直橫式貼圖
 */
@ccclass('OrientationSpriteFrame')
class OrientationSpriteFrame {
    @property({ type: Node, tooltip: '目標節點' })
    public target: Node = null!;

    @property({ type: SpriteFrame, tooltip: '直式貼圖' })
    public portraitSpriteFrame: SpriteFrame = null!;

    @property({ type: SpriteFrame, tooltip: '橫式貼圖' })
    public landscapeSpriteFrame: SpriteFrame = null!;
}

/**
 * 直橫式LayoutPadding
 */
@ccclass('OrientationLayoutPadding')
class OrientationLayoutPadding {
    @property({ type: Node, tooltip: '目標節點' })
    public target: Node = null!;

    @property({ tooltip: '直式邊距 (左,右)' })
    public portraitPaddingLR: Vec2 = new Vec2(0, 0);

    @property({ tooltip: '直式邊距 (上,下)' })
    public portraitPaddingTB: Vec2 = new Vec2(0, 0);

    @property({ tooltip: '直式間距 (X,Y)' })
    public portraitSpacing: Vec2 = new Vec2(0, 0);

    @property({ tooltip: '橫式邊距 (左,右)' })
    public landscapePaddingLR: Vec2 = new Vec2(0, 0);

    @property({ tooltip: '橫式邊距 (上,下)' })
    public landscapePaddingTB: Vec2 = new Vec2(0, 0);

    @property({ tooltip: '橫式間距 (X,Y)' })
    public landscapeSpacing: Vec2 = new Vec2(0, 0);
}


@ccclass('OrientationManager')
export class OrientationManager extends Component {
    private _isLandscape: boolean = false;
    @property({ tooltip: '是否切換為橫式' })
    get isLandscape(): boolean {
        return this._isLandscape;
    }

    set isLandscape(value: boolean) {
        if (this._isLandscape !== value) {
            this._isLandscape = value;
            // 在編輯器模式下觸發方向切換
            if (EDITOR) {
                this.onChangeOrientation(value ? OrientationtMode.Landscape : OrientationtMode.Portrait);
            }
        }
    }

    @property({ type: [OrientationNode], tooltip: '直橫式搬移控制' })
    private orientationNode: OrientationNode[] = [];

    @property({ type: [OrientationActive], tooltip: '直橫式顯示/隱藏控制' })
    private orientationActive: OrientationActive[] = [];

    @property({ type: [OrientationScale], tooltip: '直橫式縮放控制' })
    private orientationScale: OrientationScale[] = [];

    @property({ type: [OrientationPosition], tooltip: '直橫式位置控制' })
    private orientationPosition: OrientationPosition[] = [];

    @property({ type: [OrientationPosY], tooltip: '直橫式Y位置控制' })
    private orientationPosY: OrientationPosY[] = [];

    @property({ type: [OrientationSize], tooltip: '直橫式尺寸控制' })
    private orientationSize: OrientationSize[] = [];

    @property({ type: [OrientationSpriteFrame], tooltip: '直橫式貼圖控制' })
    private orientationSpriteFrame: OrientationSpriteFrame[] = [];

    @property({ type: [OrientationLayoutPadding], tooltip: '直橫式LayoutPadding控制' })
    private orientationLayoutPadding: OrientationLayoutPadding[] = [];

    onLoad() {
        //監聽直橫式切換事件
        BaseEvent.changeOrientation.on(this.onChangeOrientation, this);
    }

    onDestroy() {
        //監聽直橫式切換事件
        BaseEvent.changeOrientation.off(this.onChangeOrientation);
    }

    /**
     * 執行直橫式切換
     * @param orientation 方向模式
     */
    private onChangeOrientation(orientation: OrientationtMode) {
        // console.log('執行直橫式切換', orientation);
        const isLandscape = orientation === OrientationtMode.Landscape;

        // console.log('this.orientationNode', this.orientationNode);
        //節點搬移
        if (this.orientationNode) {
            this.orientationNode.forEach((node, index) => {
                const target = node.target;
                target.parent = isLandscape ? node.landscapePos : node.portraitPos;
            });
        }

        //節點顯示/隱藏
        if (this.orientationActive) {
            this.orientationActive.forEach((active, index) => {
                const target = active.target;
                target.active = isLandscape ? active.landscapeActive : active.portraitActive;
            });
        }

        //節點縮放
        if (this.orientationScale) {
            this.orientationScale.forEach((scale, index) => {
                const target = scale.target;
                if (target) {
                    const scaleValue = isLandscape ? scale.landscapeScale : scale.portraitScale;
                    target.setScale(scaleValue);
                }
            });
        }

        //節點位置
        if (this.orientationPosition) {
            this.orientationPosition.forEach((position, index) => {
                const target = position.target;
                if (target) {
                    const positionValue = isLandscape ? position.landscapePosition : position.portraitPosition;
                    target.setPosition(positionValue);
                }
            });
        }

        //節點Y位置
        if (this.orientationPosY) {
            this.orientationPosY.forEach((posY, index) => {
                const target = posY.target;
                if (target) {
                    const posYValue = isLandscape ? posY.landscapePosY : posY.portraitPosY;
                    target.setPosition(new Vec3(target.position.x, posYValue, target.position.z));
                }
            });
        }

        //節點尺寸
        if (this.orientationSize) {
            this.orientationSize.forEach((size, index) => {
                const target = size.target;
                if (target) {
                    const sizeValue = isLandscape ? size.landscapeSize : size.portraitSize;
                    target.getComponent(UITransform)?.setContentSize(sizeValue);
                }
            });
        }

        //節點貼圖
        if (this.orientationSpriteFrame) {
            this.orientationSpriteFrame.forEach((spriteFrame, index) => {
                const target = spriteFrame.target;
                if (target) {
                    const targetSprite = target.getComponent(Sprite);
                    if (targetSprite) {
                        const spriteFrameValue = isLandscape ? spriteFrame.landscapeSpriteFrame : spriteFrame.portraitSpriteFrame;
                        targetSprite.spriteFrame = spriteFrameValue;
                    }
                }
            });
        }

        //節點Layout
        if (this.orientationLayoutPadding) {
            this.orientationLayoutPadding.forEach((layout, index) => {
                const target = layout.target;
                if (target) {
                    const targetLayout = target.getComponent(Layout);
                    if (targetLayout) {
                        const padding = isLandscape ? layout.landscapePaddingLR : layout.portraitPaddingLR;
                        const paddingTB = isLandscape ? layout.landscapePaddingTB : layout.portraitPaddingTB;
                        const spacing = isLandscape ? layout.landscapeSpacing : layout.portraitSpacing;

                        targetLayout.paddingLeft = padding.x;
                        targetLayout.paddingRight = padding.y;
                        targetLayout.paddingTop = paddingTB.x;
                        targetLayout.paddingBottom = paddingTB.y;
                        targetLayout.spacingX = spacing.x;
                        targetLayout.spacingY = spacing.y;
                        targetLayout.updateLayout();
                    }
                }
            });
        }
    }
}