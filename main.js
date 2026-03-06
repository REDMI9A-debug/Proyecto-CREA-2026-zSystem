// Inicialización de la librería de animaciones AOS
AOS.init({
    duration: 1000, // Duración de la animación en milisegundos
    once: true,     // Define si la animación debe ocurrir solo una vez al bajar
    mirror: false,  // Define si los elementos deben animarse al hacer scroll hacia arriba
});

// veo si puedo agregar más funciones interactivas más adelante
console.log("Main.js cargado correctamente vlo");
const modal = document.getElementById("modalOlmedo");
const btnAbrir = document.getElementById("abrirModal");
const btnCerrar = document.getElementById("cerrarModal");

// Abrir Modal
btnAbrir.onclick = function() {
    modal.style.display = "flex";
    document.body.style.overflow = "hidden"; // Bloquea el scroll del fondo
}

// Cerrar Modal
btnCerrar.onclick = function() {
    modal.style.display = "none";
    document.body.style.overflow = "auto"; // Libera el scroll osea se encarga de el
}

// Cerrar si hace clic fuera del contenido solo eso
window.onclick = function(event) {
    if (event.target == modal) {
        modal.style.display = "none";
        document.body.style.overflow = "auto";
    }
}
// --- BASE DE DATOS DE TURISMO ---
const infoTurismo = {
    'salto': {
        titulo: 'Playas del Salto',
        img: 'ruta-a-tu-imagen/playas-salto.jpg',
        historia: 'Es el principal atractivo turístico de Babahoyo durante la época playera. Sus aguas dulces y tranquilas son el escenario perfecto para las famosas regatas y deportes acuáticos.',
        comoLlegar: 'Se encuentra cruzando el río Babahoyo, accesible mediante botes desde el malecón o por la vía terrestre.',
        mapa: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3989.1!2d-79.5!3d-1.8!' // Ejemplo de link
    },
    'malecon': {
        titulo: 'Malecón 9 de Octubre',
        img: 'ruta-a-tu-imagen/malecon.jpg',
        historia: 'Considerado uno de los malecones más bellos de la región, ofrece una vista espectacular del río y las famosas casas flotantes.',
        comoLlegar: 'Ubicado en pleno centro de la ciudad, sobre la Av. 9 de Octubre.',
        mapa: 'LINK_DE_GOOGLE_MAPS'
    },
    'olmedo': {
        titulo: 'Casa de Olmedo',
        img: 'ruta-a-tu-imagen/casa-olmedo.jpg',
        historia: 'Lugar histórico donde José Joaquín de Olmedo escribió parte de su obra y donde se firmó el Tratado de la Virginia.',
        comoLlegar: 'Ubicada en la orilla opuesta de la ciudad, se puede llegar cruzando el puente peatonal.',
        mapa: 'LINK_DE_GOOGLE_MAPS'
    },
    'cachari': {
        titulo: 'Cerro Cacharí',
        img: 'ruta-a-tu-imagen/cerro-cachari.jpg',
        historia: 'Un macizo rocoso rodeado de leyendas. Es el lugar ideal para el senderismo y para observar la biodiversidad de la zona.',
        comoLlegar: 'A 15 minutos de la ciudad en vehículo, vía a la parroquia Barreiro.',
        mapa: 'LINK_DE_GOOGLE_MAPS'
    }
};

// --- FUNCIONES DEL MODAL ---
function abrirModalTurismo(id) {
    const lugar = infoTurismo[id];
    if (!lugar) return;

    // Llenar la información en el modal
    document.getElementById('modal-titulo').innerText = lugar.titulo;
    document.getElementById('modal-img').src = lugar.img;
    document.getElementById('modal-descripcion').innerText = lugar.historia;
    document.getElementById('modal-como-llegar').innerText = lugar.comoLlegar;
    
    // Mostrar el modal (usando el display flex que ya tienes en CSS)
    document.getElementById('modal-turismo').style.display = 'flex';
    document.body.style.overflow = 'hidden'; // Bloquea el scroll del fondo
}

function cerrarModal() {
    document.getElementById('modal-turismo').style.display = 'none';
    document.body.style.overflow = 'auto'; // Devuelve el scroll
}

// Cerrar si hacen clic afuera del cuadro blanco
window.onclick = function(event) {
    const modal = document.getElementById('modal-turismo');
    if (event.target == modal) {
        cerrarModal();
    }
}