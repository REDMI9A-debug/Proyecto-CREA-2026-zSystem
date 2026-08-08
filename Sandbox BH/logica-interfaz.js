const supabaseClient = supabase.createClient(
  window.SUPABASE_URL,
  window.SUPABASE_ANON_KEY
);

let currentSector = 'Todo Babahoyo';
let isAdmin = false;
let showModeration = false;
let currentMediaFile = null;
let currentMediaType = null;
let currentMediaURL = null;
let commentsCache = {};
let loadingComments = new Set();
let isTogglingModeration = false;

const PAGE_SIZE = 10;
let currentPage = 0;
let isLoadingMore = false;
let hasMorePosts = true;
let currentSectorForPagination = 'Todo Babahoyo';

async function uploadFile(file, userId, folder = 'posts', type = 'media') {
  if (!file) return null;
  try {
    const ext = file.name.split('.').pop();
    const filename = `${type}_${Date.now()}.${ext}`;
    const path = `${userId}/${folder}/${filename}`;
    const { error } = await supabaseClient.storage
      .from('media')
      .upload(path, file);
    if (error) {
      console.error('Error subiendo:', error);
      return null;
    }
    const { data } = supabaseClient.storage
      .from('media')
      .getPublicUrl(path);
    return data?.publicUrl || null;
  } catch (err) {
    console.error('Error in uploadFile:', err);
    return null;
  }
}

async function uploadImage(file, userId, type = '') {
  return uploadFile(file, userId, 'profiles', type);
}

async function createNotification(targetUserId, postId, type) {
  try {
    const { data: { session } } = await supabaseClient.auth.getSession();
    if (!session) return;
    const actorId = session.user.id;
    if (actorId === targetUserId) return;
    await supabaseClient
      .from('notifications')
      .insert({ user_id: targetUserId, actor_id: actorId, post_id: postId, type, is_read: false });
    actualizarBadgeNotificaciones();
  } catch (err) {
    console.error('Error creando notificación:', err);
  }
}

async function loadUserProfile() {
  try {
    const { data: { session }, error: sessionError } = await supabaseClient.auth.getSession();
    if (sessionError || !session) return false;
    const userId = session.user.id;
    const { data: profile, error: profileError } = await supabaseClient
      .from('profiles')
      .select('display_name, username, bio, avatar_url, banner_url, role')
      .eq('id', userId)
      .single();
    if (profileError || !profile) return false;
    isAdmin = profile.role === 'admin';
    const btnModerar = document.getElementById('btn-moderar');
    if (btnModerar) {
      if (isAdmin) btnModerar.classList.remove('hidden');
      else btnModerar.classList.add('hidden');
    }
    const perfilNombre = document.getElementById('perfil-nombre');
    const perfilUsername = document.getElementById('perfil-username');
    const perfilBio = document.getElementById('perfil-bio');
    const headerNombre = document.getElementById('header-perfil-nombre');
    const perfilAvatar = document.getElementById('perfil-avatar');
    const perfilBanner = document.getElementById('perfil-banner');
    if (perfilNombre) perfilNombre.textContent = profile.display_name || 'Usuario';
    if (perfilUsername) perfilUsername.textContent = `@${profile.username || 'usuario'}`;
    if (perfilBio) perfilBio.textContent = profile.bio || 'Sin biografía';
    if (headerNombre) headerNombre.textContent = profile.display_name || 'Usuario';
    if (perfilAvatar && profile.avatar_url) {
      perfilAvatar.style.backgroundImage = `url('${profile.avatar_url}')`;
      perfilAvatar.style.backgroundSize = 'cover';
      perfilAvatar.style.backgroundPosition = 'center';
    }
    if (perfilBanner && profile.banner_url) {
      perfilBanner.style.backgroundImage = `url('${profile.banner_url}')`;
      perfilBanner.style.backgroundSize = 'cover';
      perfilBanner.style.backgroundPosition = 'center';
    }
    const publicarAvatar = document.getElementById('publicar-avatar');
    if (publicarAvatar && profile.avatar_url) {
      publicarAvatar.style.backgroundImage = `url('${profile.avatar_url}')`;
      publicarAvatar.style.backgroundSize = 'cover';
      publicarAvatar.style.backgroundPosition = 'center';
    }
    return true;
  } catch (err) {
    return false;
  }
}

async function ensureAuthenticated() {
  try {
    const { data: { session }, error } = await supabaseClient.auth.getSession();
    if (error || !session) {
      alert('Debes iniciar sesión para realizar esta acción.');
      window.location.href = 'authentication.html';
      return false;
    }
    return true;
  } catch (err) {
    window.location.href = 'authentication.html';
    return false;
  }
}

async function getFeedPosts(sector = null, page = 0, includeInteractions = true) {
  try {
    const from = page * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;

    let query = supabaseClient
      .from('posts')
      .select(`
        id, content, image_url, sector, likes, created_at, user_id,
        profiles!fk_posts_user_id ( display_name, username, avatar_url )
      `)
      .eq('status', 'approved')
      .order('created_at', { ascending: false })
      .range(from, to);

    if (sector && sector !== 'Todo Babahoyo') {
      query = query.eq('sector', sector);
    }

    const { data: posts, error } = await query;
    if (error || !posts) return [];

    if (posts.length < PAGE_SIZE) {
      hasMorePosts = false;
    } else {
      hasMorePosts = true;
    }


    if (!includeInteractions) {
      return posts.map(post => ({ ...post, userHasLiked: false, commentCount: 0 }));
    }

    const postIds = posts.map(p => p.id);
    if (postIds.length === 0) return [];

    const { data: { session } } = await supabaseClient.auth.getSession();

    const [commentsResult, userLikesResult] = await Promise.all([
      supabaseClient.from('comments').select('post_id').in('post_id', postIds),
      session ? supabaseClient.from('post_likes').select('post_id').eq('user_id', session.user.id).in('post_id', postIds) : Promise.resolve({ data: [] })
    ]);

    const comments = commentsResult.data || [];
    const userLikes = userLikesResult.data || [];

    const commentCountMap = {};
    comments.forEach(c => {
      commentCountMap[c.post_id] = (commentCountMap[c.post_id] || 0) + 1;
    });

    const likedPostIds = new Set(userLikes.map(l => l.post_id));

    return posts.map(post => ({
      ...post,
      userHasLiked: likedPostIds.has(post.id),
      commentCount: commentCountMap[post.id] || 0
    }));
  } catch (err) {
    console.error('Error cargando feed:', err);
    return [];
  }
}

async function getPendingPosts() {
  try {
    const { data: posts, error } = await supabaseClient
      .from('posts')
      .select(`
        id, content, image_url, sector, created_at, user_id, likes,
        profiles!fk_posts_user_id ( display_name, username, avatar_url )
      `)
      .eq('status', 'pending')
      .order('created_at', { ascending: false })
      .limit(20);
    if (error) throw error;
    return posts || [];
  } catch (err) {
    console.error('Error cargando posts pendientes:', err);
    return [];
  }
}

async function createPost(content, mediaUrl, sector) {
  const { data: { session } } = await supabaseClient.auth.getSession();
  if (!session) throw new Error('No hay sesión');
  const { data, error } = await supabaseClient
    .from('posts')
    .insert({
      user_id: session.user.id,
      content: content,
      image_url: mediaUrl || null,
      sector: sector || 'Babahoyo (Centro)',
      status: 'pending'
    })
    .select()
    .single();
  if (error) throw error;
  return data;
}

async function moderatePost(postId, action) {
  try {
    const { data: { session } } = await supabaseClient.auth.getSession();
    if (!session) return false;
    const { error } = await supabaseClient
      .from('posts')
      .update({ status: action, updated_at: new Date().toISOString() })
      .eq('id', postId);
    if (error) {
      alert(`❌ Error al moderar: ${error.message}`);
      return false;
    }
    return true;
  } catch (err) {
    return false;
  }
}

