export default {
    "last_node_id": 16,
    "last_link_id": 35,
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
                "1": 218
            },
            "flags": {},
            "order": 2,
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
                "material": "blit-screen",
                "shadingScale": 1
            }
        },
        {
            "id": 12,
            "type": "pipeline/DeferredPostStage",
            "pos": [
                1376,
                531
            ],
            "size": {
                "0": 228.39999389648438,
                "1": 218
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
                    "link": 33
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
                "material": "blit-screen",
                "shadingScale": 1
            }
        },
        {
            "id": 11,
            "type": "pipeline/DeferredLightingStage",
            "pos": [
                776,
                505
            ],
            "size": {
                "0": 228.39999389648438,
                "1": 218
            },
            "flags": {},
            "order": 4,
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
                        32
                    ],
                    "slot_index": 0
                }
            ],
            "properties": {
                "CameraOutputType": "Color",
                "Name": "DeferredLightingStage",
                "Format": "RGBA8",
                "showResult": false,
                "material": "blit-screen",
                "shadingScale": 1
            }
        },
        {
            "id": 14,
            "type": "pipeline/custom.BloomStage",
            "pos": [
                1056,
                622
            ],
            "size": {
                "0": 228.39999389648438,
                "1": 218
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
                    "link": 32
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
                        33
                    ],
                    "slot_index": 0
                }
            ],
            "properties": {
                "CameraOutputType": "Color",
                "Name": "custom.BloomStage",
                "Format": "RGBA8",
                "showResult": false,
                "material": "blit-screen",
                "shadingScale": 1,
                "threshold": 0.1,
                "iterations": 2,
                "intensity": 0.8
            }
        },
        {
            "id": 1,
            "type": "pipeline/Pipeline",
            "pos": [
                127,
                651
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
            "order": 1,
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
            "id": 4,
            "type": "pipeline/RenderToScreen",
            "pos": [
                1725,
                423
            ],
            "size": {
                "0": 140,
                "1": 26
            },
            "flags": {},
            "order": 8,
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
            "order": 5,
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
                "1": 218
            },
            "flags": {},
            "order": 3,
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
                "material": "blit-screen",
                "shadingScale": 1,
                "outputName": "ForwardStage"
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
            32,
            11,
            0,
            14,
            1,
            "RenderTexture"
        ],
        [
            33,
            14,
            0,
            12,
            1,
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
        ]
    ],
    "groups": [],
    "config": {},
    "extra": {},
    "version": 0.4
}