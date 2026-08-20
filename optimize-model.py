#!/usr/bin/env python3
"""
Giảm dung lượng file .glb cho web.

Làm hai việc:
  1. Bỏ morph target (blend shape) — model nhân vật Polygonal Mind mang theo 19
     morph biểu cảm khuôn mặt mà game không dùng, mỗi cái là một mảng vị trí đầy
     đủ nên chiếm khoảng 2/3 dung lượng file.
  2. Nén lại texture nhúng — atlas màu phẳng 1024x1024 PNG-24 được hạ xuống
     512x512 PNG bảng màu 256 màu, nhìn gần như không khác.

Dùng:
    python3 optimize-model.py "models/Man by Polygonal Mind - nbLBTJMg0b.glb" models/player-man.glb
    python3 optimize-model.py <nguồn.glb> <đích.glb> --tex 512     # đổi kích thước texture
    python3 optimize-model.py <nguồn.glb> <đích.glb> --keep-morphs # chỉ nén texture

Cần: pip install pillow
"""
import io
import json
import struct
import sys

JSON_CHUNK = 0x4E4F534A
BIN_CHUNK = 0x004E4942


def pad4(n):
    return (4 - (n % 4)) % 4


def read_glb(data):
    off, js, binc = 12, None, None
    while off < len(data):
        length = struct.unpack_from('<I', data, off)[0]
        ctype = struct.unpack_from('<I', data, off + 4)[0]
        chunk = data[off + 8: off + 8 + length]
        if ctype == JSON_CHUNK:
            js = json.loads(chunk.decode('utf8'))
        elif ctype == BIN_CHUNK:
            binc = chunk
        off += 8 + length + pad4(length)
    return js, binc


def write_glb(js, binc):
    jb = json.dumps(js, separators=(',', ':')).encode('utf8')
    jb += b' ' * pad4(len(jb))
    bb = binc + b'\x00' * pad4(len(binc))
    header = struct.pack('<III', 0x46546C67, 2, 12 + 8 + len(jb) + 8 + len(bb))
    return (header
            + struct.pack('<II', len(jb), JSON_CHUNK) + jb
            + struct.pack('<II', len(bb), BIN_CHUNK) + bb)


def shrink_texture(raw, size):
    try:
        from PIL import Image
    except ImportError:
        print('  (bỏ qua nén texture: chưa cài Pillow — chạy "pip3 install pillow")')
        return None
    im = Image.open(io.BytesIO(raw)).convert('RGB')
    if im.width > size or im.height > size:
        # NEAREST giữ nguyên các mảng màu phẳng, không làm nhoè ranh giới UV
        im = im.resize((min(size, im.width), min(size, im.height)), Image.NEAREST)
    pal = im.convert('P', palette=Image.ADAPTIVE, colors=256)
    out = io.BytesIO()
    pal.save(out, 'PNG', optimize=True)
    return out.getvalue()


