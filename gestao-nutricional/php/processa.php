<?php
require 'conexao.php';

header('Content-Type: application/json');

$action = $_GET['action'] ?? ($_POST['action'] ?? '');

try {
    switch ($action) {
        case 'getDependentes':
            $stmt = $conexao->query("SELECT *, (SELECT COUNT(*) FROM consultas WHERE dependente_id = dependentes.id) AS consultas_count FROM dependentes");
            echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
            break;
            
        case 'addDependente':
            $data = json_decode(file_get_contents('php://input'), true)['data'];
            $stmt = $conexao->prepare("INSERT INTO dependentes (nome, nascimento, parentesco) VALUES (?, ?, ?)");
            $stmt->execute([$data['nome'], $data['nascimento'], $data['parentesco']]);
            echo json_encode(['success' => true, 'id' => $conexao->lastInsertId()]);
            break;
            
        // ... outros casos ...
            
        default:
            echo json_encode(['error' => 'Ação não reconhecida']);
    }
} catch (Exception $e) {
    echo json_encode(['error' => $e->getMessage()]);
}
?>