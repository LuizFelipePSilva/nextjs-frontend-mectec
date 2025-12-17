"use client";

import { useEffect, useState, useCallback } from "react";
import "./styles.css";

import { Button } from "@/components/Buttons";
import { Input } from "@/components/Inputs";
import { Modal } from "@/components/Modals";
import { SelectionModal } from "@/components/SelectionModal";

import {
    loadTasksData,
    loadMachinesForSelect,
    loadPiecesForSelect,
    createTaskAction,
    updateTaskAction,
    deleteTaskAction,
    type Task,
    type OptionItem,
    type TaskStatus,
} from "./actions";

const STATUS_OPTIONS: { value: TaskStatus; label: string }[] = [
    { value: "PENDING", label: "Pendente" },
    { value: "IN_PROGRESS", label: "Em Andamento" },
    { value: "COMPLETED", label: "Concluído" },
    { value: "CANCELED", label: "Cancelado" },
];

export default function TaskPage() {
    const [items, setItems] = useState<Task[]>([]);
    const [totalPages, setTotalPages] = useState(0);
    const [page, setPage] = useState(0);
    const [search, setSearch] = useState("");

    const [machinesList, setMachinesList] = useState<OptionItem[]>([]);
    const [piecesList, setPiecesList] = useState<OptionItem[]>([]);

    const [modal, setModal] = useState<"criar" | "editar" | "deletar" | null>(null);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [errorMessage, setErrorMessage] = useState(""); // Estado para mensagens de erro

    const [isMachineModalOpen, setMachineModalOpen] = useState(false);
    const [isPiecesModalOpen, setPiecesModalOpen] = useState(false);

    const [formData, setFormData] = useState({
        name: "",
        price: 0,
        description: "",
        status: "PENDING" as TaskStatus,
        machineId: "",
        machineLabel: "", 
        piecesIds: [] as string[],
        piecesLabels: [] as string[], 
    });

    const refreshData = useCallback(async () => {
        const data = await loadTasksData(page, 10);
        setItems(data.content);
        setTotalPages(data.totalPages);
    }, [page]);

    useEffect(() => {
        refreshData();
        loadMachinesForSelect().then(setMachinesList);
        loadPiecesForSelect().then(setPiecesList);
    }, [refreshData]);

    const close = () => {
        setModal(null);
        setSelectedId(null);
        setErrorMessage(""); 
        setFormData({
            name: "",
            price: 0,
            description: "",
            status: "PENDING",
            machineId: "",
            machineLabel: "",
            piecesIds: [],
            piecesLabels: [],
        });
    };

    const open = (type: "criar" | "editar" | "deletar", task?: Task) => {
        setModal(type);
        setErrorMessage(""); 
        if (task) {
            setSelectedId(task.id);
            if (type === "editar") {
                setFormData({
                    name: task.name,
                    price: task.price,
                    description: task.description || "",
                    status: task.status,
                    machineId: task.machine.id,
                    machineLabel: task.machine.model, 
                    piecesIds: task.pieces.map((p) => p.id),
                    piecesLabels: task.pieces.map((p) => p.name),
                });
            }
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMessage(""); 

        if (!formData.name || formData.name.trim().length < 3) {
            setErrorMessage("O nome do serviço é obrigatório e deve ter pelo menos 3 caracteres.");
            return;
        }

        if (!formData.machineId) {
            setErrorMessage("É obrigatório selecionar uma máquina para o serviço.");
            return;
        }

        if (formData.price < 0) {
            setErrorMessage("O preço não pode ser negativo.");
            return;
        }

        const fd = new FormData();
        fd.set("name", formData.name);
        fd.set("price", String(formData.price));
        fd.set("description", formData.description);
        fd.set("machineId", formData.machineId);
        fd.set("status", formData.status);
        fd.set("piecesId", JSON.stringify(formData.piecesIds));

        let result;

        if (modal === "criar") {
            result = await createTaskAction(fd);
        } else if (modal === "editar" && selectedId) {
            result = await updateTaskAction(selectedId, fd);
        }


        if (result && !result.success) {
            setErrorMessage(result.message || "Ocorreu um erro ao salvar o serviço.");
        } else {
            close();
            refreshData();
        }
    };

    const handleDelete = async () => {
        if (selectedId) {
            await deleteTaskAction(selectedId);
            close();
            refreshData();
        }
    };

    const handleSelectMachine = (id: string | number | (string | number)[]) => {
        const val = id as string;
        const mach = machinesList.find((m) => m.id === val);
        if (mach) {
            setFormData({ ...formData, machineId: mach.id, machineLabel: mach.label });
        }
    };

    const handleSelectPieces = (ids: string | number | (string | number)[]) => {
        const valArray = ids as string[];

        const selectedPieces = piecesList.filter(p => valArray.includes(p.id));
        const labels = selectedPieces.map(p => p.label.split(" (R$")[0]); // Pega só o nome para o chip ficar curto

        setFormData({
            ...formData,
            piecesIds: valArray,
            piecesLabels: labels,
        });
    };

    const getStatusLabel = (s: string) => {
        return STATUS_OPTIONS.find(o => o.value === s)?.label || s;
    };

    return (
        <div className="page-container">
            <main className="main-content">
                <h1 className="page-title">Gerenciamento de Serviços</h1>

                <div className="controls-bar">
                    <div style={{ flex: 1 }}>
                        <Input
                            placeholder="Buscar serviço..."
                            label="Pesquisa"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <div style={{ width: "150px" }}>
                        <Button onClick={() => open("criar")} fullWidth>
                            + Novo Serviço
                        </Button>
                    </div>
                </div>

                <table className="order-table">
                    <thead>
                        <tr>
                            <th className="table-head-cell">Nome</th>
                            <th className="table-head-cell">Máquina</th>
                            <th className="table-head-cell">Status</th>
                            <th className="table-head-cell">Preço</th>
                            <th className="table-head-cell" style={{ textAlign: "right" }}>Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {items
                            .filter(t => t.name.toLowerCase().includes(search.toLowerCase()))
                            .map((item) => (
                                <tr key={item.id} className="table-row">
                                    <td className="table-cell">{item.name}</td>
                                    <td className="table-cell">{item.machine.model}</td>
                                    <td className="table-cell">
                                        <span className={`status-badge status-${item.status.toLowerCase()}`}>
                                            {getStatusLabel(item.status)}
                                        </span>
                                    </td>
                                    <td className="table-cell">R$ {item.price.toFixed(2)}</td>
                                    <td className="table-cell" style={{ textAlign: "right" }}>
                                        <div style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-end" }}>
                                            <Button variant="icon" onClick={() => open("deletar", item)}>🗑️</Button>
                                            <Button variant="icon" onClick={() => open("editar", item)}>✏️</Button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                    </tbody>
                </table>

                <div className="pagination">
                    <Button disabled={page === 0} onClick={() => setPage(page - 1)}>Prev</Button>
                    <span>{page + 1} / {totalPages > 0 ? totalPages : 1}</span>
                    <Button disabled={page + 1 >= totalPages} onClick={() => setPage(page + 1)}>Next</Button>
                </div>
            </main>

            {/* --- MODAL FORM (CRIAR / EDITAR) --- */}
            <Modal
                isOpen={modal === "criar" || modal === "editar"}
                onClose={close}
                title={modal === "criar" ? "Criar Serviço" : "Editar Serviço"}
                footer={
                    <Button onClick={handleSubmit} fullWidth>
                        {modal === "criar" ? "Criar" : "Salvar"}
                    </Button>
                }
            >
                <form className="task-form">
                    {/* Mensagem de Erro Visual */}
                    {errorMessage && (
                        <div style={{
                            color: "#ef4444",
                            fontSize: "0.85rem",
                            padding: "0.75rem",
                            border: "1px solid #fecaca",
                            borderRadius: "4px",
                            backgroundColor: "#fef2f2",
                            marginBottom: "0.5rem"
                        }}>
                            ⚠️ {errorMessage}
                        </div>
                    )}

                    <Input
                        label="Nome do Serviço"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Ex: Troca de Motor"
                    />

                    {/* SELEÇÃO DE MÁQUINA (Única) */}
                    <div className="input-wrapper">
                        <label className="input-label">Máquina (Obrigatório)</label>
                        <div className="selection-container" onClick={() => setMachineModalOpen(true)}>
                            {formData.machineId ? (
                                <span className="chip chip-machine">{formData.machineLabel}</span>
                            ) : (
                                <span className="text-muted">Selecionar máquina...</span>
                            )}
                        </div>
                    </div>

                    {/* SELEÇÃO DE PEÇAS (Múltipla) */}
                    <div className="input-wrapper">
                        <label className="input-label">Peças Utilizadas</label>
                        <div className="selection-container" onClick={() => setPiecesModalOpen(true)}>
                            {formData.piecesIds.length > 0 ? (
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                                    {formData.piecesLabels.map((lbl, idx) => (
                                        <span key={idx} className="chip chip-piece">{lbl}</span>
                                    ))}
                                    <span className="text-muted" style={{ fontSize: '0.8rem', marginLeft: 'auto' }}>
                                        (+ Editar)
                                    </span>
                                </div>
                            ) : (
                                <span className="text-muted">Selecionar peças...</span>
                            )}
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <div style={{ flex: 1 }}>
                            <Input
                                label="Preço Total (R$)"
                                type="number"
                                // Trava input de negativos
                                min="0"
                                step="0.01"
                                value={formData.price}
                                onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                            />
                        </div>

                        {/* Select nativo para Status */}
                        <div className="input-wrapper" style={{ flex: 1 }}>
                            <label className="input-label">Status</label>
                            <select
                                className="base-input"
                                value={formData.status}
                                onChange={(e) => setFormData({ ...formData, status: e.target.value as TaskStatus })}
                                disabled={modal === "criar"} // Desabilita na criação pois backend define PENDING
                                style={{ opacity: modal === "criar" ? 0.7 : 1 }}
                            >
                                {STATUS_OPTIONS.map(opt => (
                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <Input
                        label="Descrição"
                        isTextArea
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    />
                </form>
            </Modal>

            {/* --- MODAL DELETE --- */}
            <Modal
                isOpen={modal === "deletar"}
                onClose={close}
                title="Excluir"
                footer={
                    <>
                        <Button variant="ghost" onClick={close}>Cancelar</Button>
                        <Button variant="danger" onClick={handleDelete}>Confirmar</Button>
                    </>
                }
            >
                <p>Tem certeza que deseja remover este serviço?</p>
            </Modal>

            {/* --- MODAIS ANINHADOS --- */}

            {/* 1. Máquinas (Single) */}
            <SelectionModal
                isOpen={isMachineModalOpen}
                onClose={() => setMachineModalOpen(false)}
                title="Selecionar Máquina"
                options={machinesList}
                onConfirm={handleSelectMachine}
                initialSelected={formData.machineId}
                multiple={false}
            />

            {/* 2. Peças (Multiple) */}
            <SelectionModal
                isOpen={isPiecesModalOpen}
                onClose={() => setPiecesModalOpen(false)}
                title="Selecionar Peças"
                options={piecesList}
                onConfirm={handleSelectPieces}
                initialSelected={formData.piecesIds}
                multiple={true}
            />

        </div>
    );
}