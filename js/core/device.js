/**
 * ============================================================================
 * DEVICE PROFILE & HARDWARE DETECTION
 * ============================================================================
 */

export const DEVICE = (() => {
  const ua = typeof navigator !== 'undefined' ? navigator.userAgent : '';
  const hasTouch = (typeof window !== 'undefined' && 'ontouchstart' in window) ||
                   (typeof navigator !== 'undefined' && (navigator.maxTouchPoints || 0) > 0);
  const uaMobile = /Android|iPhone|iPad|iPod|Windows Phone|webOS|BlackBerry/i.test(ua);
  const uaHasMobile = /Mobile/i.test(ua) && !/Windows NT|Macintosh|CrOS|Linux x86/i.test(ua);
  const isDesktopPlatform = /Windows NT|Macintosh|CrOS|Linux x86_64/i.test(ua);

  const screenW = typeof screen !== 'undefined' ? screen.width : 1920;
  const screenH = typeof screen !== 'undefined' ? screen.height : 1080;
  const shortSide = Math.min(screenW, screenH);
  const isMobile = uaMobile || uaHasMobile ||
                   (hasTouch && shortSide <= 768 && !isDesktopPlatform);

  const isPhone = isMobile && shortSide <= 520;
  const dpr = typeof window !== 'undefined' ? (window.devicePixelRatio || 1) : 1;

  // useTouchUI: quyết định GIAO DIỆN (joystick, nút cảm ứng, ẩn pointer lock)
  // = true CHỈ trên thiết bị di động thật sự, KHÔNG phải desktop có cảm ứng
  // hasTouch: cho biết thiết bị CÓ KHẢ NĂNG cảm ứng (dùng để đăng ký sự kiện touch)
  const useTouchUI = isMobile;

  return {
    hasTouch: hasTouch || uaMobile,
    useTouchUI,
    isMobile,
    isPhone,
    isDesktopPlatform,
    // Điện thoại: giảm độ phân giải render, tắt khử răng cưa, bóng đổ nhẹ hơn
    pixelRatio: isMobile ? Math.min(dpr, 1.5) : Math.min(dpr, 2),
    antialias: !isMobile,
    shadowMapSize: isMobile ? 1024 : 2048,
    softShadows: !isMobile,
    // GPU di động rất chậm khi shader phải lặp qua nhiều nguồn sáng
    maxPointLights: isMobile ? 6 : 64,
    ambientBoost: isMobile ? 1.28 : 1,
    // Bớt chi tiết trang trí ở cảnh ngoài trời
    detailLevel: isMobile ? 0.55 : 1
  };
})();

// Apply global helper classes to html root
if (DEVICE.hasTouch) document.documentElement.classList.add('is-touch');
if (DEVICE.useTouchUI) document.documentElement.classList.add('is-touch-ui');
if (DEVICE.isMobile) document.documentElement.classList.add('is-mobile');
if (DEVICE.isPhone) document.documentElement.classList.add('is-phone');
