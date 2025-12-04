<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");

require 'koneksi.php';

$data = json_decode(file_get_contents("php://input"));

$username = '';
$password = '';

if (isset($data->username) && isset($data->password)) {
    $username = $data->username;
    $password = $data->password;
} else if (isset($_POST['username']) && isset($_POST['password'])) {
    $username = $_POST['username'];
    $password = $_POST['password'];
} else {
    echo json_encode(["status" => "error", "message" => "Data tidak lengkap!"]);
    exit();
}

// Query aman menggunakan Prepared Statement
$stmt = $conn->prepare("SELECT id, username, password FROM users WHERE username = ?");
$stmt->bind_param("s", $username);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows > 0) {
    $row = $result->fetch_assoc();
    
    // Verifikasi hash password
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

$stmt->close();
mysqli_close($conn);
?>