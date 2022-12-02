import { math, Mesh, primitives, utils, Vec3 } from "cc";

export class GGraphics {



}

export class GMesh {

    /**
     * static Create
     */
    public static Create(): Mesh {
        let size = 1;
        let vers = [
            0, 0, 0,
            size, 0, 0,
            size, 0, size,
            0, 0, size
        ]
        let triangles: number[] = [0, 2, 1, 0, 3, 2];
        let uvs: number[] = [
            0,0,
            size,0,
            size,size,
            0, size
        ];
        let geometry: primitives.IGeometry = {
            positions: vers,
            indices: triangles,
            uvs: uvs
        };
        let mesh = utils.createMesh(geometry);
        return mesh;
        
    }

}

export class GImage {
    
}


export class MeshBase {
    vers = [];
    triangles = [];
    uvs = [];
    colors = [];
    trianglesIndex = 0;
}