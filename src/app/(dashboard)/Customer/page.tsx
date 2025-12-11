"use client";

import "./styles.css";

import { Input } from "@/components/Inputs";
import { Button } from "@/components/Buttons";
import { useActionState, useEffect, useState } from "react";
import { Modal } from "@/components/Modals";
import Pagination from "@/components/Pagination";
import {
  createAction,
  deleteCustomer,
  loadData,
  updateAction,
} from "./actions";

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

export default function CustomerPage() {
  const [customers, setCustomers] = useState<Customer[] | null>(null);

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const [modalOpen, setModalOpen] = useState<ModalType | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const [createState, createFormAction, createPending] = useActionState(
    createAction,
    {
      success: false,
      name: "",
      cpf: "",
      phone: "",
      email: "",
      address: "",
    }
  );

  const [updateState, updateFormAction, updatePending] = useActionState(
    updateAction,
    {
      success: false,
    }
  );

  const onCLickDelete = async () => {
    await deleteCustomer(selectedId!);
    load();
    closeModal();
  };

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

  const load = async () => {
    const data = await loadData(search, page);
    setCustomers(data.content);
    setTotalPages(data.totalPages);
  };

  useEffect(() => {
    const timeout = setTimeout(() => {
      console.log(".");
      load();
    }, 1000);
    return () => {
      clearTimeout(timeout);
    };
  }, [search, page]);

  useEffect(() => {
    if (createState.success) {
      load();
      closeModal();
    }
  }, [createState]);

  useEffect(() => {
    if (updateState.success) {
      load();
      closeModal();
    }
  }, [updateState]);

  return (
    <div className="page-container">
      <main className="main-content">
        <h1 className="page-title">Gerenciamento de Clientes</h1>

        <div className="controls-bar">
          <div>
            <Input
              placeholder="Buscar clientes..."
              label="Pesquisa"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
              }}
            />
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
        <Pagination
          page={page}
          totalPages={totalPages}
          onChange={(next) => setPage(next)}
        />
      </main>

      <Modal
        isOpen={modalOpen == "create"}
        onClose={closeModal}
        title="Criar Novo Usuário"
        footer={
          <Button
            form="create-form"
            type="submit"
            fullWidth
            disabled={createPending}
          >
            Criar Cliente
          </Button>
        }
      >
        <form id="create-form" className="modal-form" action={createFormAction}>
          {createState.errors && (
            <span className="form-error">{createState.errors}</span>
          )}
          <Input
            label="nome"
            placeholder="Gabriel"
            name="name"
            defaultValue={createState.name}
          />
          <Input
            label="cpf"
            placeholder=""
            name="cpf"
            defaultValue={createState.cpf}
          />
          <Input
            label="telefone"
            placeholder=""
            name="phone"
            defaultValue={createState.phone}
          />
          <Input
            label="email"
            type="email"
            placeholder="gabriel@example.com"
            name="email"
            defaultValue={createState.email}
          />
          <Input
            label="endereço"
            placeholder=""
            name="address"
            defaultValue={createState.address}
          />
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
            <Button variant="danger" onClick={onCLickDelete} fullWidth>
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
          <Button
            form="update-form"
            type="submit"
            fullWidth
            disabled={updatePending}
          >
            Editar Cliente
          </Button>
        }
      >
        <form id="update-form" className="modal-form" action={updateFormAction}>
          <input type="hidden" defaultValue={selectedId!} name="id" />
          {updateState.errors && (
            <span className="form-error">{updateState.errors}..</span>
          )}
          <Input
            label="nome"
            placeholder="Gabriel"
            defaultValue={(selectedId && findCustomer(selectedId)?.name) || ""}
            name="name"
          />
          <Input
            label="cpf"
            placeholder=""
            defaultValue={(selectedId && findCustomer(selectedId)?.cpf) || ""}
            name="cpf"
          />
          <Input
            label="telefone"
            placeholder=""
            defaultValue={(selectedId && findCustomer(selectedId)?.phone) || ""}
            name="phone"
          />
          <Input
            label="email"
            type="email"
            placeholder="gabriel@example.com"
            defaultValue={(selectedId && findCustomer(selectedId)?.email) || ""}
            name="email"
          />
          <Input
            label="endereço"
            placeholder=""
            defaultValue={
              (selectedId && findCustomer(selectedId)?.address) || ""
            }
            name="address"
          />
        </form>
      </Modal>
    </div>
  );
}
