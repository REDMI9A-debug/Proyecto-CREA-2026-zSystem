// 1. CONFIGURACIÓN (Pon tus datos aquí)
const API_KEY = 'AIzaSyBkEO5vMaOlYXKMIQyWBvX0RSoV9zSi2lU'; 
const PLAYLIST_ID = 'PLR6O4eFk6cokxXHAbVvpLc9hgO7Qhuwoo'; 

// 2. LA FUNCIÓN QUE HACE EL TRABAJO
async function obtenerVideos() {
    const url = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=20&playlistId=${PLAYLIST_ID}&key=${API_KEY}`;

    try {
        const respuesta = await fetch(url);
        const datos = await respuesta.json();
        const videos = datos.items;

        const contenedor = document.getElementById('thumbnailGrid');
        contenedor.innerHTML = ''; // Limpiamos por si acaso

        videos.forEach(video => {
            const id = video.snippet.resourceId.videoId;
            const titulo = video.snippet.title;
            const miniatura = video.snippet.thumbnails.medium.url;

            // Aquí "dibujamos" cada cuadrito tipo Newgrounds
            contenedor.innerHTML += `
                <div class="video-card" onclick="cambiarVideo('${id}', '${titulo}')">
                    <img src="${miniatura}" alt="${titulo}">
                    <p>${titulo}</p>
                </div>
            `;
        });
    } 
// En tu archivo podcasts.js, cambia la parte del catch por esto:
catch (error) {
    console.error("Error detallado:", error);
    const res = await fetch(url);
    const errorData = await res.json();
    console.log("Lo que Google dice que está mal:", errorData);
 }
}

// 3. FUNCIÓN PARA REPRODUCIR (Cuando haces clic)
function cambiarVideo(id, titulo) {
    const reproductor = document.getElementById('mainPlayer');
    const tituloPantalla = document.getElementById('videoTitle');
    
    reproductor.src = `https://www.youtube.com/embed/${id}?autoplay=1`;
    tituloPantalla.innerText = titulo;
}

// 4. ARRANCAR TODO
document.addEventListener('DOMContentLoaded', obtenerVideos);