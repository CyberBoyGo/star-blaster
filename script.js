/* ==========================================
   ANIMAÇÃO DE FUNDO
   ========================================== */
const canvas = document.getElementById('starfield');
const ctx = canvas.getContext('2d');
let stars = [];
const numStars = 150;

function resizeCanvas() { canvas.width = window.innerWidth; canvas.height = window.innerHeight; }
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

class Star {
    constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.z = Math.random() * canvas.width;
        this.radius = Math.random() * 1.5;
    }
    update() {
        this.z -= 2;
        if (this.z <= 0) { this.x = Math.random() * canvas.width; this.y = Math.random() * canvas.height; this.z = canvas.width; }
    }
    draw() {
        let x, y, radius; const fov = 250; const cx = canvas.width / 2; const cy = canvas.height / 2;
        x = (this.x - cx) * (fov / this.z) + cx; y = (this.y - cy) * (fov / this.z) + cy; radius = this.radius * (fov / this.z);
        if (x >= 0 && x <= canvas.width && y >= 0 && y <= canvas.height) {
            ctx.beginPath(); ctx.arc(x, y, radius, 0, Math.PI * 2); ctx.fillStyle = 'rgba(224, 226, 234, '+ (1 - this.z / canvas.width) + ')'; ctx.fill();
        }
    }
}
for (let i = 0; i < numStars; i++) stars.push(new Star());
function animate() {
    ctx.fillStyle = 'rgba(5, 5, 10, 0.8)'; ctx.fillRect(0, 0, canvas.width, canvas.height);
    for (let star of stars) { star.update(); star.draw(); }
    requestAnimationFrame(animate);
}
animate();

document.querySelectorAll('a').forEach(item => {
    item.addEventListener('click', function(e) { if(this.getAttribute('href') === '#') e.preventDefault(); });
});

// Evita que cliques em zonas vazias da página criem foco/cursor visível
document.addEventListener('mousedown', (e) => {
    // Não interferir com seleção de texto nem com formulários
    if (e.detail > 1) return; // ignore double/triple clicks
    const tag = e.target.tagName;
    if (tag === 'INPUT' || tag === 'BUTTON' || tag === 'SELECT' || tag === 'A' || tag === 'TEXTAREA' || tag === 'LABEL') return;
    // Para tudo o resto, cancela o foco para não mostrar cursor/texto em zonas vazias
    if (document.activeElement && document.activeElement !== document.body) {
        document.activeElement.blur();
    }
});

// Em páginas com .no-select, previne o caret piscante em qualquer texto
if (document.body && document.body.classList.contains('no-select')) {
    // Injeta CSS para garantir caret invisível
    const style = document.createElement('style');
    style.textContent = `
        .no-select, .no-select * {
            caret-color: transparent !important;
            -webkit-user-modify: read-only !important;
        }
        .no-select input, .no-select textarea {
            caret-color: auto !important;
            -webkit-user-modify: read-write !important;
        }
    `;
    document.head.appendChild(style);

    // A forma mais fiável: previne o focus em elementos não-interativos via mousedown
    document.addEventListener('mousedown', (e) => {
        const tag = e.target.tagName;
        if (tag === 'INPUT' || tag === 'BUTTON' || tag === 'SELECT' || tag === 'A' || tag === 'TEXTAREA' || tag === 'LABEL') return;
        e.preventDefault();
    }, true);
}

/* ==========================================
   SISTEMA DE MÚSICA & DEFINIÇÕES
   ========================================== */
const bgMusic       = document.getElementById('bgMusic');
const muteBtn       = document.getElementById('muteBtn');
const settingsBtn   = document.getElementById('settingsBtn');
const settingsPanel = document.getElementById('settingsPanel');
const closeSettings = document.getElementById('closeSettings');
const volumeSlider  = document.getElementById('volumeSlider');
const volumeValue   = document.getElementById('volumeValue');
const muteToggle    = document.getElementById('muteToggle');
const autoplayToggle = document.getElementById('autoplayToggle');
const resetMusicBtn = document.getElementById('resetMusicBtn');

function getSavedVolume()   { return parseFloat(localStorage.getItem('sb_volume')   || '0.3'); }
function getSavedMuted()    { return localStorage.getItem('sb_muted')   === '1'; }
function getSavedAutoplay() { return localStorage.getItem('sb_autoplay') !== '0'; }

function syncMuteIcon() {
    if (!muteBtn || !bgMusic) return;
    muteBtn.textContent = bgMusic.muted ? '🔇' : '🔊';
    muteBtn.style.color = bgMusic.muted ? '#888' : '';
    if (bgMusic.muted) {
        muteBtn.classList.remove('music-pulse');
    } else if (!bgMusic.paused) {
        muteBtn.classList.add('music-pulse');
    }
}

if (bgMusic) {
    bgMusic.volume = getSavedVolume();
    bgMusic.muted  = getSavedMuted();

    if (volumeSlider) {
        volumeSlider.value = Math.round(bgMusic.volume * 100);
        if (volumeValue) volumeValue.textContent = Math.round(bgMusic.volume * 100) + '%';
    }
    if (muteToggle)    muteToggle.checked = bgMusic.muted;
    if (autoplayToggle) autoplayToggle.checked = getSavedAutoplay();

    syncMuteIcon();

    if (getSavedAutoplay()) {
        bgMusic.play().then(() => muteBtn.classList.add('music-pulse')).catch(() => {});
    }

    const startOnInteraction = () => {
        if (bgMusic.paused) {
            bgMusic.play().then(() => muteBtn.classList.add('music-pulse')).catch(() => {});
        }
        document.removeEventListener('click', startOnInteraction, true);
        document.removeEventListener('keydown', startOnInteraction, true);
        document.removeEventListener('touchstart', startOnInteraction, true);
    };
    document.addEventListener('click', startOnInteraction, true);
    document.addEventListener('keydown', startOnInteraction, true);
    document.addEventListener('touchstart', startOnInteraction, true);

    if (muteBtn) {
        muteBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            bgMusic.muted = !bgMusic.muted;
            localStorage.setItem('sb_muted', bgMusic.muted ? '1' : '0');
            if (muteToggle) muteToggle.checked = bgMusic.muted;
            syncMuteIcon();
        });
    }

    function openSettings()  { settingsPanel.classList.add('open'); }
    function closeSettingsFn() { settingsPanel.classList.remove('open'); }

    if (settingsBtn) settingsBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        settingsPanel.classList.toggle('open');
    });
    if (closeSettings) closeSettings.addEventListener('click', closeSettingsFn);

    document.addEventListener('click', (e) => {
        if (settingsPanel && !settingsPanel.contains(e.target) && e.target !== settingsBtn) {
            closeSettingsFn();
        }
    });

    if (volumeSlider) {
        volumeSlider.addEventListener('input', (e) => {
            const v = parseInt(e.target.value, 10);
            bgMusic.volume = v / 100;
            if (volumeValue) volumeValue.textContent = v + '%';
            localStorage.setItem('sb_volume', bgMusic.volume);
        });
    }

    if (muteToggle) {
        muteToggle.addEventListener('change', (e) => {
            bgMusic.muted = e.target.checked;
            localStorage.setItem('sb_muted', bgMusic.muted ? '1' : '0');
            syncMuteIcon();
        });
    }

    if (autoplayToggle) {
        autoplayToggle.addEventListener('change', (e) => {
            localStorage.setItem('sb_autoplay', e.target.checked ? '1' : '0');
            if (e.target.checked && bgMusic.paused) {
                bgMusic.play().catch(() => {});
            }
        });
    }

    if (resetMusicBtn) {
        resetMusicBtn.addEventListener('click', () => {
            bgMusic.currentTime = 0;
            bgMusic.play().then(() => muteBtn.classList.add('music-pulse')).catch(() => {});
        });
    }
}

/* ==========================================
   SISTEMA DE AUTENTICAÇÃO (Mock Firebase)
   - Para usar Firebase real, substitui as funções
     export_signIn / export_register / export_signOut
   ========================================== */
const AUTH_KEY = 'sb_users';
const SESSION_KEY = 'sb_session';

function _loadUsers() {
    try { return JSON.parse(localStorage.getItem(AUTH_KEY) || '{}'); }
    catch(_) { return {}; }
}
function _saveUsers(users) { localStorage.setItem(AUTH_KEY, JSON.stringify(users)); }
function _hashPassword(pw) {
    // Hash mock - NÃO usar em produção real
    let h = 0; for (let i = 0; i < pw.length; i++) h = ((h << 5) - h + pw.charCodeAt(i)) | 0;
    return 'h_' + Math.abs(h).toString(16) + '_' + pw.length;
}

function getCurrentUser() {
    try {
        const sess = JSON.parse(localStorage.getItem(SESSION_KEY) || 'null');
        if (!sess || !sess.email) return null;
        const users = _loadUsers();
        return users[sess.email] || null;
    } catch(_) { return null; }
}
function isLoggedIn() { return getCurrentUser() !== null; }

async function export_signIn(email, password) {
    await new Promise(r => setTimeout(r, 500));
    const users = _loadUsers();
    const user = users[email.toLowerCase()];
    if (!user) throw new Error('user_not_found');
    if (user.passwordHash !== _hashPassword(password)) throw new Error('wrong_password');
    localStorage.setItem(SESSION_KEY, JSON.stringify({ email: user.email, loginAt: Date.now() }));
    return user;
}

async function export_register(username, email, password) {
    await new Promise(r => setTimeout(r, 500));
    email = email.toLowerCase().trim();
    username = username.trim();
    const users = _loadUsers();
    if (users[email]) throw new Error('email_in_use');
    for (const u of Object.values(users)) {
        if (u.username.toLowerCase() === username.toLowerCase()) throw new Error('username_in_use');
    }
    const newUser = {
        email, username,
        passwordHash: _hashPassword(password),
        createdAt: Date.now(),
        avatar: '🚀'
    };
    users[email] = newUser;
    _saveUsers(users);
    localStorage.setItem(SESSION_KEY, JSON.stringify({ email, loginAt: Date.now() }));
    return newUser;
}

function export_signOut() { localStorage.removeItem(SESSION_KEY); }

/* ==========================================
   SKIN & STATS PERSISTENCE
   (Used by shop.html & demo.html to record
    purchases and game results to user profile)
   ========================================== */
function saveSkinToProfile(skin) {
    const user = getCurrentUser();
    if (!user || !skin) return false;
    const email = user.email.toLowerCase();
    const key = 'sb_skins_' + email;
    const list = JSON.parse(localStorage.getItem(key) || '[]');
    list.push(Object.assign({ acquiredAt: Date.now() }, skin));
    localStorage.setItem(key, JSON.stringify(list));
    return true;
}

function saveStatsUpdate(updates) {
    const user = getCurrentUser();
    if (!user) return false;
    const email = user.email.toLowerCase();
    const key = 'sb_stats_' + email;
    const stats = JSON.parse(localStorage.getItem(key) || '{}');
    Object.assign(stats, updates);
    localStorage.setItem(key, JSON.stringify(stats));
    return true;
}

function saveRecentGame(game) {
    const user = getCurrentUser();
    if (!user) return false;
    const email = user.email.toLowerCase();
    const key = 'sb_recent_games_' + email;
    const list = JSON.parse(localStorage.getItem(key) || '[]');
    list.unshift(Object.assign({ date: Date.now() }, game));
    if (list.length > 50) list.length = 50;
    localStorage.setItem(key, JSON.stringify(list));
    return true;
}

function updateAuthUI() {
    const user = getCurrentUser();
    const loginItem = document.getElementById('loginNavItem');
    const userItem = document.getElementById('userNavItem');
    const userName = document.getElementById('userNavName');
    if (user && loginItem && userItem) {
        loginItem.style.display = 'none';
        userItem.style.display = '';
        if (userName) userName.textContent = user.username;
    } else if (loginItem && userItem) {
        loginItem.style.display = '';
        userItem.style.display = 'none';
    }
}

function setupUserMenu() {
    const userMenuBtn = document.getElementById('userMenuBtn');
    let userMenu = document.getElementById('userMenu');
    if (!userMenu && userMenuBtn) {
        userMenu = document.createElement('div');
        userMenu.id = 'userMenu';
        userMenu.className = 'user-menu';
        const u = getCurrentUser();
        userMenu.innerHTML = `
            <div class="user-menu-header">
                <div class="user-menu-name">${u ? u.username : ''}</div>
                <div class="user-menu-email">${u ? u.email : ''}</div>
            </div>
            <a href="profile.html" class="user-menu-link" data-i18n="auth_profile">Meu Perfil</a>
            <a href="profile.html#skins" class="user-menu-link" data-i18n="auth_my_skins">As Minhas Skins</a>
            <a href="profile.html#stats" class="user-menu-link" data-i18n="auth_my_stats">As Minhas Estatísticas</a>
            <button id="logoutBtn" class="user-menu-logout" data-i18n="auth_logout">Sair</button>
        `;
        document.body.appendChild(userMenu);
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                export_signOut();
                userMenu.classList.remove('open');
                updateAuthUI();
                location.reload();
            });
        }
    }
    if (userMenuBtn && userMenu) {
        userMenuBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            const u = getCurrentUser();
            if (u) {
                userMenu.querySelector('.user-menu-name').textContent = u.username;
                userMenu.querySelector('.user-menu-email').textContent = u.email;
            }
            userMenu.classList.toggle('open');
        });
        document.addEventListener('click', (e) => {
            if (!userMenu.contains(e.target) && e.target !== userMenuBtn && !userMenuBtn.contains(e.target)) {
                userMenu.classList.remove('open');
            }
        });
    }
}

function setupLoginForm() {
    const form = document.getElementById('loginForm');
    if (!form) return;
    const errorBox = document.getElementById('loginError');
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;
        const submitBtn = form.querySelector('.auth-submit');
        if (errorBox) { errorBox.classList.remove('show'); errorBox.textContent = ''; }
        submitBtn.disabled = true;
        submitBtn.textContent = '...';
        try {
            await export_signIn(email, password);
            window.location.href = 'index.html';
        } catch (err) {
            submitBtn.disabled = false;
            const label = submitBtn.getAttribute('data-i18n');
            submitBtn.textContent = (label && translations[currentLang]?.[label]) || 'ENTRAR';
            const errorMessages = {
                'user_not_found':  'auth_err_user_not_found',
                'wrong_password':  'auth_err_wrong_password'
            };
            const errKey = errorMessages[err.message] || 'auth_err_generic';
            const errMsg = translations[currentLang]?.[errKey] || 'Erro ao entrar. Verifica os dados.';
            if (errorBox) { errorBox.textContent = errMsg; errorBox.classList.add('show'); }
        }
    });
    document.querySelectorAll('.toggle-password').forEach(btn => {
        btn.addEventListener('click', () => {
            const target = document.getElementById(btn.getAttribute('data-target'));
            if (target) {
                target.type = target.type === 'password' ? 'text' : 'password';
                btn.textContent = target.type === 'password' ? '👁️' : '🙈';
            }
        });
    });
}

function setupRegisterForm() {
    const form = document.getElementById('registerForm');
    if (!form) return;
    const errorBox = document.getElementById('registerError');
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = document.getElementById('regUsername').value;
        const email = document.getElementById('regEmail').value;
        const password = document.getElementById('regPassword').value;
        const passwordConfirm = document.getElementById('regPasswordConfirm').value;
        const submitBtn = form.querySelector('.auth-submit');
        if (password !== passwordConfirm) {
            if (errorBox) {
                errorBox.textContent = translations[currentLang]?.auth_err_password_match || 'As palavras-passe não coincidem.';
                errorBox.classList.add('show');
            }
            return;
        }
        if (errorBox) { errorBox.classList.remove('show'); errorBox.textContent = ''; }
        submitBtn.disabled = true;
        submitBtn.textContent = '...';
        try {
            await export_register(username, email, password);
            window.location.href = 'index.html';
        } catch (err) {
            submitBtn.disabled = false;
            const label = submitBtn.getAttribute('data-i18n');
            submitBtn.textContent = (label && translations[currentLang]?.[label]) || 'CRIAR CONTA';
            const errorMessages = {
                'email_in_use':     'auth_err_email_in_use',
                'username_in_use':  'auth_err_username_in_use'
            };
            const errKey = errorMessages[err.message] || 'auth_err_generic';
            const errMsg = translations[currentLang]?.[errKey] || 'Erro ao criar conta.';
            if (errorBox) { errorBox.textContent = errMsg; errorBox.classList.add('show'); }
        }
    });
    document.querySelectorAll('.toggle-password').forEach(btn => {
        btn.addEventListener('click', () => {
            const target = document.getElementById(btn.getAttribute('data-target'));
            if (target) {
                target.type = target.type === 'password' ? 'text' : 'password';
                btn.textContent = target.type === 'password' ? '👁️' : '🙈';
            }
        });
    });
}

updateAuthUI();
setupUserMenu();
setupLoginForm();
setupRegisterForm();

/* ==========================================
   SISTEMA INTERNACIONALIZAÇÃO (i18n)
   ========================================== */
