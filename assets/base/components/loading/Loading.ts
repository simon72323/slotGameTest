import { _decorator, Component, director, instantiate, Label, Node, Prefab, ProgressBar, sp } from 'cc';

import { Notice } from 'db://assets/base/components/notice/Notice';
import { BaseConst } from 'db://assets/base/script/data/BaseConst';
import { dataManager } from 'db://assets/base/script/data/DataManager';
import { httpManager } from 'db://assets/base/script/network/HttpManager';
import { i18n } from 'db://assets/base/script/utils/i18n';
import { ScreenAdapter } from 'db://assets/base/script/utils/ScreenAdapter';
import { Utils } from 'db://assets/base/script/utils/Utils';
import { UrlParam } from 'db://assets/base/script/data/UrlParam';
import { XEvent } from 'db://assets/base/script/event/XEvent';
import { BundleLoader } from '../../script/utils/BundleLoader';
import { Logger } from '../../script/utils/Logger';


const { ccclass, property, disallowMultiple } = _decorator;

@ccclass('Loading')
@disallowMultiple(true)
export class Loading extends Component {
    // @property({ tooltip: '遊戲場景名稱' })
    // public GameScene: string = 'Game';

    public static hide :XEvent = new XEvent();


    /** 載入進度條 */
    // public progressBar: ProgressBar = null;
    // /** 載入進度標籤 */
    // public progressLabel: Label = null;

    // private loadingNode: Node = null;


    protected onLoad() {
        // E2ETest.E2EStartLoading();
        ScreenAdapter.setupResize();//初始化屏幕適配
        UrlParam.initUrlParameters();//初始化URL參數
        i18n.init(UrlParam.lang);//初始化語言
        Loading.hide.once(this.hideLoading, this);
        this.loadGame();
        // this.initUI();
        // director.addPersistRootNode(this.node);

        // GoogleAnalytics.instance.initialize();
    }

    /**
     * 載入遊戲資源:先載語系資源，後載game prefab
     */
    public async loadGame() {
        const progressBar = this.node.getChildByPath('ProgressBar').getComponent(ProgressBar);
        const progressLabel = this.node.getChildByPath('ProgressBar/Value').getComponent(Label);
        // 初始化進度條
        progressBar.progress = 0;
        progressLabel.string = '0%';

        const loader = new BundleLoader();
        loader.add(BaseConst.bundle.game, BaseConst.dir.prefab, Prefab);

        //註冊加載完成回調
        BundleLoader.onLoaded(BaseConst.bundle.game, BaseConst.dir.prefab, (assets: any) => {
            const game = instantiate(assets[BaseConst.prefab.game]);
            const gameLayer = this.node.parent.parent.getChildByName('GameLayer');
            gameLayer.addChild(game);
            Logger.log('[Loading] 載入game prefab完成!');
        });

        // 執行加載，並傳入進度回調
        await loader.load((completedCount, totalCount) => {
            const progress = totalCount > 0 ? completedCount / totalCount : 0;
            progressBar.progress = Math.min(Math.max(progress, 0), 1); // 確保在 0-1 之間
            progressLabel.string = Math.floor(progress * 100) + '%';
        });
        // 確保進度條顯示100%
        progressBar.progress = 1;
        progressLabel.string = '100%';
        console.log('[Loading] 載入完成!');
    }

    /**
     * 初始化UI屬性
     */
    // private initUI() {
        // this.loadingNode = this.node.getChildByPath('Loading');

        // this.blackLayer = this.node.getChildByName('Black');
    // }


    /**
     * 開始載入
     */
    public async start() {
        // Utils.GoogleTag('EnterGame', { 'currency': urlParameters.currency, 'language': urlParameters.lang });

        // console.log('獲取資料');
        // this.getRenewToken()
        //     .then(this.sendUserData)
        //     .then(this.sendGameData)
        //     // .then(() => {
        //     //     this.loadGameScene();
        //     //     console.log('Loading Done');
        //     // })
        //     .catch(function (e) {
        //         //要出現405錯誤
        //         Notice.showError.emit(405);
        //         console.error(e);
        //         console.error('fail to load data from server');
        //     });

        // await httpManager().sendUserData();//發送用戶資料
        // await httpManager().sendGameData();//發送遊戲資料
        // await this.getCurrencyJson();//獲取貨幣資料

        // await this.loadGameScene();
        // this.sendUserData()
        //     // .then(this.sendGameData)
        //     .then(this.getCurrencyJson)
        //     .then(() => {
        //         this.loadGameScene();
        //         // console.log('Loading Done');
        //     })
        //     .catch((e: any) => {
        //         //要出現405錯誤
        //         Notice.showError.emit(405);
        //         // console.error(e);
        //         // console.error('fail to load data from server');
        //     });
    }

    /**
     * 發送用戶資料
     */
    // private async sendUserData() {
    //     await httpManager().sendUserData();
    // }

    // /**
    //  * 發送遊戲資料
    //  */
    // private async sendGameData() {
    //     await httpManager().sendGameData();
    // }

    /**
     * 取得新的 token
     */
    // private async getRenewToken() {
    //     let paramToken = UrlParam.token;  // 從 URL 獲取的原始 token
    //     let token = sessionStorage.getItem(paramToken); // 檢查 sessionStorage 中是否有緩存的 token

    //     // 如果 sessionStorage 中有有效的 token，直接使用
    //     if (token != null && token.length > 0) {
    //         UrlParam.token = token;
    //         return token;
    //     }

    //     // 如果沒有緩存的 token，才向伺服器請求新的 token
    //     const newToken = await httpManager().sendRenewToken();
    //     UrlParam.token = newToken; // 只更新 token
    //     return newToken;
    // }


    /**
     * 隱藏載入畫面
     */
    private hideLoading(): void {
        Utils.fadeOut(this.node, 0.2, 255, 0, () => {
            this.node.active = false;
        });
    }

    /**
     * 取得網路 Json 資料(Currency)獲取幣別資料
     */
    public async getCurrencyJson() {
        let currencyJson = null;
        try {
            // 動態構建 URL，根據當前 domain 變動
            const protocol = window.location.protocol;
            let hostname = window.location.hostname;

            // 如果是 localhost，使用測試環境的 domain
            if (hostname === 'localhost' || hostname === '127.0.0.1') {
                hostname = 'gc.ifun7.vip';
            }

            const configUrl = `${protocol}//${hostname}/webAssets/game/common.json`;

            // console.log(`嘗試從以下位置獲取貨幣資料: ${configUrl}`);
            currencyJson = await fetch(configUrl).then(res => res.json());
            // console.log(`取得網路貨幣資料成功: ${configUrl}`);
        } catch (error) {
            // console.log('無法取得網路貨幣資料，使用本地貨幣資料');
            currencyJson = await Utils.loadJson('data/currency');
        }

        const urlCurrency = dataManager().currency;
        BaseConst.CurrencySymbol = currencyJson.CurrencySymbol[urlCurrency];
        BaseConst.DecimalPlaces = parseInt(currencyJson.DecimalPlaces[urlCurrency]);
    }
}