"use client";

import "./styles.css";

import { Input } from "@/components/Inputs";
import { Button } from "@/components/Buttons";
import { useEffect, useState } from "react";
import { Modal } from "@/components/Modals";

type Customer = {
  id: string;
  name: string;
  cpf: string;
  phone: string;
  email: string;
  address: string;
};

type ModalActionType = "delete" | "edit";
type ModalType = "create" | ModalActionType;

export default function customerPage() {
  const [customers, setCustomers] = useState<Customer[] | null>(null);
  const [modalOpen, setModalOpen] = useState<ModalType | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const openCreateModal = () => {
    setModalOpen("create");
  };

  const openActionModal = (modal: ModalActionType, id: string) => {
    setModalOpen(modal);
    setSelectedId(id);
  };

  const closeModal = () => {
    setModalOpen(null);
    setSelectedId(null);
  };

  const findCustomer = (id: string) => {
    return customers?.find((customer) => customer.id == id);
  };

  useEffect(() => {
    setCustomers([
      {
        id: "8d0c2c22-9892-4de8-a2f6-3888b15d5f27",
        name: "Jose",
        cpf: "12345678900",
        phone: "84912345678",
        email: "jose@example.com",
        address: "Rua A",
      },
      {
        id: "b1bbc2af-bf16-4413-b66b-a37db7df8cb8",
        name: "Maria",
        cpf: "12345678901",
        phone: "84912345677",
        email: "maria@example.com",
        address: "Rua B",
      },
      {
        id: "f4862f05-3994-4a72-8b80-0a619d6678dc",
        name: "João",
        cpf: "12345678902",
        phone: "84912345676",
        email: "joao@example.com",
        address: "Rua C",
      },
    ]);
  }, []);

  return (
    <div className="page-container">
      <main className="main-content">
        <h1 className="page-title">Gerenciamento de Clientes</h1>

        <div className="controls-bar">
          <div>
            <Input placeholder="Buscar clientes..." label="Pesquisa" />
          </div>
          <div>
            <Button onClick={openCreateModal} fullWidth>
              + Novo cliente
            </Button>
          </div>
        </div>

        <table className="customer-table">
          <thead>
            <tr>
              <th className="table-head-cell">Id</th>
              <th className="table-head-cell">Nome</th>
              <th className="table-head-cell">Cpf</th>
              <th className="table-head-cell">Telefone</th>
              <th className="table-head-cell">Email</th>
              <th className="table-head-cell">Endereço</th>
              <th className="table-head-cell">Ações</th>
            </tr>
          </thead>
          {customers && (
            <tbody>
              {customers.map((customer, i) => (
                <tr key={i} className="table-row">
                  <td className="table-cell">{customer.id}</td>
                  <td className="table-cell">{customer.name}</td>
                  <td className="table-cell">{customer.cpf}</td>
                  <td className="table-cell">{customer.phone}</td>
                  <td className="table-cell">{customer.email}</td>
                  <td className="table-cell">{customer.address}</td>
                  <td className="table-cell">
                    <div>
                      <Button
                        variant="icon"
                        onClick={() => openActionModal("delete", customer.id)}
                      >
                        🗑️
                      </Button>
                      <Button
                        variant="icon"
                        onClick={() => openActionModal("edit", customer.id)}
                      >
                        ✏️
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          )}
        </table>
        {!customers && <span className="load-message">Carregando...</span>}
      </main>

      <Modal
        isOpen={modalOpen == "create"}
        onClose={closeModal}
        title="Criar Novo Usuário"
        footer={
          <Button type="submit" fullWidth>
            Criar Cliente
          </Button>
        }
      >
        <form className="modal-form">
          <Input label="nome" placeholder="Gabriel" />
          <Input label="cpf" placeholder="" />
          <Input label="telefone" placeholder="" />
          <Input label="email" placeholder="gabriel@example.com" />
          <Input label="endereço" placeholder="" />
        </form>
      </Modal>

      <Modal
        isOpen={modalOpen == "delete"}
        onClose={closeModal}
        title="Excluir"
        footer={
          <>
            <Button variant="ghost" onClick={closeModal} fullWidth>
              Cancelar
            </Button>
            <Button variant="danger" onClick={closeModal} fullWidth>
              Confirmar
            </Button>
          </>
        }
      >
        <p>
          Tem certeza que deseja remove o cliente{" "}
          {findCustomer(selectedId!)?.name} ({findCustomer(selectedId!)?.cpf})
        </p>
      </Modal>

      <Modal
        isOpen={modalOpen == "edit"}
        onClose={closeModal}
        title="Editar Cliente"
        footer={
          <Button type="submit" fullWidth>
            Criar Cliente
          </Button>
        }
      >
        <form className="modal-form">
          <Input
            label="nome"
            placeholder="Gabriel"
            defaultValue={(selectedId && findCustomer(selectedId)?.name) || ""}
          />
          <Input
            label="cpf"
            placeholder=""
            defaultValue={(selectedId && findCustomer(selectedId)?.cpf) || ""}
          />
          <Input
            label="telefone"
            placeholder=""
            defaultValue={(selectedId && findCustomer(selectedId)?.phone) || ""}
          />
          <Input
            label="email"
            placeholder="gabriel@example.com"
            defaultValue={(selectedId && findCustomer(selectedId)?.email) || ""}
          />
          <Input
            label="endereço"
            placeholder=""
            defaultValue={
              (selectedId && findCustomer(selectedId)?.address) || ""
            }
          />
        </form>
      </Modal>
    </div>
  );
}
