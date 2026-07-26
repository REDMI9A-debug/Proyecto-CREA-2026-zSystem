// ========================================================
// 1. DATA DICTIONARY (Actualizado con Coordenadas Reales)
// ========================================================
const locationData = {
    olmedo: {
        title: "La Casa de Olmedo",
        description: "Ubicada en el sector histórico de La Virginia, cruzando el río Babahoyo. Es la emblemática hacienda donde residió el prócer José Joaquín de Olmedo.",
        photo: "Images/casaolmedoflex.jpg", 
        audio: "audio/loverisaday.mp3",
        qr: "qrs/qr_olmedo.png",
        coords: [-1.8006374,-79.5439128]
    },
    boardwalk: {
        title: "Malecón 9 de Octubre",
        description: "Un espacio público de primer orden que bordea la orilla de la ciudad.",
        photo: "Images/maleconflex.webp",
        audio: "audio/loverisaday.mp3",
        qr: "qrs/qr_malecon.png",
        coords: [-1.79834582,-79.5346035]
    },
    cathedral: {
        title: "La Iglesia Catedral",
        description: "Ubicada frente al Parque Central 24 de Mayo. Obra de arquitectura moderna dedicada a la Virgen de la Merced.",
        photo: "Images/catedralflex.webp",
        audio: "audio/loverisaday.mp3",
        qr: "qrs/qr_catedral.png",
        coords: [-1.7989669,-79.53211151]
    },
    cachari: {
        title: "El Cerro Cacharí",
        description: "Formación rocosa a pocos kilómetros de Babahoyo. Famoso por su imponente geografía y la leyenda de la Dama Encantada.",
        photo: "Images/cachariflex.jpg",
        audio: "audio/loverisaday.mp3",
        qr: "qrs/qr_cachari.png",
        coords: [-1.7786348,-79.46358362]
    },
    iess: {
        title: "Hospital General del IESS",
        description: "Un centro de salud clave en la provincia de Los Ríos, encargado de brindar atención médica integral y servicios de especialidad a los afiliados del Instituto Ecuatoriano de Seguridad Social en el cantón y sus alrededores.",
        photo: "Images/iessflex.jpg",
        audio: "audio/loverisaday.mp3",
        qr: "qrs/qr_iess.png",
        coords: [-1.8048837,-79.5216308] // Coordenada exacta del Hospital del IESS en Babahoyo
    },
    "white-raft": {
        title: "La Balsa Blanca",
        description: "El primer Gastro & Bar en el río Babahoyo, Deliciosa Gastronomía y Bebidas, música en vivo, Karaoke, la casa flotante del nuevo malecón.",
        photo: "Images/balsablancaflex.webp",
        audio: "audio/loverisaday.mp3",
        qr: "qrs/qr_balsablanca.png",
        coords: [-1.79929895,-79.53797457] // Coordenada exacta en el río Babahoyo, junto al Malecón
    },
    hospital: {
        title: "Hospital General Martín Icaza",
        description: "El centro de salud público más antiguo y emblemático de Babahoyo, fundado para brindar atención médica gratuita y de especialidad a la población de la provincia de Los Ríos y zonas aledañas.",
        photo: "Images/icazaflex.webp",
        audio: "audio/loverisaday.mp3",
        qr: "qrs/qr_hospital.png",
        coords: [-1.7999102,-79.5379936] // Coordenada exacta del Hospital Martín Icaza
    },
    shopping: {
        title: "Paseo Shopping Babahoyo",
        description: "El principal centro comercial de la ciudad y un importante punto de encuentro social y económico, que ofrece locales comerciales, salas de cine, patio de comidas y entretenimiento para las familias de toda la provincia.",
        photo: "Images/shoppingflex.jpg",
        audio: "audio/loverisaday.mp3",
        qr: "qrs/qr_shopping.png",
        coords: [-1.8129156,-79.5455358] // Coordenada exacta del Paseo Shopping Babahoyo
    },
    ueb: {
        title: "Unidad Educativa Babahoyo",
        description: "Una de las instituciones educativas más grandes, tradicionales e históricas de la ciudad, encargada de formar a múltiples generaciones de jóvenes babahoyenses bajo altos estándares académicos y de valores.",
        photo: "Images/uebflex.webp",
        audio: "audio/loverisaday.mp3",
        qr: "qrs/qr_ueb.png",
        coords: [-1.81110887,-79.54522818] // Coordenada exacta de la Unidad Educativa Babahoyo
    },
    "seafood-market": {
        title: "Mercado de Mariscos de Babahoyo",
        description: "Un punto neurálgico del comercio y la gastronomía local, famoso por la venta diaria de mariscos frescos traídos directamente de la costa y pescados de río capturados por pescadores de la zona.",
        photo: "Images/mariscosshopflex.jpg",
        audio: "audio/loverisaday.mp3",
        qr: "qrs/qr_mariscos.png",
        coords: [-1.7969138,-79.5308518] // Coordenada exacta del Mercado de Mariscos
    },
    prefecture: {
        title: "Prefectura de Los Ríos",
        description: "El edificio principal del Gobierno Autónomo Descentralizado Provincial de Los Ríos, ubicado frente al Redondel de las Banderas. Es la sede administrativa desde donde se planifican y coordinan las obras viales, el desarrollo productivo y los proyectos sociales de toda la provincia.",
        photo: "Images/prefecturaflex.jpg",
        audio: "audio/loverisaday.mp3",
        qr: "qrs/qr_prefectura.png",
        coords: [-1.80035958,-79.52299452] // Coordenada calibrada sobre la Av. Universitaria y Clemente Baquerizo
    },
    government: {
        title: "Gobernación de Los Ríos",
        description: "Sede del poder Ejecutivo en la provincia, ubicada en el centro histórico de Babahoyo frente al Parque 24 de Mayo. Es el edificio histórico donde se coordinan la seguridad, el orden público y las políticas del gobierno nacional en todo el territorio fluminense.",
        photo: "Images/gobernacionflex.png",
        audio: "audio/loverisaday.mp3",
        qr: "qrs/qr_gobernacion.png",
        coords: [-1.7980273,-79.5324852] // Coordenada exacta de la Gobernación de Los Ríos frente al parque central
    },
    municipality: {
        title: "Municipio",
        description: "Sede del Gobierno Autónomo Descentralizado Municipal de Babahoyo. Ubicado frente al histórico Parque 24 de Mayo, este edificio es el corazón de la administración cantonal, encargado de planificar las obras, los servicios públicos y el desarrollo de la comunidad babahoyense.",
        photo: "Images/municipioflex.jpg",
        audio: "audio/loverisaday.mp3",
        qr: "qrs/qr_municipio.png",
        coords: [-1.7978888,-79.5308981] // COORDENADA EXACTA: Av. General Barona frente al Parque 24 de Mayo
    },
    education: {
        title: "Distrito de Educación 12D01",
        description: "La sede administrativa del Ministerio de Educación en el distrito Babahoyo-Baba-Montalvo. Desde este punto se coordinan las políticas educativas, la gestión de las escuelas y colegios públicos, y la atención a docentes, estudiantes y padres de familia de la zona.",
        photo: "Images/mineducflex.jpg",
        audio: "audio/loverisaday.mp3",
        qr: "qrs/qr_distrito.png",
        coords: [-1.79993829,-79.53699524] // Coordenada exacta del Distrito de Educación en la Av. Universitaria
    },
    cemetery: {
        title: "Cementerio General de Babahoyo",
        description: "El camposanto más antiguo e importante de la ciudad, poseedor de un gran valor histórico, cultural y arquitectónico. En sus mausoleos descansan personajes ilustres que forjaron la historia de Babahoyo y de la provincia de Los Ríos.",
        photo: "Images/cementerioflex.jpg",
        audio: "audio/loverisaday.mp3",
        qr: "qrs/qr_cementerio.png",
        coords: [-1.802133,-79.5409997] // Coordenada exacta del Cementerio General al norte de la Av. Barona
    },
    health: {
        title: "Distrito de Salud 12D01",
        description: "La sede administrativa del Ministerio de Salud Pública para el distrito Babahoyo-Baba-Montalvo. Ubicado en la intersección de las calles Bolívar y 5 de Junio, este centro se encarga de gestionar la red de centros de salud, programas de prevención y campañas sanitarias de la región.",
        photo: "Images/minsalflex.png",
        audio: "audio/loverisaday.mp3",
        qr: "qrs/qr_salud.png",
        coords: [-1.7991276,-79.5315803] // Coordenada exacta del Distrito de Salud frente a la Catedral
    },
    justice: {
        title: "Corte Provincial de Justicia de Los Ríos",
        description: "El principal complejo judicial de la provincia, encargado de la administración de justicia, salas de audiencia y defensoría pública. Es una institución clave para el orden constitucional y legal en la región fluminense.",
        photo: "Images/corteprovflex.webp",
        audio: "audio/loverisaday.mp3",
        qr: "qrs/qr_corte.png",
        coords: [-1.79880054,-79.53094108] // Coordenada exacta de la Corte de Justicia en la Av. Universitaria
    },
    police: {
        title: "Policía Nacional - Subzona Los Ríos",
        description: "Sede principal del comando policial de la Subzona Los Ríos N.12 en Babahoyo. Este complejo es el núcleo estratégico donde se planifican y coordinan las operaciones de seguridad ciudadana, patrullaje y orden público para todo el cantón y la provincia.",
        photo: "Images/policeflex.png",
        audio: "audio/loverisaday.mp3",
        qr: "qrs/qr_policia.png",
        coords: [-1.79966973,-79.53625058] // Coordenada exacta del Comando de Policía en la Av. Juan X. Marcos
    },
};

