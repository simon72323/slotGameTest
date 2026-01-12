import { _decorator, Label, sp, Sprite, SpriteFrame, Node, UIOpacity, tween, Vec3, instantiate, Tween } from 'cc';
import { BaseSymbol } from 'db://assets/base/components/slotMachine/BaseSymbol';
import { SlotMachine } from 'db://assets/base/components/slotMachine/SlotMachine';
import { BetData } from 'db://assets/base/script/data/BetData';
import { dataManager } from 'db://assets/base/script/data/DataManager';
import { audioManager } from 'db://assets/base/script/manager/AudioManager';
import { Utils } from 'db://assets/base/script/utils/Utils';

import { AudioKey } from 'db://assets/game/script/data/AudioKey';
import { FISH_ODDS, SymbolID } from 'db://assets/game/script/data/GameConst';
import { SlotData } from 'db://assets/game/script/data/SlotData';

/**圖示ID對應的索引 */
const symbolImageMap = new Map<number, number>([
    [SymbolID.Wild, 0],     // Wild -> 0
    [SymbolID.H1, 1],       // H1 -> 1
    [SymbolID.H2, 2],       // H2 -> 2
    [SymbolID.H3, 3],       // H3 -> 3
    [SymbolID.H4, 4],       // H4 -> 4
    [SymbolID.F1, 5],       // F1 -> 5
    [SymbolID.F2, 6],       // F2 -> 6
    [SymbolID.F3, 7],       // F3 -> 7
    [SymbolID.F4, 8],       // F4 -> 8
    [SymbolID.F5, 9],       // F5 -> 9
    [SymbolID.F6, 10],      // F6 -> 10
    [SymbolID.F7, 11],      // F7 -> 11
    [SymbolID.F8, 12],      // F8 -> 12
    [SymbolID.LA, 13],      // LA -> 13
    [SymbolID.LK, 14],      // LK -> 14
    [SymbolID.LQ, 15],      // LQ -> 15
    [SymbolID.LJ, 16],      // LJ -> 16
    [SymbolID.LT, 17],      // LT -> 17
    [SymbolID.Scatter, 18]  // Scatter -> 18
]);

/**圖示ID對應的動畫名稱 */
const symbolAniNameMap = new Map<number, string>([
    [SymbolID.Wild, 'animation'],
    [SymbolID.H1, 'H1'],
    [SymbolID.H2, 'H2'],
    [SymbolID.H3, 'H3'],
    [SymbolID.H4, 'H4'],
    [SymbolID.F1, 'F1'],
    [SymbolID.F2, 'F2'],
    [SymbolID.F3, 'F3'],
    [SymbolID.F4, 'F4'],
    [SymbolID.F5, 'F5'],
    [SymbolID.F6, 'F6'],
    [SymbolID.F7, 'F7'],
    [SymbolID.F8, 'F8'],
    [SymbolID.LA, 'LA'],
    [SymbolID.LK, 'LK'],
    [SymbolID.LQ, 'LQ'],
    [SymbolID.LJ, 'LJ'],
    [SymbolID.LT, 'LT'],
    [SymbolID.Scatter, 'animation']
]);

const { ccclass, property } = _decorator;

@ccclass('Symbol')
export class Symbol extends BaseSymbol {
    /**圖示(一般狀態) */
    @property({ type: SpriteFrame })
    private normalImageList: SpriteFrame[] = [];

    /**圖示(模糊狀態) */
    @property({ type: SpriteFrame })
    private blurImageList: SpriteFrame[] = [];

    /**圖示Spine動畫 */
    @property({ type: sp.SkeletonData })
    private spineDataList: sp.SkeletonData[] = [];

    /**symbolID標籤 */
    private symIDLabel: Label;
    /**posID標籤 */
    private posIDLabel: Label;

    /**模糊圖 */
    private blur: Sprite;
    /**清晰圖 */
    private normal: Sprite;
    /**Wild動畫 */
    // private wild: sp.Skeleton;
    /**動畫 */
    private spine: sp.Skeleton;

    /**分數*/
    private score: Node;
    /**wild特效動畫 */
    // private ani_multiply: sp.Skeleton;
    /**倍數 */
    private multiply: Node;

    /**一般圖示 */
    private normalSymbolID: number[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 15, 16, 17, 18, 19];
    /**特殊圖示 */
    private specialSymbolID: number[] = [0, 16];
    /**特殊圖示機率 */
    private specialRate: number = 0.1;

