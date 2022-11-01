export default {
    "last_node_id": 13,
    "last_link_id": 25,
    "nodes": [
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
            "id": 4,
            "type": "pipeline/RenderToScreen",
            "pos": [
                1583,
                421
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
                    "link": 22
                }
            ],
            "properties": {}
        },
        {
            "id": 12,
            "type": "pipeline/DeferredPostStage",
            "pos": [
                1313,
                507
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
                    "link": 25
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
            "order": 3,
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
                        25
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
            "order": 1,
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
                    "links": [],
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
            25,
            11,
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