const translations = {
    pt: {
        nav_home: "Início", nav_demo: "Jogar Demo", nav_features: "Características", nav_gallery: "Galeria", nav_skins: "Mercado Negro (Skins)", nav_leaderboard: "Leaderboard", nav_achievements: "Conquistas", nav_login: "Login", nav_credits: "Créditos", nav_login: "Login", nav_credits: "Créditos",
        hero_subtitle: "Defende a galáxia, destrói bosses e domina o leaderboard global!", hero_cta: "JOGAR DEMO AGORA",
        feat_title: "O Que Te Espera", feat_1_title: "Modos de Jogo", feat_1_desc: "Aventura a solo intensa ou Multijogador local no mesmo ecrã com amigos.",
        feat_2_title: "Bosses Épicos", feat_2_desc: "Enfrenta naves colossais que preenchem o ecrã.",
        feat_3_title: "Suporte a Comandos", feat_3_desc: "Joga da forma que preferires. Suporte completo plug-and-play.",
        feat_4_title: "Leaderboard Global", feat_4_desc: "Compara as tuas pontuações online e prova que és o melhor piloto da galáxia.",
        gal_title: "Vislumbre da Batalha", gal_img1: "Gameplay Ação", gal_img2: "Boss Fight", gal_img3: "Modo Co-op",
        skins_title: "Mercado Negro (Skins)", skins_desc: "Compra caixas com dinheiro real para desbloqueares skins exclusivas. Escolhe o teu nível de recompensa!", skins_cta: "ENTRAR NA LOJA", payment_open: "Pagar com Cartão / PayPal", payment_close: "Minimizar", payment_close_btn: "Fechar", payment_toggle_hint: "(clique para minimizar)",  auth_login_title: "Entrar", auth_login_subtitle: "Bem-vindo de volta, piloto!", auth_email: "Email", auth_password: "Palavra-passe", auth_password_confirm: "Confirmar Palavra-passe", auth_username: "Nome de Piloto", auth_username_hint: "Apenas letras, números e underscore. 3-20 caracteres.", auth_password_hint: "Mínimo 6 caracteres.", auth_login_btn: "ENTRAR", auth_register_btn: "CRIAR CONTA", auth_forgot: "Esqueceste a palavra-passe?", auth_or: "ou", auth_register_link: "Criar Nova Conta", auth_login_link: "Já tens conta? Entrar", auth_demo_hint: "Também podes jogar como convidado na", auth_demo_link: "Demo", auth_profile: "Meu Perfil", auth_my_skins: "As Minhas Skins", auth_my_stats: "As Minhas Estatísticas", auth_logout: "Sair", credits_title: "Créditos", credits_subtitle: "A equipa por detrás de Star Blaster", credits_tab_creators: "Criadores", credits_tab_testers: "Testadores", credits_tab_thanks: "Agradecimentos", credits_role_main: "Programador Principal & Diretor Criativo", credits_desc_main: "Conceito original, desenvolvimento, design e tudo o resto!", credits_role_producer: "Produtor",
            credits_role_project_manager: "Gestor de Projeto", credits_desc_producer: "Criador do jogo, scripter e designer gráfico. Trouxe o Star Blaster à vida.",
            credits_role_scripter: "Scripter",
            credits_desc_scripter: "Co-criador do jogo, scripter e designer gráfico.",
            credits_role_graphics_designer: "Designer Gráfico", credits_beta_testers: "Beta Testers", credits_beta_role: "Testadores da Fase Beta", credits_beta_desc: "Pessoas que testaram o jogo durante a fase beta e forneceram feedback valioso.", credits_bug_hunters: "Bug Hunters", credits_bug_role: "Caçadores de Bugs", credits_bug_desc: "Comunidade que reportou bugs e ajudou a melhorar a estabilidade do jogo.", credits_translators: "Tradutores", credits_translators_role: "Equipa de Tradução", credits_translators_desc: "Voluntários que ajudaram a traduzir o jogo para 22 idiomas.", credits_community: "Comunidade Discord", credits_community_role: "Comunidade", credits_community_desc: "Membros do Discord que apoiaram o projeto desde o início.", credits_thanks_title: "Agradecimentos Especiais", credits_thanks_music: "🎵 Música", credits_thanks_music_desc: "Soundtracks criadas para o projeto, disponíveis na pasta space-shooter/Soundtracks/.", credits_thanks_tech: "🛠️ Tecnologias", credits_tech_html: "renderização do jogo e efeitos", credits_tech_css: "animações e estilos", credits_tech_js: "lógica e interatividade", credits_tech_paypal: "sistema de pagamentos", credits_tech_fonts: "fontes do Google Fonts", credits_thanks_support: "💜 Apoia o Projeto", credits_thanks_support_desc: "Se gostas do Star Blaster, considera apoiar o desenvolvimento através de:", credits_support_twitter: "Seguir no", credits_support_youtube: "Subscrever no", credits_support_github: "Dar uma estrela no", credits_thanks_license: "📜 Licença", credits_thanks_license_desc: "Este projeto NÃO é código aberto. Todos os direitos reservados. É proibido copiar, redistribuir ou modificar o código sem autorização explícita do autor.", profile_member_since: "Membro desde", profile_boxes_opened: "Caixas Abertas", profile_total_spent: "Total Gasto", profile_best_score: "Melhor Pontuação", profile_games_played: "Partidas", profile_skins_title: "As Minhas Skins", profile_buy_more: "Comprar Mais", profile_no_skins: "Ainda não tens skins. Compra a tua primeira caixa!", profile_buy_first: "Comprar Primeira Caixa", profile_detailed_stats: "Estatísticas Detalhadas", profile_recent_games: "Partidas Recentes", profile_no_games: "Ainda não jogaste. Experimenta a demo!", profile_play_now: "Jogar Agora", stat_total_score: "Pontuação Total", stat_avg_score: "Pontuação Média", stat_highest_combo: "Maior Combo", stat_enemies_killed: "Inimigos Derrotados", stat_bosses_defeated: "Bosses Derrotados", stat_playtime: "Tempo de Jogo", stat_favorite_skin: "Skin Favorita", stat_legendary_skins: "Skins Lendárias", profile_guest: "Visitante", profile_login_prompt: "Inicia sessão para ver o teu perfil", auth_err_user_not_found: "Utilizador não encontrado.", auth_err_wrong_password: "Palavra-passe incorreta.", auth_err_email_in_use: "Este email já está registado.", auth_err_username_in_use: "Este nome de piloto já existe.", auth_err_password_match: "As palavras-passe não coincidem.", auth_err_generic: "Ocorreu um erro. Tenta novamente.",
        box_standard: "Caixa Padrão", box_epic: "Caixa Épica", box_legendary: "Caixa Lendária",
        lead_title: "Top Pilotos", lead_rank: "Rank", lead_pilot: "Piloto", lead_score: "Pontuação", lead_ship: "Nave",
        footer_rights: "© 2026 Star Blaster. Todos os direitos reservados.",
        msg_processing: "A processar pagamento seguro...", msg_approved: "Pagamento de {price} aprovado! A abrir...",
        settings_title: "Definições", settings_volume: "Volume da Música", settings_mute: "Silenciar Música",
        settings_autoplay: "Tentar iniciar ao carregar", settings_autoplay_note: "Podes precisar de clicar na página se o navegador bloquear o início automático.",
        settings_replay: "🔁 Reiniciar Música", settings_track: "A tocar:"
    },
    en: {
        nav_home: "Home", nav_demo: "Play Demo", nav_features: "Features", nav_gallery: "Gallery", nav_skins: "Black Market", nav_leaderboard: "Leaderboard", nav_achievements: "Achievements", nav_credits: "Credits",
        hero_subtitle: "Defend the galaxy, destroy bosses and dominate the global leaderboard!", hero_cta: "PLAY DEMO NOW",
        feat_title: "What to Expect", feat_1_title: "Game Modes", feat_1_desc: "Intense solo adventure or local couch Co-op with friends.",
        feat_2_title: "Epic Bosses", feat_2_desc: "Face colossal screen-filling ships with relentless attack patterns.",
        feat_3_title: "Gamepad Support", feat_3_desc: "Play your way. Full plug-and-play support for controllers.",
        feat_4_title: "Global Leaderboard", feat_4_desc: "Compare your online scores and prove you're the best pilot.",
        gal_title: "Battle Glimpse", gal_img1: "Action Gameplay", gal_img2: "Boss Fight", gal_img3: "Co-op Mode",
        skins_title: "Black Market (Skins)", skins_desc: "Buy boxes with real money to unlock exclusive skins. Choose your reward tier!", skins_cta: "ENTER THE SHOP", payment_open: "Pay with Card / PayPal", payment_close: "Minimize", payment_close_btn: "Close", payment_toggle_hint: "(click to minimize)",  auth_login_title: "Sign In", auth_login_subtitle: "Welcome back, pilot!", auth_email: "Email", auth_password: "Password", auth_password_confirm: "Confirm Password", auth_username: "Pilot Name", auth_username_hint: "Letters, numbers, and underscore only. 3-20 characters.", auth_password_hint: "Minimum 6 characters.", auth_login_btn: "SIGN IN", auth_register_btn: "CREATE ACCOUNT", auth_forgot: "Forgot password?", auth_or: "or", auth_register_link: "Create New Account", auth_login_link: "Already have an account? Sign in", auth_demo_hint: "You can also play as a guest in the", auth_demo_link: "Demo", auth_profile: "My Profile", auth_my_skins: "My Skins", auth_my_stats: "My Statistics", auth_logout: "Sign Out", credits_title: "Credits", credits_subtitle: "The team behind Star Blaster", credits_tab_creators: "Creators", credits_tab_testers: "Testers", credits_tab_thanks: "Thanks", credits_role_main: "Lead Programmer & Creative Director", credits_desc_main: "Original concept, development, design and everything else!", credits_role_producer: "Producer",
            credits_role_project_manager: "Project Manager", credits_desc_producer: "Game creator, scripter, and graphics designer. Brought Star Blaster to life.",
            credits_role_scripter: "Scripter",
            credits_desc_scripter: "Co-creator of the game, scripter, and graphics designer.",
            credits_role_graphics_designer: "Graphics Designer", credits_beta_testers: "Beta Testers", credits_beta_role: "Beta Phase Testers", credits_beta_desc: "People who tested the game during the beta phase and provided valuable feedback.", credits_bug_hunters: "Bug Hunters", credits_bug_role: "Bug Hunters", credits_bug_desc: "Community that reported bugs and helped improve game stability.", credits_translators: "Translators", credits_translators_role: "Translation Team", credits_translators_desc: "Volunteers who helped translate the game into 22 languages.", credits_community: "Discord Community", credits_community_role: "Community", credits_community_desc: "Discord members who supported the project from the beginning.", credits_thanks_title: "Special Thanks", credits_thanks_music: "🎵 Music", credits_thanks_music_desc: "Soundtracks created for the project, available in the space-shooter/Soundtracks/ folder.", credits_thanks_tech: "🛠️ Technologies", credits_tech_html: "game rendering and effects", credits_tech_css: "animations and styles", credits_tech_js: "logic and interactivity", credits_tech_paypal: "payment system", credits_tech_fonts: "Google Fonts", credits_thanks_support: "💜 Support the Project", credits_thanks_support_desc: "If you enjoy Star Blaster, consider supporting development through:", credits_support_twitter: "Follow on", credits_support_youtube: "Subscribe on", credits_support_github: "Star on", credits_thanks_license: "📜 License", credits_thanks_license_desc: "This project is NOT open source. All rights reserved. Copying, redistributing or modifying the code without explicit author authorization is prohibited.", profile_member_since: "Member since", profile_boxes_opened: "Boxes Opened", profile_total_spent: "Total Spent", profile_best_score: "Best Score", profile_games_played: "Games Played", profile_skins_title: "My Skins", profile_buy_more: "Buy More", profile_no_skins: "You don't have any skins yet. Buy your first box!", profile_buy_first: "Buy First Box", profile_detailed_stats: "Detailed Statistics", profile_recent_games: "Recent Games", profile_no_games: "You haven't played yet. Try the demo!", profile_play_now: "Play Now", stat_total_score: "Total Score", stat_avg_score: "Average Score", stat_highest_combo: "Highest Combo", stat_enemies_killed: "Enemies Killed", stat_bosses_defeated: "Bosses Defeated", stat_playtime: "Playtime", stat_favorite_skin: "Favorite Skin", stat_legendary_skins: "Legendary Skins", profile_guest: "Guest", profile_login_prompt: "Sign in to view your profile", auth_err_user_not_found: "User not found.", auth_err_wrong_password: "Incorrect password.", auth_err_email_in_use: "This email is already registered.", auth_err_username_in_use: "This pilot name already exists.", auth_err_password_match: "Passwords do not match.", auth_err_generic: "An error occurred. Please try again.",
        box_standard: "Standard Box", box_epic: "Epic Box", box_legendary: "Legendary Box",
        lead_title: "Top Pilots", lead_rank: "Rank", lead_pilot: "Pilot", lead_score: "Score", lead_ship: "Ship",
        footer_rights: "© 2026 Star Blaster. All rights reserved.",
        msg_processing: "Processing secure payment...", msg_approved: "Payment of {price} approved! Opening...",
        settings_title: "Settings", settings_volume: "Music Volume", settings_mute: "Mute Music",
        settings_autoplay: "Try to autoplay on load", settings_autoplay_note: "You may need to click the page if your browser blocks autoplay.",
        settings_replay: "🔁 Restart Music", settings_track: "Now playing:"
    },
    es: {
        nav_home: "Inicio", nav_demo: "Jugar Demo", nav_features: "Características", nav_gallery: "Galería", nav_skins: "Mercado Negro", nav_leaderboard: "Clasificación", nav_credits: "Créditos", nav_achievements: "Logros", nav_login: "Acceder",
        hero_subtitle: "¡Defiende la galaxia, destruye jefes y domina la clasificación mundial!", hero_cta: "JUGAR DEMO AHORA",
        feat_title: "Lo Que Te Espera", feat_1_title: "Modos de Juego", feat_1_desc: "Aventura en solitario o multijugador cooperativo local.",
        feat_2_title: "Jefes Épicos", feat_2_desc: "Enfréntete a naves colosales con patrones de ataque implacables.",
        feat_3_title: "Soporte de Mando", feat_3_desc: "Juega como quieras. Soporte completo para mandos.",
        feat_4_title: "Clasificación Mundial", feat_4_desc: "Compara tus puntuaciones y demuestra que eres el mejor.",
        gal_title: "Vistazo a la Batalla", gal_img1: "Juego de Acción", gal_img2: "Lucha de Jefes", gal_img3: "Modo Cooperativo",
        skins_title: "Mercado Negro (Skins)", skins_desc: "Compra cajas con dinero real para desbloquear aspectos exclusivos.", skins_cta: "ENTRAR EN LA TIENDA", payment_open: "Pagar con Tarjeta / PayPal", payment_close: "Minimizar", payment_close_btn: "Cerrar", payment_toggle_hint: "(clic para minimizar)",  auth_login_title: "Iniciar Sesión", auth_login_subtitle: "¡Bienvenido de nuevo, piloto!", auth_email: "Email", auth_password: "Contraseña", auth_password_confirm: "Confirmar Contraseña", auth_username: "Nombre de Piloto", auth_username_hint: "Solo letras, números y guion bajo. 3-20 caracteres.", auth_password_hint: "Mínimo 6 caracteres.", auth_login_btn: "ENTRAR", auth_register_btn: "CREAR CUENTA", auth_forgot: "¿Olvidaste la contraseña?", auth_or: "o", auth_register_link: "Crear Nueva Cuenta", auth_login_link: "¿Ya tienes cuenta? Entrar", auth_demo_hint: "También puedes jugar como invitado en la", auth_demo_link: "Demo", auth_profile: "Mi Perfil", auth_my_skins: "Mis Skins", auth_my_stats: "Mis Estadísticas", auth_logout: "Cerrar Sesión", credits_title: "Créditos", credits_subtitle: "El equipo detrás de Star Blaster", credits_tab_creators: "Creadores", credits_tab_testers: "Testers", credits_tab_thanks: "Agradecimientos", credits_role_main: "Programador Principal & Director Creativo", credits_desc_main: "¡Concepto original, desarrollo, diseño y todo lo demás!", credits_role_producer: "Productor",
            credits_role_project_manager: "Gestor de Proyecto", credits_desc_producer: "Creador del juego, scripter y diseñador gráfico. Dio vida a Star Blaster.",
            credits_role_scripter: "Scripter",
            credits_desc_scripter: "Co-creador del juego, scripter y diseñador gráfico.",
            credits_role_graphics_designer: "Diseñador Gráfico", credits_beta_testers: "Beta Testers", credits_beta_role: "Testers de la Fase Beta", credits_beta_desc: "Personas que probaron el juego durante la fase beta y aportaron valiosos comentarios.", credits_bug_hunters: "Cazadores de Bugs", credits_bug_role: "Cazadores de Bugs", credits_bug_desc: "Comunidad que reportó bugs y ayudó a mejorar la estabilidad del juego.", credits_translators: "Traductores", credits_translators_role: "Equipo de Traducción", credits_translators_desc: "Voluntarios que ayudaron a traducir el juego a 22 idiomas.", credits_community: "Comunidad Discord", credits_community_role: "Comunidad", credits_community_desc: "Miembros de Discord que apoyaron el proyecto desde el principio.", credits_thanks_title: "Agradecimientos Especiales", credits_thanks_music: "🎵 Música", credits_thanks_music_desc: "Soundtracks creadas para el proyecto, disponibles en la carpeta space-shooter/Soundtracks/.", credits_thanks_tech: "🛠️ Tecnologías", credits_tech_html: "renderizado del juego y efectos", credits_tech_css: "animaciones y estilos", credits_tech_js: "lógica e interactividad", credits_tech_paypal: "sistema de pagos", credits_tech_fonts: "fuentes de Google Fonts", credits_thanks_support: "💜 Apoya el Proyecto", credits_thanks_support_desc: "Si te gusta Star Blaster, considera apoyar el desarrollo a través de:", credits_support_twitter: "Seguir en", credits_support_youtube: "Suscribirse en", credits_support_github: "Dar estrella en", credits_thanks_license: "📜 Licencia", credits_thanks_license_desc: "Este proyecto NO es código abierto. Todos los derechos reservados. Está prohibido copiar, redistribuir o modificar el código sin autorización explícita del autor.", profile_member_since: "Miembro desde", profile_boxes_opened: "Cajas Abiertas", profile_total_spent: "Total Gastado", profile_best_score: "Mejor Puntuación", profile_games_played: "Partidas", profile_skins_title: "Mis Skins", profile_buy_more: "Comprar Más", profile_no_skins: "¡Aún no tienes skins. Compra tu primera caja!", profile_buy_first: "Comprar Primera Caja", profile_detailed_stats: "Estadísticas Detalladas", profile_recent_games: "Partidas Recientes", profile_no_games: "¡Aún no has jugado. Prueba la demo!", profile_play_now: "Jugar Ahora", stat_total_score: "Puntuación Total", stat_avg_score: "Puntuación Media", stat_highest_combo: "Mayor Combo", stat_enemies_killed: "Enemigos Derrotados", stat_bosses_defeated: "Jefes Derrotados", stat_playtime: "Tiempo de Juego", stat_favorite_skin: "Skin Favorita", stat_legendary_skins: "Skins Legendarias", profile_guest: "Invitado", profile_login_prompt: "Inicia sesión para ver tu perfil", auth_err_user_not_found: "Usuario no encontrado.", auth_err_wrong_password: "Contraseña incorrecta.", auth_err_email_in_use: "Este email ya está registrado.", auth_err_username_in_use: "Este nombre de piloto ya existe.", auth_err_password_match: "Las contraseñas no coinciden.", auth_err_generic: "Ocurrió un error. Inténtalo de nuevo.",
        box_standard: "Caja Estándar", box_epic: "Caja Épica", box_legendary: "Caja Legendaria",
        lead_title: "Mejores Pilotos", lead_rank: "Rango", lead_pilot: "Piloto", lead_score: "Puntuación", lead_ship: "Nave",
        footer_rights: "© 2026 Star Blaster. Todos los derechos reservados.",
        msg_processing: "Procesando pago seguro...", msg_approved: "¡Pago de {price} aprobado! Abriendo...",
        settings_title: "Ajustes", settings_volume: "Volumen de Música", settings_mute: "Silenciar Música",
        settings_autoplay: "Intentar reproducir al cargar", settings_autoplay_note: "Puede que necesites hacer clic si bloquea el navegador.",
        settings_replay: "🔁 Reiniciar Música", settings_track: "Reproduciendo:"
    },
    fr: {
        nav_home: "Accueil", nav_demo: "Jouer Démo", nav_features: "Fonctionnalités", nav_gallery: "Galerie", nav_skins: "Marché Noir", nav_achievements: "Succès", nav_credits: "Crédits", nav_leaderboard: "Classement", nav_login: "Connexion",
        hero_subtitle: "Défendez la galaxie, détruisez les boss et dominez le classement !", hero_cta: "JOUER LA DÉMO",
        feat_title: "À Quoi S'attendre", feat_1_title: "Modes de Jeu", feat_1_desc: "Aventure solo intense ou Co-op local.",
        feat_2_title: "Boss Épiques", feat_2_desc: "Affrontez des vaisseaux colossaux aux attaques impitoyables.",
        feat_3_title: "Support Manette", feat_3_desc: "Jouez comme vous voulez avec un support manette complet.",
        feat_4_title: "Classement Mondial", feat_4_desc: "Comparez vos scores en ligne et prouvez votre valeur.",
        gal_title: "Aperçu de Bataille", gal_img1: "Action Gameplay", gal_img2: "Combat de Boss", gal_img3: "Mode Co-op",
        skins_title: "Marché Noir (Skins)", skins_desc: "Achetez des boîtes avec de l'argent réel pour des skins exclusifs.", skins_cta: "ENTRER DANS LA BOUTIQUE", payment_open: "Payer par Carte / PayPal", payment_close: "Minimiser", payment_close_btn: "Fermer", payment_toggle_hint: "(cliquez pour minimiser)",  auth_login_title: "Connexion", auth_login_subtitle: "Bon retour, pilote !", auth_email: "Email", auth_password: "Mot de passe", auth_password_confirm: "Confirmer le mot de passe", auth_username: "Nom de Pilote", auth_username_hint: "Lettres, chiffres et underscore uniquement. 3-20 caractères.", auth_password_hint: "Minimum 6 caractères.", auth_login_btn: "SE CONNECTER", auth_register_btn: "CRÉER UN COMPTE", auth_forgot: "Mot de passe oublié ?", auth_or: "ou", auth_register_link: "Créer un Nouveau Compte", auth_login_link: "Déjà un compte ? Se connecter", auth_demo_hint: "Vous pouvez aussi jouer en invité dans la", auth_demo_link: "Démo", auth_profile: "Mon Profil", auth_my_skins: "Mes Skins", auth_my_stats: "Mes Statistiques", auth_logout: "Déconnexion", credits_title: "Crédits", credits_subtitle: "L'équipe derrière Star Blaster", credits_tab_creators: "Créateurs", credits_tab_testers: "Testeurs", credits_tab_thanks: "Remerciements", credits_role_main: "Programmeur Principal & Directeur Créatif", credits_desc_main: "Concept original, développement, design et tout le reste !", credits_role_producer: "Producteur",
            credits_role_project_manager: "Gestionnaire de Projet", credits_desc_producer: "Créateur du jeu, scripter et designer graphique. A donné vie à Star Blaster.",
            credits_role_scripter: "Scripter",
            credits_desc_scripter: "Co-créateur du jeu, scripter et designer graphique.",
            credits_role_graphics_designer: "Designer Graphique", credits_beta_testers: "Bêta Testeurs", credits_beta_role: "Testeurs de la Phase Bêta", credits_beta_desc: "Personnes qui ont testé le jeu pendant la phase bêta et fourni des retours précieux.", credits_bug_hunters: "Chasseurs de Bugs", credits_bug_role: "Chasseurs de Bugs", credits_bug_desc: "Communauté ayant signalé des bugs et aidé à améliorer la stabilité du jeu.", credits_translators: "Traducteurs", credits_translators_role: "Équipe de Traduction", credits_translators_desc: "Bénévoles ayant aidé à traduire le jeu en 22 langues.", credits_community: "Communauté Discord", credits_community_role: "Communauté", credits_community_desc: "Membres Discord qui ont soutenu le projet depuis le début.", credits_thanks_title: "Remerciements Spéciaux", credits_thanks_music: "🎵 Musique", credits_thanks_music_desc: "Bandes-son créées pour le projet, disponibles dans le dossier space-shooter/Soundtracks/.", credits_thanks_tech: "🛠️ Technologies", credits_tech_html: "rendu du jeu et effets", credits_tech_css: "animations et styles", credits_tech_js: "logique et interactivité", credits_tech_paypal: "système de paiement", credits_tech_fonts: "polices Google Fonts", credits_thanks_support: "💜 Soutenir le Projet", credits_thanks_support_desc: "Si vous appréciez Star Blaster, pensez à soutenir le développement via :", credits_support_twitter: "Suivre sur", credits_support_youtube: "S'abonner sur", credits_support_github: "Mettre une étoile sur", credits_thanks_license: "📜 Licence", credits_thanks_license_desc: "Ce projet N'EST PAS open source. Tous droits réservés. Copier, redistribuer ou modifier le code sans autorisation explicite de l'auteur est interdit.", profile_member_since: "Membre depuis", profile_boxes_opened: "Boîtes Ouvertes", profile_total_spent: "Total Dépensé", profile_best_score: "Meilleur Score", profile_games_played: "Parties", profile_skins_title: "Mes Skins", profile_buy_more: "Acheter Plus", profile_no_skins: "Vous n'avez pas encore de skins. Achetez votre première boîte !", profile_buy_first: "Acheter Première Boîte", profile_detailed_stats: "Statistiques Détaillées", profile_recent_games: "Parties Récentes", profile_no_games: "Vous n'avez pas encore joué. Essayez la démo !", profile_play_now: "Jouer", stat_total_score: "Score Total", stat_avg_score: "Score Moyen", stat_highest_combo: "Meilleur Combo", stat_enemies_killed: "Ennemis Vaincus", stat_bosses_defeated: "Boss Vaincus", stat_playtime: "Temps de Jeu", stat_favorite_skin: "Skin Préférée", stat_legendary_skins: "Skins Légendaires", profile_guest: "Invité", profile_login_prompt: "Connectez-vous pour voir votre profil", auth_err_user_not_found: "Utilisateur non trouvé.", auth_err_wrong_password: "Mot de passe incorrect.", auth_err_email_in_use: "Cet email est déjà enregistré.", auth_err_username_in_use: "Ce nom de pilote existe déjà.", auth_err_password_match: "Les mots de passe ne correspondent pas.", auth_err_generic: "Une erreur est survenue. Réessayez.",
        box_standard: "Boîte Standard", box_epic: "Boîte Épique", box_legendary: "Boîte Légendaire",
        lead_title: "Meilleurs Pilotes", lead_rank: "Rang", lead_pilot: "Pilote", lead_score: "Score", lead_ship: "Vaisseau",
        footer_rights: "© 2026 Star Blaster. Tous droits réservés.",
        msg_processing: "Traitement du paiement...", msg_approved: "Paiement de {price} approuvé ! Ouverture...",
        settings_title: "Paramètres", settings_volume: "Volume de la Musique", settings_mute: "Couper le Son",
        settings_autoplay: "Essayer de lire au chargement", settings_autoplay_note: "Vous devrez peut-être cliquer si le navigateur bloque la lecture.",
        settings_replay: "🔁 Redémarrer la Musique", settings_track: "En lecture:"
    },
    de: {
        nav_home: "Startseite", nav_demo: "Demo Spielen", nav_features: "Funktionen", nav_gallery: "Galerie", nav_achievements: "Erfolge", nav_credits: "Mitwirkende", nav_skins: "Schwarzmarkt", nav_leaderboard: "Bestenliste", nav_login: "Anmelden",
        hero_subtitle: "Verteidige die Galaxie, zerstöre Bosse und dominiere die Bestenliste!", hero_cta: "JETZT DEMO SPIELEN",
        feat_title: "Was Dich Erwartet", feat_1_title: "Spielmodi", feat_1_desc: "Intensives Solo-Abenteuer oder lokaler Co-op.",
        feat_2_title: "Epische Bosse", feat_2_desc: "Kämpfe gegen kolossale Schiffe mit unerbittlichen Angriffen.",
        feat_3_title: "Gamepad-Support", feat_3_desc: "Volle Plug-and-Play Unterstützung für Controller.",
        feat_4_title: "Globale Bestenliste", feat_4_desc: "Vergleiche deine Scores und werde der beste Pilot.",
        gal_title: "Schlacht-Einblick", gal_img1: "Action Gameplay", gal_img2: "Bosskampf", gal_img3: "Co-op Modus",
        skins_title: "Schwarzmarkt (Skins)", skins_desc: "Kaufe Boxen mit echtem Geld, um exklusive Skins freizuschalten.", skins_cta: "ZUM SHOP GEHEN", payment_open: "Mit Karte / PayPal bezahlen", payment_close: "Minimieren", payment_close_btn: "Schließen", payment_toggle_hint: "(klicken zum Minimieren)",  auth_login_title: "Anmelden", auth_login_subtitle: "Willkommen zurück, Pilot!", auth_email: "E-Mail", auth_password: "Passwort", auth_password_confirm: "Passwort bestätigen", auth_username: "Pilotenname", auth_username_hint: "Nur Buchstaben, Zahlen und Unterstrich. 3-20 Zeichen.", auth_password_hint: "Mindestens 6 Zeichen.", auth_login_btn: "ANMELDEN", auth_register_btn: "KONTO ERSTELLEN", auth_forgot: "Passwort vergessen?", auth_or: "oder", auth_register_link: "Neues Konto erstellen", auth_login_link: "Bereits ein Konto? Anmelden", auth_demo_hint: "Du kannst auch als Gast spielen in der", auth_demo_link: "Demo", auth_profile: "Mein Profil", auth_my_skins: "Meine Skins", auth_my_stats: "Meine Statistiken", auth_logout: "Abmelden", credits_title: "Mitwirkende", credits_subtitle: "Das Team hinter Star Blaster", credits_tab_creators: "Entwickler", credits_tab_testers: "Tester", credits_tab_thanks: "Dank", credits_role_main: "Lead-Programmierer & Kreativdirektor", credits_desc_main: "Ursprüngliches Konzept, Entwicklung, Design und alles andere!", credits_role_producer: "Produzent",
            credits_role_project_manager: "Projektleiter", credits_desc_producer: "Spielersteller, Scripter und Grafikdesigner. Hat Star Blaster zum Leben erweckt.",
            credits_role_scripter: "Scripter",
            credits_desc_scripter: "Mitschöpfer des Spiels, Scripter und Grafikdesigner.",
            credits_role_graphics_designer: "Grafikdesigner", credits_beta_testers: "Beta-Tester", credits_beta_role: "Beta-Phasen-Tester", credits_beta_desc: "Personen, die das Spiel in der Betaphase getestet und wertvolles Feedback gegeben haben.", credits_bug_hunters: "Bug-Jäger", credits_bug_role: "Bug-Jäger", credits_bug_desc: "Community, die Bugs gemeldet und die Spielstabilität verbessert hat.", credits_translators: "Übersetzer", credits_translators_role: "Übersetzungsteam", credits_translators_desc: "Freiwillige, die geholfen haben, das Spiel in 22 Sprachen zu übersetzen.", credits_community: "Discord-Community", credits_community_role: "Community", credits_community_desc: "Discord-Mitglieder, die das Projekt von Anfang an unterstützt haben.", credits_thanks_title: "Besonderer Dank", credits_thanks_music: "🎵 Musik", credits_thanks_music_desc: "Soundtracks für das Projekt, verfügbar im Ordner space-shooter/Soundtracks/.", credits_thanks_tech: "🛠️ Technologien", credits_tech_html: "Spiel-Rendering und Effekte", credits_tech_css: "Animationen und Stile", credits_tech_js: "Logik und Interaktivität", credits_tech_paypal: "Zahlungssystem", credits_tech_fonts: "Google Fonts", credits_thanks_support: "💜 Unterstütze das Projekt", credits_thanks_support_desc: "Wenn dir Star Blaster gefällt, unterstütze die Entwicklung durch:", credits_support_twitter: "Folgen auf", credits_support_youtube: "Abonnieren auf", credits_support_github: "Stern vergeben auf", credits_thanks_license: "📜 Lizenz", credits_thanks_license_desc: "Dieses Projekt ist KEINE Open Source. Alle Rechte vorbehalten. Das Kopieren, Verteilen oder Ändern des Codes ohne ausdrückliche Genehmigung des Autors ist verboten.", profile_member_since: "Mitglied seit", profile_boxes_opened: "Boxen Geöffnet", profile_total_spent: "Gesamt Ausgegeben", profile_best_score: "Bester Punktestand", profile_games_played: "Spiele Gespielt", profile_skins_title: "Meine Skins", profile_buy_more: "Mehr Kaufen", profile_no_skins: "Du hast noch keine Skins. Kaufe deine erste Box!", profile_buy_first: "Erste Box Kaufen", profile_detailed_stats: "Detaillierte Statistiken", profile_recent_games: "Letzte Spiele", profile_no_games: "Du hast noch nicht gespielt. Probiere die Demo!", profile_play_now: "Jetzt Spielen", stat_total_score: "Gesamtpunktzahl", stat_avg_score: "Durchschnittspunktzahl", stat_highest_combo: "Höchste Combo", stat_enemies_killed: "Besiegte Feinde", stat_bosses_defeated: "Besiegte Bosse", stat_playtime: "Spielzeit", stat_favorite_skin: "Lieblings-Skin", stat_legendary_skins: "Legendäre Skins", profile_guest: "Gast", profile_login_prompt: "Melde dich an, um dein Profil zu sehen", auth_err_user_not_found: "Benutzer nicht gefunden.", auth_err_wrong_password: "Falsches Passwort.", auth_err_email_in_use: "Diese E-Mail ist bereits registriert.", auth_err_username_in_use: "Dieser Pilotenname existiert bereits.", auth_err_password_match: "Passwörter stimmen nicht überein.", auth_err_generic: "Ein Fehler ist aufgetreten. Bitte erneut versuchen.",
        box_standard: "Standard-Box", box_epic: "Epische Box", box_legendary: "Legendäre Box",
        lead_title: "Top Piloten", lead_rank: "Rang", lead_pilot: "Pilot", lead_score: "Punktzahl", lead_ship: "Schiff",
        footer_rights: "© 2026 Star Blaster. Alle Rechte vorbehalten.",
        msg_processing: "Sichere Zahlung wird bearbeitet...", msg_approved: "Zahlung von {price} genehmigt! Öffnen...",
        settings_title: "Einstellungen", settings_volume: "Musiklautstärke", settings_mute: "Musik stummschalten",
        settings_autoplay: "Beim Laden abspielen", settings_autoplay_note: "Eventuell muss du klicken, wenn der Browser es blockiert.",
        settings_replay: "🔁 Musik neu starten", settings_track: "Wird gespielt:"
    },
    zh: {
        nav_home: "首页", nav_demo: "试玩演示", nav_credits: "制作人员", nav_features: "特色", nav_achievements: "成就", nav_gallery: "画廊", nav_skins: "黑市 (皮肤)", nav_leaderboard: "排行榜", nav_login: "登录",
        hero_subtitle: "捍卫银河系，摧毁Boss并称霸全球排行榜！", hero_cta: "立即试玩",
        feat_title: "游戏特色", feat_1_title: "游戏模式", feat_1_desc: "紧张的单人冒险或本地同屏合作。",
        feat_2_title: "史诗Boss", feat_2_desc: "面对满屏的巨型飞船和无情的弹幕攻击。",
        feat_3_title: "手柄支持", feat_3_desc: "即插即用的游戏手柄全面支持。",
        feat_4_title: "全球排行", feat_4_desc: "在线比较你的分数，证明你是最佳飞行员。",
        gal_title: "战斗一瞥", gal_img1: "动作实机", gal_img2: "Boss战", gal_img3: "合作模式",
        skins_title: "黑市 (皮肤)", skins_desc: "用真钱购买盲盒来解锁独家皮肤。选择你的奖励等级！", skins_cta: "进入商店", payment_open: "使用卡 / PayPal 支付", payment_close: "最小化", payment_close_btn: "关闭", payment_toggle_hint: "(点击最小化)",  auth_login_title: "登录", auth_login_subtitle: "欢迎回来,飞行员!", auth_email: "邮箱", auth_password: "密码", auth_password_confirm: "确认密码", auth_username: "飞行员名字", auth_username_hint: "仅限字母、数字和下划线。3-20 个字符。", auth_password_hint: "最少 6 个字符。", auth_login_btn: "登录", auth_register_btn: "创建账户", auth_forgot: "忘记密码?", auth_or: "或", auth_register_link: "创建新账户", auth_login_link: "已有账户? 登录", auth_demo_hint: "你也可以作为访客在", auth_demo_link: "演示版", auth_profile: "我的资料", auth_my_skins: "我的皮肤", auth_my_stats: "我的统计", auth_logout: "退出", credits_title: "制作人员", credits_subtitle: "Star Blaster背后的团队", credits_tab_creators: "创作者", credits_tab_testers: "测试人员", credits_tab_thanks: "致谢", credits_role_main: "主程序员 & 创意总监", credits_desc_main: "原创概念、开发、设计等等！", credits_role_producer: "制作人",
            credits_role_project_manager: "项目经理", credits_desc_producer: "游戏创作者、脚本师和美术设计师。让 Star Blaster 焕发活力。",
            credits_role_scripter: "脚本师",
            credits_desc_scripter: "游戏的共同创作者、脚本师和美术设计师。",
            credits_role_graphics_designer: "美术设计师", credits_beta_testers: "Beta测试者", credits_beta_role: "Beta阶段测试者", credits_beta_desc: "在Beta阶段测试游戏并提供宝贵反馈的人员。", credits_bug_hunters: "Bug猎人", credits_bug_role: "Bug猎人", credits_bug_desc: "报告Bug并帮助改善游戏稳定性的社区。", credits_translators: "翻译者", credits_translators_role: "翻译团队", credits_translators_desc: "帮助将游戏翻译成22种语言的志愿者。", credits_community: "Discord社区", credits_community_role: "社区", credits_community_desc: "从一开始就支持该项目的Discord成员。", credits_thanks_title: "特别感谢", credits_thanks_music: "🎵 音乐", credits_thanks_music_desc: "为项目创作的原声带,可在 space-shooter/Soundtracks/ 文件夹中找到。", credits_thanks_tech: "🛠️ 技术", credits_tech_html: "游戏渲染和效果", credits_tech_css: "动画和样式", credits_tech_js: "逻辑和交互", credits_tech_paypal: "支付系统", credits_tech_fonts: "Google字体", credits_thanks_support: "💜 支持项目", credits_thanks_support_desc: "如果你喜欢Star Blaster,请通过以下方式支持开发:", credits_support_twitter: "关注", credits_support_youtube: "订阅", credits_support_github: "加星标于", credits_thanks_license: "📜 许可证", credits_thanks_license_desc: "本项目不是开源项目。版权所有。未经作者明确授权,禁止复制、重新分发或修改代码。", profile_member_since: "会员自", profile_boxes_opened: "已开启宝箱", profile_total_spent: "总消费", profile_best_score: "最高分", profile_games_played: "游戏次数", profile_skins_title: "我的皮肤", profile_buy_more: "购买更多", profile_no_skins: "您还没有皮肤。购买您的第一个宝箱！", profile_buy_first: "购买第一个宝箱", profile_detailed_stats: "详细统计", profile_recent_games: "最近游戏", profile_no_games: "您还没有玩过。试试演示！", profile_play_now: "立即游戏", stat_total_score: "总分", stat_avg_score: "平均分", stat_highest_combo: "最高连击", stat_enemies_killed: "击败敌人", stat_bosses_defeated: "击败Boss", stat_playtime: "游戏时间", stat_favorite_skin: "最爱皮肤", stat_legendary_skins: "传奇皮肤", profile_guest: "访客", profile_login_prompt: "登录查看您的个人资料", auth_err_user_not_found: "未找到用户。", auth_err_wrong_password: "密码错误。", auth_err_email_in_use: "该邮箱已被注册。", auth_err_username_in_use: "该飞行员名字已存在。", auth_err_password_match: "密码不匹配。", auth_err_generic: "发生错误。请重试。",
        box_standard: "标准盲盒", box_epic: "史诗盲盒", box_legendary: "传奇盲盒",
        lead_title: "顶级飞行员", lead_rank: "排名", lead_pilot: "飞行员", lead_score: "分数", lead_ship: "飞船",
        footer_rights: "© 2026 Star Blaster。保留所有权利。",
        msg_processing: "正在处理安全付款...", msg_approved: "付款 {price} 已批准！正在打开...",
        settings_title: "设置", settings_volume: "音乐音量", settings_mute: "静音",
        settings_autoplay: "加载时尝试播放", settings_autoplay_note: "如果浏览器阻止自动播放，你可能需要点击页面。",
        settings_replay: "🔁 重新播放", settings_track: "正在播放:"
    },
    ja: {
        nav_home: "ホーム", nav_achievements: "実績", nav_credits: "クレジット", nav_demo: "デモをプレイ", nav_features: "機能", nav_gallery: "ギャラリー", nav_skins: "ブラックマーケット", nav_leaderboard: "リーダーボード", nav_login: "ログイン",
        hero_subtitle: "銀河を守り、ボスを破壊し、ランキングを支配せよ！", hero_cta: "今すぐデモをプレイ",
        feat_title: "ゲームの特徴", feat_1_title: "ゲームモード", feat_1_desc: "激しいソロアドベンチャー、またはローカルCo-op。",
        feat_2_title: "エピックボス", feat_2_desc: "画面を埋め尽くす巨大な敵船と無慈悲な攻撃パターン。",
        feat_3_title: "ゲームパッド対応", feat_3_desc: "コントローラーのプラグアンドプレイに完全対応。",
        feat_4_title: "グローバルランキング", feat_4_desc: "オンラインでスコアを競い、最高のパイロットであることを証明しよう。",
        gal_title: "戦闘の様子", gal_img1: "アクションプレイ", gal_img2: "ボス戦", gal_img3: "協力モード",
        skins_title: "ブラックマーケット（スキン）", skins_desc: "リアルマネーでボックスを購入し、専用スキンをアンロックしよう。", skins_cta: "ショップへ入る", payment_open: "カード / PayPal で支払う", payment_close: "最小化", payment_close_btn: "閉じる", payment_toggle_hint: "(クリックして最小化)",  auth_login_title: "ログイン", auth_login_subtitle: "おかえりなさい、パイロット！", auth_email: "メール", auth_password: "パスワード", auth_password_confirm: "パスワード確認", auth_username: "パイロット名", auth_username_hint: "英数字とアンダースコアのみ。3-20文字。", auth_password_hint: "6文字以上。", auth_login_btn: "ログイン", auth_register_btn: "アカウント作成", auth_forgot: "パスワードをお忘れですか？", auth_or: "または", auth_register_link: "新規アカウント作成", auth_login_link: "アカウントをお持ちですか？ログイン", auth_demo_hint: "ゲストとしてもプレイできます：", auth_demo_link: "デモ", auth_profile: "マイプロフィール", auth_my_skins: "マイスキン", auth_my_stats: "マイ統計", auth_logout: "ログアウト", credits_title: "クレジット", credits_subtitle: "Star Blasterの開発チーム", credits_tab_creators: "クリエイター", credits_tab_testers: "テスター", credits_tab_thanks: "謝辞", credits_role_main: "リードプログラマー & クリエイティブディレクター", credits_desc_main: "オリジナルコンセプト、開発、デザイン、その他すべて！", credits_role_producer: "プロデューサー",
            credits_role_project_manager: "プロジェクトマネージャー", credits_desc_producer: "ゲームクリエイター、スクリプター、グラフィックデザイナー。Star Blasterに命を吹き込んだ。",
            credits_role_scripter: "スクリプター",
            credits_desc_scripter: "ゲームの共同クリエイター、スクリプター、グラフィックデザイナー。",
            credits_role_graphics_designer: "グラフィックデザイナー", credits_beta_testers: "ベータテスター", credits_beta_role: "ベータフェーズのテスター", credits_beta_desc: "ベータフェーズ中にゲームをテストし、貴重なフィードバックを提供してくれた人々。", credits_bug_hunters: "バグハンター", credits_bug_role: "バグハンター", credits_bug_desc: "バグを報告し、ゲームの安定性向上に貢献してくれたコミュニティ。", credits_translators: "翻訳者", credits_translators_role: "翻訳チーム", credits_translators_desc: "ゲームを22言語に翻訳するのを助けてくれたボランティア。", credits_community: "Discordコミュニティ", credits_community_role: "コミュニティ", credits_community_desc: "最初からプロジェクトを支援してくれたDiscordメンバー。", credits_thanks_title: "特別な感謝", credits_thanks_music: "🎵 音楽", credits_thanks_music_desc: "プロジェクト用に作成されたサウンドトラック、space-shooter/Soundtracks/ フォルダで利用可能。", credits_thanks_tech: "🛠️ テクノロジー", credits_tech_html: "ゲームレンダリングとエフェクト", credits_tech_css: "アニメーションとスタイル", credits_tech_js: "ロジックとインタラクティビティ", credits_tech_paypal: "決済システム", credits_tech_fonts: "Googleフォント", credits_thanks_support: "💜 プロジェクトを支援する", credits_thanks_support_desc: "Star Blasterを楽しんでいただけたら、以下の方法で開発を支援してください:", credits_support_twitter: "フォローする", credits_support_youtube: "チャンネル登録", credits_support_github: "スターを付ける", credits_thanks_license: "📜 ライセンス", credits_thanks_license_desc: "このプロジェクトはオープンソースではありません。全著作権所有。作者の明示的な許可なく、コードを複製、配布、変更することは禁止されています。", profile_member_since: "登録日", profile_boxes_opened: "開けたボックス", profile_total_spent: "総支出", profile_best_score: "最高スコア", profile_games_played: "プレイ回数", profile_skins_title: "マイスキン", profile_buy_more: "もっと買う", profile_no_skins: "まだスキンを持っていません。最初のボックスを買おう！", profile_buy_first: "最初のボックスを買う", profile_detailed_stats: "詳細統計", profile_recent_games: "最近のゲーム", profile_no_games: "まだプレイしていません。デモを試そう！", profile_play_now: "今すぐプレイ", stat_total_score: "総スコア", stat_avg_score: "平均スコア", stat_highest_combo: "最大コンボ", stat_enemies_killed: "倒した敵", stat_bosses_defeated: "倒したボス", stat_playtime: "プレイ時間", stat_favorite_skin: "お気に入りスキン", stat_legendary_skins: "レジェンダリースキン", profile_guest: "ゲスト", profile_login_prompt: "プロフィールを見るにはログイン", auth_err_user_not_found: "ユーザーが見つかりません。", auth_err_wrong_password: "パスワードが正しくありません。", auth_err_email_in_use: "このメールは既に登録されています。", auth_err_username_in_use: "このパイロット名は既に存在します。", auth_err_password_match: "パスワードが一致しません。", auth_err_generic: "エラーが発生しました。再試行してください。",
        box_standard: "スタンダードボックス", box_epic: "エピックボックス", box_legendary: "レジェンダリーボックス",
        lead_title: "トップパイロット", lead_rank: "ランク", lead_pilot: "パイロット", lead_score: "スコア", lead_ship: "船",
        footer_rights: "© 2026 Star Blaster. All rights reserved.",
        msg_processing: "安全な支払い処理中...", msg_approved: "{price}の支払いが承認されました！開封中...",
        settings_title: "設定", settings_volume: "音楽の音量", settings_mute: "ミュート",
        settings_autoplay: "ロード時に再生を試みる", settings_autoplay_note: "ブラウザがブロックした場合は、ページをクリックする必要がある場合があります。",
        settings_replay: "🔁 音楽を再開", settings_track: "再生中:"
    },
    it: {
        nav_home: "Home", nav_achievements: "Obiettivi", nav_credits: "Crediti", nav_demo: "Gioca Demo", nav_features: "Caratteristiche", nav_gallery: "Galleria", nav_skins: "Mercato Nero", nav_leaderboard: "Classifica", nav_login: "Accedi",
        hero_subtitle: "Difendi la galassia, distruggi i boss e domina la classifica globale!", hero_cta: "GIOCA SUBITO",
        feat_title: "Cosa Ti Aspetta", feat_1_title: "Modalità di Gioco", feat_1_desc: "Avventura in single player o cooperativa locale con gli amici.",
        feat_2_title: "Boss Epici", feat_2_desc: "Affronta navi colossali che riempiono lo schermo con attacchi implacabili.",
        feat_3_title: "Supporto Controller", feat_3_desc: "Gioca come preferisci. Supporto completo plug-and-play.",
        feat_4_title: "Classifica Globale", feat_4_desc: "Confronta i tuoi punteggi online e dimostra di essere il miglior pilota.",
        gal_title: "Scorcio di Battaglia", gal_img1: "Gameplay Azione", gal_img2: "Boss Fight", gal_img3: "Modalità Co-op",
        skins_title: "Mercato Nero (Skin)", skins_desc: "Acquista casse con denaro reale per sbloccare skin esclusive. Scegli il tuo livello di ricompensa!",
        skins_cta: "VAI AL NEGOZIO", payment_open: "Paga con Carta / PayPal", payment_close: "Riduci a icona", payment_close_btn: "Chiudi", payment_toggle_hint: "(clicca per ridurre)",  auth_login_title: "Accedi", auth_login_subtitle: "Bentornato, pilota!", auth_email: "Email", auth_password: "Password", auth_password_confirm: "Conferma Password", auth_username: "Nome Pilota", auth_username_hint: "Solo lettere, numeri e underscore. 3-20 caratteri.", auth_password_hint: "Minimo 6 caratteri.", auth_login_btn: "ACCEDI", auth_register_btn: "CREA ACCOUNT", auth_forgot: "Password dimenticata?", auth_or: "oppure", auth_register_link: "Crea Nuovo Account", auth_login_link: "Hai già un account? Accedi", auth_demo_hint: "Puoi anche giocare come ospite nella", auth_demo_link: "Demo", auth_profile: "Il Mio Profilo", auth_my_skins: "Le Mie Skin", auth_my_stats: "Le Mie Statistiche", auth_logout: "Esci", credits_title: "Crediti", credits_subtitle: "Il team dietro Star Blaster", credits_tab_creators: "Creatori", credits_tab_testers: "Tester", credits_tab_thanks: "Ringraziamenti", credits_role_main: "Programmatore Principale & Direttore Creativo", credits_desc_main: "Concept originale, sviluppo, design e tutto il resto!", credits_role_producer: "Produttore",
            credits_role_project_manager: "Project Manager", credits_desc_producer: "Creatore del gioco, scripter e graphic designer. Ha dato vita a Star Blaster.",
            credits_role_scripter: "Scripter",
            credits_desc_scripter: "Co-creatore del gioco, scripter e graphic designer.",
            credits_role_graphics_designer: "Graphic Designer", credits_beta_testers: "Beta Tester", credits_beta_role: "Tester della Fase Beta", credits_beta_desc: "Persone che hanno testato il gioco durante la fase beta e fornito feedback preziosi.", credits_bug_hunters: "Cacciatori di Bug", credits_bug_role: "Cacciatori di Bug", credits_bug_desc: "Community che ha segnalato bug e aiutato a migliorare la stabilità del gioco.", credits_translators: "Traduttori", credits_translators_role: "Team di Traduzione", credits_translators_desc: "Volontari che hanno aiutato a tradurre il gioco in 22 lingue.", credits_community: "Community Discord", credits_community_role: "Community", credits_community_desc: "Membri Discord che hanno supportato il progetto fin dall'inizio.", credits_thanks_title: "Ringraziamenti Speciali", credits_thanks_music: "🎵 Musica", credits_thanks_music_desc: "Colonne sonore create per il progetto, disponibili nella cartella space-shooter/Soundtracks/.", credits_thanks_tech: "🛠️ Tecnologie", credits_tech_html: "rendering del gioco ed effetti", credits_tech_css: "animazioni e stili", credits_tech_js: "logica e interattività", credits_tech_paypal: "sistema di pagamento", credits_tech_fonts: "font di Google Fonts", credits_thanks_support: "💜 Supporta il Progetto", credits_thanks_support_desc: "Se ti piace Star Blaster, considera di supportare lo sviluppo tramite:", credits_support_twitter: "Segui su", credits_support_youtube: "Iscriviti su", credits_support_github: "Metti una stella su", credits_thanks_license: "📜 Licenza", credits_thanks_license_desc: "Questo progetto NON è open source. Tutti i diritti riservati. È vietato copiare, ridistribuire o modificare il codice senza esplicita autorizzazione dell'autore.", profile_member_since: "Membro da", profile_boxes_opened: "Casse Aperte", profile_total_spent: "Totale Speso", profile_best_score: "Miglior Punteggio", profile_games_played: "Partite", profile_skins_title: "Le Mie Skin", profile_buy_more: "Compra Altro", profile_no_skins: "Non hai ancora skin. Acquista la tua prima cassa!", profile_buy_first: "Compra Prima Cassa", profile_detailed_stats: "Statistiche Dettagliate", profile_recent_games: "Partite Recenti", profile_no_games: "Non hai ancora giocato. Prova la demo!", profile_play_now: "Gioca Ora", stat_total_score: "Punteggio Totale", stat_avg_score: "Punteggio Medio", stat_highest_combo: "Combo Massima", stat_enemies_killed: "Nemici Sconfitti", stat_bosses_defeated: "Boss Sconfitti", stat_playtime: "Tempo di Gioco", stat_favorite_skin: "Skin Preferita", stat_legendary_skins: "Skin Leggendarie", profile_guest: "Ospite", profile_login_prompt: "Accedi per vedere il tuo profilo", auth_err_user_not_found: "Utente non trovato.", auth_err_wrong_password: "Password errata.", auth_err_email_in_use: "Questa email è già registrata.", auth_err_username_in_use: "Questo nome pilota esiste già.", auth_err_password_match: "Le password non corrispondono.", auth_err_generic: "Si è verificato un errore. Riprova.",
        box_standard: "Cassa Standard", box_epic: "Cassa Epica", box_legendary: "Cassa Leggendaria",
        lead_title: "Migliori Piloti", lead_rank: "Rango", lead_pilot: "Pilota", lead_score: "Punteggio", lead_ship: "Nave",
        footer_rights: "© 2026 Star Blaster. Tutti i diritti riservati.",
        msg_processing: "Elaborazione pagamento sicuro...", msg_approved: "Pagamento di {price} approvato! Apertura...",
        settings_title: "Impostazioni", settings_volume: "Volume della Musica", settings_mute: "Disattiva Musica",
        settings_autoplay: "Prova riproduzione automatica", settings_autoplay_note: "Potresti dover cliccare la pagina se il browser lo blocca.",
        settings_replay: "🔁 Riavvia Musica", settings_track: "In riproduzione:"
  , nav_credits: "Титры"  },
    ru: {
        nav_home: "Главная", nav_demo: "Играть Демо", nav_features: "Особенности", nav_gallery: "Галерея", nav_skins: "Чёрный Рынок", nav_leaderboard: "Лидеры", nav_login: "Войти",
        hero_subtitle: "Защищай галактику, уничтожай боссов и доминируй в мировом рейтинге!", hero_cta: "ИГРАТЬ СЕЙЧАС",
        feat_title: "Что Тебя Ждёт", feat_1_title: "Режимы Игры", feat_1_desc: "Напряжённое одиночное приключение или локальный кооп с друзьями.",
        feat_2_title: "Эпические Боссы", feat_2_desc: "Сразись с колоссальными кораблями, заполняющими экран.",
        feat_3_title: "Поддержка Геймпадов", feat_3_desc: "Играй как хочешь. Полная поддержка plug-and-play.",
        feat_4_title: "Глобальный Рейтинг", feat_4_desc: "Сравни свои результаты онлайн и докажи, что ты лучший пилот.",
        gal_title: "Осколок Битвы", gal_img1: "Геймплей", gal_img2: "Бой с Боссом", gal_img3: "Кооп Режим",
        skins_title: "Чёрный Рынок (Скины)", skins_desc: "Покупай кейсы за реальные деньги, чтобы разблокировать эксклюзивные скины. Выбери свой уровень награды!",
        skins_cta: "В МАГАЗИН", payment_open: "Оплата Картой / PayPal", payment_close: "Свернуть", payment_close_btn: "Закрыть", payment_toggle_hint: "(нажмите чтобы свернуть)",  auth_login_title: "Войти", auth_login_subtitle: "С возвращением, пилот!", auth_email: "Email", auth_password: "Пароль", auth_password_confirm: "Подтвердите Пароль", auth_username: "Имя Пилота", auth_username_hint: "Только буквы, цифры и подчёркивание. 3-20 символов.", auth_password_hint: "Минимум 6 символов.", auth_login_btn: "ВОЙТИ", auth_register_btn: "СОЗДАТЬ АККАУНТ", auth_forgot: "Забыли пароль?", auth_or: "или", auth_register_link: "Создать Новый Аккаунт", auth_login_link: "Уже есть аккаунт? Войти", auth_demo_hint: "Вы также можете играть как гость в", auth_demo_link: "Демо", auth_profile: "Мой Профиль", auth_my_skins: "Мои Скины", auth_my_stats: "Моя Статистика", auth_logout: "Выйти", credits_title: "Титры", credits_subtitle: "Команда Star Blaster", credits_tab_creators: "Создатели", credits_tab_testers: "Тестеры", credits_tab_thanks: "Благодарности", credits_role_main: "Главный Программист & Креативный Директор", credits_desc_main: "Оригинальная концепция, разработка, дизайн и всё остальное!", credits_role_producer: "Продюсер",
            credits_role_project_manager: "Менеджер Проекта", credits_desc_producer: "Создатель игры, скриптер и графический дизайнер. Воплотил Star Blaster в жизнь.",
            credits_role_scripter: "Скриптер",
            credits_desc_scripter: "Со-создатель игры, скриптер и графический дизайнер.",
            credits_role_graphics_designer: "Графический Дизайнер", credits_beta_testers: "Бета-Тестеры", credits_beta_role: "Тестеры Бета-Фазы", credits_beta_desc: "Люди, которые тестировали игру в бета-фазе и дали ценные отзывы.", credits_bug_hunters: "Охотники за Багами", credits_bug_role: "Охотники за Багами", credits_bug_desc: "Сообщество, которое сообщало о багах и помогало улучшать стабильность игры.", credits_translators: "Переводчики", credits_translators_role: "Команда Переводчиков", credits_translators_desc: "Волонтёры, которые помогли перевести игру на 22 языка.", credits_community: "Discord Сообщество", credits_community_role: "Сообщество", credits_community_desc: "Участники Discord, которые поддерживали проект с самого начала.", credits_thanks_title: "Особые Благодарности", credits_thanks_music: "🎵 Музыка", credits_thanks_music_desc: "Саундтреки, созданные для проекта, доступны в папке space-shooter/Soundtracks/.", credits_thanks_tech: "🛠️ Технологии", credits_tech_html: "рендеринг игры и эффекты", credits_tech_css: "анимации и стили", credits_tech_js: "логика и интерактивность", credits_tech_paypal: "платёжная система", credits_tech_fonts: "шрифты Google Fonts", credits_thanks_support: "💜 Поддержите Проект", credits_thanks_support_desc: "Если вам нравится Star Blaster, поддержите разработку через:", credits_support_twitter: "Подписаться в", credits_support_youtube: "Подписаться на", credits_support_github: "Поставить звезду на", credits_thanks_license: "📜 Лицензия", credits_thanks_license_desc: "Этот проект НЕ является открытым исходным кодом. Все права защищены. Копирование, распространение или изменение кода без явного разрешения автора запрещено.", profile_member_since: "Участник с", profile_boxes_opened: "Открыто Коробок", profile_total_spent: "Всего Потрачено", profile_best_score: "Лучший Счёт", profile_games_played: "Сыграно Игр", profile_skins_title: "Мои Скины", profile_buy_more: "Купить Ещё", profile_no_skins: "У вас пока нет скинов. Купите свою первую коробку!", profile_buy_first: "Купить Первую Коробку", profile_detailed_stats: "Подробная Статистика", profile_recent_games: "Недавние Игры", profile_no_games: "Вы ещё не играли. Попробуйте демо!", profile_play_now: "Играть Сейчас", stat_total_score: "Общий Счёт", stat_avg_score: "Средний Счёт", stat_highest_combo: "Максимальное Комбо", stat_enemies_killed: "Убито Врагов", stat_bosses_defeated: "Побеждено Боссов", stat_playtime: "Время Игры", stat_favorite_skin: "Любимый Скин", stat_legendary_skins: "Легендарные Скины", profile_guest: "Гость", profile_login_prompt: "Войдите, чтобы увидеть профиль", auth_err_user_not_found: "Пользователь не найден.", auth_err_wrong_password: "Неверный пароль.", auth_err_email_in_use: "Этот email уже зарегистрирован.", auth_err_username_in_use: "Это имя пилота уже существует.", auth_err_password_match: "Пароли не совпадают.", auth_err_generic: "Произошла ошибка. Попробуйте снова.",
        box_standard: "Стандартный Кейс", box_epic: "Эпический Кейс", box_legendary: "Легендарный Кейс",
        lead_title: "Топ Пилоты", lead_rank: "Ранг", lead_pilot: "Пилот", lead_score: "Очки", lead_ship: "Корабль",
        footer_rights: "© 2026 Star Blaster. Все права защищены.",
        msg_processing: "Обработка безопасного платежа...", msg_approved: "Платёж {price} одобрен! Открытие...",
        settings_title: "Настройки", settings_volume: "Громкость Музыки", settings_mute: "Отключить Музыку",
        settings_autoplay: "Попробовать автозапуск", settings_autoplay_note: "Возможно потребуется кликнуть по странице, если браузер блокирует.",
        settings_replay: "🔁 Перезапустить Музыку", nav_achievements: "Достижения", settings_track: "Играет:", nav_credits: "Титры",
    },
    ar: {
        nav_home: "الرئيسية", nav_demo: "تشغيل Demo", nav_features: "المميزات", nav_gallery: "المعرض", nav_skins: "السوق السوداء", nav_leaderboard: "المتصدرين", nav_login: "دخول",
        hero_subtitle: "دافع عن المجرة، دمر الزعماء وكن الأول في الترتيب العالمي!", hero_cta: "العب الآن",
        feat_title: "ما ينتظرك", feat_1_title: "أوضاع اللعب", feat_1_desc: "مغامرة فردية مكثفة أو تعاون محلي مع الأصدقاء.",
        feat_2_title: "زعماء ملحميون", feat_2_desc: "واجه سفنًا ضخمة تملأ الشاشة بهجمات لا ترحم.",
        feat_3_title: "دعم وحدات التحكم", feat_3_desc: "العب بالطريقة التي تفضلها مع دعم كامل للأذرع.",
        feat_4_title: "ترتيب عالمي", feat_4_desc: "قارن درجاتك على الإنترنت وأثبت أنك أفضل pilot.",
        gal_title: "لمحة من المعركة", gal_img1: "أكشن اللعب", gal_img2: "معركة زعيم", gal_img3: "وضع تعاوني",
        skins_title: "السوق السوداء (السكنات)", skins_desc: "اشترِ صناديق بأموال حقيقية لفتح سكنات حصرية. اختر مستوى المكافأة!",
        skins_cta: "ادخل المتجر", payment_open: "الدفع بالبطاقة / PayPal", payment_close: "تصغير", payment_close_btn: "إغلاق", payment_toggle_hint: "(انقر للتصغير)",  auth_login_title: "تسجيل الدخول", auth_login_subtitle: "مرحبًا بعودتك أيها الطيار!", auth_email: "البريد الإلكتروني", auth_password: "كلمة المرور", auth_password_confirm: "تأكيد كلمة المرور", auth_username: "اسم الطيار", auth_username_hint: "أحرف وأرقام وشرطة سفلية فقط. 3-20 حرفًا.", auth_password_hint: "الحد الأدنى 6 أحرف.", auth_login_btn: "تسجيل الدخول", auth_register_btn: "إنشاء حساب", auth_forgot: "نسيت كلمة المرور؟", auth_or: "أو", auth_register_link: "إنشاء حساب جديد", auth_login_link: "لديك حساب بالفعل؟ تسجيل الدخول", auth_demo_hint: "يمكنك أيضًا اللعب كضيف في", auth_demo_link: "النسخة التجريبية", auth_profile: "ملفي الشخصي", auth_my_skins: "السكنات الخاصة بي", auth_my_stats: "إحصائياتي", auth_logout: "تسجيل الخروج", credits_title: "الاعتمادات", credits_subtitle: "الفريق وراء Star Blaster", credits_tab_creators: "المبدعون", credits_tab_testers: "المختبرون", credits_tab_thanks: "الشكر", credits_role_main: "المبرمج الرئيسي & المدير الإبداعي", credits_desc_main: "الفكرة الأصلية، التطوير، التصميم وكل شيء آخر!", credits_role_producer: "منتج",
            credits_role_project_manager: "مدير المشروع", credits_desc_producer: "مبتكر اللعبة، مبرمج سكربتات، ومصمم جرافيك. أحيا Star Blaster.",
            credits_role_scripter: "مبرمج سكربتات",
            credits_desc_scripter: "مشارك في ابتكار اللعبة، مبرمج سكربتات، ومصمم جرافيك.",
            credits_role_graphics_designer: "مصمم جرافيك", credits_beta_testers: "مختبرو بيتا", credits_beta_role: "مختبرو مرحلة بيتا", credits_beta_desc: "الأشخاص الذين اختبروا اللعبة خلال مرحلة بيتا وقدموا ملاحظات قيمة.", credits_bug_hunters: "صيادو الأخطاء", credits_bug_role: "صيادو الأخطاء", credits_bug_desc: "مجتمع أبلغ عن الأخطاء وساعد في تحسين استقرار اللعبة.", credits_translators: "المترجمون", credits_translators_role: "فريق الترجمة", credits_translators_desc: "متطوعون ساعدوا في ترجمة اللعبة إلى 22 لغة.", credits_community: "مجتمع Discord", credits_community_role: "المجتمع", credits_community_desc: "أعضاء Discord الذين دعموا المشروع منذ البداية.", credits_thanks_title: "شكر خاص", credits_thanks_music: "🎵 الموسيقى", credits_thanks_music_desc: "موسيقى تصويرية تم إنشاؤها للمشروع، متاحة في مجلد space-shooter/Soundtracks/.", credits_thanks_tech: "🛠️ التقنيات", credits_tech_html: "عرض اللعبة والمؤثرات", credits_tech_css: "الحركات والأنماط", credits_tech_js: "المنطق والتفاعل", credits_tech_paypal: "نظام الدفع", credits_tech_fonts: "خطوط Google Fonts", credits_thanks_support: "💜 ادعم المشروع", credits_thanks_support_desc: "إذا كنت تستمتع بـ Star Blaster، فكر في دعم التطوير من خلال:", credits_support_twitter: "تابع على", credits_support_youtube: "اشترك في", credits_support_github: "ضع نجمة على", credits_thanks_license: "📜 الترخيص", credits_thanks_license_desc: "هذا المشروع ليس مفتوح المصدر. جميع الحقوق محفوظة. يُمنع نسخ الكود أو إعادة توزيعه أو تعديله دون إذن صريح من المؤلف.", profile_member_since: "عضو منذ", profile_boxes_opened: "الصناديق المفتوحة", profile_total_spent: "إجمالي الإنفاق", profile_best_score: "أفضل نتيجة", profile_games_played: "الألعاب", profile_skins_title: "سكناتي", profile_buy_more: "شراء المزيد", profile_no_skins: "ليس لديك سكنات بعد. اشترِ صندوقك الأول!", profile_buy_first: "اشترِ الصندوق الأول", profile_detailed_stats: "إحصائيات مفصلة", profile_recent_games: "الألعاب الأخيرة", profile_no_games: "لم تلعب بعد. جرب العرض التجريبي!", profile_play_now: "العب الآن", stat_total_score: "النتيجة الإجمالية", stat_avg_score: "متوسط النتيجة", stat_highest_combo: "أعلى كومبو", stat_enemies_killed: "الأعداء المقتولين", stat_bosses_defeated: "الرؤساء المقتولين", stat_playtime: "وقت اللعب", stat_favorite_skin: "السكن المفضل", stat_legendary_skins: "السكنات الأسطورية", profile_guest: "ضيف", profile_login_prompt: "سجل الدخول لعرض ملفك الشخصي", auth_err_user_not_found: "المستخدم غير موجود.", auth_err_wrong_password: "كلمة المرور غير صحيحة.", auth_err_email_in_use: "هذا البريد الإلكتروني مسجل بالفعل.", auth_err_username_in_use: "اسم الطيار هذا موجود بالفعل.", auth_err_password_match: "كلمات المرور غير متطابقة.", auth_err_generic: "حدث خطأ. حاول مرة أخرى.",
        box_standard: "صندوق قياسي", box_epic: "صندوق ملحمي", box_legendary: "صندوق أسطوري",
        lead_title: "أفضل الطيارين", lead_rank: "المرتبة", lead_pilot: "الطيار", lead_score: "النقاط", lead_ship: "السفينة",
        footer_rights: "© 2026 Star Blaster. جميع الحقوق محفوظة.",
        msg_processing: "معالجة الدفع الآمن...", msg_approved: "تمت الموافقة على دفع {price}! جاري الفتح...",
        settings_title: "الإعدادات", settings_volume: "مستوى الموسيقى", settings_mute: "كتم الموسيقى",
        settings_autoplay: "محاولة التشغيل التلقائي", settings_autoplay_note: "قد تحتاج للنقر على الصفحة إذا منع المتصفح.",
        settings_replay: "🔁 إعادة تشغيل الموسيقى", nav_achievements: "الإنجازات", nav_credits: "الاعتمادات", settings_track: "يتم تشغيل:"
    },
    hi: {
        nav_home: "होम", nav_demo: "डेमो खेलें", nav_features: "विशेषताएं", nav_gallery: "गैलरी", nav_skins: "ब्लैक मार्केट", nav_leaderboard: "लीडरबोर्ड", nav_login: "लॉगिन",
        hero_subtitle: "गैलेक्सी की रक्षा करें, बॉस को हराएं और वैश्विक लीडरबोर्ड पर राज करें!", hero_cta: "अभी खेलें",
        feat_title: "आपकी प्रतीक्षा हो रही है", feat_1_title: "गेम मोड", feat_1_desc: "तीव्र एकल साहसिक या दोस्तों के साथ स्थानीय सहकारी।",
        feat_2_title: "महाकाव्य बॉस", feat_2_desc: "विशाल स्क्रीन-भरने वाले जहाजों से लड़ें।",
        feat_3_title: "गेमपैड सहायता", feat_3_desc: "अपनी पसंद के अनुसार खेलें। पूर्ण प्लग-एंड-प्ले।",
        feat_4_title: "वैश्विक लीडरबोर्ड", feat_4_desc: "ऑनलाइन स्कोर की तुलना करें और साबित करें कि आप सर्वश्रेष्ठ पायलट हैं।",
        gal_title: "युद्ध की झलक", gal_img1: "एक्शन गेमप्ले", gal_img2: "बॉस फाइट", gal_img3: "को-ऑप मोड",
        skins_title: "ब्लैक मार्केट (स्किन्स)", skins_desc: "अनन्य स्किन्स अनलॉक करने के लिए असली पैसों से बक्से खरीदें। अपना इनाम स्तर चुनें!",
        skins_cta: "दुकान में जाएं", payment_open: "कार्ड / PayPal से भुगतान", payment_close: "छोटा करें", payment_close_btn: "बंद करें", payment_toggle_hint: "(छोटा करने के लिए क्लिक करें)",  auth_login_title: "साइन इन", auth_login_subtitle: "वापस स्वागत है, पायलट!", auth_email: "ईमेल", auth_password: "पासवर्ड", auth_password_confirm: "पासवर्ड की पुष्टि करें", auth_username: "पायलट नाम", auth_username_hint: "केवल अक्षर, संख्या और अंडरस्कोर। 3-20 वर्ण।", auth_password_hint: "न्यूनतम 6 वर्ण।", auth_login_btn: "साइन इन", auth_register_btn: "खाता बनाएं", auth_forgot: "पासवर्ड भूल गए?", auth_or: "या", auth_register_link: "नया खाता बनाएं", auth_login_link: "पहले से खाता है? साइन इन", auth_demo_hint: "आप अतिथि के रूप में भी खेल सकते हैं", auth_demo_link: "डेमो", auth_profile: "मेरी प्रोफ़ाइल", auth_my_skins: "मेरे स्किन्स", auth_my_stats: "मेरे आंकड़े", auth_logout: "साइन आउट", credits_title: "क्रेडिट", credits_subtitle: "Star Blaster के पीछे की टीम", credits_tab_creators: "निर्माता", credits_tab_testers: "परीक्षक", credits_tab_thanks: "धन्यवाद", credits_role_main: "मुख्य प्रोग्रामर & क्रिएटिव डायरेक्टर", credits_desc_main: "मूल अवधारणा, विकास, डिज़ाइन और बाकी सब!", credits_role_producer: "निर्माता",
            credits_role_project_manager: "परियोजना प्रबंधक", credits_desc_producer: "गेम क्रिएटर, स्क्रिप्टर और ग्राफिक्स डिज़ाइनर। Star Blaster को जीवंत किया।",
            credits_role_scripter: "स्क्रिप्टर",
            credits_desc_scripter: "गेम के सह-निर्माता, स्क्रिप्टर और ग्राफिक्स डिज़ाइनर।",
            credits_role_graphics_designer: "ग्राफिक्स डिज़ाइनर", credits_beta_testers: "बीटा परीक्षक", credits_beta_role: "बीटा चरण परीक्षक", credits_beta_desc: "वे लोग जिन्होंने बीटा चरण के दौरान गेम का परीक्षण किया और मूल्यवान प्रतिक्रिया दी।", credits_bug_hunters: "बग शिकारी", credits_bug_role: "बग शिकारी", credits_bug_desc: "समुदाय ने बग्स की रिपोर्ट की और गेम स्थिरता में सुधार करने में मदद की।", credits_translators: "अनुवादक", credits_translators_role: "अनुवाद टीम", credits_translators_desc: "स्वयंसेवक जिन्होंने गेम को 22 भाषाओं में अनुवाद करने में मदद की।", credits_community: "Discord समुदाय", credits_community_role: "समुदाय", credits_community_desc: "Discord सदस्य जिन्होंने शुरू से ही परियोजना का समर्थन किया।", credits_thanks_title: "विशेष धन्यवाद", credits_thanks_music: "🎵 संगीत", credits_thanks_music_desc: "परियोजना के लिए बनाए गए साउंडट्रैक, space-shooter/Soundtracks/ फ़ोल्डर में उपलब्ध।", credits_thanks_tech: "🛠️ तकनीकें", credits_tech_html: "गेम रेंडरिंग और प्रभाव", credits_tech_css: "एनिमेशन और शैलियाँ", credits_tech_js: "तर्क और अन्तरक्रियाशीलता", credits_tech_paypal: "भुगतान प्रणाली", credits_tech_fonts: "Google Fonts", credits_thanks_support: "💜 प्रोजेक्ट का समर्थन करें", credits_thanks_support_desc: "यदि आप Star Blaster का आनंद लेते हैं, तो इसके विकास का समर्थन करने पर विचार करें:", credits_support_twitter: "पर फॉलो करें", credits_support_youtube: "पर सब्सक्राइब करें", credits_support_github: "पर स्टार दें", credits_thanks_license: "📜 लाइसेंस", credits_thanks_license_desc: "यह प्रोजेक्ट ओपन सोर्स नहीं है। सर्वाधिकार सुरक्षित। लेखक की स्पष्ट अनुमति के बिना कोड की नकल, पुनर्वितरण या संशोधन प्रतिबंधित है।", profile_member_since: "सदस्य बने", profile_boxes_opened: "खोले गए बक्से", profile_total_spent: "कुल खर्च", profile_best_score: "सर्वश्रेष्ठ स्कोर", profile_games_played: "खेले गए खेल", profile_skins_title: "मेरे स्किन", profile_buy_more: "और खरीदें", profile_no_skins: "आपके पास अभी कोई स्किन नहीं है। अपना पहला बक्सा खरीदें!", profile_buy_first: "पहला बक्सा खरीदें", profile_detailed_stats: "विस्तृत आंकड़े", profile_recent_games: "हाल के खेल", profile_no_games: "आपने अभी तक नहीं खेला। डेमो आज़माएँ!", profile_play_now: "अभी खेलें", stat_total_score: "कुल स्कोर", stat_avg_score: "औसत स्कोर", stat_highest_combo: "सबसे बड़ा कॉम्बो", stat_enemies_killed: "मारे गए दुश्मन", stat_bosses_defeated: "मारे गए बॉस", stat_playtime: "खेल का समय", stat_favorite_skin: "पसंदीदा स्किन", stat_legendary_skins: "पौराणिक स्किन", profile_guest: "अतिथि", profile_login_prompt: "प्रोफ़ाइल देखने के लिए लॉग इन करें", auth_err_user_not_found: "उपयोगकर्ता नहीं मिला।", auth_err_wrong_password: "गलत पासवर्ड।", auth_err_email_in_use: "यह ईमेल पहले से पंजीकृत है।", auth_err_username_in_use: "यह पायलट नाम पहले से मौजूद है।", auth_err_password_match: "पासवर्ड मेल नहीं खाते।", auth_err_generic: "एक त्रुटि हुई। कृपया पुनः प्रयास करें।",
        box_standard: "मानक बॉक्स", box_epic: "महाकाव्य बॉक्स", box_legendary: "पौराणिक बॉक्स",
        lead_title: "शीर्ष पायलट", lead_rank: "रैंक", lead_pilot: "पायलट", lead_score: "स्कोर", lead_ship: "जहाज",
        footer_rights: "© 2026 Star Blaster. सर्वाधिकार सुरक्षित।",
        msg_processing: "सुरक्षित भुगतान संसाधित हो रहा है...", msg_approved: "{price} का भुगतान स्वीकृत! खोल रहे हैं...",
        settings_title: "सेटिंग्स", settings_volume: "संगीत की मात्रा", settings_mute: "संगीत म्यूट करें",
        settings_autoplay: "लोड पर ऑटोप्ले करें", nav_achievements: "उपलब्धियां", settings_autoplay_note: "यदि ब्राउज़र ब्लॉक करता है तो आपको पृष्ठ पर क्लिक करना पड़ सकता है।", nav_credits: "क्रेडिट",
        settings_replay: "🔁 संगीत फिर से शुरू करें", settings_track: "चल रहा है:"
    },
    ko: {
        nav_home: "홈", nav_demo: "데모 플레이", nav_features: "특징", nav_gallery: "갤러리", nav_skins: "암시장", nav_leaderboard: "리더보드", nav_login: "로그인",
        hero_subtitle: "은하을 지키고, 보스를 파괴하고, 글로벌 리더보드를 정복하세요!", hero_cta: "지금 플레이",
        feat_title: "기대할 것", feat_1_title: "게임 모드", feat_1_desc: "강렬한 싱글 어드벤처 또는 친구와 로컬 협동.",
        feat_2_title: "에픽 보스", feat_2_desc: "화면을 가득 채우는 거대한 함선에 맞서 싸우세요.",
        feat_3_title: "게임패드 지원", feat_3_desc: "원하는 방식으로 플레이하세요. 완전한 플러그 앤 플레이.",
        feat_4_title: "글로벌 리더보드", feat_4_desc: "온라인 점수를 비교하고 최고의 파일럿임을 증명하세요.",
        gal_title: "전투의 단편", gal_img1: "액션 게임플레이", gal_img2: "보스전", gal_img3: "협동 모드",
        skins_title: "암시장 (스킨)", skins_desc: "독점 스킨을 잠금 해제하려면 실제 돈으로 상자를 구매하세요. 보상 단계를 선택하세요!",
        skins_cta: "상점 입장", payment_open: "카드 / PayPal 결제", payment_close: "최소화", payment_close_btn: "닫기", payment_toggle_hint: "(최소화하려면 클릭)",  auth_login_title: "로그인", auth_login_subtitle: "다시 오신 걸 환영합니다, 파일럿!", auth_email: "이메일", auth_password: "비밀번호", auth_password_confirm: "비밀번호 확인", auth_username: "파일럿 이름", auth_username_hint: "문자, 숫자, 밑줄만. 3-20자.", auth_password_hint: "최소 6자.", auth_login_btn: "로그인", auth_register_btn: "계정 만들기", auth_forgot: "비밀번호를 잊으셨나요?", auth_or: "또는", auth_register_link: "새 계정 만들기", auth_login_link: "이미 계정이 있나요? 로그인", auth_demo_hint: "게스트로 플레이할 수도 있습니다:", auth_demo_link: "데모", auth_profile: "내 프로필", auth_my_skins: "내 스킨", auth_my_stats: "내 통계", auth_logout: "로그아웃", credits_title: "제작진", credits_subtitle: "Star Blaster 개발팀", credits_tab_creators: "제작자", credits_tab_testers: "테스터", credits_tab_thanks: "감사의 말", credits_role_main: "리드 프로그래머 & 크리에이티브 디렉터", credits_desc_main: "원래 컨셉, 개발, 디자인 및 그 외 모든 것!", credits_role_producer: "프로듀서",
            credits_role_project_manager: "프로젝트 매니저", credits_desc_producer: "게임 제작자, 스크립터, 그래픽 디자이너. Star Blaster에 생명을 불어넣었습니다.",
            credits_role_scripter: "스크립터",
            credits_desc_scripter: "게임의 공동 제작자, 스크립터, 그래픽 디자이너.",
            credits_role_graphics_designer: "그래픽 디자이너", credits_beta_testers: "베타 테스터", credits_beta_role: "베타 단계 테스터", credits_beta_desc: "베타 단계에서 게임을 테스트하고 귀중한 피드백을 제공한 분들.", credits_bug_hunters: "버그 헌터", credits_bug_role: "버그 헌터", credits_bug_desc: "버그를 신고하고 게임 안정성 개선에 도움을 준 커뮤니티.", credits_translators: "번역가", credits_translators_role: "번역 팀", credits_translators_desc: "게임을 22개 언어로 번역하는 것을 도운 자원봉사자들.", credits_community: "Discord 커뮤니티", credits_community_role: "커뮤니티", credits_community_desc: "처음부터 프로젝트를 지원한 Discord 회원들.", credits_thanks_title: "특별 감사", credits_thanks_music: "🎵 음악", credits_thanks_music_desc: "프로젝트를 위해 제작된 사운드트랙, space-shooter/Soundtracks/ 폴더에서 사용 가능.", credits_thanks_tech: "🛠️ 기술", credits_tech_html: "게임 렌더링 및 효과", credits_tech_css: "애니메이션 및 스타일", credits_tech_js: "로직 및 상호작용", credits_tech_paypal: "결제 시스템", credits_tech_fonts: "Google Fonts", credits_thanks_support: "💜 프로젝트 지원", credits_thanks_support_desc: "Star Blaster를 즐기고 계신다면, 다음 방법으로 개발을 지원해 주세요:", credits_support_twitter: "팔로우", credits_support_youtube: "구독", credits_support_github: "스타", credits_thanks_license: "📜 라이선스", credits_thanks_license_desc: "이 프로젝트는 오픈 소스가 아닙니다. 모든 권리 보유. 작성자의 명시적 허가 없이 코드를 복사, 재배포 또는 수정하는 것은 금지됩니다.", profile_member_since: "가입일", profile_boxes_opened: "열린 상자", profile_total_spent: "총 지출", profile_best_score: "최고 점수", profile_games_played: "플레이한 게임", profile_skins_title: "내 스킨", profile_buy_more: "더 구매", profile_no_skins: "아직 스킨이 없습니다. 첫 상자를 구매하세요!", profile_buy_first: "첫 상자 구매", profile_detailed_stats: "상세 통계", profile_recent_games: "최근 게임", profile_no_games: "아직 플레이하지 않았습니다. 데모를 시도하세요!", profile_play_now: "지금 플레이", stat_total_score: "총 점수", stat_avg_score: "평균 점수", stat_highest_combo: "최대 콤보", stat_enemies_killed: "처치한 적", stat_bosses_defeated: "처치한 보스", stat_playtime: "플레이 시간", stat_favorite_skin: "즐겨찾는 스킨", stat_legendary_skins: "전설 스킨", profile_guest: "게스트", profile_login_prompt: "프로필을 보려면 로그인하세요", auth_err_user_not_found: "사용자를 찾을 수 없습니다.", auth_err_wrong_password: "비밀번호가 잘못되었습니다.", auth_err_email_in_use: "이미 등록된 이메일입니다.", auth_err_username_in_use: "이미 존재하는 파일럿 이름입니다.", auth_err_password_match: "비밀번호가 일치하지 않습니다.", auth_err_generic: "오류가 발생했습니다. 다시 시도하세요.",
        box_standard: "스탠다드 박스", box_epic: "에픽 박스", box_legendary: "레전더리 박스",
        lead_title: "톱 파일럿", lead_rank: "순위", lead_pilot: "파일럿", lead_score: "점수", lead_ship: "함선",
        footer_rights: "© 2026 Star Blaster. 모든 권리 보유.",
        msg_processing: "안전한 결제 처리 중...", msg_approved: "{price} 결제 승인됨! 여는 중...",
        settings_title: "설정", settings_volume: "음악 볼륨", settings_mute: "음악 음소거",
        settings_autoplay: "로드 시 자동 재생", nav_achievements: "업적", settings_autoplay_note: "브라우저가 차단하면 페이지를 클릭해야 할 수 있습니다.", nav_credits: "제작진",
        settings_replay: "🔁 음악 다시 시작", settings_track: "재생 중:"
    },
    vi: {
        nav_home: "Trang chủ", nav_demo: "Chơi Demo", nav_features: "Tính năng", nav_gallery: "Thư viện", nav_skins: "Chợ Đen", nav_leaderboard: "Bảng xếp hạng", nav_login: "Đăng nhập",
        hero_subtitle: "Bảo vệ thiên hà, tiêu diệt boss và thống trị bảng xếp hạng toàn cầu!", hero_cta: "CHƠI NGAY",
        feat_title: "Điều đang chờ", feat_1_title: "Chế độ chơi", feat_1_desc: "Phiêu lưu đơn hoặc chơi co-op tại chỗ với bạn bè.",
        feat_2_title: "Boss hoành tráng", feat_2_desc: "Đối đầu tàu khổng lồ lấp đầy màn hình.",
        feat_3_title: "Hỗ trợ tay cầm", feat_3_desc: "Chơi theo cách bạn muốn. Hỗ trợ plug-and-play đầy đủ.",
        feat_4_title: "Bảng xếp hạng toàn cầu", feat_4_desc: "So sánh điểm trực tuyến và chứng minh bạn là phi công giỏi nhất.",
        gal_title: "Hình ảnh trận đấu", gal_img1: "Gameplay hành động", gal_img2: "Đánh Boss", gal_img3: "Chế độ Co-op",
        skins_title: "Chợ Đen (Skin)", skins_desc: "Mua hộp bằng tiền thật để mở khóa skin độc quyền. Chọn cấp phần thưởng của bạn!",
        skins_cta: "VÀO CỬA HÀNG", payment_open: "Thanh toán bằng Thẻ / PayPal", payment_close: "Thu nhỏ", payment_close_btn: "Đóng", payment_toggle_hint: "(nhấp để thu nhỏ)",  auth_login_title: "Đăng Nhập", auth_login_subtitle: "Chào mừng trở lại, phi công!", auth_email: "Email", auth_password: "Mật khẩu", auth_password_confirm: "Xác nhận Mật khẩu", auth_username: "Tên Phi công", auth_username_hint: "Chỉ chữ cái, số và gạch dưới. 3-20 ký tự.", auth_password_hint: "Tối thiểu 6 ký tự.", auth_login_btn: "ĐĂNG NHẬP", auth_register_btn: "TẠO TÀI KHOẢN", auth_forgot: "Quên mật khẩu?", auth_or: "hoặc", auth_register_link: "Tạo Tài Khoản Mới", auth_login_link: "Đã có tài khoản? Đăng nhập", auth_demo_hint: "Bạn cũng có thể chơi với tư cách khách trong", auth_demo_link: "Demo", auth_profile: "Hồ Sơ Của Tôi", auth_my_skins: "Skin Của Tôi", auth_my_stats: "Thống Kê Của Tôi", auth_logout: "Đăng Xuất", credits_title: "Tín dụng", credits_subtitle: "Đội ngũ đằng sau Star Blaster", credits_tab_creators: "Người tạo", credits_tab_testers: "Người thử nghiệm", credits_tab_thanks: "Cảm ơn", credits_role_main: "Lập trình viên chính & Giám đốc sáng tạo", credits_desc_main: "Ý tưởng gốc, phát triển, thiết kế và mọi thứ khác!", credits_role_producer: "Nhà sản xuất",
            credits_role_project_manager: "Quản lý Dự án", credits_desc_producer: "Người tạo trò chơi, lập trình viên script và nhà thiết kế đồ họa. Đã mang Star Blaster đến với cuộc sống.",
            credits_role_scripter: "Lập trình viên Script",
            credits_desc_scripter: "Đồng sáng tạo trò chơi, lập trình viên script và nhà thiết kế đồ họa.",
            credits_role_graphics_designer: "Nhà thiết kế đồ họa", credits_beta_testers: "Người thử nghiệm Beta", credits_beta_role: "Người thử nghiệm giai đoạn Beta", credits_beta_desc: "Những người đã thử nghiệm trò chơi trong giai đoạn beta và cung cấp phản hồi có giá trị.", credits_bug_hunters: "Thợ săn Bug", credits_bug_role: "Thợ săn Bug", credits_bug_desc: "Cộng đồng đã báo cáo bug và giúp cải thiện độ ổn định của trò chơi.", credits_translators: "Người dịch", credits_translators_role: "Đội dịch thuật", credits_translators_desc: "Tình nguyện viên đã giúp dịch trò chơi sang 22 ngôn ngữ.", credits_community: "Cộng đồng Discord", credits_community_role: "Cộng đồng", credits_community_desc: "Thành viên Discord đã hỗ trợ dự án từ đầu.", credits_thanks_title: "Cảm Ơn Đặc Biệt", credits_thanks_music: "🎵 Âm nhạc", credits_thanks_music_desc: "Nhạc nền được tạo cho dự án, có sẵn trong thư mục space-shooter/Soundtracks/.", credits_thanks_tech: "🛠️ Công nghệ", credits_tech_html: "kết xuất trò chơi và hiệu ứng", credits_tech_css: "hoạt ảnh và kiểu dáng", credits_tech_js: "logic và tương tác", credits_tech_paypal: "hệ thống thanh toán", credits_tech_fonts: "phông chữ Google", credits_thanks_support: "💜 Hỗ trợ dự án", credits_thanks_support_desc: "Nếu bạn thích Star Blaster, hãy cân nhắc hỗ trợ phát triển thông qua:", credits_support_twitter: "Theo dõi trên", credits_support_youtube: "Đăng ký trên", credits_support_github: "Đánh dấu sao trên", credits_thanks_license: "📜 Giấy phép", credits_thanks_license_desc: "Dự án này KHÔNG phải là mã nguồn mở. Bảo lưu mọi quyền. Nghiêm cấm sao chép, phân phối lại hoặc sửa đổi mã mà không có sự cho phép rõ ràng của tác giả.", profile_member_since: "Thành viên từ", profile_boxes_opened: "Hộp Đã Mở", profile_total_spent: "Tổng Đã Chi", profile_best_score: "Điểm Cao Nhất", profile_games_played: "Trận Đã Chơi", profile_skins_title: "Skin Của Tôi", profile_buy_more: "Mua Thêm", profile_no_skins: "Bạn chưa có skin nào. Hãy mua hộp đầu tiên!", profile_buy_first: "Mua Hộp Đầu Tiên", profile_detailed_stats: "Thống Kê Chi Tiết", profile_recent_games: "Trận Gần Đây", profile_no_games: "Bạn chưa chơi. Hãy thử demo!", profile_play_now: "Chơi Ngay", stat_total_score: "Tổng Điểm", stat_avg_score: "Điểm Trung Bình", stat_highest_combo: "Combo Cao Nhất", stat_enemies_killed: "Kẻ Địch Bị Tiêu Diệt", stat_bosses_defeated: "Boss Bị Đánh Bại", stat_playtime: "Thời Gian Chơi", stat_favorite_skin: "Skin Yêu Thích", stat_legendary_skins: "Skin Huyền Thoại", profile_guest: "Khách", profile_login_prompt: "Đăng nhập để xem hồ sơ của bạn", auth_err_user_not_found: "Không tìm thấy người dùng.", auth_err_wrong_password: "Mật khẩu không đúng.", auth_err_email_in_use: "Email này đã được đăng ký.", auth_err_username_in_use: "Tên phi công này đã tồn tại.", auth_err_password_match: "Mật khẩu không khớp.", auth_err_generic: "Đã xảy ra lỗi. Vui lòng thử lại.",
        box_standard: "Hộp Tiêu chuẩn", box_epic: "Hộp Hoành tráng", box_legendary: "Hộp Huyền thoại",
        lead_title: "Phi công hàng đầu", lead_rank: "Hạng", lead_pilot: "Phi công", lead_score: "Điểm", lead_ship: "Tàu",
        footer_rights: "© 2026 Star Blaster. Bảo lưu mọi quyền.",
        msg_processing: "Đang xử lý thanh toán an toàn...", msg_approved: "Thanh toán {price} được chấp thuận! Đang mở...",
        settings_title: "Cài đặt", settings_volume: "Âm lượng nhạc", settings_mute: "Tắt tiếng nhạc",
        settings_autoplay: "Thử tự động phát", nav_achievements: "Thành tích", settings_autoplay_note: "Bạn có thể cần nhấp vào trang nếu trình duyệt chặn.", nav_credits: "Tín dụng",
        settings_replay: "🔁 Khởi động lại nhạc", settings_track: "Đang phát:"
    },
    th: {
        nav_home: "หน้าหลัก", nav_demo: "เล่น Demo", nav_features: "คุณสมบัติ", nav_gallery: "แกลเลอรี", nav_skins: "ตลาดมืด", nav_leaderboard: "อันดับ", nav_login: "เข้าสู่ระบบ",
        hero_subtitle: "ปกป้องกาแล็กซี่ ทำลายบอส และครองอันดับโลก!", hero_cta: "เล่นเดี๋ยวนี้",
        feat_title: "สิ่งที่รอคุณ", feat_1_title: "โหมดเกม", feat_1_desc: "ผจญภัยเดี่ยวเข้มข้นหรือเล่น Co-op กับเพื่อน.",
        feat_2_title: "บอสมหึมา", feat_2_desc: "เผชิญยานยักษ์เต็มจอพร้อมรูปแบบการโจมตีที่ไม่หยุด.",
        feat_3_title: "รองรับเกมแพด", feat_3_desc: "เล่นในแบบที่คุณต้องการ รองรับ plug-and-play เต็มรูปแบบ.",
        feat_4_title: "ลีดเดอร์บอร์ดโลก", feat_4_desc: "เปรียบเทียบคะแนนออนไลน์และพิสูจน์ว่าคุณคือนักบินที่ดีที่สุด.",
        gal_title: "ภาพแห่งการต่อสู้", gal_img1: "เกมเพลย์แอคชั่น", gal_img2: "ต่อสู้บอส", gal_img3: "โหมด Co-op",
        skins_title: "ตลาดมืด (สกิน)", skins_desc: "ซื้อกล่องด้วยเงินจริงเพื่อปลดล็อกสกินพิเศษ เลือกระดับรางวัลของคุณ!",
        skins_cta: "เข้าร้านค้า", payment_open: "ชำระด้วยบัตร / PayPal", payment_close: "ย่อ", payment_close_btn: "ปิด", payment_toggle_hint: "(คลิกเพื่อย่อ)",  auth_login_title: "เข้าสู่ระบบ", auth_login_subtitle: "ยินดีต้อนรับกลับมานักบิน!", auth_email: "อีเมล", auth_password: "รหัสผ่าน", auth_password_confirm: "ยืนยันรหัสผ่าน", auth_username: "ชื่อนักบิน", auth_username_hint: "ตัวอักษร ตัวเลข และขีดล่างเท่านั้น 3-20 ตัวอักษร", auth_password_hint: "ขั้นต่ำ 6 ตัวอักษร", auth_login_btn: "เข้าสู่ระบบ", auth_register_btn: "สร้างบัญชี", auth_forgot: "ลืมรหัสผ่าน?", auth_or: "หรือ", auth_register_link: "สร้างบัญชีใหม่", auth_login_link: "มีบัญชีอยู่แล้ว? เข้าสู่ระบบ", auth_demo_hint: "คุณสามารถเล่นในฐานะแขกใน", auth_demo_link: "เดโม", auth_profile: "โปรไฟล์ของฉัน", auth_my_skins: "สกินของฉัน", auth_my_stats: "สถิติของฉัน", auth_logout: "ออกจากระบบ", credits_title: "เครดิต", credits_subtitle: "ทีมเบื้องหลัง Star Blaster", credits_tab_creators: "ผู้สร้าง", credits_tab_testers: "ผู้ทดสอบ", credits_tab_thanks: "ขอบคุณ", credits_role_main: "โปรแกรมเมอร์หลัก & ผู้อำนวยการสร้างสรรค์", credits_desc_main: "แนวคิดดั้งเดิม การพัฒนา การออกแบบ และอื่นๆ ทั้งหมด!", credits_role_producer: "โปรดิวเซอร์",
            credits_role_project_manager: "ผู้จัดการโครงการ", credits_desc_producer: "ผู้สร้างเกม สคริปเตอร์ และกราฟิกดีไซน์เนอร์ ผู้ทำให้ Star Blaster มีชีวิต",
            credits_role_scripter: "สคริปเตอร์",
            credits_desc_scripter: "ผู้ร่วมสร้างเกม สคริปเตอร์ และกราฟิกดีไซน์เนอร์",
            credits_role_graphics_designer: "กราฟิกดีไซน์เนอร์", credits_beta_testers: "ผู้ทดสอบเบต้า", credits_beta_role: "ผู้ทดสอบช่วงเบต้า", credits_beta_desc: "ผู้ที่ทดสอบเกมในช่วงเบต้าและให้ข้อเสนอแนะที่มีค่า", credits_bug_hunters: "นักล่าบั๊ก", credits_bug_role: "นักล่าบั๊ก", credits_bug_desc: "ชุมชนที่รายงานบั๊กและช่วยปรับปรุงเสถียรภาพของเกม", credits_translators: "นักแปล", credits_translators_role: "ทีมแปลภาษา", credits_translators_desc: "อาสาสมัครที่ช่วยแปลเกมเป็น 22 ภาษา", credits_community: "ชุมชน Discord", credits_community_role: "ชุมชน", credits_community_desc: "สมาชิก Discord ที่สนับสนุนโครงการตั้งแต่ต้น", credits_thanks_title: "ขอบคุณเป็นพิเศษ", credits_thanks_music: "🎵 เพลง", credits_thanks_music_desc: "ซาวด์แทร็กที่สร้างขึ้นสำหรับโครงการ มีให้ในโฟลเดอร์ space-shooter/Soundtracks/", credits_thanks_tech: "🛠️ เทคโนโลยี", credits_tech_html: "การเรนเดอร์เกมและเอฟเฟกต์", credits_tech_css: "ภาพเคลื่อนไหวและสไตล์", credits_tech_js: "ตรรกะและการโต้ตอบ", credits_tech_paypal: "ระบบชำระเงิน", credits_tech_fonts: "ฟอนต์ Google", credits_thanks_support: "💜 สนับสนุนโครงการ", credits_thanks_support_desc: "หากคุณชอบ Star Blaster โปรดพิจารณาสนับสนุนการพัฒนาผ่าน:", credits_support_twitter: "ติดตามบน", credits_support_youtube: "สมัครสมาชิกบน", credits_support_github: "ใส่ดาวบน", credits_thanks_license: "📜 ใบอนุญาต", credits_thanks_license_desc: "โครงการนี้ไม่ใช่โอเพ่นซอร์ส สงวนลิขสิทธิ์ ห้ามคัดลอก จัดจำหน่ายใหม่ หรือแก้ไขโค้ดโดยไม่ได้รับอนุญาตอย่างชัดแจ้งจากผู้เขียน", profile_member_since: "สมาชิกตั้งแต่", profile_boxes_opened: "กล่องที่เปิด", profile_total_spent: "ใช้จ่ายทั้งหมด", profile_best_score: "คะแนนสูงสุด", profile_games_played: "เกมที่เล่น", profile_skins_title: "สกินของฉัน", profile_buy_more: "ซื้อเพิ่ม", profile_no_skins: "คุณยังไม่มีสกิน ซื้อกล่องแรกของคุณ!", profile_buy_first: "ซื้อกล่องแรก", profile_detailed_stats: "สถิติโดยละเอียด", profile_recent_games: "เกมล่าสุด", profile_no_games: "คุณยังไม่ได้เล่น ลองเดโม!", profile_play_now: "เล่นเลย", stat_total_score: "คะแนนรวม", stat_avg_score: "คะแนนเฉลี่ย", stat_highest_combo: "คอมโบสูงสุด", stat_enemies_killed: "ศัตรูที่ฆ่า", stat_bosses_defeated: "บอสที่ฆ่า", stat_playtime: "เวลาเล่น", stat_favorite_skin: "สกินโปรด", stat_legendary_skins: "สกินตำนาน", profile_guest: "แขก", profile_login_prompt: "เข้าสู่ระบบเพื่อดูโปรไฟล์ของคุณ", auth_err_user_not_found: "ไม่พบผู้ใช้", auth_err_wrong_password: "รหัสผ่านไม่ถูกต้อง", auth_err_email_in_use: "อีเมลนี้ถูกลงทะเบียนแล้ว", auth_err_username_in_use: "ชื่อนักบินนี้มีอยู่แล้ว", auth_err_password_match: "รหัสผ่านไม่ตรงกัน", auth_err_generic: "เกิดข้อผิดพลาด กรุณาลองอีกครั้ง",
        box_standard: "กล่องมาตรฐาน", box_epic: "กล่องเอพิค", box_legendary: "กล่องตำนาน",
        lead_title: "นักบินยอดเยี่ยม", lead_rank: "อันดับ", lead_pilot: "นักบิน", lead_score: "คะแนน", lead_ship: "ยาน",
        footer_rights: "© 2026 Star Blaster สงวนลิขสิทธิ์ทั้งหมด.",
        msg_processing: "กำลังประมวลผลการชำระเงิน...", msg_approved: "อนุมัติการชำระเงิน {price} แล้ว! กำลังเปิด...",
        settings_title: "การตั้งค่า", settings_volume: "ระดับเสียงเพลง", settings_mute: "ปิดเสียงเพลง",
        settings_autoplay: "ลองเล่นอัตโนมัติ", nav_achievements: "ความสำเร็จ", settings_autoplay_note: "คุณอาจต้องคลิกที่หน้าเว็บหากเบราว์เซอร์บล็อก.", nav_credits: "เครดิต",
        settings_replay: "🔁 เล่นเพลงใหม่", settings_track: "กำลังเล่น:"
    },
    id: {
        nav_home: "Beranda", nav_demo: "Main Demo", nav_features: "Fitur", nav_gallery: "Galeri", nav_skins: "Pasar Gelap", nav_leaderboard: "Papan Peringkat", nav_login: "Masuk",
        hero_subtitle: "Pertahankan galaksi, hancurkan boss, dan kuasai papan peringkat global!", hero_cta: "MAIN SEKARANG",
        feat_title: "Apa yang Menanti", feat_1_title: "Mode Permainan", feat_1_desc: "Petualangan solo yang intens atau co-op lokal dengan teman.",
        feat_2_title: "Boss Epik", feat_2_desc: "Hadapi kapal kolosal yang memenuhi layar dengan serangan tanpa henti.",
        feat_3_title: "Dukungan Gamepad", feat_3_desc: "Main sesuai keinginan Anda. Dukungan plug-and-play penuh.",
        feat_4_title: "Papan Peringkat Global", feat_4_desc: "Bandingkan skor online Anda dan buktikan Anda pilot terbaik.",
        gal_title: "Sekilas Pertempuran", gal_img1: "Gameplay Aksi", gal_img2: "Pertarungan Boss", gal_img3: "Mode Co-op",
        skins_title: "Pasar Gelap (Skin)", skins_desc: "Beli kotak dengan uang sungguhan untuk membuka skin eksklusif. Pilih tingkat hadiah Anda!",
        skins_cta: "MASUK TOKO", payment_open: "Bayar dengan Kartu / PayPal", payment_close: "Kecilkan", payment_close_btn: "Tutup", payment_toggle_hint: "(klik untuk kecilkan)",  auth_login_title: "Masuk", auth_login_subtitle: "Selamat datang kembali, pilot!", auth_email: "Email", auth_password: "Kata Sandi", auth_password_confirm: "Konfirmasi Kata Sandi", auth_username: "Nama Pilot", auth_username_hint: "Hanya huruf, angka, dan garis bawah. 3-20 karakter.", auth_password_hint: "Minimal 6 karakter.", auth_login_btn: "MASUK", auth_register_btn: "BUAT AKUN", auth_forgot: "Lupa kata sandi?", auth_or: "atau", auth_register_link: "Buat Akun Baru", auth_login_link: "Sudah punya akun? Masuk", auth_demo_hint: "Anda juga bisa bermain sebagai tamu di", auth_demo_link: "Demo", auth_profile: "Profil Saya", auth_my_skins: "Skin Saya", auth_my_stats: "Statistik Saya", auth_logout: "Keluar", credits_title: "Kredit", credits_subtitle: "Tim di balik Star Blaster", credits_tab_creators: "Pembuat", credits_tab_testers: "Penguji", credits_tab_thanks: "Terima Kasih", credits_role_main: "Pemrogram Utama & Direktur Kreatif", credits_desc_main: "Konsep asli, pengembangan, desain, dan segalanya!", credits_role_producer: "Produser",
            credits_role_project_manager: "Manajer Proyek", credits_desc_producer: "Pencipta game, scripter, dan desainer grafis. Menghidupkan Star Blaster.",
            credits_role_scripter: "Scripter",
            credits_desc_scripter: "Pencipta bersama game, scripter, dan desainer grafis.",
            credits_role_graphics_designer: "Desainer Grafis", credits_beta_testers: "Penguji Beta", credits_beta_role: "Penguji Fase Beta", credits_beta_desc: "Orang-orang yang menguji game selama fase beta dan memberikan umpan balik berharga.", credits_bug_hunters: "Pemburu Bug", credits_bug_role: "Pemburu Bug", credits_bug_desc: "Komunitas yang melaporkan bug dan membantu meningkatkan stabilitas game.", credits_translators: "Penerjemah", credits_translators_role: "Tim Penerjemah", credits_translators_desc: "Relawan yang membantu menerjemahkan game ke 22 bahasa.", credits_community: "Komunitas Discord", credits_community_role: "Komunitas", credits_community_desc: "Anggota Discord yang mendukung proyek sejak awal.", credits_thanks_title: "Terima Kasih Khusus", credits_thanks_music: "🎵 Musik", credits_thanks_music_desc: "Soundtrack yang dibuat untuk proyek, tersedia di folder space-shooter/Soundtracks/.", credits_thanks_tech: "🛠️ Teknologi", credits_tech_html: "rendering game dan efek", credits_tech_css: "animasi dan gaya", credits_tech_js: "logika dan interaktivitas", credits_tech_paypal: "sistem pembayaran", credits_tech_fonts: "font Google", credits_thanks_support: "💜 Dukung Proyek", credits_thanks_support_desc: "Jika Anda menikmati Star Blaster, pertimbangkan untuk mendukung pengembangan melalui:", credits_support_twitter: "Ikuti di", credits_support_youtube: "Berlangganan di", credits_support_github: "Beri bintang di", credits_thanks_license: "📜 Lisensi", credits_thanks_license_desc: "Proyek ini BUKAN open source. Semua hak dilindungi undang-undang. Dilarang menyalin, mendistribusikan ulang, atau memodifikasi kode tanpa izin eksplisit dari penulis.", profile_member_since: "Anggota sejak", profile_boxes_opened: "Kotak Dibuka", profile_total_spent: "Total Dibelanjakan", profile_best_score: "Skor Terbaik", profile_games_played: "Permainan", profile_skins_title: "Skin Saya", profile_buy_more: "Beli Lagi", profile_no_skins: "Anda belum punya skin. Beli kotak pertama Anda!", profile_buy_first: "Beli Kotak Pertama", profile_detailed_stats: "Statistik Detail", profile_recent_games: "Permainan Terbaru", profile_no_games: "Anda belum bermain. Coba demo!", profile_play_now: "Main Sekarang", stat_total_score: "Skor Total", stat_avg_score: "Skor Rata-rata", stat_highest_combo: "Kombo Tertinggi", stat_enemies_killed: "Musuh Dikalahkan", stat_bosses_defeated: "Bos Dikalahkan", stat_playtime: "Waktu Bermain", stat_favorite_skin: "Skin Favorit", stat_legendary_skins: "Skin Legendaris", profile_guest: "Tamu", profile_login_prompt: "Masuk untuk melihat profil Anda", auth_err_user_not_found: "Pengguna tidak ditemukan.", auth_err_wrong_password: "Kata sandi salah.", auth_err_email_in_use: "Email ini sudah terdaftar.", auth_err_username_in_use: "Nama pilot ini sudah ada.", auth_err_password_match: "Kata sandi tidak cocok.", auth_err_generic: "Terjadi kesalahan. Silakan coba lagi.",
        box_standard: "Kotak Standar", box_epic: "Kotak Epik", box_legendary: "Kotak Legendaris",
        lead_title: "Pilot Teratas", lead_rank: "Peringkat", lead_pilot: "Pilot", lead_score: "Skor", lead_ship: "Kapal",
        footer_rights: "© 2026 Star Blaster. Hak cipta dilindungi.",
        msg_processing: "Memproses pembayaran aman...", msg_approved: "Pembayaran {price} disetujui! Membuka...",
        settings_title: "Pengaturan", settings_volume: "Volume Musik", settings_mute: "Bisukan Musik",
  settings_autoplay: "Coba autoplay", nav_achievements: "Pencapaian", nav_credits: "Kredit", settings_autoplay_note: "Anda mungkin perlu mengklik halaman jika browser memblokir.",
        settings_replay: "🔁 Mulai Ulang Musik", settings_track: "Sedang diputar:"
    },
    pl: {
        nav_home: "Główna", nav_demo: "Graj Demo", nav_features: "Cechy", nav_gallery: "Galeria", nav_skins: "Czarny Rynek", nav_leaderboard: "Ranking", nav_login: "Entrar", nav_credits: "Créditos", nav_login: "Zaloguj",
        hero_subtitle: "Broń galaktykę, niszcz bossów i dominuj w globalnym rankingu!", hero_cta: "GRAJ TERAZ",
        feat_title: "Co Cię Czeka", feat_1_title: "Tryby Gry", feat_1_desc: "Intensywna przygoda solo albo lokalny co-op z przyjaciółmi.",
        feat_2_title: "Epickie Bossy", feat_2_desc: "Staw czoła kolosalnym statkom wypełniającym ekran.",
        feat_3_title: "Wsparcie Gamepada", feat_3_desc: "Graj jak chcesz. Pełne wsparcie plug-and-play.",
        feat_4_title: "Globalny Ranking", feat_4_desc: "Porównaj wyniki online i udowodnij, że jesteś najlepszym pilotem.",
        gal_title: "Okruchy Walki", gal_img1: "Gameplay Akcja", gal_img2: "Walka z Bossem", gal_img3: "Tryb Co-op",
        skins_title: "Czarny Rynek (Skiny)", skins_desc: "Kupuj skrzynki za prawdziwe pieniądze, aby odblokować ekskluzywne skiny. Wybierz swój poziom nagrody!",
        skins_cta: "WEJDŹ DO SKLEPU", payment_open: "Zapłać Kartą / PayPal", payment_close: "Zminimalizuj", payment_close_btn: "Zamknij", payment_toggle_hint: "(kliknij aby zminimalizować)",  auth_login_title: "Zaloguj Się", auth_login_subtitle: "Witaj ponownie, pilocie!", auth_email: "Email", auth_password: "Hasło", auth_password_confirm: "Potwierdź Hasło", auth_username: "Nazwa Pilota", auth_username_hint: "Tylko litery, cyfry i podkreślenie. 3-20 znaków.", auth_password_hint: "Minimum 6 znaków.", auth_login_btn: "ZALOGUJ SIĘ", auth_register_btn: "UTWÓRZ KONTO", auth_forgot: "Zapomniałeś hasła?", auth_or: "lub", auth_register_link: "Utwórz Nowe Konto", auth_login_link: "Masz już konto? Zaloguj się", auth_demo_hint: "Możesz też grać jako gość w", auth_demo_link: "Demo", auth_profile: "Mój Profil", auth_my_skins: "Moje Skiny", auth_my_stats: "Moje Statystyki", auth_logout: "Wyloguj", credits_title: "Twórcy", credits_subtitle: "Zespół stojący za Star Blaster", credits_tab_creators: "Twórcy", credits_tab_testers: "Testerzy", credits_tab_thanks: "Podziękowania", credits_role_main: "Główny Programista & Dyrektor Kreatywny", credits_desc_main: "Oryginalna koncepcja, rozwój, design i wszystko inne!", credits_role_producer: "Producent",
            credits_role_project_manager: "Kierownik Projektu", credits_desc_producer: "Twórca gry, skrypter i projektant grafiki. Tchnął życie w Star Blaster.",
            credits_role_scripter: "Skrypter",
            credits_desc_scripter: "Współtwórca gry, skrypter i projektant grafiki.",
            credits_role_graphics_designer: "Projektant Grafiki", credits_beta_testers: "Testerzy Beta", credits_beta_role: "Testerzy Fazy Beta", credits_beta_desc: "Osoby, które testowały grę w fazie beta i dostarczyły cennych opinii.", credits_bug_hunters: "Łowcy Bugów", credits_bug_role: "Łowcy Bugów", credits_bug_desc: "Społeczność, która zgłaszała bugi i pomagała poprawić stabilność gry.", credits_translators: "Tłumacze", credits_translators_role: "Zespół Tłumaczy", credits_translators_desc: "Wolontariusze, którzy pomogli przetłumaczyć grę na 22 języki.", credits_community: "Społeczność Discord", credits_community_role: "Społeczność", credits_community_desc: "Członkowie Discorda, którzy wspierali projekt od początku.", credits_thanks_title: "Specjalne Podziękowania", credits_thanks_music: "🎵 Muzyka", credits_thanks_music_desc: "Ścieżki dźwiękowe stworzone do projektu, dostępne w folderze space-shooter/Soundtracks/.", credits_thanks_tech: "🛠️ Technologie", credits_tech_html: "renderowanie gry i efekty", credits_tech_css: "animacje i style", credits_tech_js: "logika i interaktywność", credits_tech_paypal: "system płatności", credits_tech_fonts: "czcionki Google", credits_thanks_support: "💜 Wesprzyj Projekt", credits_thanks_support_desc: "Jeśli podoba Ci się Star Blaster, rozważ wsparcie rozwoju poprzez:", credits_support_twitter: "Śledź na", credits_support_youtube: "Subskrybuj na", credits_support_github: "Daj gwiazdkę na", credits_thanks_license: "📜 Licencja", credits_thanks_license_desc: "Ten projekt NIE jest open source. Wszelkie prawa zastrzeżone. Kopiowanie, redystrybucja lub modyfikacja kodu bez wyraźnej zgody autora jest zabroniona.", profile_member_since: "Członek od", profile_boxes_opened: "Otwarte Pudełka", profile_total_spent: "Łącznie Wydane", profile_best_score: "Najlepszy Wynik", profile_games_played: "Rozegrane Gry", profile_skins_title: "Moje Skiny", profile_buy_more: "Kup Więcej", profile_no_skins: "Nie masz jeszcze skórek. Kup swoje pierwsze pudełko!", profile_buy_first: "Kup Pierwsze Pudełko", profile_detailed_stats: "Szczegółowe Statystyki", profile_recent_games: "Ostatnie Gry", profile_no_games: "Nie grałeś jeszcze. Wypróbuj demo!", profile_play_now: "Graj Teraz", stat_total_score: "Łączny Wynik", stat_avg_score: "Średni Wynik", stat_highest_combo: "Najwyższe Combo", stat_enemies_killed: "Pokonani Wrogowie", stat_bosses_defeated: "Pokonani Bossowie", stat_playtime: "Czas Gry", stat_favorite_skin: "Ulubiona Skórka", stat_legendary_skins: "Legendarné Skórki", profile_guest: "Gość", profile_login_prompt: "Zaloguj się, aby zobaczyć swój profil", auth_err_user_not_found: "Nie znaleziono użytkownika.", auth_err_wrong_password: "Nieprawidłowe hasło.", auth_err_email_in_use: "Ten email jest już zarejestrowany.", auth_err_username_in_use: "Ta nazwa pilota już istnieje.", auth_err_password_match: "Hasła nie pasują.", auth_err_generic: "Wystąpił błąd. Spróbuj ponownie.",
        box_standard: "Standardowa Skrzynka", box_epic: "Epicka Skrzynka", box_legendary: "Legendarna Skrzynka",
        lead_title: "Najlepsi Piloci", lead_rank: "Ranga", lead_pilot: "Pilot", lead_score: "Wynik", lead_ship: "Statek",
        footer_rights: "© 2026 Star Blaster. Wszelkie prawa zastrzeżone.",
        msg_processing: "Przetwarzanie bezpiecznej płatności...", msg_approved: "Płatność {price} zatwierdzona! Otwieranie...",
        settings_title: "Ustawienia", settings_volume: "Głośność Muzyki", nav_achievements: "Osiągnięcia", settings_mute: "Wycisz Muzykę",
        settings_autoplay: "Spróbuj autoodtwarzania", nav_credits: "Twórcy", settings_autoplay_note: "Może być konieczne kliknięcie strony, jeśli przeglądarka blokuje.",
        settings_replay: "🔁 Uruchom Ponownie Muzykę", settings_track: "Teraz gra:"
    },
    nl: {
        nav_home: "Start", nav_demo: "Speel Demo", nav_features: "Kenmerken", nav_gallery: "Galerij", nav_skins: "Zwarte Markt", nav_leaderboard: "Ranglijst", nav_login: "Inloggen",
        hero_subtitle: "Verdedig het sterrenstelsel, vernietig bazen en domineer de wereldranglijst!", hero_cta: "SPEEL NU",
        feat_title: "Wat je Te Wachten Staat", feat_1_title: "Spelmodi", feat_1_desc: "Intens solo-avontuur of lokale co-op met vrienden.",
        feat_2_title: "Epische Bazen", feat_2_desc: "Neem het op tegen kolossale schepen die het scherm vullen.",
        feat_3_title: "Gamepad-ondersteuning", feat_3_desc: "Speel zoals jij wilt. Volledige plug-and-play ondersteuning.",
        feat_4_title: "Wereldwijde Ranglijst", feat_4_desc: "Vergelijk online scores en bewijs dat jij de beste piloot bent.",
        gal_title: "Gevechtsfragment", gal_img1: "Actie Gameplay", gal_img2: "Bossgevecht", gal_img3: "Co-op Modus",
        skins_title: "Zwarte Markt (Skins)", skins_desc: "Koop kisten met echt geld om exclusieve skins vrij te spelen. Kies je beloningsniveau!",
        skins_cta: "NAAR DE WINKEL", payment_open: "Betaal met Kaart / PayPal", payment_close: "Minimaliseren", payment_close_btn: "Sluiten", payment_toggle_hint: "(klik om te minimaliseren)",  auth_login_title: "Inloggen", auth_login_subtitle: "Welkom terug, piloot!", auth_email: "E-mail", auth_password: "Wachtwoord", auth_password_confirm: "Bevestig Wachtwoord", auth_username: "Pilootnaam", auth_username_hint: "Alleen letters, cijfers en underscore. 3-20 tekens.", auth_password_hint: "Minimaal 6 tekens.", auth_login_btn: "INLOGGEN", auth_register_btn: "ACCOUNT AANMAKEN", auth_forgot: "Wachtwoord vergeten?", auth_or: "of", auth_register_link: "Nieuw Account Aanmaken", auth_login_link: "Al een account? Inloggen", auth_demo_hint: "Je kunt ook als gast spelen in de", auth_demo_link: "Demo", auth_profile: "Mijn Profiel", auth_my_skins: "Mijn Skins", auth_my_stats: "Mijn Statistieken", auth_logout: "Uitloggen", credits_title: "Credits", credits_subtitle: "Het team achter Star Blaster", credits_tab_creators: "-makers", credits_tab_testers: "Testers", credits_tab_thanks: "Dank", credits_role_main: "Hoofdprogrammeur & Creatief Directeur", credits_desc_main: "Origineel concept, ontwikkeling, ontwerp en al het andere!", credits_role_producer: "Producent",
            credits_role_project_manager: "Projectmanager", credits_desc_producer: "Spelmaker, scripter en grafisch ontwerper. Bracht Star Blaster tot leven.",
            credits_role_scripter: "Scripter",
            credits_desc_scripter: "Medebedenker van het spel, scripter en grafisch ontwerper.",
            credits_role_graphics_designer: "Grafisch Ontwerper", credits_beta_testers: "Bèta-testers", credits_beta_role: "Bèta-fase testers", credits_beta_desc: "Mensen die het spel tijdens de bèta-fase hebben getest en waardevolle feedback gaven.", credits_bug_hunters: "Bugjagers", credits_bug_role: "Bugjagers", credits_bug_desc: "Community die bugs rapporteerde en hielp de spelstabiliteit te verbeteren.", credits_translators: "Vertalers", credits_translators_role: "Vertaalteam", credits_translators_desc: "Vrijwilligers die hielpen het spel naar 22 talen te vertalen.", credits_community: "Discord-community", credits_community_role: "Community", credits_community_desc: "Discord-leden die het project vanaf het begin steunden.", credits_thanks_title: "Speciale Dank", credits_thanks_music: "🎵 Muziek", credits_thanks_music_desc: "Soundtracks gemaakt voor het project, beschikbaar in de map space-shooter/Soundtracks/.", credits_thanks_tech: "🛠️ Technologieën", credits_tech_html: "spelrendering en effecten", credits_tech_css: "animaties en stijlen", credits_tech_js: "logica en interactiviteit", credits_tech_paypal: "betalingssysteem", credits_tech_fonts: "Google Fonts", credits_thanks_support: "💜 Steun het Project", credits_thanks_support_desc: "Als je geniet van Star Blaster, overweeg dan de ontwikkeling te steunen via:", credits_support_twitter: "Volg op", credits_support_youtube: "Abonneer op", credits_support_github: "Geef een ster op", credits_thanks_license: "📜 Licentie", credits_thanks_license_desc: "Dit project is NIET open source. Alle rechten voorbehouden. Kopiëren, herdistributie of wijziging van de code zonder uitdrukkelijke toestemming van de auteur is verboden.", profile_member_since: "Lid sinds", profile_boxes_opened: "Geopende Dozen", profile_total_spent: "Totaal Uitgegeven", profile_best_score: "Beste Score", profile_games_played: "Gespeelde Games", profile_skins_title: "Mijn Skins", profile_buy_more: "Koop Meer", profile_no_skins: "Je hebt nog geen skins. Koop je eerste doos!", profile_buy_first: "Koop Eerste Doos", profile_detailed_stats: "Gedetailleerde Statistieken", profile_recent_games: "Recente Games", profile_no_games: "Je hebt nog niet gespeeld. Probeer de demo!", profile_play_now: "Speel Nu", stat_total_score: "Totale Score", stat_avg_score: "Gemiddelde Score", stat_highest_combo: "Hoogste Combo", stat_enemies_killed: "Vijanden Verslagen", stat_bosses_defeated: "Bazen Verslagen", stat_playtime: "Speeltijd", stat_favorite_skin: "Favoriete Skin", stat_legendary_skins: "Legendarische Skins", profile_guest: "Gast", profile_login_prompt: "Log in om je profiel te zien", auth_err_user_not_found: "Gebruiker niet gevonden.", auth_err_wrong_password: "Onjuist wachtwoord.", auth_err_email_in_use: "Deze e-mail is al geregistreerd.", auth_err_username_in_use: "Deze pilootnaam bestaat al.", auth_err_password_match: "Wachtwoorden komen niet overeen.", auth_err_generic: "Er is een fout opgetreden. Probeer opnieuw.",
        box_standard: "Standaard Kist", box_epic: "Epische Kist", box_legendary: "Legendarische Kist",
        lead_title: "Top Piloten", lead_rank: "Rang", lead_pilot: "Piloot", lead_score: "Score", lead_ship: "Schip",
        footer_rights: "© 2026 Star Blaster. Alle rechten voorbehouden.",
        msg_processing: "Veilige betaling verwerken...", msg_approved: "Betaling van {price} goedgekeurd! Openen...",
        settings_title: "Instellingen", settings_volume: "Muziekvolume", nav_achievements: "Prestaties", settings_mute: "Muziek Dempen", nav_credits: "Credits",
        settings_autoplay: "Probeer automatisch af te spelen", settings_autoplay_note: "Mogelijk moet je op de pagina klikken als de browser blokkeert.",
        settings_replay: "🔁 Muziek Herstarten", settings_track: "Speelt nu:"
    },
    sv: {
        nav_home: "Hem", nav_demo: "Spela Demo", nav_features: "Funktioner", nav_gallery: "Galleri", nav_skins: "Svart Marknad", nav_leaderboard: "Topplista", nav_login: "Logga in",
        hero_subtitle: "Försvara galaxen, förstör bossar och dominera den globala topplistan!", hero_cta: "SPELA NU",
        feat_title: "Vad Som Vänta", feat_1_title: "Spellägen", feat_1_desc: "Intensivt soloäventyr eller lokal co-op med kompisar.",
        feat_2_title: "Episka Bossar", feat_2_desc: "Möt kolossala skepp som fyller skärmen.",
        feat_3_title: "Gamepad-stöd", feat_3_desc: "Spela som du vill. Fullt plug-and-play stöd.",
        feat_4_title: "Global Topplista", feat_4_desc: "Jämför online-poäng och bevisa att du är bäst.",
        gal_title: "Stridsglimt", gal_img1: "Action Gameplay", gal_img2: "Boss Fight", gal_img3: "Co-op Läge",
        skins_title: "Svart Marknad (Skins)", skins_desc: "Köp lådor med riktiga pengar för att låsa upp exklusiva skins. Välj din belöningsnivå!",
        skins_cta: "GÅ TILL BUTIKEN", payment_open: "Betala med Kort / PayPal", payment_close: "Minimera", payment_close_btn: "Stäng", payment_toggle_hint: "(klicka för att minimera)",  auth_login_title: "Logga In", auth_login_subtitle: "Välkommen tillbaka, pilot!", auth_email: "E-post", auth_password: "Lösenord", auth_password_confirm: "Bekräfta Lösenord", auth_username: "Pilotnamn", auth_username_hint: "Endast bokstäver, siffror och understreck. 3-20 tecken.", auth_password_hint: "Minst 6 tecken.", auth_login_btn: "LOGGA IN", auth_register_btn: "SKAPA KONTO", auth_forgot: "Glömt lösenord?", auth_or: "eller", auth_register_link: "Skapa Nytt Konto", auth_login_link: "Har du redan ett konto? Logga in", auth_demo_hint: "Du kan också spela som gäst i", auth_demo_link: "Demo", auth_profile: "Min Profil", auth_my_skins: "Mina Skins", auth_my_stats: "Min Statistik", auth_logout: "Logga Ut", credits_title: "Credits", credits_subtitle: "Teamet bakom Star Blaster", credits_tab_creators: "Skapare", credits_tab_testers: "Testare", credits_tab_thanks: "Tack", credits_role_main: "Huvudprogrammerare & Kreativ Direktör", credits_desc_main: "Originell koncept, utveckling, design och allt annat!", credits_role_producer: "Producent",
            credits_role_project_manager: "Projektledare", credits_desc_producer: "Skapare av spelet, skriptare och grafisk designer. Gav Star Blaster liv.",
            credits_role_scripter: "Skriptare",
            credits_desc_scripter: "Medskapare av spelet, skriptare och grafisk designer.",
            credits_role_graphics_designer: "Grafisk Designer", credits_beta_testers: "Beta-testare", credits_beta_role: "Beta-fas Testare", credits_beta_desc: "Personer som testade spelet under betafasen och gav värdefull feedback.", credits_bug_hunters: "Bughuntare", credits_bug_role: "Bughuntare", credits_bug_desc: "Community som rapporterade buggar och hjälpte till att förbättra spelstabiliteten.", credits_translators: "Översättare", credits_translators_role: "Översättningsteam", credits_translators_desc: "Volontärer som hjälpte till att översätta spelet till 22 språk.", credits_community: "Discord-community", credits_community_role: "Community", credits_community_desc: "Discord-medlemmar som stödde projektet från början.", credits_thanks_title: "Speciellt Tack", credits_thanks_music: "🎵 Musik", credits_thanks_music_desc: "Soundtracks skapade för projektet, tillgängliga i mappen space-shooter/Soundtracks/.", credits_thanks_tech: "🛠️ Tekniker", credits_tech_html: "spelrendering och effekter", credits_tech_css: "animationer och stilar", credits_tech_js: "logik och interaktivitet", credits_tech_paypal: "betalningssystem", credits_tech_fonts: "Google Fonts", credits_thanks_support: "💜 Stöd Projektet", credits_thanks_support_desc: "Om du gillar Star Blaster, överväg att stödja utvecklingen genom:", credits_support_twitter: "Följ på", credits_support_youtube: "Prenumerera på", credits_support_github: "Stjärnmärk på", credits_thanks_license: "📜 Licens", credits_thanks_license_desc: "Detta projekt är INTE öppen källkod. Alla rättigheter förbehållna. Att kopiera, omdistribuera eller modifiera koden utan uttryckligt tillstånd från författaren är förbjudet.", profile_member_since: "Medlem sedan", profile_boxes_opened: "Öppnade Lådor", profile_total_spent: "Totalt Spenderat", profile_best_score: "Bästa Poäng", profile_games_played: "Spelade Spel", profile_skins_title: "Mina Skins", profile_buy_more: "Köp Mer", profile_no_skins: "Du har inga skins ännu. Köp din första låda!", profile_buy_first: "Köp Första Lådan", profile_detailed_stats: "Detaljerad Statistik", profile_recent_games: "Senaste Spel", profile_no_games: "Du har inte spelat ännu. Prova demon!", profile_play_now: "Spela Nu", stat_total_score: "Total Poäng", stat_avg_score: "Genomsnittlig Poäng", stat_highest_combo: "Högsta Combo", stat_enemies_killed: "Besegrade Fiender", stat_bosses_defeated: "Besegrade Bossar", stat_playtime: "Speltid", stat_favorite_skin: "Favoritskin", stat_legendary_skins: "Legendariska Skins", profile_guest: "Gäst", profile_login_prompt: "Logga in för att se din profil", auth_err_user_not_found: "Användare hittades inte.", auth_err_wrong_password: "Fel lösenord.", auth_err_email_in_use: "Denna e-post är redan registrerad.", auth_err_username_in_use: "Detta pilotnamn finns redan.", auth_err_password_match: "Lösenorden matchar inte.", auth_err_generic: "Ett fel uppstod. Försök igen.",
        box_standard: "Standard Låda", box_epic: "Episk Låda", box_legendary: "Legendarisk Låda",
        lead_title: "Topp Pilotöter", lead_rank: "Rank", lead_pilot: "Pilot", lead_score: "Poäng", lead_ship: "Skepp",
        footer_rights: "© 2026 Star Blaster. Alla rättigheter förbehållna.",
        msg_processing: "Bearbetar säker betalning...", msg_approved: "Betalning av {price} godkänd! Öppnar...",
        settings_title: "Inställningar", nav_achievements: "Prestationer", settings_volume: "Musikvolym", nav_credits: "Credits", settings_mute: "Stäng av Musik",
        settings_autoplay: "Försök spela automatiskt", settings_autoplay_note: "Du kan behöva klicka på sidan om webbläsaren blockerar.",
        settings_replay: "🔁 Starta om Musiken", settings_track: "Spelar nu:"
    },
    tr: {
        nav_home: "Ana Sayfa", nav_demo: "Demo Oyna", nav_features: "Özellikler", nav_gallery: "Galeri", nav_skins: "Kara Pazar", nav_leaderboard: "Skor Tablosu", nav_login: "Giriş",
        hero_subtitle: "Galaksiyi koru, patronları yok et ve küresel skor tablosuna hükmet!", hero_cta: "ŞİMDİ OYNA",
        feat_title: "Sizi Ne Bekliyor", feat_1_title: "Oyun Modları", feat_1_desc: "Yoğun solo macera veya arkadaşlarla yerel co-op.",
        feat_2_title: "Destansı Boss'lar", feat_2_desc: "Ekranı dolduran devasa gemilerle yüzleş.",
        feat_3_title: "Gamepad Desteği", feat_3_desc: "İstediğin gibi oyna. Tam plug-and-play desteği.",
        feat_4_title: "Küresel Skor Tablosu", feat_4_desc: "Çevrimiçi skorlarını karşılaştır ve en iyi pilot olduğunu kanıtla.",
        gal_title: "Savaştan Bir Görünüm", gal_img1: "Aksiyon Oynanışı", gal_img2: "Boss Savaşı", gal_img3: "Co-op Modu",
        skins_title: "Kara Pazar (Skinler)", skins_desc: "Özel skinleri açmak için gerçek parayla kutu satın al. Ödül seviyeni seç!",
        skins_cta: "MAĞAZAYA GİT", payment_open: "Kart / PayPal ile Öde", payment_close: "Küçült", payment_close_btn: "Kapat", payment_toggle_hint: "(küçültmek için tıkla)",  auth_login_title: "Giriş Yap", auth_login_subtitle: "Tekrar hoş geldin, pilot!", auth_email: "E-posta", auth_password: "Şifre", auth_password_confirm: "Şifreyi Onayla", auth_username: "Pilot Adı", auth_username_hint: "Sadece harf, rakam ve alt çizgi. 3-20 karakter.", auth_password_hint: "En az 6 karakter.", auth_login_btn: "GİRİŞ YAP", auth_register_btn: "HESAP OLUŞTUR", auth_forgot: "Şifreni mi unuttun?", auth_or: "veya", auth_register_link: "Yeni Hesap Oluştur", auth_login_link: "Zaten hesabın var mı? Giriş yap", auth_demo_hint: "Ayrıca misafir olarak da oynayabilirsin:", auth_demo_link: "Demo", auth_profile: "Profilim", auth_my_skins: "Skinlerim", auth_my_stats: "İstatistiklerim", auth_logout: "Çıkış Yap", credits_title: "Krediler", credits_subtitle: "Star Blaster'ın arkasındaki ekip", credits_tab_creators: "Yaratıcılar", credits_tab_testers: "Testçiler", credits_tab_thanks: "Teşekkürler", credits_role_main: "Baş Programcı & Yaratıcı Yönetmen", credits_desc_main: "Orijinal konsept, geliştirme, tasarım ve diğer her şey!", credits_role_producer: "Yapımcı",
            credits_role_project_manager: "Proje Yöneticisi", credits_desc_producer: "Oyun yaratıcısı, scriptçi ve grafik tasarımcı. Star Blaster'a hayat verdi.",
            credits_role_scripter: "Scriptçi",
            credits_desc_scripter: "Oyunun ortak yaratıcısı, scriptçi ve grafik tasarımcı.",
            credits_role_graphics_designer: "Grafik Tasarımcı", credits_beta_testers: "Beta Testçileri", credits_beta_role: "Beta Aşaması Testçileri", credits_beta_desc: "Beta aşamasında oyunu test eden ve değerli geri bildirim sağlayan kişiler.", credits_bug_hunters: "Hata Avcıları", credits_bug_role: "Hata Avcıları", credits_bug_desc: "Hataları bildiren ve oyun kararlılığını iyileştirmeye yardımcı olan topluluk.", credits_translators: "Çevirmenler", credits_translators_role: "Çeviri Ekibi", credits_translators_desc: "Oyunu 22 dile çevirmeye yardım eden gönüllüler.", credits_community: "Discord Topluluğu", credits_community_role: "Topluluk", credits_community_desc: "Projeyi başından beri destekleyen Discord üyeleri.", credits_thanks_title: "Özel Teşekkürler", credits_thanks_music: "🎵 Müzik", credits_thanks_music_desc: "Proje için oluşturulan müzikler, space-shooter/Soundtracks/ klasöründe mevcut.", credits_thanks_tech: "🛠️ Teknolojiler", credits_tech_html: "oyun render ve efektleri", credits_tech_css: "animasyonlar ve stiller", credits_tech_js: "mantık ve etkileşim", credits_tech_paypal: "ödeme sistemi", credits_tech_fonts: "Google Fonts", credits_thanks_support: "💜 Projeyi Destekle", credits_thanks_support_desc: "Star Blaster'dan keyif alıyorsanız, geliştirmeyi desteklemeyi düşünün:", credits_support_twitter: "Takip et", credits_support_youtube: "Abone ol", credits_support_github: "Yıldız ver", credits_thanks_license: "📜 Lisans", credits_thanks_license_desc: "Bu proje açık kaynak DEĞİLDİR. Tüm hakları saklıdır. Yazarın açık izni olmadan kodu kopyalamak, yeniden dağıtmak veya değiştirmek yasaktır.", profile_member_since: "Üyelik tarihi", profile_boxes_opened: "Açılan Kutular", profile_total_spent: "Toplam Harcama", profile_best_score: "En İyi Skor", profile_games_played: "Oynanan Oyunlar", profile_skins_title: "Skinlerim", profile_buy_more: "Daha Fazla Al", profile_no_skins: "Henüz skin yok. İlk kutunu satın al!", profile_buy_first: "İlk Kutuyu Al", profile_detailed_stats: "Detaylı İstatistikler", profile_recent_games: "Son Oyunlar", profile_no_games: "Henüz oynamadın. Demoyu dene!", profile_play_now: "Şimdi Oyna", stat_total_score: "Toplam Skor", stat_avg_score: "Ortalama Skor", stat_highest_combo: "En Yüksek Kombo", stat_enemies_killed: "Yenilen Düşmanlar", stat_bosses_defeated: "Yenilen Patronlar", stat_playtime: "Oyun Süresi", stat_favorite_skin: "Favori Skin", stat_legendary_skins: "Efsanevi Skinler", profile_guest: "Misafir", profile_login_prompt: "Profilini görmek için giriş yap", auth_err_user_not_found: "Kullanıcı bulunamadı.", auth_err_wrong_password: "Yanlış şifre.", auth_err_email_in_use: "Bu e-posta zaten kayıtlı.", auth_err_username_in_use: "Bu pilot adı zaten var.", auth_err_password_match: "Şifreler eşleşmiyor.", auth_err_generic: "Bir hata oluştu. Tekrar deneyin.",
        box_standard: "Standart Kutu", box_epic: "Destansı Kutu", box_legendary: "Efsanevi Kutu",
        lead_title: "En İyi Pilotlar", lead_rank: "Sıra", lead_pilot: "Pilot", lead_score: "Skor", lead_ship: "Gemi",
        footer_rights: "© 2026 Star Blaster. Tüm hakları saklıdır.",
        msg_processing: "Güvenli ödeme işleniyor...", nav_achievements: "Başarılar", msg_approved: "{price} ödeme onaylandı! Açılıyor...",
        settings_title: "Ayarlar", nav_credits: "Krediler", settings_volume: "Müzik Sesi", settings_mute: "Müziği Sustur",
        settings_autoplay: "Otomatik oynatmayı dene", settings_autoplay_note: "Tarayıcı engellerse sayfaya tıklamanız gerekebilir.",
        settings_replay: "🔁 Müziği Yeniden Başlat", settings_track: "Şu an çalıyor:"
    },
    he: {
        nav_home: "בית", nav_demo: "שחק דמו", nav_features: "תכונות", nav_gallery: "גלריה", nav_skins: "שוק שחור", nav_leaderboard: "טבלת מובילים", nav_login: "התחבר",
        hero_subtitle: "הגן על הגלקסיה, השמד בוסים ושלוט בטבלת המובילים העולמית!", hero_cta: "שחק עכשיו",
        feat_title: "מה מחכה לך", feat_1_title: "מצבי משחק", feat_1_desc: "הרפתקה יחידנית אינטנסיבית או Co-op מקומי עם חברים.",
        feat_2_title: "בוסים אפיים", feat_2_desc: "התמודד עם ספינות ענק שממלאות את המסך.",
        feat_3_title: "תמיכה בגיים פד", feat_3_desc: "שחק כרצונך. תמיכה מלאה ב-plug-and-play.",
        feat_4_title: "טבלת מובילים גלובלית", feat_4_desc: "השווה ניקוד מקוון והוכח שאתה הטייס הטוב ביותר.",
        gal_title: "הצצה מהקרב", gal_img1: "משחקיות פעולה", gal_img2: "קרב בוס", gal_img3: "מצב Co-op",
        skins_title: "שוק שחור (סקינים)", skins_desc: "קנה קופסאות בכסף אמיתי כדי לפתוח סקינים בלעדיים. בחר את רמת הפרס שלך!",
        skins_cta: "כנס לחנות", payment_open: "תשלום בכרטיס / PayPal", payment_close: "מזער", payment_close_btn: "סגור", payment_toggle_hint: "(לחץ למזעור)",  auth_login_title: "התחברות", auth_login_subtitle: "ברוך שובך, טייס!", auth_email: "אימייל", auth_password: "סיסמה", auth_password_confirm: "אשר סיסמה", auth_username: "שם טייס", auth_username_hint: "אותיות, מספרים וקו תחתון בלבד. 3-20 תווים.", auth_password_hint: "מינימום 6 תווים.", auth_login_btn: "התחבר", auth_register_btn: "צור חשבון", auth_forgot: "שכחת סיסמה?", auth_or: "או", auth_register_link: "צור חשבון חדש", auth_login_link: "כבר יש לך חשבון? להתחבר", auth_demo_hint: "אפשר גם לשחק כאורח ב", auth_demo_link: "דמו", auth_profile: "הפרופיל שלי", auth_my_skins: "הסקינים שלי", auth_my_stats: "הסטטיסטיקות שלי", auth_logout: "התנתק", credits_title: "קרדיטים", credits_subtitle: "הצוות מאחורי Star Blaster", credits_tab_creators: "יוצרים", credits_tab_testers: "בודקים", credits_tab_thanks: "תודות", credits_role_main: "מתכנת ראשי & מנהל קריאייטיב", credits_desc_main: "הרעיון המקורי, פיתוח, עיצוב וכל השאר!", credits_role_producer: "מפיק",
            credits_role_project_manager: "מנהל פרויקט", credits_desc_producer: "יוצר המשחק, תסריטאי ומעצב גרפי. החייה את Star Blaster.",
            credits_role_scripter: "תסריטאי",
            credits_desc_scripter: "שותף ליצירת המשחק, תסריטאי ומעצב גרפי.",
            credits_role_graphics_designer: "מעצב גרפי", credits_beta_testers: "בודקי בטא", credits_beta_role: "בודקי שלב בטא", credits_beta_desc: "אנשים שבדקו את המשחק בשלב הבטא וסיפקו משוב בעל ערך.", credits_bug_hunters: "ציידי באגים", credits_bug_role: "ציידי באגים", credits_bug_desc: "קהילה שדיווחה על באגים ועזרה לשפר את יציבות המשחק.", credits_translators: "מתרגמים", credits_translators_role: "צוות תרגום", credits_translators_desc: "מתנדבים שעזרו לתרגם את המשחק ל-22 שפות.", credits_community: "קהילת Discord", credits_community_role: "קהילה", credits_community_desc: "חברי Discord שתמכו בפרויקט מההתחלה.", credits_thanks_title: "תודות מיוחדות", credits_thanks_music: "🎵 מוזיקה", credits_thanks_music_desc: "פסקולים שנוצרו לפרויקט, זמינים בתיקיית space-shooter/Soundtracks/.", credits_thanks_tech: "🛠️ טכנולוגיות", credits_tech_html: "עיבוד משחק ואפקטים", credits_tech_css: "אנימציות וסגנונות", credits_tech_js: "לוגיקה ואינטראקטיביות", credits_tech_paypal: "מערכת תשלומים", credits_tech_fonts: "גופני Google", credits_thanks_support: "💜 תמכו בפרויקט", credits_thanks_support_desc: "אם אתה נהנה מ-Star Blaster, שקול לתמוך בפיתוח דרך:", credits_support_twitter: "עקוב ב", credits_support_youtube: "הירשם ל", credits_support_github: "תן כוכב ב", credits_thanks_license: "📜 רישיון", credits_thanks_license_desc: "הפרויקט הזה אינו קוד פתוח. כל הזכויות שמורות. אסור להעתיק, להפיץ מחדש או לשנות את הקוד ללא אישור מפורש מהמחבר.", profile_member_since: "חבר מאז", profile_boxes_opened: "תיבות שנפתחו", profile_total_spent: "סך הוצר", profile_best_score: "ניקוד הטוב ביותר", profile_games_played: "משחקים ששוחקו", profile_skins_title: "הסקינים שלי", profile_buy_more: "קנה עוד", profile_no_skins: "עדיין אין לך סקינים. קנה את התיבה הראשונה שלך!", profile_buy_first: "קנה תיבה ראשונה", profile_detailed_stats: "סטטיסטיקות מפורטות", profile_recent_games: "משחקים אחרונים", profile_no_games: "עדיין לא שיחקת. נסה את הדמו!", profile_play_now: "שחק עכשיו", stat_total_score: "ניקוד כולל", stat_avg_score: "ניקוד ממוצע", stat_highest_combo: "קומבו הגבוה ביותר", stat_enemies_killed: "אויבים שהובסו", stat_bosses_defeated: "בוסים שהובסו", stat_playtime: "זמן משחק", stat_favorite_skin: "סקין מועדף", stat_legendary_skins: "סקינים אגדיים", profile_guest: "אורח", profile_login_prompt: "התחבר כדי לראות את הפרופיל שלך", auth_err_user_not_found: "משתמש לא נמצא.", auth_err_wrong_password: "סיסמה שגויה.", auth_err_email_in_use: "האימייל הזה כבר רשום.", auth_err_username_in_use: "שם הטייס הזה כבר קיים.", auth_err_password_match: "הסיסמאות אינן תואמות.", auth_err_generic: "אירעה שגיאה. נסה שוב.",
        box_standard: "קופסה סטנדרטית", box_epic: "קופסה אפית", box_legendary: "קופסה אגדית",
        lead_title: "טייסים מובילים", lead_rank: "דירוג", lead_pilot: "טייס", lead_score: "ניקוד", lead_ship: "ספינה",
        footer_rights: "© 2026 Star Blaster. כל הזכויות שמורות.",
        msg_processing: "מעבד תשלום מאובטח...", nav_achievements: "הישגים", msg_approved: "תשלום של {price} אושר! פותח...", nav_credits: "קרדיטים",
        settings_title: "הגדרות", settings_volume: "עוצמת מוזיקה", settings_mute: "השתק מוזיקה",
        settings_autoplay: "נסה להפעיל אוטומטית", settings_autoplay_note: "ייתכן שתצטרך ללחוץ על הדף אם הדפדפן חוסם.",
        settings_replay: "🔁 הפעל מחדש מוזיקה", settings_track: "מושמע כעת:"
    },
    el: {
        nav_home: "Αρχική", nav_demo: "Παίξε Demo", nav_features: "Χαρακτηριστικά", nav_gallery: "Γκαλερί", nav_skins: "Μαύρη Αγορά", nav_leaderboard: "Κατάταξη", nav_login: "Σύνδεση",
        hero_subtitle: "Υπεράσπισε τον γαλαξία, κατέστρεψε τα αφεντικά και κυριάρχησε στην παγκόσμια κατάταξη!", hero_cta: "ΠΑΙΞΕ ΤΩΡΑ",
        feat_title: "Τι Σε Περιμένει", feat_1_title: "Λειτουργίες Παιχνιδιού", feat_1_desc: "Έντονη solo περιπέτεια ή τοπικό co-op με φίλους.",
        feat_2_title: "Επικά Boss", feat_2_desc: "Αντιμετώπισε κολοσσιαία σκάφη που γεμίζουν την οθόνη.",
        feat_3_title: "Υποστήριξη Gamepad", feat_3_desc: "Παίξε όπως θέλεις. Πλήρης plug-and-play υποστήριξη.",
        feat_4_title: "Παγκόσμια Κατάταξη", feat_4_desc: "Σύγκρινε online σκορ και απόδειξε ότι είσαι ο καλύτερος πιλότος.",
        gal_title: "Στιγμή Μάχης", gal_img1: "Gameplay Δράσης", gal_img2: "Μάχη Boss", gal_img3: "Λειτουργία Co-op",
        skins_title: "Μαύρη Αγορά (Skins)", skins_desc: "Αγόρασε κουτιά με αληθινά χρήματα για να ξεκλειδώσεις αποκλειστικά skins. Διάλεξε το επίπεδο ανταμοιβής!",
        skins_cta: "ΜΠΕΣ ΣΤΟ ΚΑΤΑΣΤΗΜΑ", payment_open: "Πλήρωση με Κάρτα / PayPal", payment_close: "Ελαχιστοποίηση", payment_close_btn: "Κλείσιμο", payment_toggle_hint: "(κλικ για ελαχιστοποίηση)",  auth_login_title: "Σύνδεση", auth_login_subtitle: "Καλώς ήρθες πίσω, πιλότε!", auth_email: "Email", auth_password: "Κωδικός", auth_password_confirm: "Επιβεβαίωση Κωδικού", auth_username: "Όνομα Πιλότου", auth_username_hint: "Μόνο γράμματα, αριθμοί και κάτω παύλα. 3-20 χαρακτήρες.", auth_password_hint: "Τουλάχιστον 6 χαρακτήρες.", auth_login_btn: "ΣΥΝΔΕΣΗ", auth_register_btn: "ΔΗΜΙΟΥΡΓΙΑ ΛΟΓΑΡΙΑΣΜΟΥ", auth_forgot: "Ξέχασες τον κωδικό;", auth_or: "ή", auth_register_link: "Δημιουργία Νέου Λογαριασμού", auth_login_link: "Έχεις ήδη λογαριασμό; Σύνδεση", auth_demo_hint: "Μπορείς επίσης να παίξεις ως επισκέπτης στο", auth_demo_link: "Demo", auth_profile: "Το Προφίλ μου", auth_my_skins: "Τα Skin μου", auth_my_stats: "Τα Στατιστικά μου", auth_logout: "Αποσύνδεση", credits_title: "Συντελεστές", credits_subtitle: "Η ομάδα πίσω από το Star Blaster", credits_tab_creators: "Δημιουργοί", credits_tab_testers: "Δοκιμαστές", credits_tab_thanks: "Ευχαριστίες", credits_role_main: "Κύριος Προγραμματιστής & Δημιουργικός Διευθυντής", credits_desc_main: "Αρχική ιδέα, ανάπτυξη, σχεδιασμός και όλα τα υπόλοιπα!", credits_role_producer: "Παραγωγός",
            credits_role_project_manager: "Διαχειριστής Έργου", credits_desc_producer: "Δημιουργός του παιχνιδιού, scripter και γραφίστας. Ζωντάνεψε το Star Blaster.",
            credits_role_scripter: "Scripter",
            credits_desc_scripter: "Συν-δημιουργός του παιχνιδιού, scripter και γραφίστας.",
            credits_role_graphics_designer: "Γραφίστας", credits_beta_testers: "Δοκιμαστές Beta", credits_beta_role: "Δοκιμαστές Φάσης Beta", credits_beta_desc: "Άτομα που δοκίμασαν το παιχνίδι κατά τη φάση beta και παρείχαν πολύτιμα σχόλια.", credits_bug_hunters: "Κυνηγοί Bugs", credits_bug_role: "Κυνηγοί Bugs", credits_bug_desc: "Κοινότητα που ανέφερε bugs και βοήθησε στη βελτίωση της σταθερότητας του παιχνιδιού.", credits_translators: "Μεταφραστές", credits_translators_role: "Ομάδα Μετάφρασης", credits_translators_desc: "Εθελοντές που βοήθησαν στη μετάφραση του παιχνιδιού σε 22 γλώσσες.", credits_community: "Κοινότητα Discord", credits_community_role: "Κοινότητα", credits_community_desc: "Μέλη του Discord που υποστήριξαν το έργο από την αρχή.", credits_thanks_title: "Ειδικές Ευχαριστίες", credits_thanks_music: "🎵 Μουσική", credits_thanks_music_desc: "Soundtracks που δημιουργήθηκαν για το έργο, διαθέσιμα στον φάκελο space-shooter/Soundtracks/.", credits_thanks_tech: "🛠️ Τεχνολογίες", credits_tech_html: "απόδοση παιχνιδιού και εφέ", credits_tech_css: "animations και στυλ", credits_tech_js: "λογική και διαδραστικότητα", credits_tech_paypal: "σύστημα πληρωμών", credits_tech_fonts: "γραμματοσειρές Google", credits_thanks_support: "💜 Υποστηρίξτε το Έργο", credits_thanks_support_desc: "Αν απολαμβάνετε το Star Blaster, σκεφτείτε να υποστηρίξετε την ανάπτυξη μέσω:", credits_support_twitter: "Ακολουθήστε στο", credits_support_youtube: "Εγγραφείτε στο", credits_support_github: "Βάλτε αστέρι στο", credits_thanks_license: "📜 Άδεια", credits_thanks_license_desc: "Αυτό το έργο ΔΕΝ είναι ανοιχτού κώδικα. Όλα τα δικαιώματα διατηρούνται. Απαγορεύεται η αντιγραφή, η αναδιανομή ή η τροποποίηση του κώδικα χωρίς ρητή άδεια του δημιουργού.", profile_member_since: "Μέλος από", profile_boxes_opened: "Κουτιά που Ανοίχτηκαν", profile_total_spent: "Συνολική Δαπάνη", profile_best_score: "Καλύτερο Σκορ", profile_games_played: "Παιχνίδια", profile_skins_title: "Τα Skins Μου", profile_buy_more: "Αγόρα Περισσότερα", profile_no_skins: "Δεν έχεις ακόμα skins. Αγόρασε το πρώτο σου κουτί!", profile_buy_first: "Αγόρα Πρώτο Κουτί", profile_detailed_stats: "Λεπτομερή Στατιστικά", profile_recent_games: "Πρόσφατα Παιχνίδια", profile_no_games: "Δεν έχεις παίξει ακόμα. Δοκίμασε το demo!", profile_play_now: "Παίξε Τώρα", stat_total_score: "Συνολικό Σκορ", stat_avg_score: "Μέσο Σκορ", stat_highest_combo: "Υψηλότερο Combo", stat_enemies_killed: "Νικημένοι Εχθροί", stat_bosses_defeated: "Νικημένα Boss", stat_playtime: "Χρόνος Παιχνιδιού", stat_favorite_skin: "Αγαπημένο Skin", stat_legendary_skins: "Θρυλικά Skins", profile_guest: "Επισκέπτης", profile_login_prompt: "Συνδέσου για να δεις το προφίλ σου", auth_err_user_not_found: "Ο χρήστης δεν βρέθηκε.", auth_err_wrong_password: "Λάθος κωδικός.", auth_err_email_in_use: "Αυτό το email είναι ήδη εγγεγραμμένο.", auth_err_username_in_use: "Αυτό το όνομα πιλότου υπάρχει ήδη.", auth_err_password_match: "Οι κωδικοί δεν ταιριάζουν.", auth_err_generic: "Παρουσιάστηκε σφάλμα. Δοκίμασε ξανά.",
        box_standard: "Κανονικό Κουτί", box_epic: "Επικό Κουτί", box_legendary: "Θρυλικό Κουτί",
        lead_title: "Κορυφαίοι Πιλότοι", lead_rank: "Κατάταξη", lead_pilot: "Πιλότος", lead_score: "Σκορ", lead_ship: "Σκάφος",
        footer_rights: "© 2026 Star Blaster. Όλα τα δικαιώματα διατηρούνται.",
        msg_processing: "Επεξεργασία ασφαλούς πληρωμής...", nav_achievements: "Επιτεύγματα", msg_approved: "Πληρωμή {price} εγκρίθηκε! Άνοιγμα...",
        settings_title: "Ρυθμίσεις", settings_volume: "Ένταση Μουσικής", settings_mute: "Σίγαση Μουσικής",
        settings_autoplay: "Δοκίμασε αυτόματη αναπαραγωγή", settings_autoplay_note: "Μπορεί να χρειαστεί να κάνεις κλικ στη σελίδα αν ο browser μπλοκάρει.",
        settings_replay: "🔁 Επανεκκίνηση Μουσικής", settings_track: "Παίζει τώρα:"
    },
    "pt-BR": {
        nav_home: "Início", nav_demo: "Jogar Demo", nav_features: "Características", nav_gallery: "Galeria", nav_skins: "Mercado Negro", nav_leaderboard: "Ranking", nav_achievements: "Conquistas",
        hero_subtitle: "Defenda a galáxia, destrua os chefes e domine o Ranking!", hero_cta: "JOGAR AGORA",
        feat_title: "O Que Te Espera", feat_1_title: "Modos de Jogo", feat_1_desc: "Aventura solo intensa ou cooperativo local com os amigos.",
        feat_2_title: "Chefes Épicos", feat_2_desc: "Enfrente naves colossais que preenchem a tela com ataques implacáveis.",
        feat_3_title: "Suporte a Controles", feat_3_desc: "Jogue do seu jeito. Suporte total plug-and-play.",
        feat_4_title: "Ranking Global", feat_4_desc: "Compare suas pontuações online e prove que é o melhor piloto.",
        gal_title: "Visão da Batalha", gal_img1: "Gameplay de Ação", gal_img2: "Batalha contra Chefe", gal_img3: "Modo Co-op",
        skins_title: "Mercado Negro (Skins)", skins_desc: "Compre caixas com dinheiro real para desbloquear skins exclusivas. Escolha seu nível de recompensa!",
        skins_cta: "ENTRAR NA LOJA", payment_open: "Pagar com Cartão / PayPal", payment_close: "Minimizar", payment_close_btn: "Fechar", payment_toggle_hint: "(clique para minimizar)",  auth_login_title: "Entrar", auth_login_subtitle: "Bem-vindo de volta, piloto!", auth_email: "E-mail", auth_password: "Senha", auth_password_confirm: "Confirmar Senha", auth_username: "Nome de Piloto", auth_username_hint: "Apenas letras, números e underline. 3-20 caracteres.", auth_password_hint: "Mínimo 6 caracteres.", auth_login_btn: "ENTRAR", auth_register_btn: "CRIAR CONTA", auth_forgot: "Esqueceu a senha?", auth_or: "ou", auth_register_link: "Criar Nova Conta", auth_login_link: "Já tem conta? Entrar", auth_demo_hint: "Também pode jogar como convidado no", auth_demo_link: "Demo", auth_profile: "Meu Perfil", auth_my_skins: "Minhas Skins", auth_my_stats: "Minhas Estatísticas", auth_logout: "Sair", credits_title: "Créditos", credits_subtitle: "A equipe por trás de Star Blaster", credits_tab_creators: "Criadores", credits_tab_testers: "Testadores", credits_tab_thanks: "Agradecimentos", credits_role_main: "Programador Principal & Diretor Criativo", credits_desc_main: "Conceito original, desenvolvimento, design e todo o resto!", credits_role_producer: "Produtor",
            credits_role_project_manager: "Gestor de Projeto", credits_desc_producer: "Criador do jogo, scripter e designer gráfico. Trouxe o Star Blaster à vida.",
            credits_role_scripter: "Scripter",
            credits_desc_scripter: "Co-criador do jogo, scripter e designer gráfico.",
            credits_role_graphics_designer: "Designer Gráfico", credits_beta_testers: "Beta Testers", credits_beta_role: "Testadores da Fase Beta", credits_beta_desc: "Pessoas que testaram o jogo durante a fase beta e forneceram feedback valioso.", credits_bug_hunters: "Caçadores de Bugs", credits_bug_role: "Caçadores de Bugs", credits_bug_desc: "Comunidade que reportou bugs e ajudou a melhorar a estabilidade do jogo.", credits_translators: "Tradutores", credits_translators_role: "Equipe de Tradução", credits_translators_desc: "Voluntários que ajudaram a traduzir o jogo para 22 idiomas.", credits_community: "Comunidade Discord", credits_community_role: "Comunidade", credits_community_desc: "Membros do Discord que apoiaram o projeto desde o início.", credits_thanks_title: "Agradecimentos Especiais", credits_thanks_music: "🎵 Música", credits_thanks_music_desc: "Soundtracks criadas para o projeto, disponíveis na pasta space-shooter/Soundtracks/.", credits_thanks_tech: "🛠️ Tecnologias", credits_tech_html: "renderização do jogo e efeitos", credits_tech_css: "animações e estilos", credits_tech_js: "lógica e interatividade", credits_tech_paypal: "sistema de pagamentos", credits_tech_fonts: "fontes do Google Fonts", credits_thanks_support: "💜 Apoie o Projeto", credits_thanks_support_desc: "Se você gosta do Star Blaster, considere apoiar o desenvolvimento através de:", credits_support_twitter: "Seguir no", credits_support_youtube: "Inscrever-se no", credits_support_github: "Dar uma estrela no", credits_thanks_license: "📜 Licença", credits_thanks_license_desc: "Este projeto NÃO é código aberto. Todos os direitos reservados. É proibido copiar, redistribuir ou modificar o código sem autorização explícita do autor.", profile_member_since: "Membro desde", profile_boxes_opened: "Caixas Abertas", profile_total_spent: "Total Gasto", profile_best_score: "Melhor Pontuação", profile_games_played: "Partidas", profile_skins_title: "Minhas Skins", profile_buy_more: "Comprar Mais", profile_no_skins: "Você ainda não tem skins. Compre sua primeira caixa!", profile_buy_first: "Comprar Primeira Caixa", profile_detailed_stats: "Estatísticas Detalhadas", profile_recent_games: "Partidas Recentes", profile_no_games: "Você ainda não jogou. Experimente a demo!", profile_play_now: "Jogar Agora", stat_total_score: "Pontuação Total", stat_avg_score: "Pontuação Média", stat_highest_combo: "Maior Combo", stat_enemies_killed: "Inimigos Derrotados", stat_bosses_defeated: "Chefes Derrotados", stat_playtime: "Tempo de Jogo", stat_favorite_skin: "Skin Favorita", stat_legendary_skins: "Skins Lendárias", profile_guest: "Visitante", profile_login_prompt: "Faça login para ver seu perfil", auth_err_user_not_found: "Usuário não encontrado.", auth_err_wrong_password: "Senha incorreta.", auth_err_email_in_use: "Este e-mail já está cadastrado.", auth_err_username_in_use: "Este nome de piloto já existe.", auth_err_password_match: "As senhas não coincidem.", auth_err_generic: "Ocorreu um erro. Tente novamente.",
        box_standard: "Caixa Padrão", box_epic: "Caixa Épica", box_legendary: "Caixa Lendária",
        lead_title: "Melhores Pilotos", lead_rank: "Rank", lead_pilot: "Piloto", lead_score: "Pontuação", lead_ship: "Nave",
        footer_rights: "© 2026 Star Blaster. Todos os direitos reservados.",
        msg_processing: "Processando pagamento seguro...", msg_approved: "Pagamento de {price} aprovado! Abrindo...",
        settings_title: "Configurações", settings_volume: "Volume da Música", settings_mute: "Silenciar Música",
        settings_autoplay: "Tentar reproduzir ao carregar", settings_autoplay_note: "Pode ser necessário clicar na página se o navegador bloquear.",
        settings_replay: "🔁 Reiniciar Música", settings_track: "Tocando agora:"
    }
};