function renderPostsToContainer(container, posts, isModeration = false) {
  if (!container) return;
  if (posts.length === 0) {
    container.innerHTML = `
      <div class="text-center py-12 text-slate-500 dark:text-gray-400 animate-fade-in">
        <p class="text-lg font-bold">${isModeration ? 'No hay publicaciones pendientes' : 'No hay publicaciones aún'}</p>
        <p class="text-sm">${isModeration ? 'Todo al día.' : 'Sé el primero en compartir algo sobre Babahoyo'}</p>
      </div>`;
    return;
  }

  let html = '';
  posts.forEach((post, index) => {
    const avatarUrl = post.profiles?.avatar_url || '';
    const displayName = post.profiles?.display_name || 'Usuario Desconocido';
    const username = post.profiles?.username || 'anonimo';
    const timeAgo = new Date(post.created_at).toLocaleDateString('es-ES', {
      day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
    });

    const isLiked = post.userHasLiked || false;
    const likeIconColor = isLiked ? 'currentColor' : 'none';
    const likeTextColor = isLiked ? 'text-pink-500' : 'text-slate-400 dark:text-gray-500';
    const commentCount = post.commentCount || 0;
    const animationDelay = Math.min(index * 50, 500);

    let moderationButtons = '';
    if (isModeration) {
      moderationButtons = `
        <div class="flex gap-3 mt-3 pt-3 border-t border-slate-200 dark:border-gray-700">
          <button data-action="approve" data-post-id="${post.id}" class="bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-1.5 px-4 rounded-full text-xs transition active:scale-95">✅ Aprobar</button>
          <button data-action="reject" data-post-id="${post.id}" class="bg-red-500 hover:bg-red-600 text-white font-bold py-1.5 px-4 rounded-full text-xs transition active:scale-95">❌ Rechazar</button>
        </div>
      `;
    }

    let mediaHtml = '';
    if (post.image_url) {
      const isVideo = /\.(mp4|webm|ogg|mov|avi|wmv|flv)$/i.test(post.image_url);
      if (isVideo) {
        mediaHtml = `
          <div class="mt-3 rounded-xl overflow-hidden border border-slate-200 dark:border-gray-700 bg-black transition-transform duration-300 hover:scale-[1.01]" style="min-height: 200px; display: flex; align-items: center; justify-content: center; cursor: pointer;" onclick="abrirPostModal('${post.id}')">
            <video src="${post.image_url}" class="w-full h-auto max-h-[400px] object-contain" controls style="background: #000;" onclick="event.stopPropagation();"></video>
          </div>
        `;
      } else {
        mediaHtml = `
          <div class="mt-3 rounded-xl overflow-hidden border border-slate-200 dark:border-gray-700 transition-transform duration-300 hover:scale-[1.01]" style="cursor: pointer;" onclick="abrirPostModal('${post.id}')">
            <img src="${post.image_url}" class="w-full h-auto max-h-[400px] object-cover" alt="Imagen adjunta">
          </div>
        `;
      }
    }

    html += `
      <article data-post-id="${post.id}" data-sector="${post.sector}" 
        class="p-4 hover:bg-slate-50/50 dark:hover:bg-gray-900/40 transition flex gap-3 border-b border-slate-100 dark:border-gray-800 opacity-0 animate-slide-up" style="animation-delay: ${animationDelay}ms;">
        <div class="w-10 h-10 rounded-full bg-slate-200 dark:bg-gray-800 flex-shrink-0 overflow-hidden shadow-sm">
          ${avatarUrl ? `<img src="${avatarUrl}" class="w-full h-full object-cover">` :
        `<div class="w-full h-full flex items-center justify-center font-bold text-slate-500">${displayName.charAt(0).toUpperCase()}</div>`}
        </div>
        <div class="flex-1 min-w-0">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-1.5">
              <span class="font-bold text-sm tracking-tight text-slate-900 dark:text-white cursor-pointer hover:underline" onclick="verPerfilUsuario('${post.user_id}')">${displayName}</span>
              <span class="text-slate-500 dark:text-gray-500 text-xs">@${username} · ${timeAgo}</span>
            </div>
          </div>
          <span class="inline-block bg-slate-100 text-slate-600 dark:bg-gray-900 dark:text-emerald-400 px-2 py-0.5 rounded text-[11px] font-bold mt-1">📍 ${post.sector}</span>
          <p class="mt-2 text-[14px] text-slate-800 dark:text-gray-200 leading-normal break-words">${post.content}</p>
          ${mediaHtml}
          <div class="flex gap-12 mt-3 ${isLiked ? '' : 'text-slate-400 dark:text-gray-500'} text-xs">
            <button data-action="comment" data-post-id="${post.id}" class="flex items-center gap-1.5 text-slate-400 dark:text-gray-500 hover:text-sky-500 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.444 3 12c0 2.104.859 4.023 2.273 5.48.432.447.74 1.04.586 1.641a4.483 4.483 0 01-.923 1.785 4.75 4.75 0 001.924-.088c.316-.078.533-.23.756-.446l.755-.756a.757.757 0 01.53-.222z" />
              </svg>
              <span class="comment-count">${commentCount}</span>
            </button>
            <button data-action="like" data-post-id="${post.id}" data-liked="${isLiked}" class="flex items-center gap-1.5 ${likeTextColor} hover:text-pink-500 transition-transform active:scale-75 duration-200">
              <svg xmlns="http://www.w3.org/2000/svg" fill="${likeIconColor}" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4 transition-colors">
                <path stroke-linecap="round" stroke-linejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
              </svg>
              <span class="like-count">${post.likes || 0}</span>
            </button>
          </div>
          <div class="comments-box hidden w-full mt-3 pt-3 border-t border-slate-100 dark:border-gray-800 animate-fade-in">
            <div class="comments-list space-y-2 mb-2 max-h-40 overflow-y-auto"></div>
            <div class="flex items-center gap-2">
              <input type="text" class="new-comment-input flex-1 bg-slate-100 dark:bg-gray-900 border border-slate-200 dark:border-gray-700 rounded-full px-3 py-1 text-xs outline-none focus:border-sky-500 transition" placeholder="Comenta algo...">
              <button class="submit-comment-btn text-sky-500 hover:text-sky-600 font-bold text-xs px-2 py-1 transition">Enviar</button>
            </div>
          </div>
          ${moderationButtons}
        </div>
      </article>
    `;
  });
  container.innerHTML = html;
}


function renderPosts(posts, isModeration = false) {
  const timeline = document.getElementById('timeline-posts');
  if (!timeline) return;
  renderPostsToContainer(timeline, posts, isModeration);
}


