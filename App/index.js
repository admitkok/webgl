import {
    BoxGeometry,
    MeshBasicMaterial,
    Mesh,
    PlaneGeometry,
    ShaderMaterial,
    BufferAttribute,
    Color,
    AnimationMixer,
    CircleGeometry,
    Clock,
    DirectionalLight,
    EquirectangularReflectionMapping,
    Group,
    PCFSoftShadowMap,
    PerspectiveCamera,
    Scene,
    ShaderLib as light,
    SphereGeometry,
    SpotLight,
    Vector2,
    WebGLRenderer,
    IcosahedronGeometry,
    Vector3, MathUtils, MeshStandardMaterial, AmbientLight, CylinderGeometry, Object3D, WebGLRenderTarget,
} from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import {gsap} from 'gsap';

import Stats from 'stats.js';
import resources from './Resources';
import Composer from './Postprocessing';
import Tiles from './Tiles';
import Tiles1 from './Tiles1';
import HolographicMaterial from "../HolographicMaterialVanilla.js";

import vertex from './shaders/index.vert';
import fragment from './shaders/index.frag';
import {World, Sphere, Body, Vec3, Plane, Box } from "cannon-es";
import {random} from "gsap/gsap-core";
import {element} from "three/nodes";
import {PI} from "three/examples/jsm/nodes/math/MathNode.js";


export default class App {
    constructor() {
        this._version = 'light';
        this._parent = new Group();
        this._init();
    }

    async _init() {
        // RENDERER
        this._gl = new WebGLRenderer({
            canvas: document.querySelector('#canvas'),
        });

        this._gl.setSize(window.innerWidth, window.innerHeight);
        this._gl.shadowMap.enabled = true;

        // CAMERA
        const aspect = window.innerWidth / window.innerHeight;
        this._camera = new PerspectiveCamera(80, aspect, 1, 1000);
        this._camera.position.x = 1;
        this._camera.position.y = 2;
        this._camera.position.z = 5;
        this._camera.lookAt(9, 1, -10);

        // SCENE
        this._scene = new Scene();
        this._scene.background = new Color(0x000000);

        this._world = new World();
        this._world.gravity.set(0, -10, 0);  // No gravity in any direction

        // CLOCK
        this._clock = new Clock();


        const elements = [];
        this.icos = [];

        // INIT PLANE
        elements.push(this._initPlane());
        elements.push(this._initPlane1());
        elements.push(this._initPlane2());
        // elements.push(this._initPlane3());
        // elements.push(this._initPlane4());

        const renderTarget = new WebGLRenderTarget(window.innerWidth, window.innerHeight);


        // INIT PLANE
        // this._initAttribute();

        // ICOSAEDRON

        for (let i = 0; i < 100; i++) {
            const el = this._initIcosahedron();
            elements.push(el)
        }

        this._elements = elements


        // COMPOSER
        this._initComposer();

        // MOUSE
        this._mouse = new Vector2();

        // CONTROLS
        // const controls = new OrbitControls(this._camera, this._gl.domElement);

        // STATS
        this._stats = new Stats();
        document.body.appendChild(this._stats.dom);

        await resources.load();

        // INIT SCENE
        this._initScene();
        // INIT LIGHTS
        this._initLights();

        this._animate();

        this._initEvents();

    }


    _initPlane() {
        const g = new PlaneGeometry(50, 50, 10, 10);
        const m = new MeshStandardMaterial( { color: 0x000000, wireframe: true } );
        const mesh = new Mesh(g, m);

        this._scene.add(mesh);

        const shape = new Plane();
        const plane = new Body({mass: 0});
        plane.addShape(shape);
        plane.quaternion.setFromEuler(-Math.PI / 2, 0, 0)
        this._world.addBody(plane);
        mesh.userData.body = plane
        this._test = mesh

        this._test.rotation.x = -Math.PI / 2;
        this._test.position.y = -1;

        return mesh;


    }

    _initPlane1() {
        const g = new PlaneGeometry(50, 50, 1, 1);
        const m = new MeshStandardMaterial( { color: 0x000000 } );
        const mesh = new Mesh(g, m);

        this._scene.add(mesh);

        const shape = new Plane();
        const plane = new Body({mass: 0});
        plane.addShape(shape);
        // plane.quaternion.setFromEuler(-Math.PI / 2, 0, 0)
        plane.position.y = 5;
        plane.position.z = -20;
        this._world.addBody(plane);

        mesh.userData.body = plane
        this._test1 = mesh

        this._test1.position.z = -20;
        this._test1.position.y = 5;
        this._test1.rotation.y = -Math.PI;

        return mesh;


    }

    _initPlane2() {
        const g = new PlaneGeometry(50, 50, 1, 1);
        const m = new MeshStandardMaterial( { color: 0x000000} );
        const mesh = new Mesh(g, m);

        this._scene.add(mesh);

        const shape = new Plane();
        const plane = new Body({mass: 0});
        plane.addShape(shape);
        plane.quaternion.setFromEuler(0, -Math.PI / 2, 0)
        plane.position.y = 5;
        plane.position.x = 20;
        // plane.rotation.y = -Math.PI / 2;
        this._world.addBody(plane);

        mesh.userData.body = plane
        this._test1 = mesh

        this._test1.position.x = 20;
        this._test1.position.y = 5;
        this._test1.rotation.y = Math.PI / 2;


        return mesh;


    }

