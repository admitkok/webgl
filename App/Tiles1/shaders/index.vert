uniform float uBendFactor;

varying vec2 vUv;

void main(){
    vec3 newPosition = position;
    float d = distance(uv, vec2(0.5));
    d = 1.0 - smoothstep(0.0, 1.0, d);

    // BEND FACTOR
    float bendFactor = uBendFactor * 1.0;
    bendFactor = clamp(bendFactor, -0.35, 0.35);
    newPosition.x += d * bendFactor;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);

    vUv = uv;
}