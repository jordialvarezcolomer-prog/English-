import * as THREE from 'three';

export const PAL = {
  skin: ['#06171A', '#0F2B2E', '#1A4244', '#2B6362', '#3A8280', '#78C4BB'],
  shorts: ['#040405', '#0A0A0C', '#131316', '#1E1E23', '#30303A', '#5A5A68'],
  white: ['#6F7B7A', '#9AA7A6', '#C8D1D0', '#E6EDEC', '#F6F9F8', '#FFFFFF'],
  sole: ['#030304', '#08080A', '#0E0E11', '#17171B', '#26262C', '#44444D'],
  metal: ['#2C2F36', '#4A4F59', '#6B717D', '#878E9A', '#A9AFB9', '#D3D8DF'],
  rope: ['#020202', '#060606', '#0B0B0C', '#141416', '#202024', '#4A4A52'],
  amber: '#FFB02E', ink: '#050607', eye: '#F6FFFD',
};
const VS = `
attribute float cav; attribute float mus; attribute float musW; attribute vec3 rp;
uniform float uGl[16];
varying vec3 vN; varying vec3 vV; varying float vCav; varying float vMask; varying float vLvl; varying vec3 vP; varying float vMus;
void main(){
  vN = normalize(normalMatrix * normal); vec4 mv = modelViewMatrix * vec4(position, 1.0); vV = -mv.xyz; vP = rp; vMus = mus;
  vCav = cav; vMask = musW; float l = 0.0; for (int i = 0; i < 16; i++) { if (abs(float(i) - mus) < 0.5) l = uGl[i]; } vLvl = l;
  gl_Position = projectionMatrix * mv;
}`;
const FS = `
uniform vec3 uRamp[6]; uniform vec3 uGlowCol; uniform vec3 uLight; uniform float uSpec; uniform float uLine; uniform float uHatch; uniform float uTex;
varying vec3 vN; varying vec3 vV; varying float vCav; varying float vMask; varying float vLvl; varying vec3 vP; varying float vMus;
float h31(vec3 p){ p = fract(p * 0.3183099 + 0.1); p *= 17.0; return fract(p.x * p.y * p.z * (p.x + p.y + p.z)); }
float vn(vec3 x){ vec3 i = floor(x), f = fract(x); f = f * f * (3.0 - 2.0 * f);
  return mix(mix(mix(h31(i), h31(i + vec3(1,0,0)), f.x), mix(h31(i + vec3(0,1,0)), h31(i + vec3(1,1,0)), f.x), f.y),
             mix(mix(h31(i + vec3(0,0,1)), h31(i + vec3(1,0,1)), f.x), mix(h31(i + vec3(0,1,1)), h31(i + vec3(1,1,1)), f.x), f.y), f.z); }
void main(){
  vec3 N = normalize(vN); vec3 V = normalize(vV);
  float d = dot(N, uLight) * 0.5 + 0.58;
  d -= vCav * 0.05;                               // grooves sit in shadow
  float band = d < 0.20 ? 0.0 : d < 0.36 ? 1.0 : d < 0.52 ? 2.0 : d < 0.70 ? 3.0 : d < 0.87 ? 4.0 : 5.0;
  float rim = smoothstep(0.58, 0.88, 1.0 - max(dot(N, V), 0.0)) * (1.0 - smoothstep(0.30, 0.55, d));
  band = min(5.0, band + step(0.5, rim));
  int bi = int(band);
  vec3 col = uRamp[0];
  if (bi == 1) col = uRamp[1]; else if (bi == 2) col = uRamp[2]; else if (bi == 3) col = uRamp[3]; else if (bi == 4) col = uRamp[4]; else if (bi == 5) col = uRamp[5];
  vec3 h = normalize(uLight + V); float sp = step(0.972, dot(N, h)) * uSpec; col = mix(col, uRamp[5], sp);
  // ---------- textures ----------
  if (uTex < 1.5) {
    // skin: halftone dots in the shadow transition, fine pore grain, muscle fibre striations, veins
    vec2 hp = fract(gl_FragCoord.xy * 0.2) - 0.5; float dots = step(length(hp), 0.26 + 0.04 * (2.0 - band)) * step(1.5, band) * step(band, 2.5);
    col = mix(col, uRamp[1], dots * 0.7);
    float pores = step(0.86, vn(vP * 330.0)) * 0.5; col *= 1.0 - pores * 0.22 * step(band, 4.5);
    float grain = vn(vP * 140.0) - 0.5; col *= 1.0 + grain * 0.06;
    float vm = (abs(vMus - 10.0) < 0.5 ? 1.0 : abs(vMus - 8.0) < 0.5 ? 0.75 : abs(vMus - 9.0) < 0.5 ? 0.45 : abs(vMus - 11.0) < 0.5 ? 0.25 : abs(vMus - 6.0) < 0.5 ? 0.2 : 0.0);
    float vein = 1.0 - smoothstep(0.0, 0.035, abs(vn(vP * vec3(26.0, 6.0, 26.0) + 3.7) - 0.5)); float vein2 = 1.0 - smoothstep(0.0, 0.03, abs(vn(vP * vec3(9.0, 19.0, 9.0) + 9.1) - 0.5));
    col = mix(col, uRamp[0] * 1.5 + vec3(0.02, 0.06, 0.05), max(vein, vein2 * 0.8) * vm * 0.6);
    float hatch = step(0.5, fract((gl_FragCoord.x + gl_FragCoord.y) * 0.16)) * step(band, 1.5) * uHatch; col = mix(col, uRamp[0], hatch * 0.5);
  } else if (uTex < 2.5) {
    // black fabric: weave + vertical drape folds + seams
    float weave = step(0.5, fract(vP.x * 380.0)) * step(0.5, fract(vP.y * 380.0)); col = mix(col, uRamp[min(5, bi + 1)], weave * 0.12);
    float fold = abs(sin(vP.x * 70.0 + vn(vP * 6.0) * 5.0)); col = mix(col, uRamp[0], smoothstep(0.92, 1.0, fold) * 0.6);
    col = mix(col, uRamp[5], smoothstep(0.985, 1.0, abs(sin(vP.x * 24.0 + 1.0))) * 0.0);
  } else if (uTex < 3.5) {
    // white sock / waistband: knit ribs + stitching
    float rib = step(0.5, fract(vP.x * 210.0 + vP.z * 210.0)); col = mix(col, uRamp[min(5, max(0, bi - 1))], rib * 0.28);
    float st = step(0.82, fract(vP.y * 90.0)) * 0.12; col -= st;
  } else {
    // sole: tread
    float tr = step(0.5, fract(vP.z * 150.0)) * step(0.5, fract(vP.x * 150.0)); col = mix(col, uRamp[min(5, bi + 2)], tr * 0.5);
  }
  // muscle separation lines (grooves)
  float ln = smoothstep(0.84, 0.97, vCav) * uLine * step(uTex, 1.5); col = mix(col, uRamp[0], ln * 0.85);
  // amber muscle highlight keeps the cel bands
  float g = smoothstep(0.35, 0.6, vMask) * vLvl; vec3 gc = uGlowCol * (0.34 + 0.14 * band); col = mix(col, gc, g * 0.85);
  gl_FragColor = vec4(col, 1.0);
}`;
export const toonMat = (ramp: string[], o: {spec?: number; line?: number; hatch?: number; tex?: number} = {}) => new THREE.ShaderMaterial({
  uniforms: {
    uRamp: {value: ramp.map((c) => new THREE.Color(c))}, uGlowCol: {value: new THREE.Color(PAL.amber)}, uGl: {value: new Array(16).fill(0)},
    uLight: {value: new THREE.Vector3(-0.42, 0.6, 0.68).normalize()}, uSpec: {value: o.spec ?? 0.6}, uLine: {value: o.line ?? 1}, uHatch: {value: o.hatch ?? 0}, uTex: {value: o.tex ?? 0},
  },
  vertexShader: VS, fragmentShader: FS,
});
export const outlineMat = (thick = 0.0042, aspect = 1080 / 1920) => new THREE.ShaderMaterial({
  uniforms: {uThick: {value: thick}, uAspect: {value: aspect}},
  vertexShader: `uniform float uThick; uniform float uAspect; void main(){ vec4 p = projectionMatrix * modelViewMatrix * vec4(position, 1.0); vec3 n = normalize(normalMatrix * normal); vec2 o = (projectionMatrix * vec4(n, 0.0)).xy; o = normalize(o + 1e-5); o.x *= uAspect; p.xy += o * uThick * p.w; gl_Position = p; }`,
  fragmentShader: `void main(){ gl_FragColor = vec4(0.015, 0.02, 0.025, 1.0); }`,
  side: THREE.BackSide,
});
