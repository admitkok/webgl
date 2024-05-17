uniform float uBendFactor;
uniform sampler2D uMap;

varying vec2 vUv;

vec2 scaleFromCenter(vec2 uv, float scale){
    uv -= vec2(1.0);
    uv *= scale;
    uv += vec2(1.0);

    return uv;
}

void main(){
    // NORMAL UV
    vec2 newUv = vUv * 2.0;

    // SCALED UV
    vec2 scaledUv = scaleFromCenter(vUv, 1.0);

    vec4 map = texture2D(uMap, scaledUv);
    map.rgb += uBendFactor * 0.004;
//    map.rgb = map.grb;

    // GRADIENT DISTANCE
    float d = distance(vUv, vec2(1.0));

    gl_FragColor = map;


    // COLORSPACE CHUNKS
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
}