let currentLang = 'pt';
const langSwitcher = document.getElementById('langSwitcher');

function setLanguage(lang) {
    if (!translations[lang]) return;
    currentLang = lang;
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (translations[lang][key]) {
            if (el.tagName === 'SPAN') {
                el.innerHTML = translations[lang][key];
            } else {
                el.textContent = translations[lang][key];
            }
        }
    });
    // Ensure no element retains focus after language swap
    if (document.activeElement && document.activeElement.tagName === 'INPUT' && document.activeElement !== langSwitcher) {
        document.activeElement.blur();
    }
}

if (langSwitcher) {
    // Restaura o idioma guardado
    const savedLang = localStorage.getItem('sb_lang');
    if (savedLang && translations[savedLang]) {
        langSwitcher.value = savedLang;
        setLanguage(savedLang);
    }

    langSwitcher.addEventListener('change', (e) => {
        setLanguage(e.target.value);
        // Guarda o idioma para o PayPal SDK usar no próximo carregamento
        localStorage.setItem('sb_lang', e.target.value);
        // Update payment button label
        const ptBtn = document.getElementById('paymentToggle');
        const ptLabel = ptBtn ? ptBtn.querySelector('.payment-toggle-label') : null;
        const wrapper = document.getElementById('paypal-wrapper');
        if (ptBtn && ptLabel && wrapper) {
            const isOpen = wrapper.classList.contains('open');
            ptLabel.textContent = isOpen
                ? (translations[e.target.value]?.payment_close || 'Minimizar')
                : (translations[e.target.value]?.payment_open  || 'Pagar com Cartão / PayPal');
        }
        // Recarrega para o PayPal SDK pegar o novo locale
        if (window.paypal && document.getElementById('paypal-button-container')) {
            location.reload();
        }
        // Make sure no input retains focus after changing category (prevents blinking cursor on page)
        if (document.activeElement && document.activeElement !== document.body) {
            document.activeElement.blur();
        }
    });
}

