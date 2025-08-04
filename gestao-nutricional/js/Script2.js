// Funções para manipulação do banco de dados
async function carregarDependentes() {
    try {
        const response = await fetch('php/dependentes.php?action=listar');
        const dependentes = await response.json();
        
        const tabela = document.getElementById('dependentsTableBody');
        const emptyMsg = document.getElementById('dependentesListaVazia');
        const table = document.getElementById('dependentsTable');
        
        tabela.innerHTML = '';
        
        if (dependentes.length > 0) {
            emptyMsg.style.display = 'none';
            table.style.display = 'table';
            
            dependentes.forEach(dependente => {
                const idade = calcularIdade(dependente.data_nascimento);
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${dependente.nome}</td>
                    <td>${idade} anos</td>
                    <td>${dependente.parentesco}</td>
                    <td>
                        <button class="button btn-view-consults" data-id="${dependente.id}" data-nome="${dependente.nome}">Ver Consultas</button>
                        <button class="button btn-calculate-imc" data-id="${dependente.id}" data-nome="${dependente.nome}">Calcular IMC</button>
                    </td>
                `;
                tabela.appendChild(tr);
            });
        } else {
            emptyMsg.style.display = 'block';
            table.style.display = 'none';
        }
    } catch (error) {
        console.error('Erro ao carregar dependentes:', error);
        alert('Erro ao carregar lista de dependentes');
    }
}

async function carregarHistoricoIMC() {
    try {
        const response = await fetch('php/imc.php?action=listar');
        const historico = await response.json();
        
        const tabela = document.getElementById('imcHistoryTableBody');
        const emptyMsg = document.getElementById('imcListaVazia');
        const table = document.getElementById('imcHistoryTable');
        
        tabela.innerHTML = '';
        
        if (historico.length > 0) {
            emptyMsg.style.display = 'none';
            table.style.display = 'table';
            
            // Ordenar por data mais recente primeiro
            historico.sort((a, b) => new Date(b.data_calculo) - new Date(a.data_calculo));
            
            historico.forEach(item => {
                const data = formatarData(item.data_calculo);
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${data}</td>
                    <td>${item.nome_dependente}</td>
                    <td>${parseFloat(item.valor_imc).toFixed(2)}</td>
                    <td class="${getClasseIMC(item.classificacao)}">${item.classificacao}</td>
                `;
                tabela.appendChild(tr);
            });
        } else {
            emptyMsg.style.display = 'block';
            table.style.display = 'none';
        }
    } catch (error) {
        console.error('Erro ao carregar histórico de IMC:', error);
        alert('Erro ao carregar histórico de IMC');
    }
}

async function carregarConsultas(dependenteId) {
    try {
        const response = await fetch(`php/consultas.php?action=listar&dependente_id=${dependenteId}`);
        const consultas = await response.json();
        
        // Ordenar consultas por data (mais recente primeiro)
        return consultas.sort((a, b) => new Date(b.data_consulta) - new Date(a.data_consulta));
    } catch (error) {
        console.error('Erro ao carregar consultas:', error);
        return [];
    }
}

// Funções utilitárias
function calcularIdade(dataNascimento) {
    if (!dataNascimento) return 'N/A';
    
    const hoje = new Date();
    const nascimento = new Date(dataNascimento);
    let idade = hoje.getFullYear() - nascimento.getFullYear();
    const mes = hoje.getMonth() - nascimento.getMonth();
    
    if (mes < 0 || (mes === 0 && hoje.getDate() < nascimento.getDate())) {
        idade--;
    }
    
    return idade;
}

function formatarData(dataString) {
    if (!dataString) return 'N/A';
    const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
    return new Date(dataString).toLocaleDateString('pt-BR', options);
}

function classificarIMC(imc) {
    if (imc < 18.5) return 'Abaixo do peso';
    if (imc < 24.9) return 'Peso normal';
    if (imc < 29.9) return 'Sobrepeso';
    if (imc < 34.9) return 'Obesidade Grau I';
    if (imc < 39.9) return 'Obesidade Grau II';
    return 'Obesidade Grau III';
}

