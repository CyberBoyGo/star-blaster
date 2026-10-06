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
            ctx.beginPath(); ctx.arc(x, y, radius, 0, Math.PI * 2); ctx.fillStyle = 'rgba(224, 226, 234, ' + (1 - this.z / canvas.width) + ')'; ctx.fill();
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

/* ==========================================
   SISTEMA DE MÚSICA DE FUNDO
   ========================================== */
const bgMusic = document.getElementById('bgMusic');
const muteBtn = document.getElementById('muteBtn');

if (bgMusic && muteBtn) {
    bgMusic.volume = 0.3; // volume inicial (0.0 a 1.0)

    // Tenta iniciar automaticamente (pode falhar até o utilizador interagir)
    const tryAutoplay = () => {
        bgMusic.play().then(() => {
            muteBtn.classList.add('music-pulse');
        }).catch(() => {
            // Autoplay bloqueado — fica à espera da primeira interação
        });
    };
    tryAutoplay();

    // Inicia música na primeira interação do utilizador (caso autoplay falhe)
    const startOnInteraction = () => {
        if (bgMusic.paused) {
            bgMusic.play().then(() => {
                muteBtn.classList.add('music-pulse');
            }).catch(() => {});
        }
        document.removeEventListener('click', startOnInteraction);
        document.removeEventListener('keydown', startOnInteraction);
    };
    document.addEventListener('click', startOnInteraction);
    document.addEventListener('keydown', startOnInteraction);

    // Botão de mute/unmute
    muteBtn.addEventListener('click', (e) => {
        e.stopPropagation(); // não dispara o startOnInteraction
        bgMusic.muted = !bgMusic.muted;
        muteBtn.textContent = bgMusic.muted ? '🔇' : '🔊';
        muteBtn.style.color = bgMusic.muted ? '#888' : '';
    });
}

/* ==========================================
   SISTEMA INTERNACIONALIZAÇÃO (i18n)
   ========================================== */
