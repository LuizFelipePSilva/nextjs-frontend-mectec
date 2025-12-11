"use client";

import { useEffect, useState, useCallback } from "react";
import "./styles.css";

import { Button } from "@/components/Buttons";
import { Input } from "@/components/Inputs";
import { Modal } from "@/components/Modals";
import { SelectionModal } from "@/components/SelectionModal";

import {
    loadMachinesData,
    loadCustomersForSelect,
    createMachineAction,
    updateMachineAction,
    deleteMachineAction,
    type Machine,
    type CustomerOption,
} from "./actions";

const CATEGORY_OPTIONS = [
    { id: "POWER_TOOL", label: "Ferramenta Elétrica" },
    { id: "HOME_APPLIANCE", label: "Eletrodoméstico" },
    { id: "SMALL_APPLIANCE", label: "Eletroportátil" },
    { id: "BEAUTY_SALON", label: "Salão de Beleza" },
];

export default function MachinePage() {
    
    const [items, setItems] = useState<Machine[]>([]);
    const [totalPages, setTotalPages] = useState(0);
    const [page, setPage] = useState(0);
    const [search, setSearch] = useState("");

    const [modal, setModal] = useState<"criar" | "editar" | "deletar" | null>(null);
    const [selectedId, setSelectedId] = useState<string | null>(null);

    const [errorMessage, setErrorMessage] = useState("");
    const [isCustomerModalOpen, setCustomerModalOpen] = useState(false);
    const [isCategoryModalOpen, setCategoryModalOpen] = useState(false);
    const [customersList, setCustomersList] = useState<CustomerOption[]>([]);

    const [formData, setFormData] = useState({
        model: "",
        brand: "",
        description: "",
        category: "",
        customerId: "",
        customerName: "",
    });

    const refreshData = useCallback(async () => {
        const data = await loadMachinesData(page, 10);
        setItems(data.content);
        setTotalPages(data.totalPages);
    }, [page]);

    useEffect(() => {
        refreshData();
    }, [refreshData]);

    useEffect(() => {
        loadCustomersForSelect().then(setCustomersList);
    }, []);

    const close = () => {
        setModal(null);
        setSelectedId(null);
        setErrorMessage("");
        setFormData({
            model: "",
            brand: "",
            description: "",
            category: "",
            customerId: "",
            customerName: "",
        });
    };

    const open = (type: "criar" | "editar" | "deletar", machine?: Machine) => {
        setModal(type);
        setErrorMessage("");
        if (machine) {
            setSelectedId(machine.id);
            if (type === "editar") {
                setFormData({
                    model: machine.model,
                    brand: machine.brand,
                    description: machine.description,
                    category: machine.category,
                    customerId: machine.customer.id,
                    customerName: machine.customer.name,
                });
            }
        }
    };
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMessage(""); 

        if (!formData.model.trim()) {
            setErrorMessage("O modelo é obrigatório.");
            return;
        }
        if (!formData.brand.trim()) {
            setErrorMessage("A marca é obrigatória.");
            return;
        }
        if (!formData.category) {
            setErrorMessage("Selecione uma categoria.");
            return;
        }
        if (!formData.customerId) {
            setErrorMessage("Selecione um cliente.");
            return;
        }

        if (!formData.description || formData.description.length < 10) {
            setErrorMessage("A descrição deve ter pelo menos 10 caracteres.");
            return;
        }

        const fd = new FormData();
        fd.set("model", formData.model);
        fd.set("brand", formData.brand);
        fd.set("category", formData.category);
        fd.set("description", formData.description);
        fd.set("customerID", formData.customerId);

        let result;

        if (modal === "criar") {
            result = await createMachineAction(fd);
        } else if (modal === "editar" && selectedId) {
            result = await updateMachineAction(selectedId, fd);
        }

        if (result && !result.success) {
            setErrorMessage(result.message || "Erro ao salvar máquina.");
        } else {
            close();
            refreshData();
        }
    };

    const handleDelete = async () => {
        if (selectedId) {
            await deleteMachineAction(selectedId);
            close();
            refreshData();
        }
    };

    const handleSelectCustomer = (id: string | number) => {
        const cust = customersList.find((c) => c.id === id);
        if (cust) {
            setFormData({ ...formData, customerId: cust.id, customerName: cust.name });
        }
    };

    const handleSelectCategory = (id: string | number) => {
        setFormData({ ...formData, category: String(id) });
    };

    const getCategoryLabel = (catId: string) => {
        return CATEGORY_OPTIONS.find((c) => c.id === catId)?.label || catId;
    };

    return (
        <div className="page-container">
            <main className="main-content">
                <h1 className="page-title">Gerenciamento de Máquinas</h1>

                <div className="controls-bar">
                    <div style={{ flex: 1 }}>
                        <Input
                            placeholder="Buscar por modelo, marca..."
                            label="Pesquisa"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <div style={{ width: "150px" }}>
                        <Button onClick={() => open("criar")} fullWidth>
                            + Nova Máquina
                        </Button>
                    </div>
                </div>

                <table className="order-table">
                    <thead>
                        <tr>
                            <th className="table-head-cell">Modelo</th>
                            <th className="table-head-cell">Marca</th>
                            <th className="table-head-cell">Categoria</th>
                            <th className="table-head-cell">Cliente</th>
                            <th className="table-head-cell">Descrição</th>
                            <th className="table-head-cell" style={{ textAlign: "right" }}>Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {items
                            .filter(m =>
                                m.model.toLowerCase().includes(search.toLowerCase()) ||
                                m.brand.toLowerCase().includes(search.toLowerCase())
                            )
                            .map((item) => (
                                <tr key={item.id} className="table-row">
                                    <td className="table-cell">{item.model}</td>
                                    <td className="table-cell">{item.brand}</td>
                                    <td className="table-cell">{getCategoryLabel(item.category)}</td>
                                    <td className="table-cell">{item.customer.name}</td>
                                    <td className="table-cell">{item.description}</td>
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

            <Modal
                isOpen={modal === "criar" || modal === "editar"}
                onClose={close}
                title={modal === "criar" ? "Criar Máquina" : "Editar Máquina"}
                footer={
                    <Button onClick={handleSubmit} fullWidth>
                        {modal === "criar" ? "Criar" : "Salvar"}
                    </Button>
                }
            >
                <form className="machine-form">
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
                        label="Modelo"
                        value={formData.model}
                        onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                    />
                    <Input
                        label="Marca"
                        value={formData.brand}
                        onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                    />

                    <div className="input-wrapper">
                        <label className="input-label">Categoria</label>
                        <div
                            className="selection-container"
                            onClick={() => setCategoryModalOpen(true)}
                        >
                            {formData.category ? (
                                <span className="chip chip-categoria">
                                    {getCategoryLabel(formData.category)}
                                </span>
                            ) : (
                                <span className="text-muted">Selecionar categoria...</span>
                            )}
                        </div>
                    </div>

                    <div className="input-wrapper">
                        <label className="input-label">Cliente</label>
                        <div
                            className="selection-container"
                            onClick={() => setCustomerModalOpen(true)}
                        >
                            {formData.customerId ? (
                                <span className="chip chip-cliente">{formData.customerName}</span>
                            ) : (
                                <span className="text-muted">Selecionar cliente...</span>
                            )}
                        </div>
                    </div>

                    <Input
                        label="Descrição (Mínimo 10 caracteres)" 
                        isTextArea
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    />
                </form>
            </Modal>

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
                <p>Tem certeza que deseja remover esta máquina?</p>
            </Modal>

            <SelectionModal
                isOpen={isCustomerModalOpen}
                onClose={() => setCustomerModalOpen(false)}
                title="Selecionar Cliente"
                options={customersList.map(c => ({ id: c.id, label: c.name }))}
                onConfirm={handleSelectCustomer}
                initialSelected={formData.customerId}
            />

            <SelectionModal
                isOpen={isCategoryModalOpen}
                onClose={() => setCategoryModalOpen(false)}
                title="Selecionar Categoria"
                options={CATEGORY_OPTIONS}
                onConfirm={handleSelectCategory}
                initialSelected={formData.category}
            />
        </div>
    );
}