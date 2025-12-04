// =========================================================
// SWEET BONANZA GAME LOGIC & BACKEND INTEGRATION
// =========================================================

// --- VARIABEL GLOBAL ---
let currentUserBalance = 0; // Saldo Pemain (Dari Database)
let currentBet = 200;       // Taruhan Dasar
let isEnhance = false;      // Status Double Chance
let isBuySpin = false;      // Status Buy Feature
let isSpinning = false;     // Status Putaran
let currentWinAmount = 0;   // Kemenangan Putaran Terakhir

// --- DATA SIMBOL & PELUANG (WEIGHT) ---
const slotSymbols = [
    { icon: "🍌", id: "pisang", weight: 35 }, 
    { icon: "🍇", id: "anggur", weight: 30 },
    { icon: "🍉", id: "semangka", weight: 25 },
    { icon: "🍑", id: "plum", weight: 20 },
    { icon: "🍎", id: "apel", weight: 15 },
    { icon: "💎", id: "bluegem", weight: 10 },
    { icon: "💚", id: "greengem", weight: 8 },
    { icon: "💜", id: "purplegem", weight: 5 }, // Simbol Mahal
    { icon: "❤️", id: "heart", weight: 3 },     // Simbol Paling Mahal
    { icon: "🍭", id: "scatter", weight: 2 },   // Scatter (Langka)
    { icon: "💣", id: "bomb", weight: 1 }       // Bomb Multiplier (Sangat Langka)
];

const ROWS = 5;
const COLS = 6;

// =========================================================
// 1. INISIALISASI & SESI
// =========================================================

document.addEventListener('DOMContentLoaded', () => {
    checkSession();
    initSlotBoard();     // Gambar papan awal
    refreshBalance();    // Ambil saldo dari DB
    updateBetSettings(); // Hitung tampilan awal
});

function checkSession() {
    const user = localStorage.getItem('username');
    if (!user) {
        window.location.href = 'login.html';
    } else {
        const userDisplay = document.getElementById('current-username');
        if(userDisplay) userDisplay.textContent = user;
    }
}

function handleLogout() {
    if(confirm("Yakin ingin keluar dan simpan saldo?")) {
        localStorage.clear();
        window.location.href = 'login.html';
    }
}

// =========================================================
// 2. INTEGRASI BACKEND (DATABASE)
// =========================================================

// FUNGSI GET: Ambil Saldo Terbaru
async function refreshBalance() {
    const userId = localStorage.getItem('user_id');
    const balanceEl = document.getElementById('user-balance'); // Di Header
    const displayBalance = document.getElementById('display-balance'); // Di Panel Bawah
    const refreshIcon = document.getElementById('refresh-icon');

    if (!userId) return;

    // Animasi Loading Kecil
    if(refreshIcon) refreshIcon.classList.add('animate-spin');

    try {
        const response = await fetch(`get_profile.php?id=${userId}`);
        const data = await response.json();

        if (data.status === 'success') {
            currentUserBalance = parseFloat(data.saldo); // Simpan ke variable global
            
            // Format Rupiah
            const formatted = "IDR " + currentUserBalance.toLocaleString('id-ID');
            
            // Update UI
            if(balanceEl) balanceEl.textContent = formatted;
            if(displayBalance) displayBalance.textContent = formatted;
            
            // Update kalkulasi sisa
            calculateTotal();
        }
    } catch (error) {
        console.error("Gagal ambil saldo:", error);
    } finally {
        if(refreshIcon) refreshIcon.classList.remove('animate-spin');
    }
}

// FUNGSI POST: Update Saldo (Kurang Bet + Tambah Menang)
async function updateDatabaseSaldo(betAmount, winAmount) {
    const userId = localStorage.getItem('user_id');
    const msg = document.getElementById('status-message');

    try {
        const response = await fetch('update_saldo.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                user_id: userId,
                bet: betAmount,
                win: winAmount
            })
        });
        
        const data = await response.json();
        
        if(data.status === 'success') {
            // Sinkronkan saldo frontend dengan backend (agar akurat)
            currentUserBalance = parseFloat(data.new_saldo);
            
            // Update UI Header
            document.getElementById('user-balance').textContent = "IDR " + currentUserBalance.toLocaleString('id-ID');
            
            if(msg) msg.textContent = "Saldo berhasil disimpan ke server ✅";
            
            // Refresh kalkulasi panel bawah
            calculateTotal();
        } else {
            console.error("Database Error:", data.message);
            if(msg) msg.textContent = "Gagal simpan saldo ❌";
        }
    } catch (e) {
        console.error("Koneksi Error:", e);
    }
}

// =========================================================
// 3. LOGIKA BETTING & KALKULATOR
// =========================================================

function adjustBet(amount) {
    currentBet += amount;
    if (currentBet < 200) currentBet = 200; // Minimal bet
    
    const input = document.getElementById('base-bet');
    if(input) input.value = currentBet;
    
    updateBetSettings();
}

