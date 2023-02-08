import { _decorator, Component, Node, Sprite, SpriteFrame, sys } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('UIGuidePlatform')
export class UIGuidePlatform extends Component {

    @property( { type:[SpriteFrame] } )
    guideSprites:SpriteFrame[] = [];

    @property( { type : Sprite } )
    sprite:Sprite | undefined;

    start() {

        if(sys.platform === sys.Platform.MOBILE_BROWSER || 
            sys.platform === sys.Platform.ANDROID || 
            sys.platform === sys.Platform.IOS ) {
            this.sprite!.spriteFrame = this.guideSprites[1];
        }else {
            this.sprite!.spriteFrame = this.guideSprites[0];
        }

    }

}