    _initPlane3() {
        const g = new PlaneGeometry(50, 50, 1, 1);
        const m = new MeshStandardMaterial( { color: 0x000000 } );
        const mesh = new Mesh(g, m);

        this._scene.add(mesh);

        const shape = new Plane();
        const plane = new Body({mass: 0});
        plane.addShape(shape);
        plane.quaternion.setFromEuler(0, Math.PI / 2, 0)
        plane.position.y = 5;
        plane.position.x = -10;
        this._world.addBody(plane);

        mesh.userData.body = plane
        this._test1 = mesh

        this._test1.position.x = -10;
        this._test1.position.y = 5;
        this._test1.rotation.y = -Math.PI / 2;


        return mesh;


    }

    _initPlane4() {
        const g = new PlaneGeometry(50, 50, 1, 1);
        const m = new MeshStandardMaterial( { color: 0x000fff} );
        const mesh = new Mesh(g, m);

        this._scene.add(mesh);

        const shape = new Plane();
        const plane = new Body({mass: 0});
        plane.addShape(shape);
        plane.quaternion.setFromEuler( 0 , 0, 0)
        plane.position.z = 20;
        this._world.addBody(plane);

        mesh.userData.body = plane
        this._test2 = mesh

        this._test2.position.z = 20;


        return mesh;

    }


    _initComposer() {
        this._composer = new Composer({
            gl: this._gl,
            scene: this._scene,
            camera: this._camera,
        });
    }

    _initScene() {
        // bind mesh body

        // const axesHelper = new AxesHelper( 5 );
        // this._scene.add( axesHelper );
        this._scene.background = new Color('#0A0A0A');
        const envmap = resources.get('envmap');
        envmap.mapping = EquirectangularReflectionMapping;
        this._scene.environment = envmap;

        // Deadpool
        const dp = resources.get('dp');
        // dp.castShadow = true;
        this._parent.add(dp.scene);
        dp.scene.scale.set(2, 2, 2);
        dp.scene.rotation.y = -Math.PI / 2;
        const hologramMaterial = new HolographicMaterial();


        dp.scene.traverse(el => {
            if(el.isMesh){
                el.castShadow = true;
                el.receiveShadow = true;
                el.material = hologramMaterial;
            }
        })

        const tiles = new Tiles();
        this._tiles = tiles;
        const tiles1 = new Tiles1();
        this._tiles1 = tiles1;
        this._scene.add(tiles);
        this._scene.add(tiles1);
        this._tiles.rotation.y = -Math.PI;


        this.mixer = new AnimationMixer( dp.scene );
        const clips = dp.animations;
        const action = this.mixer.clipAction( clips[0] );
        action.play();
        this._scene.add(this._parent);

        const circleGeometry = new CircleGeometry( 3, 90);
        const circleMaterial = new MeshStandardMaterial( { color: 0x119900 , wireframe: true } )
        const planeGeometry = new SphereGeometry( 0.1, 30 );
        const plane = new Mesh( planeGeometry, hologramMaterial );
        const circle = new Mesh( circleGeometry, circleMaterial );
        const cilinder = new CylinderGeometry( 0.07, 0.05, 0.1, 3 );
        const cylinderMesh = new Mesh( cilinder, hologramMaterial );
        plane.position.y = 0.1;
        plane.position.z = 1;
        plane.rotation.x = -Math.PI / 2;
        circle.rotation.x = -Math.PI / 2;
       cylinderMesh.position.z = 1;
        this._scene.add( circle );
        this._parent.add( circle );
        this._scene.add( plane );
        this._parent.add(plane);
        this._scene.add(cylinderMesh);
        this._parent.add(cylinderMesh);

        this._scene.add(this._parent);


    }

