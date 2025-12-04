<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

require 'koneksi.php';

// Ambil ID dari parameter URL (misal: get_profile.php?id=1)
if (isset($_GET['id'])) {
    $id = mysqli_real_escape_string($conn, $_GET['id']);

    // Pastikan kolom 'saldo' sudah ada di tabel users Anda!
    // Jika belum, jalankan SQL: ALTER TABLE users ADD COLUMN saldo DECIMAL(15,2) DEFAULT 0;
    $query = "SELECT username, saldo FROM users WHERE id = '$id'";
    $result = mysqli_query($conn, $query);

    if (mysqli_num_rows($result) > 0) {
        $row = mysqli_fetch_assoc($result);
        echo json_encode([
            "status" => "success",
            "username" => $row['username'],
            "saldo" => floatval($row['saldo']) // Pastikan format angka
        ]);
    } else {
        echo json_encode(["status" => "error", "message" => "User tidak ditemukan"]);
    }
} else {
    echo json_encode(["status" => "error", "message" => "ID tidak valid"]);
}
?>