const translations = {
    pt: {
        nav_demo: "Jogar Demo", nav_features: "Características", nav_gallery: "Galeria", nav_skins: "Mercado Negro (Skins)", nav_leaderboard: "Leaderboard",
        hero_subtitle: "Defende a galáxia, destrói bosses e domina o leaderboard global!", hero_cta: "JOGAR DEMO AGORA",
        feat_title: "O Que Te Espera", feat_1_title: "Modos de Jogo", feat_1_desc: "Aventura a solo intensa ou Multijogador local no mesmo ecrã com amigos.",
        feat_2_title: "Bosses Épicos", feat_2_desc: "Enfrenta naves colossais que preenchem o ecrã.",
        feat_3_title: "Suporte a Comandos", feat_3_desc: "Joga da forma que preferires. Suporte completo plug-and-play.",
        feat_4_title: "Leaderboard Global", feat_4_desc: "Compara as tuas pontuações online e prova que és o melhor piloto da galáxia.",
        gal_title: "Vislumbre da Batalha", gal_img1: "Gameplay Ação", gal_img2: "Boss Fight", gal_img3: "Modo Co-op",
        skins_title: "Mercado Negro (Skins)", skins_desc: "Compra caixas com dinheiro real para desbloqueares skins exclusivas. Escolhe o teu nível de recompensa!",
        box_standard: "Caixa Padrão", box_epic: "Caixa Épica", box_legendary: "Caixa Lendária",
        lead_title: "Top Pilotos", lead_rank: "Rank", lead_pilot: "Piloto", lead_score: "Pontuação", lead_ship: "Nave",
        footer_rights: "© 2026 Star Blaster. Todos os direitos reservados.",
        msg_processing: "A processar pagamento seguro...", msg_approved: "Pagamento de {price} aprovado! A abrir..."
    },
    en: {
        nav_demo: "Play Demo", nav_features: "Features", nav_gallery: "Gallery", nav_skins: "Black Market", nav_leaderboard: "Leaderboard",
        hero_subtitle: "Defend the galaxy, destroy bosses and dominate the global leaderboard!", hero_cta: "PLAY DEMO NOW",
        feat_title: "What to Expect", feat_1_title: "Game Modes", feat_1_desc: "Intense solo adventure or local couch Co-op with friends.",
        feat_2_title: "Epic Bosses", feat_2_desc: "Face colossal screen-filling ships with relentless attack patterns.",
        feat_3_title: "Gamepad Support", feat_3_desc: "Play your way. Full plug-and-play support for controllers.",
        feat_4_title: "Global Leaderboard", feat_4_desc: "Compare your online scores and prove you're the best pilot.",
        gal_title: "Battle Glimpse", gal_img1: "Action Gameplay", gal_img2: "Boss Fight", gal_img3: "Co-op Mode",
        skins_title: "Black Market (Skins)", skins_desc: "Buy boxes with real money to unlock exclusive skins. Choose your reward tier!",
        box_standard: "Standard Box", box_epic: "Epic Box", box_legendary: "Legendary Box",
        lead_title: "Top Pilots", lead_rank: "Rank", lead_pilot: "Pilot", lead_score: "Score", lead_ship: "Ship",
        footer_rights: "© 2026 Star Blaster. All rights reserved.",
        msg_processing: "Processing secure payment...", msg_approved: "Payment of {price} approved! Opening..."
    },
    es: {
        nav_demo: "Jugar Demo", nav_features: "Características", nav_gallery: "Galería", nav_skins: "Mercado Negro", nav_leaderboard: "Clasificación",
        hero_subtitle: "¡Defiende la galaxia, destruye jefes y domina la clasificación mundial!", hero_cta: "JUGAR DEMO AHORA",
        feat_title: "Lo Que Te Espera", feat_1_title: "Modos de Juego", feat_1_desc: "Aventura en solitario o multijugador cooperativo local.",
        feat_2_title: "Jefes Épicos", feat_2_desc: "Enfréntate a naves colosales con patrones de ataque implacables.",
        feat_3_title: "Soporte de Mando", feat_3_desc: "Juega como quieras. Soporte completo para mandos.",
        feat_4_title: "Clasificación Mundial", feat_4_desc: "Compara tus puntuaciones y demuestra que eres el mejor.",
        gal_title: "Vistazo a la Batalla", gal_img1: "Juego de Acción", gal_img2: "Lucha de Jefes", gal_img3: "Modo Cooperativo",
        skins_title: "Mercado Negro (Skins)", skins_desc: "Compra cajas con dinero real para desbloquear aspectos exclusivos.",
        box_standard: "Caja Estándar", box_epic: "Caja Épica", box_legendary: "Caja Legendaria",
        lead_title: "Mejores Pilotos", lead_rank: "Rango", lead_pilot: "Piloto", lead_score: "Puntuación", lead_ship: "Nave",
        footer_rights: "© 2026 Star Blaster. Todos los derechos reservados.",
        msg_processing: "Procesando pago seguro...", msg_approved: "¡Pago de {price} aprobado! Abriendo..."
    },
    fr: {
        nav_demo: "Jouer Démo", nav_features: "Fonctionnalités", nav_gallery: "Galerie", nav_skins: "Marché Noir", nav_leaderboard: "Classement",
        hero_subtitle: "Défendez la galaxie, détruisez les boss et dominez le classement !", hero_cta: "JOUER LA DÉMO",
        feat_title: "À Quoi S'attendre", feat_1_title: "Modes de Jeu", feat_1_desc: "Aventure solo intense ou Co-op local.",
        feat_2_title: "Boss Épiques", feat_2_desc: "Affrontez des vaisseaux colossaux aux attaques impitoyables.",
        feat_3_title: "Support Manette", feat_3_desc: "Jouez comme vous voulez avec un support manette complet.",
        feat_4_title: "Classement Mondial", feat_4_desc: "Comparez vos scores en ligne et prouvez votre valeur.",
        gal_title: "Aperçu de Bataille", gal_img1: "Action Gameplay", gal_img2: "Combat de Boss", gal_img3: "Mode Co-op",
        skins_title: "Marché Noir (Skins)", skins_desc: "Achetez des boîtes avec de l'argent réel pour des skins exclusifs.",
        box_standard: "Boîte Standard", box_epic: "Boîte Épique", box_legendary: "Boîte Légendaire",
        lead_title: "Meilleurs Pilotes", lead_rank: "Rang", lead_pilot: "Pilote", lead_score: "Score", lead_ship: "Vaisseau",
        footer_rights: "© 2026 Star Blaster. Tous droits réservés.",
        msg_processing: "Traitement du paiement...", msg_approved: "Paiement de {price} approuvé ! Ouverture..."
    },
    de: {
        nav_demo: "Demo Spielen", nav_features: "Funktionen", nav_gallery: "Galerie", nav_skins: "Schwarzmarkt", nav_leaderboard: "Bestenliste",
        hero_subtitle: "Verteidige die Galaxie, zerstöre Bosse und dominiere die Bestenliste!", hero_cta: "JETZT DEMO SPIELEN",
        feat_title: "Was Dich Erwartet", feat_1_title: "Spielmodi", feat_1_desc: "Intensives Solo-Abenteuer oder lokaler Co-op.",
        feat_2_title: "Epische Bosse", feat_2_desc: "Kämpfe gegen kolossale Schiffe mit unerbittlichen Angriffen.",
        feat_3_title: "Gamepad-Support", feat_3_desc: "Volle Plug-and-Play Unterstützung für Controller.",
        feat_4_title: "Globale Bestenliste", feat_4_desc: "Vergleiche deine Scores und werde der beste Pilot.",
        gal_title: "Schlacht-Einblick", gal_img1: "Action Gameplay", gal_img2: "Bosskampf", gal_img3: "Co-op Modus",
        skins_title: "Schwarzmarkt (Skins)", skins_desc: "Kaufe Boxen mit echtem Geld, um exklusive Skins freizuschalten.",
        box_standard: "Standard-Box", box_epic: "Epische Box", box_legendary: "Legendäre Box",
        lead_title: "Top Piloten", lead_rank: "Rang", lead_pilot: "Pilot", lead_score: "Punktzahl", lead_ship: "Schiff",
        footer_rights: "© 2026 Star Blaster. Alle Rechte vorbehalten.",
        msg_processing: "Sichere Zahlung wird bearbeitet...", msg_approved: "Zahlung von {price} genehmigt! Öffnen..."
    },
    zh: {
        nav_demo: "试玩演示", nav_features: "特色", nav_gallery: "画廊", nav_skins: "黑市 (皮肤)", nav_leaderboard: "排行榜",
        hero_subtitle: "捍卫银河系，摧毁Boss并称霸全球排行榜！", hero_cta: "立即试玩",
        feat_title: "游戏特色", feat_1_title: "游戏模式", feat_1_desc: "紧张的单人冒险或本地同屏合作。",
        feat_2_title: "史诗Boss", feat_2_desc: "面对满屏的巨型飞船和无情的弹幕攻击。",
        feat_3_title: "手柄支持", feat_3_desc: "即插即用的游戏手柄全面支持。",
        feat_4_title: "全球排行", feat_4_desc: "在线比较你的分数，证明你是最佳飞行员。",
        gal_title: "战斗一瞥", gal_img1: "动作实机", gal_img2: "Boss战", gal_img3: "合作模式",
        skins_title: "黑市 (皮肤)", skins_desc: "用真钱购买盲盒来解锁独家皮肤。选择你的奖励等级！",
        box_standard: "标准盲盒", box_epic: "史诗盲盒", box_legendary: "传奇盲盒",
        lead_title: "顶级飞行员", lead_rank: "排名", lead_pilot: "飞行员", lead_score: "分数", lead_ship: "飞船",
        footer_rights: "© 2026 Star Blaster。保留所有权利。",
        msg_processing: "正在处理安全付款...", msg_approved: "付款 {price} 已批准！正在打开..."
    },
    ja: {
        nav_demo: "デモをプレイ", nav_features: "機能", nav_gallery: "ギャラリー", nav_skins: "ブラックマーケット", nav_leaderboard: "リーダーボード",
        hero_subtitle: "銀河を守り、ボスを破壊し、ランキングを支配せよ！", hero_cta: "今すぐデモをプレイ",
        feat_title: "ゲームの特徴", feat_1_title: "ゲームモード", feat_1_desc: "激しいソロアドベンチャー、またはローカルCo-op。",
        feat_2_title: "エピックボス", feat_2_desc: "画面を埋め尽くす巨大な敵船と無慈悲な攻撃パターン。",
        feat_3_title: "ゲームパッド対応", feat_3_desc: "コントローラーのプラグアンドプレイに完全対応。",
        feat_4_title: "グローバルランキング", feat_4_desc: "オンラインでスコアを競い、最高のパイロットであることを証明しよう。",
        gal_title: "戦闘の様子", gal_img1: "アクションプレイ", gal_img2: "ボス戦", gal_img3: "協力モード",
        skins_title: "ブラックマーケット（スキン）", skins_desc: "リアルマネーでボックスを購入し、専用スキンをアンロックしよう。",
        box_standard: "スタンダードボックス", box_epic: "エピックボックス", box_legendary: "レジェンダリーボックス",
        lead_title: "トップパイロット", lead_rank: "ランク", lead_pilot: "パイロット", lead_score: "スコア", lead_ship: "船",
        footer_rights: "© 2026 Star Blaster. All rights reserved.",
        msg_processing: "安全な支払い処理中...", msg_approved: "{price}の支払いが承認されました！開封中..."
    }
};