    /**wild分數 */
    private wildScore: number = 0;

    /**瞇牌狀態要把scatter放到更高層級 */
    // private isMi: boolean = false;

    /**
     * 初始化
     */
    onLoad() {
        this.blur = this.node.getChildByName('Blur').getComponent(Sprite);
        this.normal = this.node.getChildByName('Normal').getComponent(Sprite);
        this.symIDLabel = this.node.getChildByName('symIDLabel').getComponent(Label);
        this.posIDLabel = this.node.getChildByName('posIDLabel').getComponent(Label);
        this.spine = this.node.getChildByName('Spine').getComponent(sp.Skeleton);
        this.score = this.node.getChildByName('Score');
        this.multiply = this.node.getChildByName('Multiply');

        SlotMachine.startMi.on((column) => {
            if (this.isScatter() && this.isStop) {
                this.node.parent = this.scatterLayer.children[this.posID];
                this.spine.setAnimation(0, symbolAniNameMap.get(this.symbolID), true);
            }
        }, this);

        SlotMachine.stopMi.on(() => {
            if (this.isScatter()) {
                Tween.stopAllByTarget(this.node);
                this.reset();
            }
        }, this);
        this.reset();
    }

    /**
     * 開始spin時空的圖示要隨機給symbolID
     */
    public setRandomSymbolID(): void {
        const random = Math.random();
        if (random < this.specialRate) {
            this.symbolID = this.specialSymbolID[Math.floor(Math.random() * this.specialSymbolID.length)];
        }
        else {
            this.symbolID = this.normalSymbolID[Math.floor(Math.random() * this.normalSymbolID.length)];
        }
        this.setSymbolID(this.symbolID);
    }

    /**
     * 設定圖示ID
     * @param newSymbolID 
     */
    public setSymbolID(newSymbolID: number): void {
        // this.symIDLabel.string = `${newSymbolID}`;
        // this.posIDLabel.string = `${this.posID}`;
        this.symbolID = newSymbolID;

        // if (newSymbolID != -1) {
        const imageID = symbolImageMap.get(newSymbolID);
        this.spine.skeletonData = this.spineDataList[imageID];
        this.normal.spriteFrame = this.normalImageList[imageID];
        this.blur.spriteFrame = this.blurImageList[imageID];

        if (this.isScatter() && this.isStop) {
            this.node.parent = this.scatterLayer.children[this.posID];
        }
        else {
            this.node.parent = this.parentNode;
        }

        //先隱藏倍率
        this.multiply.active = false;
        //設定wild倍率是否顯示
        if (this.isWild()) {
            const wildMultiply = SlotData.fsWildMultiply;
            if (wildMultiply > 1) {
                this.multiply.getChildByName('Label').getComponent(Label).string = `x${wildMultiply}`;
                this.multiply.active = true;
            }
            this.wildScore = 0;
            this.score.active = false;
        }
        this.setScoreState();//設置分數的狀態
    }

    /**
     * 開始轉動
     */
    public onSpin(): void {
        this.isStop = false;
        this.reset();
    }

    /**
     * symbol停下時
     */
    public onStop(): void {
        if (this.isScatter()) {
            audioManager().playSound(AudioKey.scatterShow);
            tween(this.node)
                .to(0.2, { scale: new Vec3(1.3, 1.3, 1) }, { easing: 'sineOut' })
                .to(0.5, { scale: new Vec3(1, 1, 1) }, { easing: 'bounceOut' })
                .start();
        }
        //免費遊戲wild出現時播放音效
        if (this.isWild() && !dataManager().isMG()) {
            audioManager().playSound(AudioKey.wildShow);
        }
        this.isStop = true;
    }

    /**
     * 模糊貼圖顯示
     */
    public blurShow(): void {
        if (this.blur.node.active) return;
        Utils.fadeIn(this.blur.node, 0.05, 0, 255);
        this.blur.node.active = true;
        Utils.fadeOut(this.normal.node, 0.05, 255, 150);
        // Utils.fadeOut(this.normal.node, 0.05);
    }

    /**
     * 模糊貼圖隱藏
     */
    public blurHide(): void {
        if (!this.blur.node.active) return;
        Utils.fadeIn(this.normal.node, 0.05, 150, 255);
        Utils.fadeOut(this.blur.node, 0.2, 255, 0, () => {
            this.blur.node.active = false;
        });
    }

