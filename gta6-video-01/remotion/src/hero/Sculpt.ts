import * as THREE from 'three';

/* Implicit sculpting: ellipsoid "muscles" → smooth-union distance field → Surface Nets mesh.
   Each vertex also gets: bone skin weights, a groove/cavity value (muscle separation lines) and a muscle id. */
export type Prim = {bone: number; field: number; mus: number; m: number[]; r: [number, number, number]; w: number; bb: number[]; c: [number, number, number]};
export type FieldOut = {pos: Float32Array; nrm: Float32Array; cav: Float32Array; mus: Float32Array; musW: Float32Array; idx: Uint32Array; skinIdx: Float32Array; skinW: Float32Array; count: number; sample: (x: number, y: number) => number};

const dist = (p: Prim, x: number, y: number, z: number) => {
  const m = p.m; // inverse world matrix (row-major 3x4)
  const qx = m[0] * x + m[1] * y + m[2] * z + m[3], qy = m[4] * x + m[5] * y + m[6] * z + m[7], qz = m[8] * x + m[9] * y + m[10] * z + m[11];
  const ax = qx / p.r[0], ay = qy / p.r[1], az = qz / p.r[2];
  const k0 = Math.sqrt(ax * ax + ay * ay + az * az);
  const bx = ax / p.r[0], by = ay / p.r[1], bz = az / p.r[2];
  const k1 = Math.sqrt(bx * bx + by * by + bz * bz);
  return k1 < 1e-9 ? -Math.min(p.r[0], p.r[1], p.r[2]) : (k0 * (k0 - 1)) / k1;
};
const smin = (a: number, b: number, r: number) => { const h = Math.max(r - Math.abs(a - b), 0) / r; return Math.min(a, b) - h * h * r * 0.25; };

export const makePrim = (bone: number, field: number, mus: number, world: THREE.Matrix4, r: [number, number, number], w = 1): Prim => {
  const inv = world.clone().invert(), e = inv.elements; // column-major → row-major 3x4
  const m = [e[0], e[4], e[8], e[12], e[1], e[5], e[9], e[13], e[2], e[6], e[10], e[14]];
  const W = world.elements; const c: [number, number, number] = [W[12], W[13], W[14]];
  const he = [0, 1, 2].map((i) => Math.sqrt((W[i] * r[0]) ** 2 + (W[4 + i] * r[1]) ** 2 + (W[8 + i] * r[2]) ** 2));
  return {bone, field, mus, m, r, w, c, bb: [c[0] - he[0], c[1] - he[1], c[2] - he[2], c[0] + he[0], c[1] + he[1], c[2] + he[2]]};
};

