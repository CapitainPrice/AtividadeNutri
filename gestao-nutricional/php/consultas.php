<?php
require_once 'conexao.php';

$action = $_GET['action'] ?? '';
$dependente_id = $_GET['dependente_id'] ?? 0;

try {
    switch ($action) {
        case 'adicionar':
            $data = json_decode(file_get_contents('php://input'), true);
            
            $stmt = $conexao->prepare("INSERT INTO consultas (dependente_id, data_consulta, observacoes) VALUES (:dependente_id, :data_consulta, :observacoes)");
            $stmt->bindParam(':dependente_id', $data['dependente_id']);
            $stmt->bindParam(':data_consulta', $data['data_consulta']);
            $stmt->bindParam(':observacoes', $data['observacoes']);
            $stmt->execute();
            
            echo json_encode(['success' => true, 'id' => $conexao->lastInsertId()]);
            break;
            
        case 'listar':
            $stmt = $conexao->prepare("SELECT * FROM consultas WHERE dependente_id = :dependente_id ORDER BY data_consulta DESC");
            $stmt->bindParam(':dependente_id', $dependente_id);
            $stmt->execute();
            $consultas = $stmt->fetchAll(PDO::FETCH_ASSOC);
            echo json_encode($consultas);
            break;
            
        default:
            echo json_encode(['success' => false, 'message' => 'Ação inválida']);
    }
} catch (PDOException $e) {
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
?>