// Export each cluster of the bedroom scene into its own GLB (geometry centred on origin)
// plus a manifest that can rebuild the original room.
import fs from 'fs'; import path from 'path';
import sharp from 'sharp';
import { loadGLB, buildWorld } from './lib.mjs';

const SRC = 'models/bedroom__modern_cozy_bedroom_interior.glb';
const SP = process.argv[2];
const OUTDIR = process.argv[3] || 'models/bedroom_parts';
const MAX_TEX = +(process.env.MAX_TEX || 1024);
const JPEG_Q = +(process.env.JPEG_Q || 82);

const { json: g, bin } = loadGLB(SRC);
const { world } = buildWorld(g);
const clusters = JSON.parse(fs.readFileSync(SP + '/clusters.json', 'utf8'));
const names = JSON.parse(fs.readFileSync(SP + '/names.json', 'utf8')); // [{name, slug}] per cluster
fs.mkdirSync(OUTDIR, { recursive: true });

const COMP_SIZE = { 5120: 1, 5121: 1, 5122: 2, 5123: 2, 5125: 4, 5126: 4 };
const NUM_COMP = { SCALAR: 1, VEC2: 2, VEC3: 3, VEC4: 4, MAT2: 4, MAT3: 9, MAT4: 16 };
const align4 = n => n + ((4 - (n % 4)) % 4);

// ---- texture cache: source image index -> compressed buffer ----
const imgCache = new Map();
async function getImage(ii) {
  if (imgCache.has(ii)) return imgCache.get(ii);
  const im = g.images[ii];
  const bv = g.bufferViews[im.bufferView];
  const raw = bin.subarray(bv.byteOffset || 0, (bv.byteOffset || 0) + bv.byteLength);
  let img = sharp(raw, { limitInputPixels: false });
  const meta = await img.metadata();
  if (Math.max(meta.width, meta.height) > MAX_TEX) {
    img = img.resize({ width: MAX_TEX, height: MAX_TEX, fit: 'inside', withoutEnlargement: true });
  }
  let out, mime;
  if (meta.hasAlpha) {
    out = await img.png({ compressionLevel: 9, palette: true, quality: 90 }).toBuffer();
    mime = 'image/png';
  } else {
    out = await img.jpeg({ quality: JPEG_Q, mozjpeg: true }).toBuffer();
    mime = 'image/jpeg';
  }
  const r = { buf: out, mime };
  imgCache.set(ii, r);
  return r;
}

// deep-remap texture references inside a material (incl. extensions)
function remapTexRefs(obj, mapTex, key) {
  if (Array.isArray(obj)) return obj.map(o => remapTexRefs(o, mapTex, key));
  if (obj && typeof obj === 'object') {
    const o = {};
    for (const k of Object.keys(obj)) {
      const v = obj[k];
      if (v && typeof v === 'object' && typeof v.index === 'number' && /texture$/i.test(k)) {
        o[k] = { ...remapTexRefs(v, mapTex, k), index: mapTex.get(v.index) };
      } else o[k] = remapTexRefs(v, mapTex, k);
    }
    return o;
  }
  return obj;
}

function collectTextures(mi) {
  const set = new Set();
  (function walk(o, key) {
    if (Array.isArray(o)) return o.forEach(x => walk(x, key));
    if (o && typeof o === 'object') {
      if (typeof o.index === 'number' && /texture$/i.test(key || '')) set.add(o.index);
      for (const k of Object.keys(o)) walk(o[k], k);
    }
  })(g.materials[mi], 'material');
  return [...set];
}

