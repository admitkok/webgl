import {
    PerspectiveCamera,
    WebGLRenderer,
    Scene,
    PlaneGeometry,
    CameraHelper,
    BoxGeometry,
    MeshBasicMaterial,
    MeshStandardMaterial,
    Mesh,
    Color,
    DirectionalLight,
    AmbientLight,
    SpotLight,
    Group,
    SpotLightHelper,
    EquirectangularReflectionMapping,
    RepeatWrapping,
    AnimationMixer,
    Clock,
    Vector2, PCFSoftShadowMap, ShaderLib as light, SphereGeometry,
} from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { gsap } from 'gsap';

import Stats from 'stats.js';
import resources from './Resources';
import Composer from './Postprocessing';

const CONFIG = {
    dark: {
        ambientLightIntensity: 5,
        background: 0x02040a,
        envMapIntensity: 1,
        spotLightIntensity: 0,
    },
    light: {
        ambientLightIntensity: 0,
        background: 0xfd4c9ab,
        envMapIntensity: 0.13,
        spotLightIntensity: 400,
    },
};

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

        // CAMERA
        const aspect = window.innerWidth / window.innerHeight;
        this._camera = new PerspectiveCamera(60, aspect, 1, 100);
        this._camera.position.x = 1;
        this._camera.position.y = 2;
        this._camera.position.z = 5;
        this._camera.lookAt(4, 2, -6);

        // SCENE
        this._scene = new Scene();

        // CLOCK
        this._clock = new Clock();

        // COMPOSER
        this._initComposer();

        // MOUSE
        this._mouse = new Vector2();

        // CONTROLS
        // const controls = new OrbitControls(this._camera, this._gl.domElement);

        // STATS
        this._stats = new Stats();
        document.body.appendChild(this._stats.dom);

        // LOAD
        this._load();

        this._animate();

        this._initEvents();
    }

    async _load() {
        await resources.load();

        // INIT SCENE
        this._initScene();

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

    _initScene() {
        // SCENE // ENVMAP
        this._scene.background = new Color('#0A0A0A');
        const envmap = resources.get('envmap');
        envmap.mapping = EquirectangularReflectionMapping;
        this._scene.environment = envmap;

        // Deadpool
        const dp = resources.get('dp');
        dp.castShadow = true;
        this._parent.add(dp.scene);
        dp.scene.scale.set(2, 2, 2);
        dp.scene.rotation.y = -Math.PI / 2;
        console.log(dp.scene);

        dp.castShadow = true;



        this.mixer = new AnimationMixer( dp.scene );
        const clips = dp.animations;
        console.log(clips);

        // Update the mixer on each frame
        // function update () {
        //     mixer.update( deltaSeconds );
        // }

        // Play a specific animation
        // const clip = AnimationClip.findByName( clips, clips[0].name );
        //         // const action = this.mixer.clipAction( clip );
        //         // action.play();

        const action = this.mixer.clipAction( clips[0] );
        action.play();

        // Play all animations
        // clips.forEach( function ( clip ) {
        //     this.mixer.clipAction( clip ).play();
        //     console.log(  clip );
        // } );

        const sphereGeometry = new SphereGeometry( 0.9, 32, 32 );
        const sphereMaterial = new MeshStandardMaterial( { color: 0xff0000 } );
        const sphere = new Mesh( sphereGeometry, sphereMaterial );
        sphere.position.y = 7;
        sphere.castShadow = true; //default is false
        sphere.receiveShadow = false; //default
        this._parent.add(sphere);
        this._scene.add( sphere );

        const planeGeometry = new PlaneGeometry( 20, 20, 32, 32 );
        const planeMaterial = new MeshStandardMaterial( { color: 0x999999 } )
        const plane = new Mesh( planeGeometry, planeMaterial );
        plane.position.y = -0.1;
        plane.rotation.x = -Math.PI / 2;
        plane.receiveShadow = true;
        this._scene.add( plane );
        this._parent.add(plane);


        this._scene.add(this._parent);

    }

    _initLights() {
        // AMBIENT
        const al = new AmbientLight(0xfefefe);
        al.intensity = 5;
        this._al = al;
        this._scene.add(al);

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
        const light = new DirectionalLight( 0xffffff, 1 );
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

    _initEvents() {
        window.addEventListener('resize', this._resize.bind(this));
    }

    onMouseMove(e) {
        this._mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
        this._mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;

        this._composer.updateChromaticIntensity(this._mouse.x, this._mouse.y);
        this._composer.updatePixelationSize(this._mouse.x, this._mouse.y);
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

        this._parent.position.y = Math.cos(this._clock.elapsedTime) * 0.1;
        if (this.mixer){
            this.mixer.update( this._clock.delta );
        }

        // this._gl.render(this._scene, this._camera);
        this._composer.render();

        this._stats.end();
        window.requestAnimationFrame(this._animate.bind(this));
    }

}