/* ==========================================
   BOTÃO DE PAGAMENTO (Cartão / PayPal) - expansível
   ========================================== */
const paymentToggle = document.getElementById('paymentToggle');
const paypalWrapper = document.getElementById('paypal-wrapper');
const paymentToggleLabel = paymentToggle ? paymentToggle.querySelector('.payment-toggle-label') : null;

function updatePaymentLabel(isOpen) {
    if (!paymentToggleLabel) return;
    paymentToggleLabel.textContent = isOpen
        ? (translations[currentLang]?.payment_close || 'Minimizar')
        : (translations[currentLang]?.payment_open  || 'Pagar com Cartão / PayPal');
}

if (paymentToggle && paypalWrapper) {
    paymentToggle.addEventListener('click', (e) => {
        e.preventDefault();
        const isOpen = paypalWrapper.classList.toggle('open');
        paymentToggle.classList.toggle('active', isOpen);
        paymentToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
        updatePaymentLabel(isOpen);
    });
}

// White X close button - removed (user changed mind)
/* ==========================================
   MOBILE HAMBURGER MENU
   ========================================== */
const hamburgerBtn = document.getElementById('hamburgerBtn');
const navLinks = document.getElementById('navLinks');

if (hamburgerBtn && navLinks) {
    function closeMenu() {
        hamburgerBtn.classList.remove('active');
        navLinks.classList.remove('open');
    }
    function openMenu() {
        hamburgerBtn.classList.add('active');
        navLinks.classList.add('open');
    }

    hamburgerBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (navLinks.classList.contains('open')) closeMenu();
        else openMenu();
    });

    // Fechar o menu ao clicar num link (em mobile)
    navLinks.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            if (window.innerWidth <= 768) closeMenu();
        });
    });

    // Fechar ao clicar fora
    document.addEventListener('click', (e) => {
        if (!navLinks.contains(e.target) && e.target !== hamburgerBtn && !hamburgerBtn.contains(e.target)) {
            closeMenu();
        }
    });

    // Fechar com tecla ESC
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeMenu();
    });

    // Reposicionar se a janela for redimensionada
    window.addEventListener('resize', () => {
        if (window.innerWidth > 768) closeMenu();
    });
}