async function abrirPostModal(postId) {
  const oldModal = document.getElementById('post-modal');
  if (oldModal) oldModal.remove();

  try {
    const { data: post, error } = await supabaseClient
      .from('posts')
      .select(`
        id, content, image_url, sector, likes, created_at, user_id,
        profiles!fk_posts_user_id ( display_name, username, avatar_url )
      `)
      .eq('id', postId)
      .single();

    if (error || !post) {
      alert('Publicación no encontrada');
      return;
    }

    const comments = await getComments(postId);

    const { data: { session } } = await supabaseClient.auth.getSession();
    let userHasLiked = false;
    if (session) {
      const { data: likeData } = await supabaseClient
        .from('post_likes')
        .select('id')
        .eq('post_id', postId)
        .eq('user_id', session.user.id)
        .maybeSingle();
      userHasLiked = !!likeData;
    }

    const avatarUrl = post.profiles?.avatar_url || '';
    const displayName = post.profiles?.display_name || 'Usuario';
    const username = post.profiles?.username || 'anonimo';
    const timeAgo = new Date(post.created_at).toLocaleDateString('es-ES', {
      day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
    });
    const isVideo = /\.(mp4|webm|ogg|mov|avi|wmv|flv)$/i.test(post.image_url || '');

    const modal = document.createElement('div');
    modal.id = 'post-modal';
    modal.className = 'fixed inset-0 z-[70] bg-black/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 animate-fade-in';

    modal.innerHTML = `
      <!-- AQUÍ: Agregada la clase animate-scale-in a la caja principal -->
      <div class="bg-white dark:bg-gray-950 rounded-xl sm:rounded-2xl w-full max-w-5xl max-h-[98vh] sm:max-h-[95vh] overflow-hidden flex flex-col md:flex-row shadow-2xl relative animate-scale-in">
        <button class="absolute top-2 right-2 z-10 text-white bg-black/60 hover:bg-black/80 rounded-full p-2 text-xl font-bold transition hover:scale-110" onclick="this.closest('#post-modal').remove()">✕</button>
        <div class="w-full md:w-3/5 bg-black flex items-center justify-center p-1 sm:p-2 min-h-[45vh] md:min-h-[500px]">
          ${post.image_url ? (isVideo ?
        `<video src="${post.image_url}" class="max-w-full max-h-[60vh] md:max-h-[70vh] object-contain rounded-lg" controls autoplay></video>` :
        `<img src="${post.image_url}" class="max-w-full max-h-[60vh] md:max-h-[70vh] object-contain rounded-lg" alt="Publicación">`
      ) : `<div class="text-white text-center p-4">Sin contenido multimedia</div>`}
        </div>
        <div class="w-full md:w-2/5 flex flex-col bg-white dark:bg-gray-950 p-3 sm:p-4 overflow-y-auto max-h-[50vh] md:max-h-[90vh]">
          <div class="flex items-start gap-3 pb-2 border-b border-slate-200 dark:border-gray-800">
            <div class="w-10 h-10 rounded-full bg-slate-200 dark:bg-gray-800 overflow-hidden flex-shrink-0">
              ${avatarUrl ? `<img src="${avatarUrl}" class="w-full h-full object-cover">` :
        `<div class="w-full h-full flex items-center justify-center font-bold text-slate-500">${displayName.charAt(0).toUpperCase()}</div>`}
            </div>
            <div class="flex-1 min-w-0">
              <div class="font-bold text-slate-900 dark:text-white text-sm sm:text-base cursor-pointer hover:underline truncate" onclick="verPerfilUsuario('${post.user_id}')">${displayName}</div>
              <div class="text-slate-500 dark:text-gray-400 text-xs">@${username} · ${timeAgo}</div>
              <span class="inline-block bg-slate-100 dark:bg-gray-800 text-slate-600 dark:text-emerald-400 px-2 py-0.5 rounded text-[10px] font-bold mt-1">📍 ${post.sector}</span>
            </div>
          </div>
          <div class="py-2 flex-1">
            <p class="text-slate-800 dark:text-gray-200 text-sm sm:text-[15px] leading-relaxed break-words">${post.content}</p>
          </div>
          <div class="flex items-center gap-6 py-2 border-t border-slate-200 dark:border-gray-800">
            <button id="modal-like-btn" data-post-id="${post.id}" data-liked="${userHasLiked}" class="flex items-center gap-2 text-sm font-medium ${userHasLiked ? 'text-pink-500' : 'text-slate-500 dark:text-gray-400'} hover:text-pink-500 transition">
              <svg xmlns="http://www.w3.org/2000/svg" fill="${userHasLiked ? 'currentColor' : 'none'}" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
              </svg>
              <span id="modal-like-count">${post.likes || 0}</span>
            </button>
            <span class="text-slate-500 dark:text-gray-400 text-sm">💬 ${comments.length}</span>
          </div>
          <div class="flex-1 overflow-y-auto border-t border-slate-200 dark:border-gray-800 pt-2 min-h-[80px]">
            <div id="modal-comments-list" class="space-y-2 max-h-[30vh] overflow-y-auto pr-1">
              ${comments.length === 0 ? '<p class="text-xs text-slate-400 dark:text-gray-500">No hay comentarios aún</p>' :
        comments.map(c => `
                  <div class="bg-slate-50 dark:bg-gray-900/50 p-2 rounded-lg text-xs border border-slate-100 dark:border-gray-800">
                    <div class="flex items-start gap-2">
                      <div class="w-6 h-6 rounded-full bg-slate-200 dark:bg-gray-800 overflow-hidden flex-shrink-0">
                        ${c.profiles?.avatar_url ? `<img src="${c.profiles.avatar_url}" class="w-full h-full object-cover">` :
            `<div class="w-full h-full flex items-center justify-center font-bold text-slate-500 text-[10px]">${(c.profiles?.display_name || 'U').charAt(0).toUpperCase()}</div>`}
                      </div>
                      <div class="flex-1 min-w-0">
                        <div class="flex items-center gap-1">
                          <span class="font-bold text-slate-800 dark:text-gray-200 cursor-pointer hover:underline text-xs" onclick="verPerfilUsuario('${c.user_id}')">${c.profiles?.display_name || 'Usuario'}</span>
                          <span class="text-slate-500 dark:text-gray-500 text-[10px]">@${c.profiles?.username || 'anonimo'}</span>
                        </div>
                        <p class="mt-0.5 text-slate-700 dark:text-gray-300 break-words text-[11px]">${c.content}</p>
                      </div>
                    </div>
                  </div>
                `).join('')
      }
            </div>
          </div>
          <div class="flex items-center gap-2 pt-2 border-t border-slate-200 dark:border-gray-800 mt-1">
            <input type="text" id="modal-comment-input" class="flex-1 bg-slate-100 dark:bg-gray-900 border border-slate-200 dark:border-gray-700 rounded-full px-3 py-1.5 text-xs outline-none focus:border-sky-500 transition" placeholder="Comenta algo...">
            <button id="modal-submit-comment" class="text-sky-500 hover:text-sky-600 font-bold text-xs px-3 py-1.5 transition">Enviar</button>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(modal);
    modal.addEventListener('click', (e) => { if (e.target === modal) modal.remove(); });

    const likeBtn = document.getElementById('modal-like-btn');
    if (likeBtn) {
      likeBtn.addEventListener('click', async () => {
        const isAuth = await ensureAuthenticated();
        if (!isAuth) return;
        const postId = likeBtn.dataset.postId;
        const isLiked = likeBtn.dataset.liked === 'true';
        const countSpan = document.getElementById('modal-like-count');
        const currentLikes = parseInt(countSpan.textContent) || 0;
        if (isLiked) {
          likeBtn.dataset.liked = 'false';
          likeBtn.querySelector('svg').setAttribute('fill', 'none');
          likeBtn.classList.remove('text-pink-500');
          countSpan.textContent = Math.max(0, currentLikes - 1);
        } else {
          likeBtn.dataset.liked = 'true';
          likeBtn.querySelector('svg').setAttribute('fill', 'currentColor');
          likeBtn.classList.add('text-pink-500');
          countSpan.textContent = currentLikes + 1;
        }
        await toggleLike(postId).catch(err => console.error('Error guardando like:', err));
      });
    }

    const submitBtn = document.getElementById('modal-submit-comment');
    const input = document.getElementById('modal-comment-input');
    if (submitBtn && input) {
      submitBtn.addEventListener('click', async () => {
        const isAuth = await ensureAuthenticated();
        if (!isAuth) return;
        const text = input.value.trim();
        if (!text) return;
        submitBtn.textContent = '...';
        submitBtn.disabled = true;
        try {
          const newComment = await createComment(postId, text);
          const list = document.getElementById('modal-comments-list');
          if (list) {
            const emptyMsg = list.querySelector('p.text-slate-400');
            if (emptyMsg && emptyMsg.textContent.includes('No hay comentarios')) emptyMsg.remove();
            list.innerHTML += `
              <div class="bg-slate-50 dark:bg-gray-900/50 p-2 rounded-lg text-xs border border-slate-100 dark:border-gray-800">
                <div class="flex items-start gap-2">
                  <div class="w-6 h-6 rounded-full bg-slate-200 dark:bg-gray-800 overflow-hidden flex-shrink-0">
                    ${newComment.profiles?.avatar_url ? `<img src="${newComment.profiles.avatar_url}" class="w-full h-full object-cover">` :
                `<div class="w-full h-full flex items-center justify-center font-bold text-slate-500 text-[10px]">${(newComment.profiles?.display_name || 'T').charAt(0).toUpperCase()}</div>`}
                  </div>
                  <div class="flex-1 min-w-0">
                    <div class="flex items-center gap-1">
                      <span class="font-bold text-slate-800 dark:text-gray-200 text-xs">${newComment.profiles?.display_name || 'Tú'}</span>
                      <span class="text-slate-500 dark:text-gray-500 text-[10px]">@${newComment.profiles?.username || 'usuario'}</span>
                    </div>
                    <p class="mt-0.5 text-slate-700 dark:text-gray-300 break-words text-[11px]">${newComment.content}</p>
                  </div>
                </div>
              </div>
            `;
          }
          input.value = '';
          const countSpan = document.querySelector('#modal-like-count + span');
          if (countSpan) {
            const current = parseInt(countSpan.textContent.match(/\d+/)?.[0] || 0);
            countSpan.textContent = `💬 ${current + 1}`;
          }
          const feedCount = document.querySelector(`article[data-post-id="${postId}"] .comment-count`);
          if (feedCount) feedCount.textContent = parseInt(feedCount.textContent) + 1;
        } catch (err) {
          alert('Error al enviar comentario');
        } finally {
          submitBtn.textContent = 'Enviar';
          submitBtn.disabled = false;
        }
      });
      input.addEventListener('keydown', (e) => { if (e.key === 'Enter') submitBtn.click(); });
    }

  } catch (err) {
    console.error('Error abriendo modal:', err);
    alert('Error al cargar la publicación');
  }
}

const themeToggleBtn = document.getElementById('themeToggle');
const htmlElement = document.documentElement;

const btnNavInicio = document.getElementById('btn-nav-inicio');
const btnNavPerfil = document.getElementById('btn-nav-perfil');
const btnNavNotificaciones = document.getElementById('btn-nav-notificaciones');
const btnPerfilVolver = document.getElementById('btn-perfil-volver');

const wrappers = {
  feed: document.getElementById('wrapper-feed'),
  perfil: document.getElementById('wrapper-perfil'),
  notificaciones: document.getElementById('wrapper-notificaciones')
};
const botonesNav = [btnNavInicio, btnNavPerfil, btnNavNotificaciones].filter(Boolean);

if (themeToggleBtn) {
  themeToggleBtn.addEventListener('click', () => htmlElement.classList.toggle('dark'));
}

function navegarA(vistaDestino, botonActivo) {
  Object.keys(wrappers).forEach(key => {
    if (wrappers[key]) {
      wrappers[key].classList.add('hidden');
      wrappers[key].classList.remove('block');
      wrappers[key].classList.remove('animate-fade-in');
    }
  });

  if (wrappers[vistaDestino]) {
    wrappers[vistaDestino].classList.remove('hidden');
    wrappers[vistaDestino].classList.add('block');
    wrappers[vistaDestino].classList.add('animate-fade-in');
  }

  botonesNav.forEach(btn => {
    btn.className = 'p-3 xl:px-4 flex items-center justify-start gap-4 hover:bg-slate-100 dark:hover:bg-gray-900 text-slate-700 dark:text-gray-300 font-medium rounded-full w-full transition relative';
  });

  if (botonActivo) {
    botonActivo.className = 'p-3 xl:px-4 flex items-center justify-start gap-4 bg-sky-50 dark:bg-emerald-950/40 text-sky-500 dark:text-emerald-400 font-bold rounded-full w-full transition relative';
  }
}
if (btnNavInicio) btnNavInicio.addEventListener('click', () => navegarA('feed', btnNavInicio));
if (btnNavPerfil) btnNavPerfil.addEventListener('click', () => navegarA('perfil', btnNavPerfil));
if (btnPerfilVolver) btnPerfilVolver.addEventListener('click', () => navegarA('feed', btnNavInicio));

if (btnNavNotificaciones) {
  btnNavNotificaciones.addEventListener('click', () => {
    navegarA('notificaciones', btnNavNotificaciones);
    cargarYMostrarNotificaciones();
  });
}

const themeToggleMobile = document.getElementById('themeToggle-mobile');
if (themeToggleMobile) {
  themeToggleMobile.addEventListener('click', () => htmlElement.classList.toggle('dark'));
}

document.getElementById('btn-nav-inicio-mobile')?.addEventListener('click', () => navegarA('feed', btnNavInicio));
document.getElementById('btn-nav-perfil-mobile')?.addEventListener('click', () => navegarA('perfil', btnNavPerfil));
document.getElementById('btn-nav-notificaciones-mobile')?.addEventListener('click', () => {
  navegarA('notificaciones', btnNavNotificaciones);
  cargarYMostrarNotificaciones();
});

document.getElementById('btn-logout-mobile')?.addEventListener('click', async () => {
  if (confirm('¿Seguro que quieres cerrar sesión?')) {
    await supabaseClient.auth.signOut();
    window.location.href = 'authentication.html';
  }
});

const modalEditar = document.getElementById('modal-editar');
const btnEditarPerfil = document.getElementById('btn-editar-perfil');
const btnCerrarModal = document.getElementById('btn-cerrar-modal');

if (btnEditarPerfil) {
  btnEditarPerfil.addEventListener('click', async () => {
    try {
      const { data: { session } } = await supabaseClient.auth.getSession();
      if (!session) return;
      const { data: profile } = await supabaseClient
        .from('profiles')
        .select('display_name, username, bio')
        .eq('id', session.user.id)
        .single();
      if (profile) {
        document.getElementById('input-edit-nombre').value = profile.display_name || '';
        document.getElementById('input-edit-username').value = profile.username || '';
        document.getElementById('input-edit-bio').value = profile.bio || '';
      }
      modalEditar.classList.remove('hidden');
    } catch (err) { }
  });
}

if (btnCerrarModal) btnCerrarModal.addEventListener('click', () => modalEditar.classList.add('hidden'));

const botonesFiltro = document.querySelectorAll('.overflow-x-auto button');
botonesFiltro.forEach(boton => {
  boton.addEventListener('click', () => {
    botonesFiltro.forEach(b => {
      b.className = 'bg-slate-50 text-slate-700 hover:bg-slate-100 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 px-4 py-1.5 rounded-full text-sm font-medium border border-slate-200 dark:border-gray-700 transition flex-shrink-0';
    });
    boton.className = 'bg-sky-500 text-white dark:bg-emerald-500 px-4 py-1.5 rounded-full text-sm font-bold shadow-sm transition flex-shrink-0';
    loadFeed(boton.dataset.sector);
  });
});

const inputFoto = document.getElementById('input-foto');
const inputVideo = document.getElementById('input-video');
const containerPreview = document.getElementById('container-preview');
let imgPreview = document.getElementById('img-preview');
const btnRemovePreview = document.getElementById('btn-remove-preview');

function limpiarPreview() {
  if (currentMediaURL && currentMediaURL.startsWith('blob:')) {
    URL.revokeObjectURL(currentMediaURL);
  }
  currentMediaFile = null;
  currentMediaType = null;
  currentMediaURL = null;
  containerPreview.classList.add('hidden');
  containerPreview.style.minHeight = '';
  containerPreview.style.display = '';
  containerPreview.style.alignItems = '';
  containerPreview.style.justifyContent = '';
  containerPreview.style.backgroundColor = '';
  const videoPreview = document.getElementById('video-preview');
  if (videoPreview) {
    videoPreview.src = '';
    videoPreview.remove();
  }
  let img = document.getElementById('img-preview');
  if (!img) {
    img = document.createElement('img');
    img.id = 'img-preview';
    img.className = 'w-full h-auto object-cover max-h-[250px]';
    img.src = '';
    containerPreview.appendChild(img);
  } else {
    img.src = '';
    img.style.display = '';
  }
  imgPreview = img;
  if (inputFoto) inputFoto.value = '';
  if (inputVideo) inputVideo.value = '';
}

function mostrarPreviewImagen(file) {
  if (currentMediaURL && currentMediaURL.startsWith('blob:')) {
    URL.revokeObjectURL(currentMediaURL);
  }
  const oldVideo = containerPreview.querySelector('video#video-preview');
  if (oldVideo) {
    oldVideo.src = '';
    oldVideo.remove();
  }
  imgPreview.style.display = '';
  const reader = new FileReader();
  reader.onload = (event) => {
    currentMediaURL = event.target.result;
    currentMediaType = 'image';
    imgPreview.src = currentMediaURL;
    containerPreview.classList.remove('hidden');
    containerPreview.style.minHeight = '';
    containerPreview.style.display = '';
    containerPreview.style.alignItems = '';
    containerPreview.style.justifyContent = '';
    containerPreview.style.backgroundColor = '';
  };
  reader.readAsDataURL(file);
}

function mostrarPreviewVideo(file) {
  if (currentMediaURL && currentMediaURL.startsWith('blob:')) {
    URL.revokeObjectURL(currentMediaURL);
  }
  const url = URL.createObjectURL(file);
  currentMediaURL = url;
  currentMediaType = 'video';
  const oldVideo = containerPreview.querySelector('video#video-preview');
  if (oldVideo) {
    oldVideo.src = '';
    oldVideo.remove();
  }
  imgPreview.style.display = 'none';
  const videoEl = document.createElement('video');
  videoEl.id = 'video-preview';
  videoEl.src = url;
  videoEl.controls = true;
  videoEl.className = 'w-full h-auto object-contain max-h-[250px]';
  videoEl.autoplay = false;
  videoEl.muted = true;
  videoEl.style.backgroundColor = '#000';
  containerPreview.appendChild(videoEl);
  containerPreview.classList.remove('hidden');
  containerPreview.style.minHeight = '280px';
  containerPreview.style.display = 'flex';
  containerPreview.style.alignItems = 'center';
  containerPreview.style.justifyContent = 'center';
  containerPreview.style.backgroundColor = '#000';
}

const MAX_FILE_SIZE = 20 * 1024 * 1024;

function validarTamano(file) {
  if (file.size > MAX_FILE_SIZE) {
    alert(`El archivo "${file.name}" pesa ${(file.size / (1024 * 1024)).toFixed(1)} MB. El límite es 20 MB.`);
    return false;
  }
  return true;
}

if (inputFoto) {
  inputFoto.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!validarTamano(file)) {
        inputFoto.value = '';
        return;
      }
      if (inputVideo) inputVideo.value = '';
      currentMediaFile = file;
      mostrarPreviewImagen(file);
    }
  });
}

if (inputVideo) {
  inputVideo.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!validarTamano(file)) {
        inputVideo.value = '';
        return;
      }
      if (inputFoto) inputFoto.value = '';
      currentMediaFile = file;
      mostrarPreviewVideo(file);
    }
  });
}

if (btnRemovePreview) {
  btnRemovePreview.addEventListener('click', limpiarPreview);
}

async function verPerfilUsuario(userId) {
  if (!userId) return;
  try {
    const { data: profile, error } = await supabaseClient
      .from('profiles')
      .select('display_name, username, bio, avatar_url, banner_url')
      .eq('id', userId)
      .single();
    if (error || !profile) {
      alert('Usuario no encontrado');
      return;
    }
    document.getElementById('perfil-nombre').textContent = profile.display_name || 'Usuario';
    document.getElementById('perfil-username').textContent = `@${profile.username || 'usuario'}`;
    document.getElementById('perfil-bio').textContent = profile.bio || 'Sin biografía';
    document.getElementById('header-perfil-nombre').textContent = profile.display_name || 'Usuario';
    if (profile.avatar_url) {
      document.getElementById('perfil-avatar').style.backgroundImage = `url('${profile.avatar_url}')`;
      document.getElementById('perfil-avatar').style.backgroundSize = 'cover';
      document.getElementById('perfil-avatar').style.backgroundPosition = 'center';
    }
    if (profile.banner_url) {
      document.getElementById('perfil-banner').style.backgroundImage = `url('${profile.banner_url}')`;
      document.getElementById('perfil-banner').style.backgroundSize = 'cover';
      document.getElementById('perfil-banner').style.backgroundPosition = 'center';
    }
    const { data: { session } } = await supabaseClient.auth.getSession();
    const btnEditar = document.getElementById('btn-editar-perfil');
    if (session && session.user.id === userId) {
      btnEditar.classList.remove('hidden');
    } else {
      btnEditar.classList.add('hidden');
    }
    await cargarPostsUsuario(userId);
    navegarA('perfil', btnNavPerfil);
  } catch (err) {
    console.error('Error cargando perfil:', err);
  }
}

async function cargarPostsUsuario(userId) {
  try {
    const { data: posts, error } = await supabaseClient
      .from('posts')
      .select(`
        id, content, image_url, sector, likes, created_at,
        profiles!fk_posts_user_id ( display_name, username, avatar_url )
      `)
      .eq('user_id', userId)
      .eq('status', 'approved')
      .order('created_at', { ascending: false });
    if (error) throw error;
    renderPosts(posts || [], false);
    const counter = document.querySelector('#wrapper-perfil .text-slate-500');
    if (counter) counter.textContent = `${posts?.length || 0} publicaciones`;
  } catch (err) {
    console.error('Error cargando posts del usuario:', err);
  }
}

async function deleteComment(commentId) {
  try {
    const { data: { session } } = await supabaseClient.auth.getSession();
    if (!session) {
      alert('Debes iniciar sesión para eliminar.');
      return false;
    }
    const { data: comment, error: fetchError } = await supabaseClient
      .from('comments')
      .select('user_id')
      .eq('id', commentId)
      .single();
    if (fetchError || !comment) {
      alert('Comentario no encontrado.');
      return false;
    }
    if (comment.user_id !== session.user.id) {
      alert('No puedes eliminar este comentario.');
      return false;
    }
    const { error } = await supabaseClient
      .from('comments')
      .delete()
      .eq('id', commentId);
    if (error) {
      alert('Error al eliminar: ' + error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Error eliminando comentario:', err);
    return false;
  }
}

async function reportComment(commentId) {
  try {
    const { data: { session } } = await supabaseClient.auth.getSession();
    if (!session) {
      alert('Debes iniciar sesión para reportar.');
      return;
    }
    const { error } = await supabaseClient
      .from('reports')
      .insert({
        comment_id: commentId,
        user_id: session.user.id,
        reason: 'Contenido inapropiado',
        created_at: new Date().toISOString()
      });
    if (error) {
      console.error('Error al reportar:', error);
      alert('Error al reportar');
    } else {
      alert('✅ Comentario reportado. Gracias por ayudar a mantener la comunidad segura.');
    }
  } catch (err) {
    console.error('Error reportando comentario:', err);
  }
}

const timelinePosts = document.getElementById('timeline-posts');

if (timelinePosts) {
  timelinePosts.addEventListener('click', async (event) => {
    const target = event.target;
    const currentArticle = target.closest('article');
    if (!currentArticle) return;

    const modBtn = target.closest('button[data-action="approve"], button[data-action="reject"]');
    if (modBtn) {
      event.stopPropagation();
      modBtn.disabled = true;
      modBtn.classList.add('opacity-50');
      const postId = modBtn.dataset.postId;
      const action = modBtn.dataset.action === 'approve' ? 'approved' : 'rejected';
      const success = await moderatePost(postId, action);
      if (success) {
        currentArticle.remove();
        const remaining = timelinePosts.querySelectorAll('article');
        if (remaining.length === 0) {
          timelinePosts.innerHTML = `
            <div class="text-center py-12 text-slate-500 dark:text-gray-400">
              <p class="text-lg font-bold">No hay publicaciones pendientes</p>
              <p class="text-sm">Todo al día.</p>
            </div>`;
        }
      } else {
        modBtn.disabled = false;
        modBtn.classList.remove('opacity-50');
      }
      return;
    }

    const isInteractive = target.closest('button[data-action="like"], button[data-action="comment"], .submit-comment-btn, .comment-reply-btn, .comment-delete-btn, .comment-report-btn, .comment-menu-btn');
    if (isInteractive) {
      const isAuth = await ensureAuthenticated();
      if (!isAuth) return;
    }

    const likeBtn = target.closest('button[data-action="like"]');
    if (likeBtn) {
      event.stopPropagation();
      const postId = likeBtn.dataset.postId;
      const svg = likeBtn.querySelector('svg');
      const counter = likeBtn.querySelector('.like-count');
      const isLiked = likeBtn.dataset.liked === 'true';
      const currentLikes = parseInt(counter.textContent) || 0;
      if (isLiked) {
        likeBtn.dataset.liked = 'false';
        svg.setAttribute('fill', 'none');
        likeBtn.classList.remove('text-pink-500');
        counter.textContent = Math.max(0, currentLikes - 1);
      } else {
        likeBtn.dataset.liked = 'true';
        svg.setAttribute('fill', 'currentColor');
        likeBtn.classList.add('text-pink-500');
        counter.textContent = currentLikes + 1;
      }
      toggleLike(postId).catch(err => console.error('Error guardando like:', err));
      return;
    }

    const commentBtn = target.closest('button[data-action="comment"]');
    if (commentBtn) {
      event.stopPropagation();
      const postId = commentBtn.dataset.postId;
      const commentsBox = currentArticle.querySelector('.comments-box');
      if (!commentsBox) return;
      commentsBox.classList.toggle('hidden');
      if (!commentsBox.classList.contains('hidden')) {
        const commentsList = commentsBox.querySelector('.comments-list');
        try {
          const comments = await getComments(postId);
          if (commentsList) {
            commentsList.innerHTML = comments.map(c => `
              <div class="bg-slate-50 dark:bg-gray-900/50 p-2.5 rounded-lg text-xs border border-slate-100 dark:border-gray-800" data-comment-id="${c.id}">
                <div class="flex items-start gap-2">
                  <div class="w-6 h-6 rounded-full bg-slate-200 dark:bg-gray-800 overflow-hidden flex-shrink-0">
                    ${c.profiles?.avatar_url ? `<img src="${c.profiles.avatar_url}" class="w-full h-full object-cover">` :
                `<div class="w-full h-full flex items-center justify-center font-bold text-slate-500 text-[10px]">${(c.profiles?.display_name || 'U').charAt(0).toUpperCase()}</div>`}
                  </div>
                  <div class="flex-1 min-w-0">
                    <div class="flex items-center gap-1">
                      <span class="font-bold text-slate-800 dark:text-gray-200 cursor-pointer hover:underline" onclick="verPerfilUsuario('${c.user_id}')">${c.profiles?.display_name || 'Usuario'}</span>
                      <span class="text-slate-500 dark:text-gray-500 text-[10px]">@${c.profiles?.username || 'anonimo'}</span>
                    </div>
                    <p class="mt-0.5 text-slate-700 dark:text-gray-300 break-words">${c.content}</p>
                  </div>
                  <div class="relative flex-shrink-0 ml-1">
                    <button class="comment-menu-btn text-slate-400 hover:text-slate-600 dark:hover:text-gray-300 transition" data-comment-id="${c.id}">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                        <circle cx="12" cy="5" r="2" />
                        <circle cx="12" cy="12" r="2" />
                        <circle cx="12" cy="19" r="2" />
                      </svg>
                    </button>
                    <div class="comment-menu-dropdown hidden absolute right-0 mt-1 bg-white dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-lg shadow-lg z-20 w-36 py-1">
                      <button class="comment-reply-btn w-full text-left px-4 py-1.5 text-xs hover:bg-slate-100 dark:hover:bg-gray-700 transition" data-username="${c.profiles?.username || ''}">💬 Responder</button>
                      <button class="comment-delete-btn w-full text-left px-4 py-1.5 text-xs hover:bg-slate-100 dark:hover:bg-gray-700 transition text-red-500" data-comment-id="${c.id}">🗑️ Eliminar</button>
                      <button class="comment-report-btn w-full text-left px-4 py-1.5 text-xs hover:bg-slate-100 dark:hover:bg-gray-700 transition text-yellow-600" data-comment-id="${c.id}">🚨 Reportar</button>
                    </div>
                  </div>
                </div>
              </div>
            `).join('') || '<p class="text-xs text-slate-400 dark:text-gray-500">No hay comentarios aún</p>';
          }
        } catch (err) {
          console.error('Error cargando comentarios en UI:', err);
        }
      }
      return;
    }

    const replyBtn = target.closest('.comment-reply-btn');
    if (replyBtn) {
      event.stopPropagation();
      const username = replyBtn.dataset.username;
      const commentsBox = currentArticle.querySelector('.comments-box');
      const input = commentsBox?.querySelector('.new-comment-input');
      if (commentsBox && input) {
        commentsBox.classList.remove('hidden');
        input.value = `@${username} `;
        input.focus();
        const dropdown = replyBtn.closest('.comment-menu-dropdown');
        if (dropdown) dropdown.classList.add('hidden');
      }
      return;
    }

    const deleteBtn = target.closest('.comment-delete-btn');
    if (deleteBtn) {
      event.stopPropagation();
      const commentId = deleteBtn.dataset.commentId;
      if (confirm('¿Eliminar este comentario?')) {
        const success = await deleteComment(commentId);
        if (success) {
          const commentEl = currentArticle.querySelector(`[data-comment-id="${commentId}"]`);
          if (commentEl) commentEl.remove();
          const countSpan = currentArticle.querySelector('.comment-count');
          if (countSpan) countSpan.textContent = parseInt(countSpan.textContent) - 1;
        }
      }
      const dropdown = deleteBtn.closest('.comment-menu-dropdown');
      if (dropdown) dropdown.classList.add('hidden');
      return;
    }

    const reportBtn = target.closest('.comment-report-btn');
    if (reportBtn) {
      event.stopPropagation();
      const commentId = reportBtn.dataset.commentId;
      await reportComment(commentId);
      const dropdown = reportBtn.closest('.comment-menu-dropdown');
      if (dropdown) dropdown.classList.add('hidden');
      return;
    }

    const menuBtn = target.closest('.comment-menu-btn');
    if (menuBtn) {
      event.stopPropagation();
      const dropdown = menuBtn.parentElement.querySelector('.comment-menu-dropdown');
      if (dropdown) {
        document.querySelectorAll('.comment-menu-dropdown').forEach(d => {
          if (d !== dropdown) d.classList.add('hidden');
        });
        dropdown.classList.toggle('hidden');
      }
      return;
    }

    const submitBtn = target.closest('.submit-comment-btn');
    if (submitBtn) {
      event.stopPropagation();
      const input = currentArticle.querySelector('.new-comment-input');
      const commentsList = currentArticle.querySelector('.comments-list');
      const text = input.value.trim();
      if (!text) return;
      const postId = currentArticle.dataset.postId;
      submitBtn.textContent = '...';
      submitBtn.disabled = true;
      createComment(postId, text).then(async (newComment) => {
        const freshComments = await getComments(postId);
        commentsList.innerHTML = freshComments.map(c => `
          <div class="bg-slate-50 dark:bg-gray-900/50 p-2.5 rounded-lg text-xs border border-slate-100 dark:border-gray-800" data-comment-id="${c.id}">
            <div class="flex items-start gap-2">
              <div class="w-6 h-6 rounded-full bg-slate-200 dark:bg-gray-800 overflow-hidden flex-shrink-0">
                ${c.profiles?.avatar_url ? `<img src="${c.profiles.avatar_url}" class="w-full h-full object-cover">` :
            `<div class="w-full h-full flex items-center justify-center font-bold text-slate-500 text-[10px]">${(c.profiles?.display_name || 'U').charAt(0).toUpperCase()}</div>`}
              </div>
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-1">
                  <span class="font-bold text-slate-800 dark:text-gray-200 cursor-pointer hover:underline" onclick="verPerfilUsuario('${c.user_id}')">${c.profiles?.display_name || 'Usuario'}</span>
                  <span class="text-slate-500 dark:text-gray-500 text-[10px]">@${c.profiles?.username || 'anonimo'}</span>
                </div>
                <p class="mt-0.5 text-slate-700 dark:text-gray-300 break-words">${c.content}</p>
              </div>
              <div class="relative flex-shrink-0 ml-1">
                <button class="comment-menu-btn text-slate-400 hover:text-slate-600 dark:hover:text-gray-300 transition" data-comment-id="${c.id}">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="5" r="2" /><circle cx="12" cy="12" r="2" /><circle cx="12" cy="19" r="2" /></svg>
                </button>
              </div>
            </div>
          </div>
        `).join('');
        input.value = '';
        const commentCount = currentArticle.querySelector('.comment-count');
        if (commentCount) commentCount.textContent = freshComments.length;
      }).catch(err => {
        alert('Error al enviar comentario');
      }).finally(() => {
        submitBtn.textContent = 'Enviar';
        submitBtn.disabled = false;
      });
      return;
    }
  });
}

document.addEventListener('click', () => {
  document.querySelectorAll('.comment-menu-dropdown').forEach(d => d.classList.add('hidden'));
});

const listaNotificacionesDOM = document.getElementById('lista-notificaciones');
if (listaNotificacionesDOM) {
  listaNotificacionesDOM.addEventListener('click', async (e) => {
    const article = e.target.closest('article[data-post-id]');
    if (article) {
      const postId = article.dataset.postId;
      navegarA('feed', btnNavInicio);
      await loadFeed('Todo Babahoyo');
      const postEl = document.querySelector(`article[data-post-id="${postId}"]`);
      if (postEl) {
        hacerScrollYResaltar(postEl);
      }
    }
  });
}

function hacerScrollYResaltar(elemento) {
  elemento.scrollIntoView({ behavior: 'smooth', block: 'center' });
  elemento.classList.add('bg-sky-50', 'dark:bg-sky-900/30');
  setTimeout(() => elemento.classList.remove('bg-sky-50', 'dark:bg-sky-900/30'), 2000);
}

async function toggleLike(postId) {
  const { data: { session } } = await supabaseClient.auth.getSession();
  if (!session) throw new Error('No hay sesión');

  const { data: existing } = await supabaseClient
    .from('post_likes')
    .select('id')
    .eq('post_id', postId)
    .eq('user_id', session.user.id)
    .maybeSingle();

  if (existing) {
    await supabaseClient.from('post_likes').delete().eq('id', existing.id);
    const { data: postData } = await supabaseClient.from('posts').select('likes').eq('id', postId).single();
    if (postData) {
      await supabaseClient.from('posts').update({ likes: Math.max(0, (postData.likes || 0) - 1) }).eq('id', postId);
    }
    return { action: 'unliked' };
  } else {
    await supabaseClient.from('post_likes').insert({ post_id: postId, user_id: session.user.id });
    const { data: postData } = await supabaseClient.from('posts').select('likes, user_id').eq('id', postId).single();
    if (postData) {
      await supabaseClient.from('posts').update({ likes: (postData.likes || 0) + 1 }).eq('id', postId);
      await createNotification(postData.user_id, postId, 'like');
    }
    return { action: 'liked' };
  }
}

async function getComments(postId) {
  if (loadingComments.has(postId)) {
    return new Promise((resolve) => {
      const checkInterval = setInterval(() => {
        if (!loadingComments.has(postId) && commentsCache[postId]) {
          clearInterval(checkInterval);
          resolve(commentsCache[postId]);
        }
      }, 50);
      setTimeout(() => {
        clearInterval(checkInterval);
        resolve(commentsCache[postId] || []);
      }, 5000);
    });
  }
  if (commentsCache[postId]) {
    return commentsCache[postId];
  }
  loadingComments.add(postId);
  try {
    const { data: comments, error } = await supabaseClient
      .from('comments')
      .select(`
        id, content, created_at, user_id,
        profiles!fk_comments_user_id ( display_name, username, avatar_url )
      `)
      .eq('post_id', postId)
      .order('created_at', { ascending: true });
    if (error) throw error;
    commentsCache[postId] = comments || [];
    return commentsCache[postId];
  } catch (err) {
    console.error('Error cargando comentarios:', err);
    return [];
  } finally {
    loadingComments.delete(postId);
  }
}

async function createComment(postId, content) {
  const { data: { session } } = await supabaseClient.auth.getSession();
  if (!session) throw new Error('No hay sesión');

  const { data, error } = await supabaseClient
    .from('comments')
    .insert({
      post_id: postId,
      user_id: session.user.id,
      content: content
    })
    .select(`
      id, content, created_at, user_id,
      profiles!fk_comments_user_id ( display_name, username, avatar_url )
    `)
    .single();

  if (error) throw error;

  delete commentsCache[postId];

  const { data: post } = await supabaseClient.from('posts').select('user_id').eq('id', postId).single();
  if (post) await createNotification(post.user_id, postId, 'comment');

  const match = content.match(/@([a-zA-Z0-9_]+)/);
  if (match && match[1]) {
    const { data: mentionedUser } = await supabaseClient
      .from('profiles')
      .select('id')
      .eq('username', match[1])
      .maybeSingle();
    if (mentionedUser) await createNotification(mentionedUser.id, postId, 'comment');
  }

  return data;
}

const btnPublicar = document.getElementById('btn-publicar');
if (btnPublicar) {
  btnPublicar.addEventListener('click', async () => {
    const isAuth = await ensureAuthenticated();
    if (!isAuth) return;

    const input = document.getElementById('post-content');
    const text = input.value.trim();
    const sectorSeleccionado = document.getElementById('select-sector')?.value || 'Babahoyo (Centro)';

    if (!text && !currentMediaFile) {
      alert('Escribe algo o adjunta un archivo multimedia.');
      return;
    }

    try {
      let mediaUrl = null;
      if (currentMediaFile) {
        const { data: { session } } = await supabaseClient.auth.getSession();
        if (!session) throw new Error('Sesión no válida');
        mediaUrl = await uploadFile(currentMediaFile, session.user.id, 'posts', 'media');
      }

      await createPost(text, mediaUrl, sectorSeleccionado);
      alert('✅ ¡Gracias por tu publicación! Será revisada por el equipo de moderación.');
      input.value = '';
      limpiarPreview();
      setTimeout(() => {
        loadFeed(currentSector);
      }, 100);
    } catch (err) {
      alert('❌ Error al publicar: ' + err.message);
    }
  });
}

const btnGuardarPerfil = document.getElementById('btn-guardar-perfil');
let tempAvatarURL = null;
let tempBannerURL = null;

const inputEditAvatar = document.getElementById('input-edit-avatar');
if (inputEditAvatar) {
  inputEditAvatar.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => tempAvatarURL = event.target.result;
      reader.readAsDataURL(file);
    }
  });
}

const inputEditBanner = document.getElementById('input-edit-banner');
if (inputEditBanner) {
  inputEditBanner.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => tempBannerURL = event.target.result;
      reader.readAsDataURL(file);
    }
  });
}

if (btnGuardarPerfil) {
  btnGuardarPerfil.addEventListener('click', async () => {
    const nuevoNombre = document.getElementById('input-edit-nombre').value.trim();
    let nuevoUser = document.getElementById('input-edit-username').value.trim();
    const nuevaBio = document.getElementById('input-edit-bio').value.trim();

    if (!nuevoNombre || !nuevoUser) {
      alert('Nombre y usuario son obligatorios.');
      return;
    }
    if (!nuevoUser.startsWith('@')) nuevoUser = '@' + nuevoUser;

    const textoOriginal = btnGuardarPerfil.textContent;
    btnGuardarPerfil.textContent = 'Guardando...';
    btnGuardarPerfil.disabled = true;
    btnGuardarPerfil.classList.add('opacity-50', 'cursor-not-allowed');

    if (tempAvatarURL) {
      const perfilAvatar = document.getElementById('perfil-avatar');
      const publicarAvatar = document.getElementById('publicar-avatar');
      if (perfilAvatar) perfilAvatar.style.backgroundImage = `url('${tempAvatarURL}')`;
      if (publicarAvatar) publicarAvatar.style.backgroundImage = `url('${tempAvatarURL}')`;
    }
    if (tempBannerURL) {
      const perfilBanner = document.getElementById('perfil-banner');
      if (perfilBanner) perfilBanner.style.backgroundImage = `url('${tempBannerURL}')`;
    }

    const avatarFile = document.getElementById('input-edit-avatar')?.files[0];
    const bannerFile = document.getElementById('input-edit-banner')?.files[0];

    try {
      const { data: { session } } = await supabaseClient.auth.getSession();
      if (!session) throw new Error('No hay sesión activa');

      const [avatar_url, banner_url] = await Promise.all([
        avatarFile ? uploadFile(avatarFile, session.user.id, 'profiles', 'avatar') : null,
        bannerFile ? uploadFile(bannerFile, session.user.id, 'profiles', 'banner') : null
      ]);

      const { error } = await supabaseClient
        .from('profiles')
        .update({
          display_name: nuevoNombre,
          username: nuevoUser.replace('@', ''),
          bio: nuevaBio,
          ...(avatar_url && { avatar_url }),
          ...(banner_url && { banner_url }),
          updated_at: new Date().toISOString()
        })
        .eq('id', session.user.id);

      if (error) throw error;

      await loadUserProfile();
      if (modalEditar) modalEditar.classList.add('hidden');
      tempAvatarURL = null;
      tempBannerURL = null;
    } catch (err) {
      alert('Error al guardar los cambios: ' + err.message);
    } finally {
      btnGuardarPerfil.textContent = textoOriginal;
      btnGuardarPerfil.disabled = false;
      btnGuardarPerfil.classList.remove('opacity-50', 'cursor-not-allowed');
    }
  });
}

const btnLogout = document.getElementById('btn-logout');
if (btnLogout) {
  btnLogout.addEventListener('click', async () => {
    if (confirm('¿Seguro que quieres cerrar sesión?')) {
      await supabaseClient.auth.signOut();
      localStorage.removeItem('supabase.auth.token');
      window.location.href = 'authentication.html';
    }
  });
}

const btnModerar = document.getElementById('btn-moderar');

function actualizarBotonModerar() {
  if (!btnModerar) return;
  if (showModeration) {
    btnModerar.textContent = '📋 Ver feed';
    btnModerar.classList.remove('bg-amber-500', 'hover:bg-amber-600');
    btnModerar.classList.add('bg-sky-500', 'hover:bg-sky-600');
  } else {
    btnModerar.textContent = '🛡️ Moderar';
    btnModerar.classList.remove('bg-sky-500', 'hover:bg-sky-600');
    btnModerar.classList.add('bg-amber-500', 'hover:bg-amber-600');
  }
}

if (btnModerar) {
  btnModerar.addEventListener('click', async () => {
    if (isTogglingModeration) return;
    isTogglingModeration = true;
    btnModerar.disabled = true;
    try {
      showModeration = !showModeration;
      if (showModeration) {
        const pendingPosts = await getPendingPosts();
        renderPosts(pendingPosts, true);
      } else {
        await loadFeed(currentSector);
      }
      actualizarBotonModerar();
    } catch (err) {
      console.error('Error alternando moderación:', err);
    } finally {
      isTogglingModeration = false;
      btnModerar.disabled = false;
    }
  });
}

function ocultarBadgesVisualmente() {
  const badgePC = document.getElementById('badge-notificaciones-pc');
  const badgeMobile = document.getElementById('badge-notificaciones-mobile');
  if (badgePC) badgePC.classList.add('hidden');
  if (badgeMobile) badgeMobile.classList.add('hidden');
}

async function actualizarBadgeNotificaciones() {
  try {
    const { data: { session } } = await supabaseClient.auth.getSession();
    if (!session) return;

    const { count, error } = await supabaseClient
      .from('notifications')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', session.user.id)
      .eq('is_read', false);

    if (error) return;

    const badgePC = document.getElementById('badge-notificaciones-pc');
    const badgeMobile = document.getElementById('badge-notificaciones-mobile');

    if (count > 0) {
      const textoCount = count > 99 ? '99+' : count;
      if (badgePC) {
        badgePC.textContent = textoCount;
        badgePC.classList.remove('hidden');
      }
      if (badgeMobile) {
        badgeMobile.textContent = textoCount;
        badgeMobile.classList.remove('hidden');
      }
    } else {
      ocultarBadgesVisualmente();
    }
  } catch (err) {
    console.error('Error cargando contador:', err);
  }
}

async function cargarYMostrarNotificaciones() {
  const contenedor = document.getElementById('lista-notificaciones');
  if (!contenedor) return;

  ocultarBadgesVisualmente();

  contenedor.innerHTML = '<div class="p-8 text-center text-slate-500 font-bold">Cargando bandeja...</div>';

  try {
    const { data: { session } } = await supabaseClient.auth.getSession();
    if (!session) return;

    const { data, error } = await supabaseClient
      .from('notifications')
      .select(`
        id, type, is_read, created_at, post_id,
        profiles!notifications_actor_id_fkey ( display_name, username, avatar_url ),
        posts ( content, image_url )
      `)
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;

    if (!data || data.length === 0) {
      contenedor.innerHTML = `
        <div class="text-center py-12 text-slate-500 dark:text-gray-400">
          <p class="text-lg font-bold">Sin actividad aún</p>
          <p class="text-sm">Las interacciones con tus posts aparecerán aquí.</p>
        </div>`;
      return;
    }

    let html = '';
    data.forEach(notif => {
      const actor = notif.profiles || { display_name: 'Usuario', username: 'anonimo' };
      const post = notif.posts || { content: 'Publicación', image_url: null };
      const timeAgo = new Date(notif.created_at).toLocaleDateString('es-ES', {
        day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
      });

      let badgeIcon = '';
      let textoAccion = '';

      if (notif.type === 'like') {
        badgeIcon = '<span class="absolute -bottom-1 -right-1 bg-pink-500 text-white rounded-full p-0.5 text-[10px]">❤️</span>';
        textoAccion = 'ha dicho que le gusta tu publicación';
      } else if (notif.type === 'comment') {
        badgeIcon = '<span class="absolute -bottom-1 -right-1 bg-sky-500 text-white rounded-full p-0.5 text-[10px]">💬</span>';
        textoAccion = 'ha comentado tu publicación';
      }

      const bgClass = notif.is_read ? 'bg-transparent' : 'bg-sky-50/50 dark:bg-sky-950/20 noti-unread';

      let miniCardPost = '';
      if (post.image_url) {
        miniCardPost = `<img src="${post.image_url}" class="w-12 h-12 rounded-lg object-cover border border-slate-200 dark:border-gray-700 flex-shrink-0" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">`;
        miniCardPost += `<div class="w-12 h-12 rounded-lg bg-slate-100 dark:bg-gray-800 border border-slate-200 dark:border-gray-700 items-center justify-center p-1 text-[10px] text-slate-500 dark:text-gray-400 font-medium overflow-hidden flex-shrink-0 leading-tight" style="display:none;">
    ${post.content ? (post.content.length > 25 ? post.content.substring(0, 25) + '...' : post.content) : 'Post'}
  </div>`;
      } else {
        const textShort = post.content ? (post.content.length > 25 ? post.content.substring(0, 25) + '...' : post.content) : 'Post';
        miniCardPost = `
          <div class="w-12 h-12 rounded-lg bg-slate-100 dark:bg-gray-800 border border-slate-200 dark:border-gray-700 flex items-center justify-center p-1 text-[10px] text-slate-500 dark:text-gray-400 font-medium text-center overflow-hidden flex-shrink-0 leading-tight">
            ${textShort}
          </div>
        `;
      }

      html += `
        <article data-post-id="${notif.post_id}" class="cursor-pointer p-3.5 px-4 flex items-center justify-between gap-3 hover:bg-slate-50 dark:hover:bg-gray-900/40 transition border-b border-slate-100 dark:border-gray-800 ${bgClass}">
          <div class="flex items-center gap-3 min-w-0 flex-1">
            <div class="relative flex-shrink-0">
              ${actor.avatar_url ?
          `<img src="${actor.avatar_url}" class="w-11 h-11 rounded-full object-cover">` :
          `<div class="w-11 h-11 rounded-full bg-slate-200 dark:bg-gray-700 flex items-center justify-center font-bold text-slate-500">${actor.display_name.charAt(0).toUpperCase()}</div>`
        }
              ${badgeIcon}
            </div>

            <div class="min-w-0 flex-1">
              <p class="text-sm text-slate-800 dark:text-gray-200 leading-snug break-words">
                <span class="font-bold text-slate-900 dark:text-white">@${actor.username}</span> 
                <span class="text-slate-600 dark:text-gray-400">${textoAccion}</span>
              </p>
              <span class="text-[11px] text-slate-400 dark:text-gray-500 mt-0.5 block">${timeAgo}</span>
            </div>
          </div>
          ${miniCardPost}
        </article>
      `;
    });

    contenedor.innerHTML = html;

    const { error: updateError } = await supabaseClient
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', session.user.id)
      .eq('is_read', false);

    if (updateError) {
      console.error("ERROR SUPABASE: No se pudieron marcar como leídas.", updateError);
    }

    setTimeout(() => {
      document.querySelectorAll('.noti-unread').forEach(el => {
        el.classList.remove('bg-sky-50/50', 'dark:bg-sky-950/20', 'noti-unread');
        el.classList.add('bg-transparent');
      });
    }, 1200);

  } catch (err) {
    console.error('Error en notificaciones:', err);
    contenedor.innerHTML = '<div class="p-8 text-center text-red-500 font-bold">Error cargando bandeja.</div>';
  }
}

