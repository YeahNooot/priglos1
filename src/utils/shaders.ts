/**
 * ═══════════════════════════════════════════════════════
 * ШЕЙДЕРЫ ДЛЯ СВАДЕБНОГО САЙТА
 * Андрей & Полина | 27.07.2027
 * ═══════════════════════════════════════════════════════
 */

// ─── Шейдер золотого свечения ───
export const goldGlowVertexShader = `
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vPosition;
  uniform float uTime;
  
  void main() {
    vUv = uv;
    vNormal = normalize(normalMatrix * normal);
    vPosition = position;
    
    vec3 pos = position;
    pos.y += sin(uTime * 0.5 + position.x * 2.0) * 0.02;
    pos.x += cos(uTime * 0.3 + position.y * 2.0) * 0.02;
    
    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`;

export const goldGlowFragmentShader = `
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vPosition;
  uniform float uTime;
  uniform float uIntensity;
  uniform vec3 uColor;
  
  void main() {
    vec3 goldColor = vec3(0.788, 0.663, 0.431);
    vec3 brightGold = vec3(0.831, 0.686, 0.216);
    
    float fresnel = pow(1.0 - abs(dot(vNormal, vec3(0.0, 0.0, 1.0))), 2.0);
    float pulse = sin(uTime * 2.0) * 0.5 + 0.5;
    
    vec3 color = mix(goldColor, brightGold, fresnel * pulse);
    float glow = fresnel * uIntensity * (0.8 + pulse * 0.2);
    
    gl_FragColor = vec4(color + glow * 0.3, 0.9);
  }
`;

// ─── Шейдер водной ряби ───
export const waterRippleVertexShader = `
  varying vec2 vUv;
  varying float vElevation;
  uniform float uTime;
  uniform float uAmplitude;
  uniform float uFrequency;
  
  void main() {
    vUv = uv;
    
    vec3 pos = position;
    float wave1 = sin(pos.x * uFrequency + uTime) * uAmplitude;
    float wave2 = sin(pos.y * uFrequency * 0.8 + uTime * 1.2) * uAmplitude * 0.5;
    float wave3 = sin((pos.x + pos.y) * uFrequency * 0.5 + uTime * 0.8) * uAmplitude * 0.3;
    
    pos.z = wave1 + wave2 + wave3;
    vElevation = pos.z;
    
    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`;

export const waterRippleFragmentShader = `
  varying vec2 vUv;
  varying float vElevation;
  uniform float uTime;
  uniform vec3 uColorA;
  uniform vec3 uColorB;
  
  void main() {
    float mixVal = (vElevation + 0.5) * 0.5;
    vec3 color = mix(uColorA, uColorB, mixVal);
    
    float alpha = 0.3 + vElevation * 0.5;
    
    // Добавляем блики
    float sparkle = sin(vUv.x * 50.0 + uTime * 3.0) * sin(vUv.y * 50.0 + uTime * 2.0);
    sparkle = pow(max(sparkle, 0.0), 8.0) * 0.5;
    color += sparkle;
    
    gl_FragColor = vec4(color, alpha);
  }
`;

// ─── Шейдер голографического мерцания ───
export const holoShimmerVertexShader = `
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vWorldPosition;
  uniform float uTime;
  
  void main() {
    vUv = uv;
    vNormal = normalize(normalMatrix * normal);
    
    vec4 worldPos = modelMatrix * vec4(position, 1.0);
    vWorldPosition = worldPos.xyz;
    
    gl_Position = projectionMatrix * viewMatrix * worldPos;
  }
`;

export const holoShimmerFragmentShader = `
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vWorldPosition;
  uniform float uTime;
  uniform float uSpeed;
  
  void main() {
    vec3 gold = vec3(0.788, 0.663, 0.431);
    vec3 rose = vec3(0.831, 0.627, 0.627);
    vec3 cream = vec3(1.0, 0.976, 0.941);
    
    float fresnel = pow(1.0 - abs(dot(vNormal, vec3(0.0, 0.0, 1.0))), 3.0);
    
    float pattern = sin(vUv.x * 20.0 + uTime * uSpeed) * 
                    cos(vUv.y * 15.0 + uTime * uSpeed * 0.7);
    pattern = pattern * 0.5 + 0.5;
    
    vec3 color = mix(gold, rose, pattern);
    color = mix(color, cream, fresnel * 0.5);
    
    float shimmer = sin(vWorldPosition.x * 10.0 + uTime * 3.0) * 0.5 + 0.5;
    shimmer *= sin(vWorldPosition.y * 8.0 + uTime * 2.0) * 0.5 + 0.5;
    
    float alpha = 0.4 + fresnel * 0.4 + shimmer * 0.2;
    
    gl_FragColor = vec4(color, alpha);
  }
`;

