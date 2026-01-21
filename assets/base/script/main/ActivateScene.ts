import { _decorator, Component, instantiate, Node, Prefab } from 'cc';
import { BundleLoader } from '../utils/BundleLoader';
import { BaseConst } from '../data/BaseConst';
import { UrlParam } from '../data/UrlParam';
import { Logger } from '../utils/Logger';
import { ScreenAdapter } from '../utils/ScreenAdapter';
import { i18n } from '../utils/i18n';
import { TimeoutManager } from '../manager/TimeoutManager';
import { ErrorCode, Notice } from '../../components/notice/Notice';
const { ccclass, property } = _decorator;

@ccclass('ActivateScene')
export class ActivateScene extends Component {
    private loadingLayer: Node = null;


    protected onLoad() {
        this.loadingLayer = this.node.getChildByName('LoadingLayer');
        this.activateInit();
    }

    /**
     * 激活場景初始化
     */
    private activateInit() {
        ScreenAdapter.setupResize();//初始化屏幕適配
        UrlParam.initUrlParameters();//初始化URL參數
        i18n.init(UrlParam.lang);//初始化語言
        // E2ETest.E2EStartLoading();
        // GoogleAnalytics.instance.initialize();
        this.loadLoadingBundle();
    }

    /**
     * 載入loading頁封包資源
     */
    public loadLoadingBundle() {
        //逾時跳錯
        // TimeoutManager.getInstance().register(BaseConst.TIMEOUT_LOADING.key, BaseConst.TIMEOUT_LOADING.seconds, () => {
        //     Notice.showError.emit(ErrorCode.LOGIN_TIMEOUT);
        // });

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
        BundleLoader.onLoaded(BaseConst.bundle.loading, BaseConst.dir.prefab, (assets: any) => {
            const loadingPage = instantiate(assets[BaseConst.prefab.loadingPage]);
            this.loadingLayer.addChild(loadingPage);
            Logger.log('[ActivateScene] 載入loading頁資源完成!');
            //移除Timeout
            // TimeoutManager.getInstance().remove(BaseConst.TIMEOUT_LOADING.key);
        });
        loader.load();
    }

    update(deltaTime: number) { }
}
