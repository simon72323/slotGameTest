import { _decorator, Component, director, SpriteFrame } from 'cc';
import { BundleLoader } from '../utils/BundleLoader';
import { BaseConst } from '../data/BaseConst';
import { DataManager } from '../data/DataManager';
import { UrlParam } from '../data/UrlParam';
import { Logger } from '../utils/Logger';
const { ccclass, property } = _decorator;

@ccclass('ActivateScene')
export class ActivateScene extends Component {
    private spineComplete: boolean = false;
    private bundleComplete: boolean = false;

    onLoad() {
        DataManager.getInstance().init(window['gameConfig']);
    }

    async start() {
        //gif至少播一次
        this.scheduleOnce(() => {
            this.spineComplete = true;
            this.checkComplete();
        }, 1);

        //載入公版語系資源
        const baseLoadingLoader = new BundleLoader();
        baseLoadingLoader.add(
            BaseConst.BUNDLE_BASE_LANGUAGE,
            `${UrlParam.lang}/${BaseConst.DIR_LOADING}`,
            SpriteFrame
        );
        await baseLoadingLoader.load(true);

        //載入遊戲語系資源
        const gameLoadingLoader = new BundleLoader();
        gameLoadingLoader.add(
            BaseConst.BUNDLE_LANGUAGE,
            `${UrlParam.lang}/${BaseConst.DIR_LOADING}`,
            SpriteFrame,
        );
        await gameLoadingLoader.load(true);

        this.bundleComplete = true;
        this.checkComplete();
    }

    private checkComplete(): void {
        if (!this.spineComplete || !this.bundleComplete) return;

        director.loadScene('load', () => {
            //不走html播放起始動畫
            //   if (document.getElementById('loading')) {
            //     document.getElementById('loading').parentNode.removeChild(document.getElementById('loading'));
            //   }
            Logger.log('[ActivateScene] loadScene 完成!');
        });
    }
    update(deltaTime: number) { }
}
