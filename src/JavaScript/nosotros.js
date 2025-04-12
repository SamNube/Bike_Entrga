 // Initialize AOS animation library
 AOS.init({
    duration: 800,
    offset: 100,
    once: true
});

// Mobile menu toggle
document.getElementById('menuToggle').addEventListener('click', function() {
    document.getElementById('mainNav').classList.toggle('activo');
});

function showSlide(n) {
    slides.forEach(slide => slide.classList.remove('active'));
    dots.forEach(dot => dot.classList.remove('active'));
    
    currentSlide = (n + slides.length) % slides.length;
    
    slides[currentSlide].classList.add('active');
    dots[currentSlide].classList.add('active');
}

// Event listeners for slider controls
prevBtn.addEventListener('click', () => showSlide(currentSlide - 1));
nextBtn.addEventListener('click', () => showSlide(currentSlide + 1));

dots.forEach((dot, index) => {
    dot.addEventListener('click', () => showSlide(index));
});

