const Earth3D = {
  scene: null,
  camera: null,
  renderer: null,
  globe: null,
  clouds: null,
  glow: null,
  orbitRing: null,
  cityPoints: [],
  animId: null,
  isRunning: false,
  mouseX: 0,
  mouseY: 0,

  cityCoords: [
    { name: 'New York', lat: 40.7128, lng: -74.006, size: 1.2 },
    { name: 'London', lat: 51.5074, lng: -0.1278, size: 1.4 },
    { name: 'Tokyo', lat: 35.6762, lng: 139.6503, size: 1.3 },
    { name: 'Sydney', lat: -33.8688, lng: 151.2093, size: 1.0 },
    { name: 'Paris', lat: 48.8566, lng: 2.3522, size: 1.1 },
    { name: 'Dubai', lat: 25.2048, lng: 55.2708, size: 1.0 },
    { name: 'Singapore', lat: 1.3521, lng: 103.8198, size: 1.0 },
    { name: 'Mumbai', lat: 19.0760, lng: 72.8777, size: 1.2 },
    { name: 'Sao Paulo', lat: -23.5505, lng: -46.6333, size: 1.1 },
    { name: 'Cairo', lat: 30.0444, lng: 31.2357, size: 0.9 },
    { name: 'Moscow', lat: 55.7558, lng: 37.6173, size: 1.0 },
    { name: 'Los Angeles', lat: 34.0522, lng: -118.2437, size: 1.1 },
    { name: 'Beijing', lat: 39.9042, lng: 116.4074, size: 1.2 },
    { name: 'Istanbul', lat: 41.0082, lng: 28.9784, size: 0.9 },
    { name: 'Seoul', lat: 37.5665, lng: 126.978, size: 1.0 },
    { name: 'Mexico City', lat: 19.4326, lng: -99.1332, size: 1.0 },
    { name: 'Berlin', lat: 52.52, lng: 13.405, size: 0.9 },
    { name: 'Bangkok', lat: 13.7563, lng: 100.5018, size: 1.0 },
    { name: 'Lagos', lat: 6.5244, lng: 3.3792, size: 0.9 },
    { name: 'Buenos Aires', lat: -34.6037, lng: -58.3816, size: 0.9 },
  ],

  init(containerId) {
    const container = document.getElementById(containerId) || document.querySelector('.earth-container');
    if (!container) return;

    const w = container.clientWidth || 600;
    const h = container.clientHeight || 600;

    this.scene = new THREE.Scene();

    this.camera = new THREE.PerspectiveCamera(45, w / h, 0.1, 1000);
    this.camera.position.set(0, 0.5, 3.5);

    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setSize(w, h);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setClearColor(0x000000, 0);
    container.appendChild(this.renderer.domElement);

    this._createGlobe();
    this._createAtmosphere();
    this._createOrbitRing();
    this._createCityPoints();
    this._createParticles();
    this._createGridRing();

    window.addEventListener('resize', () => this._resize(container));
    container.addEventListener('mousemove', (e) => {
      const rect = container.getBoundingClientRect();
      this.mouseX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      this.mouseY = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    });

    this.isRunning = true;
    this._animate();
  },

  _latLngToPos(lat, lng, radius) {
    const phi = (90 - lat) * Math.PI / 180;
    const theta = (lng + 180) * Math.PI / 180;
    return new THREE.Vector3(
      -radius * Math.sin(phi) * Math.cos(theta),
      radius * Math.cos(phi),
      radius * Math.sin(phi) * Math.sin(theta)
    );
  },

  _createGlobe() {
    const geo = new THREE.SphereGeometry(1.2, 48, 48);
    const mat = new THREE.MeshPhongMaterial({
      color: 0x1a1a3e,
      emissive: 0x0a0a2e,
      wireframe: false,
      transparent: true,
      opacity: 0.9,
      shininess: 30,
    });
    this.globe = new THREE.Mesh(geo, mat);
    this.scene.add(this.globe);

    const wireGeo = new THREE.SphereGeometry(1.21, 24, 16);
    const wireMat = new THREE.MeshBasicMaterial({
      color: 0x6c5ce7,
      wireframe: true,
      transparent: true,
      opacity: 0.12,
    });
    const wireframe = new THREE.Mesh(wireGeo, wireMat);
    this.scene.add(wireframe);

    const light1 = new THREE.DirectionalLight(0xa29bfe, 1.2);
    light1.position.set(2, 3, 4);
    this.scene.add(light1);

    const light2 = new THREE.DirectionalLight(0x6c5ce7, 0.6);
    light2.position.set(-3, -1, -2);
    this.scene.add(light2);

    const ambient = new THREE.AmbientLight(0x222244, 0.5);
    this.scene.add(ambient);
  },

  _createAtmosphere() {
    const geo = new THREE.SphereGeometry(1.28, 32, 32);
    const mat = new THREE.MeshBasicMaterial({
      color: 0x6c5ce7,
      transparent: true,
      opacity: 0.08,
      side: THREE.BackSide,
    });
    this.glow = new THREE.Mesh(geo, mat);
    this.scene.add(this.glow);
  },

  _createOrbitRing() {
    const points = [];
    const segments = 64;
    for (let i = 0; i <= segments; i++) {
      const theta = (i / segments) * Math.PI * 2;
      const r = 1.8;
      points.push(new THREE.Vector3(Math.cos(theta) * r, 0, Math.sin(theta) * r));
    }
    const geo = new THREE.BufferGeometry().setFromPoints(points);
    const mat = new THREE.LineBasicMaterial({
      color: 0x6c5ce7,
      transparent: true,
      opacity: 0.15,
    });
    this.orbitRing = new THREE.Line(geo, mat);
    this.scene.add(this.orbitRing);

    const innerPoints = [];
    for (let i = 0; i <= segments; i++) {
      const theta = (i / segments) * Math.PI * 2;
      const r = 1.5;
      innerPoints.push(new THREE.Vector3(0, Math.cos(theta) * r, Math.sin(theta) * r));
    }
    const innerGeo = new THREE.BufferGeometry().setFromPoints(innerPoints);
    const innerMat = new THREE.LineBasicMaterial({
      color: 0x00cec9,
      transparent: true,
      opacity: 0.1,
    });
    const innerRing = new THREE.Line(innerGeo, innerMat);
    this.scene.add(innerRing);
  },

  _createGridRing() {
    const segments = 48;
    const rings = 3;
    for (let r = 0; r < rings; r++) {
      const points = [];
      const radius = 1.35 + r * 0.08;
      const tilt = (r - 1) * 0.3;
      for (let i = 0; i <= segments; i++) {
        const theta = (i / segments) * Math.PI * 2;
        points.push(new THREE.Vector3(
          Math.cos(theta) * radius,
          Math.sin(theta) * radius * Math.sin(tilt),
          Math.sin(theta) * radius * Math.cos(tilt)
        ));
      }
      const geo = new THREE.BufferGeometry().setFromPoints(points);
      const mat = new THREE.LineBasicMaterial({
        color: 0xa29bfe,
        transparent: true,
        opacity: 0.05 + r * 0.02,
      });
      const ring = new THREE.Line(geo, mat);
      this.scene.add(ring);
    }
  },

  _createCityPoints() {
    this.cityPoints.forEach(p => { if (p.parent) p.parent.remove(p); });
    this.cityPoints = [];

    this.cityCoords.forEach(city => {
      const pos = this._latLngToPos(city.lat, city.lng, 1.24);
      const geo = new THREE.SphereGeometry(city.size * 0.04, 8, 8);
      const mat = new THREE.MeshBasicMaterial({
        color: 0x00cec9,
        transparent: true,
        opacity: 0.9,
      });
      const dot = new THREE.Mesh(geo, mat);
      dot.position.copy(pos);
      this.scene.add(dot);

      const glowGeo = new THREE.SphereGeometry(city.size * 0.1, 8, 8);
      const glowMat = new THREE.MeshBasicMaterial({
        color: 0x6c5ce7,
        transparent: true,
        opacity: 0.15,
      });
      const glowDot = new THREE.Mesh(glowGeo, glowMat);
      glowDot.position.copy(pos);
      this.scene.add(glowDot);

      this.cityPoints.push(dot);
      this.cityPoints.push(glowDot);
    });
  },

  _createParticles() {
    const count = 120;
    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count * 3; i++) {
      const r = 2 + Math.random() * 1.5;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.cos(phi);
      positions[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);
    }
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const mat = new THREE.PointsMaterial({
      color: 0xa29bfe,
      size: 0.02,
      transparent: true,
      opacity: 0.5,
      blending: THREE.AdditiveBlending,
    });
    const particles = new THREE.Points(geo, mat);
    particles.name = 'starfield';
    this.scene.add(particles);
  },

  _animate() {
    if (!this.isRunning) return;
    this.animId = requestAnimationFrame(() => this._animate());

    const time = Date.now() * 0.0001;

    if (this.globe) {
      this.globe.rotation.y += 0.0015;
      this.globe.rotation.x += Math.sin(time * 0.5) * 0.0002;
    }

    if (this.orbitRing) {
      this.orbitRing.rotation.z += 0.0005;
    }

    this.cityPoints.forEach((p, i) => {
      const base = i % 2 === 0 ? 0.6 : 0.1;
      const speed = i * 0.3;
      if (p.material) {
        p.material.opacity = base + Math.sin(time * 2 + speed) * 0.2;
      }
    });

    this.camera.position.x += (this.mouseX * 0.3 - this.camera.position.x) * 0.02;
    this.camera.position.y += (this.mouseY * 0.2 + 0.5 - this.camera.position.y) * 0.02;
    this.camera.lookAt(0, 0, 0);

    this.renderer.render(this.scene, this.camera);
  },

  _resize(container) {
    const w = container.clientWidth || 600;
    const h = container.clientHeight || 600;
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h);
  },

  destroy() {
    this.isRunning = false;
    if (this.animId) cancelAnimationFrame(this.animId);
    this.renderer?.dispose();
    if (this.renderer?.domElement?.parentElement) {
      this.renderer.domElement.parentElement.removeChild(this.renderer.domElement);
    }
  },
};
