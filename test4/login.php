<?php
// Izinkan akses dari mana saja (CORS) - Penting untuk testing
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");

// Koneksi Database
require 'koneksi.php';

// Ambil input (mendukung JSON Raw & Form Data)
$json = file_get_contents("php://input");
$data = json_decode($json);

$username = '';
$password = '';

// Cek apakah data dikirim via JSON (fetch JS)
if (isset($data->username) && isset($data->password)) {
    $username = mysqli_real_escape_string($conn, $data->username);
    $password = mysqli_real_escape_string($conn, $data->password);
} 
// Cek apakah data dikirim via Form POST biasa
else if (isset($_POST['username']) && isset($_POST['password'])) {
    $username = mysqli_real_escape_string($conn, $_POST['username']);
    $password = mysqli_real_escape_string($conn, $_POST['password']);
} 
else {
    echo json_encode(["status" => "error", "message" => "Data tidak lengkap!"]);
    exit();
}

// Validasi kosong
if(empty($username) || empty($password)){
    echo json_encode(["status" => "error", "message" => "Username dan Password wajib diisi!"]);
    exit();
}

// Query Cari User
$query = "SELECT * FROM users WHERE username = '$username'";
$result = mysqli_query($conn, $query);

if (mysqli_num_rows($result) > 0) {
    $row = mysqli_fetch_assoc($result);
    
    // Verifikasi Hash Password
    if (password_verify($password, $row['password'])) {
        echo json_encode([
            "status" => "success", 
            "message" => "Login berhasil!",
            "user_id" => $row['id'],
            "username" => $row['username']
        ]);
    } else {
        echo json_encode(["status" => "error", "message" => "Password salah!"]);
    }
} else {
    echo json_encode(["status" => "error", "message" => "Username tidak ditemukan!"]);
}

mysqli_close($conn);
?>