/* ==========================================
   SISTEMA DE PAGAMENTOS REAIS & GACHA
   ========================================== */
const boxPools = {
    standard: [
        { name: "Void Walker Padrão", icon: "🚀", rarity: "Comum", class: "rarity-comum", w: 70, color: "#a0a0a0" },
        { name: "Cruzador de Escolta", icon: "🛸", rarity: "Comum", class: "rarity-comum", w: 20, color: "#a0a0a0" },
        { name: "Plasma Ray Azure", icon: "🛰️", rarity: "Rara", class: "rarity-rara", w: 8, color: "var(--electric-blue)" },
        { name: "Neon Falcon", icon: "🦅", rarity: "Épica", class: "rarity-epica", w: 2, color: "var(--neon-purple)" }
    ],
    epic: [
        { name: "Cruzador de Escolta", icon: "🛸", rarity: "Comum", class: "rarity-comum", w: 20, color: "#a0a0a0" },
        { name: "Plasma Ray Azure", icon: "🛰️", rarity: "Rara", class: "rarity-rara", w: 60, color: "var(--electric-blue)" },
        { name: "Neon Falcon", icon: "🦅", rarity: "Épica", class: "rarity-epica", w: 20, color: "var(--neon-purple)" }
    ],
    legendary: [
        { name: "Plasma Ray Azure", icon: "🛰️", rarity: "Rara", class: "rarity-rara", w: 10, color: "var(--electric-blue)" },
        { name: "Neon Falcon", icon: "🦅", rarity: "Épica", class: "rarity-epica", w: 90, color: "var(--neon-purple)" }
    ]
};

