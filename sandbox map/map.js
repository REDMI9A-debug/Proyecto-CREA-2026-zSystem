const locationData = {
    olmedo: {
        title: "La Casa de Olmedo",
        description: "Ubicada en el sector histórico de La Virginia, cruzando el río Babahoyo. Es la emblemática hacienda donde residió el prócer José Joaquín de Olmedo.",
        photo: "Images/casaolmedoflex.jpg", 
        audio: "audio/casadeolmedo.mp4",
        coords: [-1.8006374,-79.5439128]
    },
    boardwalk: {
        title: "Malecón 9 de Octubre",
        description: "Un espacio público de primer orden que bordea la orilla de la ciudad.",
        photo: "Images/maleconflex.webp",
        audio: "audio/malecon.mp4",
        coords: [-1.79834582,-79.5346035]
    },
    cathedral: {
        title: "La Iglesia Catedral",
        description: "Ubicada frente al Parque Central 24 de Mayo. Obra de arquitectura moderna dedicada a la Virgen de la Merced.",
        photo: "Images/catedralflex.webp",
        audio: "audio/catedral.mp4",
        coords: [-1.7989669,-79.53211151]
    },
    cachari: {
        title: "El Cerro Cacharí",
        description: "Formación rocosa a pocos kilómetros de Babahoyo. Famoso por su imponente geografía y la leyenda de la Dama Encantada.",
        photo: "Images/cachariflex.jpg",
        audio: "audio/cerrocachari.mp4",
        coords: [-1.7786348,-79.46358362]
    },
    iess: {
        title: "Hospital General del IESS",
        description: "Un centro de salud clave en la provincia de Los Ríos, encargado de brindar atención médica integral y servicios de especialidad a los afiliados del Instituto Ecuatoriano de Seguridad Social en el cantón y sus alrededores.",
        photo: "Images/iessflex.jpg",
        audio: "audio/iess.mp4",
        coords: [-1.8048837,-79.5216308] 
    },
    "white-raft": {
        title: "La Balsa Blanca",
        description: "El primer Gastro & Bar en el río Babahoyo, Deliciosa Gastronomía y Bebidas, música en vivo, Karaoke, la casa flotante del nuevo malecón.",
        photo: "Images/balsablancaflex.webp",
        audio: "audio/balsablanca.mp4",
        coords: [-1.79929895,-79.53797457] 
    },
    hospital: {
        title: "Hospital General Martín Icaza",
        description: "El centro de salud público más antiguo y emblemático de Babahoyo, fundado para brindar atención médica gratuita y de especialidad a la población de la provincia de Los Ríos y zonas aledañas.",
        photo: "Images/icazaflex.webp",
        audio: "audio/Hospitalmartinicaza.mp4",
        qr: "qrs/qr_hospital.png",
        coords: [-1.7999102,-79.5379936] 
    },
    shopping: {
        title: "Paseo Shopping Babahoyo",
        description: "El principal centro comercial de la ciudad y un importante punto de encuentro social y económico, que ofrece locales comerciales, salas de cine, patio de comidas y entretenimiento para las familias de toda la provincia.",
        photo: "Images/shoppingflex.jpg",
        audio: "audio/paseoshopping.mp4",
        coords: [-1.8129156,-79.5455358] 
    },
    ueb: {
        title: "Unidad Educativa Babahoyo",
        description: "Una de las instituciones educativas más grandes, tradicionales e históricas de la ciudad, encargada de formar a múltiples generaciones de jóvenes babahoyenses bajo altos estándares académicos y de valores.",
        photo: "Images/uebflex.webp",
        audio: "audio/unidadeducativababahoyo.mp4",
        coords: [-1.81110887,-79.54522818] 
    },
    "seafood-market": {
        title: "Mercado de Mariscos de Babahoyo",
        description: "Un punto neurálgico del comercio y la gastronomía local, famoso por la venta diaria de mariscos frescos traídos directamente de la costa y pescados de río capturados por pescadores de la zona.",
        photo: "Images/mariscosshopflex.jpg",
        audio: "audio/mercadodemariscos.mp4",
        coords: [-1.7969138,-79.5308518] 
    },
    prefecture: {
        title: "Prefectura de Los Ríos",
        description: "El edificio principal del Gobierno Autónomo Descentralizado Provincial de Los Ríos, ubicado frente al Redondel de las Banderas. Es la sede administrativa desde donde se planifican y coordinan las obras viales, el desarrollo productivo y los proyectos sociales de toda la provincia.",
        photo: "Images/prefecturaflex.jpg",
        audio: "audio/prefecturadelosrios.mp4",
        coords: [-1.80035958,-79.52299452] 
    },
    government: {
        title: "Gobernación de Los Ríos",
        description: "Sede del poder Ejecutivo en la provincia, ubicada en el centro histórico de Babahoyo frente al Parque 24 de Mayo. Es el edificio histórico donde se coordinan la seguridad, el orden público y las políticas del gobierno nacional en todo el territorio fluminense.",
        photo: "Images/gobernacionflex.png",
        audio: "audio/gobernacion.mp4",
        coords: [-1.7980273,-79.5324852] 
    },
    municipality: {
        title: "Municipio",
        description: "Sede del Gobierno Autónomo Descentralizado Municipal de Babahoyo. Ubicado frente al histórico Parque 24 de Mayo, este edificio es el corazón de la administración cantonal, encargado de planificar las obras, los servicios públicos y el desarrollo de la comunidad babahoyense.",
        photo: "Images/municipioflex.jpg",
        audio: "audio/sedemunicipal.mp4",
        coords: [-1.7978888,-79.5308981] 
    },
    education: {
        title: "Distrito de Educación 12D01",
        description: "La sede administrativa del Ministerio de Educación en el distrito Babahoyo-Baba-Montalvo. Desde este punto se coordinan las políticas educativas, la gestión de las escuelas y colegios públicos, y la atención a docentes, estudiantes y padres de familia de la zona.",
        photo: "Images/mineducflex.jpg",
        audio: "audio/distritoeducativo.mp4",
        coords: [-1.79993829,-79.53699524] 
    },
    cemetery: {
        title: "Cementerio General de Babahoyo",
        description: "El camposanto más antiguo e importante de la ciudad, poseedor de un gran valor histórico, cultural y arquitectónico. En sus mausoleos descansan personajes ilustres que forjaron la historia de Babahoyo y de la provincia de Los Ríos.",
        photo: "Images/cementerioflex.jpg",
        audio: "audio/cementeriogeneral.mp4",
        coords: [-1.802133,-79.5409997] 
    },
    health: {
        title: "Distrito de Salud 12D01",
        description: "La sede administrativa del Ministerio de Salud Pública para el distrito Babahoyo-Baba-Montalvo. Ubicado en la intersección de las calles Bolívar y 5 de Junio, este centro se encarga de gestionar la red de centros de salud, programas de prevención y campañas sanitarias de la región.",
        photo: "Images/minsalflex.png",
        audio: "audio/distritodesalud.mp4",
        coords: [-1.7991276,-79.5315803] 
    },
    justice: {
        title: "Corte Provincial de Justicia de Los Ríos",
        description: "El principal complejo judicial de la provincia, encargado de la administración de justicia, salas de audiencia y defensoría pública. Es una institución clave para el orden constitucional y legal en la región fluminense.",
        photo: "Images/corteprovflex.webp",
        audio: "audio/corteprovincial.mp4",
        coords: [-1.79880054,-79.53094108]
    },
    police: {
        title: "Policía Nacional - Subzona Los Ríos",
        description: "Sede principal del comando policial de la Subzona Los Ríos N.12 en Babahoyo. Este complejo es el núcleo estratégico donde se planifican y coordinan las operaciones de seguridad ciudadana, patrullaje y orden público para todo el cantón y la provincia.",
        photo: "Images/policeflex.png",
        audio: "audio/policianacional.mp4",
        coords: [-1.79966973,-79.53625058] 
    },
};

