import {
    ChromaticAberrationEffect,
    EffectComposer,
    EffectPass,
    PixelationEffect,
    RenderPass,
    ScanlineEffect,
    SepiaEffect,
} from 'postprocessing';
import { FloatType, Vector2 } from 'three';

export default class Postprocessing {
    constructor({ gl, scene, camera }) {
        this._gl = gl;
        this._scene = scene;
        this._camera = camera;

        this._init();
    }

    _init() {
        // INIT COMPOSER
        const composer = new EffectComposer(this._gl, {
            frameBufferType: FloatType,
        });

        // RENDERPASS
        const rp = new RenderPass(this._scene, this._camera);

        // EFFECTPASS
        const cae = new ChromaticAberrationEffect({
            offset: new Vector2(0.005, 0.005),
        });
        this._cae = cae;

        const sepiaEffect = new SepiaEffect();
        const pixelatedEffect = new PixelationEffect(10);
        this._pe = pixelatedEffect;
        const scanlineEffect = new ScanlineEffect({
            density: 0.01,
            scrollSpeed: 0.2,
        });

        const effectPass = new EffectPass(this._camera, scanlineEffect);

        // ADD PASSES
        composer.addPass(rp);
        composer.addPass(effectPass);

        this._composer = composer;
    }

    updateChromaticIntensity(x, y) {
        this._cae.offset.x = x * 0.007;
        this._cae.offset.y = y * 0.003;
    }

    updatePixelationSize(x) {
        this._pe.granularity = Math.abs(x) * 50;
    }

    render() {
        this._composer.render();
    }
}
