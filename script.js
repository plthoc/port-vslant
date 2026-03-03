document.addEventListener('DOMContentLoaded', () => {
    // 0. Loading Screen Logic
    document.body.classList.add('loading');
    const loadingScreen = document.getElementById('loading-screen');
    const progressBar = document.getElementById('progress-bar');

    let progress = 0;
    const loadingInterval = setInterval(() => {
        progress += 25;
        if (progress >= 100) progress = 100;

        if (progressBar) {
            progressBar.style.width = `${progress}%`;
        }

        if (progress >= 100) {
            clearInterval(loadingInterval);
            setTimeout(() => {
                if (loadingScreen) loadingScreen.classList.add('hidden');
                setTimeout(() => {
                    document.body.classList.remove('loading');
                    document.body.classList.add('page-loaded');
                }, 400);
            }, 600);
        }
    }, 500);

    // 1. Initialize Lenis for buttery smooth scrolling
    const lenis = new Lenis({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        direction: 'vertical',
        gestureDirection: 'vertical',
        smooth: true,
        smoothTouch: false,
        touchMultiplier: 2,
    });

    function raf(time) {
        lenis.raf(time);
        requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    // 1. Theme Toggle Logic
    const themeToggle = document.getElementById('theme-toggle');
    const themeText = document.querySelector('.switch-text');

    // Check local storage for theme preference
    const savedTheme = localStorage.getItem('theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    // Initialize theme
    if (savedTheme === 'light' || (!savedTheme && !systemPrefersDark)) {
        document.documentElement.setAttribute('data-theme', 'light');
        themeToggle.checked = true;
        themeText.textContent = 'Dark Mode';
    } else {
        document.documentElement.removeAttribute('data-theme');
        themeToggle.checked = false;
        themeText.textContent = 'Light Mode';
    }

    // Handle toggle click
    themeToggle.addEventListener('change', () => {
        if (themeToggle.checked) {
            document.documentElement.setAttribute('data-theme', 'light');
            localStorage.setItem('theme', 'light');
            themeText.textContent = 'Dark Mode';
        } else {
            document.documentElement.removeAttribute('data-theme');
            localStorage.setItem('theme', 'dark');
            themeText.textContent = 'Light Mode';
        }
    });

    // 2. Intersection Observer for Scroll Animations
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.15 // Trigger when 15% of the element is visible
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                // Unobserve after animating once for better performance
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Observe all elements with animation class
    const animatedElements = document.querySelectorAll('.animate-on-scroll');
    animatedElements.forEach(el => observer.observe(el));

    // 4. Parallax effect for gallery items on mouse move
    const galleryItems = document.querySelectorAll('.gallery-item');
    galleryItems.forEach(item => {
        item.addEventListener('mousemove', (e) => {
            const rect = item.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            const centerX = rect.width / 2;
            const centerY = rect.height / 2;

            const rotateX = ((y - centerY) / centerY) * -5; // Max 5deg rotation
            const rotateY = ((x - centerX) / centerX) * 5;

            const img = item.querySelector('img');
            if (img) {
                img.style.transform = `scale(1.08) perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
            }
        });

        item.addEventListener('mouseleave', () => {
            const img = item.querySelector('img');
            if (img) {
                // Return to base scale
                img.style.transform = '';
            }
        });
    });

    // 5. Hyperspace Canvas Animation
    const canvas = document.getElementById('hyperspace-canvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        let stars = [];
        const numStars = 250;
        let speed = 2.5;

        function resizeCanvas() {
            const parent = canvas.parentElement;
            canvas.width = parent.clientWidth;
            canvas.height = parent.clientHeight;
        }

        window.addEventListener('resize', resizeCanvas);
        resizeCanvas();

        function initStars() {
            stars = [];
            for (let i = 0; i < numStars; i++) {
                stars.push({
                    x: Math.random() * canvas.width - canvas.width / 2,
                    y: Math.random() * canvas.height - canvas.height / 2,
                    z: Math.random() * canvas.width,
                    pz: Math.random() * canvas.width
                });
            }
        }
        initStars();

        function animateHyperspace() {
            requestAnimationFrame(animateHyperspace);

            // Background with trailing effect (creates the light speed lines)
            ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            const cx = canvas.width / 2;
            const cy = canvas.height / 2;

            // Optional hover effect: increase speed slightly when mouse is over the footer.
            let currentSpeed = speed;
            if (canvas.parentElement.matches(':hover')) {
                currentSpeed = speed * 4;
            }

            stars.forEach(star => {
                star.z -= currentSpeed;

                if (star.z <= 0) {
                    star.x = Math.random() * canvas.width - canvas.width / 2;
                    star.y = Math.random() * canvas.height - canvas.height / 2;
                    star.z = canvas.width;
                    star.pz = canvas.width;
                }

                const sx = (star.x / star.z) * canvas.width + cx;
                const sy = (star.y / star.z) * canvas.height + cy;

                const px = (star.x / star.pz) * canvas.width + cx;
                const py = (star.y / star.pz) * canvas.height + cy;

                star.pz = star.z;

                const opacity = Math.max(0.1, 1 - (star.z / canvas.width));

                ctx.beginPath();
                ctx.strokeStyle = `rgba(255, 255, 255, ${opacity})`;
                // Stars closer to screen (z smaller) have thicker lines
                ctx.lineWidth = Math.max(0.5, (1 - star.z / canvas.width) * 3);
                ctx.moveTo(px, py);
                ctx.lineTo(sx, sy);
                ctx.stroke();
            });
        }
        animateHyperspace();
    }

    // 6. Map Initialization
    const mapElement = document.getElementById('map');
    if (mapElement) {
        const mapStyles = {
            default: document.documentElement.getAttribute('data-theme') === 'light' ?
                "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json" :
                "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json",
            openstreetmap: "https://tiles.openfreemap.org/styles/bright",
            openstreetmap3d: "https://tiles.openfreemap.org/styles/liberty"
        };

        const map = new maplibregl.Map({
            container: 'map',
            style: mapStyles.default,
            center: [2.2646934, 42.0531706], // Carrer Ausiàs March, Torelló, Spain
            zoom: 15,
            pitch: 0,
            attributionControl: false
        });

        // Add zoom and rotation controls to the map.
        map.addControl(new maplibregl.NavigationControl(), 'top-left');

        const styleSelector = document.getElementById('map-style');
        styleSelector.addEventListener('change', (e) => {
            const selected = e.target.value;
            const is3D = selected === 'openstreetmap3d';

            // Set style
            const newStyle = mapStyles[selected] || mapStyles.default;
            map.setStyle(newStyle);

            // Handle 3D pitch
            if (is3D) {
                map.easeTo({ pitch: 60, duration: 1000 });
            } else {
                map.easeTo({ pitch: 0, duration: 1000 });
            }
        });

        // Listen for theme changes to update default map style if 'default' is selected
        const themeToggleBtn = document.getElementById('theme-toggle');
        if (themeToggleBtn) {
            themeToggleBtn.addEventListener('change', () => {
                const isLight = themeToggleBtn.checked;
                mapStyles.default = isLight ?
                    "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json" :
                    "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json";

                if (styleSelector.value === 'default') {
                    map.setStyle(mapStyles.default);
                }
            });
        }
    }
});
