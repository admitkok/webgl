import {
    PerspectiveCamera,
    WebGLRenderer,
    Scene,
    BoxGeometry,
    MeshBasicMaterial,
    Mesh,
    PlaneGeometry,
    ShaderMaterial,
    BufferAttribute,
    Color,
    Clock,
    SphereGeometry,
    IcosahedronGeometry,
    Vector3,
} from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import Stats from 'stats.js';

import vertex from './shaders/index.vert';
import fragment from './shaders/index.frag';

export default class App {
    constructor() {
        this._init();
    }

    _init() {
        // RENDERER
        this._gl = new WebGLRenderer({
            canvas: document.querySelector('#canvas'),
        });

        this._gl.setSize(window.innerWidth, window.innerHeight);

        // CAMERA
        const aspect = window.innerWidth / window.innerHeight;
        this._camera = new PerspectiveCamera(60, aspect, 0.1, 50);
        this._camera.position.z = 5;

        // SCENE
        this._scene = new Scene();

        // CLOCK
        this._clock = new Clock();

        // INIT PLANE
        //this._initPlane();

        // INIT PLANE
        //this._initAttribute();

        // ICOSAEDRON
        this._initIcosahedron();

        // CONTROLS
        const controls = new OrbitControls(this._camera, this._gl.domElement);

        // STATS
        this._stats = new Stats();
        document.body.appendChild(this._stats.dom);

        this._animate();

        this._initEvents();
    }

    _initPlane() {
        const g = new PlaneGeometry(1, 1);
        const m = new ShaderMaterial({
            vertexShader: vertex,
            fragmentShader: fragment,
        });
        const mesh = new Mesh(g, m);
        this._scene.add(mesh);
    }

    _initAttribute() {
        //const g = new PlaneGeometry(1, 1, 30, 30);
        const g = new SphereGeometry(1, 300, 300);

        const randomArray = [];
        const amount = g.attributes.position.count;
        console.log(amount);

        // RANDOM ATTRIBUTE
        for (let i = 0; i < amount; i++) {
            randomArray.push(Math.random());
        }

        const bufferAttribute = new BufferAttribute(
            new Float32Array(randomArray),
            1
        );
        g.setAttribute('aRandom', bufferAttribute);

        // COLOR ATTRIBUTE
        const colorArray = [];
        for (let i = 0; i < amount; i++) {
            const r = Math.random();
            const g = Math.random();
            const b = Math.random();

            colorArray.push(r, g, b);
        }

        const colorAttribute = new BufferAttribute(new Float32Array(colorArray), 3);
        g.setAttribute('aColor', colorAttribute);

        const m = new ShaderMaterial({
            vertexShader: vertex,
            fragmentShader: fragment,
            uniforms: {
                uColor1: { value: new Color(0x5afffe) },
                uColor2: { value: new Color(0xe10d31) },
                uIntensity: { value: 0.8 },
                uTime: { value: 0 },
            },
        });

        const mesh = new Mesh(g, m);
        this._mesh = mesh;

        this._scene.add(mesh);
    }

    _initIcosahedron() {
        const g = new IcosahedronGeometry(1, 40);
        //const g = new PlaneGeometry(3,3, 400, 400)
        const m = new ShaderMaterial({
            vertexShader: vertex,
            fragmentShader: fragment,
            uniforms: {
                uTime: { value: 0 },
                uColorA: { value: new Color(0x00ffee) },
                uColorB: { value: new Color(0xff52ff) },
                uMouse: { value: new Vector3(0, 0, 1) },
            },
        });

        const mesh = new Mesh(g, m);
        this._ico = mesh;
        this._scene.add(mesh);
    }

    _initEvents() {
        window.addEventListener('resize', this._resize.bind(this));
        window.addEventListener('mousemove', this._onMouseMove.bind(this));
    }

    _onMouseMove(e) {
        const x = (e.clientX / window.innerWidth) * 2 - 1;
        this._ico.material.uniforms.uMouse.value.x = x;
    }

    _resize() {
        this._gl.setSize(window.innerWidth, window.innerHeight);

        const aspect = window.innerWidth / window.innerHeight;
        this._camera.aspect = aspect;
        this._camera.updateProjectionMatrix();
    }

    _animate() {
        this._stats.begin();
        this._clock.delta = this._clock.getDelta();

        // SPHERE
        /*this._mesh.material.uniforms.uIntensity.value = Math.tan(
          this._clock.elapsedTime
        );

        this._mesh.material.uniforms.uTime.value = this._clock.elapsedTime;
        */

        // ICO
        this._ico.material.uniforms.uTime.value = this._clock.elapsedTime;

        this._gl.render(this._scene, this._camera);
        this._stats.end();
        window.requestAnimationFrame(this._animate.bind(this));
    }
}
