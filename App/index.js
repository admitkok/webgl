import {
    PerspectiveCamera,
    WebGLRenderer,
    Scene,
    BoxGeometry,
    MeshBasicMaterial,
    Mesh,
    MeshStandardMaterial,
    AmbientLight,
    HemisphereLight,
    TorusKnotGeometry,
    HemisphereLightHelper,
    DirectionalLight,
    DirectionalLightHelper,
    SpotLight,
    SpotLightHelper,
    PlaneGeometry,
    PointLight,
    PointLightHelper,
    PMREMGenerator,
    BasicShadowMap,
    PCFSoftShadowMap,
    CameraHelper,
} from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader';

import Stats from 'stats.js';

export default class App {
    constructor() {
        this._init();
    }

    _init() {
        // RENDERER
        this._gl = new WebGLRenderer({
            canvas: document.querySelector('#canvas'),
        });

        this._gl.shadowMap.enabled = true;
        this._gl.shadowMap.type = PCFSoftShadowMap;

        this._gl.setSize(window.innerWidth, window.innerHeight);

        // CAMERA
        const aspect = window.innerWidth / window.innerHeight;
        this._camera = new PerspectiveCamera(60, aspect, 1, 100);
        this._camera.position.z = 5;

        // SCENE
        this._scene = new Scene();

        // OBJECT
        this._initMesh();

        // LIGHTS
        this._initLights();

        // CONTROLS
        const controls = new OrbitControls(this._camera, this._gl.domElement);

        // STATS
        this._stats = new Stats();
        document.body.appendChild(this._stats.dom);

        this._animate();

        this._initEvents();
    }

    _initMesh() {
        const cubeGeometry = new TorusKnotGeometry(1, 0.35, 100);
        const cubeMaterial = new MeshStandardMaterial({
            metalness: 0.4,
            roughness: 1,
        });
        const cubeMesh = new Mesh(cubeGeometry, cubeMaterial);
        cubeMesh.castShadow = true;
        this._torus = cubeMesh;
        this._scene.add(cubeMesh);

        const floorGeometry = new PlaneGeometry(1, 1);
        const floorMaterial = new MeshStandardMaterial();
        const floorMesh = new Mesh(floorGeometry, floorMaterial);
        floorMesh.receiveShadow = true;

        floorMesh.scale.set(20, 20, 1);
        floorMesh.position.y = -2;
        floorMesh.rotation.x = -Math.PI * 0.5;
        this._scene.add(floorMesh);
    }

    _initLights() {
        // AMBIENT
        const al = new AmbientLight('white', 0.4);
        //this._scene.add(al)

        // HEMISPEHRE
        const hl = new HemisphereLight(0xff0000, 0x1fbeca, 0.1);
        const hlh = new HemisphereLightHelper(hl);
        //this._scene.add(hl, hlh)

        // DIRECTIONAL
        const dl = new DirectionalLight(0xffffff, 1.7);
        dl.color.set('#1fbeca');
        dl.position.y = 2;
        dl.position.z = 5;
        dl.castShadow = true;
        const dlh = new DirectionalLightHelper(dl);

        dl.shadow.mapSize.set(256, 256);
        dl.shadow.camera.top = 2.2;
        dl.shadow.camera.left = -2.2;
        dl.shadow.camera.right = 2.2;
        dl.shadow.camera.bottom = -2.2;
        dl.shadow.camera.far = 20;
        const dlsh = new CameraHelper(dl.shadow.camera);

        this._dl = dl;
        this._scene.add(dl, dlh, dlsh);

        // SPOTLIGHT
        const sl = new SpotLight(0xff0000);
        sl.intensity = 50;
        sl.position.y = 4.5;
        sl.position.z = 0.0;
        sl.angle = 0.9;
        sl.penumbra = 0.3;
        sl.distance = 10;
        sl.castShadow = true;
        const slh = new SpotLightHelper(sl);
        //this._scene.add(sl, slh);

        // POINT LIGHT
        const pl = new PointLight(0x1fbeca, 3);
        pl.position.set(-3, 1, 1);
        const plh = new PointLightHelper(pl);
        //this._scene.add(pl, plh);

        // ENVMAP
        const rgbeLoader = new RGBELoader();
        const pmrem = new PMREMGenerator(this._gl);
        pmrem.compileEquirectangularShader();

        console.log(rgbeLoader.load);
        rgbeLoader.load('/envmap.hdr', (texture) => {
            const envmap = pmrem.fromEquirectangular(texture);
            //this._scene.environment = envmap.texture
        });
    }

    _initEvents() {
        window.addEventListener('resize', this._resize.bind(this));
    }

    _resize() {
        this._gl.setSize(window.innerWidth, window.innerHeight);

        const aspect = window.innerWidth / window.innerHeight;
        this._camera.aspect = aspect;
        this._camera.updateProjectionMatrix();
    }

    _animate() {
        this._stats.begin();
        this._torus.rotation.y += 0.01;
        this._gl.render(this._scene, this._camera);
        this._stats.end();

        window.requestAnimationFrame(this._animate.bind(this));
    }
}