function updateBetSettings() {
    const enhanceToggle = document.getElementById('toggle-enhance');
    const buySpinToggle = document.getElementById('toggle-buyspin');
    
    if(enhanceToggle) isEnhance = enhanceToggle.checked;
    if(buySpinToggle) isBuySpin = buySpinToggle.checked;

    // Logika Eksklusif: Jika Buy Spin Nyala, Matikan Enhance
    if (isBuySpin && isEnhance) {
        enhanceToggle.checked = false;
        isEnhance = false;
    }

    calculateTotal();
}

// Hitung Rincian Panel Bawah
function calculateTotal() {
    const dispBet = document.getElementById('display-bet');
    const dispWin = document.getElementById('display-win');
    const dispFinal = document.getElementById('final-balance-display');
    const dispPriceUnit = document.getElementById('price-per-unit'); // Di box bet control

    // Hitung Total Bet yang akan dipotong
    let totalBet = currentBet;
    if (isBuySpin) totalBet = currentBet * 100;
    else if (isEnhance) totalBet = currentBet * 1.25;

    // Hitung Sisa Saldo Visual
    // Sisa = Saldo Saat Ini - Bet + Menang (Realtime update)
    // Catatan: Saat belum spin, currentWinAmount = 0.
    let estimasiSisa = currentUserBalance - totalBet + currentWinAmount;

    // Update UI Panel Bawah
    if(dispBet) dispBet.textContent = `- Rp ${totalBet.toLocaleString('id-ID')}`;
    if(dispWin) dispWin.textContent = `+ Rp ${currentWinAmount.toLocaleString('id-ID')}`;
    if(dispFinal) dispFinal.textContent = `Rp ${estimasiSisa.toLocaleString('id-ID')}`;
    
    // Update Info Kecil di Panel Tengah
    if(dispPriceUnit) dispPriceUnit.textContent = `IDR ${totalBet.toLocaleString('id-ID')}`;
}

// =========================================================
// 4. CORE GAME LOGIC (SLOT 6x5)
// =========================================================

function initSlotBoard() {
    const board = document.getElementById('slot-machine-board');
    if(!board) return;
    
    board.innerHTML = '';
    // Buat 30 Cell
    for (let i = 0; i < ROWS * COLS; i++) {
        const cell = document.createElement('div');
        cell.className = 'slot-cell'; // Style ada di CSS
        
        const content = document.createElement('div');
        content.className = 'slot-cell-content';
        content.textContent = getRandomSymbol().icon;
        
        cell.appendChild(content);
        board.appendChild(cell);
    }
}

function getRandomSymbol() {
    const totalWeight = slotSymbols.reduce((sum, item) => sum + item.weight, 0);
    let randomNum = Math.random() * totalWeight;
    
    for (const symbol of slotSymbols) {
        if (randomNum < symbol.weight) return symbol;
        randomNum -= symbol.weight;
    }
    return slotSymbols[0];
}

// --- FUNGSI UTAMA: PUTAR SLOT ---
window.spinSlot = function() {
    if (isSpinning) return;

    // 1. Hitung Biaya Bet
    let totalBet = currentBet;
    if (isBuySpin) totalBet = currentBet * 100;
    else if (isEnhance) totalBet = currentBet * 1.25;

    // 2. Cek Saldo Cukup?
    if (currentUserBalance < totalBet) {
        alert("Saldo tidak cukup! Silakan Top Up atau turunkan bet.");
        return;
    }

    // 3. Persiapan UI Spin
    currentWinAmount = 0; // Reset win lama
    calculateTotal();     // Update UI biar win jadi 0 dulu

    const board = document.getElementById('slot-machine-board');
    const btn = document.getElementById('spin-button');
    const msg = document.getElementById('win-message');
    const multiDisplay = document.getElementById('multiplier-display');

    isSpinning = true;
    board.classList.add('is-spinning'); // Efek Blur CSS
    msg.textContent = "Rolling...";
    multiDisplay.classList.add('hidden'); // Sembunyikan multiplier lama
    
    btn.disabled = true;
    btn.innerHTML = '<span class="animate-spin">🌀</span> SEDANG MEMUTAR...';
    btn.classList.add('opacity-70', 'cursor-not-allowed');

    // 4. Animasi Rolling (Visual Saja)
    let interval = setInterval(() => {
        document.querySelectorAll('.slot-cell-content').forEach(c => c.textContent = getRandomSymbol().icon);
    }, 80);

    // 5. Stop Rolling & Tentukan Hasil
    setTimeout(() => {
        clearInterval(interval);
        board.classList.remove('is-spinning');
        
        finalizeSpin(totalBet); // Proses logika menang & update DB
        
        isSpinning = false;
        btn.disabled = false;
        btn.innerHTML = '<span class="group-hover:rotate-180 transition-transform">🔄</span> PUTAR SEKARANG';
        btn.classList.remove('opacity-70', 'cursor-not-allowed');
    }, 1000); // Durasi putar 1 detik
};

