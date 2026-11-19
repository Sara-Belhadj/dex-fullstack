const lenis = new Lenis({
    duration: 1.5,
    smoothWheel: true,
    wheelMultiplier: 0.75,
    touchMultiplier: 1,
    autoResize: true
});

function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
}

requestAnimationFrame(raf);

// Rend Lenis accessible après les changements de Vue
window.lenis = lenis;