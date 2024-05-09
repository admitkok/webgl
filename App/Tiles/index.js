import {
    PlaneGeometry,
    MeshBasicMaterial,
    Mesh,
    Group,
    MathUtils,
    Vector3,
    Texture,
    ImageUtils, TextureLoader,
} from 'three';
import { damp } from 'maath/easing';

export default class Tiles extends Group {
    constructor() {
        super();

        this._isDragging = false;
        this._width = 17;
        this._els = [];

        this._init();
    }

    _init() {
        const geometry = new PlaneGeometry(1, 1);
        let material = new MeshBasicMaterial();
        for (let i = 0; i < 10; i++) {
            if(i % 4 === 0) {
                material = new MeshBasicMaterial({map: new TextureLoader().load('/Collin icon.png')});
            }
            if(i % 4 === 1) {
               material = new MeshBasicMaterial({map: new TextureLoader().load('/tiger icon.png')});
            }
            if(i % 4 === 2) {
                material = new MeshBasicMaterial({map: new TextureLoader().load('/Rory icon.png')});
            }
            if (i % 4 === 3) {
                material = new MeshBasicMaterial({map: new TextureLoader().load('/Mentor icon.png')});
            }
            const mesh = new Mesh(geometry, material);
            mesh.scale.set(this._width, this._width, 1);

            // X, Y, Z
            mesh.position.x =  1.4 * this._width * Math.cos(2 * i * Math.PI / 10);
            mesh.position.y = 10;
            mesh.position.z =  1.4 * this._width * Math.sin(2 * i * Math.PI / 10);

            mesh.material.color.set(0xeeeeee);

            mesh.rotation.y = -Math.PI / 2 - 2 * i * Math.PI / 10;
            mesh.userData.destinationPosition = mesh.position.clone();
            mesh.userData.initialPosition = mesh.position.clone();
            // mesh.userData.initialRotation = mesh.rotation.clone();
            // mesh.userData.destinationRotation = mesh.rotation.clone();

            mesh.userData.dragPosition = mesh.position.clone();
            // mesh.userData.dragRotation = mesh.rotation.clone();
            // mesh.userData.dragPosition.z += MathUtils.randFloat(-10, -30);
            // mesh.userData.dragPosition.x -= MathUtils.randFloat(-1, -3);
            // mesh.userData.dragPosition.z -= 15;
            // mesh.userData.dragPosition.x -= 15;
            // mesh.userData.dragRotation.y += Math.PI / 2;

            this.add(mesh);
            this._els.push(mesh);
        }
    }

    onDrag(e, delta) {
        this._isDragging = e.dragging;
        this.rotation.y += delta/ 500;

        // this._els.forEach((el) => {
        //     el.userData.destinationRotation.y += delta / 10;
        // });
    }

    update(delta) {
        this._els.forEach((el) => {
            // X
            damp(el.position, 'x', el.userData.destinationPosition.x, 0.15, delta);

            // Z
            const zTarget = this._isDragging
                ? el.userData.dragPosition.z
                : el.userData.initialPosition.z;

            damp(el.position, 'z', zTarget, 0.15, delta);
        });
    }
}
