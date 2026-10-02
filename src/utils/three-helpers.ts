/**
 * ═══════════════════════════════════════════════════════
 * THREE.JS УТИЛИТЫ И ХЕЛПЕРЫ
 * Андрей & Полина | 27.07.2027
 * ═══════════════════════════════════════════════════════
 */

import * as THREE from 'three';

// ─── Создание PBR-материала золота ───
export function createGoldMaterial(roughness = 0.3, metalness = 0.9): THREE.MeshStandardMaterial {
  return new THREE.MeshStandardMaterial({
    color: new THREE.Color(0xC9A96E),
    roughness: roughness,
    metalness: metalness,
    envMapIntensity: 1.5,
  });
}

// ─── Создание PBR-материала пыльной розы ───
export function createRoseMaterial(roughness = 0.5, metalness = 0.1): THREE.MeshStandardMaterial {
  return new THREE.MeshStandardMaterial({
    color: new THREE.Color(0xD4A0A0),
    roughness: roughness,
    metalness: metalness,
    envMapIntensity: 0.8,
  });
}

// ─── Создание физического материала для колец ───
export function createRingMaterial(): THREE.MeshPhysicalMaterial {
  return new THREE.MeshPhysicalMaterial({
    color: new THREE.Color(0xD4AF37),
    roughness: 0.15,
    metalness: 1.0,
    clearcoat: 1.0,
    clearcoatRoughness: 0.1,
    reflectivity: 1.0,
    envMapIntensity: 2.0,
  });
}

// ─── Настройка освещения сцены ───
export function setupSceneLighting(scene: THREE.Scene): {
  ambientLight: THREE.AmbientLight;
  directionalLight: THREE.DirectionalLight;
  pointLights: THREE.PointLight[];
  spotLight: THREE.SpotLight;
  hemisphereLight: THREE.HemisphereLight;
} {
  // Ambient light для базового освещения
  const ambientLight = new THREE.AmbientLight(0xFFF9F0, 0.4);
  scene.add(ambientLight);

  // Directional light (солнце)
  const directionalLight = new THREE.DirectionalLight(0xFFF5E6, 0.8);
  directionalLight.position.set(5, 10, 5);
  directionalLight.castShadow = true;
  directionalLight.shadow.mapSize.width = 2048;
  directionalLight.shadow.mapSize.height = 2048;
  directionalLight.shadow.camera.near = 0.5;
  directionalLight.shadow.camera.far = 50;
  directionalLight.shadow.camera.left = -10;
  directionalLight.shadow.camera.right = 10;
  directionalLight.shadow.camera.top = 10;
  directionalLight.shadow.camera.bottom = -10;
  directionalLight.shadow.bias = -0.001;
  scene.add(directionalLight);

  // Point lights для акцентов
  const pointLight1 = new THREE.PointLight(0xC9A96E, 1.0, 20);
  pointLight1.position.set(-3, 3, 3);
  pointLight1.castShadow = true;
  scene.add(pointLight1);

  const pointLight2 = new THREE.PointLight(0xD4A0A0, 0.8, 15);
  pointLight2.position.set(3, 2, -2);
  scene.add(pointLight2);

  const pointLight3 = new THREE.PointLight(0xD4AF37, 0.6, 25);
  pointLight3.position.set(0, 5, 0);
  scene.add(pointLight3);

  // SpotLight для драматического эффекта
  const spotLight = new THREE.SpotLight(0xFFF5E6, 1.5, 30, Math.PI / 6, 0.5, 1);
  spotLight.position.set(0, 8, 5);
  spotLight.castShadow = true;
  spotLight.shadow.mapSize.width = 1024;
  spotLight.shadow.mapSize.height = 1024;
  scene.add(spotLight);

  // Hemisphere light для естественного освещения
  const hemisphereLight = new THREE.HemisphereLight(0xFFF9F0, 0xF5F0EB, 0.3);
  scene.add(hemisphereLight);

  return {
    ambientLight,
    directionalLight,
    pointLights: [pointLight1, pointLight2, pointLight3],
    spotLight,
    hemisphereLight,
  };
}

// ─── Создание системы частиц лепестков ───
export function createPetalSystem(count: number, spread: number): THREE.Points {
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(count * 3);
  const scales = new Float32Array(count);
  const rotations = new Float32Array(count);
  const colors = new Float32Array(count * 3);

  const roseColors = [
    new THREE.Color(0xD4A0A0),
    new THREE.Color(0xE8B4B4),
    new THREE.Color(0xF0D4D4),
    new THREE.Color(0xC9A0A0),
    new THREE.Color(0xF5E0E0),
  ];

  for (let i = 0; i < count; i++) {
    const i3 = i * 3;
    positions[i3] = (Math.random() - 0.5) * spread;
    positions[i3 + 1] = (Math.random() - 0.5) * spread;
    positions[i3 + 2] = (Math.random() - 0.5) * spread;

    scales[i] = Math.random() * 0.5 + 0.5;
    rotations[i] = Math.random() * Math.PI * 2;

    const color = roseColors[Math.floor(Math.random() * roseColors.length)];
    colors[i3] = color.r;
    colors[i3 + 1] = color.g;
    colors[i3 + 2] = color.b;
  }

  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('aScale', new THREE.BufferAttribute(scales, 1));
  geometry.setAttribute('aRotation', new THREE.BufferAttribute(rotations, 1));
  geometry.setAttribute('aColor', new THREE.BufferAttribute(colors, 3));

  const material = new THREE.PointsMaterial({
    size: 0.15,
    sizeAttenuation: true,
    transparent: true,
    opacity: 0.7,
    vertexColors: true,
    blending: THREE.NormalBlending,
    depthWrite: false,
  });

  return new THREE.Points(geometry, material);
}

