<?php
require_once 'conexao.php';

$action = $_GET['action'] ?? '';

try {
    switch ($action) {
        case 'adicionar':
            $data = json_decode(file_get_contents('php://input'), true);
            
            $stmt = $conexao->prepare("INSERT INTO dependentes (cliente_id, nome, data_nascimento, parentesco) VALUES (:cliente_id, :nome, :data_nascimento, :parentesco)");
            $stmt->bindValue(':cliente_id', 1); // ID fixo para exemplo
            $stmt->bindParam(':nome', $data['nome']);
            $stmt->bindParam(':data_nascimento', $data['data_nascimento']);
            $stmt->bindParam(':parentesco', $data['parentesco']);
            $stmt->execute();
            
            echo json_encode(['success' => true, 'id' => $conexao->lastInsertId()]);
            break;
            
        case 'listar':
            $stmt = $conexao->prepare("SELECT * FROM dependentes WHERE cliente_id = :cliente_id");
            $stmt->bindValue(':cliente_id', 1); // ID fixo para exemplo
            $stmt->execute();
            $dependentes = $stmt->fetchAll(PDO::FETCH_ASSOC);
            echo json_encode($dependentes);
            break;
            
        default:
            echo json_encode(['success' => false, 'message' => 'Ação inválida']);
    }
} catch (PDOException $e) {
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
?>