function getClasseIMC(classificacao) {
    // Retorna a classe CSS baseada na classificação do IMC
    switch(classificacao) {
        case 'Abaixo do peso': return 'abaixo-peso';
        case 'Peso normal': return 'peso-normal';
        case 'Sobrepeso': return 'sobrepeso';
        case 'Obesidade Grau I':
        case 'Obesidade Grau II':
        case 'Obesidade Grau III':
            return 'obesidade';
        default: return '';
    }
}

// Event Listeners
document.getElementById('dependentForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const nome = document.getElementById('nomeDependente').value.trim();
    const dataNascimento = document.getElementById('dataNascimento').value;
    const parentesco = document.getElementById('parentesco').value;
    
    if (!nome || !dataNascimento || !parentesco) {
        alert('Preencha todos os campos obrigatórios');
        return;
    }

    try {
        const response = await fetch('php/dependentes.php?action=adicionar', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                nome, 
                data_nascimento: dataNascimento, 
                parentesco
            })
        });
        
        const result = await response.json();
        
        if (result.success) {
            this.reset();
            await carregarDependentes();
        } else {
            alert('Erro: ' + (result.message || 'Falha ao adicionar dependente'));
        }
    } catch (error) {
        console.error('Erro ao adicionar dependente:', error);
        alert('Erro ao conectar com o servidor');
    }
});