export const buildField = (allPrims: Prim[], voxel: number, blend: number, bounds: number[], nBones: number): FieldOut | null => {
  if (!allPrims.length) return null;
  const prims = allPrims.filter((p) => p.w > 0), carve = allPrims.filter((p) => p.w < 0);
  const [x0, y0, z0, x1, y1, z1] = bounds;
  const nx = Math.ceil((x1 - x0) / voxel) + 1, ny = Math.ceil((y1 - y0) / voxel) + 1, nz = Math.ceil((z1 - z0) / voxel) + 1;
  const F = new Float32Array(nx * ny * nz).fill(1);
  const margin = blend + voxel * 2;
  for (const p of prims) {
    const ix0 = Math.max(0, Math.floor((p.bb[0] - margin - x0) / voxel)), ix1 = Math.min(nx - 1, Math.ceil((p.bb[3] + margin - x0) / voxel));
    const iy0 = Math.max(0, Math.floor((p.bb[1] - margin - y0) / voxel)), iy1 = Math.min(ny - 1, Math.ceil((p.bb[4] + margin - y0) / voxel));
    const iz0 = Math.max(0, Math.floor((p.bb[2] - margin - z0) / voxel)), iz1 = Math.min(nz - 1, Math.ceil((p.bb[5] + margin - z0) / voxel));
    for (let iz = iz0; iz <= iz1; iz++) for (let iy = iy0; iy <= iy1; iy++) { let o = (iz * ny + iy) * nx + ix0; for (let ix = ix0; ix <= ix1; ix++, o++) {
      const d = dist(p, x0 + ix * voxel, y0 + iy * voxel, z0 + iz * voxel); F[o] = F[o] >= 0.99 ? d : smin(F[o], d, blend);
    } }
  }
  for (const p of carve) { // subtract (eye sockets, nostrils, mouth slit)
    const ix0 = Math.max(0, Math.floor((p.bb[0] - margin - x0) / voxel)), ix1 = Math.min(nx - 1, Math.ceil((p.bb[3] + margin - x0) / voxel));
    const iy0 = Math.max(0, Math.floor((p.bb[1] - margin - y0) / voxel)), iy1 = Math.min(ny - 1, Math.ceil((p.bb[4] + margin - y0) / voxel));
    const iz0 = Math.max(0, Math.floor((p.bb[2] - margin - z0) / voxel)), iz1 = Math.min(nz - 1, Math.ceil((p.bb[5] + margin - z0) / voxel));
    for (let iz = iz0; iz <= iz1; iz++) for (let iy = iy0; iy <= iy1; iy++) { let o = (iz * ny + iy) * nx + ix0; for (let ix = ix0; ix <= ix1; ix++, o++) {
      const d = dist(p, x0 + ix * voxel, y0 + iy * voxel, z0 + iz * voxel); F[o] = Math.max(F[o], -d);
    } }
  }
  // Surface Nets
  const vid = new Int32Array(nx * ny * nz).fill(-1); const P: number[] = []; const I: number[] = [];
  const at = (x: number, y: number, z: number) => F[(z * ny + y) * nx + x];
  const corners = [[0, 0, 0], [1, 0, 0], [0, 1, 0], [1, 1, 0], [0, 0, 1], [1, 0, 1], [0, 1, 1], [1, 1, 1]];
  const edges = [[0, 1], [2, 3], [4, 5], [6, 7], [0, 2], [1, 3], [4, 6], [5, 7], [0, 4], [1, 5], [2, 6], [3, 7]];
  for (let z = 0; z < nz - 1; z++) for (let y = 0; y < ny - 1; y++) for (let x = 0; x < nx - 1; x++) {
    let mask = 0; const v = new Array(8);
    for (let c = 0; c < 8; c++) { v[c] = at(x + corners[c][0], y + corners[c][1], z + corners[c][2]); if (v[c] < 0) mask |= 1 << c; }
    if (mask === 0 || mask === 255) continue;
    let sx = 0, sy = 0, sz = 0, n = 0;
    for (const [a, b] of edges) { if ((v[a] < 0) !== (v[b] < 0)) { const t = v[a] / (v[a] - v[b]); sx += corners[a][0] + t * (corners[b][0] - corners[a][0]); sy += corners[a][1] + t * (corners[b][1] - corners[a][1]); sz += corners[a][2] + t * (corners[b][2] - corners[a][2]); n++; } }
    vid[(z * ny + y) * nx + x] = P.length / 3; P.push(x0 + (x + sx / n) * voxel, y0 + (y + sy / n) * voxel, z0 + (z + sz / n) * voxel);
  }
  const V = (x: number, y: number, z: number) => vid[(z * ny + y) * nx + x];
  for (let z = 1; z < nz - 1; z++) for (let y = 1; y < ny - 1; y++) for (let x = 1; x < nx - 1; x++) {
    const a = at(x, y, z) < 0;
    const quad = (v0: number, v1: number, v2: number, v3: number, flip: boolean) => { if (v0 < 0 || v1 < 0 || v2 < 0 || v3 < 0) return; if (flip) I.push(v0, v2, v1, v0, v3, v2); else I.push(v0, v1, v2, v0, v2, v3); };
    if (a !== (at(x + 1, y, z) < 0)) quad(V(x, y - 1, z - 1), V(x, y, z - 1), V(x, y, z), V(x, y - 1, z), !a);
    if (a !== (at(x, y + 1, z) < 0)) quad(V(x - 1, y, z - 1), V(x - 1, y, z), V(x, y, z), V(x, y, z - 1), !a);
    if (a !== (at(x, y, z + 1) < 0)) quad(V(x - 1, y - 1, z), V(x, y - 1, z), V(x, y, z), V(x - 1, y, z), !a);
  }
  // compact vertices
  const count = P.length / 3; const pos = new Float32Array(P);
  const nrm = new Float32Array(count * 3), cav = new Float32Array(count), mus = new Float32Array(count), musW = new Float32Array(count);
  const skinIdx = new Float32Array(count * 4), skinW = new Float32Array(count * 4);
  const grad = (x: number, y: number, z: number) => {
    const e = voxel * 0.9; const f = (px: number, py: number, pz: number) => { let m = 1e9; for (const p of prims) { if (px < p.bb[0] - margin || px > p.bb[3] + margin || py < p.bb[1] - margin || py > p.bb[4] + margin || pz < p.bb[2] - margin || pz > p.bb[5] + margin) continue; const d = dist(p, px, py, pz); m = m < 1e8 ? smin(m, d, blend) : d; } return m; };
    return [f(x + e, y, z) - f(x - e, y, z), f(x, y + e, z) - f(x, y - e, z), f(x, y, z + e) - f(x, y, z - e)];
  };
  void grad;
  const nb = nBones; const acc = new Float32Array(nb);
  for (let i = 0; i < count; i++) {
    const x = pos[i * 3], y = pos[i * 3 + 1], z = pos[i * 3 + 2];
    let hard = 1e9; acc.fill(0); let bestM = -1, bestMd = 1e9, secM = 1e9;
    let nxs = 0, nys = 0, nzs = 0, wsum = 0;
    for (const p of prims) {
      if (x < p.bb[0] - margin || x > p.bb[3] + margin || y < p.bb[1] - margin || y > p.bb[4] + margin || z < p.bb[2] - margin || z > p.bb[5] + margin) continue;
      const d = dist(p, x, y, z); if (d < hard) hard = d;
      const w = Math.exp(-Math.max(d, 0) / 0.016) * p.w; acc[p.bone] += w;
      if (p.mus >= 0) { if (d < bestMd) { if (bestM !== p.mus) secM = bestMd; bestM = p.mus; bestMd = d; } else if (p.mus !== bestM && d < secM) secM = d; }
      // normal from analytic gradients weighted by proximity
      const ww = Math.exp(-Math.max(d, 0) / 0.012); const m = p.m; const qx = m[0] * x + m[1] * y + m[2] * z + m[3], qy = m[4] * x + m[5] * y + m[6] * z + m[7], qz = m[8] * x + m[9] * y + m[10] * z + m[11];
      const gx = qx / (p.r[0] * p.r[0]), gy = qy / (p.r[1] * p.r[1]), gz = qz / (p.r[2] * p.r[2]);
      nxs += ww * (m[0] * gx + m[4] * gy + m[8] * gz); nys += ww * (m[1] * gx + m[5] * gy + m[9] * gz); nzs += ww * (m[2] * gx + m[6] * gy + m[10] * gz); wsum += ww;
    }
    void nxs; void nys; void nzs; void wsum;
    cav[i] = Math.max(0, Math.min(1, hard / (blend * 0.25)));
    { let bb = 0, bv = -1; for (let b = 0; b < nb; b++) if (acc[b] > bv) { bv = acc[b]; bb = b; } if (bb === 3 || bb === 4 || bb === 7 || bb === 10) cav[i] *= 0.3; } // soft face / neck / wrists
    mus[i] = bestM; musW[i] = bestM < 0 ? 0 : Math.max(0, Math.min(1, (secM - bestMd) / 0.012 * 0.5 + 0.5 - 0.5 * Math.max(0, bestMd) / 0.02));
    // top-4 bone weights
    const idxs = Array.from({length: nb}, (_, b) => b).sort((a, b) => acc[b] - acc[a]).slice(0, 4); let s = 0; idxs.forEach((b) => (s += acc[b])); if (s <= 0) { idxs[0] = 0; s = 1; acc[0] = 1; }
    idxs.forEach((b, k) => { skinIdx[i * 4 + k] = b; skinW[i * 4 + k] = acc[b] / s; });
  }
  const sample = (px: number, py: number) => { // z of the first surface hit along +z→-z at (px,py)
    const ix = Math.round((px - x0) / voxel), iy = Math.round((py - y0) / voxel); if (ix < 0 || iy < 0 || ix >= nx || iy >= ny) return NaN;
    for (let iz = nz - 2; iz >= 0; iz--) { const a = at(ix, iy, iz), b = at(ix, iy, iz + 1); if (a < 0 && b >= 0) return z0 + (iz + a / (a - b)) * voxel; }
    return NaN;
  };
  // smooth mesh normals (area-weighted), then one relaxation pass for broad, clean cel regions
  for (let t = 0; t < I.length; t += 3) {
    const a = I[t] * 3, b2 = I[t + 1] * 3, c = I[t + 2] * 3;
    const ux = pos[b2] - pos[a], uy = pos[b2 + 1] - pos[a + 1], uz = pos[b2 + 2] - pos[a + 2], vx = pos[c] - pos[a], vy = pos[c + 1] - pos[a + 1], vz = pos[c + 2] - pos[a + 2];
    const nx2 = uy * vz - uz * vy, ny2 = uz * vx - ux * vz, nz2 = ux * vy - uy * vx;
    for (const k of [a, b2, c]) { nrm[k] += nx2; nrm[k + 1] += ny2; nrm[k + 2] += nz2; }
  }
  { const sm = new Float32Array(nrm.length); for (let t = 0; t < I.length; t += 3) { const ids = [I[t] * 3, I[t + 1] * 3, I[t + 2] * 3]; const nx3 = nrm[ids[0]] + nrm[ids[1]] + nrm[ids[2]], ny3 = nrm[ids[0] + 1] + nrm[ids[1] + 1] + nrm[ids[2] + 1], nz3 = nrm[ids[0] + 2] + nrm[ids[1] + 2] + nrm[ids[2] + 2]; for (const k of ids) { sm[k] += nx3; sm[k + 1] += ny3; sm[k + 2] += nz3; } } for (let i = 0; i < nrm.length; i++) nrm[i] = nrm[i] + sm[i] * 0.35; }
  for (let i = 0; i < count; i++) { const l = Math.hypot(nrm[i * 3], nrm[i * 3 + 1], nrm[i * 3 + 2]) || 1; nrm[i * 3] /= l; nrm[i * 3 + 1] /= l; nrm[i * 3 + 2] /= l; }
  return {pos, nrm, cav, mus, musW, idx: new Uint32Array(I), skinIdx, skinW, count, sample};
};