let currentLang = 'pt';
const langSwitcher = document.getElementById('langSwitcher');

function setLanguage(lang) {
    if(!translations[lang]) return;
    currentLang = lang;
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (translations[lang][key]) {
            if(el.tagName === 'SPAN') {
                el.innerHTML = translations[lang][key];
            } else {
                el.textContent = translations[lang][key];
            }
        }
    });
}

langSwitcher.addEventListener('change', (e) => {
    setLanguage(e.target.value);
});


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
        { name: "Neon Falcon", icon: "🦅", rarity: "Épica", class: "rarity-epica", w: 15, color: "var(--neon-purple)" },
        { name: "Dragão Solar Dourado", icon: "🐉", rarity: "Lendária", class: "rarity-lendaria", w: 5, color: "var(--vibrant-yellow)" }
    ],
    legendary: [
        { name: "Plasma Ray Azure", icon: "🛰️", rarity: "Rara", class: "rarity-rara", w: 10, color: "var(--electric-blue)" },
        { name: "Neon Falcon", icon: "🦅", rarity: "Épica", class: "rarity-epica", w: 50, color: "var(--neon-purple)" },
        { name: "Dragão Solar Dourado", icon: "🐉", rarity: "Lendária", class: "rarity-lendaria", w: 35, color: "var(--vibrant-yellow)" },
        { name: "Titã Galáctico", icon: "👑", rarity: "Mítica", class: "rarity-mitica", w: 5, color: "#ff0055" }
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

// Seleção de Caixas
boxOptions.forEach(opt => {
    opt.addEventListener('click', () => {
        if(isOpening) return;
        
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

// Integração de Pagamento Real (PayPal SDK)
if (document.getElementById('paypal-button-container')) {
    window.paypal.Buttons({
        // Configura o pagamento com o valor dinâmico da caixa selecionada
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
        // O utilizador confirmou o pagamento na janela do PayPal
        onApprove: function(data, actions) {
            paymentStatus.style.color = '#ffaa00';
            paymentStatus.textContent = translations[currentLang].msg_processing || "A confirmar pagamento...";
            isOpening = true;

            // Captura os fundos da transação (Cobrança real)
            return actions.order.capture().then(function(details) {
                
                // Sucesso!
                paymentStatus.style.color = '#0f0';
                paymentStatus.textContent = (translations[currentLang].msg_approved || "Aprovado!").replace('{price}', '€ ' + currentPrice) 
                                            + " (Obrigado, " + details.payer.name.given_name + "!)";
                
                // Desencadeia a abertura da caixa
                triggerLootboxOpening();
            });
        },
        // Ocorreu um erro ou o utilizador fechou a janela
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
        let totalWeight = skins.reduce((acc, skin) => acc + skin.weight, 0);
        let randomNum = Math.random() * totalWeight;
        let weightSum = 0;
        let wonSkin = skins[0];
        
        for(let skin of skins) {
            weightSum += skin.weight;
            if(randomNum <= weightSum) { wonSkin = skin; break; }
        }
        
        skinIcon.textContent = wonSkin.icon;
        skinIcon.style.color = wonSkin.color;
        skinIcon.style.filter = `drop-shadow(0 0 20px ${wonSkin.color})`;
        skinName.textContent = wonSkin.name;
        skinRarity.textContent = wonSkin.rarity;
        skinRarity.className = `rarity ${wonSkin.class}`;
        
        lootResult.classList.add('active');
        isOpening = false;
    }, 1500);
}