const boxOptions = document.querySelectorAll('.box-option');
const activeBoxImg = document.getElementById('activeBoxImg');
const btnPrice = document.getElementById('btnPrice');
const lootbox = document.getElementById('lootbox');
const lootResult = document.getElementById('lootResult');
const skinIcon = document.getElementById('skinIcon');
const skinName = document.getElementById('skinName');
const skinRarity = document.getElementById('skinRarity');
const paymentStatus = document.getElementById('paymentStatus');

let currentBoxType = 'standard';
let currentPrice = '1.99';
let isOpening = false;

boxOptions.forEach(opt => {
    opt.addEventListener('click', () => {
        if (isOpening) return;

        boxOptions.forEach(b => b.classList.remove('active'));
        opt.classList.add('active');

        currentBoxType = opt.getAttribute('data-box');
        currentPrice = opt.getAttribute('data-price');

        if (btnPrice) btnPrice.textContent = '€ ' + currentPrice;
        activeBoxImg.textContent = opt.getAttribute('data-icon');
        lootbox.style.display = 'block';
        lootResult.classList.remove('active');
        paymentStatus.textContent = '';
    });
});

if (document.getElementById('paypal-button-container')) {
    window.paypal.Buttons({
        createOrder: function(data, actions) {
            if (isOpening) return null;
            return actions.order.create({
                purchase_units: [{
                    description: `Star Blaster Skin - Caixa ${currentBoxType.toUpperCase()}`,
                    amount: {
                        currency_code: "EUR",
                        value: currentPrice
                    }
                }]
            });
        },
        onApprove: function(data, actions) {
            paymentStatus.style.color = '#ffaa00';
            paymentStatus.textContent = translations[currentLang].msg_processing || "A confirmar pagamento...";
            isOpening = true;

            return actions.order.capture().then(function(details) {
                paymentStatus.style.color = '#0f0';
                paymentStatus.textContent = (translations[currentLang].msg_approved || "Aprovado!").replace('{price}', '€ ' + currentPrice)
                                            + " (Obrigado, " + details.payer.name.given_name + "!)";
                triggerLootboxOpening();
            });
        },
        onError: function(err) {
            paymentStatus.style.color = '#f00';
            paymentStatus.textContent = "O pagamento foi cancelado ou ocorreu um erro.";
            isOpening = false;
        },
        onCancel: function (data) {
            paymentStatus.style.color = '#f00';
            paymentStatus.textContent = "Pagamento cancelado pelo utilizador.";
            isOpening = false;
        }
    }).render('#paypal-button-container');
}

