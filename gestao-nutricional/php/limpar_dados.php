<?php
require_once 'conexao.php';

try {
    // Desativar verificação de chaves estrangeiras temporariamente
    $conexao->exec("SET FOREIGN_KEY_CHECKS = 0");
    
    // Limpar todas as tabelas
    $conexao->exec("TRUNCATE TABLE consultas");
    $conexao->exec("TRUNCATE TABLE historico_imc");
    $conexao->exec("TRUNCATE TABLE dependentes");
    
    // Reativar verificação de chaves
    $conexao->exec("SET FOREIGN_KEY_CHECKS = 1");
    
    echo json_encode(['success' => true, 'message' => 'Todos os dados foram removidos']);
} catch (PDOException $e) {
    echo json_encode(['success' => false, 'message' => 'Erro ao limpar dados: ' . $e->getMessage()]);
}
?>