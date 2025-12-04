/**
 * =========================================================
 * KONFIGURASI DAN DATA (TEXT & ITEMS)
 * =========================================================
 */
const TEXT = {
    headerTagline: "Gaya Kekinian, Harga Terjamin. Gaspol!",
    profileLabel: "Username:",
    sectionDataPemain: "1. Data Pemain",
    sectionItem: "2. Pilih Item",
    sectionGame: "Mini Game: Stacker Kalcer",
    sectionPembayaran: "3. Konfirmasi & Bayar",
    labelId: "ID Game / Username",
    placeholderId: "Masukkan ID atau Username",
    labelServer: "Pilih Server",
    optionGlobal: "Global",
    optionAsia: "Asia Tenggara",
    optionEurope: "Eropa",
    labelQuantity: "Jumlah Beli",
    placeholderDetail: "Pilih item untuk melihat detail.",
    labelPriceUnit: "Harga Satuan",
    labelTotalItem: "Total Item",
    labelTotalHarga: "TOTAL HARGA",
    labelHargaDasar: "Harga Dasar:",
    buttonCheckout: "Checkout Sekarang",
    
    gameStart: "Mulai Game (Tekan Spasi)",
    gameStatusReady: "Siap? Tekan SPASI untuk mulai!",
    gameStatusPlaying: "Tekan SPASI untuk stack balok!",
    gameStatusWon: (score) => `🎉 GGWP! Skor: ${score}. Screenshot hasil ini!`,
    gameStatusLost: (score) => `Game Over! Skor: ${score}. Coba lagi!`,

    itemNames: {
        '100d': '100 Diamond',
        '300d': '300 Diamond',
        '500d': '500 Diamond + Bonus',
        '1000d': '1000 Diamond (Sultan)',
        'weekly': 'Membership Mingguan',
        'monthly': 'Membership Bulanan',
    },

    msgErrorId: '⛔ Masukkan ID Game dulu bosku.',
    msgErrorItem: '⛔ Pilih itemnya dulu dong.',
    
    msgQrisTitle: "SCAN QRIS (AUTO CHECK)",
    msgQrisDetail: (itemName, total) => `
        <div class="bg-gray-800 p-4 rounded-lg mb-4 border border-gray-700">
            <span class="text-sm text-gray-400 block mb-1">Item: ${itemName}</span>
            <span class="text-2xl font-bold text-yellow-400 block">IDR ${formatRupiah(total)}</span>
        </div>
        <div class="qris-box w-64 h-64 bg-white mx-auto p-2 rounded-lg shadow-[0_0_30px_rgba(255,215,0,0.3)] border-4 border-yellow-500 relative">
            <img src="image.webp" 
                 onerror="this.src='https://via.placeholder.com/300x300.png?text=QRIS+ERROR'" 
                 alt="Scan QRIS" class="w-full h-full object-contain"/>
        </div>
        <p class="text-xs italic text-gray-400 mt-4">Screenshot bukti bayar & kirim ke Admin.</p>
    `,
    
    msgMusicPlay: '🔊 Music ON - Vibe with it!',
    msgMusicPause: '🔇 Music OFF.',
};

const ITEMS = [
    { id: '100d', price: 15000 },
    { id: '300d', price: 42000 },
    { id: '500d', price: 65000 },
    { id: '1000d', price: 125000 },
    { id: 'weekly', price: 29000 },
    { id: 'monthly', price: 95000 },
];

let selectedItem = null;
let isMusicPlaying = false;

// --- INISIALISASI ---
document.addEventListener('DOMContentLoaded', () => {
    const path = window.location.pathname;
    
    // Setup Audio
    const audio = document.getElementById('background-music');
    if (audio) {
        audio.src = "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3"; 
        audio.volume = 0.4;
    }

    if (path.includes('login.html')) initLoginPage();
    else if (path.includes('Utama.html') || path === '/' || path.endsWith('/')) initMainPage();
});

// --- HALAMAN LOGIN ---
function initLoginPage() {
    const btn = document.getElementById('button-login');
    if(btn) btn.addEventListener('click', handleLoginProcess);
}