document.addEventListener('click', async function(e) {
    // Ver Consultas
    if (e.target.classList.contains('btn-view-consults')) {
        const dependenteId = e.target.dataset.id;
        const dependenteNome = e.target.dataset.nome;
        
        document.getElementById('modalDependentId').value = dependenteId;
        document.getElementById('consultaModalTitle').textContent = `Consultas de ${dependenteNome}`;
        
        const consultas = await carregarConsultas(dependenteId);
        const historyDiv = document.getElementById('modalConsultaHistory');
        historyDiv.innerHTML = '';
        
        if (consultas.length > 0) {
            const table = document.createElement('table');
            table.className = 'data-table';
            table.innerHTML = `
                <thead>
                    <tr>
                        <th>Data</th>
                        <th>Observações</th>
                    </tr>
                </thead>
                <tbody></tbody>
            `;
            
            const tbody = table.querySelector('tbody');
            consultas.forEach(consulta => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${formatarData(consulta.data_consulta)}</td>
                    <td>${consulta.observacoes || 'Sem observações'}</td>
                `;
                tbody.appendChild(tr);
            });
            
            historyDiv.appendChild(table);
        } else {
            historyDiv.innerHTML = '<p class="empty-message">Nenhuma consulta registrada</p>';
        }
        
        document.getElementById('consultaModal').style.display = 'block';
    }
    
    // Calcular IMC
    if (e.target.classList.contains('btn-calculate-imc')) {
        const dependenteId = e.target.dataset.id;
        const dependenteNome = e.target.dataset.nome;
        
        document.getElementById('imcDependentId').value = dependenteId;
        document.getElementById('imcModalTitle').textContent = `Calcular IMC para ${dependenteNome}`;
        document.getElementById('imcModalResult').style.display = 'none';
        document.getElementById('imcModal').style.display = 'block';
    }
    
    // Fechar modais
    if (e.target.id === 'closeConsultaModal' || e.target.id === 'closeImcModal') {
        document.getElementById('consultaModal').style.display = 'none';
        document.getElementById('imcModal').style.display = 'none';
    }
});

document.getElementById('modalConsultaForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const dependenteId = document.getElementById('modalDependentId').value;
    const dataConsulta = document.getElementById('modalDataConsulta').value;
    const observacoes = document.getElementById('modalObsConsulta').value.trim();
    
    if (!dataConsulta) {
        alert('A data da consulta é obrigatória');
        return;
    }

    try {
        const response = await fetch('php/consultas.php?action=adicionar', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                dependente_id: dependenteId,
                data_consulta: dataConsulta,
                observacoes: observacoes || 'Sem observações'
            })
        });
        
        const result = await response.json();
        
        if (result.success) {
            this.reset();
            // Recarregar histórico de consultas
            const consultas = await carregarConsultas(dependenteId);
            const historyDiv = document.getElementById('modalConsultaHistory');
            historyDiv.innerHTML = '';
            
            if (consultas.length > 0) {
                const table = document.createElement('table');
                table.className = 'data-table';
                table.innerHTML = `
                    <thead>
                        <tr>
                            <th>Data</th>
                            <th>Observações</th>
                        </tr>
                    </thead>
                    <tbody></tbody>
                `;
                
                const tbody = table.querySelector('tbody');
                consultas.forEach(consulta => {
                    const tr = document.createElement('tr');
                    tr.innerHTML = `
                        <td>${formatarData(consulta.data_consulta)}</td>
                        <td>${consulta.observacoes || 'Sem observações'}</td>
                    `;
                    tbody.appendChild(tr);
                });
                
                historyDiv.appendChild(table);
            } else {
                historyDiv.innerHTML = '<p class="empty-message">Nenhuma consulta registrada</p>';
            }
        } else {
            alert('Erro: ' + (result.message || 'Falha ao adicionar consulta'));
        }
    } catch (error) {
        console.error('Erro ao adicionar consulta:', error);
        alert('Erro ao conectar com o servidor');
    }
});

document.getElementById('imcModalForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const dependenteId = document.getElementById('imcDependentId').value;
    const altura = parseFloat(document.getElementById('modalAltura').value.replace(',', '.'));
    const peso = parseFloat(document.getElementById('modalPeso').value.replace(',', '.'));
    
    if (isNaN(altura) || isNaN(peso) || altura <= 0 || peso <= 0) {
        alert('Informe valores válidos para altura e peso');
        return;
    }

    const imc = peso / (altura * altura);
    const classificacao = classificarIMC(imc);
    
    try {
        const response = await fetch('php/imc.php?action=adicionar', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                dependente_id: dependenteId,
                valor_imc: imc,
                classificacao
            })
        });
        
        const result = await response.json();
        
        if (result.success) {
            // Mostrar resultado
            const resultDiv = document.getElementById('imcModalResult');
            resultDiv.innerHTML = `
                <div class="imc-result">
                    <h3>Resultado do IMC</h3>
                    <p><strong>Valor:</strong> <span class="${getClasseIMC(classificacao)}">${imc.toFixed(2)}</span></p>
                    <p><strong>Classificação:</strong> <span class="${getClasseIMC(classificacao)}">${classificacao}</span></p>
                </div>
            `;
            resultDiv.style.display = 'block';
            
            // Atualizar histórico
            await carregarHistoricoIMC();
            
            // Limpar formulário (opcional)
            // this.reset();
        } else {
            alert('Erro: ' + (result.message || 'Falha ao salvar IMC'));
        }
    } catch (error) {
        console.error('Erro ao salvar IMC:', error);
        alert('Erro ao conectar com o servidor');
    }
});

// Limpar dados
document.getElementById('btnClearStorage').addEventListener('click', async function() {
    if (confirm('Tem certeza que deseja limpar TODOS os dados?\nEsta ação não pode ser desfeita.')) {
        try {
            const response = await fetch('php/limpar_dados.php', {
                method: 'POST'
            });
            
            const result = await response.json();
            
            if (result.success) {
                alert(result.message);
                // Recarregar a página para refletir os dados vazios
                window.location.reload();
            } else {
                alert('Erro: ' + (result.message || 'Falha ao limpar dados'));
            }
        } catch (error) {
            console.error('Erro ao limpar dados:', error);
            alert('Erro ao conectar com o servidor');
        }
    }
});

// Inicialização
window.addEventListener('DOMContentLoaded', async () => {
    await carregarDependentes();
    await carregarHistoricoIMC();
});