let notificationChannel = null;

async function suscribirNotificaciones() {
  const { data: { session } } = await supabaseClient.auth.getSession();
  if (!session) return;

  if (notificationChannel) {
    supabaseClient.removeChannel(notificationChannel);
  }

  notificationChannel = supabaseClient
    .channel('public:notifications')
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${session.user.id}`
      },
      (payload) => {
        actualizarBadgeNotificaciones();
        const wrapperNoti = document.getElementById('wrapper-notificaciones');
        if (wrapperNoti && !wrapperNoti.classList.contains('hidden')) {
          cargarYMostrarNotificaciones();
        }
      }
    )
    .subscribe((status, err) => {
      if (err) {
        console.error('Error en suscripción de notificaciones:', err);
      }
    });
}

async function loadMorePosts() {
  if (isLoadingMore || !hasMorePosts) return;

  isLoadingMore = true;
  const loadMoreBtn = document.getElementById('load-more-btn');
  if (loadMoreBtn) {
    loadMoreBtn.textContent = 'Cargando...';
    loadMoreBtn.disabled = true;
  }

  try {
    const nextPage = currentPage + 1;
    const posts = await getFeedPosts(currentSectorForPagination, nextPage);

    if (posts.length > 0) {
      const timeline = document.getElementById('timeline-posts');
      const tempContainer = document.createElement('div');
      tempContainer.innerHTML = '';

      renderPostsToContainer(tempContainer, posts, false);

      while (tempContainer.firstChild) {
        timeline.appendChild(tempContainer.firstChild);
      }
      currentPage = nextPage;
    }

    if (!hasMorePosts) {
      if (loadMoreBtn) loadMoreBtn.style.display = 'none';
    }
  } catch (err) {
    console.error('Error al cargar más posts:', err);
  } finally {
    isLoadingMore = false;
    if (loadMoreBtn) {
      loadMoreBtn.textContent = 'Cargar más publicaciones';
      loadMoreBtn.disabled = false;
    }
  }
}

document.getElementById('load-more-btn')?.addEventListener('click', loadMorePosts);

async function loadFeed(sector = 'Todo Babahoyo') {
  currentSectorForPagination = sector;
  currentPage = 0;
  hasMorePosts = true;

  if (showModeration) {
    showModeration = false;
    actualizarBotonModerar();
  }

  const timeline = document.getElementById('timeline-posts');
  timeline.innerHTML = `
    <div class="space-y-4 p-4">
      ${[1, 2, 3].map(() => `
        <div class="animate-pulse flex gap-3 p-4 border-b border-slate-100 dark:border-gray-800">
          <div class="w-10 h-10 bg-slate-200 dark:bg-gray-700 rounded-full"></div>
          <div class="flex-1 space-y-2">
            <div class="h-3 bg-slate-200 dark:bg-gray-700 rounded w-1/3"></div>
            <div class="h-3 bg-slate-200 dark:bg-gray-700 rounded w-3/4"></div>
            <div class="h-3 bg-slate-200 dark:bg-gray-700 rounded w-1/2"></div>
          </div>
        </div>
      `).join('')}
    </div>`;

  const posts = await getFeedPosts(sector, 0, false);
  renderPosts(posts, false);

  if (posts.length > 0) {
    const enrichedPosts = await getFeedPosts(sector, 0, true);
    enrichedPosts.forEach(enrichedPost => {
      const article = document.querySelector(`article[data-post-id="${enrichedPost.id}"]`);
      if (article) {
        const likeBtn = article.querySelector('button[data-action="like"]');
        if (likeBtn) {
          likeBtn.dataset.liked = enrichedPost.userHasLiked;
          likeBtn.querySelector('svg').setAttribute('fill', enrichedPost.userHasLiked ? 'currentColor' : 'none');
          likeBtn.classList.toggle('text-pink-500', enrichedPost.userHasLiked);
          likeBtn.querySelector('.like-count').textContent = enrichedPost.likes || 0;
        }
        const commentCountSpan = article.querySelector('.comment-count');
        if (commentCountSpan) commentCountSpan.textContent = enrichedPost.commentCount;
      }
    });
  }

  const loadMoreBtn = document.getElementById('load-more-btn');
  if (loadMoreBtn) {
    loadMoreBtn.style.display = hasMorePosts ? 'block' : 'none';
  }
}

(async function init() {
  await loadUserProfile();
  await loadFeed('Todo Babahoyo');
  await actualizarBadgeNotificaciones();
  await suscribirNotificaciones();
})();

function showToast(message, type = 'success', duration = 3000) {
  const toast = document.createElement('div');
  toast.className = `toast-notification ${type === 'error' ? 'bg-red-600' : 'bg-slate-800'}`;

  const icon = type === 'error'
    ? `<svg class="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>`
    : `<svg class="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>`;

  toast.innerHTML = `${icon} <span class="text-sm font-medium">${message}</span>`;
  document.body.appendChild(toast);

  setTimeout(() => {
    toast.classList.remove('animate-fade-in');
    toast.classList.add('animate-fade-out');
    toast.addEventListener('animationend', () => toast.remove());
  }, duration);
}

