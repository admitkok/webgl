#include './noise.glsl'

uniform vec3 uMouse;
uniform float uTime;

varying vec3 vNormal;
varying float vNoise;
varying float vDistance;

void main(){
  vec3 newPosition = position;

  // FIRST DISPLACEMENT
  float noise = snoise(vec3(
    0.4 * position.x + uTime * 0.4,
    0.4 * position.y,
    0.4 * position.z
  ));

  newPosition += normal * (noise * 0.01);

  // SECOND DISPLACEMENT
  float noise2 = snoise(vec3(
    5.0 * newPosition.x + uTime * 5.0,
    newPosition.y * 5.0,
    newPosition.z * 5.0
  ));


  vec3 mouse = uMouse;
  float d = 0.1 * distance(mouse, newPosition);
  float intensity = 1.0 - smoothstep(1.0, 1.0, d);
  intensity *= 0.5;
  vDistance = intensity;




  //newPosition += normal * (noise2 * 0.00);
  float firstNoiseIntensity = smoothstep(0.0, 0.1, noise);
  newPosition += (0.01 * noise2 * normal) * intensity;



  float newNoise = smoothstep(-1.0, 1.0, noise);
  vNoise = newNoise;

  vNormal = normal;

  gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
}