/* ==========================================
   PROFILE PAGE LOGIC
   - Loads user data, skins, stats from localStorage
   - Falls back to demo data if user not logged in
   ========================================== */

(function() {
    'use strict';

    // Get i18n helper
    function tr(key, fallback) {
        const lang = (typeof currentLang !== 'undefined') ? currentLang : 'pt';
        const t = (typeof translations !== 'undefined') ? translations[lang] : null;
        return (t && t[key]) ? t[key] : (fallback || key);
    }

    // ==========================================
    // USER PROFILE
    // ==========================================
    function loadProfile() {
        const user = (typeof getCurrentUser === 'function') ? getCurrentUser() : null;

        // If user not logged in, show a guest message
        if (!user) {
            const header = document.querySelector('.profile-header');
            if (header) {
                header.innerHTML = `
                    <div class="profile-avatar">👤</div>
                    <div class="profile-info">
                        <h1 class="profile-username">${tr('profile_guest', 'Visitante')}</h1>
                        <p class="profile-email">${tr('profile_login_prompt', 'Inicia sessão para ver o teu perfil')}</p>
                    </div>
                    <a href="login.html" class="profile-cta">${tr('nav_login', 'Login')}</a>
                `;
            }
            // Hide tabs and stats
            const tabs = document.querySelector('.profile-tabs');
            const tabContent = document.querySelectorAll('.profile-tab-content');
            const footer = document.querySelector('.profile-footer');
            if (tabs) tabs.style.display = 'none';
            tabContent.forEach(t => t.style.display = 'none');
            if (footer) footer.style.display = 'none';
            // Show empty state
            const statsOverview = document.querySelector('.stats-overview');
            if (statsOverview) statsOverview.style.display = 'none';
            return;
        }

        // Set profile info
        const usernameEl = document.getElementById('profileUsername');
        const emailEl = document.getElementById('profileEmail');
        const joinDateEl = document.getElementById('profileJoinDate');
        const avatarEl = document.getElementById('profileAvatar');

        if (usernameEl) usernameEl.textContent = user.username || user.email;
        if (emailEl) emailEl.textContent = user.email;
        if (avatarEl) avatarEl.textContent = '🚀';

        // Join date
        let joinDate = '--';
        if (user.createdAt) {
            const d = new Date(user.createdAt);
            joinDate = d.toLocaleDateString((typeof currentLang !== 'undefined') ? currentLang : 'pt-PT', {
                year: 'numeric', month: 'long', day: 'numeric'
            });
        }
        if (joinDateEl) joinDateEl.textContent = joinDate;

        // Logout button
        const logoutBtn = document.getElementById('logoutBtnProfile');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                if (typeof export_signOut === 'function') {
                    export_signOut();
                    window.location.href = 'index.html';
                }
            });
        }
    }

    // ==========================================
    // LOAD SKINS
    // ==========================================
    function loadSkins() {
        const user = (typeof getCurrentUser === 'function') ? getCurrentUser() : null;
        if (!user) return;

        const email = user.email.toLowerCase();
        const skinsKey = 'sb_skins_' + email;
        const skinsData = JSON.parse(localStorage.getItem(skinsKey) || '[]');

        const grid = document.getElementById('skinsGrid');
        const noSkins = document.getElementById('noSkins');
        if (!grid) return;

        if (skinsData.length === 0) {
            grid.style.display = 'none';
            if (noSkins) noSkins.style.display = 'flex';
            return;
        }

        grid.style.display = 'grid';
        if (noSkins) noSkins.style.display = 'none';

        grid.innerHTML = skinsData.map((skin, i) => {
            const rarityClass = normalizeRarity(skin.rarity);
            const rarityLabel = (skin.rarity || 'common').toUpperCase();
            return `
            <div class="skin-card skin-rarity-${rarityClass}">
                <div class="skin-card-icon">${skin.icon || '🚀'}</div>
                <div class="skin-card-name">${escapeHtml(skin.name || 'Unknown')}</div>
                <div class="skin-card-rarity">${escapeHtml(rarityLabel)}</div>
                <div class="skin-card-date">${new Date(skin.acquiredAt || Date.now()).toLocaleDateString()}</div>
            </div>
            `;
        }).join('');
    }

    // ==========================================
    // LOAD STATS
    // ==========================================
    function loadStats() {
        const user = (typeof getCurrentUser === 'function') ? getCurrentUser() : null;
        if (!user) return;

        const email = user.email.toLowerCase();
        const statsKey = 'sb_stats_' + email;
        const stats = JSON.parse(localStorage.getItem(statsKey) || '{}');

        // Default stats
        const defaults = {
            boxesOpened: 0,
            totalSpent: 0,
            bestScore: 0,
            gamesPlayed: 0,
            totalScore: 0,
            avgScore: 0,
            highestCombo: 0,
            enemiesKilled: 0,
            bossesDefeated: 0,
            playtimeMinutes: 0,
            favoriteSkin: '-',
            legendarySkins: 0
        };
        const s = Object.assign({}, defaults, stats);

        // Update overview
        document.getElementById('statBoxes').textContent = s.boxesOpened;
        document.getElementById('statSpent').textContent = '€' + s.totalSpent.toFixed(2);
        document.getElementById('statBestScore').textContent = s.bestScore.toLocaleString();
        document.getElementById('statGamesPlayed').textContent = s.gamesPlayed;

        // Update detailed
        document.getElementById('statTotalScore').textContent = s.totalScore.toLocaleString();
        document.getElementById('statAvgScore').textContent = s.avgScore.toLocaleString();
        document.getElementById('statHighestCombo').textContent = s.highestCombo;
        document.getElementById('statEnemiesKilled').textContent = s.enemiesKilled.toLocaleString();
        document.getElementById('statBossesDefeated').textContent = s.bossesDefeated;
        document.getElementById('statPlaytime').textContent = formatPlaytime(s.playtimeMinutes);
        document.getElementById('statFavoriteSkin').textContent = s.favoriteSkin || '-';
        document.getElementById('statLegendarySkins').textContent = s.legendarySkins;

        // Recent games
        const recentGamesKey = 'sb_recent_games_' + email;
        const recent = JSON.parse(localStorage.getItem(recentGamesKey) || '[]');
        const recentEl = document.getElementById('recentGames');
        const noGames = document.getElementById('noGames');

        if (!recentEl) return;

        if (recent.length === 0) {
            recentEl.style.display = 'none';
            if (noGames) noGames.style.display = 'flex';
        } else {
            recentEl.style.display = 'block';
            if (noGames) noGames.style.display = 'none';
            recentEl.innerHTML = recent.slice(0, 10).map(game => `
                <div class="recent-game-row">
                    <span class="recent-game-date">${new Date(game.date).toLocaleDateString()}</span>
                    <span class="recent-game-mode">${escapeHtml(game.mode || 'Solo')}</span>
                    <span class="recent-game-score">${(game.score || 0).toLocaleString()}</span>
                </div>
            `).join('');
        }
    }

    function formatPlaytime(minutes) {
        const h = Math.floor(minutes / 60);
        const m = minutes % 60;
        return h + 'h ' + m + 'm';
    }

    function escapeHtml(s) {
        if (!s) return '';
        return String(s)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    function normalizeRarity(r) {
        if (!r) return 'common';
        const x = String(r).toLowerCase();
        if (x.includes('legend') || x.includes('lend') || x.includes('mithic') || x.includes('mitic') || x.includes('mythic')) return 'legendary';
        if (x.includes('epic') || x.includes('épica')) return 'epic';
        if (x.includes('rare') || x.includes('rara')) return 'rare';
        return 'common';
    }

    // ==========================================
    // TABS
    // ==========================================
    function setupTabs() {
        const tabs = document.querySelectorAll('.profile-tab');
        const contents = document.querySelectorAll('.profile-tab-content');
        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const target = tab.dataset.tab;
                tabs.forEach(t => t.classList.toggle('active', t === tab));
                contents.forEach(c => {
                    c.classList.toggle('active', c.id === 'tab-' + target);
                });
            });
        });
    }

    // ==========================================
    // INIT
    // ==========================================
    document.addEventListener('DOMContentLoaded', () => {
        loadProfile();
        loadSkins();
        loadStats();
        setupTabs();
    });
})();