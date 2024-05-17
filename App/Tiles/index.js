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

export default class Tiles extends Group {
    constructor() {
        super();

        this._isDragging = false;
        this._width = 50;
        this._dragSpeed = {
            prev: 0,
            current: 0,
        };
        this._els = [];

        this._init();

    }

    _init() {

        const geometry = new PlaneGeometry(0.15, 0.15, 1, 1);
        for (let i = 4; i < 10; i++) {
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
                },
                side: DoubleSide,
                blending: NormalBlending,
                transparent: true,
                depthTest: true,
                depthWrite: false,

            });

            // material = new MeshBasicMaterial({ map });
            const mesh = new Mesh(geometry, material);

            // SCALE
            const meshWidth = this._width ;
            const meshHeight = this._width / ratio;
            if (i > 4) {
                const meshHeight = this._width * 0.8;
            }
            mesh.scale.set(meshWidth, meshHeight, 1);

            // X, Y, Z
            // mesh.position.x = this._width * i * 1.4 + MathUtils.randFloat(60, 80);
            // mesh.position.y = MathUtils.randFloat(-30, 30);
            // mesh.position.z = MathUtils.randFloat(-20, 20);
            mesh.position.x =  0.3 * this._width * Math.cos(2 * i * Math.PI / 6);
            mesh.position.y = 7;
            mesh.position.z =  0.3 * this._width * Math.sin(2 * i * Math.PI / 6);
            mesh.userData.destinationPosition = mesh.position.clone();
            mesh.userData.initialPosition = mesh.position.clone();

            mesh.rotation.y = -Math.PI / 2 - 2 * i * Math.PI / 6;

            mesh.userData.dragPosition = mesh.position.clone();
            mesh.userData.dragPosition.z += MathUtils.randFloat(0, 1);

            this.add(mesh);
            this._els.push(mesh);
        }
    }

    onDrag(e, delta) {
        this._isDragging = e.dragging;
        this.rotation.y += delta/500;
        this._els.forEach((el) => {
            el.userData.destinationPosition.x += delta/200;
        });
    }

    update(delta) {
        // CALC SPEED ON X
        this._dragSpeed.current = this._els[0].position.x;
        const speedX = this._dragSpeed.current - this._dragSpeed.prev;

        // UPDATE MESHES
        this._els.forEach((el) => {
            //UPDATE UNIFORMS
            el.material.uniforms.uBendFactor.value = speedX * 100;

            // X
            damp(el.position, 'x', el.userData.destinationPosition.x, 0.15);

            // Z
            const zTarget = this._isDragging
                ? el.userData.dragPosition.z
                : el.userData.initialPosition.z;

            damp(el.position, 'z', zTarget, 0.05);
        });

        this._dragSpeed.prev = this._dragSpeed.current;
    }
}
