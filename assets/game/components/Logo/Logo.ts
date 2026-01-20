import { _decorator, Component, Sprite } from 'cc';
import { BaseConst } from 'db://assets/base/script/data/BaseConst';
import { UrlParam } from 'db://assets/base/script/data/UrlParam';
import { BundleLoader } from 'db://assets/base/script/utils/BundleLoader';

const { ccclass, property } = _decorator;

@ccclass('Logo')
export class Logo extends Component {
    onLoad() {
        let lang: string = UrlParam.lang;
        BundleLoader.onLoaded(BaseConst.bundle.language, `${lang}/${BaseConst.dir.texture}`, (langRes: any) => {
            this.node.getComponent(Sprite).spriteFrame = langRes['logo'];
        });

    }
}