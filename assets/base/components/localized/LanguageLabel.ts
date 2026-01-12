/**
 * 使用步驟：
 * 1. 將此組件直接掛載在節點上
 * 2. 設置對應的languageKey與languageID(數字格式)
 * 3. 確保 i18n 已設置languageData
 */
import { _decorator, CCInteger, Label } from 'cc';

import { i18n } from 'db://assets/base/script/utils/i18n';

const { ccclass, property, executeInEditMode } = _decorator;
@ccclass('LanguageLabel')
@executeInEditMode(true)
export class LanguageLabel extends Label {
    @property({ displayName: 'LanguageKey' })
    private languageKey = 'default';

    @property({ displayName: 'LanguageID', type: CCInteger })
    private languageID = 0;

    @property({ displayName: '刷新語系文字' })
    public set getMessage(value: boolean) { this.displayContent(); }

    public get getMessage(): boolean { return false; }

    start() {
        this.node['setKey'] = this.setKey;
        this.displayContent();
    }

    public set setKey(key: string) {
        this.languageKey = key;
        this.displayContent();
    }

    /**
     * 顯示文字
     * @returns 
     */
    public displayContent() {
        if (this.languageKey == null || this.languageKey.length == 0) return;
        let content = i18n.getContent(this.languageKey, this.languageID, this);
        if (content == null || content.length == 0) return;
        this.string = content;
    }
}