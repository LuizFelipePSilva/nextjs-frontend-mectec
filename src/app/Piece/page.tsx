"use client";
import React, { useState } from "react";
import "./styles.css";

import { Button } from "@/components/Buttons";
import { Input } from "@/components/Inputs";
import { Modal } from "@/components/Modals";

export default function OrderPage() {
  const [modalType, setModalType] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const open = (type: string, id: number | null = null) => {
    setModalType(type);
    setSelectedId(id);
  };

  const close = () => {
    setModalType(null);
    setSelectedId(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    close();
  };

  return (
    <div className="page-container">
      <main className="main-content">
        <h1 className="page-title">Gerenciamento de Peças</h1>

        <div className="controls-bar">
          <div style={{ flex: 1 }}>
            <Input placeholder="Buscar peças..." label="Pesquisa" />
          </div>
          <div style={{ width: "150px" }}>
            <Button onClick={() => open("criar")} fullWidth>
              + Nova peça
            </Button>
          </div>
        </div>

        <table className="order-table">
          <thead>
            <tr>
              <th className="table-head-cell">Nome</th>
              <th className="table-head-cell">Preço</th>
              <th className="table-head-cell">Marca</th>
              <th className="table-head-cell">Descrição</th>
              <th className="table-head-cell" style={{ textAlign: "right" }}>
                Ações
              </th>
            </tr>
          </thead>
          <tbody>
            {[1, 2, 3].map((i) => (
              <tr key={i} className="table-row">
                <td className="table-cell">Nome {i}</td>
                <td className="table-cell">Preço {i}</td>
                <td className="table-cell">Marca {i}</td>
                <td className="table-cell">Descrição {i}</td>
                <td className="table-cell">
                  <div
                    style={{
                      display: "flex",
                      gap: "0.5rem",
                      justifyContent: "flex-end",
                    }}
                  >
                    <Button variant="icon" onClick={() => open("deletar", i)}>
                      🗑️
                    </Button>
                    <Button variant="icon" onClick={() => open("editar", i)}>
                      ✏️
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </main>

      {/* --- MODAIS --- */}
      <Modal
        isOpen={modalType === "criar"}
        onClose={close}
        title="Criar Nova Peça"
        footer={
          <Button type="submit" form="form-criar" fullWidth>
            Criar Peça
          </Button>
        }
      >
        <form id="form-criar" className="modal-form" onSubmit={handleSubmit}>
          <Input label="Nome" placeholder="Ex: Parafuso 3/8" />
          <Input label="Preço" placeholder="Ex: 3" />
          <Input label="Marca" placeholder="Ex: Borsh" />
          <Input label="Descrição" isTextArea placeholder="Detalhes..." />
        </form>
      </Modal>

      <Modal
        isOpen={modalType === "editar"}
        onClose={close}
        title={`Editar Peça #${selectedId}`}
        footer={
          <Button type="submit" form="form-editar" fullWidth>
            Salvar
          </Button>
        }
      >
        <form id="form-editar" className="modal-form" onSubmit={handleSubmit}>
          <Input label="Nome" placeholder={`Nome da peça ${selectedId}`} />
          <Input label="Preço" placeholder={`Preço da peça ${selectedId}`} />
          <Input label="Marca" placeholder={`Marca da peça ${selectedId}`} />
          <Input
            label="Descrição"
            isTextArea
            placeholder={`Descrição da peça ${selectedId}`}
          />
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
            <Button variant="danger" onClick={close}>
              Confirmar
            </Button>
          </>
        }
      >
        <p>
          Tem a certeza que deseja remover a peça <b>#{selectedId}</b>?
        </p>
      </Modal>
    </div>
  );
}
