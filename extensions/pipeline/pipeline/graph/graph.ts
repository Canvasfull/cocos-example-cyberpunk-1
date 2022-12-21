
import { JsonAsset, sys } from 'cc';
import { EDITOR } from 'cc/env';
import { LGraph, LGraphCanvas, LiteGraph } from './@types/litegraph';
import { css } from './litegragh-css';
import { loadResource, saveJson, saveString } from '../utils/npm';
import { HrefSetting } from '../settings/href-setting';
import graphData from './graph-data'

export const lGraph = globalThis.LGraph as typeof LGraph;
export const lGraphCanvas = globalThis.LGraphCanvas as typeof LGraphCanvas;
export const liteGraph = globalThis.LiteGraph as typeof LiteGraph;

if (!globalThis.__graph__) {
    globalThis.__graph__ = new lGraph();
}
export let graph = globalThis.__graph__ as LGraph;

enum GraphShowType {
    None,
    InnerWindow,
    NewWindow
}

export function saveGraph () {
    if (EDITOR) {
        let content = JSON.stringify(graph.serialize(), null, 4);
        content = `export default ${content}`
        saveString('../graph/graph-data.ts', content);
    }
}

export async function loadGraph () {
    graph.clear();
    graph.configure(graphData);
    graph.start();

    if (!EDITOR && HrefSetting.pauseGraphAfterLoad) {
        setTimeout(() => {
            graph.stop();
        }, 2000)
    }
}

export function showGraph (show = true, onclose?: Function) {
    if (!sys.isBrowser) {
        return;
    }

    let document = window.document;
    let isNewWindow = HrefSetting.graph === GraphShowType.NewWindow;
    if (isNewWindow && show) {
        if (!globalThis.__graph_window__ || !globalThis.__graph_window__.document) {
            if (EDITOR) {
                globalThis.__graph_window__ = window.open();
            }
            else {
                globalThis.__graph_window__ = window.open('', 'newwindow', 'width=960,height=640');
            }
            globalThis.__graph_window__.CanvasRenderingContext2D.prototype.roundRect = window.CanvasRenderingContext2D.prototype.roundRect;
        }
        document = globalThis.__graph_window__.document;
        (document.body as any).style = "background: #181818;overflow:hidden;";
    }
    let body = document.body;

    if (show) {
        // graph.start();

        if (!globalThis.__graph_canvas__) {
            // load css
            {
                let style = document.createElement('style');
                style.innerHTML = css;
                body.appendChild(style);
            }

            // create dom canvas
            {
                let canvasElem = document.createElement('Canvas') as any;
                canvasElem.style = `
                    width:100%;
                    height:100%;
                    position:absolute;
                `;

                if (!globalThis.__l_graph_canvas__) {
                    globalThis.__l_graph_canvas__ = new lGraphCanvas(canvasElem, graph);
                }
                else {
                    globalThis.__l_graph_canvas__.setCanvas(canvasElem);
                }

                globalThis.__graph_canvas__ = canvasElem;
            }

        }

        if (globalThis.__l_graph_canvas__) {
            globalThis.__l_graph_canvas__.setDirty(true, true);
        }

        let __graph_canvas__ = globalThis.__graph_canvas__ as any
        if (__graph_canvas__) {
            __graph_canvas__.width = body.offsetWidth;
            __graph_canvas__.height = body.offsetHeight;
            body.appendChild(__graph_canvas__);

            if (globalThis.__graph_window__) {
                globalThis.__graph_window__.onresize = () => {
                    __graph_canvas__.width = body.offsetWidth;
                    __graph_canvas__.height = body.offsetHeight;
                }
                globalThis.__graph_window__.onbeforeunload = () => {
                    globalThis.__graph_window__ = null;
                    globalThis.__graph_canvas__ = null;
                    globalThis.__l_graph_canvas__ = null;

                    saveGraph();

                    if (onclose) {
                        onclose();
                    }
                }
            }
        }
    }
    else {
        // graph.stop();

        if (isNewWindow) {
            if (globalThis.__graph_window__) {
                globalThis.__graph_window__.close();
            }
        }
        else {
            if (globalThis.__graph_canvas__) {
                body.removeChild(globalThis.__graph_canvas__);
            }
        }

    }
}
globalThis.showGraph = showGraph;
