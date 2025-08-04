<?php
require_once 'conexao.php';

header('Content-Type: application/json'); // Define o tipo de retorno

$action = $_GET['action'] ?? '';
$cliente_id = 1; // Em um sistema real, isso viria da sessão

try {
    switch ($action) {
        case 'adicionar':
            $data = json_decode(file_get_contents('php://input'), true);
            
            // Validação básica
            if (empty($data['dependente_id']) || !isset($data['valor_imc']) || empty($data['classificacao'])) {
                throw new Exception('Dados incompletos');
            }
            
            $stmt = $conexao->prepare("INSERT INTO historico_imc (dependente_id, valor_imc, classificacao) VALUES (:dependente_id, :valor_imc, :classificacao)");
            $stmt->bindParam(':dependente_id', $data['dependente_id'], PDO::PARAM_INT);
            $stmt->bindParam(':valor_imc', $data['valor_imc'], PDO::PARAM_STR);
            $stmt->bindParam(':classificacao', $data['classificacao'], PDO::PARAM_STR);
            $stmt->execute();
            
            echo json_encode([
                'success' => true,
                'id' => $conexao->lastInsertId(),
                'data_calculo' => date('Y-m-d H:i:s') // Retorna a data formatada
            ]);
            break;
            
        case 'listar':
            $stmt = $conexao->prepare("
                SELECT 
                    h.id,
                    h.dependente_id,
                    h.valor_imc,
                    h.classificacao,
                    DATE_FORMAT(h.data_calculo, '%Y-%m-%d %H:%i:%s') AS data_calculo,
                    d.nome AS nome_dependente 
                FROM historico_imc h
                JOIN dependentes d ON h.dependente_id = d.id
                WHERE d.cliente_id = :cliente_id
                ORDER BY h.data_calculo DESC
            ");
            $stmt->bindParam(':cliente_id', $cliente_id, PDO::PARAM_INT);
            $stmt->execute();
            $historico = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            echo json_encode($historico);
            break;
            
        default:
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Ação inválida']);
    }
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Erro no banco de dados: ' . $e->getMessage()]);
} catch (Exception $e) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
?>