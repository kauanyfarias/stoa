document.addEventListener("DOMContentLoaded", () => {
  // Array de Estado dos Gestores (Inicia Vazio)
  let managers = [];
  let selectedManagerId = null;

  // Elementos do DOM
  const tableBody = document.getElementById("teamTableBody");
  const searchInput = document.getElementById("searchInput");
  const countGestores = document.getElementById("countGestores");
  const countAreas = document.getElementById("countAreas");
  const countPendentes = document.getElementById("countPendentes");

  // Modais
  const formModal = document.getElementById("formModal");
  const confirmDeleteModal = document.getElementById("confirmDeleteModal");
  const passwordModal = document.getElementById("passwordModal");
  const resendModal = document.getElementById("resendModal");
  const successModal = document.getElementById("successModal");

  // Formulário
  const managerForm = document.getElementById("managerForm");
  const passwordForm = document.getElementById("passwordForm");

  // 1. Renderiza a Tabela e Atualiza Cards
  function renderTable(filterText = "") {
    tableBody.innerHTML = "";

    const filtered = managers.filter(m => 
      m.name.toLowerCase().includes(filterText.toLowerCase()) ||
      m.area.toLowerCase().includes(filterText.toLowerCase()) ||
      m.email.toLowerCase().includes(filterText.toLowerCase())
    );

    if (filtered.length === 0) {
      tableBody.innerHTML = `
        <tr>
          <td colspan="7">
            <div class="empty-state">
              <i data-lucide="users"></i>
              <p>Nenhum gestor encontrado.</p>
            </div>
          </td>
        </tr>
      `;
    } else {
      filtered.forEach(m => {
        const initials = m.name.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase();
        const tr = document.createElement("tr");

        tr.innerHTML = `
          <td>
            <div class="user-info">
              <div class="user-avatar">${initials}</div>
              <div class="user-details">
                <div class="name">${m.name}</div>
                <div class="email">${m.email}</div>
              </div>
            </div>
          </td>
          <td>${m.area}</td>
          <td>${m.cargo}</td>
          <td><span class="apprentices-count">${m.aprendizes}</span></td>
          <td><span class="badge ${m.role === 'Administrador' ? 'badge-admin' : 'badge-gestor'}">${m.role}</span></td>
          <td>
            <button class="badge ${m.status === 'Ativo' ? 'badge-active' : 'badge-pending'}" onclick="toggleStatus(${m.id})" style="border:none; cursor:pointer;">
              ${m.status}
            </button>
          </td>
          <td>
            <div class="action-buttons">
              <button class="btn-action" onclick="openEditModal(${m.id})" title="Editar"><i data-lucide="pencil"></i></button>
              <button class="btn-action" onclick="openResendModal(${m.id})" title="Reenviar Convite"><i data-lucide="send"></i></button>
              <button class="btn-action" onclick="openDeleteModal(${m.id})" title="Excluir"><i data-lucide="trash-2"></i></button>
            </div>
          </td>
        `;
        tableBody.appendChild(tr);
      });
    }

    // Re-inicializar os Ícones
    if (window.lucide) lucide.createIcons();

    // Atualizar Contadores
    countGestores.textContent = managers.length;
    countAreas.textContent = new Set(managers.map(m => m.area.toLowerCase())).size;
    countPendentes.textContent = managers.filter(m => m.status === "Pendente").length;
  }

  // 2. Busca em Tempo Real
  searchInput.addEventListener("input", (e) => {
    renderTable(e.target.value);
  });

  // 3. Cadastrar ou Editar Gestor
  document.getElementById("btnOpenAddModal").addEventListener("click", () => {
    document.getElementById("formModalTitle").textContent = "Cadastrar Gestor";
    managerForm.reset();
    document.getElementById("editManagerId").value = "";
    openModal(formModal);
  });

  managerForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const id = document.getElementById("editManagerId").value;
    const name = document.getElementById("inputName").value;
    const email = document.getElementById("inputEmail").value;
    const area = document.getElementById("inputArea").value;
    const cargo = document.getElementById("inputCargo").value;
    const role = document.getElementById("selectRole").value;
    const aprendizes = parseInt(document.getElementById("inputAprendizes").value) || 0;

    if (id) {
      // Editar existente
      const index = managers.findIndex(m => m.id == id);
      if (index !== -1) {
        managers[index] = { ...managers[index], name, email, area, cargo, role, aprendizes };
      }
    } else {
      // Criar Novo
      managers.push({
        id: Date.now(),
        name,
        email,
        area,
        cargo,
        role,
        aprendizes,
        status: "Pendente"
      });
    }

    closeAllModals();
    renderTable();
  });

  // 4. Alternar Status (Ativo / Pendente)
  window.toggleStatus = function(id) {
    const manager = managers.find(m => m.id === id);
    if (manager) {
      manager.status = manager.status === "Ativo" ? "Pendente" : "Ativo";
      renderTable();
    }
  };

  // 5. Editar Modal
  window.openEditModal = function(id) {
    const manager = managers.find(m => m.id === id);
    if (!manager) return;

    document.getElementById("formModalTitle").textContent = "Editar Gestor";
    document.getElementById("editManagerId").value = manager.id;
    document.getElementById("inputName").value = manager.name;
    document.getElementById("inputEmail").value = manager.email;
    document.getElementById("inputArea").value = manager.area;
    document.getElementById("inputCargo").value = manager.cargo;
    document.getElementById("selectRole").value = manager.role;
    document.getElementById("inputAprendizes").value = manager.aprendizes;

    openModal(formModal);
  };

  // 6. Fluxo de Exclusão (Modal 1 -> Modal 2 Senha -> Concluído)
  window.openDeleteModal = function(id) {
    selectedManagerId = id;
    openModal(confirmDeleteModal);
  };

  document.getElementById("btnConfirmDelete").addEventListener("click", () => {
    closeModal(confirmDeleteModal);
    openModal(passwordModal);
  });

  passwordForm.addEventListener("submit", (e) => {
    e.preventDefault();
    managers = managers.filter(m => m.id !== selectedManagerId);
    document.getElementById("confirmPasswordInput").value = "";
    closeAllModals();
    renderTable();
  });

  // 7. Fluxo de Reenviar Convite (Modal 1 -> Modal 2 Sucesso)
  window.openResendModal = function(id) {
    selectedManagerId = id;
    openModal(resendModal);
  };

  document.getElementById("btnConfirmResend").addEventListener("click", () => {
    closeModal(resendModal);
    openModal(successModal);
  });

  // Utilitários de Modal
  function openModal(modal) {
    modal.classList.add("active");
  }

  function closeModal(modal) {
    modal.classList.remove("active");
  }

  function closeAllModals() {
    document.querySelectorAll(".modal-overlay").forEach(m => m.classList.remove("active"));
  }

  document.querySelectorAll(".closeModalBtn").forEach(btn => {
    btn.addEventListener("click", closeAllModals);
  });

  // Renderização Inicial (Com Tabela Vazia)
  renderTable();
});