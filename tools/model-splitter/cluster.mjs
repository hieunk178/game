import fs from 'fs';
import {loadGLB, buildWorld, groupInfo} from './lib.mjs';
const SP=process.argv[2];
const {json:g}=loadGLB('models/bedroom__modern_cozy_bedroom_interior.glb');
const {world}=buildWorld(g);
const rootIdx = g.nodes.findIndex(n=>n.name==='Empty.002');
const childList = g.nodes[rootIdx].children;
const groups = childList.map((ci,ci_i)=>({...groupInfo(g,world,ci), childIndex:ci_i}));
const meshed = groups.filter(x=>x.min);
const empties = groups.filter(x=>!x.min);

const dim = o=>[o.max[0]-o.min[0], o.max[1]-o.min[1], o.max[2]-o.min[2]];
const vol = o=>{const d=dim(o); return Math.max(d[0],0.01)*Math.max(d[1],0.01)*Math.max(d[2],0.01);};
const maxd = o=>Math.max(...dim(o));
const ARCH = 3.0;                     // objects bigger than this stay standalone (walls/floor/ceiling/window/curtain)
const isArch = o=>maxd(o)>=ARCH;

function interVol(a,b,inf=0){
  let v=1;
  for(let i=0;i<3;i++){
    const lo=Math.max(a.min[i]-inf,b.min[i]-inf), hi=Math.min(a.max[i]+inf,b.max[i]+inf);
    if(hi<=lo) return 0; v*=(hi-lo);
  }
  return v;
}
const center=o=>[0,1,2].map(i=>(o.min[i]+o.max[i])/2);
const dist=(a,b)=>{const ca=center(a),cb=center(b);return Math.hypot(ca[0]-cb[0],ca[1]-cb[1],ca[2]-cb[2]);};

const par=meshed.map((_,i)=>i);
const find=x=>{while(par[x]!==x){par[x]=par[par[x]];x=par[x];}return x;};
const uni=(a,b)=>{a=find(a);b=find(b);if(a!==b)par[b]=a;};

for(let i=0;i<meshed.length;i++) for(let j=i+1;j<meshed.length;j++){
  const A=meshed[i],B=meshed[j];
  if(isArch(A)||isArch(B)) continue;
  const iv=interVol(A,B,0.01);
  if(iv<=0) continue;
  const ratio = iv/Math.min(vol(A),vol(B));
  const near = dist(A,B) < 0.5*Math.max(maxd(A),maxd(B));
  const sizeRatio = Math.max(maxd(A),maxd(B))/Math.max(Math.min(maxd(A),maxd(B)),1e-4);
  const tinyPart = Math.min(maxd(A),maxd(B)) < 0.12 && ratio > 0.8;   // screws/knobs swallowed by their host
  if(ratio>0.15 && near && (sizeRatio<=3 || tinyPart)) uni(i,j);
}
const clusters=new Map();
meshed.forEach((o,i)=>{const r=find(i); if(!clusters.has(r))clusters.set(r,[]); clusters.get(r).push(o);});
const out=[...clusters.values()].map(members=>{
  const min=[1e30,1e30,1e30],max=[-1e30,-1e30,-1e30];
  members.forEach(m=>{for(let a=0;a<3;a++){min[a]=Math.min(min[a],m.min[a]);max[a]=Math.max(max[a],m.max[a]);}});
  return {members, min, max, tris:members.reduce((s,m)=>s+m.tris,0)};
});
out.sort((a,b)=>b.tris-a.tris);
console.log('clusters:',out.length,'(from',meshed.length,'mesh groups) + empties',empties.length);
out.forEach((c,i)=>{
  const d=[0,1,2].map(a=>+(c.max[a]-c.min[a]).toFixed(2));
  const ct=[0,1,2].map(a=>+((c.max[a]+c.min[a])/2).toFixed(2));
  console.log(`[${i}] n=${c.members.length} tris=${c.tris} size=${d} center=${ct} :: ${c.members.map(m=>m.name).join(', ').slice(0,160)}`);
});
fs.writeFileSync(SP+'/clusters.json', JSON.stringify(out.map(c=>({tris:c.tris,min:c.min,max:c.max,
  members:c.members.map(m=>({node:m.node,childIndex:m.childIndex,name:m.name,tris:m.tris}))})),null,1));
fs.writeFileSync(SP+'/empties.json', JSON.stringify(empties.map(e=>({node:e.node,name:e.name})),null,1));
