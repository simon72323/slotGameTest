import { _decorator, Button, Component, director, instantiate, Label, Node, Prefab, ProgressBar, sp, SpriteFrame } from 'cc';

import { BaseConst } from 'db://assets/base/script/data/BaseConst';
import { dataManager } from 'db://assets/base/script/data/DataManager';
import { Utils } from 'db://assets/base/script/utils/Utils';
import { UrlParam } from 'db://assets/base/script/data/UrlParam';
import { BundleLoader } from '../../script/utils/BundleLoader';
import { Logger } from '../../script/utils/Logger';
import { XEvent } from '../event/XEvent';
import { BaseEvent } from '../event/BaseEvent';


const { ccclass, property, disallowMultiple } = _decorator;

@ccclass('Loading')
@disallowMultiple(true)
export class Loading extends Component {
    // public static hide: XEvent = new XEvent();
    private startBtn: Node = null;
    private baseLayer: Node = null;
    private baseTopLayer: Node = null;
    private gameLayer: Node = null;

    protected onLoad() {
        this.startBtn = this.node.getChildByPath('StartBtn');
        this.startBtn.active = false;
        this.baseLayer = this.node.parent.parent.getChildByName('BaseLayer');
        this.baseTopLayer = this.node.parent.parent.getChildByName('BaseTopLayer');
        this.gameLayer = this.node.parent.parent.getChildByName('GameLayer');
        // Loading.hide.once(this.hideLoading, this);
        BaseEvent.initGameComplete.once(this.onInitGameComplete, this);

        //載入遊戲封包資源
        this.loadGameBundle();
    }


    /**
     * 初始化遊戲完成
     */
    private onInitGameComplete(): void {
        this.startBtn.active = true;
        this.startBtn.on(Button.EventType.CLICK, () => {
            //關閉載入畫面
            Utils.fadeOut(this.node, 0.1, 255, 0, () => {
                this.node.active = false;
            });
        }, this,);
    }

    /**
     * 載入遊戲封包資源
     */
    private async loadGameBundle(): Promise<void> {
        //逾時跳錯
        // TimeoutManager.getInstance().register(BaseConst.TIMEOUT_LOADING.key, BaseConst.TIMEOUT_LOADING.seconds, () => {
        //     ErrorManager.getInstance().showError(ErrorCode.Timeout);
        // });
        const progressBar = this.node.getChildByPath('ProgressBar').getComponent(ProgressBar);
        const progressLabel = this.node.getChildByPath('ProgressBar/Value').getComponent(Label);
        // 初始化進度條
        progressBar.progress = 0;
        progressLabel.string = '0%';

        const loader = new BundleLoader();
        //載入baseLanguage語系資源
        loader.add(BaseConst.bundle.baseLanguage, UrlParam.lang, SpriteFrame);
        await loader.load((completedCount, totalCount) => {
            const progress = totalCount > 0 ? completedCount / totalCount : 0;
            progressBar.progress = Math.min(Math.max(progress, 0), 0.1);
            progressLabel.string = Math.floor(progress * 10) + '%';
        });
        Logger.log('[載入baseLanguage語系資源完成!]');

        //載入mainGame語系資源
        loader.add(BaseConst.bundle.language, UrlParam.lang, SpriteFrame);
        await loader.load((completedCount, totalCount) => {
            const progress = totalCount > 0 ? completedCount / totalCount : 0;
            progressBar.progress = Math.min(Math.max(progress, 0.1), 0.2);
            progressLabel.string = 10 + Math.floor(progress * 10) + '%';
        });
        Logger.log('[載入mainGame語系資源完成!]');

        //載入base & baseTop Prefab
        loader.add(BaseConst.bundle.base, BaseConst.dir.prefab, Prefab);
        BundleLoader.onLoaded(BaseConst.bundle.base, BaseConst.dir.prefab, (assets: any) => {
            const base = instantiate(assets[BaseConst.prefab.base]);
            this.baseLayer.addChild(base);
            const baseTop = instantiate(assets[BaseConst.prefab.baseTop]);
            this.baseTopLayer.addChild(baseTop);
        });
        await loader.load((completedCount, totalCount) => {
            const progress = totalCount > 0 ? completedCount / totalCount : 0;
            progressBar.progress = Math.min(Math.max(progress, 0.2), 0.3);
            progressLabel.string = 20 + Math.floor(progress * 10) + '%';
        });
        Logger.log('[載入base資源完成!]');

        //載入mainGame prefab
        loader.add(BaseConst.bundle.mainGame, BaseConst.dir.prefab, Prefab);
        BundleLoader.onLoaded(BaseConst.bundle.mainGame, BaseConst.dir.prefab, (assets: any) => {
            const game = instantiate(assets[BaseConst.prefab.game]);
            this.gameLayer.addChild(game);
        });
        await loader.load((completedCount, totalCount) => {
            const progress = totalCount > 0 ? completedCount / totalCount : 0;
            progressBar.progress = Math.min(Math.max(progress, 0.3), 1); // 確保在 0.1-1 之間
            progressLabel.string = 30 + Math.floor(progress * 70) + '%';
        });
        Logger.log('[載入game prefab完成!]');
        // 確保進度條顯示100%
        progressBar.progress = 1;
        progressLabel.string = '100%';

        //資源和封包都好了就要移除Timeout
        // TimeoutManager.getInstance().remove(BaseConst.TIMEOUT_LOADING.key);
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
     * 取得網路 Json 資料(Currency)獲取幣別資料
     */
    // public async getCurrencyJson() {
    //     let currencyJson = null;
    //     try {
    //         // 動態構建 URL，根據當前 domain 變動
    //         const protocol = window.location.protocol;
    //         let hostname = window.location.hostname;

    //         // 如果是 localhost，使用測試環境的 domain
    //         if (hostname === 'localhost' || hostname === '127.0.0.1') {
    //             hostname = 'gc.ifun7.vip';
    //         }

    //         const configUrl = `${protocol}//${hostname}/webAssets/game/common.json`;

    //         // console.log(`嘗試從以下位置獲取貨幣資料: ${configUrl}`);
    //         currencyJson = await fetch(configUrl).then(res => res.json());
    //         // console.log(`取得網路貨幣資料成功: ${configUrl}`);
    //     } catch (error) {
    //         // console.log('無法取得網路貨幣資料，使用本地貨幣資料');
    //         currencyJson = await Utils.loadJson('data/currency');
    //     }

    //     const urlCurrency = dataManager().currency;
    //     BaseConst.CurrencySymbol = currencyJson.CurrencySymbol[urlCurrency];
    //     BaseConst.DecimalPlaces = parseInt(currencyJson.DecimalPlaces[urlCurrency]);
    // }
}