async function exportCluster(ci) {
  const cl = clusters[ci];
  const info = names[ci];
  const center = [0, 1, 2].map(a => (cl.min[a] + cl.max[a]) / 2);

  const out = {
    asset: { version: '2.0', generator: 'bedroom-splitter', extras: { ...g.asset.extras, part: info.name, sourceFile: path.basename(SRC) } },
    scene: 0, scenes: [{ nodes: [0] }],
    nodes: [], meshes: [], materials: [], textures: [], images: [], samplers: [],
    accessors: [], bufferViews: [], buffers: []
  };
  const chunks = []; let byteLen = 0;
  const pushData = (buf) => {
    const off = byteLen;
    chunks.push(buf);
    byteLen += buf.length;
    const pad = align4(byteLen) - byteLen;
    if (pad) { chunks.push(Buffer.alloc(pad)); byteLen += pad; }
    return off;
  };

  const mapAcc = new Map(), mapMat = new Map(), mapTex = new Map(), mapImg = new Map(), mapSmp = new Map();

  function copyAccessor(ai) {
    if (mapAcc.has(ai)) return mapAcc.get(ai);
    const a = g.accessors[ai];
    const bv = g.bufferViews[a.bufferView];
    const cs = COMP_SIZE[a.componentType], nc = NUM_COMP[a.type], elem = cs * nc;
    const stride = bv.byteStride || elem;              // de-interleave into a tightly packed view
    const base = (bv.byteOffset || 0) + (a.byteOffset || 0);
    const dst = Buffer.allocUnsafe(elem * a.count);
    for (let i = 0; i < a.count; i++) bin.copy(dst, i * elem, base + i * stride, base + i * stride + elem);
    const off = pushData(dst);
    const bvi = out.bufferViews.push({ buffer: 0, byteOffset: off, byteLength: dst.length, ...(bv.target ? { target: bv.target } : {}) }) - 1;
    const ni = out.accessors.push({
      bufferView: bvi, componentType: a.componentType, count: a.count, type: a.type,
      ...(a.min ? { min: a.min } : {}), ...(a.max ? { max: a.max } : {}), ...(a.normalized ? { normalized: true } : {})
    }) - 1;
    mapAcc.set(ai, ni);
    return ni;
  }

  async function copyMaterial(mi) {
    if (mapMat.has(mi)) return mapMat.get(mi);
    for (const ti of collectTextures(mi)) {
      if (mapTex.has(ti)) continue;
      const t = g.textures[ti];
      if (!mapImg.has(t.source)) {
        const { buf, mime } = await getImage(t.source);
        const off = pushData(buf);
        const bvi = out.bufferViews.push({ buffer: 0, byteOffset: off, byteLength: buf.length }) - 1;
        mapImg.set(t.source, out.images.push({ bufferView: bvi, mimeType: mime }) - 1);
      }
      if (t.sampler !== undefined && !mapSmp.has(t.sampler)) mapSmp.set(t.sampler, out.samplers.push({ ...g.samplers[t.sampler] }) - 1);
      mapTex.set(ti, out.textures.push({ source: mapImg.get(t.source), ...(t.sampler !== undefined ? { sampler: mapSmp.get(t.sampler) } : {}) }) - 1);
    }
    const ni = out.materials.push(remapTexRefs(g.materials[mi], mapTex, 'material')) - 1;
    mapMat.set(mi, ni);
    return ni;
  }

  const meshCache = new Map();
  async function copyMesh(mi) {
    if (meshCache.has(mi)) return meshCache.get(mi);
    const m = g.meshes[mi];
    const prims = [];
    for (const p of m.primitives) {
      const attributes = {};
      for (const k of Object.keys(p.attributes)) attributes[k] = copyAccessor(p.attributes[k]);
      prims.push({
        attributes,
        ...(p.indices !== undefined ? { indices: copyAccessor(p.indices) } : {}),
        ...(p.material !== undefined ? { material: await copyMaterial(p.material) } : {}),
        ...(p.mode !== undefined ? { mode: p.mode } : {})
      });
    }
    const ni = out.meshes.push({ ...(m.name ? { name: m.name } : {}), primitives: prims }) - 1;
    meshCache.set(mi, ni);
    return ni;
  }

  // root node shifts the part so its bounding-box centre sits on the origin
  out.nodes.push({ name: info.slug, matrix: [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, -center[0], -center[1], -center[2], 1], children: [] });

  async function copyNode(ni, useWorldMatrix) {
    const n = g.nodes[ni];
    const node = { ...(n.name ? { name: n.name } : {}) };
    if (useWorldMatrix) node.matrix = world[ni].slice();   // bake the whole parent chain into the part root
    else if (n.matrix) node.matrix = n.matrix.slice();
    else {
      if (n.translation) node.translation = n.translation.slice();
      if (n.rotation) node.rotation = n.rotation.slice();
      if (n.scale) node.scale = n.scale.slice();
    }
    if (n.mesh !== undefined) node.mesh = await copyMesh(n.mesh);
    const idx = out.nodes.push(node) - 1;
    if (n.children && n.children.length) {
      node.children = [];
      for (const c of n.children) node.children.push(await copyNode(c, false));
    }
    return idx;
  }

  for (const m of cl.members) out.nodes[0].children.push(await copyNode(m.node, true));

  const usedExt = new Set();
  const matStr = JSON.stringify(out.materials);
  for (const ext of (g.extensionsUsed || [])) if (matStr.includes(ext)) usedExt.add(ext);
  if (usedExt.size) out.extensionsUsed = [...usedExt];
  out.buffers.push({ byteLength: byteLen });

  const binChunk = Buffer.concat(chunks, byteLen);
  const jsonBuf = Buffer.from(JSON.stringify(out), 'utf8');
  const jsonFinal = Buffer.concat([jsonBuf, Buffer.alloc(align4(jsonBuf.length) - jsonBuf.length, 0x20)]);
  const header = Buffer.alloc(12);
  header.writeUInt32LE(0x46546C67, 0); header.writeUInt32LE(2, 4);
  header.writeUInt32LE(12 + 8 + jsonFinal.length + 8 + binChunk.length, 8);
  const jh = Buffer.alloc(8); jh.writeUInt32LE(jsonFinal.length, 0); jh.writeUInt32LE(0x4E4F534A, 4);
  const bh = Buffer.alloc(8); bh.writeUInt32LE(binChunk.length, 0); bh.writeUInt32LE(0x004E4942, 4);
  const file = path.join(OUTDIR, info.slug + '.glb');
  fs.writeFileSync(file, Buffer.concat([header, jh, jsonFinal, bh, binChunk]));

  return {
    name: info.name, file: path.basename(file),
    position: center.map(v => +v.toFixed(4)),
    size: [0, 1, 2].map(a => +(cl.max[a] - cl.min[a]).toFixed(4)),
    bbox: { min: cl.min.map(v => +v.toFixed(4)), max: cl.max.map(v => +v.toFixed(4)) },
    triangles: cl.tris, bytes: fs.statSync(file).size,
    sourceNodes: cl.members.map(m => m.name)
  };
}

