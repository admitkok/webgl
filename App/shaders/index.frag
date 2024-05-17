uniform vec3 uColorA;
uniform vec3 uColorB;

varying float vNoise;
varying float vDistance;
varying vec3 vNormal;


vec3 cosPalette(float t,  vec3 a,  vec3 b,  vec3 c, vec3 d){
    return a + b*sin( 6.28318*(c*t+d));
}

void main(){
  vec3 brightness = vec3(1);
  vec3 contrast = vec3(1.0);
  vec3 oscillation = vec3(1.0);
  vec3 phase = vec3(0.0, 0.0, 0.0);


//  vec3 finalColor = mix(uColorA, uColorB, vNoise);
  vec3 finalColor = cosPalette(vNoise, brightness, contrast, oscillation, phase);


  gl_FragColor = vec4(finalColor, 1.0);
}