    /**
     * 中獎演示
     * @param timeScale 時間比例(預設2倍)
     */
    public symbolWin(): void {
        this.spine.node.active = true;
        this.normal.node.active = false;
        this.node.parent = this.winLayer.children[this.posID];//移動到勝利層
        const animName = symbolAniNameMap.get(this.symbolID);
        //wild與scatter表演時間比例為1倍，其他為2倍
        this.spine.timeScale = (this.isWild() || this.isScatter()) ? 1 : 2;
        this.spine.setAnimation(0, animName, true);
    }

    /**
     * 顯示分數
     * @param score 分數
     */
    public showWildScore(score: number): void {
        audioManager().playSound(AudioKey.wildCash);
        if (!this.score.active) {
            this.score.active = true;
            this.score.getComponent(UIOpacity).opacity = 255;
        }
        //更新分數
        this.score.getChildByPath('numLayout/currency').getComponent(Label).string = Utils.getCurrencySymbol();
        this.score.getChildByPath('numLayout/Label').getComponent(Label).string = Utils.numberFormat(score);
        //縮放動畫
        tween(this.score)
            .to(0.1, { scale: new Vec3(1.4, 1.4, 1) })
            .to(0.2, { scale: new Vec3(1, 1, 1) })
            .start();
    }

    /**
     * wild分數設置完成(判斷是否有倍率表演)
     * @param totalScore 總分數
     */
    public async wildScoreFinish(totalScore: number): Promise<void> {
        return new Promise((resolve) => {
            if (this.multiply.active) {
                const instMultiply = instantiate(this.multiply);
                instMultiply.setParent(this.node);
                const aniMultiply = instMultiply.getChildByName('ani_multiply').getComponent(sp.Skeleton);
                aniMultiply.node.active = true;
                aniMultiply.setAnimation(0, 'hitbubble', false);
                const endPos = this.score.position;
                tween(instMultiply)
                    .to(0.4, { position: endPos }, { easing: 'sineIn' })
                    .call(() => {
                        aniMultiply.setAnimation(0, 'light', false);
                    })
                    .to(0.1, { scale: new Vec3(1.2, 1.2, 1) })
                    .call(() => {
                        Utils.fadeOut(instMultiply, 0.2, 255, 0, () => {
                            instMultiply.destroy();
                        });
                        const wildMultiply = SlotData.fsWildMultiply;
                        const multiplyScore = totalScore * wildMultiply;
                        this.showWildScore(multiplyScore);
                        resolve();
                    })
                    .start();
            } else {
                this.showWildScore(totalScore);
                resolve();
            }
        });
    }

    /**
     * 未中演示
     */
    public symbolLose(): void {
        this.reset();
    }

    /**
     * 回歸原始狀態
     */
    private reset(): void {
        this.node.setScale(1, 1, 1);
        this.node.parent = this.parentNode;//回歸原始父節點
        this.normal.node.active = true;
        this.spine.node.active = false;
        this.blur.node.active = false;
    }

    /**
     * 回復MG盤面symbol
     * @param symbolID 圖示ID
     */
    public backMG(symbolID: number): void {
        this.reset();
        this.setSymbolID(symbolID);
    }

    /**
     * 開始瞇牌
     */
    public setIsMi(isMi: boolean): void {
        // this.isMi = isMi;
    }

    /**
     * 是否為scatter
     * @returns 
     */
    private isScatter(): boolean {
        return this.symbolID === SymbolID.Scatter;
    }

    /**
     * 是否為wild
     * @returns 
     */
    private isWild(): boolean {
        return this.symbolID === SymbolID.Wild;
    }

    /**
     * 設定分數的狀態
     */
    private setScoreState() {
        if (this.symbolID >= SymbolID.F1 && this.symbolID <= SymbolID.F8) {
            this.score.active = true;
            const isMG = dataManager().isMG();
            this.score.getComponent(UIOpacity).opacity = isMG ? 128 : 255;
            const betCredit = BetData.getBetTotal();
            const fishScore = FISH_ODDS[this.symbolID] * betCredit;
            this.score.getChildByPath('numLayout/currency').getComponent(Label).string = Utils.getCurrencySymbol();
            this.score.getChildByPath('numLayout/Label').getComponent(Label).string = Utils.numberFormat(fishScore);
        }
        else {
            this.score.active = false;
        }
    }
}