async function handleLoginProcess() {
    const u = document.getElementById('login-username').value;
    const p = document.getElementById('login-password').value;
    const msg = document.getElementById('auth-message');
    const btn = document.getElementById('button-login');

    if(!u || !p) { msg.textContent = "Isi semua kolom!"; return; }

    btn.disabled = true; btn.textContent = "Loading..."; msg.textContent = "";

    try {
        const res = await fetch('login.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: u, password: p })
        });
        const data = await res.json();
        
        if (data.status === 'success') {
            msg.className = "text-sm mt-3 text-green-400 font-bold";
            msg.textContent = "Berhasil! Masuk...";
            localStorage.setItem('user_id', data.user_id);
            localStorage.setItem('username', data.username);
            setTimeout(() => window.location.href = "Utama.html", 1500);
        } else {
            msg.className = "text-sm mt-3 text-red-400 font-bold";
            msg.textContent = data.message;
            btn.disabled = false; btn.textContent = "Login";
        }
    } catch (e) {
        msg.textContent = "Server Error."; btn.disabled = false;
    }
}

// --- HALAMAN UTAMA ---
function initMainPage() {
    updateStaticText();
    const user = localStorage.getItem('username');
    if (user) document.querySelector('#profile-label + p').textContent = user;
    generateItemButtons();
    initGame();
    const qty = document.getElementById('quantity');
    if(qty) qty.addEventListener('input', calculateTotal);
}

function formatRupiah(n) { return new Intl.NumberFormat('id-ID').format(n); }

function generateItemButtons() {
    const c = document.getElementById('item-selection');
    if (!c) return;
    c.innerHTML = ITEMS.map(i => `
        <button onclick="selectItem('${i.id}', this)"
            class="item-button w-full p-4 rounded-xl bg-gray-700 text-white border-2 border-transparent hover:border-yellow-500 hover:bg-gray-600 text-left transition relative overflow-hidden group">
            <div class="font-bold text-sm group-hover:text-yellow-400">${TEXT.itemNames[i.id]}</div>
            <div class="text-xs text-gray-400 mt-1">IDR ${formatRupiah(i.price)}</div>
        </button>`).join('');
}

window.selectItem = function(id, el) {
    document.querySelectorAll('.item-button').forEach(b => {
        b.classList.remove('border-yellow-500', 'bg-gray-600', 'neon-shadow');
        b.classList.add('border-transparent', 'bg-gray-700');
    });
    el.classList.add('border-yellow-500', 'bg-gray-600', 'neon-shadow');
    
    selectedItem = ITEMS.find(i => i.id === id);
    selectedItem.name = TEXT.itemNames[id];
    
    document.getElementById('quantity-input-container').classList.remove('hidden');
    document.getElementById('quantity').value = 1;
    updateDisplay(); calculateTotal();
}

function updateDisplay() {
    const d = document.getElementById('selected-item-display');
    const p = document.getElementById('price-per-unit');
    if (selectedItem) {
        d.innerHTML = `<p class="font-bold text-white text-lg">${selectedItem.name}</p>
                       <p class="text-yellow-400 text-sm">@ IDR ${formatRupiah(selectedItem.price)}</p>`;
        p.textContent = "Rp " + formatRupiah(selectedItem.price);
    } else {
        d.innerHTML = `<p class="text-gray-400 italic">${TEXT.placeholderDetail}</p>`;
        p.textContent = "0";
    }
}

window.calculateTotal = function() {
    const units = document.getElementById('total-units');
    const final = document.getElementById('final-total');
    const btn = document.getElementById('button-checkout');
    
    if (!selectedItem) { final.textContent = 'IDR 0'; units.textContent = '0'; return; }

    let q = parseInt(document.getElementById('quantity').value) || 1;
    if (q < 1) q = 1;
    const tot = selectedItem.price * q;

    units.textContent = q + "x";
    final.textContent = `IDR ${formatRupiah(tot)}`;
    if(btn) btn.textContent = `Bayar (IDR ${formatRupiah(tot)})`;
}

window.checkout = function() {
    const id = document.getElementById('player-id').value.trim();
    const stat = document.getElementById('status-message');
    stat.className = ''; stat.classList.remove('hidden');
    
    if (!id) { stat.className = 'text-center text-red-400 font-bold mt-4'; stat.textContent = TEXT.msgErrorId; return; }
    if (!selectedItem) { stat.className = 'text-center text-red-400 font-bold mt-4'; stat.textContent = TEXT.msgErrorItem; return; }

    const q = parseInt(document.getElementById('quantity').value) || 1;
    const tot = selectedItem.price * q;

    stat.className = 'mt-6 p-6 rounded-xl bg-gray-900 text-center shadow-2xl border border-yellow-500/30';
    stat.innerHTML = `
        <h3 class="text-xl font-bold text-yellow-300 mb-4">${TEXT.msgQrisTitle}</h3>
        <p class="text-sm text-gray-300 mb-2">ID: <span class="font-mono text-white bg-gray-700 px-2 rounded">${id}</span></p>
        ${TEXT.msgQrisDetail(selectedItem.name, tot)}
        <button onclick="hideQrisAndReset()" class="mt-6 py-2 px-8 bg-yellow-500 text-gray-900 font-bold rounded-full hover:scale-105 transition shadow-lg">Tutup</button>
    `;
}

