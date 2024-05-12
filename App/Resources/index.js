import { TextureLoader, VideoTexture } from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { RGBELoader } from 'three/addons/loaders/RGBELoader.js';

const ASSETS = [
    { key: 'dp', type: 'gltf', path: '/quinn_character_golf.glb' },
    { key: 'envmap', type: 'envmap', path: '/envmap.hdr' }
];




class Resources {
    constructor() {
        this._resouces = new Map();

        this._loaders = {
            tl: new TextureLoader(),
            gltf: new GLTFLoader(),
            rgbe: new RGBELoader(),
        };
    }

    get(v) {
        return this._resouces.get(v);
    }

    async load() {
        console.log(this._resouces)
        const promises = ASSETS.map((el) => {
            // GTLF
            let prom;
            if (el.type === 'gltf') {
                prom = new Promise((res) => {
                    this._loaders.gltf.load(el.path, (model) => {
                        this._resouces.set(el.key, model);
                        res();
                        console.log('reso');
                    });
                });
            }

            // ENVMAP
            if (el.type === 'envmap') {
                prom = new Promise((res) => {
                    this._loaders.rgbe.load(el.path, (texture) => {
                        this._resouces.set(el.key, texture);
                        res();
                    });
                });
            }

            // TEXTURE
            if (el.type === 'texture') {
                prom = new Promise((res) => {
                    this._loaders.tl.load(el.path, (texture) => {
                        this._resouces.set(el.key, texture);
                        res();
                    });
                });
            }

            // VIDEO
            if (el.type === 'video') {
                prom = new Promise((res) => {
                    const video = document.createElement('video');
                    video.width = 0;
                    video.height = 0;
                    video.loop = true;
                    video.muted = true;
                    video.playsInline = true;
                    video.preload = 'auto';
                    video.crossOrigin = 'anonymous';
                    video.style.display = 'none';
                    video.src = el.path;
                    video.type = 'video/mp4';

                    document.body.appendChild(video);

                    video.addEventListener('loadedmetadata', () => {
                        const videoTexture = new VideoTexture(video);
                        videoTexture.needsUpdate = true;
                        videoTexture.userData.video = video;
                        this._resouces.set(el.key, videoTexture);
                        res();
                    });

                    video.load();
                });
            }

            return prom;
        });

        await Promise.all(promises);
    }
}

const resouces = new Resources();
export default resouces;
