        import * as THREE from 'three';
        const MAX_COLORS = 8;
        const vert = `varying vec2 vUv; void main() { vUv = uv; gl_Position = vec4(position, 1.0); }`;
        const frag = `
        #define MAX_COLORS ${MAX_COLORS}
        uniform vec2 uCanvas; uniform float uTime; uniform float uSpeed; uniform vec2 uRot; uniform int uColorCount;
        uniform vec3 uColors[MAX_COLORS]; uniform int uTransparent; uniform float uScale; uniform float uFrequency;
        uniform float uWarpStrength; uniform vec2 uPointer; uniform float uMouseInfluence; uniform float uParallax;
        uniform float uNoise; uniform int uIterations; uniform float uIntensity; uniform float uBandWidth; varying vec2 vUv;
        void main() {
          float t = uTime * uSpeed; vec2 p = vUv * 2.0 - 1.0; p += uPointer * uParallax * 0.1;
          vec2 rp = vec2(p.x * uRot.x - p.y * uRot.y, p.x * uRot.y + p.y * uRot.x);
          vec2 q = vec2(rp.x * (uCanvas.x / uCanvas.y), rp.y);
          q /= max(uScale, 0.0001); q /= 0.5 + 0.2 * dot(q, q); q += 0.2 * cos(t) - 7.56;
          q += (uPointer - rp) * uMouseInfluence * 0.2;
          for (int j = 0; j < 5; j++) {
              if (j >= uIterations - 1) break;
              vec2 rr = sin(1.5 * (q.yx * uFrequency) + 2.0 * cos(q * uFrequency)); q += (rr - q) * 0.15;
          }
          vec3 col = vec3(0.0); float a = 1.0;
          if (uColorCount > 0) {
              vec2 s = q; vec3 sumCol = vec3(0.0); float cover = 0.0;
              for (int i = 0; i < MAX_COLORS; ++i) {
                    if (i >= uColorCount) break; s -= 0.01;
                    vec2 r = sin(1.5 * (s.yx * uFrequency) + 2.0 * cos(s * uFrequency));
                    float m0 = length(r + sin(5.0 * r.y * uFrequency - 3.0 * t + float(i)) / 4.0);
                    float kBelow = clamp(uWarpStrength, 0.0, 1.0), kMix = pow(kBelow, 0.3), gain = 1.0 + max(uWarpStrength - 1.0, 0.0);
                    vec2 warped = s + (r - s) * kBelow * gain;
                    float m1 = length(warped + sin(5.0 * warped.y * uFrequency - 3.0 * t + float(i)) / 4.0);
                    float m = mix(m0, m1, kMix), w = 1.0 - exp(-uBandWidth / exp(uBandWidth * m));
                    sumCol += uColors[i] * w; cover = max(cover, w);
              }
              col = clamp(sumCol, 0.0, 1.0); a = uTransparent > 0 ? cover : 1.0;
          } else {
              vec2 s = q;
              for (int k = 0; k < 3; ++k) {
                  s -= 0.01; vec2 r = sin(1.5 * (s.yx * uFrequency) + 2.0 * cos(s * uFrequency));
                  float m0 = length(r + sin(5.0 * r.y * uFrequency - 3.0 * t + float(k)) / 4.0);
                  float kBelow = clamp(uWarpStrength, 0.0, 1.0), kMix = pow(kBelow, 0.3), gain = 1.0 + max(uWarpStrength - 1.0, 0.0);
                  vec2 warped = s + (r - s) * kBelow * gain;
                  float m1 = length(warped + sin(5.0 * warped.y * uFrequency - 3.0 * t + float(k)) / 4.0);
                  float m = mix(m0, m1, kMix); col[k] = 1.0 - exp(-uBandWidth / exp(uBandWidth * m));
              }
              a = uTransparent > 0 ? max(max(col.r, col.g), col.b) : 1.0;
          }
          col *= uIntensity;
          if (uNoise > 0.0001) {
            float n = fract(sin(dot(gl_FragCoord.xy + vec2(uTime), vec2(12.9898, 78.233))) * 43758.5453123);
            col += (n - 0.5) * uNoise; col = clamp(col, 0.0, 1.0);
          }
          gl_FragColor = vec4((uTransparent > 0) ? col * a : col, a);
        }`;
        const container = document.getElementById('color-bends-container'), scene = new THREE.Scene(), camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
        const renderer = new THREE.WebGLRenderer({ antialias: false, powerPreference: 'high-performance', alpha: true });
        renderer.outputColorSpace = THREE.SRGBColorSpace; renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2)); renderer.setClearColor(0x000000, 0); 
        container.appendChild(renderer.domElement);
        const config = { rotation: 90, speed: 0.15, scale: 1, frequency: 1, warpStrength: 1, mouseInfluence: 1, parallax: 0.5, noise: 0.15, iterations: 1, intensity: 1.5, bandWidth: 6, transparent: true, colors: ['#0f0c29', '#302b63', '#240b36', '#00ffd0', '#8c52ff'] };
        const uColorsArray = Array.from({ length: MAX_COLORS }, () => new THREE.Vector3(0, 0, 0)), rotRad = (config.rotation * Math.PI) / 180;
        const material = new THREE.ShaderMaterial({ vertexShader: vert, fragmentShader: frag, uniforms: { uCanvas: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) }, uTime: { value: 0 }, uSpeed: { value: config.speed }, uRot: { value: new THREE.Vector2(Math.cos(rotRad), Math.sin(rotRad)) }, uColorCount: { value: 0 }, uColors: { value: uColorsArray }, uTransparent: { value: config.transparent ? 1 : 0 }, uScale: { value: config.scale }, uFrequency: { value: config.frequency }, uWarpStrength: { value: config.warpStrength }, uPointer: { value: new THREE.Vector2(0, 0) }, uMouseInfluence: { value: config.mouseInfluence }, uParallax: { value: config.parallax }, uNoise: { value: config.noise }, uIterations: { value: config.iterations }, uIntensity: { value: config.intensity }, uBandWidth: { value: config.bandWidth } }, premultipliedAlpha: true, transparent: true });
        function updateColors(hexColors) {
            const toVec3 = hex => { const h = hex.replace('#', '').trim(), v = h.length === 3 ? [parseInt(h[0] + h[0], 16), parseInt(h[1] + h[1], 16), parseInt(h[2] + h[2], 16)] : [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)]; return new THREE.Vector3(v[0] / 255, v[1] / 255, v[2] / 255); };
            const arr = hexColors.filter(Boolean).slice(0, MAX_COLORS).map(toVec3);
            for (let i = 0; i < MAX_COLORS; i++) { const vec = material.uniforms.uColors.value[i]; if (i < arr.length) vec.copy(arr[i]); else vec.set(0, 0, 0); }
            material.uniforms.uColorCount.value = arr.length;
        }
        updateColors(config.colors); scene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material));
        function handleResize() { const w = window.innerWidth, h = window.innerHeight; renderer.setSize(w, h, false); material.uniforms.uCanvas.value.set(w, h); }
        window.addEventListener('resize', handleResize); handleResize();
        const pointerTarget = new THREE.Vector2(0, 0), pointerCurrent = new THREE.Vector2(0, 0), pointerSmooth = 8, clock = new THREE.Clock();
        window.addEventListener('pointermove', (e) => { pointerTarget.set((e.clientX / window.innerWidth) * 2 - 1, -(e.clientY / window.innerHeight) * 2 - 1); });
        function loop() { requestAnimationFrame(loop); material.uniforms.uTime.value = clock.elapsedTime; pointerCurrent.lerp(pointerTarget, Math.min(1, clock.getDelta() * pointerSmooth)); material.uniforms.uPointer.value.copy(pointerCurrent); renderer.render(scene, camera); }
        loop();
    