// ========================================================
// 2. INICIALIZACIÓN DEL MAPA SATELITAL DE ALTA FIDELIDAD
// ========================================================
// Centramos el mapa en Babahoyo con un zoom de 15 para ver bien los detalles
const map = L.map('map').setView([-1.80040971,-79.53255542], 15);

// Capa Satelital de Esri (Imágenes reales sin textos ni líneas molestas)
L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
    attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
    maxZoom: 18
}).addTo(map);

// Forzamos a Leaflet a recalcular el tamaño del contenedor
setTimeout(() => {
    map.invalidateSize();
}, 200);

// Creamos tu icono personalizado estilo aguja clásica
const neonIcon = L.divIcon({
    className: 'neon-marker',
    html: '<div class="classic-pin"></div>',
    iconSize: [24, 24],
    iconAnchor: [12, 24]
});

// ========================================================
// 3. REFERENCIAS DOM DEL MODAL
// ========================================================
const modalOverlay = document.getElementById('info-modal');
const closeBtn = document.getElementById('close-btn'); // Ojo: en tu nuevo HTML asegúrate que el botón "X" tenga id="close-btn"
const modalTitle = document.getElementById('modal-title');
const modalDescription = document.getElementById('modal-description');
const modalImg = document.getElementById('modal-img'); // ¡Aquí está el nuevo ID apuntando a la tarjeta derecha!
const modalQR = document.getElementById('modal-qr');
const modalAudio = document.getElementById('modal-audio');
const modalAudioSrc = document.getElementById('modal-audio-src');

