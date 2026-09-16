# 3D Vocab Quest

Game học từ vựng tiếng Hoa qua việc khám phá không gian 3D và tương tác với các đồ vật, nhân vật trong game.

## Yêu cầu

- Node.js 18+
- pnpm
- Python 3 (để chạy máy chủ tĩnh)

## Chạy game

Cài dependencies:

```powershell
pnpm install
```

Khởi động máy chủ phát triển:

```powershell
pnpm run serve
```

Mở [http://localhost:8080](http://localhost:8080). Có thể truyền cổng khác bằng `python serve.py 5173`.

## Kiểm tra

Chạy bộ test chính:

```powershell
pnpm test
```

Chạy kiểm tra runtime riêng:

```powershell
pnpm run test:runtime
```

## Cấu trúc chính

- `index.html`, `style.css`: giao diện game.
- `js/`: game engine, state, dữ liệu, scene và UI.
- `models/`: model 3D và manifest asset.
- `tools/model-splitter/`: công cụ xử lý và preview model 3D.
- `serve.py`: static server có hỗ trợ gzip, MIME cho `.glb` và truy cập trong mạng LAN.
