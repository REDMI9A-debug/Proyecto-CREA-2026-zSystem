/* ==========================================================================
   🗺️ BASE DE DATOS Y FUNCIONES GLOBALES (MAPAS)
   Nota: Se declaran fuera de los bloques de carga para poder ser llamadas 
   directamente desde el HTML (ej. onclick="abrirMapa('salto')").
   ========================================================================== */
const infoLugares = {
    'salto': { 
        img: 'playairresistible.png', 
        titulo: 'Playas del Salto', 
        desc: 'Nuestra joya de agua dulce.', 
        maps: 'https://maps.app.goo.gl/ZAJLvMW7HEKCQ5uMA' 
    },
    'malecon': { 
        img: 'malecon9octubre.png', 
        titulo: 'Malecón 9 de Octubre', 
        desc: 'Un paseo hermoso junto al río.', 
        maps: 'https://maps.app.goo.gl/HbZXgX2pe7R8TNweA' 
    },
    'olmedo': { 
        img: 'casadeolmedo2.png', 
        titulo: 'Casa de Olmedo', 
        desc: 'Museo histórico.', 
        maps: 'https://maps.app.goo.gl/BZhYJ78X1uEBzjsS6' 
    },
    'cachari': { 
        img: 'cerrocachari.png', 
        titulo: 'Cerro Cacharí', 
        desc: 'Aventura y leyendas.', 
        maps: 'https://maps.app.goo.gl/d6So5A2NRUFGqH5E9' 
    },
    'catedral': { 
        img: 'actualidadbabah.png', 
        titulo: 'Iglesia Catedral', 
        desc: 'Ícono arquitectónico.', 
        maps: 'https://maps.app.goo.gl/UuiECcSewRbSceFw7' 
    },
    'parque': { 
        img: 'parque24mayo.png', 
        titulo: 'Parque 24 de Mayo', 
        desc: 'Corazón de la ciudad.', 
        maps: 'https://maps.app.goo.gl/44AmsLvh42ECev6F9' 
    }
};

function abrirMapa(lugar) {
    const modalGeneral = document.getElementById('modal-mapa');
    const datos = infoLugares[lugar];
    
    if (datos && modalGeneral) {
        document.getElementById('modal-img').src = datos.img; 
        document.getElementById('modal-titulo').innerText = datos.titulo;
        document.getElementById('modal-descripcion').innerText = datos.desc;
        
        const btnMaps = document.getElementById('modal-enlace-maps');
        if (btnMaps) {
            btnMaps.href = datos.maps;
        }
        
        modalGeneral.style.display = 'flex'; 
    }
}

function cerrarMapa() {
    const modalGeneral = document.getElementById('modal-mapa');
    if (modalGeneral) {
        modalGeneral.style.display = 'none';
    }
}


/* ==========================================================================
   🛠️ MÓDULO 1: MODALES ORIGINALES Y MODO ATARDECER
   ========================================================================== */
document.addEventListener('DOMContentLoaded', () => {
    
    // --- Modales Originales ---
    const btnVerde = document.getElementById('abrirModal');
    const btnX = document.getElementById('cerrarModal');
    const ventanaModal = document.getElementById('modalOlmedo');
    const modalMapa = document.getElementById('modal-mapa');

    // Reemplazamos .onclick por addEventListener para evitar choques de eventos
    if (btnVerde && ventanaModal) {
        btnVerde.addEventListener('click', (e) => {
            e.preventDefault(); 
            ventanaModal.style.display = 'flex'; 
        });
    }

    if (btnX && ventanaModal) {
        btnX.addEventListener('click', () => {
            ventanaModal.style.display = 'none'; 
        });
    }

    // Cierre seguro de los modales al hacer clic afuera en el fondo oscuro
    window.addEventListener('click', (event) => {
        if (event.target === ventanaModal) {
            ventanaModal.style.display = 'none';
        }
        if (modalMapa && event.target === modalMapa) {
            modalMapa.style.display = 'none';
        }
    });

    // --- Modo Atardecer ---
    const btnAtardecer = document.getElementById('toggle-atardecer');
    const mainLogo = document.getElementById('main-logo');

    if (btnAtardecer && mainLogo) {
        btnAtardecer.addEventListener('click', (e) => {
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
        });
    }
});