// ─── Создание системы блёсток ───
export function createSparkleSystem(count: number, spread: number): THREE.Points {
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(count * 3);
  const sizes = new Float32Array(count);

  for (let i = 0; i < count; i++) {
    const i3 = i * 3;
    positions[i3] = (Math.random() - 0.5) * spread;
    positions[i3 + 1] = (Math.random() - 0.5) * spread;
    positions[i3 + 2] = (Math.random() - 0.5) * spread;
    sizes[i] = Math.random() * 3 + 1;
  }

  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1));

  const material = new THREE.PointsMaterial({
    size: 0.05,
    sizeAttenuation: true,
    transparent: true,
    opacity: 0.8,
    color: new THREE.Color(0xD4AF37),
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });

  return new THREE.Points(geometry, material);
}

// ─── Создание системы светлячков ───
export function createFireflySystem(count: number, spread: number): THREE.Points {
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(count * 3);
  const phases = new Float32Array(count);

  for (let i = 0; i < count; i++) {
    const i3 = i * 3;
    positions[i3] = (Math.random() - 0.5) * spread;
    positions[i3 + 1] = (Math.random() - 0.5) * spread * 0.5;
    positions[i3 + 2] = (Math.random() - 0.5) * spread;
    phases[i] = Math.random();
  }

  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('aPhase', new THREE.BufferAttribute(phases, 1));

  const material = new THREE.PointsMaterial({
    size: 0.08,
    sizeAttenuation: true,
    transparent: true,
    opacity: 0.6,
    color: new THREE.Color(0xE8D5A3),
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });

  return new THREE.Points(geometry, material);
}

// ─── Создание 3D-колец ───
export function createWeddingRings(): THREE.Group {
  const group = new THREE.Group();
  const ringMaterial = createRingMaterial();

  // Первое кольцо
  const ring1Geometry = new THREE.TorusGeometry(1, 0.15, 32, 100);
  const ring1 = new THREE.Mesh(ring1Geometry, ringMaterial);
  ring1.castShadow = true;
  ring1.receiveShadow = true;
  ring1.position.set(-0.5, 0, 0);
  ring1.rotation.x = Math.PI / 2;
  group.add(ring1);

  // Второе кольцо
  const ring2Geometry = new THREE.TorusGeometry(1, 0.12, 32, 100);
  const ring2 = new THREE.Mesh(ring2Geometry, ringMaterial.clone());
  ring2.castShadow = true;
  ring2.receiveShadow = true;
  ring2.position.set(0.5, 0, 0);
  ring2.rotation.x = Math.PI / 2;
  ring2.rotation.z = Math.PI / 6;
  group.add(ring2);

  return group;
}

// ─── Создание спирали времени ───
export function createTimeSpiral(points: number, radius: number, height: number): THREE.CatmullRomCurve3 {
  const curvePoints: THREE.Vector3[] = [];

  for (let i = 0; i < points; i++) {
    const t = i / (points - 1);
    const angle = t * Math.PI * 4; // 2 полных оборота
    const x = Math.cos(angle) * radius * (1 - t * 0.3);
    const y = t * height - height / 2;
    const z = Math.sin(angle) * radius * (1 - t * 0.3);
    curvePoints.push(new THREE.Vector3(x, y, z));
  }

  return new THREE.CatmullRomCurve3(curvePoints);
}

// ─── Анимация частиц ───
export function animateParticles(
  particles: THREE.Points,
  time: number,
  options: {
    windSpeed?: number;
    gravity?: number;
    turbulence?: number;
    bounds?: number;
  } = {}
) {
  const { windSpeed = 0.5, gravity = 0.02, turbulence = 0.3, bounds = 10 } = options;
  const positions = particles.geometry.attributes.position;
  const count = positions.count;

  for (let i = 0; i < count; i++) {
    const i3 = i * 3;
    let x = positions.array[i3] as number;
    let y = positions.array[i3 + 1] as number;
    let z = positions.array[i3 + 2] as number;

    // Ветер
    x += Math.sin(time + i * 0.1) * windSpeed * 0.01;
    z += Math.cos(time + i * 0.15) * windSpeed * 0.005;

    // Гравитация
    y -= gravity;

    // Турбулентность
    x += (Math.random() - 0.5) * turbulence * 0.01;
    y += (Math.random() - 0.5) * turbulence * 0.005;
    z += (Math.random() - 0.5) * turbulence * 0.01;

    // Wrap around bounds
    if (y < -bounds) y = bounds;
    if (x > bounds) x = -bounds;
    if (x < -bounds) x = bounds;
    if (z > bounds) z = -bounds;
    if (z < -bounds) z = bounds;

    positions.array[i3] = x;
    positions.array[i3 + 1] = y;
    positions.array[i3 + 2] = z;
  }

  positions.needsUpdate = true;
}