async function handleLogin(email, password) {
  const submitBtn = document.querySelector('#login-btn');
  submitBtn.disabled = true;
  submitBtn.innerText = "Iniciando...";

  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    showToast(error.message || "Error al iniciar sesión", 'error');
    submitBtn.disabled = false;
    submitBtn.innerText = "Iniciar Sesión";
    return;
  }

  showToast("¡Bienvenido de nuevo!");

  const loginWrapper = document.querySelector('#wrapper-login');
  if (loginWrapper) {
    loginWrapper.classList.add('animate-fade-out');

    setTimeout(() => {
      loginWrapper.classList.add('hidden');
      loginWrapper.classList.remove('animate-fade-out');

      const feedWrapper = document.querySelector('#wrapper-feed');
      feedWrapper.classList.remove('hidden');
      feedWrapper.classList.add('animate-fade-in');
    }, 200);
  }
}

async function handleLogout() {
  const currentWrapper = document.querySelector('.wrapper-active') || document.querySelector('#wrapper-feed');

  if (currentWrapper) {
    currentWrapper.classList.add('animate-fade-out');
  }

  setTimeout(async () => {
    await supabase.auth.signOut();
    showToast("Sesión cerrada correctamente");

    if (currentWrapper) {
      currentWrapper.classList.add('hidden');
      currentWrapper.classList.remove('animate-fade-out');
    }

    const loginWrapper = document.querySelector('#wrapper-login');
    if (loginWrapper) {
      loginWrapper.classList.remove('hidden');
      loginWrapper.classList.add('animate-fade-in');
    }
  }, 200);
}

async function handleCreatePost(content, file) {
  const postBtn = document.querySelector('#create-post-btn');
  postBtn.disabled = true;
  postBtn.innerText = "Publicando...";

  const { data: newPost, error } = await supabase
    .from('posts')
    .insert([{ content, user_id: currentUser.id }])
    .select('*, profiles(*)')
    .single();

  postBtn.disabled = false;
  postBtn.innerText = "Publicar";

  if (error) {
    showToast("No se pudo publicar", 'error');
    return;
  }

  showToast("¡Publicación enviada!");

  const postsContainer = document.querySelector('#posts-container');
  const postElement = renderPostCard(newPost);

  postElement.classList.add('animate-fade-in');
  postsContainer.prepend(postElement);

  document.querySelector('#post-form').reset();
}