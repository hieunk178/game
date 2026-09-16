/**
 * ============================================================================
 * 3D INSPECTOR STUDIO (MODAL SECONDARY VIEWER)
 * ============================================================================
 */

/* global THREE */

export class InspectorStudio {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(40, 1, 0.1, 100);
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    this.objectGroup = new THREE.Group();
    this.scene.add(this.objectGroup);

    this.isAutoRotate = true;
    this.isDragging = false;
    this.prevMousePos = { x: 0, y: 0 };
    this.rotationVelocity = { x: 0, y: 0 };
    this.currentZoom = 5;

    // Chỉ render khi modal từ vựng đang mở — trước đây vòng lặp chạy 60fps
    // vĩnh viễn ở nền dù canvas bị ẩn, tốn GPU và pin trên di động.
    this.isActive = false;
    this._rafId = null;

    this.setupLighting();
    this.setupEvents();
    this.animate();
  }

  /** Bật/tắt vòng render của studio khi modal mở/đóng. */
  setActive(active) {
    this.isActive = !!active;
  }

  /** Bỏ bản sao đang trưng bày (gọi khi cảnh chính dispose geometry/material). */
  clearObject() {
    while (this.objectGroup.children.length > 0) {
      this.objectGroup.remove(this.objectGroup.children[0]);
    }
  }

  /** Giải phóng hẳn studio (dùng khi huỷ game). */
  dispose() {
    if (this._rafId !== null) cancelAnimationFrame(this._rafId);
    this._rafId = null;
    this.clearObject();
    this.renderer.dispose();
  }

  setupLighting() {
    const ambient = new THREE.AmbientLight(0xffffff, 0.7);
    this.scene.add(ambient);

    const keyLight = new THREE.DirectionalLight(0x38bdf8, 1.2);
    keyLight.position.set(5, 8, 5);
    keyLight.castShadow = true;
    this.scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0xffeedd, 0.8);
    fillLight.position.set(-5, 3, -5);
    this.scene.add(fillLight);

    // Studio pedestal shadow catcher
    const pedestalGeo = new THREE.CylinderGeometry(2, 2.2, 0.2, 32);
    const pedestalMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      roughness: 0.8,
      metalness: 0.2
    });
    const pedestal = new THREE.Mesh(pedestalGeo, pedestalMat);
    pedestal.position.y = -1.1;
    pedestal.receiveShadow = true;
    this.scene.add(pedestal);
  }

  setupEvents() {
    const el = this.canvas;
    const onDown = (clientX, clientY) => {
      this.isDragging = true;
      this.prevMousePos = { x: clientX, y: clientY };
      this.rotationVelocity = { x: 0, y: 0 };
    };

    const onMove = (clientX, clientY) => {
      if (!this.isDragging) return;
      const dx = clientX - this.prevMousePos.x;
      const dy = clientY - this.prevMousePos.y;
      this.prevMousePos = { x: clientX, y: clientY };

      this.objectGroup.rotation.y += dx * 0.012;
      this.objectGroup.rotation.x += dy * 0.012;
      this.rotationVelocity = { x: dy * 0.005, y: dx * 0.005 };
    };

    const onUp = () => {
      this.isDragging = false;
    };

    el.addEventListener('mousedown', e => onDown(e.clientX, e.clientY));
    window.addEventListener('mousemove', e => onMove(e.clientX, e.clientY));
    window.addEventListener('mouseup', onUp);

    el.addEventListener('touchstart', e => {
      if (e.touches.length === 1) {
        onDown(e.touches[0].clientX, e.touches[0].clientY);
      }
    }, { passive: true });

    window.addEventListener('touchmove', e => {
      if (e.touches.length === 1) {
        onMove(e.touches[0].clientX, e.touches[0].clientY);
      }
    }, { passive: true });

    window.addEventListener('touchend', onUp);

    el.addEventListener('wheel', e => {
      e.preventDefault();
      this.currentZoom = THREE.MathUtils.clamp(this.currentZoom + e.deltaY * 0.005, 2.5, 9);
      this.updateCameraPos();
    }, { passive: false });
  }

  updateCameraPos() {
    this.camera.position.set(0, 1.2, this.currentZoom);
    this.camera.lookAt(0, 0, 0);
  }

  showObject(objectFactoryFn) {
    this.clearObject();

    // Generate isolated clone mesh
    const mesh = objectFactoryFn();
    // Center and scale normalized
    const box = new THREE.Box3().setFromObject(mesh);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());

    const maxDim = Math.max(size.x, size.y, size.z) || 1;
    const scale = 2.0 / maxDim;
    mesh.scale.set(scale, scale, scale);
    mesh.position.sub(center.multiplyScalar(scale));

    this.objectGroup.add(mesh);
    this.objectGroup.rotation.set(0.15, 0.4, 0);
    this.currentZoom = 4.2;
    this.updateCameraPos();
    this.resize();
  }

  // Thẻ 3D thay thế khi từ vựng thuộc khu vực khác (mô hình chưa được dựng)
  showPlaceholder(item) {
    this.showObject(() => {
      const group = new THREE.Group();

      const canvas = document.createElement('canvas');
      canvas.width = canvas.height = 512;
      const ctx = canvas.getContext('2d');
      const grad = ctx.createLinearGradient(0, 0, 512, 512);
      grad.addColorStop(0, '#1e293b');
      grad.addColorStop(1, '#0f172a');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 512, 512);
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 10;
      ctx.strokeRect(22, 22, 468, 468);
      ctx.textAlign = 'center';
      ctx.font = '150px serif';
      ctx.fillText(item.icon || '📦', 256, 210);
      ctx.fillStyle = '#f8fafc';
      ctx.font = 'bold 128px serif';
      ctx.fillText(item.chinese || '', 256, 350);
      ctx.fillStyle = '#7dd3fc';
      ctx.font = '52px sans-serif';
      ctx.fillText(item.pinyin || '', 256, 420);

      const tex = new THREE.CanvasTexture(canvas);
      const faceMat = new THREE.MeshStandardMaterial({ map: tex, roughness: 0.45 });
      const sideMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.55, metalness: 0.25 });
      const card = new THREE.Mesh(
        new THREE.BoxGeometry(2, 2, 0.22),
        [sideMat, sideMat, sideMat, sideMat, faceMat, faceMat]
      );
      card.castShadow = true;
      group.add(card);
      return group;
    });
  }

  resetView() {
    this.objectGroup.rotation.set(0.15, 0.4, 0);
    this.currentZoom = 4.2;
    this.updateCameraPos();
  }

  toggleAutoRotate() {
    this.isAutoRotate = !this.isAutoRotate;
    return this.isAutoRotate;
  }

  resize() {
    const rect = this.canvas.parentElement.getBoundingClientRect();
    const w = rect.width || 360;
    const h = rect.height || 280;
    this.renderer.setSize(w, h, false);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
  }

  animate() {
    this._rafId = requestAnimationFrame(() => this.animate());

    if (!this.isActive) return;

    if (this.isAutoRotate && !this.isDragging) {
      this.objectGroup.rotation.y += 0.008;
    } else if (!this.isDragging) {
      this.objectGroup.rotation.y += this.rotationVelocity.y;
      this.objectGroup.rotation.x += this.rotationVelocity.x;
      this.rotationVelocity.y *= 0.92;
      this.rotationVelocity.x *= 0.92;
    }

    this.renderer.render(this.scene, this.camera);
  }
}
