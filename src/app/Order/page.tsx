"use client";
import React, { useEffect, useState, useCallback, useRef } from "react";
import "./styles.css";

import { Button } from "@/components/Buttons";
import { Input } from "@/components/Inputs";
import { Modal } from "@/components/Modals";

// --- TIPAGENS ---
type Task = {
  id: string;
  name: string;
  price: number;
  description: string;
  status: string;
  machine: {
    model: string;
    brand: string;
    customer: { name: string };
  };
};

type Order = {
  orderId: number;
  description: string;
  status: string;
  createdAt: string;
  tasks: Task[];
};

// --- NOVO COMPONENTE: SELECT COM BUSCA E MULTI-SELEÇÃO ---
// Este componente simula o visual da sua imagem com funcionalidade de busca
const SearchableMultiSelect = ({
  options,
  selectedIds,
  onChange,
  label,
}: {
  options: Task[];
  selectedIds: string[];
  onChange: (id: string) => void;
  label: string;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Fecha o dropdown se clicar fora dele
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredOptions = options.filter((opt) =>
    opt.name.toLowerCase().includes(search.toLowerCase()),
  );

  const selectedCount = selectedIds.length;

  return (
    <div
      className="custom-select-container"
      ref={wrapperRef}
      style={{ marginBottom: "1rem" }}
    >
      <label
        style={{
          display: "block",
          marginBottom: "0.5rem",
          fontWeight: 500,
          fontSize: "0.9rem",
        }}
      >
        {label}
      </label>

      {/* O "Botão" que parece um input */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        style={{
          border: "1px solid #d1d5db",
          padding: "0.6rem 1rem",
          borderRadius: "6px",
          background: "#1f2937", // Fundo escuro estilo a imagem (ou #fff se preferir claro)
          color: "#fff", // Texto claro
          cursor: "pointer",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          fontSize: "0.9rem",
        }}
      >
        <span>
          {selectedCount > 0
            ? `${selectedCount} serviço(s) selecionado(s)`
            : "Selecione os serviços..."}
        </span>
        <span
          style={{
            transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
            transition: "0.2s",
          }}
        >
          ▼
        </span>
      </div>

      {/* O Dropdown Flutuante */}
      {isOpen && (
        <div
          style={{
            position: "absolute",
            zIndex: 50,
            marginTop: "5px",
            width: "100%", // Ajustar conforme container pai
            maxWidth: "460px", // Limite de largura para não quebrar layout
            background: "#fff",
            border: "1px solid #e5e7eb",
            borderRadius: "6px",
            boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
            overflow: "hidden",
          }}
        >
          {/* Campo de Pesquisa Interno */}
          <div style={{ padding: "8px", borderBottom: "1px solid #eee" }}>
            <input
              autoFocus
              type="text"
              placeholder="Pesquisar..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: "100%",
                padding: "8px",
                border: "1px solid #d1d5db",
                borderRadius: "4px",
                outline: "none",
                fontSize: "0.9rem",
              }}
            />
          </div>

          {/* Lista de Opções */}
          <div style={{ maxHeight: "200px", overflowY: "auto" }}>
            {filteredOptions.length === 0 ? (
              <div
                style={{ padding: "10px", color: "#888", textAlign: "center" }}
              >
                Nenhum serviço encontrado.
              </div>
            ) : (
              filteredOptions.map((t) => {
                const isSelected = selectedIds.includes(t.id);
                return (
                  <div
                    key={t.id}
                    onClick={() => onChange(t.id)}
                    style={{
                      padding: "10px 12px",
                      cursor: "pointer",
                      background: isSelected ? "#f3f4f6" : "white",
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      borderBottom: "1px solid #f9fafb",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.background = "#f9fafb")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.background = isSelected
                        ? "#f3f4f6"
                        : "white")
                    }
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      readOnly
                      style={{ cursor: "pointer" }}
                    />
                    <div style={{ display: "flex", flexDirection: "column" }}>
                      <span style={{ fontWeight: 500, color: "#333" }}>
                        {t.name}
                      </span>
                      <span style={{ fontSize: "0.8rem", color: "#666" }}>
                        {new Intl.NumberFormat("pt-BR", {
                          style: "currency",
                          currency: "BRL",
                        }).format(t.price)}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// --- COMPONENTE PRINCIPAL ---
export default function OrderPage() {
  const [modalType, setModalType] = useState<
    "criar" | "editar" | "deletar" | "aprovar" | null
  >(null);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [totalPages, setTotalPages] = useState(0);
  const [page, setPage] = useState(0);
  const size = 10;

  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [editingTasks, setEditingTasks] = useState<Task[]>([]);
  const [search, setSearch] = useState("");
  const [description, setDescription] = useState("");
  const [allTasks, setAllTasks] = useState<Task[]>([]);
  const [selectedTasks, setSelectedTasks] = useState<string[]>([]);

  // TOKEN (Idealmente deve vir de variavel de ambiente ou contexto)
  const token =
    "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJhZG1pbiIsInJvbGVzIjpbIlJPTEVfQURNSU4iXSwiaWF0IjoxNzY1MzAxNDE1LCJleHAiOjE3NjUzMDUwMTV9.YbA9N1_vtcWiUFk2KgTzu-sgZGiHtVMc5DRm_rxq_zs";

  const toStatusPt = (s: string) =>
    s === "OPEN" ? "Aberto" : s === "CLOSE" ? "Finalizado" : s;

  const apiFetch = useCallback(
    async (endpoint: string, options: RequestInit = {}) => {
      const res = await fetch(`http://localhost:8080/api/v1${endpoint}`, {
        ...options,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          ...options.headers,
        },
      });

      if (res.status === 204 || res.headers.get("content-length") === "0")
        return null;
      if (!res.ok) throw new Error(`Erro API: ${res.status}`);
      return res.json();
    },
    [token],
  );

  const loadOrders = useCallback(async () => {
    try {
      setIsLoading(true);
      const pageData = await apiFetch(`/orders?page=${page}&size=${size}`);

      const ordersFull: Order[] = await Promise.all(
        pageData.content.map(async (o: Order) => {
          const orderFull: Order = await apiFetch(`/orders/${o.orderId}`);
          const fullTasks: Task[] = await Promise.all(
            orderFull.tasks.map((t: Task) => apiFetch(`/tasks/${t.id}`)),
          );
          return { ...orderFull, tasks: fullTasks };
        }),
      );

      setOrders(ordersFull);
      setTotalPages(pageData.totalPages);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [page, size, apiFetch]);

  const loadAllTasks = useCallback(async () => {
    const data = await apiFetch("/tasks");
    setAllTasks(data.content);
  }, [apiFetch]);

  useEffect(() => {
    loadOrders();
    loadAllTasks();
  }, [loadOrders, loadAllTasks]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();

    await apiFetch("/orders", {
      method: "POST",
      body: JSON.stringify({
        description,
        taskIds: selectedTasks,
      }),
    });

    close();
    loadOrders();
  };

  const handleRemoveTaskLocal = (taskId: string) => {
    setEditingTasks((prev) => prev.filter((t) => t.id !== taskId));
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingOrder) return;

    try {
      const tasksToDelete = editingOrder.tasks.filter(
        (originalTask) =>
          !editingTasks.some(
            (currentTask) => currentTask.id === originalTask.id,
          ),
      );

      if (tasksToDelete.length > 0) {
        const deletePromises = tasksToDelete.map((task) =>
          apiFetch(
            `/orders/task?orderId=${editingOrder.orderId}&taskId=${task.id}`,
            { method: "DELETE" },
          ),
        );
        await Promise.all(deletePromises);
      }

      close();
      loadOrders();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async () => {
    if (!selectedId) return;
    await apiFetch(`/orders/${selectedId}`, { method: "DELETE" });
    close();
    loadOrders();
  };

  const open = async (type: typeof modalType, id: number | null = null) => {
    setModalType(type);
    setSelectedId(id);
    // Limpa estados ao abrir o criar
    if (type === "criar") {
      setDescription("");
      setSelectedTasks([]);
    }

    if (type === "editar" && id) {
      const order = await apiFetch(`/orders/${id}`);
      const fullTasks: Task[] = await Promise.all(
        order.tasks.map((t: Task) => apiFetch(`/tasks/${t.id}`)),
      );
      const orderReady = { ...order, tasks: fullTasks };
      setEditingOrder(orderReady);
      setEditingTasks(fullTasks);
    }
  };

  const close = () => {
    setModalType(null);
    setSelectedId(null);
    setEditingOrder(null);
    setEditingTasks([]);
  };

  const approve = async () => {
    if (!selectedId) return;
    await apiFetch(`/orders/${selectedId}/close`, { method: "PATCH" });
    close();
    loadOrders();
  };

  const toggle = (id: string) =>
    setSelectedTasks((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );

  return (
    <div className="page-container">
      <main className="main-content">
        <h1 className="page-title">Gerenciamento de Pedidos</h1>

        <div className="controls-bar">
          <div style={{ flex: 1 }}>
            <Input
              placeholder="Buscar pedidos..."
              label="Pesquisa"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div style={{ width: "150px" }}>
            <Button onClick={() => open("criar")} fullWidth>
              + Novo pedido
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div style={{ padding: 20, textAlign: "center" }}>Carregando...</div>
        ) : (
          <table className="order-table">
            <thead>
              <tr>
                <th className="table-head-cell">N° Pedido</th>
                <th className="table-head-cell">Máquina</th>
                <th className="table-head-cell">Cliente</th>
                <th className="table-head-cell">Serviços</th>
                <th className="table-head-cell">Status</th>
                <th className="table-head-cell" style={{ textAlign: "right" }}>
                  Ações
                </th>
              </tr>
            </thead>
            <tbody>
              {orders
                .filter(
                  (o) => search === "" || o.orderId.toString().includes(search),
                )
                .map((o) => {
                  const t = o.tasks?.[0];
                  const total =
                    o.tasks?.reduce((acc, curr) => acc + curr.price, 0) || 0;
                  return (
                    <tr key={o.orderId} className="table-row">
                      <td className="table-cell">{o.orderId}</td>
                      <td className="table-cell">
                        {t?.machine?.brand} {t?.machine?.model}
                      </td>
                      <td className="table-cell">
                        {t?.machine?.customer?.name}
                      </td>
                      <td className="table-cell">
                        {o.tasks?.length} itens -{" "}
                        {new Intl.NumberFormat("pt-BR", {
                          style: "currency",
                          currency: "BRL",
                        }).format(total)}
                      </td>
                      <td className="table-cell">{toStatusPt(o.status)}</td>
                      <td className="table-cell" style={{ textAlign: "right" }}>
                        <div
                          style={{
                            display: "flex",
                            gap: "0.5rem",
                            justifyContent: "flex-end",
                          }}
                        >
                          <Button
                            variant="icon"
                            style={{ background: "#ef4444", color: "white" }}
                            onClick={() => open("deletar", o.orderId)}
                          >
                            ❌
                          </Button>
                          <Button
                            variant="icon"
                            style={{ background: "#eab308", color: "white" }}
                            onClick={() => open("editar", o.orderId)}
                          >
                            ✏️
                          </Button>
                          <Button
                            variant="icon"
                            style={{ background: "#22c55e", color: "white" }}
                            onClick={() => {
                              setSelectedId(o.orderId);
                              setModalType("aprovar");
                            }}
                          >
                            ✔️
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        )}

        <div className="pagination">
          <Button disabled={page === 0} onClick={() => setPage(page - 1)}>
            Prev
          </Button>
          <span>
            {page + 1} / {totalPages || 1}
          </span>
          <Button
            disabled={page + 1 >= totalPages}
            onClick={() => setPage(page + 1)}
          >
            Next
          </Button>
        </div>
      </main>

      {/* --- MODAL CRIAR PEDIDO (ATUALIZADO) --- */}
      <Modal
        isOpen={modalType === "criar"}
        onClose={close}
        title="Criar Novo Pedido"
        footer={<Button onClick={close}>Cancelar</Button>}
      >
        <form id="form-criar" onSubmit={handleCreate}>
          <Input
            name="description"
            label="Descrição"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          <div style={{ marginTop: "1rem" }}>
            {/* Uso do novo componente aqui */}
            <SearchableMultiSelect
              label="Serviço:"
              options={allTasks}
              selectedIds={selectedTasks}
              onChange={toggle}
            />
          </div>

          {/* Exibe o que foi selecionado para dar feedback ao usuário */}
          {selectedTasks.length > 0 && (
            <div
              style={{
                marginBottom: "1rem",
                fontSize: "0.85rem",
                color: "#666",
              }}
            >
              <strong>Selecionados:</strong>
              <ul style={{ paddingLeft: "20px", marginTop: "5px" }}>
                {allTasks
                  .filter((t) => selectedTasks.includes(t.id))
                  .map((t) => (
                    <li key={t.id}>{t.name}</li>
                  ))}
              </ul>
            </div>
          )}

          <Button type="submit" fullWidth>
            Criar Pedido
          </Button>
        </form>
      </Modal>

      <Modal
        isOpen={modalType === "editar"}
        onClose={close}
        title={`Editar Serviços - Pedido #${selectedId}`}
        footer={
          <Button type="submit" form="form-editar" fullWidth>
            Salvar Alterações
          </Button>
        }
      >
        <form id="form-editar" onSubmit={handleSaveEdit}>
          <div style={{ marginBottom: "1rem" }}>
            <strong>Cliente:</strong>{" "}
            {editingOrder?.tasks?.[0]?.machine?.customer?.name || "N/A"}
          </div>

          <p
            style={{ fontSize: "0.9rem", color: "#666", marginBottom: "10px" }}
          >
            Remova os serviços indesejados e clique em Salvar.
          </p>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "8px",
              maxHeight: "300px",
              overflowY: "auto",
            }}
          >
            {editingTasks.length === 0 ? (
              <div style={{ padding: 10, background: "#f3f4f6" }}>
                Nenhum serviço restando.
              </div>
            ) : (
              editingTasks.map((task) => (
                <div
                  key={task.id}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "10px",
                    border: "1px solid #e5e7eb",
                    borderRadius: "6px",
                    background: "#fff",
                  }}
                >
                  <div>
                    <div style={{ fontWeight: "600", fontSize: "0.95rem" }}>
                      {task.name}
                    </div>
                    <div style={{ fontSize: "0.85rem", color: "#6b7280" }}>
                      {new Intl.NumberFormat("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      }).format(task.price)}
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="icon"
                    style={{
                      background: "#fee2e2",
                      color: "#ef4444",
                      width: "32px",
                      height: "32px",
                    }}
                    onClick={() => handleRemoveTaskLocal(task.id)}
                  >
                    🗑️
                  </Button>
                </div>
              ))
            )}
          </div>

          <div
            style={{
              marginTop: "1rem",
              textAlign: "right",
              fontWeight: "bold",
              borderTop: "1px solid #eee",
              paddingTop: "10px",
            }}
          >
            Total Novo:{" "}
            {new Intl.NumberFormat("pt-BR", {
              style: "currency",
              currency: "BRL",
            }).format(editingTasks.reduce((acc, t) => acc + t.price, 0))}
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={modalType === "deletar"}
        onClose={close}
        title="Excluir"
        footer={
          <>
            <Button variant="ghost" onClick={close}>
              Cancelar
            </Button>
            <Button variant="danger" onClick={handleDelete}>
              Confirmar
            </Button>
          </>
        }
      >
        <p>Tem certeza que deseja remover o pedido #{selectedId}?</p>
      </Modal>

      <Modal
        isOpen={modalType === "aprovar"}
        onClose={close}
        title="Aprovar"
        footer={
          <>
            <Button variant="ghost" onClick={close}>
              Cancelar
            </Button>
            <Button
              variant="primary"
              style={{ background: "#22c55e", color: "white" }}
              onClick={approve}
            >
              Aprovar
            </Button>
          </>
        }
      >
        <p>Tem certeza que deseja aprovar o pedido #{selectedId}?</p>
      </Modal>
    </div>
  );
}
