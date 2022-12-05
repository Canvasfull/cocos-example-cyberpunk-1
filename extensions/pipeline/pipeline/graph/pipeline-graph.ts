import { Component, sys, _decorator } from 'cc'
import { EDITOR } from 'cc/env';
import { showGraph } from './graph';
import { repaintInEditMode } from '../utils/editor'

const { ccclass, property, executeInEditMode } = _decorator;

@ccclass('custom.PiepelineGraph')
@executeInEditMode
export class PiepelineGraph extends Component {
    @property
    _edit = false;

    @property
    get edit () {
        return this._edit;
    }
    set edit (v) {
        this._edit = v;

        this.onEditChanged();
    }

    start () {
        this.onEditChanged();
    }

    onEditChanged () {
        if (!sys.isBrowser || !EDITOR) {
            return;
        }
        let show = this._edit;

        showGraph(show, () => {
            this._edit = false;

            if (globalThis.cce) {
                (globalThis.cce).Node.emit('change', this.node);
            }
        })
    }

    update () {
        if (EDITOR) {
            if (this._edit) {
                repaintInEditMode();
            }
        }

    }
}
