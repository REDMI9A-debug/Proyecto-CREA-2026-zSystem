document.addEventListener('DOMContentLoaded', () => {
    
    // MODALES ORIGINALESsss
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

    // LÓGICA DEL ATARDECER (SIN TOCAR NADA MÁS)
    const btnAtardecer = document.getElementById('toggle-atardecer');
    if (btnAtardecer) {
        btnAtardecer.onclick = function(e) {
            e.preventDefault();
            document.body.classList.toggle('modo-atardecer');
            btnAtardecer.innerText = document.body.classList.contains('modo-atardecer') ? '🌿' : '🌅';
        };
    }

    // CIERRE GLOBAL
    window.onclick = function(event) {
        if (event.target == ventanaModal) ventanaModal.style.display = 'none';
        const modalMapa = document.getElementById('modal-mapa');
        if (event.target == modalMapa) modalMapa.style.display = 'none';
    };
});

// TU FUNCIÓN DE MAPAS (QUEDA IGUAL)
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
    'salto': { img: 'playairresistible.png', 
        titulo: 'Playas del Salto', 
        desc: 'Nuestra joya de agua dulce.', 
        maps: 'https://maps.app.goo.gl/ZAJLvMW7HEKCQ5uMA' },
    'malecon': { img: 'malecon9octubre.png', 
        titulo: 'Malecón 9 de Octubre', 
        desc: 'Un paseo hermoso junto al río.',
        maps: 'https://maps.app.goo.gl/HbZXgX2pe7R8TNweA' },
    'olmedo': { img: 'casadeolmedo2.png', 
        titulo: 'Casa de Olmedo', 
        desc: 'Museo histórico.', 
        maps: 'https://maps.app.goo.gl/BZhYJ78X1uEBzjsS6' },
    'cachari': { img: 'cerrocachari.png', 
        titulo: 'Cerro Cacharí', 
        desc: 'Aventura y leyendas.', 
        maps: 'https://maps.app.goo.gl/d6So5A2NRUFGqH5E9' },
    'catedral': { img: 'actualidadbabah.png', 
        titulo: 'Iglesia Catedral', 
        desc: 'Ícono arquitectónico.', 
        maps: 'https://maps.app.goo.gl/UuiECcSewRbSceFw7' },
    'parque': { img: 'parque24mayo.png', 
        titulo: 'Parque 24 de Mayo', 
        desc: 'Corazón de la ciudad.', 
        maps: 'https://maps.app.goo.gl/44AmsLvh42ECev6F9' }
};

function cerrarMapa() {
    const modalGeneral = document.getElementById('modal-mapa');
    if (modalGeneral) modalGeneral.style.display = 'none';
}

// Lógica para el Modo Atardecer sin tocar tus funciones actuales
const btnAtardecer = document.getElementById('toggle-atardecer');

if (btnAtardecer) {
    btnAtardecer.onclick = function(e) {
        e.preventDefault();
        // Solo ponemos o quitamos la clase, el CSS hace el resto
        document.body.classList.toggle('modo-atardecer');
        
        // Cambiamos el emoji según el modo
        if (document.body.classList.contains('modo-atardecer')) {
            btnAtardecer.innerText = '🌿'; 
            console.log("Modo Atardecer activado");
        } else {
            btnAtardecer.innerText = '🌅'; 
            console.log("Modo Original activado");
        }
    };
}
document.addEventListener('DOMContentLoaded', () => {
    const btnAtardecer = document.getElementById('toggle-atardecer');
    const mainLogo = document.getElementById('main-logo');

    if (btnAtardecer && mainLogo) {
        btnAtardecer.onclick = function(e) {
            e.preventDefault();
            
            // 1. Activa/Desactiva la clase en el body
            document.body.classList.toggle('modo-atardecer');
            
            const esAtardecer = document.body.classList.contains('modo-atardecer');

            // 2. Cambia el logo según el modo
            if (esAtardecer) {
                mainLogo.src = 'atardecerlogo.png'; // Tu logo naranja
                btnAtardecer.innerText = '🌿'; // Cambia el emoji a hoja para volver
            } else {
                mainLogo.src = 'normallogo.png'; // Tu logo verde
                btnAtardecer.innerText = '🌅'; // Vuelve al emoji de atardecer
            }
        };
    }
});

// Nuevas logicas implementadas para cada seccion

/**
 * ENGINE DEL CARRUSEL INTERACTIVO - VOCES DE BABAHOYO
 * Controla transiciones, precarga de imágenes y pausas por interacción del usuario.
 */
document.addEventListener("DOMContentLoaded", () => {
    const carouselSection = document.getElementById('heroCarouselSection');
    const slides = document.querySelectorAll('.carousel-slide');
    
    // Si la sección o los slides no existen en la página actual, rompemos la ejecución para evitar errores en consola
    if (!carouselSection || slides.length === 0) return;

    let currentSlideIndex = 0;
    let carouselTimer = null;
    const intervalTime = 3000; // 5 segundos por imagen

    // --- 1. FUNCIÓN CORE: CAMBIO DE SLIDE ---
    function changeSlide() {
        // Removemos la clase activa del elemento actual
        slides[currentSlideIndex].classList.remove('active');
        
        // Calculamos el siguiente índice de forma cíclica (0, 1, 2 -> 0, 1, 2)
        currentSlideIndex = (currentSlideIndex + 1) % slides.length;
        
        // Añadimos la clase activa al nuevo elemento para disparar el fade-in de CSS
        slides[currentSlideIndex].classList.add('active');
    }

    // --- 2. CONTROLES DEL TEMPORIZADOR (START / STOP) ---
    function startCarousel() {
        // Evitamos duplicar timers si ya hay uno corriendo
        if (carouselTimer === null) {
            carouselTimer = setInterval(changeSlide, intervalTime);
        }
    }

    function stopCarousel() {
        if (carouselTimer !== null) {
            clearInterval(carouselTimer);
            carouselTimer = null; // Limpiamos la referencia
        }
    }

    // --- 3. LISTENERS DE INTERACCIÓN (UX PREMIUM) ---
    // Si el usuario pasa el mouse por encima del Hero, pausamos el carrusel para no distraerlo
    carouselSection.addEventListener('mouseenter', () => {
        stopCarousel();
    });

    // Cuando el mouse sale del Hero, reactivamos el temporizador automáticamente
    carouselSection.addEventListener('mouseleave', () => {
        startCarousel();
    });

    // --- 4. PRECARGA DE IMÁGENES EN MEMORIA ---
    // Extraemos las URLs de los estilos inline del HTML y las forzamos a cargar en segundo plano
    slides.forEach(slide => {
        const bgStyle = slide.style.backgroundImage;
        // Filtramos la URL limpia ignorando los gradientes lineales
        const urlMatch = bgStyle.match(/url\(['"]?([^'"]+)['"]?\)/);
        if (urlMatch && urlMatch[1]) {
            const img = new Image();
            img.src = urlMatch[1]; 
        }
    });

    // --- 5. IGNICIÓN ---
    // Arrancamos el carrusel por primera vez
    startCarousel();
});
// fin del js