// Final part plan: maps every top-level group of the bedroom scene to a named part.
// Auto spatial clustering (cluster.mjs) produced the first draft; the groups below are the
// hand-checked result after rendering each cluster (see tools/model-splitter/preview/).
import fs from 'fs';
import { loadGLB, buildWorld, groupInfo } from './lib.mjs';

const SP = process.argv[2];
const SRC = 'models/bedroom__modern_cozy_bedroom_interior.glb';

// name -> group names. "Cylinder.001-032" is shorthand for a numbered range.
const PLAN = {
  'bed':                 ['Plane.001_Material_0.001'],
  'desk':                ['Cube.010', 'Cube.011', 'Cube.013'],
  'desk-pen-holder':     ['Cylinder.001-032'],
  'keyboard':            ['keyboard.003'],
  'mouse':               ['mouse.002'],
  'mouse-pad':           ['Model'],
  'monitor':             ['Cube.022', 'Cube.024'],
  'alarm-clock':         ['Sphere', 'Plane.001', 'Cylinder.033', 'Cube.023', 'Cube.025',
                          'Text', 'Text.001', 'Text.002', 'Text.003', 'Text.004'],
  'office-chair':        ['Box01_Lether_0'],
  'wardrobe':            ['Cube.016', 'Cube.017', 'Cube.018', 'Cube.019', 'Cube.020', 'Cube.021',
                          'Sketchfab Model.008'],
  'wall-shelf':          ['Cube.007', 'Cube.008', 'Cube.009'],
  'nightstand-cube-1':   ['Cube.012'],
  'nightstand-cube-2':   ['Cube.015'],
  'table-lamp':          ['Object_4'],
  'light-switch-panel':  ['Object_4.001'],
  'ceiling-fan':         ['Ceiling Fan_ssivet_0'],
  'ceiling-light-cove':  ['For light'],
  'led-strip-left':      ['Sketchfab Model.004'],
  'led-strip-right':     ['Sketchfab Model.005'],
  'led-strip-front':     ['Sketchfab Model.006'],
  'led-strip-back':      ['Sketchfab Model.007'],
  'window':              ['Window_PVC_0', 'Window_Plastic_0', 'Window_Glass_0', 'Window_Marble_0'],
  'curtain-tied':        ['*urtain tied_Curtain_0'],
  'curtain':             ['*urtain_Curtain_0'],
  'curtain-rail':        ['Cube.003'],
  'painting-portrait':   ['Painting'],
  'painting-dark':       ['Painting.001'],
  'plant-monstera-pot':  ['Vase', 'Plastic pot', 'Soil', 'Leaf1.002', 'Leaf1.003', 'Leaf2.002',
                          'Leaf3', 'Leaf4', 'Leaf5', 'Leaf6.002', 'Stem2',
                          'stem1', 'stem1.001', 'stem3', 'stem4', 'stem5', 'stem6'],
  'plant-pothos-hanging':['epipremnum pinnatum'],
  'plant-ficus-desk':    ['Collection indoor plant 251 ficus lyrata monstera palm _4642d3a'],
  'plant-bush-small':    ['Outdoor Garden set bush and Tree - Garden Set 54_25.001'],
  'books-stack-1':       ['book13'],
  'books-stack-2':       ['book13.001'],
  'books-stack-3':       ['book13.002'],
  'book-open':           ['Bodies Book.'],
  'book-thin':           ['book04.002'],
  'toy-car':             ['cotxe base'],
  'toy-octopus':         ['Terrified Alien Octopus Toy.001'],
  'toy-penguin':         ['Penguin Toy -3DPrint'],
  'toy-rocket':          ['Toy Rocket'],
  'cup-blue':            ['Sphere.001'],
  'cup-red':             ['Sphere.002'],
  'wall-hoop-decor':     ['Cylinder'],
  'knob-small':          ['Cube.014'],
  'floor':               ['Cube.004'],
  'rug':                 ['Plane'],
  'wall-side':           ['Plane.002'],
  'wall-partition':      ['Cube.005'],
  'baseboard':           ['Cube.006'],
  'ceiling':             ['Plane.003'],
  'ceiling-panel':       ['Cube.002'],
};

const { json: g } = loadGLB(SRC);
const { world } = buildWorld(g);
const rootIdx = g.nodes.findIndex(n => n.name === 'Empty.002');
const groups = g.nodes[rootIdx].children.map((ci, i) => ({ ...groupInfo(g, world, ci), childIndex: i }));
const byName = new Map(groups.map(x => [x.name, x]));

function resolve(pattern) {
  const range = pattern.match(/^(.*?)\.(\d+)-(\d+)$/);
  if (range) {
    const out = [];
    for (let i = +range[2]; i <= +range[3]; i++) {
      const n = `${range[1]}.${String(i).padStart(range[2].length, '0')}`;
      if (byName.has(n)) out.push(n);
    }
    return out;
  }
  if (pattern.startsWith('*')) {
    const suffix = pattern.slice(1);
    return groups.filter(x => x.name.endsWith(suffix)).map(x => x.name);
  }
  return byName.has(pattern) ? [pattern] : [];
}

const used = new Set();
const clusters = [], names = [];
for (const [slug, patterns] of Object.entries(PLAN)) {
  const members = [];
  for (const p of patterns) {
    const hits = resolve(p);
    if (!hits.length) throw new Error(`plan entry "${slug}": pattern "${p}" matched no group`);
    for (const n of hits) {
      if (used.has(n)) throw new Error(`group "${n}" assigned twice (last: ${slug})`);
      used.add(n); members.push(byName.get(n));
    }
  }
  const min = [1e30, 1e30, 1e30], max = [-1e30, -1e30, -1e30];
  members.forEach(m => { for (let a = 0; a < 3; a++) { min[a] = Math.min(min[a], m.min[a]); max[a] = Math.max(max[a], m.max[a]); } });
  clusters.push({ tris: members.reduce((s, m) => s + m.tris, 0), min, max,
                  members: members.map(m => ({ node: m.node, childIndex: m.childIndex, name: m.name, tris: m.tris })) });
  names.push({ name: slug, slug });
}

const meshed = groups.filter(x => x.min);
const missing = meshed.filter(x => !used.has(x.name));
if (missing.length) throw new Error('groups not covered by the plan: ' + missing.map(m => m.name).join(', '));

fs.writeFileSync(SP + '/clusters.json', JSON.stringify(clusters, null, 1));
fs.writeFileSync(SP + '/names.json', JSON.stringify(names, null, 1));
fs.writeFileSync(SP + '/empties.json', JSON.stringify(groups.filter(x => !x.min).map(e => ({ node: e.node, name: e.name })), null, 1));
console.log(`plan: ${clusters.length} parts covering ${meshed.length} mesh groups, ${groups.length - meshed.length} empty nodes`);
clusters.forEach((c, i) => console.log(`  ${names[i].slug.padEnd(24)} groups=${String(c.members.length).padStart(2)} tris=${c.tris}`));