/* ==========================================================================
   🎠 MÓDULO 2: MOTOR DEL CARRUSEL 1 (HERO PRINCIPAL)
   ========================================================================== */
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

    // Eventos de pausa independientes al poner el mouse encima
    sectionHero.addEventListener('mouseenter', desactivarTimerHero);
    sectionHero.addEventListener('mouseleave', activarTimerHero);

    // Arrancar el carrusel
    activarTimerHero();
});


/* ==========================================================================
   🏛️ MÓDULO 3: TOGGLES DE SÍMBOLOS PATRIOS
   ========================================================================== */
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


/* ==========================================================================
   🎓 MÓDULO 4: MOTOR DEL CARRUSEL 2 (HOMENAJE DESPEDIDA)
   ========================================================================== */
document.addEventListener("DOMContentLoaded", () => {
    const sectionUltimate = document.getElementById('heroCarouselSection-ultimate');
    const slidesUltimate = document.querySelectorAll('#heroCarouselSection-ultimate .carousel-slide-n');
    
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

    sectionUltimate.addEventListener('mouseenter', desactivarTimerUltimate);
    sectionUltimate.addEventListener('mouseleave', activarTimerUltimate);

    activarTimerUltimate();
});


/* ==========================================================================
   🚍 MÓDULO 5: ENGINE DEL SLIDER HORIZONTAL DE BUSES URBANOS
   ========================================================================== */
document.addEventListener("DOMContentLoaded", () => {
    const riel = document.getElementById('rielBusesUrbano');
    const btnPrev = document.getElementById('btnBusPrev');
    const btnNext = document.getElementById('btnBusNext');
    const puntos = document.querySelectorAll('.punto-bus');
    
    if (!riel || !btnPrev || !btnNext) return;

    let posicionActual = 0;
    const totalCards = 5; // Las 5 líneas fijas

    function moverSlider() {
        riel.style.transform = `translateX(-${posicionActual * 20}%)`; 
        actualizarPuntos();
    }

    function actualizarPuntos() {
        puntos.forEach((punto, i) => {
            if (i === posicionActual) {
                punto.classList.add('activo');
            } else {
                punto.classList.remove('activo');
            }
        });
    }

    btnNext.addEventListener('click', () => {
        if (posicionActual < totalCards - 1) {
            posicionActual++;
        } else {
            posicionActual = 0; // Bucle al inicio
        }
        moverSlider();
    });

    btnPrev.addEventListener('click', () => {
        if (posicionActual > 0) {
            posicionActual--;
        } else {
            posicionActual = totalCards - 1; // Salta al último
        }
        moverSlider();
    });

    puntos.forEach(punto => {
        punto.addEventListener('click', (e) => {
            posicionActual = parseInt(e.target.getAttribute('data-index'));
            moverSlider();
        });
    });
});


/* ==========================================================================
   🚌 MÓDULO 6: ENGINE ACORDEÓN BUSES INTERPROVINCIALES
   ========================================================================== */
document.addEventListener("DOMContentLoaded", () => {
    const panelesBuses = document.querySelectorAll('.panel-bus');
    
    if (panelesBuses.length === 0) return;

    // Función interna para resetear estados antes de abrir uno nuevo
    function borrarClasesActivas() {
        panelesBuses.forEach(panel => {
            panel.classList.remove('activa');
        });
    }

    panelesBuses.forEach(panel => {
        panel.addEventListener('click', () => {
            borrarClasesActivas();
            panel.classList.add('activa');
        });
    });
});

// ========================================================
// 1. CONFIGURACIÓN DE LA API DE GROQ Y ARCHIVO PDF
// ========================================================
const API_KEY = "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"; 
const API_URL = "https://api.groq.com/openai/v1/chat/completions";

