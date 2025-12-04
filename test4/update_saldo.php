<?php
// update_saldo.php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
require 'koneksi.php';

$json = file_get_contents("php://input");
$data = json_decode($json);

if (isset($data->user_id) && isset($data->bet) && isset($data->win)) {
    $id = mysqli_real_escape_string($conn, $data->user_id);
    $bet = floatval($data->bet);
    $win = floatval($data->win);

    // Hitung perubahan saldo (Menang - Taruhan)
    // Jika tidak menang, win = 0, jadi saldo berkurang sebesar bet
    $perubahan = $win - $bet;

    // Update Database
    $query = "UPDATE users SET saldo = saldo + ($perubahan) WHERE id = '$id'";
    
    if (mysqli_query($conn, $query)) {
        // Ambil saldo terbaru untuk dikembalikan ke JS
        $cek = mysqli_query($conn, "SELECT saldo FROM users WHERE id = '$id'");
        $row = mysqli_fetch_assoc($cek);
        
        echo json_encode([
            "status" => "success", 
            "new_saldo" => floatval($row['saldo']),
            "message" => "Transaksi berhasil"
        ]);
    } else {
        echo json_encode(["status" => "error", "message" => mysqli_error($conn)]);
    }
} else {
    echo json_encode(["status" => "error", "message" => "Data tidak lengkap"]);
}
?>