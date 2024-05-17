uniform float uBendFactor;
uniform sampler2D uMap;
uniform float uTime;
uniform vec3 uScanlineColor;

varying vec2 vUv;

vec2 scaleFromCenter(vec2 uv, float scale){
    uv -= vec2(0.5);
    uv *= scale;
    uv += vec2(0.5);
    return uv;
}

void main(){
    // NORMAL UV
    vec2 newUv = vUv * 0.6;

    // SCALED UV
    vec2 scaledUv = scaleFromCenter(vUv, 0.9);

    vec4 map = texture2D(uMap, scaledUv);


    float scanlineIntensity = 0.1;
    float scanlineSpeed = 2.9;
    float scanlineSpacing = 5.0;
    float scanline = mod(gl_FragCoord.y - uTime * scanlineSpeed, scanlineSpacing) < 1.0 ? 1.0 : 0.0;
    vec3 coloredScanline = uScanlineColor * scanlineIntensity * scanline;
    map.rgb *= (1.0 - scanlineIntensity * scanline) + coloredScanline;

    // Apply bending factor
//     map.rgb += uBendFactor * 0.001;

    // Reorder color channels
    // map.rgb = map.grb;

    // GRADIENT DISTANCE
    float d = distance(vUv * 0.5, vec2(1.0));

    gl_FragColor = map;

    // COLORSPACE CHUNKS
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
}