// Ruta de tu archivo PDF en la carpeta raíz de tu proyecto
const PDF_RUTA = "Documents/babahoyoinfo.docx"; 

// Variable global donde se guardará el texto extraído del PDF
let documentoPdfContexto = "";

// Cargar la librería PDF.js desde un CDN de forma dinámica
const pdfjsLib = window['pdfjs-dist/build/pdf'];
// Especificamos el worker de PDF.js para que procese el archivo en segundo plano
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js';

// ELEMENTOS DEL DOM (Lógica de chat)
const chatForm = document.getElementById('chat-form');
const chatInput = document.getElementById('chat-user-input');
const chatMessagesArea = document.querySelector('.chat-messages');

// ========================================================
// 2. FUNCIÓN PARA LEER EL PDF Y EXTRAER EL TEXTO
// ========================================================
async function extraerTextoDePDF() {
    try {
        console.log("Iniciando lectura del PDF...");
        const cargandoPdf = pdfjsLib.getDocument(PDF_RUTA);
        const pdf = await cargandoPdf.promise;
        
        let textoCompleto = "";
        
        for (let i = 1; i <= pdf.numPages; i++) {
            const pagina = await pdf.getPage(i);
            const contenidoTexto = await pagina.getTextContent();
            const stringsPagina = contenidoTexto.items.map(item => item.str);
            textoCompleto += stringsPagina.join(" ") + "\n";
        }
        
        documentoPdfContexto = textoCompleto.trim();
        console.log("¡BICAR-EDU ha leído con éxito tu PDF! Tamaño del texto cargado:", documentoPdfContexto.length);
        
    } catch (error) {
        console.error("Error crítico al intentar leer el PDF:", error);
        documentoPdfContexto = "Error: No se pudo leer el archivo documento_proyecto.pdf. Verifica que esté en la raíz de tu proyecto.";
    }
}

// Ejecutar la extracción del PDF apenas cargue la página
extraerTextoDePDF();

