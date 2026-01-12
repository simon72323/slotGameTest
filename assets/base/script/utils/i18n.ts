import { _decorator, Component, JsonAsset, Enum, director } from 'cc';
import { EDITOR } from 'cc/env';

import { LanguageLabel } from 'db://assets/base/components/localized/LanguageLabel';

enum Language {
    en = 'en',
    zh_cn = 'zh-cn',
    // id = 'id',
    // ko = 'ko',
    // vi = 'vi',
    // th = 'th',
    // ms = 'ms',
    // ph = 'ph',
    // jp = 'jp',
}

const { ccclass, property, disallowMultiple, executeInEditMode } = _decorator;
@ccclass('i18nLanguageData')
export class i18nLanguageData {
    @property({ displayName: 'ID' })
    public id = '';

    @property({ type: JsonAsset, displayName: 'JsonFile' })
    public jsonFile: JsonAsset;
}

@ccclass('i18n')
// @disallowMultiple(true)//禁止在同一節點上掛載多個i18n組件
// @executeInEditMode(true)//允許在編輯器中執行
export class i18n extends Component {
    public static instance: i18n;
    public static language: {};
    public static languageType: string = 'en';
    public static getLanguage() { return i18n.languageType; }
    public static setLanguage(value: string) { i18n.languageType = value; }
    private static labelContents: LanguageLabel[] = [];//自定義語系組件

    @property({ type: [i18nLanguageData], displayName: 'JsonDataList', group: { name: 'setting', id: '0' } })
    public languageData: i18nLanguageData[] = [];

    // @property({ displayName: '下載Json API網址', group: { name: 'develop', id: '1' } })
    // public editDownloadJsonURL = 'https://www.google.com/url?q=https://script.google.com/a/macros/ideatek.tech/s/AKfycbwHQEm5vUzr4ByllvzTKwpJlNQ9Ju_fwQRLyLgbvmGk43qyLF92MI5oim2hbJbH8O68NQ/exec';

    @property({ type: Enum(Language), displayName: '預覽語言', group: { name: 'develop', id: '1' } })
    public previewLanguage: Language = Language.en;

    public isLoadDone = false;
    // public fontSizeGroupData: { [key: string]: { 'labels': LanguageLabel[], 'size': number } } = {};

    // /**
    //  * 下載多國語言設定
    //  * @param data 
    //  */
    // public static EditDownloadJson(data: i18nLanguageData) {
    //     if (!EDITOR) return;
    //     if (i18n.instance.editDownloadJsonURL == null) return;
    //     let url = i18n.instance.editDownloadJsonURL + '?download=1&gameID=' + data.id;
    //     console.log('EditDownloadJson', url);
    //     window.open(url);
    // }

    public onLoad() {
        if (i18n.instance && i18n.instance !== this) {
            //檢查舊實例的節點是否仍然有效
            if (i18n.instance.node && i18n.instance.node.isValid) {
                this.node.destroy();
                return;
            } else {
                // 舊節點已無效，清除實例引用
                i18n.instance = null;
            }
        }
        i18n.instance = this;
        // 只在運行時模式下添加持久化根節點（編輯器模式下不生效）
        if (!EDITOR) {
            director.addPersistRootNode(this.node);
        }
        this.loadLanguage();
    }

    /**
     * 載入多國語言設定
     */
    public async loadLanguage() {
        i18n.language = {};
        for (let idx in this.languageData) {
            const data = this.languageData[idx];
            // const domain = PREVIEW ? 'gc.prep.lab' : window.location.hostname;
            // const protocol = window.location.protocol === 'https:' ? 'https://' : 'http://';
            // const jsonPath = `${protocol}${domain}/${data.prodPath}`;

            if (data.id.length === 0) continue;
            // if (data.jsonFile == null) continue;
            if (i18n.language[data.id] != null) continue;

            // console.log('jsonPath', jsonPath);
            // let jsonData = null;
            // 從 jsonPath 取得 json 資料
            // try {
            //     console.log('取得網路 json 資料');
            //     jsonData = await fetch(jsonPath).then(res => res.json());
            //     this.parseLanguage(data.id, jsonData);
            //     console.log('取得網路 json 資料成功:', jsonPath);
            // } catch (error) {
            //     jsonData = null;
            // }

            // if (jsonData === null) { // 如果沒有取得 json 資料，則使用 resources 中的 JsonAsset
            this.parseLanguage(data.id, data.jsonFile);
            continue;
            // }
        }

        this.isLoadDone = true;
        i18n.refreshLanguageContent();
        // console.log('i18n 資料載入完成');
    }

    /**
     * 解析多國語言設定
     * @param id 
     * @param data 
     */
    public parseLanguage(id: string, data: any) {
        if (i18n.language[id] == null) i18n.language[id] = {};
        if (data == null || data.json == null) return;
        let lanKeys = Object.keys(data.json);
        for (let i in lanKeys) {
            let lan = lanKeys[i];
            let ids = Object.keys(data.json[lan]);
            if (i18n.language[id][lan] == null) i18n.language[id][lan] = {};
            for (let j in ids) {
                let keyId = ids[j];
                let no = parseInt(ids[j]);
                i18n.language[id][lan][no] = data.json[lan][keyId];
            }
        }
    }

    /**
     * 取得文字
     * @param key 獲取json檔的key
     * @param id 語系數字id
     * @param label label的組件
     * @returns 
     */
    public static getContent(key: string, id: number, label: any = null): string {
        if (!key || key.length == 0) return null;

        if (i18n.instance?.isLoadDone !== true) {
            if (label == null) return null;
            i18n.labelContents.push(label);
            return null;
        }

        if (id === 0) return null;
        if (i18n.language == null) return null;
        if (i18n.language[key] == null) return null;

        let type = (EDITOR) ? i18n.instance.previewLanguage : i18n.languageType;
        console.log('type', type);
        if (i18n.language[key][type] == null) type = Language.en;

        if (i18n.language[key][type][id] == null) {
            console.warn(`i18n Can not find language --> key : ${key} , id : ${id} , lang : ${type}`);
            return null;
        }

        return i18n.language[key][type][id];
    }

    /**
     * 刷新多國語言內容
     */
    private static refreshLanguageContent() {
        if (i18n.labelContents.length == 0) return;

        for (let label of i18n.labelContents) {
            label.displayContent();
        }
        i18n.labelContents = [];
    }

    /**
     * 初始化多國語言
     * @param language 語系
     */
    public static init(language: string) {
        i18n.languageType = language;
    }
}