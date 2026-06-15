document.addEventListener('DOMContentLoaded', () => {
    
    // ==========================================
    // MODALES ORIGINALES & MAPAS
    // ==========================================
    const btnVerde = document.getElementById('abrirModal');
    const btnX = document.getElementById('cerrarModal');
    const ventanaModal = document.getElementById('modalOlmedo');

    if (btnVerde && ventanaModal) {
        btnVerde.onclick = function(e) {
            e.preventDefault(); 
            ventanaModal.style.display = 'flex'; 
        };
    }
    if (btnX && ventanaModal) {
        btnX.onclick = function() { ventanaModal.style.display = 'none'; };
    }

    window.onclick = function(event) {
        if (event.target == ventanaModal) ventanaModal.style.display = 'none';
        const modalMapa = document.getElementById('modal-mapa');
        if (event.target == modalMapa) modalMapa.style.display = 'none';
    };

    // ==========================================
    // UNIFICACIÓN: MODO ATARDECER LÓGICA LIMPIA
    // ==========================================
    const btnAtardecer = document.getElementById('toggle-atardecer');
    const mainLogo = document.getElementById('main-logo');

    if (btnAtardecer && mainLogo) {
        btnAtardecer.onclick = function(e) {
            e.preventDefault();
            
            document.body.classList.toggle('modo-atardecer');
            
            const esAtardecer = document.body.classList.contains('modo-atardecer');

            if (esAtardecer) {
                mainLogo.src = 'atardecerlogo.png';
                btnAtardecer.innerText = '🌿'; 
                console.log("Modo Atardecer activado");
            } else {
                mainLogo.src = 'normallogo.png';
                btnAtardecer.innerText = '🌅'; 
                console.log("Modo Original activado");
            }
        };
    }
});

// ==========================================
// FUNCIÓN DE MAPAS
// ==========================================
function abrirMapa(lugar) {
    const modalGeneral = document.getElementById('modal-mapa');
    const datos = infoLugares[lugar];
    if (datos && modalGeneral) {
        document.getElementById('modal-img').src = datos.img; 
        document.getElementById('modal-titulo').innerText = datos.titulo;
        document.getElementById('modal-descripcion').innerText = datos.desc;
        const btnMaps = document.getElementById('modal-enlace-maps');
        if (btnMaps) btnMaps.href = datos.maps;
        modalGeneral.style.display = 'flex'; 
    }
}

const infoLugares = {
    'salto': { img: 'playairresistible.png', titulo: 'Playas del Salto', desc: 'Nuestra joya de agua dulce.', maps: 'https://maps.app.goo.gl/ZAJLvMW7HEKCQ5uMA' },
    'malecon': { img: 'malecon9octubre.png', titulo: 'Malecón 9 de Octubre', desc: 'Un paseo hermoso junto al río.', maps: 'https://maps.app.goo.gl/HbZXgX2pe7R8TNweA' },
    'olmedo': { img: 'casadeolmedo2.png', titulo: 'Casa de Olmedo', desc: 'Museo histórico.', maps: 'https://maps.app.goo.gl/BZhYJ78X1uEBzjsS6' },
    'cachari': { img: 'cerrocachari.png', titulo: 'Cerro Cacharí', desc: 'Aventura y leyendas.', maps: 'https://maps.app.goo.gl/d6So5A2NRUFGqH5E9' },
    'catedral': { img: 'actualidadbabah.png', titulo: 'Iglesia Catedral', desc: 'Ícono arquitectónico.', maps: 'https://maps.app.goo.gl/UuiECcSewRbSceFw7' },
    'parque': { img: 'parque24mayo.png', titulo: 'Parque 24 de Mayo', desc: 'Corazón de la ciudad.', maps: 'https://maps.app.goo.gl/44AmsLvh42ECev6F9' }
};

function cerrarMapa() {
    const modalGeneral = document.getElementById('modal-mapa');
    if (modalGeneral) modalGeneral.style.display = 'none';
}

// ==========================================
// ENGINE DEL CARRUSEL INTERACTIVO
// ==========================================
document.addEventListener("DOMContentLoaded", () => {
    const carouselSection = document.getElementById('heroCarouselSection');
    const slides = document.querySelectorAll('.carousel-slide');
    
    if (!carouselSection || slides.length === 0) return;

    let currentSlideIndex = 0;
    let carouselTimer = null;
    const intervalTime = 3000;

    function changeSlide() {
        slides[currentSlideIndex].classList.remove('active');
        currentSlideIndex = (currentSlideIndex + 1) % slides.length;
        slides[currentSlideIndex].classList.add('active');
    }

    function startCarousel() {
        if (carouselTimer === null) {
            carouselTimer = setInterval(changeSlide, intervalTime);
        }
    }

    function stopCarousel() {
        if (carouselTimer !== null) {
            clearInterval(carouselTimer);
            carouselTimer = null; 
        }
    }

    carouselSection.addEventListener('mouseenter', () => stopCarousel());
    carouselSection.addEventListener('mouseleave', () => startCarousel());

    slides.forEach(slide => {
        const bgStyle = slide.style.backgroundImage;
        const urlMatch = bgStyle.match(/url\(['"]?([^'"]+)['"]?\)/);
        if (urlMatch && urlMatch[1]) {
            const img = new Image();
            img.src = urlMatch[1]; 
        }
    });

    startCarousel();
});

// ==========================================
// TOGGLES SÍMBOLOS PATRIOS
// ==========================================
document.addEventListener("DOMContentLoaded", () => {
    const btnToggle = document.getElementById('btn-toggle-simbolos');
    const epocaHistorica = document.getElementById('epoca-historica');
    const epocaActual = document.getElementById('epoca-actual');
    
    let viendoHistoricos = true;

    if (!btnToggle || !epocaHistorica || !epocaActual) return;

    btnToggle.addEventListener('click', () => {
        if (viendoHistoricos) {
            epocaHistorica.classList.remove('activa');
            epocaHistorica.classList.add('oculta');
            
            epocaActual.classList.remove('oculta');
            epocaActual.classList.add('activa');
            
            btnToggle.innerHTML = 'Ver Símbolos Históricos <i class="fas fa-history"></i>';
            viendoHistoricos = false;
        } else {
            epocaActual.classList.remove('activa');
            epocaActual.classList.add('oculta');
            
            epocaHistorica.classList.remove('oculta');
            epocaHistorica.classList.add('activa');
            
            btnToggle.innerHTML = 'Revelar Símbolos Actuales <i class="fas fa-arrow-right"></i>';
            viendoHistoricos = true;
        }
    });
});