function triggerLootboxOpening() {
    lootResult.classList.remove('active');
    lootbox.style.display = 'block';
    lootbox.classList.add('shaking');

    setTimeout(() => {
        lootbox.classList.remove('shaking');
        lootbox.style.display = 'none';

        const skins = boxPools[currentBoxType];
        let totalWeight = skins.reduce((acc, skin) => acc + skin.w, 0);
        let randomNum = Math.random() * totalWeight;
        let weightSum = 0;
        let wonSkin = skins[0];

        for (let skin of skins) {
            weightSum += skin.w;
            if (randomNum <= weightSum) { wonSkin = skin; break; }
        }

        skinIcon.textContent = wonSkin.icon;
        skinIcon.style.color = wonSkin.color;
        skinIcon.style.filter = `drop-shadow(0 0 20px ${wonSkin.color})`;
        skinName.textContent = wonSkin.name;
        skinRarity.textContent = wonSkin.rarity;
        skinRarity.className = `rarity ${wonSkin.class}`;

        lootResult.classList.add('active');
        isOpening = false;

        // Save to user profile (if logged in)
        if (typeof saveSkinToProfile === 'function') {
            saveSkinToProfile({
                name: wonSkin.name,
                icon: wonSkin.icon,
                rarity: wonSkin.rarity,
                color: wonSkin.color,
                boxType: currentBoxType,
                price: currentPrice
            });
            // Update stats
            const user = (typeof getCurrentUser === 'function') ? getCurrentUser() : null;
            if (user) {
                const statsKey = 'sb_stats_' + user.email.toLowerCase();
                const stats = JSON.parse(localStorage.getItem(statsKey) || '{}');
                stats.boxesOpened = (stats.boxesOpened || 0) + 1;
                stats.totalSpent = (stats.totalSpent || 0) + (parseFloat(currentPrice) || 0);
                if ((wonSkin.rarity || '').toLowerCase().includes('lend') ||
                    (wonSkin.rarity || '').toLowerCase().includes('legend') ||
                    (wonSkin.rarity || '').toLowerCase().includes('mithic')) {
                    stats.legendarySkins = (stats.legendarySkins || 0) + 1;
                }
                localStorage.setItem(statsKey, JSON.stringify(stats));
            }
        }
    }, 1500);
}