const map = L.map('map').setView([-1.80040971,-79.53255542], 15);

L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
    attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
    maxZoom: 18
}).addTo(map);

setTimeout(() => {
    map.invalidateSize();
}, 200);

const neonIcon = L.divIcon({
    className: 'neon-marker',
    html: '<div class="classic-pin"></div>',
    iconSize: [24, 24],
    iconAnchor: [12, 24]
});

const modalOverlay = document.getElementById('info-modal');
const closeBtn = document.getElementById('close-btn'); 
const modalTitle = document.getElementById('modal-title');
const modalDescription = document.getElementById('modal-description');
const modalImg = document.getElementById('modal-img');
const modalAudio = document.getElementById('modal-audio');
const modalAudioSrc = document.getElementById('modal-audio-src');
const markers = {};


Object.keys(locationData).forEach(key => {
    const data = locationData[key];
    const marker = L.marker(data.coords, { icon: neonIcon }).addTo(map);

    marker.bindTooltip(data.title, { direction: 'top', offset: [0, -10] });

    marker.on('click', () => {
        openModal(data);
        map.flyTo(data.coords, 16, { duration: 1.5 });
    });

    markers[key] = marker;
});

const listItems = document.querySelectorAll('.list-item');

listItems.forEach(item => {
    item.addEventListener('click', () => {
        const locationID = item.getAttribute('data-location');
        const data = locationData[locationID];

        if (data) {
            openModal(data);
            map.flyTo(data.coords, 16, { duration: 1.5 });
        }
    });
});

function openModal(data) {
    modalAudio.pause();
    
    modalTitle.textContent = data.title;
    modalDescription.textContent = data.description;
    modalImg.src = data.photo;               
    
    modalAudio.src = data.audio; 
    modalAudio.load(); 

    modalOverlay.style.display = 'flex';

    if (data.audio) {
        modalAudio.volume = 0.7;
        modalAudio.play().catch(error => {
            console.log("El navegador bloqueó el auto-play temporalmente:", error);
        });
    }
}
function closeModal() {
    modalOverlay.style.display = 'none';
    
    modalAudio.pause();
    modalAudio.currentTime = 0;
}

closeBtn.addEventListener('click', closeModal); 

modalOverlay.addEventListener('click', (event) => {
    if (event.target === modalOverlay) closeModal();
});

let audioActual = null;

window.addEventListener('resize', () => {
    map.invalidateSize();
});