<?php
// Conexão com o banco de dados
require_once 'php/conexao.php';

// Configurar cliente principal (em um sistema real, isso viria de login)
$cliente_id = 1;
?>
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Painel do Cliente</title>
    <link rel="stylesheet" href="css/Style2.css">
</head>
<body>
    <div class="container">
        <h1>Painel do Cliente</h1>
        <p class="client-info">Cliente Vinculado: <strong>Márcia Nutricionista</strong></p>

        <div class="form-section">
            <div class="section-header">
                <h2>Histórico de IMC</h2>
            </div>
            <p id="imcListaVazia" class="empty-list-message">Nenhum IMC foi calculado.</p>
            <table id="imcHistoryTable" class="data-table" style="display:none;">
                <thead><tr><th>Data</th><th>Nome</th><th>IMC</th><th>Classificação</th></tr></thead>
                <tbody id="imcHistoryTableBody"></tbody>
            </table>
        </div>
        
        <div class="form-section">
            <div class="section-header">
                <h2>Dependentes Cadastrados</h2>
            </div>
            <form id="dependentForm">
                <div class="form-grid">
                    <div class="form-group"><label for="nomeDependente" class="required">Nome do Dependente</label><input type="text" id="nomeDependente" required></div>
                    <div class="form-group"><label for="dataNascimento" class="required">Data de Nascimento</label><input type="date" id="dataNascimento" required></div>
                    <div class="form-group">
                        <label for="parentesco" class="required">Grau de Parentesco</label>
                        <select id="parentesco" required>
                            <option value="">Selecione...</option>
                            <option value="Filho(a)">Filho(a)</option>
                            <option value="Cônjuge">Cônjuge</option>
                            <option value="Pai">Pai</option>
                            <option value="Mãe">Mãe</option>
                            <option value="Outro">Outro</option>
                        </select>
                    </div>
                    <div class="form-group"><button type="submit" class="button btn-add">+ Adicionar Dependente</button></div>
                </div>
            </form>
            <p id="dependentesListaVazia" class="empty-list-message">Nenhum dependente cadastrado.</p>
            <table id="dependentsTable" class="data-table" style="display:none;">
                <thead><tr><th>Nome</th><th>Idade</th><th>Parentesco</th><th>Ações</th></tr></thead>
                <tbody id="dependentsTableBody"></tbody>
            </table>
        </div>

        <div class="main-actions">
            <a href="http://localhost/gestao-nutricional/Tela1.html" class="button btn-back">Voltar ao Início</a>
            <button type="button" class="button btn-clear-storage" id="btnClearStorage">Limpar Todos os Dados 🧹</button>
        </div>
    </div>

    <div id="consultaModal" class="modal">
        <div class="modal-content">
            <div class="modal-header">
                <h3 id="consultaModalTitle"></h3>
                <span class="close-button" id="closeConsultaModal">&times;</span>
            </div>
            <div class="modal-body">
                <form id="modalConsultaForm">
                    <input type="hidden" id="modalDependentId">
                    <div class="form-group">
                        <label for="modalDataConsulta" class="required">Data da Consulta</label>
                        <input type="date" id="modalDataConsulta" required>
                    </div>
                    <div class="form-group">
                        <label for="modalObsConsulta">Observações</label>
                        <textarea id="modalObsConsulta" rows="3" placeholder="Ex: Apresentou melhora no apetite..."></textarea>
                    </div>
                    <button type="submit" class="button btn-add" style="width:100%;">Salvar Consulta</button>
                </form>
                <hr style="margin: 25px 0;">
                <h4>Histórico de Consultas</h4>
                <div id="modalConsultaHistory"></div>
            </div>
        </div>
    </div>

    <div id="imcModal" class="modal">
        <div class="modal-content">
            <div class="modal-header">
                <h3 id="imcModalTitle"></h3>
                <span class="close-button" id="closeImcModal">&times;</span>
            </div>
            <div class="modal-body">
                <form id="imcModalForm">
                    <input type="hidden" id="imcDependentId">
                    <div class="form-group">
                        <label for="modalAltura" class="required">Altura (em metros)</label>
                        <input type="number" id="modalAltura" step="0.01" placeholder="Ex: 1.65" required>
                    </div>
                    <div class="form-group">
                        <label for="modalPeso" class="required">Peso (em kg)</label>
                        <input type="number" id="modalPeso" step="0.1" placeholder="Ex: 68.5" required>
                    </div>
                    <button type="submit" class="button btn-imc" style="width:100%;">Calcular e Salvar IMC</button>
                </form>
                <div id="imcModalResult" style="display:none;"></div>
            </div>
        </div>
    </div>
    <script src="js/Script2.js"></script>
</body>
</html>