import { _decorator, Component, game, screen, director } from 'cc';
import { Log } from '../../core/io/log';
import { Game } from '../../core/data/game'
import { ResCache } from '../../core/res/res-cache';

const { ccclass, property } = _decorator;

@ccclass('Init')
export class Init extends Component {

    // [1]
    // dummy = '';

    // [2]
    // @property
    // serializableDummy = 0;

    start () {
        // [3]
        Log.info('init game start.');
        director.addPersistRootNode(this.node);
        ResCache.Instance.load(Game.Instance.init.bind(Game.Instance));

    }

    update (deltaTime: number) {

        Game.Instance.update(deltaTime);

    }

}