window.hideQrisAndReset = function() {
    document.getElementById('status-message').classList.add('hidden');
}

function updateStaticText() {
    const m = {
        'header-tagline': TEXT.headerTagline, 'profile-label': TEXT.profileLabel,
        'section-data-pemain': TEXT.sectionDataPemain, 'label-id': TEXT.labelId,
        'player-id': TEXT.placeholderId, 'label-server': TEXT.labelServer,
        'option-global': TEXT.optionGlobal, 'option-asia': TEXT.optionAsia,
        'option-europe': TEXT.optionEurope, 'section-item': TEXT.sectionItem,
        'label-quantity': TEXT.labelQuantity, 'section-pembayaran': TEXT.sectionPembayaran,
        'label-price-unit': TEXT.labelPriceUnit, 'label-total-item': TEXT.labelTotalItem,
        'label-total-harga': TEXT.labelTotalHarga, 'section-game': TEXT.sectionGame
    };
    for (const [k, v] of Object.entries(m)) {
        const el = document.getElementById(k);
        if (el) k === 'player-id' ? el.placeholder = v : el.textContent = v;
    }
}

// --- LOGIKA GAME STACKER (NEON + SHAKE) ---
const ROWS = 10, COLS = 5;
let gameBoard = [], gameInterval, gameSpeed = 300;
let currentLevel = 0, currentBlock = { start: 0, length: COLS, direction: 1, position: 0 };
let isGameRunning = false;

function initGame() {
    const b = document.getElementById('stacker-board');
    if(!b) return;
    b.innerHTML = ''; gameBoard = [];
    
    for (let r = 0; r < ROWS; r++) {
        const rowDiv = document.createElement('div');
        rowDiv.className = 'block-row flex w-full flex-1';
        const row = [];
        for (let c = 0; c < COLS; c++) {
            const cell = document.createElement('div');
            cell.className = 'block-cell flex-1 border border-white/5';
            rowDiv.appendChild(cell); row.push(cell);
        }
        gameBoard.unshift(row); b.appendChild(rowDiv);
    }
    document.getElementById('game-status').textContent = TEXT.gameStatusReady;
    document.getElementById('start-game-button').textContent = TEXT.gameStart;
}

window.startGame = function() {
    if (isGameRunning) return;
    if(document.activeElement) document.activeElement.blur(); // Lepas fokus tombol
    
    initGame();
    currentLevel = 0; currentBlock = { start: 0, length: COLS, direction: 1, position: 0 };
    gameSpeed = 300; isGameRunning = true;
    
    playMusicInternal(); // Auto Play Musik
    
    document.getElementById('game-status').textContent = TEXT.gameStatusPlaying;
    document.getElementById('start-game-button').textContent = 'JATUHKAN! (SPASI)';
    gameInterval = setInterval(moveBlock, gameSpeed);
}

function moveBlock() {
    if (currentLevel >= ROWS) return;
    let row = gameBoard[currentLevel];
    for (let i = 0; i < COLS; i++) row[i].classList.remove('moving');
    
    currentBlock.position += currentBlock.direction;
    if (currentBlock.position + currentBlock.length > COLS) {
        currentBlock.direction = -1; currentBlock.position = COLS - currentBlock.length;
    } else if (currentBlock.position < 0) {
        currentBlock.direction = 1; currentBlock.position = 0;
    }
    
    for (let i = 0; i < currentBlock.length; i++) {
        let idx = currentBlock.position + i;
        if (idx >= 0 && idx < COLS) row[idx].classList.add('moving');
    }
}

