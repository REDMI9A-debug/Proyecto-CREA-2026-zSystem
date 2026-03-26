document.addEventListener('DOMContentLoaded', () => {
    
    // MODALES ORIGINALES
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
    'salto': { img: 'playairresistible.png', titulo: 'Playas del Salto', desc: 'Nuestra joya de agua dulce.', maps: '...' },
    'malecon': { img: 'malecon9octubre.png', titulo: 'Malecón 9 de Octubre', desc: 'Un paseo hermoso junto al río.', maps: '...' },
    'olmedo': { img: 'casadeolmedo2.png', titulo: 'Casa de Olmedo', desc: 'Museo histórico.', maps: '...' },
    'cachari': { img: 'cerrocachari.png', titulo: 'Cerro Cacharí', desc: 'Aventura y leyendas.', maps: '...' },
    'catedral': { img: 'actualidadbabah.png', titulo: 'Iglesia Catedral', desc: 'Ícono arquitectónico.', maps: '...' },
    'parque': { img: 'parque24mayo.png', titulo: 'Parque 24 de Mayo', desc: 'Corazón de la ciudad.', maps: '...' }
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
// fin del js