// Hitung Hasil Akhir
function finalizeSpin(totalBetUsed) {
    const cells = document.querySelectorAll('.slot-cell-content');
    const resultCounts = {}; 
    
    // Generate Simbol Final
    cells.forEach((cell, index) => {
        const symbol = getRandomSymbol();
        cell.textContent = symbol.icon;
        
        // Reset highlight menang
        cell.parentElement.classList.remove('slot-win');

        // Hitung Kemunculan
        if (!resultCounts[symbol.id]) {
            resultCounts[symbol.id] = { count: 0, icon: symbol.icon, indices: [] };
        }
        resultCounts[symbol.id].count++;
        resultCounts[symbol.id].indices.push(index);
    });

    // Cek Menang/Kalah
    checkWinCondition(resultCounts, totalBetUsed);
}

// Logika Perhitungan Uang Menang
function checkWinCondition(counts, totalBetUsed) {
    let winMultiplier = 0; // Total pengali kemenangan (x Bet Dasar)
    let winText = "";
    let hasWin = false;
    let bombMult = 0;

    // 1. Cek Bomb
    if (counts['bomb']) {
        bombMult = counts['bomb'].count * 10; // 1 Bomb = x10
    }

    // 2. Cek Scatter (Free Spin Trigger)
    if (counts['scatter'] && counts['scatter'].count >= 4) {
        winMultiplier += 10; // Scatter bayar 10x Bet
        winText = "SCATTER PECAH! (x10)";
        highlightCells(counts['scatter'].indices);
        hasWin = true;
    }

    // 3. Cek Simbol Buah (Minimal 8)
    for (const key in counts) {
        if (key === 'bomb' || key === 'scatter') continue;
        const data = counts[key];
        
        if (data.count >= 8) {
            hasWin = true;
            highlightCells(data.indices);
            
            // Rumus Dasar Sweet Bonanza (Sederhana)
            // 8-9 simbol: Kecil
            // 10-11 simbol: Sedang
            // 12+ simbol: Besar
            let baseMult = 0.2; 
            if(data.count >= 10) baseMult = 0.5;
            if(data.count >= 12) baseMult = 1.0;

            // Simbol Mahal (Heart, Purple) bayar lebih mahal
            if (key === 'heart') baseMult *= 10; 
            else if (key === 'purplegem') baseMult *= 5;
            else if (key === 'greengem') baseMult *= 3;
            else if (key === 'bluegem') baseMult *= 2;

            winMultiplier += baseMult;
            if(!winText) winText = `${data.count}x ${data.icon}`;
        }
    }

    // 4. Terapkan Bomb Multiplier
    if (hasWin && bombMult > 0) {
        winMultiplier = winMultiplier * bombMult;
        
        // Tampilkan animasi Bomb
        const multiDisp = document.getElementById('multiplier-display');
        multiDisp.textContent = `x${bombMult}`;
        multiDisp.classList.remove('hidden', 'scale-0');
        multiDisp.classList.add('scale-100');
        
        // Sembunyikan lagi setelah 2 detik
        setTimeout(() => {
            multiDisp.classList.add('scale-0');
            setTimeout(() => multiDisp.classList.add('hidden'), 300);
        }, 2000);
    }

    // 5. Hitung Nominal Uang (Bet Dasar x Multiplier)
    // Catatan: Meskipun Buy Spin bayar 100x, kemenangan dikali dari Bet Dasar (200, bukan 20.000)
    let moneyWon = Math.floor(currentBet * winMultiplier);

    // Update UI Hasil
    const msg = document.getElementById('win-message');
    if (hasWin && moneyWon > 0) {
        msg.innerHTML = `GACOR! ${winText}<br><span class="text-yellow-300 text-xl font-bold drop-shadow-md">WIN: Rp ${moneyWon.toLocaleString()}</span>`;
        msg.classList.add('text-green-400');
        
        // Suara Menang (Opsional)
        // playWinSound();
    } else {
        msg.textContent = "Belum pecah, coba lagi!";
        msg.classList.remove('text-green-400');
        moneyWon = 0;
    }

    // 6. Update Variable Global & Kirim ke Database
    currentWinAmount = moneyWon;
    calculateTotal(); // Update tampilan kalkulator sisa
    
    // PENTING: Update Saldo di Database (Bet dipotong, Menang ditambah)
    updateDatabaseSaldo(totalBetUsed, moneyWon);
}

// Helper: Highlight Kotak
function highlightCells(indices) {
    const cells = document.querySelectorAll('.slot-cell');
    indices.forEach(index => {
        cells[index].classList.add('slot-win');
    });
}

// =========================================================
// 5. UTILITY & EVENT LISTENER
// =========================================================

// Shortcut Tombol SPASI
document.addEventListener('keydown', (e) => {
    if (e.code === 'Space') {
        e.preventDefault(); 
        spinSlot();
    }
});

// Toggle Musik Background
function toggleMusic() {
    const music = document.getElementById('background-music');
    const btn = document.getElementById('music-button');
    
    if (music.paused) {
        music.play().catch(e => alert("Klik interaksi dulu baru bisa play musik!"));
        btn.textContent = "🔊";
        btn.classList.remove('animate-bounce');
    } else {
        music.pause();
        btn.textContent = "🔇";
    }
}