"use client";

import React, {
  useEffect,
  useState,
  useRef,
  useActionState,
  useCallback,
} from "react";
import "./styles.css";

import { Button } from "@/components/Buttons";
import { Input } from "@/components/Inputs";
import { Modal } from "@/components/Modals";
import {
  loadOrdersData,
  loadAllTasks,
  createOrderAction,
  deleteOrderAction,
  approveOrderAction,
  getOrderDetails,
  removeTaskFromOrderAction,
  type Task,
  type Order,
} from "./actions";
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
  const wrapperRef = useRef<HTMLDivElement | null>(null);

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
      <div
        onClick={() => setIsOpen((v) => !v)}
        style={{
          border: "1px solid #d1d5db",
          padding: "0.6rem 1rem",
          borderRadius: "6px",
          background: "#1f2937",
          color: "#fff",
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

      {isOpen && (
        <div
          style={{
            position: "absolute",
            zIndex: 50,
            marginTop: "5px",
            width: "100%",
            maxWidth: "460px",
            background: "#fff",
            border: "1px solid #e5e7eb",
            borderRadius: "6px",
            boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
            overflow: "hidden",
          }}
        >
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
export default function OrderPage() {
  const [modalType, setModalType] = useState<
    "criar" | "editar" | "deletar" | "aprovar" | null
  >(null);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const [orders, setOrders] = useState<Order[]>([]);
  const [totalPages, setTotalPages] = useState(0);
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState("");

  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [editingTasks, setEditingTasks] = useState<Task[]>([]);

  const [allTasks, setAllTasks] = useState<Task[]>([]);
  const [selectedTasks, setSelectedTasks] = useState<string[]>([]);
  const [description, setDescription] = useState("");

  const [createState, createFormAction, createPending] = useActionState(
    createOrderAction,
    { success: false },
  );

  // stable close
  const close = useCallback(() => {
    setModalType(null);
    setSelectedId(null);
    setEditingOrder(null);
    setEditingTasks([]);
  }, []);

  // open is stable (no deps)
  const open = useCallback(
    async (
      type: "criar" | "editar" | "deletar" | "aprovar",
      id: number | null = null,
    ) => {
      setModalType(type);
      setSelectedId(id);

      if (type === "criar") {
        setDescription("");
        setSelectedTasks([]);
      }

      if (type === "editar" && id) {
        const orderData = await getOrderDetails(id);
        if (orderData) {
          setEditingOrder(orderData);
          setEditingTasks(orderData.tasks);
        }
      }
    },
    [],
  );

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const data = await loadOrdersData(search, page, 10);
        if (!mounted) return;
        setOrders(data.content);
        setTotalPages(data.totalPages || 0);
      } catch {
        if (!mounted) return;
        setOrders([]);
        setTotalPages(0);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [search, page]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const tasks = await loadAllTasks();
        if (!mounted) return;
        setAllTasks(tasks);
      } catch {
        if (!mounted) return;
        setAllTasks([]);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const [shouldReload, setShouldReload] = useState(0);

  useEffect(() => {
    if (!createState.success) return;
    close(); // stable callback
    setShouldReload((n) => n + 1);
  }, [createState.success, close]);

  useEffect(() => {
    if (shouldReload === 0) return; // ignore initial
    let mounted = true;
    (async () => {
      try {
        const data = await loadOrdersData(search, page, 10);
        if (!mounted) return;
        setOrders(data.content);
        setTotalPages(data.totalPages || 0);
      } catch {
        if (!mounted) return;
        setOrders([]);
        setTotalPages(0);
      }
    })();
    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shouldReload]); // intentionally only depends on shouldReload

  const handleDelete = async () => {
    if (!selectedId) return;
    await deleteOrderAction(selectedId);
    close();
    // trigger reload
    setShouldReload((n) => n + 1);
  };

  const handleApprove = async () => {
    if (!selectedId) return;
    await approveOrderAction(selectedId);
    close();
    setShouldReload((n) => n + 1);
  };

  const handleRemoveTaskLocal = (taskId: string) => {
    setEditingTasks((prev) => prev.filter((t) => t.id !== taskId));
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingOrder) return;

    const tasksToDelete = editingOrder.tasks.filter(
      (originalTask) =>
        !editingTasks.some((currentTask) => currentTask.id === originalTask.id),
    );

    if (tasksToDelete.length > 0) {
      await Promise.all(
        tasksToDelete.map((task) =>
          removeTaskFromOrderAction(editingOrder.orderId, task.id),
        ),
      );
    }

    close();
    setShouldReload((n) => n + 1);
  };

  const toggle = (id: string) =>
    setSelectedTasks((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );

  const toStatusPt = (s: string) =>
    s === "OPEN" ? "Aberto" : s === "CLOSE" ? "Finalizado" : s;

  return (
    <div className="page-container">
      <main className="main-content">
        <h1 className="page-title">Gerenciamento de Pedidos</h1>

        <div className="controls-bar">
          <div style={{ flex: 1 }}>
            <Input
              placeholder="Buscar pedidos por ID..."
              label="Pesquisa"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(0);
              }}
            />
          </div>
          <div style={{ width: "150px" }}>
            <Button onClick={() => open("criar")} fullWidth>
              + Novo pedido
            </Button>
          </div>
        </div>

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
            {orders.map((o) => {
              const t = o.tasks?.[0];
              const total =
                o.tasks?.reduce((acc, curr) => acc + curr.price, 0) || 0;
              return (
                <tr key={o.orderId} className="table-row">
                  <td className="table-cell">{o.orderId}</td>
                  <td className="table-cell">
                    {t?.machine?.brand} {t?.machine?.model}
                  </td>
                  <td className="table-cell">{t?.machine?.customer?.name}</td>
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
                        onClick={() => open("aprovar", o.orderId)}
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

        <div className="pagination">
          <Button disabled={page === 0} onClick={() => setPage((p) => p - 1)}>
            Prev
          </Button>
          <span>
            {page + 1} / {totalPages || 1}
          </span>
          <Button
            disabled={page + 1 >= totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </Button>
        </div>
      </main>

      <Modal
        isOpen={modalType === "criar"}
        onClose={close}
        title="Criar Novo Pedido"
        footer={<Button onClick={close}>Cancelar</Button>}
      >
        <form id="form-criar" action={createFormAction}>
          <Input
            name="description"
            label="Descrição"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          <div style={{ marginTop: "1rem" }}>
            {" "}
            <SearchableMultiSelect
              label="Serviço:"
              options={allTasks}
              selectedIds={selectedTasks}
              onChange={toggle}
            />{" "}
          </div>

          {selectedTasks.map((id) => (
            <input key={id} type="hidden" name="taskIds" value={id} />
          ))}

          <Button type="submit" fullWidth disabled={createPending}>
            {createPending ? "Criando..." : "Criar Pedido"}
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
          {" "}
          <div style={{ marginBottom: "1rem" }}>
            {" "}
            <strong>Cliente:</strong>{" "}
            {editingOrder?.tasks?.[0]?.machine?.customer?.name || "N/A"}{" "}
          </div>{" "}
          <p
            style={{ fontSize: "0.9rem", color: "#666", marginBottom: "10px" }}
          >
            {" "}
            Remova os serviços indesejados e clique em Salvar.{" "}
          </p>{" "}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "8px",
              maxHeight: "300px",
              overflowY: "auto",
            }}
          >
            {" "}
            {editingTasks.length === 0 ? (
              <div style={{ padding: 10, background: "#f3f4f6" }}>
                {" "}
                Nenhum serviço restando.{" "}
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
                  {" "}
                  <div>
                    {" "}
                    <div style={{ fontWeight: "600", fontSize: "0.95rem" }}>
                      {" "}
                      {task.name}{" "}
                    </div>{" "}
                    <div style={{ fontSize: "0.85rem", color: "#6b7280" }}>
                      {" "}
                      {new Intl.NumberFormat("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      }).format(task.price)}{" "}
                    </div>{" "}
                  </div>{" "}
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
                    {" "}
                    🗑️{" "}
                  </Button>{" "}
                </div>
              ))
            )}{" "}
          </div>{" "}
          <div
            style={{
              marginTop: "1rem",
              textAlign: "right",
              fontWeight: "bold",
              borderTop: "1px solid #eee",
              paddingTop: "10px",
            }}
          >
            {" "}
            Total Novo:{" "}
            {new Intl.NumberFormat("pt-BR", {
              style: "currency",
              currency: "BRL",
            }).format(editingTasks.reduce((acc, t) => acc + t.price, 0))}{" "}
          </div>{" "}
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
              onClick={handleApprove}
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
