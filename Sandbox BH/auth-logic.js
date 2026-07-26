// auth-logic.js – Onboarding + Modo Invitado
// Versión 2.0

const supabaseClient = supabase.createClient(
  window.SUPABASE_URL,
  window.SUPABASE_ANON_KEY
);

// ------------------------------------------------------------
// 1. Verificar sesión y redirigir si ya está autenticado
// ------------------------------------------------------------
document.addEventListener('DOMContentLoaded', async () => {
  try {
    const { data: { session } } = await supabaseClient.auth.getSession();
    if (session) {
      window.location.href = 'index.html';
    }
  } catch (e) {
    console.warn('Error al verificar sesión:', e);
  }
});

// ------------------------------------------------------------
// 2. Login
// ------------------------------------------------------------
async function handleLogin(email, password) {
  const { data, error } = await supabaseClient.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

// ------------------------------------------------------------
// 3. Registro (solo auth)
// ------------------------------------------------------------
async function handleRegister(email, password) {
  const { data, error } = await supabaseClient.auth.signUp({ email, password });
  if (error) throw error;
  return data; // { user, session }
}

// ------------------------------------------------------------
// 4. Guardar perfil (UPSERT en tabla profiles)
// ------------------------------------------------------------
async function saveProfile(userId, profileData) {
  const { error } = await supabaseClient
    .from('profiles')
    .upsert({
      id: userId,
      display_name: profileData.display_name,
      username: profileData.username,
      bio: profileData.bio || '',
      age: profileData.age || null,
      avatar_url: profileData.avatar_url || null,
      banner_url: profileData.banner_url || null,
      updated_at: new Date().toISOString()
    }, { onConflict: 'id' });

  if (error) throw error;
}

// ------------------------------------------------------------
// 5. Subir imagen a Storage (opcional)
// ------------------------------------------------------------
async function uploadImage(file, userId, type) {
  if (!file) return null;
  const ext = file.name.split('.').pop();
  const path = `${userId}/${type}.${ext}`;
  const { data, error } = await supabaseClient.storage
    .from('profiles')
    .upload(path, file, { upsert: true });
  if (error) {
    console.error('Error subiendo imagen:', error);
    return null;
  }
  const { data: { publicUrl } } = supabaseClient.storage
    .from('profiles')
    .getPublicUrl(path);
  return publicUrl;
}

// ------------------------------------------------------------
// 6. Lógica de UI para el onboarding
// ------------------------------------------------------------
document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('login-form');
  const registerContainer = document.getElementById('register-container');
  const showRegisterBtn = document.getElementById('show-register-btn');
  const showLoginBtn = document.getElementById('show-login-btn');

  // Pasos
  const step1 = document.getElementById('register-step1');
  const step2 = document.getElementById('register-step2');

  // Mostrar/ocultar formularios
  if (showRegisterBtn) {
    showRegisterBtn.addEventListener('click', () => {
      loginForm.style.display = 'none';
      registerContainer.classList.remove('hidden');
      step1.classList.add('step-visible');
      step1.classList.remove('step-hidden');
      step2.classList.add('step-hidden');
      step2.classList.remove('step-visible');
    });
  }
  if (showLoginBtn) {
    showLoginBtn.addEventListener('click', () => {
      loginForm.style.display = 'block';
      registerContainer.classList.add('hidden');
      clearErrors();
    });
  }

  // ---------- LOGIN ----------
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearErrors();
    const email = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value;
    try {
      await handleLogin(email, password);
      window.location.href = 'index.html';
    } catch (err) {
      showError('login-error', traducirError(err));
    }
  });

  // ---------- REGISTRO PASO 1 ----------
  step1.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearErrors();

    const email = document.getElementById('register-email').value.trim();
    const password = document.getElementById('register-password').value;

    try {
      // Hacemos signUp, si falla lanza error
      const { user, session } = await handleRegister(email, password);

      // Guardamos el user.id para el paso 2
      window._tempUserId = user.id;

      // Si no hay sesión (requiere confirmación), mostramos mensaje y no pasamos al paso 2
      if (!session) {
        showError('register-step1-error', 'Revisa tu correo para confirmar la cuenta antes de continuar.');
        return;
      }

      // Éxito → pasamos al paso 2
      step1.classList.remove('step-visible');
      step1.classList.add('step-hidden');
      step2.classList.remove('step-hidden');
      step2.classList.add('step-visible');

      // Limpiamos errores del paso 2
      document.getElementById('register-step2-error').style.display = 'none';

    } catch (err) {
      showError('register-step1-error', traducirError(err));
    }
  });

  // ---------- REGISTRO PASO 2 ----------
  step2.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearErrors();

    const userId = window._tempUserId;
    if (!userId) {
      showError('register-step2-error', 'No se pudo identificar al usuario. Intenta de nuevo.');
      return;
    }

    const display_name = document.getElementById('profile-display-name').value.trim();
    const username = document.getElementById('profile-username').value.trim();
    const bio = document.getElementById('profile-bio').value.trim();
    const age = parseInt(document.getElementById('profile-age').value) || null;

    // Validaciones básicas
    if (!display_name || !username) {
      showError('register-step2-error', 'Nombre y usuario son obligatorios.');
      return;
    }

    // Archivos
    const avatarFile = document.getElementById('profile-avatar').files[0];
    const bannerFile = document.getElementById('profile-banner').files[0];

    try {
      // Subir imágenes (si existen)
      const [avatar_url, banner_url] = await Promise.all([
        uploadImage(avatarFile, userId, 'avatar'),
        uploadImage(bannerFile, userId, 'banner')
      ]);

      // Guardar perfil
      await saveProfile(userId, {
        display_name,
        username,
        bio,
        age,
        avatar_url,
        banner_url
      });

      // Redirigir al feed
      window.location.href = 'index.html';

    } catch (err) {
      showError('register-step2-error', traducirError(err));
    }
  });

  // Función auxiliar para mostrar error
  function showError(elementId, mensaje) {
    const el = document.getElementById(elementId);
    if (el) {
      el.textContent = mensaje;
      el.style.display = 'block';
    } else {
      alert(mensaje);
    }
  }

  function clearErrors() {
    document.querySelectorAll('.error-message').forEach(el => {
      el.textContent = '';
      el.style.display = 'none';
    });
  }
});

// Traducción de errores (misma función que tenías)
function traducirError(error) {
  const mensaje = error.message || 'Error desconocido.';
  const traducciones = {
    'Invalid login credentials': 'Correo o contraseña incorrectos.',
    'User already registered': 'Este correo ya está registrado.',
    'Password should be at least 6 characters': 'La contraseña debe tener al menos 6 caracteres.',
    'Unable to validate email address: invalid format': 'El formato del correo no es válido.'
  };
  for (const [clave, valor] of Object.entries(traducciones)) {
    if (mensaje.toLowerCase().includes(clave.toLowerCase())) {
      return valor;
    }
  }
  return mensaje;
}