// ─── Создание камеры с плавным движением ───
export function createSmoothCamera(
  fov: number,
  aspect: number,
  near: number,
  far: number
): THREE.PerspectiveCamera {
  const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
  camera.position.set(0, 0, 5);
  camera.lookAt(0, 0, 0);
  return camera;
}

// ─── Создание рендерера с настройками ───
export function createRenderer(canvas: HTMLCanvasElement, width: number, height: number): THREE.WebGLRenderer {
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true,
    powerPreference: 'high-performance',
  });

  renderer.setSize(width, height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.2;
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  return renderer;
}

// ─── Утилита для интерполяции ───
export function lerp(start: number, end: number, factor: number): number {
  return start + (end - start) * factor;
}

// ─── Утилита для плавного следования мыши ───
export function smoothFollowMouse(
  current: { x: number; y: number },
  target: { x: number; y: number },
  factor: number = 0.05
): { x: number; y: number } {
  return {
    x: lerp(current.x, target.x, factor),
    y: lerp(current.y, target.y, factor),
  };
}

// ─── Создание fog для глубины ───
export function createSceneFog(scene: THREE.Scene, color: number, near: number, far: number) {
  scene.fog = new THREE.Fog(color, near, far);
}

// ─── Создание environment map (простая) ───
export function createSimpleEnvMap(renderer: THREE.WebGLRenderer): THREE.CubeTexture {
  const cubeRenderTarget = new THREE.WebGLCubeRenderTarget(256);
  const cubeCamera = new THREE.CubeCamera(0.1, 100, cubeRenderTarget);

  // Создаём простую сцену для environment
  const envScene = new THREE.Scene();
  envScene.background = new THREE.Color(0xFFF9F0);

  // Добавляем свет для environment
  const envLight = new THREE.AmbientLight(0xffffff, 1);
  envScene.add(envLight);

  cubeCamera.update(renderer, envScene);

  return cubeRenderTarget.texture;
}

// ─── Создание 3D-текста (простые буквы из геометрии) ───
export function createTextPlane(text: string, fontSize: number, color: string): THREE.Mesh {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d')!;
  canvas.width = 1024;
  canvas.height = 256;

  ctx.fillStyle = 'transparent';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.font = `bold ${fontSize}px "Playfair Display", serif`;
  ctx.fillStyle = color;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, canvas.width / 2, canvas.height / 2);

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;

  const geometry = new THREE.PlaneGeometry(4, 1);
  const material = new THREE.MeshBasicMaterial({
    map: texture,
    transparent: true,
    side: THREE.DoubleSide,
  });

  return new THREE.Mesh(geometry, material);
}

// ─── Создание конфетти-системы ───
export function createConfettiSystem(count: number): {
  points: THREE.Points;
  velocities: Float32Array;
  rotationSpeeds: Float32Array;
} {
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(count * 3);
  const velocities = new Float32Array(count * 3);
  const rotationSpeeds = new Float32Array(count);
  const colors = new Float32Array(count * 3);

  const confettiColors = [
    new THREE.Color(0xC9A96E),
    new THREE.Color(0xD4AF37),
    new THREE.Color(0xD4A0A0),
    new THREE.Color(0xE8D5A3),
    new THREE.Color(0xF0D4D4),
    new THREE.Color(0xFFFFFF),
  ];

  for (let i = 0; i < count; i++) {
    const i3 = i * 3;
    positions[i3] = (Math.random() - 0.5) * 2;
    positions[i3 + 1] = Math.random() * 5 + 2;
    positions[i3 + 2] = (Math.random() - 0.5) * 2;

    velocities[i3] = (Math.random() - 0.5) * 0.1;
    velocities[i3 + 1] = Math.random() * 0.05 + 0.02;
    velocities[i3 + 2] = (Math.random() - 0.5) * 0.1;

    rotationSpeeds[i] = (Math.random() - 0.5) * 0.2;

    const color = confettiColors[Math.floor(Math.random() * confettiColors.length)];
    colors[i3] = color.r;
    colors[i3 + 1] = color.g;
    colors[i3 + 2] = color.b;
  }

  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

  const material = new THREE.PointsMaterial({
    size: 0.1,
    sizeAttenuation: true,
    transparent: true,
    opacity: 0.9,
    vertexColors: true,
    blending: THREE.NormalBlending,
    depthWrite: false,
  });

  const points = new THREE.Points(geometry, material);

  return { points, velocities, rotationSpeeds };
}

// ─── Resize handler ───
export function handleResize(
  renderer: THREE.WebGLRenderer,
  camera: THREE.PerspectiveCamera,
  container: HTMLElement
) {
  const width = container.clientWidth;
  const height = container.clientHeight;

  camera.aspect = width / height;
  camera.updateProjectionMatrix();

  renderer.setSize(width, height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
}