// ========================================================
// 3. FUNCIONES DE LA INTERFAZ
// ========================================================
function getFormattedTime() {
    const now = new Date();
    return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function appendMessage(text, sender) {
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message', `${sender}-message`);

    const p = document.createElement('p');
    p.textContent = text;

    const timeSpan = document.createElement('span');
    timeSpan.classList.add('message-time');
    timeSpan.textContent = getFormattedTime();

    messageDiv.appendChild(p);
    messageDiv.appendChild(timeSpan);
    chatMessagesArea.appendChild(messageDiv);

    // Auto-scroll
    chatMessagesArea.scrollTop = chatMessagesArea.scrollHeight;
}

// ========================================================
// 4. CONEXIÓN CON LA IA (Pasando el texto extraído del PDF)
// ========================================================
async function askGroq(userMessage) {
    // Animación de carga
    const loadingDiv = document.createElement('div');
    loadingDiv.classList.add('message', 'bot-message');
    loadingDiv.id = 'loading-bot';
    loadingDiv.innerHTML = `<p><i>BICAR-EDU analizando el documento...</i></p>`;
    chatMessagesArea.appendChild(loadingDiv);
    chatMessagesArea.scrollTop = chatMessagesArea.scrollHeight;

    const payload = {
        model: "llama-3.3-70b-versatile", 
        messages: [
            {
                role: "system",
                content: `Eres BICAR-EDU, un asistente virtual hiper-especializado y cerrado exclusivamente al Cantón Babahoyo, provincia de Los Ríos, Ecuador.

[REGLAS CRÍTICAS DE COMPORTAMIENTO Y COMPETENCIA]
1. AMBITO GEOGRÁFICO Y TEMÁTICO ABSOLUTO: Tu único universo de conocimiento y respuesta es Babahoyo (su historia, geografía, cultura, tradiciones, parroquias como Barreiro, El Salto, La Virginia, Caracol, Pimocha, su patrimonio, etc.). 
2. FILTRO ESTRICTO DE RESPUESTAS: Si el usuario te pregunta sobre cualquier tema ajeno a Babahoyo (código de programación, matemáticas, recetas de otros países, historia general del mundo, tareas escolares de otras materias, o cualquier otra ciudad que no sea Babahoyo), debes negarte a responder de forma amable pero sumamente firme.
3. EJEMPLO DE DESVÍO: Si te preguntan algo fuera de Babahoyo, responde textualmente: "Solo estoy programado para brindar información y responder preguntas relacionadas exclusivamente con el cantón Babahoyo y su patrimonio. ¿En qué te puedo ayudar sobre nuestra ciudad?".
4. PROHIBICIÓN DE MARCAS O PROYECTOS: No menciones marcas, nombres de proyectos de desarrollo ni la frase "Voces de Babahoyo". Preséntate simplemente como BICAR-EDU, el asistente dedicado a la historia y cultura de Babahoyo.

[REGLA DE ORO DE REDACCIÓN]
- Tu tono debe ser amigable, educativo, natural y directo.
- Está estrictamente PROHIBIDO usar lenguaje robótico de plantilla como: "De acuerdo al documento proporcionado", "Según el PDF adjunto" o "Como inteligencia artificial". Habla como un guía local experto que conoce cada rincón de la ciudad.

[FUENTE DE INFORMACIÓN PRIORITARIA]
Apóyate estrictamente en los datos históricos y geográficos del documento cargado para responder las dudas del usuario:

                === TEXTO EXTRAÍDO DEL PDF DEL PROYECTO ===
                ${documentoPdfContexto}
                `
            },
            {
                role: "user",
                content: userMessage 
            }
        ]
    };

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${API_KEY}`
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const errorRaw = await response.json();
            console.error("ERROR REAL DEL SERVIDOR DE GROQ:", errorRaw);
            throw new Error(`Código de estado devuelto: ${response.status}`);
        }

        const data = await response.json();
        
        // Quitar indicador de carga
        if (document.getElementById('loading-bot')) {
            document.getElementById('loading-bot').remove();
        }

        // Extraer respuesta estructurada de Groq
        if (data.choices && data.choices[0].message.content) {
            const botResponse = data.choices[0].message.content;
            appendMessage(botResponse, 'bot');
        } else {
            console.warn("Estructura inesperada:", data);
            appendMessage("El servidor respondió pero con un formato desconocido.", 'bot');
        }

    } catch (error) {
        console.error("Fallo crítico en la ejecución:", error);
        if (document.getElementById('loading-bot')) {
            document.getElementById('loading-bot').remove();
        }
        appendMessage("Error en la petición. Revisa que estés ejecutando la página con Live Server.", 'bot');
    }
}

// ========================================================
// 5. CAPTURA DEL EVENTO SUBMIT
// ========================================================
chatForm.addEventListener('submit', (e) => {
    e.preventDefault(); 
    
    const messageText = chatInput.value.trim();
    if (!messageText) return; 

    appendMessage(messageText, 'user');
    chatInput.value = '';

    // Ejecutamos la petición al motor de Groq
    askGroq(messageText);
});

// ========================================================
// 6. CONTROL DE LA VENTANA EMERGENTE (POP-UP)
// ========================================================
const btnAbrirChat = document.getElementById('btn-abrir-chat');
const btnCerrarChat = document.getElementById('btn-cerrar-chat');
const popupChatbot = document.getElementById('popup-chatbot');

// Evento para abrir el chat
btnAbrirChat.addEventListener('click', () => {
    popupChatbot.classList.remove('chatbot-oculto');
    popupChatbot.classList.add('chatbot-visible');
});

// Evento para cerrar el chat
btnCerrarChat.addEventListener('click', () => {
    popupChatbot.classList.remove('chatbot-visible');
    popupChatbot.classList.add('chatbot-oculto');
});

