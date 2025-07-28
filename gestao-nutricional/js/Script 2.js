document.addEventListener('DOMContentLoaded', () => {
    const API_URL = 'php/processa.php';

    // Funções para comunicação com o backend
    const api = {
        // Pacientes
        getDependentes: async () => {
            const response = await fetch(`${API_URL}?action=getDependentes`);
            return await response.json();
        },
        addDependente: async (dependente) => {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    action: 'addDependente',
                    data: dependente 
                })
            });
            return await response.json();
        },
        deleteDependente: async (id) => {
            const response = await fetch(`${API_URL}?action=deleteDependente&id=${id}`);
            return await response.json();
        },

        // Consultas
        getConsultas: async (dependenteId) => {
            const response = await fetch(`${API_URL}?action=getConsultas&id=${dependenteId}`);
            return await response.json();
        },
        addConsulta: async (consulta) => {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    action: 'addConsulta',
                    data: consulta 
                })
            });
            return await response.json();
        },

        // IMC
        getIMCHistory: async () => {
            const response = await fetch(`${API_URL}?action=getIMCHistory`);
            return await response.json();
        },
        addIMC: async (imcData) => {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    action: 'addIMC',
                    data: imcData 
                })
            });
            return await response.json();
        }
    };

    // Funções de manipulação da UI
    const renderizarTabelaDependentes = async () => {
        try {
            const dependentes = await api.getDependentes();
            const tableBody = document.getElementById('dependentsTableBody');
            const table = document.getElementById('dependentsTable');
            const emptyMsg = document.getElementById('dependentesListaVazia');
            
            tableBody.innerHTML = '';
            
            if (dependentes.length === 0) {
                emptyMsg.style.display = 'block';
                table.style.display = 'none';
                return;
            }
            
            emptyMsg.style.display = 'none';
            table.style.display = 'table';
            
            dependentes.forEach((dep) => {
                const tr = document.createElement('tr');
                const idade = dep.nascimento ? new Date().getFullYear() - new Date(dep.nascimento).getFullYear() : 'N/A';
                tr.innerHTML = `
                    <td>${dep.nome}</td>
                    <td>${idade}</td>
                    <td>${dep.parentesco}</td>
                    <td>${dep.consultas_count || 0}</td>
                    <td>
                        <button class="btn-action btn-imc" data-id="${dep.id}" data-nome="${dep.nome}">IMC</button>
                        <button class="btn-action btn-add-consulta" data-id="${dep.id}">+ Consulta</button>
                        <button class="btn-action btn-delete" data-id="${dep.id}">Remover</button>
                    </td>
                `;
                tableBody.appendChild(tr);
            });
        } catch (error) {
            console.error('Erro ao carregar pacientes:', error);
        }
    };

    // ... (outras funções de renderização)

    // Event Listeners
    document.getElementById('dependentForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const dependente = {
            nome: document.getElementById('nomeDependente').value.trim(),
            nascimento: document.getElementById('dataNascimento').value,
            parentesco: document.getElementById('parentesco').value
        };
        
        try {
            const resultado = await api.addDependente(dependente);
            if (resultado.success) {
                e.target.reset();
                await renderizarTabelaDependentes();
            }
        } catch (error) {
            console.error('Erro ao adicionar paciente:', error);
        }
    });

    // ... (outros event listeners)

    // Inicialização
    renderizarTabelaDependentes();
    renderizarHistoricoIMC();
});