"use client";

import "./styles.css";

import { Input } from "@/components/Inputs";
import { Button } from "@/components/Buttons";
import { useActionState, useEffect, useState } from "react";
import { Modal } from "@/components/Modals";
import { createAction, deleteUser, loadData, resetUser } from "./actions";
import Pagination from "@/components/Pagination";

type User = {
  id: string;
  username: string;
  email: string;
  role: "ADMIN" | "USER";
};

type ModalActionType = "delete" | "reset";
type ModalType = "create" | ModalActionType;

export default function UserPage() {
  const [users, setUsers] = useState<User[]>();

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const [modalOpen, setModalOpen] = useState<ModalType | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const [createState, createFormAction, createPending] = useActionState(
    createAction,
    {
      success: false,
      username: "",
      email: "",
    }
  );

  const onCLickDelete = async () => {
    await deleteUser(selectedId!);
    load();
    closeModal();
  };

  const onCLickReset = async () => {
    await resetUser(selectedId!);
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

  const findUser = (id: string) => {
    return users?.find((user) => user.id == id);
  };

  const load = async () => {
    const data = await loadData(search, page);
    setUsers(data.content);
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

  return (
    <div className="page-container">
      <main className="main-content">
        <h1 className="page-title">Gerenciamento de Usuários</h1>

        <div className="controls-bar">
          <div>
            <Input
              placeholder="Buscar usuários..."
              label="Pesquisa"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
              }}
            />
          </div>
          <div>
            <Button onClick={openCreateModal} fullWidth>
              + Novo usuário
            </Button>
          </div>
        </div>

        <table className="user-table">
          <thead>
            <tr>
              <th className="table-head-cell">Id</th>
              <th className="table-head-cell">Username</th>
              <th className="table-head-cell">Email</th>
              <th className="table-head-cell">Cargo</th>
              <th className="table-head-cell">Ações</th>
            </tr>
          </thead>
          {users && (
            <tbody>
              {users.map((user, i) => (
                <tr key={i} className="table-row">
                  <td className="table-cell">{user.id}</td>
                  <td className="table-cell">{user.username}</td>
                  <td className="table-cell">{user.email}</td>
                  <td className="table-cell">{user.role}</td>
                  <td className="table-cell">
                    <div>
                      <Button
                        variant="icon"
                        disabled={user.role == "ADMIN"}
                        onClick={() => openActionModal("delete", user.id)}
                      >
                        🗑️
                      </Button>
                      <Button
                        variant="icon"
                        disabled={user.role == "ADMIN"}
                        onClick={() => openActionModal("reset", user.id)}
                      >
                        🔐
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
            Criar Usuário
          </Button>
        }
      >
        <form id="create-form" className="modal-form" action={createFormAction}>
          {createState.errors && (
            <div className="form-error">⚠️ {createState.errors}</div>
          )}
          <Input
            label="username"
            placeholder="Gabriel"
            name="username"
            defaultValue={createState.username}
          />
          <Input
            label="email"
            type="email"
            placeholder="gabriel@example"
            name="email"
            defaultValue={createState.email}
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
          Tem certeza que deseja remove o usuário{" "}
          {findUser(selectedId!)?.username}
        </p>
      </Modal>

      <Modal
        isOpen={modalOpen == "reset"}
        onClose={closeModal}
        title="Redefinir"
        footer={
          <>
            <Button variant="ghost" onClick={closeModal} fullWidth>
              Cancelar
            </Button>
            <Button variant="danger" onClick={onCLickReset} fullWidth>
              Confirmar
            </Button>
          </>
        }
      >
        <p>
          Tem certeza que deseja redefinir a senha do{" "}
          {findUser(selectedId!)?.username}
        </p>
        <input hidden defaultValue={selectedId!} />
      </Modal>
    </div>
  );
}
