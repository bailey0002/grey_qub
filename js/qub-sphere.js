// Animated 3D Bloch Axis mark for the hero. Progressive enhancement:
// the static SVG in #stageFallback stays visible until this successfully
// boots a WebGL scene, and stays visible forever if it can't (no WebGL,
// import failure, etc).
(async function () {
  const container = document.getElementById('qub-sphere');
  const fallback = document.getElementById('stageFallback');
  if (!container) return;

  function useFallback() {
    container.hidden = true;
  }

  let THREE;
  try {
    THREE = await import('./vendor/three.module.min.js');
  } catch (err) {
    useFallback();
    return;
  }

  let renderer;
  try {
    const scene = new THREE.Scene();
    // Camera sits back further than the tightest fit around the cube's
    // corners (radius sqrt(3) at fov 32deg) so the silhouette never
    // clips the frame as the whole group spins about the diagonal axis
    // — the projected extent varies with orientation since the camera
    // doesn't look straight down that axis.
    const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 100);
    camera.position.set(0, 0, 7.6);
    camera.lookAt(0, 0, 0);

    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    scene.add(new THREE.AmbientLight(0xffffff, 0.75));
    const key = new THREE.DirectionalLight(0xffffff, 1.0);
    key.position.set(3, 4, 5);
    scene.add(key);
    const fill = new THREE.DirectionalLight(0xffffff, 0.35);
    fill.position.set(-4, -2, -3);
    scene.add(fill);

    const group = new THREE.Group();
    scene.add(group);

    const cubeGeo = new THREE.BoxGeometry(2, 2, 2);
    const edgesGeo = new THREE.EdgesGeometry(cubeGeo);
    const cubeMat = new THREE.LineBasicMaterial({ color: 0x9a9890, transparent: true, opacity: 0.55 });
    group.add(new THREE.LineSegments(edgesGeo, cubeMat));

    const sphereGeo = new THREE.SphereGeometry(0.99, 48, 48);
    const sphereMat = new THREE.MeshPhysicalMaterial({
      color: 0xf2f0e9, roughness: 0.35, metalness: 0.05,
      clearcoat: 0.5, clearcoatRoughness: 0.25, transparent: true, opacity: 0.9,
    });
    group.add(new THREE.Mesh(sphereGeo, sphereMat));

    const gridGeo = new THREE.SphereGeometry(1.001, 16, 12);
    const gridMat = new THREE.MeshBasicMaterial({ color: 0x8f8d86, wireframe: true, transparent: true, opacity: 0.22 });
    group.add(new THREE.Mesh(gridGeo, gridMat));

    const axisDir = new THREE.Vector3(1, 1, 1).normalize();
    const axisLength = 2 * Math.sqrt(3);
    const cylGeo = new THREE.CylinderGeometry(0.028, 0.028, axisLength, 16);
    const axisMat = new THREE.MeshBasicMaterial({ color: 0x5c7fa6 });
    const axisMesh = new THREE.Mesh(cylGeo, axisMat);
    axisMesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), axisDir);
    group.add(axisMesh);

    const dotMat = new THREE.MeshBasicMaterial({ color: 0x5c7fa6 });
    const dotGeo = new THREE.SphereGeometry(0.095, 20, 20);
    const dot1 = new THREE.Mesh(dotGeo, dotMat);
    dot1.position.copy(axisDir.clone().multiplyScalar(Math.sqrt(3)));
    const dot2 = new THREE.Mesh(dotGeo, dotMat);
    dot2.position.copy(axisDir.clone().multiplyScalar(-Math.sqrt(3)));
    group.add(dot1, dot2);

    const centerDot = new THREE.Mesh(
      new THREE.SphereGeometry(0.065, 20, 20),
      new THREE.MeshBasicMaterial({ color: 0x2a2a28 })
    );
    group.add(centerDot);

    group.rotation.x = -0.32;
    group.rotation.y = 0.55;

    function applyTheme(isDark) {
      cubeMat.color.set(isDark ? 0xc9c6bc : 0x9a9890);
      cubeMat.opacity = isDark ? 0.6 : 0.55;
      gridMat.color.set(isDark ? 0xbdbab0 : 0x8f8d86);
      gridMat.opacity = isDark ? 0.16 : 0.22;
      const accentColor = isDark ? 0x89a8c9 : 0x5c7fa6;
      axisMat.color.set(accentColor);
      dotMat.color.set(accentColor);
    }
    applyTheme(document.documentElement.getAttribute('data-theme') === 'dark');
    window.addEventListener('gq-theme-change', (e) => applyTheme(e.detail.theme === 'dark'));

    function resize() {
      const w = container.clientWidth;
      const h = container.clientHeight;
      if (w === 0 || h === 0) return;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h, false);
    }
    new ResizeObserver(resize).observe(container);
    resize();

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let isVisible = true;
    new IntersectionObserver(
      (entries) => { isVisible = entries[0].isIntersecting; },
      { threshold: 0 }
    ).observe(container);

    function animate() {
      if (isVisible && !prefersReducedMotion) {
        group.rotateOnWorldAxis(axisDir, 0.006);
      }
      renderer.render(scene, camera);
      requestAnimationFrame(animate);
    }
    animate();

    // Success — swap the static fallback out for the live canvas.
    if (fallback) fallback.hidden = true;
    container.hidden = false;
  } catch (err) {
    if (renderer) renderer.domElement.remove();
    useFallback();
  }
})();
