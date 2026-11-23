import * as THREE from 'three';

/* Comic cel-shading used by every hero asset. Light is fixed in VIEW space so the shading stays identical from every camera angle (comic look). */
export const PAL = {
  skin: ['#07191A', '#12302F', '#1C4745', '#2B6362', '#3A8280', '#6BB8B0'], // deep shadow → highlight (base = #2B6362, measured on the reference)
  shorts: ['#050506', '#0C0C0E', '#16161A', '#212126', '#34343C', '#5E5E6B'],
  white: ['#7D8887', '#A9B5B4', '#D2DAD9', '#EBF1F0', '#F7FAF9', '#FFFFFF'],
  metal: ['#2C2F36', '#4A4F59', '#6B717D', '#878E9A', '#A9AFB9', '#D3D8DF'],
  rope: ['#020202', '#060606', '#0B0B0C', '#141416', '#202024', '#4A4A52'],
  amber: '#FFB02E',
  ink: '#050607',
  eye: '#F6FFFD',
};
const VS = `varying vec3 vN; varying vec3 vV; void main(){ vN = normalize(normalMatrix * normal); vec4 mv = modelViewMatrix * vec4(position, 1.0); vV = -mv.xyz; gl_Position = projectionMatrix * mv; }`;
const FS = `
uniform vec3 uRamp[6]; uniform float uGlow; uniform vec3 uGlowCol; uniform vec3 uLight; uniform float uSpec;
varying vec3 vN; varying vec3 vV;
void main(){
  vec3 N = normalize(vN); vec3 V = normalize(vV);
  float d = dot(N, uLight) * 0.5 + 0.5;
  float band = d < 0.20 ? 0.0 : d < 0.38 ? 1.0 : d < 0.55 ? 2.0 : d < 0.72 ? 3.0 : d < 0.88 ? 4.0 : 5.0;
  float rim = smoothstep(0.62, 0.9, 1.0 - max(dot(N, V), 0.0)) * (1.0 - smoothstep(0.25, 0.5, d));
  band = min(5.0, band + step(0.5, rim));
  int bi = int(band);
  vec3 col = uRamp[0];
  if (bi == 1) col = uRamp[1]; else if (bi == 2) col = uRamp[2]; else if (bi == 3) col = uRamp[3]; else if (bi == 4) col = uRamp[4]; else if (bi == 5) col = uRamp[5];
  vec3 h = normalize(uLight + V); float sp = step(0.965, dot(N, h)) * uSpec;
  col = mix(col, uRamp[5] * 1.15, sp);
  vec3 g = uGlowCol * (0.34 + 0.13 * band);
  col = mix(col, g, uGlow * 0.82);
  gl_FragColor = vec4(col, 1.0);
}`;
export const toonMat = (ramp: string[], spec = 0.6) => new THREE.ShaderMaterial({
  uniforms: {
    uRamp: {value: ramp.map((c) => new THREE.Color(c))}, uGlow: {value: 0}, uGlowCol: {value: new THREE.Color(PAL.amber)},
    uLight: {value: new THREE.Vector3(-0.45, 0.72, 0.52).normalize()}, uSpec: {value: spec},
  },
  vertexShader: VS, fragmentShader: FS,
});
/** Inverted-hull outline with constant on-screen width (NDC units). */
export const outlineMat = (thick = 0.0042, aspect = 1080 / 1920) => new THREE.ShaderMaterial({
  uniforms: {uThick: {value: thick}, uAspect: {value: aspect}},
  vertexShader: `uniform float uThick; uniform float uAspect; void main(){ vec4 p = projectionMatrix * modelViewMatrix * vec4(position, 1.0); vec3 n = normalize(normalMatrix * normal); vec2 o = (projectionMatrix * vec4(n, 0.0)).xy; o = normalize(o + 1e-5); o.x *= uAspect; p.xy += o * uThick * p.w; gl_Position = p; }`,
  fragmentShader: `void main(){ gl_FragColor = vec4(0.02, 0.025, 0.03, 1.0); }`,
  side: THREE.BackSide,
});
