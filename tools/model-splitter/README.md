# Bedroom model splitter

Tách `models/bedroom__modern_cozy_bedroom_interior.glb` (97MB, 1 file duy nhất) thành
**51 model rời** trong `models/bedroom_parts/`, kèm `manifest.json` để ghép lại nguyên phòng.

## Kết quả

| | Gốc | Sau khi tách |
|---|---|---|
| Số file | 1 | 51 `.glb` + manifest |
| Tổng dung lượng | 92.7 MB | 65.2 MB |
| Texture | 35.5 MB (84 ảnh PNG/JPEG tới 2.4MB) | 7.8 MB (resize ≤1024px, JPEG q82 / PNG khi có alpha) |
| Geometry | 57 MB | 57 MB (giữ nguyên, không giảm lưới) |

Ảnh từng part: `preview/*.png`, bảng tổng hợp: `preview/contact-sheet.png`.
So sánh gốc ↔ ghép lại: `preview/compare-{a,b,c}.png` (lệch 0.02% số mẫu màu).

## Cách dùng trong game

Mỗi part có **tâm bounding box nằm ở gốc toạ độ**, nên dùng độc lập được ngay
(đặt ở đâu cũng được). Muốn dựng lại đúng căn phòng gốc thì chỉ cần set `position`
theo manifest — không cần xoay/scale gì thêm:

```js
const manifest = await (await fetch('models/bedroom_parts/manifest.json')).json();
const loader = new THREE.GLTFLoader();
const room = new THREE.Group();

for (const part of manifest.parts) {
  loader.load(`models/bedroom_parts/${part.file}`, (gltf) => {
    gltf.scene.position.fromArray(part.position);   // vị trí gốc trong phòng
    gltf.scene.userData.part = part.name;
    room.add(gltf.scene);
  });
}
scene.add(room);
```

Mỗi entry trong `manifest.parts` có: `name`, `file`, `position`, `size`, `bbox`,
`triangles`, `bytes`, `sourceNodes` (tên node gốc trong file Sketchfab).
`manifest.emptyNodes` là 26 node rỗng của scene gốc (23 `Point` + 3 `Sun light`,
Blender empty — không mang dữ liệu đèn glTF), chỉ lưu toạ độ để tham khảo khi đặt đèn.

## Pipeline (chạy lại khi cần)

```bash
SP=<thư mục tạm>
node tools/model-splitter/cluster.mjs  $SP     # (tuỳ chọn) gom cụm tự động theo bbox -> bản nháp
node tools/model-splitter/plan.mjs     $SP     # bảng phân nhóm chốt -> clusters.json + names.json
node tools/model-splitter/export.mjs   $SP models/bedroom_parts
node tools/model-splitter/render-parts.mjs models/bedroom_parts tools/model-splitter/preview
node tools/model-splitter/verify.mjs           # đối chiếu ảnh gốc vs ảnh ghép lại
```

- `lib.mjs` — đọc GLB thô, tính ma trận world của từng node, gom thống kê theo nhóm.
- `cluster.mjs` — gom cụm tự động: hai nhóm nhập một khi bbox giao nhau >15% thể tích
  nhóm nhỏ hơn, kích thước chênh ≤3 lần, và vật > 3 đơn vị (tường/sàn/trần) luôn đứng riêng.
- `plan.mjs` — **nguồn sự thật**: bảng tên → danh sách node, đã soát bằng mắt qua ảnh render.
  Script báo lỗi nếu có node bị gán 2 lần hoặc bị bỏ sót, nên sửa bảng này là an toàn.
- `export.mjs` — dựng GLB con: chỉ copy accessor/material/texture thực sự dùng, bung
  interleave về dạng packed, nén ảnh bằng sharp (`MAX_TEX`, `JPEG_Q` chỉnh qua env).
- `three.min.js` + `GLTFLoader.js` (r128, đúng bản `index.html` đang dùng) để chạy render
  offline bằng puppeteer, không phụ thuộc CDN.
- Điểm cần biết: node gốc của mỗi part mang ma trận world đã bake sẵn (gồm cả phép
  xoay −90° và scale 12.536 của Sketchfab), node cha ngoài cùng dịch tâm về gốc toạ độ.

## Bộ asset dùng trong game: `models/bedroom/`

`models/bedroom_parts/` là bản lưu trữ đầy đủ (51 part, texture 1024). Bản **game-ready** nằm ở
`models/bedroom/`: 32 model đã lọc, texture 512 và giảm lưới — tổng **5.1 MB**.

```bash
SP=<thư mục tạm>
PARTS="bed,desk,office-chair,..." MAX_TEX=512 JPEG_Q=78   node tools/model-splitter/export.mjs $SP models/bedroom
node tools/model-splitter/optimize.mjs models/bedroom          # weld + decimate theo hạn mức tam giác
node tools/model-splitter/render-parts.mjs models/bedroom tools/model-splitter/preview-game
```

`optimize.mjs` có `spatialWeld()` chạy trước `simplify()`: model gốc xuất từ FBX có mỗi tam giác là
một đảo rời nên `weld()` của gltf-transform (chỉ gộp đỉnh trùng khít từng bit) không gộp được gì và
meshopt không có cạnh nào để thu gọn. Snap toạ độ/normal/UV về lưới rồi mới weld thì giảm lưới mới ăn:
`toy-car` 133k → 7k tam giác (4.4 → 0.24 MB), `office-chair` 36k → 9.4k.

Hai part **không** đưa vào game: `alarm-clock` (430k tam giác) và `desk-pen-holder` (318k). Lưới của
chúng vỡ vụn tới mức weld cũng không cứu được (chỉ giảm còn ~250k, 13 MB) nên phòng ngủ dùng đồng hồ
treo tường procedural thay thế.

## Phòng ngủ trong game

`js/scenes/bedroomScene.js` đã được thiết kế lại theo bố cục "góc gaming / streamer" và dùng bộ asset
trên (xem sơ đồ trong đầu file). Ảnh chụp trong game: `preview-room/*.png`, chụp lại bằng:

```bash
python serve.py 8099            # cửa sổ terminal khác
node tools/model-splitter/shoot-bedroom.mjs
```

Script dừng vòng lặp `animate()` (`isSceneVisible = false`) rồi tự đặt camera và render từng góc —
nếu không, `updatePlayer()` sẽ ghi đè camera ngay khung hình kế tiếp.

## Muốn nhẹ hơn nữa

(Phần dưới nói về bản lưu trữ `models/bedroom_parts/`, texture 1024 và chưa giảm lưới.)

Texture đã nén xong; phần còn lại là lưới. Hai vật chiếm 42/65 MB vì bị chia lưới quá dày:

| part | tam giác | dung lượng |
|---|---|---|
| `alarm-clock` | 429.963 | 25.6 MB |
| `desk-pen-holder` | 318.454 | 16.5 MB |
| `toy-car` | 133.538 | 4.6 MB |

Giảm lưới (meshoptimizer / gltf-transform `simplify`) 3 file này xuống ~20k tam giác
sẽ đưa tổng bộ về khoảng 20 MB mà nhìn gần như không khác.

## Nguồn

"Bedroom | Modern Cozy Bedroom Interior" — Model Wala (sketchfab.com/modelwala),
giấy phép CC-BY-4.0. Thông tin tác giả được giữ trong `asset.extras` của từng file con
và trong `manifest.credit`.
