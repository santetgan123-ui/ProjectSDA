<?php
// --- Header Konfigurasi ---
// Mengizinkan akses lintas domain (CORS) & format JSON
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");

// --- Koneksi Database ---
// Pastikan file koneksi.php sudah benar di folder yang sama
require 'koneksi.php';

// --- Ambil Data Input ---
// Mendukung JSON Raw (dari fetch JS) dan Form Data biasa
$json = file_get_contents("php://input");
$data = json_decode($json);

$username = '';
$password = '';

if (isset($data->username) && isset($data->password)) {
    // Jika data dikirim via JSON
    $username = mysqli_real_escape_string($conn, $data->username);
    $password = mysqli_real_escape_string($conn, $data->password);
} else if (isset($_POST['username']) && isset($_POST['password'])) {
    // Jika data dikirim via Form POST standar
    $username = mysqli_real_escape_string($conn, $_POST['username']);
    $password = mysqli_real_escape_string($conn, $_POST['password']);
} else {
    // Jika data kosong
    echo json_encode(["status" => "error", "message" => "Data tidak lengkap!"]);
    exit();
}

// --- Validasi Input ---
if (empty($username) || empty($password)) {
    echo json_encode(["status" => "error", "message" => "Username dan password wajib diisi!"]);
    exit();
}

// --- Cek Duplikasi Username ---
// Mengecek apakah username sudah diambil orang lain
$check_query = "SELECT id FROM users WHERE username = '$username'";
$check_result = mysqli_query($conn, $check_query);

if (mysqli_num_rows($check_result) > 0) {
    echo json_encode(["status" => "error", "message" => "Username sudah dipakai, cari yang lain!"]);
} else {
    // --- Proses Pendaftaran ---
    
    // 1. Enkripsi Password (Hashing) agar aman
    $hashed_password = password_hash($password, PASSWORD_DEFAULT);

    // 2. Simpan ke Database
    $insert_query = "INSERT INTO users (username, password) VALUES ('$username', '$hashed_password')";
    
    if (mysqli_query($conn, $insert_query)) {
        // Berhasil
        echo json_encode(["status" => "success", "message" => "Akun berhasil dibuat! Mengalihkan..."]);
    } else {
        // Gagal Query
        echo json_encode(["status" => "error", "message" => "Gagal database: " . mysqli_error($conn)]);
    }
}

// Tutup koneksi
mysqli_close($conn);
?>