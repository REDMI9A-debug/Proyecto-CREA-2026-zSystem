// 1. CONFIGURACIÓN (Asegúrate de que esta Key esté activa en Google Cloud Console)
const API_KEY = 'AIzaSyBkEO5vMaOlYXKMIQyWBvX0RSoV9zSi2lU'; 
const PLAYLIST_ID = 'PLR6O4eFk6cokxXHAbVvpLc9hgO7Qhuwoo'; 

// 2. LA FUNCIÓN QUE HACE EL TRABAJO
async function obtenerVideos() {
    const url = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=20&playlistId=${PLAYLIST_ID}&key=${API_KEY}`;

    try {
        const respuesta = await fetch(url);
        
        if (!respuesta.ok) {
            const errorData = await respuesta.json();
            console.error("Lo que Google dice que está mal:", errorData);
            return;
        }

        const datos = await respuesta.json();
        const videos = datos.items;

        if (!videos || videos.length === 0) {
            console.warn("La playlist está vacía o no se encontraron videos.");
            return;
        }

        const contenedor = document.getElementById('thumbnailGrid');
        contenedor.innerHTML = ''; 

        let htmlContenido = '';

        videos.forEach(video => {
            const id = video.snippet.resourceId.videoId;
            const titulo = video.snippet.title;
            
            // --- EL SALVAVIDAS AQUÍ ---
            // Revisamos paso a paso si existen las miniaturas para que no lance error
            let miniatura = 'https://via.placeholder.com/320x180?text=Sin+Miniatura'; // Imagen por defecto
            
            if (video.snippet.thumbnails) {
                if (video.snippet.thumbnails.medium && video.snippet.thumbnails.medium.url) {
                    miniatura = video.snippet.thumbnails.medium.url;
                } else if (video.snippet.thumbnails.high && video.snippet.thumbnails.high.url) {
                    miniatura = video.snippet.thumbnails.high.url;
                } else if (video.snippet.thumbnails.default && video.snippet.thumbnails.default.url) {
                    miniatura = video.snippet.thumbnails.default.url;
                }
            }

            htmlContenido += `
                <div class="video-card" onclick="cambiarVideo('${id}', '${titulo.replace(/'/g, "\\'")}')">
                    <img src="${miniatura}" alt="${titulo}">
                    <p>${titulo}</p>
                </div>
            `;
        });

        contenedor.innerHTML = htmlContenido;

    } catch (error) {
        console.error("Error de red o conexión:", error);
    }
}

// 3. FUNCIÓN PARA REPRODUCIR (Cuando haces clic)1
function cambiarVideo(id, titulo) {
    const reproductor = document.getElementById('mainPlayer');
    const tituloPantalla = document.getElementById('videoTitle');
    
    reproductor.src = `https://www.youtube.com/embed/${id}?autoplay=1`;
    tituloPantalla.innerText = titulo;
}

// 4. ARRANCAR TODO
document.addEventListener('DOMContentLoaded', obtenerVideos);