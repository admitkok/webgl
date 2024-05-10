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
    Vector3, MathUtils,
} from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import Stats from 'stats.js';

import vertex from './shaders/index.vert';
import fragment from './shaders/index.frag';
import {World, Sphere, Body, Vec3 } from "cannon-es";
import {random} from "gsap/gsap-core";

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
        this._camera.position.z = 30;

        // SCENE
        this._scene = new Scene();

        this._world = new World();
        this._world.gravity.set(0, -1, 0);  // No gravity in any direction


        // CLOCK
        this._clock = new Clock();

        // INIT PLANE
        // this._initPlane();

        // INIT PLANE
        // this._initAttribute();

        // ICOSAEDRON
        const elements = []
        for (let i = 0; i < 15; i++) {
            const el = this._initIcosahedron();
            elements.push(el)
        }

        this._elements = elements


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
        // const g = new PlaneGeometry(1, 1, 30, 30);
        const g = new SphereGeometry(0.5, 300, 300);

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

        const shape = new Sphere(1);
        const body = new Body({
            mass: 1,
            position: new Vec3(0, 0, 0),
            shape: shape
        });
        this._world.addBody(body);
    }

    _initIcosahedron() {
        const g = new IcosahedronGeometry(0.5, 40);
        const m = new ShaderMaterial({
            vertexShader: vertex,
            fragmentShader: fragment,
            uniforms: {
                uTime: { value: 0 },
                uColorA: { value: new Color(0x00ffee) },
                uColorB: { value: new Color(0xff52ff) },
                uMouse: { value: new Vector3(0, 0, 0) },
            },
        });

        const mesh = new Mesh(g, m);
        this._ico = mesh;
        this._scene.add(mesh);


        const shape = new Sphere(1);
        const body = new Body({
            mass: 10,
            position: new Vec3(
                MathUtils.randFloat(-30, 30),
                MathUtils.randFloat(-30, 30),
                MathUtils.randFloat(-30, 30),
            ),
            shape: shape
        });
        this._world.addBody(body);

        // bind mesh body
        mesh.userData.body = body
        this._test = mesh

        return mesh
    }

    _initEvents() {
        window.addEventListener('resize', this._resize.bind(this));
        window.addEventListener('mousemove', this._onMouseMove.bind(this));
    }

    _onMouseMove(e) {
        const x = (e.clientX / window.innerWidth) * 2 - 1;
        this._ico.material.uniforms.uMouse.value.x = x;
        const y = -(e.clientY / window.innerHeight) * 2 + 1;
        this._ico.material.uniforms.uMouse.value.y = y;
        this._world.gravity.x = x * 1;
        this._world.gravity.y = y * 1;
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
        this._world.step( this._clock.delta );

        console.log(this._test.userData.body)
        //this._test.position.copy(this._test.userData.body.position)
        if(this._clock.elapsedTime > 2){
            this._elements.forEach(el => {
                el.position.copy(el.userData.body.position)
            })
        }

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