/* ==========================================
   GALERIA — PREVIEWS DE GAMEPLAY ANIMADOS
   ========================================== */
function initGalleryPreviews() {
    const cards = [
        { id: 'galleryCanvas1', mode: 'action' },
        { id: 'galleryCanvas2', mode: 'boss'   },
        { id: 'galleryCanvas3', mode: 'coop'   }
    ];

    cards.forEach(card => {
        const c = document.getElementById(card.id);
        if (!c) return;
        const ctxG = c.getContext('2d');

        function resize() {
            const rect = c.getBoundingClientRect();
            c.width  = Math.max(300, rect.width);
            c.height = Math.max(180, rect.height);
        }
        resize();
        window.addEventListener('resize', resize);

        // Estado comum
        const state = {
            stars: [],
            bullets: [],
            enemies: [],
            particles: [],
            player:  { x: 0, y: 0, w: 28, h: 22 },
            boss:    { x: 0, y: 0, hp: 1, t: 0 },
            player2: { x: 0, y: 0, w: 28, h: 22 },
            t: 0
        };

        // Estrelas de fundo (parallax)
        for (let i = 0; i < 60; i++) {
            state.stars.push({
                x: Math.random(),
                y: Math.random(),
                s: Math.random() * 1.4 + 0.3,
                sp: Math.random() * 0.005 + 0.002
            });
        }

        function drawStars() {
            ctxG.fillStyle = 'rgba(224, 226, 234, 0.7)';
            for (const s of state.stars) {
                const sx = s.x * c.width;
                const sy = s.y * c.height;
                ctxG.fillRect(sx, sy, s.s, s.s);
                s.y += s.sp;
                if (s.y > 1) s.y = 0;
            }
        }

        function drawPlayer(x, y, color) {
            ctxG.fillStyle = color;
            ctxG.beginPath();
            ctxG.moveTo(x, y);
            ctxG.lineTo(x - 12, y + 22);
            ctxG.lineTo(x + 12, y + 22);
            ctxG.closePath();
            ctxG.fill();
            // cockpit
            ctxG.fillStyle = '#fff';
            ctxG.fillRect(x - 3, y + 8, 6, 6);
        }

        function spawnBullet(x, y, color) {
            state.bullets.push({ x, y, vy: -7, color });
        }

        function spawnParticle(x, y, color) {
            for (let i = 0; i < 4; i++) {
                state.particles.push({
                    x, y,
                    vx: (Math.random() - 0.5) * 4,
                    vy: (Math.random() - 0.5) * 4,
                    life: 25,
                    color
                });
            }
        }

        // Inimigos / modos
        function step() {
            const W = c.width, H = c.height;

            // Fundo escuro + scanlines suaves
            ctxG.fillStyle = 'rgba(5, 5, 12, 0.55)';
            ctxG.fillRect(0, 0, W, H);

            drawStars();

            state.t++;

            // ---- MODO: AÇÃO ----
            if (card.mode === 'action') {
                // Player a mover-se lateralmente
                const px = W/2 + Math.sin(state.t * 0.04) * (W * 0.35);
                const py = H - 40;
                if (state.t % 6 === 0) spawnBullet(px, py, '#FFE81F');

                // Inimigos a cair do topo
                if (state.t % 28 === 0) {
                    state.enemies.push({ x: Math.random() * (W - 20) + 10, y: -10, vy: 1.8 });
                }
                // desenhar inimigos
                ctxG.fillStyle = '#B026FF';
                for (let i = state.enemies.length - 1; i >= 0; i--) {
                    const e = state.enemies[i];
                    e.y += e.vy;
                    ctxG.fillRect(e.x - 10, e.y - 10, 20, 20);
                    // colisão com bala
                    for (let j = state.bullets.length - 1; j >= 0; j--) {
                        const b = state.bullets[j];
                        if (Math.abs(b.x - e.x) < 14 && Math.abs(b.y - e.y) < 14) {
                            spawnParticle(e.x, e.y, '#ff8800');
                            state.enemies.splice(i, 1);
                            state.bullets.splice(j, 1);
                            break;
                        }
                    }
                    if (e.y > H + 20) state.enemies.splice(i, 1);
                }
                drawPlayer(px, py, '#00F0FF');
            }

            // ---- MODO: BOSS ----
            if (card.mode === 'boss') {
                // Boss grande centrado no topo
                const bx = W/2;
                const by = 70;
                const pulse = 1 + Math.sin(state.t * 0.1) * 0.04;

                // Aura
                const grad = ctxG.createRadialGradient(bx, by, 10, bx, by, 90 * pulse);
                grad.addColorStop(0, 'rgba(255, 0, 85, 0.6)');
                grad.addColorStop(1, 'rgba(255, 0, 85, 0)');
                ctxG.fillStyle = grad;
                ctxG.fillRect(0, 0, W, H);

                // Corpo do boss (nave gigante)
                ctxG.fillStyle = '#2a2a3a';
                ctxG.beginPath();
                ctxG.ellipse(bx, by, 110 * pulse, 40 * pulse, 0, 0, Math.PI * 2);
                ctxG.fill();
                ctxG.strokeStyle = '#ff0055';
                ctxG.lineWidth = 2;
                ctxG.stroke();

                // Olho central
                ctxG.fillStyle = '#ff0055';
                ctxG.beginPath();
                ctxG.arc(bx, by, 12, 0, Math.PI * 2);
                ctxG.fill();
                ctxG.fillStyle = '#fff';
                ctxG.beginPath();
                ctxG.arc(bx, by, 5, 0, Math.PI * 2);
                ctxG.fill();

                // Canhões laterais disparam
                if (state.t % 18 === 0) {
                    state.bullets.push({ x: bx - 100, y: by, vy: 3, color: '#ff0055' });
                    state.bullets.push({ x: bx + 100, y: by, vy: 3, color: '#ff0055' });
                }

                // Player pequeno em baixo
                const px = W/2 + Math.sin(state.t * 0.03) * 60;
                const py = H - 50;
                if (state.t % 5 === 0) spawnBullet(px, py, '#FFE81F');
                drawPlayer(px, py, '#00F0FF');

                // Barra de HP do boss
                ctxG.fillStyle = 'rgba(255,255,255,0.15)';
                ctxG.fillRect(20, 14, W - 40, 6);
                const hpW = (W - 40) * (0.6 + Math.sin(state.t * 0.02) * 0.2);
                ctxG.fillStyle = '#ff0055';
                ctxG.fillRect(20, 14, hpW, 6);
                ctxG.strokeStyle = '#fff';
                ctxG.strokeRect(20, 14, W - 40, 6);
            }

            // ---- MODO: CO-OP ----
            if (card.mode === 'coop') {
                const py = H - 40;
                const p1x = W * 0.25 + Math.sin(state.t * 0.05) * 30;
                const p2x = W * 0.75 + Math.cos(state.t * 0.05) * 30;

                if (state.t % 7 === 0) { spawnBullet(p1x, py, '#00F0FF'); spawnBullet(p2x, py, '#B026FF'); }

                if (state.t % 35 === 0) {
                    state.enemies.push({ x: Math.random() * (W - 20) + 10, y: -10, vy: 1.4 });
                }
                ctxG.fillStyle = '#888';
                for (let i = state.enemies.length - 1; i >= 0; i--) {
                    const e = state.enemies[i];
                    e.y += e.vy;
                    ctxG.fillRect(e.x - 8, e.y - 8, 16, 16);
                    if (e.y > H + 20) state.enemies.splice(i, 1);
                }
                drawPlayer(p1x, py, '#00F0FF');
                drawPlayer(p2x, py, '#B026FF');

                // Divisor central
                ctxG.strokeStyle = 'rgba(255,255,255,0.1)';
                ctxG.setLineDash([4, 6]);
                ctxG.beginPath();
                ctxG.moveTo(W/2, 30);
                ctxG.lineTo(W/2, H - 30);
                ctxG.stroke();
                ctxG.setLineDash([]);
            }

            // ---- Balas + Partículas (comum) ----
            ctxG.shadowBlur = 8;
            for (let i = state.bullets.length - 1; i >= 0; i--) {
                const b = state.bullets[i];
                b.y += b.vy;
                ctxG.fillStyle = b.color;
                ctxG.shadowColor = b.color;
                ctxG.fillRect(b.x - 2, b.y - 6, 4, 10);
                if (b.y < -20 || b.y > H + 20) state.bullets.splice(i, 1);
            }
            ctxG.shadowBlur = 0;

            for (let i = state.particles.length - 1; i >= 0; i--) {
                const p = state.particles[i];
                p.x += p.vx; p.y += p.vy; p.life--;
                ctxG.fillStyle = p.color;
                ctxG.fillRect(p.x, p.y, 3, 3);
                if (p.life <= 0) state.particles.splice(i, 1);
            }
        }

        function loop() {
            step();
            requestAnimationFrame(loop);
        }
        loop();
    });
}

initGalleryPreviews();