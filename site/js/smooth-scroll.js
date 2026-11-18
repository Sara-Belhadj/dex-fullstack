const lenis = new Lenis({
    duration: 1.5,
    smoothWheel: true,
    wheelMultiplier: 0.75,
    touchMultiplier: 1
});

function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
}

requestAnimationFrame(raf);