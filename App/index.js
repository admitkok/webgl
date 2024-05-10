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
    Vector3, MathUtils, MeshStandardMaterial, AmbientLight,
} from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import Stats from 'stats.js';

import vertex from './shaders/index.vert';
import fragment from './shaders/index.frag';
import {World, Sphere, Body, Vec3, Plane } from "cannon-es";
import {random} from "gsap/gsap-core";
import {element} from "three/nodes";

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
        this._camera.position.z = 10;

        // SCENE
        this._scene = new Scene();

        this._world = new World();
        this._world.gravity.set(0, -100, 0);  // No gravity in any direction


        // CLOCK
        this._clock = new Clock();

        const elements = []
        this.icos = []

        // INIT PLANE
        elements.push(this._initPlane());


        // INIT PLANE
        // this._initAttribute();

        this._initLights()

        // ICOSAEDRON

        for (let i = 0; i < 20; i++) {
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
        const g = new PlaneGeometry(20, 20);
        const m = new MeshStandardMaterial();
        const mesh = new Mesh(g, m);

        this._scene.add(mesh);

        const shape = new Plane();
        const plane = new Body({mass: 0});
        plane.addShape(shape);
        plane.quaternion.setFromEuler(-Math.PI / 2, 0, 0)
        this._world.addBody(plane);

        // bind mesh body
        mesh.userData.body = plane
        this._test = mesh

        this._test.rotation.x = -Math.PI / 2;
        this._test.position.y = -1;

        return mesh


    }

    _initIcosahedron() {
        const g = new IcosahedronGeometry(0.3, 40);
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
        this.icos.push(this._ico)
        this._scene.add(mesh);


        const shape = new Sphere(0.3);
        const body = new Body({
            mass: 0.1,
            type: Body.DYNAMIC,
            position: new Vec3(
                MathUtils.randFloat(-7, 7),
                1,
                MathUtils.randFloat(-7, 7),
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

    _initLights() {
        // // AMBIENT
        const al = new AmbientLight(0xfefefe);
        al.intensity = 50;
        this._al = al;
        this._scene.add(al);
    }

    _onMouseMove(e) {
        this._elements.forEach(el => {
            const x = (e.clientX / window.innerWidth) * 2 - 1;
            const y = -(e.clientY / window.innerHeight) * 2 + 1;
            const force = new Vec3(x * 20,0, -20*y)
            el.userData.body.applyForce(force, new Vec3(0, 0.2, 0))
        })
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


        //this._test.position.copy(this._test.userData.body.position)

        this._elements.forEach(el => {
            el.position.copy(el.userData.body.position)
            const centerForce = new Vec3(-1*el.position.x ,0, -1*el.position.z)
            el.userData.body.applyForce(centerForce)
        })




        // SPHERE
        /*this._mesh.material.uniforms.uIntensity.value = Math.tan(
          this._clock.elapsedTime
        );

        this._mesh.material.uniforms.uTime.value = this._clock.elapsedTime;
        */
        console.log(this.icos)
        // ICO
        this.icos.forEach(el => {
           el.material.uniforms.uTime.value = this._clock.elapsedTime;

        })



        this._gl.render(this._scene, this._camera);
        this._stats.end();
        window.requestAnimationFrame(this._animate.bind(this));
    }
}