// ─── Шейдер лепестков роз ───
export const petalVertexShader = `
  attribute float aScale;
  attribute float aRotation;
  attribute vec3 aColor;
  
  varying vec3 vColor;
  varying float vAlpha;
  
  uniform float uTime;
  uniform float uPixelRatio;
  
  void main() {
    vColor = aColor;
    
    vec3 pos = position;
    
    // Волнообразное движение
    pos.x += sin(uTime * 0.5 + position.y * 2.0) * 0.3;
    pos.y -= uTime * 0.1;
    pos.z += cos(uTime * 0.3 + position.x * 1.5) * 0.2;
    
    // Wrap around
    pos.y = mod(pos.y + 10.0, 20.0) - 10.0;
    
    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    
    float size = aScale * uPixelRatio * 30.0;
    gl_PointSize = size * (1.0 / -mvPosition.z);
    
    vAlpha = smoothstep(15.0, 5.0, -mvPosition.z);
    
    gl_Position = projectionMatrix * mvPosition;
  }
`;

export const petalFragmentShader = `
  varying vec3 vColor;
  varying float vAlpha;
  
  void main() {
    // Создаём форму лепестка
    vec2 center = gl_PointCoord - vec2(0.5);
    float dist = length(center);
    
    // Эллиптическая форма лепестка
    float petal = 1.0 - smoothstep(0.2, 0.5, dist);
    
    // Добавляем неровности краёв
    float angle = atan(center.y, center.x);
    float edge = sin(angle * 3.0) * 0.05;
    petal *= 1.0 - smoothstep(0.3 + edge, 0.5, dist);
    
    if (petal < 0.01) discard;
    
    vec3 color = vColor;
    // Затемнение к краям
    color *= 0.8 + petal * 0.2;
    
    gl_FragColor = vec4(color, petal * vAlpha * 0.8);
  }
`;

// ─── Шейдер звёздного неба ───
export const starsVertexShader = `
  attribute float aSize;
  attribute float aPhase;
  
  varying float vAlpha;
  varying float vSize;
  
  uniform float uTime;
  uniform float uPixelRatio;
  
  void main() {
    vec3 pos = position;
    
    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    
    float twinkle = sin(uTime * 2.0 + aPhase * 6.28) * 0.5 + 0.5;
    vAlpha = 0.3 + twinkle * 0.7;
    vSize = aSize;
    
    float size = aSize * uPixelRatio * (1.0 + twinkle * 0.5);
    gl_PointSize = size * (300.0 / -mvPosition.z);
    
    gl_Position = projectionMatrix * mvPosition;
  }
`;

export const starsFragmentShader = `
  varying float vAlpha;
  varying float vSize;
  
  void main() {
    vec2 center = gl_PointCoord - vec2(0.5);
    float dist = length(center);
    
    // Мягкое свечение звезды
    float star = 1.0 - smoothstep(0.0, 0.5, dist);
    star = pow(star, 2.0);
    
    // Крестообразные лучи
    float rays = 0.0;
    rays += exp(-abs(center.x) * 10.0) * exp(-abs(center.y) * 3.0);
    rays += exp(-abs(center.y) * 10.0) * exp(-abs(center.x) * 3.0);
    rays *= 0.3;
    
    float alpha = (star + rays) * vAlpha;
    
    vec3 color = mix(vec3(1.0, 0.95, 0.8), vec3(0.8, 0.85, 1.0), vSize * 0.1);
    
    gl_FragColor = vec4(color, alpha);
  }
`;

