// Game-ready pass over the split parts: weld + decimate to a triangle budget, then prune.
// Textures are already handled by export.mjs (MAX_TEX / JPEG_Q).
import fs from 'fs'; import path from 'path';
import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { weld, simplify, dedup, prune } from '@gltf-transform/functions';
import { MeshoptSimplifier } from 'meshoptimizer';

const DIR = process.argv[2] || 'models/bedroom';

// target triangle budget per part; anything not listed is left untouched
const BUDGET = {
  'alarm-clock': 4000,
  'desk-pen-holder': 6000,
  'toy-car': 7000,
  'office-chair': 9000,
  'plant-monstera-pot': 12000,
  'plant-pothos-hanging': 8000,
  'keyboard': 4000,
  'cup-blue': 2500,
  'cup-red': 2500,
  'plant-ficus-desk': 5000,
  'table-lamp': 3000,
  'mouse': 1500,
  'wardrobe': 6000,
  'toy-octopus': 1200,
  'toy-penguin': 1200
};

await MeshoptSimplifier.ready;
const io = new NodeIO().registerExtensions(ALL_EXTENSIONS);   // keep KHR_texture_transform et al.

// gltf-transform's weld() only merges bitwise-identical vertices. This model comes out of an
// FBX pipeline with every triangle as its own island, so nothing welds and meshopt has no edge
// to collapse. Snapping attributes to a grid first makes the geometry connected again.
function spatialWeld(doc, posEps = 1e-4, nrmEps = 0.02, uvEps = 1e-4) {
  for (const mesh of doc.getRoot().listMeshes()) {
    for (const prim of mesh.listPrimitives()) {
      const pos = prim.getAttribute('POSITION');
      if (!pos) continue;
      const semantics = prim.listSemantics();
      const attrs = semantics.map(s => prim.getAttribute(s));
      const srcIdx = prim.getIndices();
      const count = pos.getCount();
      const indices = srcIdx ? Array.from(srcIdx.getArray()) : Array.from({ length: count }, (_, i) => i);

      const epsFor = s => s === 'POSITION' ? posEps : s === 'NORMAL' ? nrmEps : uvEps;
      const el = attrs.map(a => a.getElementSize());
      const arrays = attrs.map(a => a.getArray());
      const keyOf = (v) => semantics.map((s, ai) => {
        const e = epsFor(s), n = el[ai], off = v * n, out = new Array(n);
        for (let c = 0; c < n; c++) out[c] = Math.round(arrays[ai][off + c] / e);
        return out.join(',');
      }).join('|');

      const seen = new Map(), remap = new Int32Array(count).fill(-1);
      let next = 0;
      for (let v = 0; v < count; v++) {
        const k = keyOf(v);
        let id = seen.get(k);
        if (id === undefined) { id = next++; seen.set(k, id); }
        remap[v] = id;
      }
      if (next === count) continue;                       // nothing to merge

      for (let ai = 0; ai < attrs.length; ai++) {
        const n = el[ai], src = arrays[ai];
        const dst = new src.constructor(next * n);
        for (let v = 0; v < count; v++) {
          const to = remap[v] * n, from = v * n;
          for (let c = 0; c < n; c++) dst[to + c] = src[from + c];
        }
        attrs[ai].setArray(dst);
      }
      const newIdx = new Uint32Array(indices.length);
      for (let i = 0; i < indices.length; i++) newIdx[i] = remap[indices[i]];
      if (srcIdx) srcIdx.setArray(newIdx);
      else prim.setIndices(doc.createAccessor().setArray(newIdx).setBuffer(doc.getRoot().listBuffers()[0]));
    }
  }
}

function triCount(doc) {
  let t = 0;
  for (const mesh of doc.getRoot().listMeshes()) {
    for (const prim of mesh.listPrimitives()) {
      const idx = prim.getIndices();
      t += (idx ? idx.getCount() : prim.getAttribute('POSITION').getCount()) / 3;
    }
  }
  return Math.round(t);
}

const files = fs.readdirSync(DIR).filter(f => f.endsWith('.glb')).sort();
let before = 0, after = 0;
for (const f of files) {
  const slug = f.replace('.glb', '');
  const file = path.join(DIR, f);
  const sizeBefore = fs.statSync(file).size;
  const doc = await io.read(file);
  const tris = triCount(doc);
  const budget = BUDGET[slug];

  const transforms = [];
  if (budget && tris > budget) {
    spatialWeld(doc);
    transforms.push(weld());
    transforms.push(simplify({ simplifier: MeshoptSimplifier, ratio: budget / tris, error: 0.08, lockBorder: false }));
  }
  transforms.push(dedup(), prune({ keepAttributes: false }));
  await doc.transform(...transforms);

  await io.write(file, doc);
  const sizeAfter = fs.statSync(file).size;
  before += sizeBefore; after += sizeAfter;
  const mark = budget && tris > budget ? '↓' : ' ';
  console.log(`${mark} ${slug.padEnd(24)} ${String(tris).padStart(7)} → ${String(triCount(doc)).padStart(6)} tris   ` +
              `${(sizeBefore / 1048576).toFixed(2)} → ${(sizeAfter / 1048576).toFixed(2)} MB`);
}
console.log(`\ntotal ${(before / 1048576).toFixed(1)} → ${(after / 1048576).toFixed(1)} MB in ${files.length} files`);
