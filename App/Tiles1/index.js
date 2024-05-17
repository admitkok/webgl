import {
    PlaneGeometry,
    MeshBasicMaterial,
    Mesh,
    Group,
    MathUtils,
    Vector3,
    SRGBColorSpace,
    ShaderMaterial,
    RepeatWrapping, NormalBlending, DoubleSide,
} from 'three';
import resources from '../Resources';
import { damp } from 'maath/easing';

import vertex from './shaders/index.vert';
import fragment from './shaders/index.frag';
import Composer from "../Postprocessing/index.js";

export default class Tiles1 extends Group {
    constructor() {
        super();

        this._isDragging = false;
        this._width = 100;
        this._dragSpeed = {
            prev: 0,
            current: 0,
        };
        this._els = [];

        this._init();

    }

    _init() {

        const geometry = new PlaneGeometry(5, 5, 50, 50);
        for (let i = 0; i < 4; i++) {
            // LOAD MAP
            const map = resources.get(`t-${i}`);
            map.colorSpace = SRGBColorSpace;
            map.wrapT = map.wrapS = RepeatWrapping;

            // GET THE RATIO OF THE ASSETS
            const ratio = map.image.naturalWidth / map.image.naturalHeight;

            // MATERIAL
            let material = new ShaderMaterial({
                vertexShader: vertex,
                fragmentShader: fragment,
                uniforms: {
                    uMap: { value: map },
                    uBendFactor: { value: 0 },
                    uTime: { value: 0 },
                    uScanlineColor: { value: new Vector3(20, 200, 20) },
                }
            });

            // material = new MeshBasicMaterial({ map });
            const mesh = new Mesh(geometry, material);

            // SCALE
            const meshWidth = this._width ;
            const meshHeight = this._width / ratio;
            mesh.scale.set(meshWidth, meshHeight, 1);

            // X, Y, Z
            mesh.position.x =  9 * this._width * Math.cos(2 * i * Math.PI / 4);
            mesh.position.y = 200;
            mesh.position.z =  9 * this._width * Math.sin(2 * i * Math.PI / 4);
            mesh.userData.destinationPosition = mesh.position.clone();
            mesh.userData.initialPosition = mesh.position.clone();

            mesh.rotation.y = -Math.PI / 2 - 2 * i * Math.PI / 4;

            mesh.userData.dragPosition = mesh.position.clone();
            mesh.userData.dragPosition.z += MathUtils.randFloat(-30, -70);

            this.add(mesh);
            this._els.push(mesh);

        }
    }

    onDrag(e, delta) {
        this._isDragging = e.dragging;
        this.rotation.y += delta/500;
        this._els.forEach((el) => {
            el.userData.destinationPosition.x += delta/300;
        });
    }

    update(delta) {

        // CALC SPEED ON X
        this._dragSpeed.current = this._els[0].position.x;
        const speedX = this._dragSpeed.current - this._dragSpeed.prev;

        // UPDATE MESHES
        this._els.forEach((el) => {
            //UPDATE UNIFORMS
            el.material.uniforms.uBendFactor.value = speedX * 1000000;

            // X
            damp(el.position, 'x', el.userData.destinationPosition.x, 0.29);

            // Z
            const zTarget = this._isDragging
                ? el.userData.dragPosition.z
                : el.userData.initialPosition.z;

            damp(el.position, 'z', zTarget, 0.28);
        });

        this._dragSpeed.prev = this._dragSpeed.current;
    }
}
