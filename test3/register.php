<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");

require 'koneksi.php';

$json = file_get_contents("php://input");
$data = json_decode($json);

$username = '';
$password = '';

// Ambil data (support JSON dan Form Data)
if (isset($data->username) && isset($data->password)) {
    $username = trim($data->username);
    $password = trim($data->password);
} else if (isset($_POST['username']) && isset($_POST['password'])) {
    $username = trim($_POST['username']);
    $password = trim($_POST['password']);
} else {
    echo json_encode(["status" => "error", "message" => "Data tidak lengkap!"]);
    exit();
}

if (empty($username) || empty($password)) {
    echo json_encode(["status" => "error", "message" => "Username dan password wajib diisi!"]);
    exit();
}

// 1. Cek Duplikasi dengan Prepared Statement (Aman)
$stmt = $conn->prepare("SELECT id FROM users WHERE username = ?");
$stmt->bind_param("s", $username);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows > 0) {
    echo json_encode(["status" => "error", "message" => "Username sudah terdaftar!"]);
} else {
    // 2. Hashing & Insert dengan Prepared Statement
    $hashed_password = password_hash($password, PASSWORD_DEFAULT);
    
    $insert_stmt = $conn->prepare("INSERT INTO users (username, password) VALUES (?, ?)");
    $insert_stmt->bind_param("ss", $username, $hashed_password);
    
    if ($insert_stmt->execute()) {
        echo json_encode(["status" => "success", "message" => "Akun berhasil dibuat! Silakan login."]);
    } else {
        echo json_encode(["status" => "error", "message" => "Gagal mendaftar: " . $conn->error]);
    }
    $insert_stmt->close();
}

$stmt->close();
mysqli_close($conn);
?>