    _initIcosahedron() {
        const g = new IcosahedronGeometry(0.1, 40);
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


        const shape = new Sphere(0.1);
        const body = new Body({
            mass: MathUtils.randFloat(0.1, 1),
            type: Body.DYNAMIC,
            position: new Vec3(
                MathUtils.randFloat(-50, -20),
                MathUtils.randFloat(2, 5),
                MathUtils.randFloat(50, 18),
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

    onDrag(e, delta) {
        this._tiles.onDrag(e, delta);
        this._tiles1.onDrag(e, -delta);
    }

    _initLights() {
        // // AMBIENT
        const al = new AmbientLight(0xfefefe);
        al.intensity = 50;
        this._al = al;
        this._scene.add(al);
        // this._scene.add(al);

        // SPORTLIGHT
        const sl = new SpotLight();
        sl.intensity = 5;
        sl.position.set(3, 9, 3);
        this._sl = sl;
        //const slh = new SpotLightHelper(sl)
        this._scene.add(sl);

        this._gl.shadowMap.enabled = true;
        this._gl.shadowMap.type = PCFSoftShadowMap; // default THREE.PCFShadowMap

//Create a DirectionalLight and turn on shadows for the light
        const light = new DirectionalLight( 0xcccccc, 10 );
        light.position.set( 0, 10, 0 ); //default; light shining from top
        light.castShadow = true; // default false
        this._scene.add( light );

//Set up shadow properties for the light
        light.shadow.mapSize.width = 512; // default
        light.shadow.mapSize.height = 512; // default
        light.shadow.camera.near = 0.5; // default
        light.shadow.camera.far = 500; // default

    }

    changeVersion() {
        this._version = this._version === 'light' ? 'dark' : 'light';
        //this._scene.background = new Color(CONFIG[this._version].background)

        const config = CONFIG[this._version];

        // BACKGROUND
        const color = new Color(config.background);
        gsap.to(this._scene.background, { r: color.r, b: color.b, g: color.g });

        // LIGHTS
        gsap.to(this._al, { intensity: config.ambientLightIntensity });
        gsap.to(this._sl, { intensity: config.spotLightIntensity });

        // ENVMAP
        this._scene.traverse((el) => {
            if (el.isMesh && el.material.envMapIntensity) {
                const { material } = el;
                gsap.to(material, { envMapIntensity: config.envMapIntensity });
            }
        });
    }

    _onMouseMove(e) {
        this._elements.forEach(el => {
            const x = (e.clientX / window.innerWidth) * 2 - 1;
            const y = -(e.clientY / window.innerHeight) * 2 + 1;
            const force = new Vec3(x * 20,0, -20*y)
            el.userData.body.applyForce(force, new Vec3(0, 0, 0))
        })
    }

    // onMouseMove(e) {
    //     this._mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
    //     this._mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
    //
    //     this._composer.updateChromaticIntensity(this._mouse.x, this._mouse.y);
    //     this._composer.updatePixelationSize(this._mouse.x, this._mouse.y);
    // }

    _resize() {
        this._gl.setSize(window.innerWidth, window.innerHeight);

        let fov = Math.atan(window.innerHeight / 2 / this._camera.position.z) * 2;
        fov = MathUtils.radToDeg(fov);
        this._camera.fov = fov;

        const aspect = window.innerWidth / window.innerHeight;
        this._camera.aspect = aspect;
        this._camera.updateProjectionMatrix();
    }



    _animate() {
        this._stats.begin();
        this._clock.delta = this._clock.getDelta();
        this._world.step( this._clock.delta  );


        //this._test.position.copy(this._test.userData.body.position)
        // this._elements[1].rotation.x += this._clock.elapsedTime * 0.001;

        this._elements.forEach(el => {
            el.position.copy(el.userData.body.position)
            const centerForce = new Vec3(-10 * el.position.x, -1 * el.position.y, -10 * el.position.z)
            if(el.position.x < -20 || el.position.z > 20) {
                el.userData.body.applyForce(centerForce)
            }
        })



        this._tiles.update();
        this._tiles1.update();


        // hologramMaterial.update(); // Update the holographic material time uniform

        if (this._clock.elapsedTime < 1.4) {
            this._tiles.rotation.y +=  0.05 - this._clock.elapsedTime / 30;
            this._tiles1.rotation.y -= 0.05 - this._clock.elapsedTime / 20;
        }
        else{
            this._tiles.rotation.y += this._clock.delta * 0.25;
            this._tiles1.rotation.y -= this._clock.delta * 0.35;
        }


        // this._parent.position.y = Math.cos(this._clock.elapsedTime) * 0.1;
        // if (this._clock.elapsedTime < 40) {
        if (this.mixer) {
            this.mixer.update(this._clock.delta / 2);
        }
        // }

        // SPHERE
        /*this._mesh.material.uniforms.uIntensity.value = Math.tan(
          this._clock.elapsedTime
        );

        this._mesh.material.uniforms.uTime.value = this._clock.elapsedTime;
        */
        // ICO
        this.icos.forEach(el => {
           el.material.uniforms.uTime.value = this._clock.elapsedTime;

        })

        if (this._clock.elapsedTime < 40) {
            if (this._clock.elapsedTime % 31 > 17) {
                this._parent.children[2].position.x += this._clock.elapsedTime * 0.01;
                this._parent.children[2].position.y += this._clock.elapsedTime * 0.001;
            }
        }
        else {
            if (this._clock.elapsedTime % 31 > 17) {
                this._parent.children[2].position.x += this._clock.elapsedTime * 0.01;
                this._parent.children[2].position.y += this._clock.elapsedTime * 0.001;
            }
        }



        if (this._clock.elapsedTime % 31 < 0.5 ) {
            this._parent.children[2].position.x = 0;
            this._parent.children[2].position.y = 0.1;
        }


        this._gl.render(this._scene, this._camera);
        // this._composer.render();




        this._stats.end();
        window.requestAnimationFrame(this._animate.bind(this));
    }

}
