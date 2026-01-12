import { _decorator, Component, director, Label, Node, ProgressBar, sp } from 'cc';

import { Notice } from 'db://assets/base/components/notice/Notice';
import { BaseConst } from 'db://assets/base/script/data/BaseConst';
import { dataManager } from 'db://assets/base/script/data/DataManager';
import { httpManager } from 'db://assets/base/script/network/HttpManager';
import { i18n } from 'db://assets/base/script/utils/i18n';
import { ScreenAdapter } from 'db://assets/base/script/utils/ScreenAdapter';
import { Utils } from 'db://assets/base/script/utils/Utils';
import { UrlParam } from 'db://assets/base/script/data/UrlParam';
import { XEvent } from 'db://assets/base/script/event/XEvent';


const { ccclass, property, disallowMultiple } = _decorator;

@ccclass('Loading')
@disallowMultiple(true)
export class Loading extends Component {
    @property({ tooltip: '遊戲場景名稱' })
    public GameScene: string = 'Game';

    public static remove :XEvent = new XEvent();

    /** 載入進度條 */
    public progressBar: ProgressBar = null;
    /** 載入進度標籤 */
    public progressLabel: Label = null;
    /** 載入Logo動態Spine */
    public logoSpine: sp.Skeleton = null;

    private loadingNode: Node = null;


    protected onLoad() {
        // E2ETest.E2EStartLoading();
        ScreenAdapter.setupResize();//初始化屏幕適配
        this.initUI();
        UrlParam.initUrlParameters();//初始化URL參數
        i18n.init(UrlParam.lang);//初始化語言
        director.addPersistRootNode(this.node);

        // GoogleAnalytics.instance.initialize();
    }

    /**
     * 初始化UI屬性
     */
    private initUI() {
        this.loadingNode = this.node.getChildByPath('Loading');
        this.progressBar = this.node.getChildByPath('Loading/ProgressBar').getComponent(ProgressBar);
        this.progressLabel = this.node.getChildByPath('Loading/ProgressBar/Value').getComponent(Label);
        this.logoSpine = this.node.getChildByPath('Loading/Logo').getComponent(sp.Skeleton);
        this.logoSpine.setAnimation(0, 'in', false);
        this.logoSpine.addAnimation(0, 'loop', true);
        // this.blackLayer = this.node.getChildByName('Black');
    }


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

        this.sendUserData()
            .then(this.sendGameData)
            .then(this.getCurrencyJson)
            .then(() => {
                this.loadGameScene();
                // console.log('Loading Done');
            })
            .catch((e: any) => {
                //要出現405錯誤
                Notice.showError.emit(405);
                // console.error(e);
                // console.error('fail to load data from server');
            });
    }

    /**
     * 發送用戶資料
     */
    private async sendUserData() {
        await httpManager().sendUserData();
    }

    /**
     * 發送遊戲資料
     */
    private async sendGameData() {
        await httpManager().sendGameData();
    }

    /**
     * 取得新的 token
     */
    private async getRenewToken() {
        let paramToken = UrlParam.token;  // 從 URL 獲取的原始 token
        let token = sessionStorage.getItem(paramToken); // 檢查 sessionStorage 中是否有緩存的 token

        // 如果 sessionStorage 中有有效的 token，直接使用
        if (token != null && token.length > 0) {
            UrlParam.token = token;
            return token;
        }

        // 如果沒有緩存的 token，才向伺服器請求新的 token
        const newToken = await httpManager().sendRenewToken();
        UrlParam.token = newToken; // 只更新 token
        return newToken;
    }

    /**
     * 載入遊戲場景
     */
    public async loadGameScene() {
        Loading.remove.on(this.reomveLoading, this);
        let currentRate: number = 0;
        director.preloadScene(this.GameScene, (completedCount, totalCount, item) => {
            let rate = completedCount / totalCount;
            let progress = Math.floor(rate * 100);
            if (rate > currentRate) currentRate = rate;

            this.progressBar.progress = currentRate;
            this.progressLabel.string = progress + '%';
        }, () => {
            // await Utils.delay(8);
            director.loadScene(this.GameScene, (err, scene) => {
                // console.log('loadScene 完成!');
                // this._loadingDone = true;
                // let loadingTime = Math.floor((Date.now() - this.loadingTime) / 1000 + 4);
                // Utils.GoogleTag('LoadingEnd', { 'time': loadingTime });
            });
        });
    }

    /**
     * 隱藏載入畫面
     */
    private reomveLoading(): void {
        Utils.fadeOut(this.loadingNode, 0.2, 255, 0, () => {
            this.node.destroy();
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