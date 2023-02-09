import { _decorator, Component, Node, Prefab, instantiate, game, JsonAsset, director, ProgressBar, Label, UITransform, lerp, setDisplayStats, isDisplayStats, Light, profiler, resources, sys } from 'cc';
import { Game } from '../data/game';
import { Save } from '../data/save';
import { Msg } from '../../core/msg/msg';
import { ResCache } from '../../core/res/res-cache';
import { GScene } from '../../core/scene/g-scene';
const { ccclass, type, property } = _decorator;


@ccclass('Preload')
export class Preload extends Component {
    @property
    initGame = false

    @type(String)
    prefabToLoad: string[] = []
    @type(Node)
    prefabRoot: Node | undefined

    @type(Node)
    removeWhenLoaded: Node[] = []

    @property(JsonAsset)
    savejson: JsonAsset

    @type(ProgressBar)
    progress: ProgressBar | undefined

    @type(Label)
    progressInfo: Label | undefined

    @property
    ui = ''

    @type(String)
    inst_actions: string[] = []

    progressTarget = 0

    tasks: any[] = []
    startTime = 0

    initGameTasks () {
        if (!this.initGame) return

        this.startTime = performance.now()

        GScene.isPreload = true;

        Game.Instance.preInit(this.savejson);

        this.tasks.push(
            {
                name: 'Loading Resources',
                task: async () => {
                    console.time('Load Resources');

                    await new Promise((resolve) => {
                        ResCache.Instance.load(() => {
                            Game.Instance.init();

                            setDisplayStats(false)

                            console.timeEnd('Load Resources');
                            resolve(null);
                        });
                    })
                }
            },

            {
                name: 'Preload Scene',
                task: async () => {
                    await Promise.all(['scene-menu', 'scene-editor', 'scene-map'].map(sceneName => {
                        return new Promise(resolve => {
                            director.preloadScene(sceneName, () => {
                                resolve(null)
                            })
                        })
                    }))
                }
            },
            {
                name: 'Preload Material',
                task: async () => {
                    await new Promise(resolve => {
                        resources.loadDir('materials', () => {
                            resolve(null)
                        })
                    })

                    await new Promise(resolve => {
                        resources.loadDir('preload_prefabs', (err, prefabs) => {
                            prefabs.forEach((p: Prefab) => {
                                let n = instantiate(p) as Node
                                n.parent = director.getScene() as any
                                n.parent = null
                            })

                            resolve(null)
                        })
                    })
                }
            }
        )
    }

    async load () {

        GScene.isPreload = true;

        if (this.progress) {
            let ui = this.progress.getComponent(UITransform)
            this.progress.progress = 0;
        }

        this.initGameTasks()

        let tasks = this.tasks
        let lights = []

        await new Promise(resolve => {
            let i = setInterval(() => {
                if ((1 - this.progress.progress) < 0.01) {
                    resolve(null)
                    clearInterval(i)
                }
            })
        })

        lights.forEach(l => {
            l.node.active = true
        })

        for (let i = 0; i < this.removeWhenLoaded.length; i++) {
            this.removeWhenLoaded[i].active = false;
        }

        GScene.isPreload = false;
        GScene.isLoadScene = false;

        await new Promise(resolve => {
            setTimeout(() => {
                resolve(null)
            }, 1000)
        })


        // if (profiler._stats) {
        //     (profiler._stats as any).fps.counter._accumValue = 120
        // }
        // setDisplayStats(Save.Instance._cur && Save.Instance._cur.debugIndex)

        if (this.initGame) {
            Msg.emit('preload-inited-game', this.startTime)
        }
    }

    async start () {
        await this.load()
    }

    update (deltaTime: number) {

        if (this.progress) {
            this.progress.progress = lerp(this.progress.progress, this.progressTarget, deltaTime)
        }

    }
}