def optimize(src, dst, tex_size=512, strip_morphs=True):
    raw = open(src, 'rb').read()
    js, binc = read_glb(raw)
    if js is None or binc is None:
        raise SystemExit('Không đọc được GLB (thiếu chunk JSON hoặc BIN)')

    removed = 0
    if strip_morphs:
        for mesh in js.get('meshes', []):
            for prim in mesh.get('primitives', []):
                if 'targets' in prim:
                    removed += len(prim['targets'])
                    del prim['targets']
            mesh.pop('weights', None)
            if isinstance(mesh.get('extras'), dict):
                mesh['extras'].pop('targetNames', None)
        for node in js.get('nodes', []):
            node.pop('weights', None)

    # Accessor nào còn được dùng
    used_acc = set()
    for mesh in js.get('meshes', []):
        for prim in mesh.get('primitives', []):
            if 'indices' in prim:
                used_acc.add(prim['indices'])
            used_acc.update(prim.get('attributes', {}).values())
    for skin in js.get('skins', []):
        if 'inverseBindMatrices' in skin:
            used_acc.add(skin['inverseBindMatrices'])
    for anim in js.get('animations', []):
        for smp in anim.get('samplers', []):
            used_acc.add(smp['input'])
            used_acc.add(smp['output'])

    # Nén lại texture nhúng
    new_images = {}
    for i, img in enumerate(js.get('images', [])):
        if 'bufferView' not in img:
            continue
        bv = js['bufferViews'][img['bufferView']]
        start = bv.get('byteOffset', 0)
        data = binc[start:start + bv['byteLength']]
        packed = shrink_texture(data, tex_size) if tex_size else None
        if packed and len(packed) < len(data):
            new_images[i] = packed
            print(f'  texture #{i}: {len(data)/1024:.0f} KB → {len(packed)/1024:.0f} KB')

    used_views = {js['accessors'][a]['bufferView'] for a in used_acc
                  if 'bufferView' in js['accessors'][a]}
    used_views |= {img['bufferView'] for img in js.get('images', []) if 'bufferView' in img}

    # Dựng lại buffer chỉ với dữ liệu còn dùng
    parts, cursor, view_map, new_views = [], 0, {}, []
    for old_idx in sorted(used_views):
        bv = js['bufferViews'][old_idx]
        img_idx = next((i for i, im in enumerate(js.get('images', []))
                        if im.get('bufferView') == old_idx), None)
        if img_idx is not None and img_idx in new_images:
            blob = new_images[img_idx]
        else:
            start = bv.get('byteOffset', 0)
            blob = binc[start:start + bv['byteLength']]

        gap = pad4(cursor)
        if gap:
            parts.append(b'\x00' * gap)
            cursor += gap
        nv = {'buffer': 0, 'byteOffset': cursor, 'byteLength': len(blob)}
        if 'byteStride' in bv:
            nv['byteStride'] = bv['byteStride']
        if 'target' in bv:
            nv['target'] = bv['target']
        view_map[old_idx] = len(new_views)
        new_views.append(nv)
        parts.append(blob)
        cursor += len(blob)

    acc_map, new_acc = {}, []
    for old_idx in sorted(used_acc):
        acc = dict(js['accessors'][old_idx])
        if 'bufferView' in acc:
            acc['bufferView'] = view_map[acc['bufferView']]
        acc_map[old_idx] = len(new_acc)
        new_acc.append(acc)

    for mesh in js.get('meshes', []):
        for prim in mesh.get('primitives', []):
            if 'indices' in prim:
                prim['indices'] = acc_map[prim['indices']]
            prim['attributes'] = {k: acc_map[v] for k, v in prim.get('attributes', {}).items()}
    for skin in js.get('skins', []):
        if 'inverseBindMatrices' in skin:
            skin['inverseBindMatrices'] = acc_map[skin['inverseBindMatrices']]
    for anim in js.get('animations', []):
        for smp in anim.get('samplers', []):
            smp['input'] = acc_map[smp['input']]
            smp['output'] = acc_map[smp['output']]
    for img in js.get('images', []):
        if 'bufferView' in img:
            img['bufferView'] = view_map[img['bufferView']]
            img['mimeType'] = 'image/png'

    js['accessors'] = new_acc
    js['bufferViews'] = new_views
    new_bin = b''.join(parts)
    js['buffers'] = [{'byteLength': len(new_bin)}]

    out = write_glb(js, new_bin)
    open(dst, 'wb').write(out)
    print(f'  bỏ {removed} morph target')
    print(f'  {len(raw)/1024:.0f} KB → {len(out)/1024:.0f} KB '
          f'(giảm {100 - len(out) / len(raw) * 100:.0f}%)\n')


if __name__ == '__main__':
    args = [a for a in sys.argv[1:] if not a.startswith('--')]
    if len(args) < 2:
        raise SystemExit('Dùng: python3 optimize-model.py <nguồn.glb> <đích.glb> [--tex 512] [--keep-morphs]')
    tex = 512
    if '--tex' in sys.argv:
        tex = int(sys.argv[sys.argv.index('--tex') + 1])
    print(args[0])
    optimize(args[0], args[1], tex_size=tex, strip_morphs='--keep-morphs' not in sys.argv)
