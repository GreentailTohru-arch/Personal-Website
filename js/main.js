// 页面交互脚本（由原始 A.html 内联脚本拆分）

        document.addEventListener("DOMContentLoaded", () => {
            const weatherWidget = document.getElementById('weather-widget');
            const emojiEl = document.getElementById('weather-emoji');
            const textEl = document.getElementById('weather-text');

            async function fetchWeather() {
                try {
                    emojiEl.textContent = '⌛';
                    textEl.textContent = '...';

                    // 默认坐标：北京 (防止定位失败或被拒绝时有一个合理的默认值)
                    let lat = 39.90;
                    let lon = 116.40;

                    // 尝试通过浏览器获取真实位置
                    const getCoords = () => new Promise((resolve) => {
                        if (navigator.geolocation) {
                            navigator.geolocation.getCurrentPosition(
                                pos => resolve({lat: pos.coords.latitude, lon: pos.coords.longitude}),
                                err => resolve({lat, lon}) 
                            );
                        } else {
                            resolve({lat, lon});
                        }
                    });

                    const coords = await getCoords();
                    
                    // 使用免费免 Key 的 Open-Meteo 接口
                    const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${coords.lat}&longitude=${coords.lon}&current_weather=true`);
                    if (!res.ok) throw new Error('API Request Failed');
                    
                    const data = await res.json();
                    const temp = Math.round(data.current_weather.temperature);
                    const code = data.current_weather.weathercode;

                    // WMO 国际气象组织天气代码 转 Emoji
                    const wmoToEmoji = {
                        0: '☀️',
                        1: '🌤️', 2: '⛅', 3: '☁️',
                        45: '🌫️', 48: '🌫️',
                        51: '🌦️', 53: '🌦️', 55: '🌧️',
                        61: '🌧️', 63: '🌧️', 65: '🌧️',
                        71: '🌨️', 73: '🌨️', 75: '🌨️', 77: '🌨️',
                        80: '🌦️', 81: '🌧️', 82: '🌧️',
                        85: '🌨️', 86: '🌨️',
                        95: '⛈️', 96: '⛈️', 99: '🌩️'
                    };

                    emojiEl.textContent = wmoToEmoji[code] || '⛅';
                    textEl.textContent = `${temp}°C`;

                } catch (e) {
                    console.error('获取天气失败:', e);
                    emojiEl.textContent = '☁️';
                    textEl.textContent = 'N/A';
                }
            }

            fetchWeather();
            // 点击可刷新天气
            weatherWidget.addEventListener('click', fetchWeather);
        });
    

        document.addEventListener("DOMContentLoaded", () => {
            if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
                gsap.registerPlugin(ScrollTrigger);
                const titles = document.querySelectorAll('.section-title');
                titles.forEach(el => {
                    const text = el.innerText;
                    el.innerHTML = '';
                    text.split('').forEach(char => {
                        const span = document.createElement('span');
                        span.className = 'char';
                        span.innerHTML = char === ' ' ? '&nbsp;' : char;
                        el.appendChild(span);
                    });
                    const charElements = el.querySelectorAll('.char');
                    gsap.fromTo(charElements,
                        { willChange: 'opacity, transform', opacity: 0, yPercent: 120, scaleY: 2.3, scaleX: 0.7, transformOrigin: '50% 0%' },
                        { duration: 1, ease: 'back.inOut(2)', opacity: 1, yPercent: 0, scaleY: 1, scaleX: 1, stagger: 0.03, scrollTrigger: { trigger: el, start: 'center bottom+=50%', end: 'bottom bottom-=40%', scrub: true } }
                    );
                });
            }
        });
    

        document.addEventListener("DOMContentLoaded", () => {
            const panels = document.querySelectorAll('.glass-panel');
            const isWebkit = /Safari/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent);
            const isFirefox = /Firefox/.test(navigator.userAgent);

            /*
             * Liquid Glass corner repair
             * 1) Keep the original UI and all existing sections intact.
             * 2) Use a neutral displacement-map background instead of black outside the rounded rect.
             * Black corners in an SVG displacement map force the backdrop to shift at the top-left
             * and create the visible square/angled artifact.
             * 3) Generate one displacement map per panel using the panel's real width/height/radius,
             * then clip the element with the same radius.
             */
            const getRadiusText = (el) => getComputedStyle(el).borderRadius || '24px';
            const getTopLeftRadius = (el) => parseFloat(getComputedStyle(el).borderTopLeftRadius) || 24;

            panels.forEach(el => {
                const radiusText = getRadiusText(el);
                el.style.clipPath = `inset(0 round ${radiusText})`;
                el.style.webkitClipPath = `inset(0 round ${radiusText})`;
                el.style.overflow = 'hidden';
                el.style.isolation = 'isolate';
                el.style.transform = 'translateZ(0)';
                el.style.contain = 'paint';
                el.style.background = 'rgba(255,255,255,0.05)';
            });

            if (isWebkit || isFirefox) return;

            const test = document.createElement('div');
            test.style.backdropFilter = 'url(#test-filter)';
            if (!test.style.backdropFilter) return;

            const svgNS = 'http://www.w3.org/2000/svg';
            const svgContainer = document.createElement('div');
            svgContainer.style.cssText = 'position:absolute;width:0;height:0;overflow:hidden;pointer-events:none;';
            document.body.appendChild(svgContainer);

            const defsSvg = document.createElementNS(svgNS, 'svg');
            defsSvg.setAttribute('xmlns', svgNS);
            defsSvg.setAttribute('width', '0');
            defsSvg.setAttribute('height', '0');
            const defs = document.createElementNS(svgNS, 'defs');
            defsSvg.appendChild(defs);
            svgContainer.appendChild(defsSvg);

            const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

            const makeDisplacementMap = (width, height, radius, uid) => {
                const w = Math.max(1, Math.round(width));
                const h = Math.max(1, Math.round(height));
                const r = clamp(Math.round(radius), 0, Math.min(w, h) / 2);
                const edge = Math.max(2, Math.min(w, h) * 0.035);
                const innerW = Math.max(1, w - edge * 2);
                const innerH = Math.max(1, h - edge * 2);
                const innerR = clamp(r - edge, 0, r);
                const redGradId = `lg-red-${uid}`;
                const blueGradId = `lg-blue-${uid}`;
                const clipId = `lg-clip-${uid}`;
                const blurId = `lg-blur-${uid}`;

                const svgContent = `
                    <svg viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">
                        <defs>
                            <linearGradient id="${redGradId}" x1="100%" y1="0%" x2="0%" y2="0%">
                                <stop offset="0%" stop-color="rgb(128,128,128)"/>
                                <stop offset="100%" stop-color="rgb(255,0,0)"/>
                            </linearGradient>
                            <linearGradient id="${blueGradId}" x1="0%" y1="0%" x2="0%" y2="100%">
                                <stop offset="0%" stop-color="rgb(128,128,128)"/>
                                <stop offset="100%" stop-color="rgb(0,0,255)"/>
                            </linearGradient>
                            <clipPath id="${clipId}">
                                <rect x="0" y="0" width="${w}" height="${h}" rx="${r}" ry="${r}"/>
                            </clipPath>
                            <filter id="${blurId}" x="-20%" y="-20%" width="140%" height="140%">
                                <feGaussianBlur stdDeviation="11"/>
                            </filter>
                        </defs>
                        <rect x="0" y="0" width="${w}" height="${h}" fill="rgb(128,128,128)"/>
                        <g clip-path="url(#${clipId})">
                            <rect x="0" y="0" width="${w}" height="${h}" fill="url(#${redGradId})"/>
                            <rect x="0" y="0" width="${w}" height="${h}" fill="url(#${blueGradId})" style="mix-blend-mode:difference" opacity="0.88"/>
                            <rect x="${edge}" y="${edge}" width="${innerW}" height="${innerH}" rx="${innerR}" ry="${innerR}" fill="rgb(128,128,128)" filter="url(#${blurId})"/>
                        </g>
                    </svg>`;

                return `data:image/svg+xml,${encodeURIComponent(svgContent)}`;
            };

            const createFilterForPanel = (el, index) => {
                const filterId = `fixed-liquid-glass-filter-${index}`;
                const feImageId = `fixed-liquid-glass-map-${index}`;

                const filter = document.createElementNS(svgNS, 'filter');
                filter.setAttribute('id', filterId);
                filter.setAttribute('filterUnits', 'objectBoundingBox');
                filter.setAttribute('x', '0%');
                filter.setAttribute('y', '0%');
                filter.setAttribute('width', '100%');
                filter.setAttribute('height', '100%');
                filter.setAttribute('color-interpolation-filters', 'sRGB');
                filter.innerHTML = `
                    <feImage id="${feImageId}" x="0" y="0" width="100%" height="100%" preserveAspectRatio="none" result="map"/>
                    <feDisplacementMap in="SourceGraphic" in2="map" scale="-30" xChannelSelector="R" yChannelSelector="G" result="displaced"/>
                    <feGaussianBlur in="displaced" stdDeviation="0.35" result="softened"/>
                    <feComposite in="softened" in2="SourceGraphic" operator="over"/>
                `;
                defs.appendChild(filter);

                const updateMap = () => {
                    const rect = el.getBoundingClientRect();
                    if (!rect.width || !rect.height) return;
                    const feImage = document.getElementById(feImageId);
                    if (!feImage) return;
                    const data = makeDisplacementMap(rect.width, rect.height, getTopLeftRadius(el), index);
                    feImage.setAttribute('href', data);
                    feImage.setAttributeNS('http://www.w3.org/1999/xlink', 'href', data);

                    const radiusText = getRadiusText(el);
                    el.style.clipPath = `inset(0 round ${radiusText})`;
                    el.style.webkitClipPath = `inset(0 round ${radiusText})`;
                };

                el.style.backdropFilter = `blur(14px) saturate(140%) url(#${filterId})`;
                el.style.webkitBackdropFilter = `blur(14px) saturate(140%) url(#${filterId})`;

                updateMap();
                const resizeObserver = new ResizeObserver(() => requestAnimationFrame(updateMap));
                resizeObserver.observe(el);
            };

            panels.forEach(createFilterForPanel);
        });
    

        document.addEventListener("DOMContentLoaded", () => {
            const rows = document.querySelectorAll('.marquee-row');
            rows.forEach((row, index) => {
                row.innerHTML += row.innerHTML;
                let progress = 0, speed = (index % 2 === 0) ? 0.4 : 0.6, isDown = false, startX;
                const viewport = row.parentElement;
                viewport.addEventListener('mousedown', (e) => { isDown = true; startX = e.pageX; });
                window.addEventListener('mouseup', () => { isDown = false; });
                window.addEventListener('mousemove', (e) => {
                    if (!isDown) return; e.preventDefault();
                    progress += (e.pageX - startX); startX = e.pageX;
                });
                viewport.addEventListener('touchstart', (e) => { isDown = true; startX = e.touches[0].pageX; }, {passive: true});
                window.addEventListener('touchend', () => { isDown = false; });
                window.addEventListener('touchmove', (e) => {
                    if (!isDown) return;
                    progress += (e.touches[0].pageX - startX); startX = e.touches[0].pageX;
                }, {passive: true});

                function animate() {
                    if (!isDown) progress -= speed;
                    const halfWidth = row.scrollWidth / 2;
                    if (Math.abs(progress) >= halfWidth) progress += halfWidth;
                    else if (progress > 0) progress -= halfWidth;
                    row.style.transform = `translateX(${progress}px)`;
                    requestAnimationFrame(animate);
                }
                animate();
            });
        });
    

        document.addEventListener("DOMContentLoaded", () => {
            document.body.addEventListener('click', (e) => {
                const badge = e.target.closest('.gaming-badge');
                if (!badge) return;
                const textToCopy = badge.getAttribute('data-clipboard');
                navigator.clipboard.writeText(textToCopy).then(() => {
                    const idSpan = badge.querySelector('.badge-id');
                    const originalText = idSpan.innerText;
                    idSpan.innerText = '已复制!';
                    idSpan.style.color = '#00ffd0';
                    setTimeout(() => { idSpan.innerText = originalText; idSpan.style.color = ''; }, 2000);
                }).catch(err => { console.error('Failed to copy text: ', err); });
            });
        });
    

        document.addEventListener("DOMContentLoaded", () => {
            const fig = document.getElementById('tilted-card');
            const inner = document.getElementById('tilted-inner');
            const cap = document.getElementById('tilted-caption');
            const scaleOnHover = 1.05, rotateAmplitude = 14; 
            const target = { rotX: 0, rotY: 0, scale: 1, x: 0, y: 0, op: 0, rotCap: 0 }, current = { rotX: 0, rotY: 0, scale: 1, x: 0, y: 0, op: 0, rotCap: 0 };
            let lastY = 0;
            const isMobile = window.matchMedia("(max-width: 768px)").matches;
            if (!isMobile && fig) {
                fig.addEventListener('mousemove', (e) => {
                    const rect = fig.getBoundingClientRect();
                    const offsetX = e.clientX - rect.left - rect.width / 2, offsetY = e.clientY - rect.top - rect.height / 2;
                    target.rotX = (offsetY / (rect.height / 2)) * -rotateAmplitude;
                    target.rotY = (offsetX / (rect.width / 2)) * rotateAmplitude;
                    target.x = e.clientX - rect.left + 15; target.y = e.clientY - rect.top + 15;
                    target.rotCap = -(offsetY - lastY) * 0.6; lastY = offsetY;
                });
                fig.addEventListener('mouseenter', () => { target.scale = scaleOnHover; target.op = 1; });
                fig.addEventListener('mouseleave', () => { target.scale = 1; target.rotX = 0; target.rotY = 0; target.op = 0; target.rotCap = 0; });
                function animate() {
                    const lerp = (start, end, amt) => (1 - amt) * start + amt * end;
                    const f = 0.12; 
                    current.rotX = lerp(current.rotX, target.rotX, f); current.rotY = lerp(current.rotY, target.rotY, f);
                    current.scale = lerp(current.scale, target.scale, f); current.x = lerp(current.x, target.x, f);
                    current.y = lerp(current.y, target.y, f); current.op = lerp(current.op, target.op, f);
                    current.rotCap = lerp(current.rotCap, target.rotCap, f);
                    inner.style.transform = `scale(${current.scale}) rotateX(${current.rotX}deg) rotateY(${current.rotY}deg)`;
                    cap.style.transform = `translate(${current.x}px, ${current.y}px) rotate(${current.rotCap}deg)`; cap.style.opacity = current.op;
                    requestAnimationFrame(animate);
                }
                animate();
            }
        });
    

        const textElement = document.getElementById('typing-text');
        const textArray = ["Ren Kobayashi", "こばやし ぜん", "Digital Artist"];
        let textIndex = 0, charIndex = 0, isDeleting = false;
        function typeEffect() {
            const currentText = textArray[textIndex];
            if (isDeleting) {
                textElement.textContent = currentText.substring(0, charIndex - 1);
                charIndex--;
                if (charIndex === 0) {
                    isDeleting = false; textIndex = (textIndex + 1) % textArray.length;
                    setTimeout(typeEffect, 500); 
                } else setTimeout(typeEffect, 40);
            } else {
                textElement.textContent = currentText.substring(0, charIndex + 1);
                charIndex++;
                if (charIndex === currentText.length) {
                    isDeleting = true; setTimeout(typeEffect, 2500);
                } else setTimeout(typeEffect, 80 + Math.random() * 50);
            }
        }
        setTimeout(typeEffect, 1000);
    

        const dfConfig = {
            dotRadius: 1.5, dotSpacing: 14, cursorRadius: 500, cursorForce: 0.1, bulgeOnly: true,
            bulgeStrength: 67, glowRadius: 160, sparkle: false, waveAmplitude: 0,
            gradientFrom: 'rgba(168, 85, 247, 0.35)', gradientTo: 'rgba(0, 255, 208, 0.25)' 
        };
        const dfCanvas = document.getElementById('dot-field-canvas'), dfCtx = dfCanvas.getContext('2d', { alpha: true }), dfGlow = document.getElementById('dot-field-glow');
        let dfDots = [], dfSize = { w: 0, h: 0, offsetX: 0, offsetY: 0 }, dfGlowOpacity = 0, dfEngagement = 0, dfFrameCount = 0, dfResizeTimer;
        const dfMouse = { x: -9999, y: -9999, prevX: -9999, prevY: -9999, speed: 0 };
        function buildDots(w, h) {
            const step = dfConfig.dotRadius + dfConfig.dotSpacing, cols = Math.floor(w / step), rows = Math.floor(h / step);
            const padX = (w % step) / 2, padY = (h % step) / 2; dfDots = new Array(rows * cols);
            let idx = 0;
            for (let row = 0; row < rows; row++) {
                for (let col = 0; col < cols; col++) {
                    const ax = padX + col * step + step / 2, ay = padY + row * step + step / 2;
                    dfDots[idx++] = { ax, ay, sx: ax, sy: ay, vx: 0, vy: 0, x: ax, y: ay };
                }
            }
        }
        function resizeDotField() {
            const rect = dfCanvas.parentElement.getBoundingClientRect(), w = rect.width, h = rect.height, dpr = Math.min(window.devicePixelRatio || 1, 2);
            dfCanvas.width = w * dpr; dfCanvas.height = h * dpr; dfCanvas.style.width = w + 'px'; dfCanvas.style.height = h + 'px';
            dfCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
            dfSize = { w, h, offsetX: rect.left + window.scrollX, offsetY: rect.top + window.scrollY };
            buildDots(w, h);
        }
        window.addEventListener('resize', () => { clearTimeout(dfResizeTimer); dfResizeTimer = setTimeout(resizeDotField, 100); });
        window.addEventListener('mousemove', (e) => { dfMouse.x = e.pageX - dfSize.offsetX; dfMouse.y = e.pageY - dfSize.offsetY; }, { passive: true });
        setInterval(() => {
            const dist = Math.sqrt((dfMouse.prevX - dfMouse.x) ** 2 + (dfMouse.prevY - dfMouse.y) ** 2);
            dfMouse.speed += (dist - dfMouse.speed) * 0.5; if (dfMouse.speed < 0.001) dfMouse.speed = 0;
            dfMouse.prevX = dfMouse.x; dfMouse.prevY = dfMouse.y;
        }, 20);
        function dfTick() {
            dfFrameCount++;
            const { w, h } = dfSize, targetEngagement = Math.min(dfMouse.speed / 5, 1);
            dfEngagement += (targetEngagement - dfEngagement) * 0.06; if (dfEngagement < 0.001) dfEngagement = 0;
            dfGlowOpacity += (dfEngagement - dfGlowOpacity) * 0.08;
            if (dfGlow) { dfGlow.setAttribute('cx', dfMouse.x); dfGlow.setAttribute('cy', dfMouse.y); dfGlow.style.opacity = dfGlowOpacity; }
            dfCtx.clearRect(0, 0, w, h);
            const grad = dfCtx.createLinearGradient(0, 0, w, h);
            grad.addColorStop(0, dfConfig.gradientFrom); grad.addColorStop(1, dfConfig.gradientTo);
            dfCtx.fillStyle = grad;
            const crSq = dfConfig.cursorRadius * dfConfig.cursorRadius, rad = dfConfig.dotRadius / 2, TWO_PI = Math.PI * 2;
            dfCtx.beginPath();
            for (let i = 0; i < dfDots.length; i++) {
                const d = dfDots[i], dx = dfMouse.x - d.ax, dy = dfMouse.y - d.ay, distSq = dx * dx + dy * dy;
                if (distSq < crSq && dfEngagement > 0.01) {
                    const push = (1 - Math.sqrt(distSq) / dfConfig.cursorRadius) ** 2 * dfConfig.bulgeStrength * dfEngagement;
                    const angle = Math.atan2(dy, dx);
                    d.sx += (d.ax - Math.cos(angle) * push - d.sx) * 0.15; d.sy += (d.ay - Math.sin(angle) * push - d.sy) * 0.15;
                } else {
                    d.sx += (d.ax - d.sx) * 0.1; d.sy += (d.ay - d.sy) * 0.1;
                }
                dfCtx.moveTo(d.sx + rad, d.sy); dfCtx.arc(d.sx, d.sy, rad, 0, TWO_PI);
            }
            dfCtx.fill(); requestAnimationFrame(dfTick);
        }
        resizeDotField(); requestAnimationFrame(dfTick);
    

        document.addEventListener("DOMContentLoaded", () => {
            const menuWrapper = document.getElementById('menu-wrapper');
            document.querySelector('.sm-toggle').addEventListener('click', () => { menuWrapper.classList.toggle('is-open'); });
            document.querySelectorAll('.sm-panel-item').forEach(link => {
                link.addEventListener('click', (e) => {
                    e.preventDefault(); menuWrapper.classList.remove('is-open');
                    const targetElement = document.querySelector(link.getAttribute('href'));
                    if (targetElement) setTimeout(() => { targetElement.scrollIntoView({ behavior: 'smooth' }); }, 400); 
                });
            });
        });
    

        document.addEventListener("DOMContentLoaded", () => {
            const track = document.getElementById('game-gallery-track');
            if (!track) return;
            track.innerHTML += track.innerHTML;
            let progress = 0, speed = 0.5, isDown = false, startX, isHovering = false;
            const viewport = track.parentElement;
            track.addEventListener('mouseenter', () => isHovering = true); track.addEventListener('mouseleave', () => { isHovering = false; isDown = false; });
            viewport.addEventListener('mousedown', (e) => { isDown = true; startX = e.pageX; });
            window.addEventListener('mouseup', () => { isDown = false; });
            window.addEventListener('mousemove', (e) => { if (!isDown) return; e.preventDefault(); progress += (e.pageX - startX); startX = e.pageX; });
            viewport.addEventListener('touchstart', (e) => { isDown = true; startX = e.touches[0].pageX; }, {passive: true});
            window.addEventListener('touchend', () => { isDown = false; });
            window.addEventListener('touchmove', (e) => { if (!isDown) return; progress += (e.touches[0].pageX - startX); startX = e.touches[0].pageX; }, {passive: true});
            function animateGallery() {
                if (!isDown && !isHovering) progress -= speed; else if (!isDown && isHovering) progress -= speed * 0.2; 
                const halfWidth = track.scrollWidth / 2;
                if (Math.abs(progress) >= halfWidth) progress += halfWidth; else if (progress > 0) progress -= halfWidth;
                track.style.transform = `translateX(${progress}px)`; requestAnimationFrame(animateGallery);
            }
            animateGallery();
        });
    

        document.addEventListener("DOMContentLoaded", () => {
            function initScroll() {
                document.querySelectorAll('.game-card').forEach(card => {
                    const wrap = card.querySelector('.game-name-wrapper'); if (!wrap) return;
                    let originalText = wrap.getAttribute('data-text');
                    if (!originalText) {
                        const nameSpan = wrap.querySelector('.game-name');
                        if (nameSpan) { originalText = nameSpan.innerText; wrap.setAttribute('data-text', originalText); }
                    }
                    wrap.innerHTML = `<span class="game-name">${originalText}</span>`; wrap.classList.remove('is-overflow');
                    if (wrap.querySelector('.game-name').scrollWidth - wrap.clientWidth > 0) {
                        wrap.classList.add('is-overflow');
                        wrap.innerHTML = `<div class="marquee-inner"><span class="game-name" style="margin-right: 30px;">${originalText}</span><span class="game-name" style="margin-right: 30px;">${originalText}</span></div>`;
                        wrap.querySelector('.marquee-inner').style.animationDuration = `${wrap.querySelector('.marquee-inner').scrollWidth / 2 / 25}s`;
                    }
                });
            }
            setTimeout(initScroll, 500); window.addEventListener('resize', initScroll);
        });
    

        document.addEventListener("DOMContentLoaded", () => {
            const photoData = [
                { date: '2026.02.09', title: '鱼塘里的三花猫', text: '我猜它应该是吃腻了鱼肉，胡须上还有残渣。', image: 'https://img.scdn.io/i/6a110d968498c_1779502486.webp' },
                { date: '2026.02.09', title: '山水意境', text: '黑白滤镜的登山记录，亭台，远山，水墨重现。', image: 'https://img.scdn.io/i/6a110d9551253_1779502485.webp' },
                { date: '2026.02.09', title: '不知名螺壳', text: '登山无聊，路上拣“喇叭油儿”，看中的就塞在手心里。', image: 'https://img.scdn.io/i/6a110d9496dd4_1779502484.webp' },
                { date: '2026.02.09', title: '光束', text: '底下向上拍的时候，好奇是怎么让一根根细线亮起来的。', image: 'https://img.scdn.io/i/6a110d944dbea_1779502484.webp' },
                { date: '2026.02.14', title: '双年会在北京展览馆', text: '苏味建筑满满，共产主义信念，还有和平鸽。', image: 'https://img.scdn.io/i/6a110d96d0a30_1779502486.webp' },
                { date: '2026.02.14', title: '艺术家的装置', text: '不会操作，差点给人家作品转坏了，工作人员客气地告诉我是怎么用的，时间久了，旁边聚集几位老者，问我这个作品的含义，我侃侃而谈，可能把我当成了作者？', image: 'https://img.scdn.io/i/6a110d8ef225b_1779502478.webp' },
                { date: '2026.02.17', title: '北京·龙潭庙会', text: '逛庙会也花钱，看向湖面，两只鹅组成了心形，我手忙脚乱拍下这一刻。', image: 'https://img.scdn.io/i/6a110d8f60e81_1779502479.webp' },
                { date: '2026.02.17', title: '马·球', text: '庞然大物，无他，拍下。', image: 'https://img.scdn.io/i/6a110d8eab28b_1779502478.webp' },
                { date: '2026.02.18', title: '打铁花', text: '过年的时候看到的一幕，近距离观看太壮观了。', image: 'https://img.scdn.io/i/6a110d93976ff_1779502483.webp' },
                { date: '2026.03.19', title: '莫奈花园', text: '草房子面前摆了一盆老师的花，草房子是莫奈的，花是老师的。', image: 'https://img.scdn.io/i/6a110d92a4c7d_1779502482.webp' }
            ];
            const container = document.getElementById('photo-stack'), infoContent = document.getElementById('photo-info-content');
            if(!container) return;
            let cards = [];
            photoData.forEach((data) => {
                const card = document.createElement('div'); card.className = 'stack-card'; card.innerHTML = `<img src="${data.image}" alt="${data.title}">`;
                card.dataset.rot = (Math.random() * 10 - 5).toFixed(2); container.appendChild(card); cards.push(card);
            });
            let stackOrder = photoData.map((_, i) => i);
            function renderStack() {
                cards.forEach((card, originalIndex) => {
                    const pos = stackOrder.indexOf(originalIndex); if (pos === -1) return;
                    card.style.transition = 'transform 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275), opacity 0.6s ease';
                    card.style.transform = `scale(${1 - pos * 0.06}) rotateZ(${pos * 4 + parseFloat(card.dataset.rot)}deg)`;
                    card.style.zIndex = photoData.length - pos; card.style.opacity = pos < 4 ? 1 - pos * 0.15 : 0;
                    card.style.pointerEvents = pos === 0 ? 'auto' : 'none';
                });
                const topData = photoData[stackOrder[0]];
                infoContent.style.opacity = 0; infoContent.style.transform = 'translateY(10px)';
                setTimeout(() => {
                    document.getElementById('photo-date').textContent = topData.date; document.getElementById('photo-title').textContent = topData.title;
                    document.getElementById('photo-desc').textContent = topData.text; infoContent.style.opacity = 1; infoContent.style.transform = 'translateY(0)';
                }, 300);
            }
            renderStack();
            let isDragging = false, startX = 0, startY = 0, currentX = 0, currentY = 0;
            container.addEventListener('pointerdown', (e) => {
                const topCard = cards[stackOrder[0]]; if (e.target.closest('.stack-card') !== topCard) return;
                isDragging = true; startX = e.clientX; startY = e.clientY; topCard.style.transition = 'none'; topCard.style.cursor = 'grabbing'; topCard.setPointerCapture(e.pointerId);
            });
            container.addEventListener('pointermove', (e) => {
                if (!isDragging) return; e.preventDefault(); currentX = e.clientX - startX; currentY = e.clientY - startY;
                const topCard = cards[stackOrder[0]];
                topCard.style.transform = `translate(${currentX}px, ${currentY}px) rotateX(${Math.max(-60, Math.min(60, currentY * -0.6))}deg) rotateY(${Math.max(-60, Math.min(60, currentX * 0.6))}deg) rotateZ(${parseFloat(topCard.dataset.rot)}deg)`;
            });
            container.addEventListener('pointerup', (e) => {
                if (!isDragging) return; isDragging = false; const topCard = cards[stackOrder[0]]; topCard.style.cursor = 'grab'; topCard.releasePointerCapture(e.pointerId);
                if (Math.abs(currentX) > 100 || Math.abs(currentY) > 100) stackOrder.push(stackOrder.shift());
                currentX = 0; currentY = 0; renderStack();
            });
            container.addEventListener('click', (e) => {
                if (Math.abs(currentX) < 5 && Math.abs(currentY) < 5 && e.target.closest('.stack-card') === cards[stackOrder[0]]) { stackOrder.push(stackOrder.shift()); renderStack(); }
            });
        });
    

        document.addEventListener("DOMContentLoaded", () => {
            const container = document.getElementById('falling-text-container');
            const target = document.getElementById('falling-text-target');
            const canvasContainer = document.getElementById('falling-text-canvas');
            
            if (!container || !target || !canvasContainer) return;

            // 文本内容
            const fullText = "我是一个ENFP，一个腼腆的无趣的，偏执的理性的。在数码的逻辑与艺术的感性之间，我安静地织造着那些破碎又完整的梦。";
            
            // 简单分词逻辑：将英文单词作为整体，汉字单个拆分，标点符号也单独拆分
            const tokenize = (text) => text.match(/[a-zA-Z]+|[^a-zA-Z]/g).flatMap(s => s.match(/[a-zA-Z]+/) ? s : s.split(''));
            
            // 构建 HTML，给每个小块赋予 inline-block 用于获取初始位置
            const createHTML = (text) => tokenize(text).map(t => `<span class="falling-word" style="display:inline-block; will-change: transform; font-family: SimSun, '宋体', serif;">${t === ' ' ? '&nbsp;' : t}</span>`).join('');
            
            target.innerHTML = createHTML(fullText);

            let effectStarted = false;

            container.addEventListener('click', () => {
                if (effectStarted) return;
                effectStarted = true;

                // 隐藏居中的提示文字
                const hint = document.getElementById('falling-hint');
                if (hint) hint.style.opacity = '0';

                // 提取 Matter.js 核心模块
                const Engine = Matter.Engine,
                      Render = Matter.Render,
                      Runner = Matter.Runner,
                      MouseConstraint = Matter.MouseConstraint,
                      Mouse = Matter.Mouse,
                      World = Matter.World,
                      Bodies = Matter.Bodies;

                const engine = Engine.create();
                // 设置重力系数
                engine.world.gravity.y = 1.2; 

                const rect = container.getBoundingClientRect();
                const width = rect.width;
                const height = rect.height;

                // 固定容器的高度，防止因为内部 span 变成 absolute 导致高度塌陷
                container.style.height = `${height}px`;

                // 创建物理世界画布（画布为透明，纯作交互使用）
                const render = Render.create({
                    element: canvasContainer,
                    engine: engine,
                    options: {
                        width,
                        height,
                        background: 'transparent',
                        wireframes: false
                    }
                });
                
                render.canvas.style.position = 'absolute';
                render.canvas.style.top = '0';
                render.canvas.style.left = '0';
                render.canvas.style.pointerEvents = 'auto'; // 确保鼠标能拖拽

                // 物理边界
                const wallOptions = { isStatic: true, render: { fillStyle: 'transparent' } };
                const floor = Bodies.rectangle(width / 2, height + 25, width, 50, wallOptions);
                const leftWall = Bodies.rectangle(-25, height / 2, 50, height, wallOptions);
                const rightWall = Bodies.rectangle(width + 25, height / 2, 50, height, wallOptions);
                const ceiling = Bodies.rectangle(width / 2, -50, width, 50, wallOptions);

                // 获取 DOM 中每个字的包围盒，并生成物理刚体
                const wordSpans = target.querySelectorAll('.falling-word');
                const wordBodies = Array.from(wordSpans).map(elem => {
                    const spanRect = elem.getBoundingClientRect();
                    
                    // 计算以容器为基准的位置
                    const x = spanRect.left - rect.left + spanRect.width / 2;
                    const y = spanRect.top - rect.top + spanRect.height / 2;

                    const body = Bodies.rectangle(x, y, spanRect.width, spanRect.height, {
                        render: { fillStyle: 'transparent' },
                        restitution: 0.8, // 弹性
                        frictionAir: 0.01, // 空气阻力
                        friction: 0.2 // 表面摩擦力
                    });

                    // 给予随机初始爆裂力度
                    Matter.Body.setVelocity(body, {
                        x: (Math.random() - 0.5) * 6,
                        y: (Math.random() - 0.2) * 2
                    });
                    Matter.Body.setAngularVelocity(body, (Math.random() - 0.5) * 0.1);

                    return { elem, body };
                });

                // 为 DOM 元素打上脱离文档流样式的补丁，由物理引擎接管控制权
                wordBodies.forEach(({ elem, body }) => {
                    elem.style.width = `${body.bounds.max.x - body.bounds.min.x}px`;
                    elem.style.height = `${body.bounds.max.y - body.bounds.min.y}px`;
                    elem.style.position = 'absolute';
                    elem.style.margin = '0';
                });

                // 添加鼠标拖拽约束支持
                const mouse = Mouse.create(render.canvas);
                const mouseConstraint = MouseConstraint.create(engine, {
                    mouse: mouse,
                    constraint: {
                        stiffness: 0.2,
                        render: { visible: false }
                    }
                });
                render.mouse = mouse;

                World.add(engine.world, [floor, leftWall, rightWall, ceiling, mouseConstraint, ...wordBodies.map(wb => wb.body)]);

                const runner = Runner.create();
                Runner.run(runner, engine);
                Render.run(render);

                // 通过 requestAnimationFrame 将刚体数据同步回真实 DOM 节点，营造视觉掉落
                const updateLoop = () => {
                    wordBodies.forEach(({ body, elem }) => {
                        const { x, y } = body.position;
                        elem.style.left = '0';
                        elem.style.top = '0';
                        elem.style.transform = `translate(${x - elem.offsetWidth / 2}px, ${y - elem.offsetHeight / 2}px) rotate(${body.angle}rad)`;
                    });
                    requestAnimationFrame(updateLoop);
                };
                updateLoop();
            });
        });
    

