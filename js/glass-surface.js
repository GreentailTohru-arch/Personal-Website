// React Bits GlassSurface adapted to native HTML/CSS/JS (no React dependency).
(function () {
    const defaultOptions = {
        borderRadius: 24,
        borderWidth: 0.07,
        brightness: 60,
        opacity: 0.8,
        blur: 11,
        displace: 15,
        backgroundOpacity: 0.08,
        saturation: 1.15,
        distortionScale: -150,
        redOffset: 5,
        greenOffset: 15,
        blueOffset: 25,
        mixBlendMode: 'screen'
    };
    let surfaceId = 0;

    function makeMap(card, config, ids) {
        const rect = card.getBoundingClientRect();
        const width = Math.max(1, rect.width);
        const height = Math.max(1, rect.height);
        const edge = Math.min(width, height) * (config.borderWidth * 0.5);
        const innerWidth = Math.max(1, width - edge * 2);
        const innerHeight = Math.max(1, height - edge * 2);
        const svg = `<svg viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <linearGradient id="${ids.red}" x1="100%" y1="0%" x2="0%" y2="0%"><stop offset="0%" stop-color="#0000"/><stop offset="100%" stop-color="red"/></linearGradient>
                <linearGradient id="${ids.blue}" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stop-color="#0000"/><stop offset="100%" stop-color="blue"/></linearGradient>
            </defs>
            <rect width="${width}" height="${height}" fill="black"/>
            <rect width="${width}" height="${height}" rx="${config.borderRadius}" fill="url(#${ids.red})"/>
            <rect width="${width}" height="${height}" rx="${config.borderRadius}" fill="url(#${ids.blue})" style="mix-blend-mode:${config.mixBlendMode}"/>
            <rect x="${edge}" y="${edge}" width="${innerWidth}" height="${innerHeight}" rx="${config.borderRadius}" fill="hsl(0 0% ${config.brightness}% / ${config.opacity})" style="filter:blur(${config.blur}px)"/>
        </svg>`;
        return `data:image/svg+xml,${encodeURIComponent(svg)}`;
    }

    function supportsSvgBackdropFilter() {
        return CSS.supports?.('backdrop-filter', 'url(#glass-filter)') || CSS.supports?.('-webkit-backdrop-filter', 'url(#glass-filter)');
    }

    function initGlassSurface(selector = '.glass-surface', options = {}) {
        const config = { ...defaultOptions, ...options };
        document.querySelectorAll(selector).forEach(card => {
            if (card.dataset.glassSurfaceReady === 'true') return;
            card.dataset.glassSurfaceReady = 'true';
            const id = `glass-filter-${surfaceId++}`;
            const ids = { filter: id, image: `${id}-image`, red: `${id}-red`, blue: `${id}-blue` };
            const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
            svg.classList.add('glass-surface__filter');
            svg.setAttribute('aria-hidden', 'true');
            svg.innerHTML = `<defs><filter id="${ids.filter}" color-interpolation-filters="sRGB" x="0%" y="0%" width="100%" height="100%">
                <feImage id="${ids.image}" x="0" y="0" width="100%" height="100%" preserveAspectRatio="none" result="map"/>
                <feDisplacementMap in="SourceGraphic" in2="map" scale="${config.distortionScale + config.redOffset}" xChannelSelector="R" yChannelSelector="G" result="red"/>
                <feDisplacementMap in="SourceGraphic" in2="map" scale="${config.distortionScale + config.greenOffset}" xChannelSelector="R" yChannelSelector="G" result="green"/>
                <feDisplacementMap in="SourceGraphic" in2="map" scale="${config.distortionScale + config.blueOffset}" xChannelSelector="R" yChannelSelector="G" result="blue"/>
                <feBlend in="red" in2="green" mode="screen" result="rg"/><feBlend in="rg" in2="blue" mode="screen" result="output"/>
                <feGaussianBlur in="output" stdDeviation="${config.displace}"/>
            </filter></defs>`;
            card.appendChild(svg);
            card.style.setProperty('--glass-frost', config.backgroundOpacity);
            card.style.setProperty('--glass-saturation', config.saturation);
            card.style.setProperty('--filter-id', `url(#${ids.filter})`);
            card.classList.add(supportsSvgBackdropFilter() ? 'glass-surface--svg' : 'glass-surface--fallback');

            const updateMap = () => {
                const image = document.getElementById(ids.image);
                if (image) {
                    const map = makeMap(card, config, ids);
                    image.setAttribute('href', map);
                    image.setAttributeNS('http://www.w3.org/1999/xlink', 'href', map);
                }
            };
            updateMap();
            if (window.ResizeObserver) new ResizeObserver(updateMap).observe(card);
        });
    }

    window.GlassSurface = { init: initGlassSurface };
    document.addEventListener('DOMContentLoaded', () => {
        initGlassSurface();
        window.setTimeout(() => initGlassSurface(), 0);
    });
})();
