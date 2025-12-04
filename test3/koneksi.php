<?php
$host = "localhost";
$user = "root";
$pass = "";
$db   = "kalcerweb";

$conn = mysqli_connect($host, $user, $pass, $db);

if (!$conn) {
    die("Koneksi gagal: " . mysqli_connect_error());
}

// Optimasi: Set charset agar karakter khusus/emoji tidak error
mysqli_set_charset($conn, "utf8mb4");
?>