// Guardaremos los marcadores en un objeto para poder hacerles "flyTo" desde la barra lateral
const markers = {};



// ========================================================
// 4. GENERAR PINES DINÁMICOS EN EL MAPA
// ========================================================
Object.keys(locationData).forEach(key => {
    const data = locationData[key];
    
    // Agregamos el marcador al mapa con las coordenadas reales
    const marker = L.marker(data.coords, { icon: neonIcon }).addTo(map);
    
    // Le agregamos un pequeño tooltip nativo de Leaflet
    marker.bindTooltip(data.title, { direction: 'top', offset: [0, -10] });

    // Cuando el usuario haga click en el pin del mapa, abrimos tu Modal
    marker.on('click', () => {
        openModal(data);
        // Hacemos que el mapa viaje suavemente hacia el pin seleccionado
        map.flyTo(data.coords, 16, { duration: 1.5 });
    });

    // Guardamos el marcador en la memoria
    markers[key] = marker;
});

// ========================================================
// 5. EVENTOS DE LA BARRA LATERAL
// ========================================================
const listItems = document.querySelectorAll('.list-item');

listItems.forEach(item => {
    item.addEventListener('click', () => {
        const locationID = item.getAttribute('data-location');
        const data = locationData[locationID];

        if (data) {
            openModal(data);
            // Si hace click en la lista, el mapa vuela al pin automáticamente
            map.flyTo(data.coords, 16, { duration: 1.5 });
        }
    });
});

// ========================================================
// 6. LÓGICA DEL MODAL (Corregido y Automatizado)
// ========================================================

function openModal(data) {
    // 1. Detener el audio si ya había uno sonando antes
    modalAudio.pause();
    
    // 2. Inyectar los textos, imágenes y QR
    modalTitle.textContent = data.title;
    modalDescription.textContent = data.description;
    modalImg.src = data.photo;               
    modalQR.src = data.qr;
    
    // 3. CAMBIO CRÍTICO: Cargar la ruta directo en la etiqueta principal
    modalAudio.src = data.audio; // <-- Cambias modalAudioSrc por modalAudio
    modalAudio.load(); 

    // 4. Mostrar el contenedor del modal
    modalOverlay.style.display = 'flex';

    // 5. Intentar reproducir el audio automáticamente al abrir
    if (data.audio) {
        modalAudio.volume = 0.7;
        modalAudio.play().catch(error => {
            console.log("El navegador bloqueó el auto-play temporalmente:", error);
        });
    }
}
function closeModal() {
    // 1. Ocultar el modal
    modalOverlay.style.display = 'none';
    
    // 2. Apagar el audio en seco y resetear el buscador al segundo cero
    modalAudio.pause();
    modalAudio.currentTime = 0;
}

// Eventos de cierre
closeBtn.addEventListener('click', closeModal); 

modalOverlay.addEventListener('click', (event) => {
    if (event.target === modalOverlay) closeModal();
});

// ========================================================
// 7. BOTÓN DE AYUDA FLOTANTE
// ========================================================

// Variable global para controlar que no se dupliquen los sonidos
let audioActual = null;