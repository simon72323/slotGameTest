import { _decorator, Component, director, instantiate, Node, Prefab, SpriteFrame } from 'cc';
import { BundleLoader } from '../utils/BundleLoader';
import { BaseConst } from '../data/BaseConst';
import { DataManager } from '../data/DataManager';
import { UrlParam } from '../data/UrlParam';
import { Logger } from '../utils/Logger';
const { ccclass, property } = _decorator;

@ccclass('ActivateScene')
export class ActivateScene extends Component {
    // private spineComplete: boolean = false;
    // private loadingBundleComplete: boolean = false;
    private loadingLayer: Node = null;
    private baseLayer: Node = null;
    private baseTopLayer: Node = null;
    // private gameLayer: Node = null;

    private

    onLoad() {
        this.loadingLayer = this.node.getChildByName('LoadingLayer');
        this.baseLayer = this.node.getChildByName('BaseLayer');
        this.baseTopLayer = this.node.getChildByName('BaseTopLayer');
        // this.gameLayer = this.node.getChildByName('GameLayer');
    }

    async start() {
        //gif至少播一次
        // this.scheduleOnce(() => {
        //     this.spineComplete = true;
        //     this.loadingComplete();
        // }, 1);

        //載入資源
        const loader = new BundleLoader();

        //載入loading頁語系資源
        // loader.add(BaseConst.bundle.loading, UrlParam.lang, SpriteFrame);
        // await loader.load();

        //載入loading頁Prefab
        loader.add(BaseConst.bundle.loading, BaseConst.dir.prefab, Prefab);
        loader.load();
        BundleLoader.onLoaded(BaseConst.bundle.loading, BaseConst.dir.prefab, (assets: any) => {
            const loadingPage = instantiate(assets[BaseConst.prefab.loadingPage]);
            this.loadingLayer.addChild(loadingPage);
            Logger.log('[ActivateScene] 載入loading頁資源完成!');
        });

        //載入baseLanguage語系資源
        // loader.add(BaseConst.bundle.baseLanguage, UrlParam.lang, SpriteFrame);
        // await loader.load();

        //載入base & baseTop Prefab
        loader.add(BaseConst.bundle.base, BaseConst.dir.prefab, Prefab);
        loader.load();
        BundleLoader.onLoaded(BaseConst.bundle.base, BaseConst.dir.prefab, (assets: any) => {
            const base = instantiate(assets[BaseConst.prefab.base]);
            this.baseLayer.addChild(base);
            Logger.log('[ActivateScene] 載入base資源完成!');
            const baseTop = instantiate(assets[BaseConst.prefab.baseTop]);
            this.baseTopLayer.addChild(baseTop);
            Logger.log('[ActivateScene] 載入baseTop資源完成!');
        });


        //載入base & game語系資源
        // loader.add(BaseConst.BUNDLE_BASE_LANGUAGE, `${UrlParam.lang}/${BaseConst.DIR_LOADING}`, SpriteFrame);
        // loader.add(BaseConst.BUNDLE_LANGUAGE, `${UrlParam.lang}/${BaseConst.DIR_LOADING}`, SpriteFrame);
        // await loader.load();

    }

    update(deltaTime: number) { }
}
