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
    // Modo atardecer 
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
// Mi funcion de mapas
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

// ==========================================================================
// 🎠 MOTOR DEL CARRUSEL 1: HERO PRINCIPAL (INDEPENDIENTE)
// ==========================================================================
document.addEventListener("DOMContentLoaded", () => {
    const sectionHero = document.getElementById('heroCarouselSection');
    const slidesHero = document.querySelectorAll('#heroCarouselSection .carousel-slide');
    
    // Si no existe este carrusel en la página, frena este bloque
    if (!sectionHero || slidesHero.length === 0) return;

    let indexHero = 0;
    let timerHero = null;

    function cambiarSlideHero() {
        slidesHero[indexHero].classList.remove('active');
        indexHero = (indexHero + 1) % slidesHero.length;
        slidesHero[indexHero].classList.add('active');
    }

    function activarTimerHero() {
        if (timerHero === null) {
            timerHero = setInterval(cambiarSlideHero, 3000);
        }
    }

    function desactivarTimerHero() {
        if (timerHero !== null) {
            clearInterval(timerHero);
            timerHero = null;
        }
    }

    // Eventos de pausa independientes para el Hero
    sectionHero.addEventListener('mouseenter', desactivarTimerHero);
    sectionHero.addEventListener('mouseleave', activarTimerHero);

    // Arrancar el primer carrusel
    activarTimerHero();
});

// ==========================================
// Los toggles de mis simbolos patrios
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

// ==========================================================================
// 🎓 MOTOR DEL CARRUSEL 2: HOMENAJE DE DESPEDIDA (INDEPENDIENTE)
// ==========================================================================
document.addEventListener("DOMContentLoaded", () => {
    const sectionUltimate = document.getElementById('heroCarouselSection-ultimate');
    const slidesUltimate = document.querySelectorAll('#heroCarouselSection-ultimate .carousel-slide-n');
    
    // Si no existe este carrusel en la página, frena este bloque
    if (!sectionUltimate || slidesUltimate.length === 0) return;

    let indexUltimate = 0;
    let timerUltimate = null;

    function cambiarSlideUltimate() {
        slidesUltimate[indexUltimate].classList.remove('active');
        indexUltimate = (indexUltimate + 1) % slidesUltimate.length;
        slidesUltimate[indexUltimate].classList.add('active');
    }

    function activarTimerUltimate() {
        if (timerUltimate === null) {
            timerUltimate = setInterval(cambiarSlideUltimate, 1000);
        }
    }

    function desactivarTimerUltimate() {
        if (timerUltimate !== null) {
            clearInterval(timerUltimate);
            timerUltimate = null;
        }
    }

    // Eventos de pausa independientes para la Despedida
    sectionUltimate.addEventListener('mouseenter', desactivarTimerUltimate);
    sectionUltimate.addEventListener('mouseleave', activarTimerUltimate);

    // Arrancar el segundo carrusel
    activarTimerUltimate();
});