function dropBlock() {
    if (!isGameRunning || currentLevel >= ROWS) return;
    clearInterval(gameInterval);
    
    const boardEl = document.getElementById('stacker-board');
    let rowEl = gameBoard[currentLevel];
    let newLen = 0, newStart = 0, isMissed = false;

    if (currentLevel === 0) {
        newLen = COLS; newStart = 0;
    } else {
        const prev = gameBoard[currentLevel - 1];
        let pStart = -1, pEnd = -1;
        for(let c=0; c<COLS; c++) if(prev[c].classList.contains('stacked')) {
            if(pStart === -1) pStart = c; pEnd = c;
        }

        const cStart = currentBlock.position;
        const cEnd = currentBlock.position + currentBlock.length - 1;
        const oStart = Math.max(cStart, pStart);
        const oEnd = Math.min(cEnd, pEnd);
        
        if (oStart <= oEnd) { newLen = oEnd - oStart + 1; newStart = oStart; }
        else { newLen = 0; }

        for(let c=0; c<COLS; c++) {
            rowEl[c].classList.remove('moving');
            if (c >= cStart && c <= cEnd) {
                if (c < oStart || c > oEnd) {
                    rowEl[c].classList.add('missed'); isMissed = true;
                }
            }
        }
    }

    if (newLen > 0) {
        for (let i = 0; i < newLen; i++) rowEl[newStart + i].classList.add('stacked');
        
        // Efek Kilatan
        rowEl.forEach(c => c.classList.add('row-flash'));
        setTimeout(() => rowEl.forEach(c => c.classList.remove('row-flash')), 200);

        currentLevel++;
        currentBlock.start = newStart; currentBlock.length = newLen;
        currentBlock.position = newStart; currentBlock.direction = 1;

        if (currentLevel < ROWS) {
            gameSpeed = Math.max(50, gameSpeed * 0.85);
            gameInterval = setInterval(moveBlock, gameSpeed);
            if(isMissed && boardEl) { // Getar dikit kalo ada yang potong
                boardEl.classList.add('shake-board');
                setTimeout(() => boardEl.classList.remove('shake-board'), 300);
            }
        } else { endGame(true, ROWS * 100); }
    } else {
        if(boardEl) { // Getar Keras pas Kalah
            boardEl.classList.add('shake-board');
            setTimeout(() => boardEl.classList.remove('shake-board'), 500);
        }
        endGame(false, currentLevel * 100);
    }
}

function endGame(win, score) {
    isGameRunning = false; clearInterval(gameInterval);
    const stat = document.getElementById('game-status');
    const btn = document.getElementById('start-game-button');
    stat.innerHTML = win ? `<span class="text-green-400 font-bold neon-shadow">${TEXT.gameStatusWon(score)}</span>` : `<span class="text-red-500 font-bold">${TEXT.gameStatusLost(score)}</span>`;
    btn.textContent = "MAIN LAGI (SPASI)";
}

// Listener Spasi (Global)
document.addEventListener('keydown', (e) => {
    if (e.code === 'Space' || e.key === ' ') {
        if (window.location.pathname.includes('Utama') || document.getElementById('stacker-board')) {
            const tag = document.activeElement.tagName;
            if (tag !== 'INPUT' && tag !== 'TEXTAREA') {
                e.preventDefault();
                if (isGameRunning) dropBlock(); else startGame();
            }
        }
    }
});

// --- MUSIK ---
function playMusicInternal() {
    const a = document.getElementById('background-music');
    if(a) a.play().then(() => { isMusicPlaying = true; updateMusicIcon('⏸️'); }).catch(console.log);
}
function pauseMusicInternal() {
    const a = document.getElementById('background-music');
    if(a) { a.pause(); isMusicPlaying = false; updateMusicIcon('🎶'); }
}
function updateMusicIcon(i) {
    const el = document.getElementById('music-icon'); if(el) el.textContent = i;
}
window.toggleMusic = function() {
    const msg = document.getElementById('status-message');
    if (isGameRunning) {
        msg.className = 'text-center text-red-400 font-bold mt-4'; msg.textContent = "Fokus main! Musik dikunci."; 
        msg.classList.remove('hidden'); setTimeout(() => msg.classList.add('hidden'), 2000); return;
    }
    hideQrisAndReset(); msg.classList.remove('hidden');
    if (!isMusicPlaying) { playMusicInternal(); msg.className = 'text-center text-green-400 mt-4'; msg.textContent = TEXT.msgMusicPlay; }
    else { pauseMusicInternal(); msg.className = 'text-center text-gray-400 mt-4'; msg.textContent = TEXT.msgMusicPause; }
    setTimeout(() => { if(!isGameRunning) msg.classList.add('hidden'); }, 2000);
}