// ─── Шейдер конфетти ───
export const confettiVertexShader = `
  attribute vec3 aVelocity;
  attribute float aRotationSpeed;
  attribute vec3 aColor;
  attribute float aLife;
  
  varying vec3 vColor;
  varying float vAlpha;
  varying float vRotation;
  
  uniform float uTime;
  uniform float uPixelRatio;
  
  void main() {
    vColor = aColor;
    
    float life = max(0.0, aLife - uTime * 0.3);
    vAlpha = life;
    vRotation = uTime * aRotationSpeed;
    
    vec3 pos = position + aVelocity * uTime;
    pos.y -= 4.9 * uTime * uTime; // gravity
    
    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    
    float size = 15.0 * uPixelRatio * life;
    gl_PointSize = size * (1.0 / -mvPosition.z) * 100.0;
    
    gl_Position = projectionMatrix * mvPosition;
  }
`;

export const confettiFragmentShader = `
  varying vec3 vColor;
  varying float vAlpha;
  varying float vRotation;
  
  void main() {
    vec2 center = gl_PointCoord - vec2(0.5);
    
    // Поворот
    float cosR = cos(vRotation);
    float sinR = sin(vRotation);
    vec2 rotated = vec2(
      center.x * cosR - center.y * sinR,
      center.x * sinR + center.y * cosR
    );
    
    // Прямоугольная форма конфетти
    float rect = step(abs(rotated.x), 0.3) * step(abs(rotated.y), 0.15);
    
    if (rect < 0.5) discard;
    
    gl_FragColor = vec4(vColor, vAlpha * rect);
  }
`;

// ─── Шейдер градиентного фона ───
export const gradientBgVertexShader = `
  varying vec2 vUv;
  
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

export const gradientBgFragmentShader = `
  varying vec2 vUv;
  uniform float uTime;
  uniform vec3 uColorA;
  uniform vec3 uColorB;
  uniform vec3 uColorC;
  
  void main() {
    float t = uTime * 0.1;
    
    // Анимированный градиент
    float wave1 = sin(vUv.x * 3.0 + t) * 0.5 + 0.5;
    float wave2 = cos(vUv.y * 2.0 + t * 0.7) * 0.5 + 0.5;
    float wave3 = sin((vUv.x + vUv.y) * 2.0 + t * 0.5) * 0.5 + 0.5;
    
    vec3 color = mix(uColorA, uColorB, wave1 * wave2);
    color = mix(color, uColorC, wave3 * 0.3);
    
    gl_FragColor = vec4(color, 1.0);
  }
`;

// ─── Шейдер для текста с золотым свечением ───
export const textGlowFragmentShader = `
  varying vec2 vUv;
  uniform float uTime;
  uniform sampler2D uTexture;
  
  void main() {
    vec4 texColor = texture2D(uTexture, vUv);
    
    if (texColor.a < 0.1) discard;
    
    vec3 gold = vec3(0.788, 0.663, 0.431);
    float pulse = sin(uTime * 2.0) * 0.3 + 0.7;
    
    vec3 color = mix(gold, vec3(1.0, 0.95, 0.8), pulse * 0.3);
    
    gl_FragColor = vec4(color * texColor.rgb, texColor.a);
  }
`;

// ─── Шейдер для lens flare ───
export const lensFlareFragmentShader = `
  varying vec2 vUv;
  uniform float uTime;
  uniform vec2 uFlarePosition;
  uniform float uIntensity;
  
  void main() {
    vec2 dir = vUv - uFlarePosition;
    float dist = length(dir);
    
    // Центральное свечение
    float center = exp(-dist * 10.0) * uIntensity;
    
    // Лучи
    float angle = atan(dir.y, dir.x);
    float rays = pow(abs(sin(angle * 4.0 + uTime)), 8.0) * exp(-dist * 5.0) * uIntensity * 0.5;
    
    // Кольца
    float rings = sin(dist * 30.0 - uTime * 2.0) * 0.5 + 0.5;
    rings *= exp(-dist * 8.0) * uIntensity * 0.3;
    
    vec3 color = vec3(0.95, 0.85, 0.6) * (center + rays + rings);
    float alpha = center + rays + rings;
    
    gl_FragColor = vec4(color, alpha * 0.8);
  }
`;
