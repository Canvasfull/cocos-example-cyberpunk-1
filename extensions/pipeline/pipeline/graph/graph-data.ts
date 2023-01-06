export default {
    "last_node_id": 26,
    "last_link_id": 67,
    "nodes": [
        {
            "id": 17,
            "type": "pipeline/TAAStage",
            "pos": [
                1353,
                714
            ],
            "size": {
                "0": 228.39999389648438,
                "1": 146
            },
            "flags": {},
            "order": 14,
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
                    "link": 52
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
                        53
                    ],
                    "slot_index": 0
                }
            ],
            "properties": {
                "showResult": false,
                "enable": true,
                "name": "TAA",
                "shadingScale": 1,
                "Name": "TAAStage",
                "Enable": true,
                "CameraOutputType": "Color",
                "Format": "RGBA8",
                "sampleScale": 1,
                "feedback": 0.95,
                "shaowHistoryTexture": false,
                "clampHistoryTexture": true,
                "forceRender": true,
                "dirty": false
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
                "Name": "forward",
                "Enable": true
            }
        },
        {
            "id": 16,
            "type": "pipeline/RenderToScreen",
            "pos": [
                951,
                134
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
                    "link": 56
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
                "1": 146
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
                        55
                    ],
                    "slot_index": 0
                }
            ],
            "properties": {
                "showResult": false,
                "enable": true,
                "name": "BaseStage",
                "shadingScale": 1,
                "Name": "custom.ForwardStage",
                "Enable": true,
                "CameraOutputType": "Color",
                "Format": "RGBA8",
                "material": "blit-screen",
                "outputName": "ForwardStage"
            }
        },
        {
            "id": 19,
            "type": "pipeline/ForwardPostStage",
            "pos": [
                689,
                145
            ],
            "size": {
                "0": 228.39999389648438,
                "1": 146
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
                    "link": 55
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
                        56
                    ],
                    "slot_index": 0
                }
            ],
            "properties": {
                "showResult": false,
                "enable": true,
                "name": "ForwardPostStage",
                "shadingScale": 1
            }
        },
        {
            "id": 20,
            "type": "pipeline/Pipeline",
            "pos": [
                150,
                1030
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
                        57
                    ],
                    "slot_index": 0
                }
            ],
            "properties": {
                "Name": "reflection-probe",
                "Enable": true
            }
        },
        {
            "id": 24,
            "type": "pipeline/RenderToScreen",
            "pos": [
                1243,
                1046
            ],
            "size": {
                "0": 140,
                "1": 26
            },
            "flags": {},
            "order": 12,
            "mode": 0,
            "inputs": [
                {
                    "name": "RenderTexture",
                    "type": "RenderTexture",
                    "link": 60
                }
            ],
            "properties": {}
        },
        {
            "id": 21,
            "type": "pipeline/DeferredGBufferStage",
            "pos": [
                420,
                1029
            ],
            "size": {
                "0": 228.39999389648438,
                "1": 146
            },
            "flags": {},
            "order": 4,
            "mode": 0,
            "inputs": [
                {
                    "name": "Camera Output",
                    "type": "Camera Output",
                    "link": 57
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
                        58
                    ],
                    "slot_index": 0
                }
            ],
            "properties": {
                "showResult": false,
                "enable": true,
                "name": "DeferredGBuffer-rp",
                "shadingScale": 1,
                "Name": "DeferredGBufferStage",
                "Enable": true,
                "CameraOutputType": "Color",
                "Format": "RGBA8",
                "material": "blit-screen"
            }
        },
        {
            "id": 22,
            "type": "pipeline/DeferredLightingStage",
            "pos": [
                714,
                1034
            ],
            "size": {
                "0": 228.39999389648438,
                "1": 146
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
                    "link": 58
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
                        59
                    ],
                    "slot_index": 0
                }
            ],
            "properties": {
                "showResult": false,
                "enable": true,
                "name": "DeferredLighting-rp",
                "shadingScale": 1,
                "Name": "DeferredLightingStage",
                "Enable": true,
                "CameraOutputType": "Color",
                "Format": "RGBA8",
                "material": "blit-screen"
            }
        },
        {
            "id": 23,
            "type": "pipeline/DeferredPostStage",
            "pos": [
                992,
                1039
            ],
            "size": {
                "0": 228.39999389648438,
                "1": 146
            },
            "flags": {},
            "order": 10,
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
                    "link": 59
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
                        60
                    ],
                    "slot_index": 0
                }
            ],
            "properties": {
                "showResult": false,
                "enable": true,
                "name": "DeferredPost-rp",
                "shadingScale": 1,
                "Name": "DeferredPostStage",
                "Enable": true,
                "CameraOutputType": "Color",
                "Format": "RGBA8",
                "material": "blit-screen"
            }
        },
        {
            "id": 14,
            "type": "pipeline/custom.BloomStage",
            "pos": [
                1088,
                753
            ],
            "size": {
                "0": 228.39999389648438,
                "1": 146
            },
            "flags": {},
            "order": 13,
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
                    "link": 62
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
                        52
                    ],
                    "slot_index": 0
                }
            ],
            "properties": {
                "showResult": false,
                "enable": true,
                "name": "Bloom",
                "shadingScale": 1,
                "Name": "custom.BloomStage",
                "Enable": true,
                "CameraOutputType": "Color",
                "Format": "RGBA8",
                "material": "blit-screen",
                "threshold": 0.1,
                "iterations": 2,
                "intensity": 0.8
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
                "1": 146
            },
            "flags": {},
            "order": 11,
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
                        62
                    ],
                    "slot_index": 0
                }
            ],
            "properties": {
                "showResult": false,
                "enable": true,
                "name": "DeferredLighting",
                "shadingScale": 1,
                "Name": "DeferredLightingStage",
                "Enable": true,
                "CameraOutputType": "Color",
                "Format": "RGBA8",
                "material": "blit-screen"
            }
        },
        {
            "id": 18,
            "type": "pipeline/FSRStage",
            "pos": [
                1618,
                739
            ],
            "size": {
                "0": 228.39999389648438,
                "1": 170
            },
            "flags": {},
            "order": 15,
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
                    "link": 53
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
                        64
                    ],
                    "slot_index": 0
                }
            ],
            "properties": {
                "showResult": false,
                "enable": true,
                "name": "FSR",
                "shadingScale": 1,
                "sharpness": 0.2,
                "Name": "FSRStage",
                "Enable": true,
                "CameraOutputType": "Color",
                "Format": "RGBA8"
            }
        },
        {
            "id": 12,
            "type": "pipeline/DeferredPostStage",
            "pos": [
                2260,
                762
            ],
            "size": {
                "0": 228.39999389648438,
                "1": 146
            },
            "flags": {},
            "order": 17,
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
                    "link": 65
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
                "showResult": false,
                "enable": true,
                "name": "DeferredPost",
                "shadingScale": 1,
                "Name": "DeferredPostStage",
                "Enable": true,
                "CameraOutputType": "Color",
                "Format": "RGBA8",
                "material": "blit-screen"
            }
        },
        {
            "id": 4,
            "type": "pipeline/RenderToScreen",
            "pos": [
                2534,
                770
            ],
            "size": {
                "0": 140,
                "1": 26
            },
            "flags": {},
            "order": 18,
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
            "id": 25,
            "type": "pipeline/ZoomScreenStage",
            "pos": [
                1942,
                742
            ],
            "size": {
                "0": 228.39999389648438,
                "1": 146
            },
            "flags": {},
            "order": 16,
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
                    "link": 64
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
                        65
                    ],
                    "slot_index": 0
                }
            ],
            "properties": {
                "showResult": false,
                "enable": true,
                "name": "ZoomScreenStage",
                "shadingScale": 1
            }
        },
        {
            "id": 1,
            "type": "pipeline/Pipeline",
            "pos": [
                -223,
                626
            ],
            "size": {
                "0": 210,
                "1": 82
            },
            "flags": {},
            "order": 2,
            "mode": 0,
            "outputs": [
                {
                    "name": "Camera Output",
                    "type": "Camera Output",
                    "links": [
                        66
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
            "id": 26,
            "type": "pipeline/CustomShadowStage",
            "pos": [
                103,
                641
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
                    "link": 66
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
                        67
                    ],
                    "slot_index": 0
                }
            ],
            "properties": {
                "showResult": false,
                "enable": true,
                "name": "CustomShadowStage",
                "shadingScale": 1,
                "textureFormat": 35
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
                "1": 146
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
                    "link": 67
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
                "showResult": false,
                "enable": true,
                "name": "DeferredGBuffer",
                "shadingScale": 1,
                "Name": "DeferredGBufferStage",
                "Enable": true,
                "CameraOutputType": "Color",
                "Format": "RGBA8",
                "material": "blit-screen"
            }
        }
    ],
    "links": [
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
            52,
            14,
            0,
            17,
            1,
            "RenderTexture"
        ],
        [
            53,
            17,
            0,
            18,
            1,
            "RenderTexture"
        ],
        [
            55,
            5,
            0,
            19,
            1,
            "RenderTexture"
        ],
        [
            56,
            19,
            0,
            16,
            0,
            "RenderTexture"
        ],
        [
            57,
            20,
            0,
            21,
            0,
            "Camera Output"
        ],
        [
            58,
            21,
            0,
            22,
            1,
            "RenderTexture"
        ],
        [
            59,
            22,
            0,
            23,
            1,
            "RenderTexture"
        ],
        [
            60,
            23,
            0,
            24,
            0,
            "RenderTexture"
        ],
        [
            62,
            11,
            0,
            14,
            1,
            "RenderTexture"
        ],
        [
            64,
            18,
            0,
            25,
            1,
            "RenderTexture"
        ],
        [
            65,
            25,
            0,
            12,
            1,
            "RenderTexture"
        ],
        [
            66,
            1,
            0,
            26,
            0,
            "Camera Output"
        ],
        [
            67,
            26,
            0,
            10,
            1,
            "RenderTexture"
        ]
    ],
    "groups": [],
    "config": {},
    "extra": {},
    "version": 0.4
}