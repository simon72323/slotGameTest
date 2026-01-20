import { _decorator, Component, sp } from 'cc';
import { BaseEvent } from 'db://assets/base/script/event/BaseEvent';
import { ModuleID } from 'db://assets/base/script/types/BaseType';

const { ccclass } = _decorator;
/**
 * 背景UI
 */
@ccclass('BackgroundUI')
export class BackgroundUI extends Component {
    //免費遊戲背景
    private ani_bg: sp.Skeleton;

    onLoad() {
        this.ani_bg = this.node.getChildByName('ani_bg').getComponent(sp.Skeleton);
        BaseEvent.changeScene.on(this.onChangeScene, this);
        this.onChangeScene(ModuleID.MG);
    }

    /**
     * 切換場景
     * @param id 
     */
    private onChangeScene(id: ModuleID) {
        const animName = id === ModuleID.MG ? 'mg' : 'fg';
        this.ani_bg.setAnimation(0, animName, true);
    }
}