const ONLY = process.env.PARTS ? new Set(process.env.PARTS.split(',').map(x => x.trim())) : null;
const manifest = [];
for (let i = 0; i < clusters.length; i++) {
  if (ONLY && !ONLY.has(names[i].slug)) continue;
  const r = await exportCluster(i);
  manifest.push(r);
  console.log(`${String(i).padStart(2)} ${r.file.padEnd(30)} ${(r.bytes / 1048576).toFixed(2)}MB  tris=${r.triangles}`);
}
// lights / empty helper nodes from the original scene, kept as placement data only
const empties = JSON.parse(fs.readFileSync(SP + '/empties.json', 'utf8')).map(e => ({
  name: e.name, position: [world[e.node][12], world[e.node][13], world[e.node][14]].map(v => +v.toFixed(4))
}));
fs.writeFileSync(path.join(OUTDIR, 'manifest.json'), JSON.stringify({
  source: path.basename(SRC),
  note: 'Each part GLB is centred on its bounding-box centre. Load it and set object.position = part.position to rebuild the original room.',
  credit: g.asset.extras,
  parts: manifest, emptyNodes: empties
}, null, 1));
console.log('\ntotal', (manifest.reduce((s, m) => s + m.bytes, 0) / 1048576).toFixed(1), 'MB in', manifest.length, 'files');
