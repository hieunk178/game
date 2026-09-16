import fs from 'fs';
export const I=[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1];
export function mul(a,b){const o=new Array(16);for(let c=0;c<4;c++)for(let r=0;r<4;r++){let s=0;for(let k=0;k<4;k++)s+=a[k*4+r]*b[c*4+k];o[c*4+r]=s;}return o;}
export function trs(n){
  if(n.matrix) return n.matrix.slice();
  const t=n.translation||[0,0,0], q=n.rotation||[0,0,0,1], s=n.scale||[1,1,1];
  const [x,y,z,w]=q, x2=x+x,y2=y+y,z2=z+z, xx=x*x2,xy=x*y2,xz=x*z2, yy=y*y2,yz=y*z2,zz=z*z2, wx=w*x2,wy=w*y2,wz=w*z2;
  return [(1-(yy+zz))*s[0],(xy+wz)*s[0],(xz-wy)*s[0],0,
          (xy-wz)*s[1],(1-(xx+zz))*s[1],(yz+wx)*s[1],0,
          (xz+wy)*s[2],(yz-wx)*s[2],(1-(xx+yy))*s[2],0,
          t[0],t[1],t[2],1];
}
export function xform(m,p){return [m[0]*p[0]+m[4]*p[1]+m[8]*p[2]+m[12], m[1]*p[0]+m[5]*p[1]+m[9]*p[2]+m[13], m[2]*p[0]+m[6]*p[1]+m[10]*p[2]+m[14]];}
export function loadGLB(file){
  const buf=fs.readFileSync(file);
  let off=12, json=null, bin=null;
  while(off<buf.length){
    const cl=buf.readUInt32LE(off), ct=buf.readUInt32LE(off+4);
    if(ct===0x4E4F534A) json=JSON.parse(buf.subarray(off+8,off+8+cl).toString('utf8'));
    else if(ct===0x004E4942) bin=buf.subarray(off+8,off+8+cl);
    off+=8+cl+((4-(cl%4))%4);
  }
  return {json,bin};
}
// world matrix of every node + parent map
export function buildWorld(g){
  const world=new Array(g.nodes.length), parent=new Array(g.nodes.length).fill(-1);
  const stack=g.scenes[g.scene||0].nodes.map(n=>[n,I]);
  while(stack.length){
    const [ni,m]=stack.pop(); const n=g.nodes[ni]; const w=mul(m,trs(n));
    world[ni]=w;
    for(const c of (n.children||[])){ parent[c]=ni; stack.push([c,w]); }
  }
  return {world,parent};
}
export function groupInfo(g, world, gi){
  let tris=0,verts=0; const mats=new Set(); const nodes=[];
  const bmin=[1e30,1e30,1e30], bmax=[-1e30,-1e30,-1e30];
  const stack=[gi];
  while(stack.length){
    const ni=stack.pop(); const n=g.nodes[ni]; nodes.push(ni);
    if(n.mesh!==undefined){
      for(const p of g.meshes[n.mesh].primitives){
        const pos=g.accessors[p.attributes.POSITION];
        verts+=pos.count; tris += p.indices!==undefined? g.accessors[p.indices].count/3 : pos.count/3;
        if(p.material!==undefined) mats.add(p.material);
        const mn=pos.min,mx=pos.max,m=world[ni];
        for(let k=0;k<8;k++){
          const w=xform(m,[k&1?mx[0]:mn[0], k&2?mx[1]:mn[1], k&4?mx[2]:mn[2]]);
          for(let a=0;a<3;a++){ if(w[a]<bmin[a])bmin[a]=w[a]; if(w[a]>bmax[a])bmax[a]=w[a]; }
        }
      }
    }
    for(const c of (n.children||[])) stack.push(c);
  }
  const has = bmin[0]<1e29;
  return {node:gi, name:g.nodes[gi].name, nodes, tris:Math.round(tris), verts,
          mats:[...mats], min:has?bmin:null, max:has?bmax:null};
}
