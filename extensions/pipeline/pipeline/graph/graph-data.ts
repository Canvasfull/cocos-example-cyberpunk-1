export default {
    "last_node_id": 17,
    "last_link_id": 46,
    "nodes": [
        {
            "id": 10,
            "type": "pipeline/DeferredGBufferStage",
            "pos": [
                444,
                612
            ],
            "size": {
                "0": 228.39999389648438,
                "1": 170
            },
            "flags": {},
            "order": 3,
            "mode": 0,
            "inputs": [
                {
                    "name": "Camera Output",
                    "type": "Camera Output",
                    "link": 16
                },
                {
                    "name": "RenderTexture",
                    "type": "RenderTexture",
                    "link": null
                },
                {
                    "name": "Custom Size",
                    "type": "vec2",
                    "link": null
                }
            ],
            "outputs": [
                {
                    "name": "RenderTexture",
                    "type": "RenderTexture",
                    "links": [
                        17
                    ],
                    "slot_index": 0
                }
            ],
            "properties": {
                "CameraOutputType": "Color",
                "Name": "DeferredGBufferStage",
                "Format": "RGBA8",
                "showResult": false,
                "shadingScale": 1,
                "material": "blit-screen"
            }
        },
        {
            "id": 15,
            "type": "pipeline/Pipeline",
            "pos": [
                123,
                144
            ],
            "size": {
                "0": 210,
                "1": 82
            },
            "flags": {},
            "order": 0,
            "mode": 0,
            "outputs": [
                {
                    "name": "Camera Output",
                    "type": "Camera Output",
                    "links": [
                        34
                    ],
                    "slot_index": 0
                }
            ],
            "properties": {
                "Name": "editor",
                "Enable": true
            }
        },
        {
            "id": 16,
            "type": "pipeline/RenderToScreen",
            "pos": [
                716,
                133
            ],
            "size": {
                "0": 140,
                "1": 26
            },
            "flags": {},
            "order": 4,
            "mode": 0,
            "inputs": [
                {
                    "name": "RenderTexture",
                    "type": "RenderTexture",
                    "link": 35
                }
            ],
            "properties": {}
        },
        {
            "id": 5,
            "type": "pipeline/custom.ForwardStage",
            "pos": [
                402,
                133
            ],
            "size": {
                "0": 228.39999389648438,
                "1": 170
            },
            "flags": {},
            "order": 2,
            "mode": 0,
            "inputs": [
                {
                    "name": "Camera Output",
                    "type": "Camera Output",
                    "link": 34
                },
                {
                    "name": "RenderTexture",
                    "type": "RenderTexture",
                    "link": null
                },
                {
                    "name": "Custom Size",
                    "type": "vec2",
                    "link": null
                }
            ],
            "outputs": [
                {
                    "name": "RenderTexture",
                    "type": "RenderTexture",
                    "links": [
                        35
                    ],
                    "slot_index": 0
                }
            ],
            "properties": {
                "CameraOutputType": "Color",
                "Name": "custom.ForwardStage",
                "Format": "RGBA8",
                "showResult": false,
                "shadingScale": 1,
                "material": "blit-screen",
                "outputName": "ForwardStage"
            }
        },
        {
            "id": 11,
            "type": "pipeline/DeferredLightingStage",
            "pos": [
                745,
                608
            ],
            "size": {
                "0": 228.39999389648438,
                "1": 170
            },
            "flags": {},
            "order": 5,
            "mode": 0,
            "inputs": [
                {
                    "name": "Camera Output",
                    "type": "Camera Output",
                    "link": null
                },
                {
                    "name": "RenderTexture",
                    "type": "RenderTexture",
                    "link": 17
                },
                {
                    "name": "Custom Size",
                    "type": "vec2",
                    "link": null
                }
            ],
            "outputs": [
                {
                    "name": "RenderTexture",
                    "type": "RenderTexture",
                    "links": [
                        43
                    ],
                    "slot_index": 0
                }
            ],
            "properties": {
                "CameraOutputType": "Color",
                "Name": "DeferredLightingStage",
                "Format": "RGBA8",
                "showResult": false,
                "shadingScale": 1,
                "material": "blit-screen"
            }
        },
        {
            "id": 1,
            "type": "pipeline/Pipeline",
            "pos": [
                133,
                617
            ],
            "size": {
                "0": 210,
                "1": 82
            },
            "flags": {},
            "order": 1,
            "mode": 0,
            "outputs": [
                {
                    "name": "Camera Output",
                    "type": "Camera Output",
                    "links": [
                        16
                    ],
                    "slot_index": 0
                }
            ],
            "properties": {
                "Name": "main",
                "Enable": true
            }
        },
        {
            "id": 4,
            "type": "pipeline/RenderToScreen",
            "pos": [
                1925,
                607
            ],
            "size": {
                "0": 140,
                "1": 26
            },
            "flags": {},
            "order": 9,
            "mode": 0,
            "inputs": [
                {
                    "name": "RenderTexture",
                    "type": "RenderTexture",
                    "link": 22
                }
            ],
            "properties": {}
        },
        {
            "id": 12,
            "type": "pipeline/DeferredPostStage",
            "pos": [
                1660,
                604
            ],
            "size": {
                "0": 228.39999389648438,
                "1": 170
            },
            "flags": {},
            "order": 8,
            "mode": 0,
            "inputs": [
                {
                    "name": "Camera Output",
                    "type": "Camera Output",
                    "link": null
                },
                {
                    "name": "RenderTexture",
                    "type": "RenderTexture",
                    "link": 46
                },
                {
                    "name": "Custom Size",
                    "type": "vec2",
                    "link": null
                }
            ],
            "outputs": [
                {
                    "name": "RenderTexture",
                    "type": "RenderTexture",
                    "links": [
                        22
                    ],
                    "slot_index": 0
                }
            ],
            "properties": {
                "CameraOutputType": "Color",
                "Name": "DeferredPostStage",
                "Format": "RGBA8",
                "showResult": false,
                "shadingScale": 1,
                "material": "blit-screen"
            }
        },
        {
            "id": 14,
            "type": "pipeline/custom.BloomStage",
            "pos": [
                1069,
                610
            ],
            "size": {
                "0": 228.39999389648438,
                "1": 170
            },
            "flags": {},
            "order": 6,
            "mode": 0,
            "inputs": [
                {
                    "name": "Camera Output",
                    "type": "Camera Output",
                    "link": null
                },
                {
                    "name": "RenderTexture",
                    "type": "RenderTexture",
                    "link": 43
                },
                {
                    "name": "Custom Size",
                    "type": "vec2",
                    "link": null,
                    "slot_index": 2
                }
            ],
            "outputs": [
                {
                    "name": "RenderTexture",
                    "type": "RenderTexture",
                    "links": [
                        45
                    ],
                    "slot_index": 0
                }
            ],
            "properties": {
                "CameraOutputType": "Color",
                "Name": "custom.BloomStage",
                "Format": "RGBA8",
                "showResult": false,
                "shadingScale": 1,
                "material": "blit-screen",
                "threshold": 0.1,
                "iterations": 2,
                "intensity": 0.8
            }
        },
        {
            "id": 17,
            "type": "pipeline/TAAStage",
            "pos": [
                1353,
                714
            ],
            "size": {
                "0": 228.39999389648438,
                "1": 314
            },
            "flags": {},
            "order": 7,
            "mode": 0,
            "inputs": [
                {
                    "name": "Camera Output",
                    "type": "Camera Output",
                    "link": null
                },
                {
                    "name": "RenderTexture",
                    "type": "RenderTexture",
                    "link": 45
                },
                {
                    "name": "Custom Size",
                    "type": "vec2",
                    "link": null
                }
            ],
            "outputs": [
                {
                    "name": "RenderTexture",
                    "type": "RenderTexture",
                    "links": [
                        46
                    ],
                    "slot_index": 0
                }
            ],
            "properties": {
                "CameraOutputType": "Color",
                "Name": "TAAStage",
                "Format": "RGBA8",
                "showResult": false,
                "shadingScale": 1,
                "sampleScale": 1,
                "feedback": 0.95,
                "shaowHistoryTexture": false,
                "clampHistoryTexture": true,
                "forceRender": true,
                "dirty": false
            }
        }
    ],
    "links": [
        [
            16,
            1,
            0,
            10,
            0,
            "Camera Output"
        ],
        [
            17,
            10,
            0,
            11,
            1,
            "RenderTexture"
        ],
        [
            22,
            12,
            0,
            4,
            0,
            "RenderTexture"
        ],
        [
            34,
            15,
            0,
            5,
            0,
            "Camera Output"
        ],
        [
            35,
            5,
            0,
            16,
            0,
            "RenderTexture"
        ],
        [
            43,
            11,
            0,
            14,
            1,
            "RenderTexture"
        ],
        [
            45,
            14,
            0,
            17,
            1,
            "RenderTexture"
        ],
        [
            46,
            17,
            0,
            12,
            1,
            "RenderTexture"
        ]
    ],
    "groups": [],
    "config": {},
    "extra": {},
    "version": 0.4
}