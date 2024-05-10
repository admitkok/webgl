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
    AmbientLight,
    AnimationMixer,
    CircleGeometry,
    Clock,
    Color,
    DirectionalLight,
    EquirectangularReflectionMapping,
    Group,
    MathUtils,
    Mesh,
    MeshStandardMaterial,
    PCFSoftShadowMap,
    PerspectiveCamera,
    Scene,
    ShaderLib as light,
    SphereGeometry,
    SpotLight,
    Vector2,
    WebGLRenderer,
    SphereGeometry,
    IcosahedronGeometry,
    Vector3, MathUtils, MeshStandardMaterial, AmbientLight,
} from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import {gsap} from 'gsap';

import Stats from 'stats.js';
import resources from './Resources';
import Composer from './Postprocessing';
import Tiles from './Tiles';
import HolographicMaterial from "../HolographicMaterialVanilla.js";

import vertex from './shaders/index.vert';
import fragment from './shaders/index.frag';
import {World, Sphere, Body, Vec3, Plane } from "cannon-es";
import {random} from "gsap/gsap-core";
import {element} from "three/nodes";

export default class App {
    constructor() {
        this._version = 'light';
        this._parent = new Group();
        this._tiles = new Tiles();

        this._init();
    }

    _init() {
        // RENDERER
        this._gl = new WebGLRenderer({
            canvas: document.querySelector('#canvas'),
        });

        this._gl.setSize(window.innerWidth, window.innerHeight);
        this._gl.shadowMap.enabled = true;

        // CAMERA
        const aspect = window.innerWidth / window.innerHeight;
        this._camera = new PerspectiveCamera(60, aspect, 1, 1000);
        this._camera.position.x = 1;
        this._camera.position.y = 2;
        this._camera.position.z = 5;
        this._camera.lookAt(4, 2, -6);
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


        // COMPOSER
        this._initComposer();

        // MOUSE
        this._mouse = new Vector2();

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
        // INIT LIGHTS
        this._initLights();


    }

    _initComposer() {
        this._composer = new Composer({
            gl: this._gl,
            scene: this._scene,
            camera: this._camera,
        });
    }

        // bind mesh body
        mesh.userData.body = plane
        this._test = mesh

        this._test.rotation.x = -Math.PI / 2;
        this._test.position.y = -1;
        // const axesHelper = new AxesHelper( 5 );
        // this._scene.add( axesHelper );

        // Deadpool
        const dp = resources.get('dp');
        dp.castShadow = true;
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
        this._scene.add(tiles);
        this._parent.add(tiles.scene);


        // const forest = resources.get('forest');
        // forest.castShadow = true;
        // this._parent.add(forest.scene);
        // forest.scene.scale.set(2, 2, 2);
        // // forest.scene.rotation.y = -Math.PI / 2;
        // forest.scene.position.x = -4.75;
        // forest.scene.position.y = -1.7;
        // forest.scene.position.z = 5;
        // console.log(forest.scene);
        // forest.scene.traverse(el => {
        //     if(el.isMesh){
        //         el.castShadow = true;
        //         el.receiveShadow = true;
        //         console.log(el);
        //     }
        // })



        return mesh
        this.mixer = new AnimationMixer( dp.scene );
        const clips = dp.animations;


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
        const circleGeometry = new CircleGeometry( 3, 30 );
        const planeMaterial = new MeshStandardMaterial( { color: 0x5599ff, wireframe: true } )
        const circleMaterial = new MeshStandardMaterial( { color: 0x119900 , wireframe: true } )
        const planeGeometry = new CircleGeometry( 20, 20 );
        const plane = new Mesh( planeGeometry, planeMaterial );
        const circle = new Mesh( circleGeometry, circleMaterial );
        plane.position.y = -0.1;
        plane.rotation.x = -Math.PI / 2;
        circle.rotation.x = -Math.PI / 2;
        plane.receiveShadow = true;
        this._scene.add( circle );
        this._scene.add( plane );
        this._parent.add(plane);
        // const helper = new PlaneHelper( plane, 1, 0xff0000 );
        // this._scene.add(helper);
        const sphereMaterial = hologramMaterial
        const sphereGeometry = new SphereGeometry( 0.07, 20 );
        const sphere = new Mesh( sphereGeometry, sphereMaterial );
        this._scene.add(sphere);
        sphere.position.y = -0.1;
        sphere.position.z = 0.7;





        this._scene.add(this._parent);

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

        // const helper = new CameraHelper( light.shadow.camera );
        // this._scene.add( helper );

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
            el.userData.body.applyForce(force, new Vec3(0, 0.2, 0))
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
        this._world.step( this._clock.delta );


        //this._test.position.copy(this._test.userData.body.position)

        this._elements.forEach(el => {
            el.position.copy(el.userData.body.position)
            const centerForce = new Vec3(-1*el.position.x ,0, -1*el.position.z)
            el.userData.body.applyForce(centerForce)
        })



        this._tiles.update();
       //  const tick = () => {
       //      this._scene.sphere.material.update() // Update the holographic material time uniform
       //      window.requestAnimationFrame(tick)
       //  }
       // tick();

        // hologramMaterial.update(); // Update the holographic material time uniform

        if (this._clock.elapsedTime < 1.5) {
            this._tiles.rotation.y +=  0.05 - this._clock.elapsedTime / 30;
        }
        else{
            this._tiles.rotation.y += this._clock.delta * 0.05;
        }


        // this._parent.position.y = Math.cos(this._clock.elapsedTime) * 0.1;
        if (this.mixer){
            this.mixer.update( this._clock.delta );
        }
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



        // this._gl.render(this._scene, this._camera);
        this._composer.render();

        this._gl.render(this._scene, this._camera);
        this._stats.end();
        window.requestAnimationFrame(this._animate.bind(this));
    }

}
