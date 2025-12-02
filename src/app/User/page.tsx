"use client";

import "./styles.css";

import { Input } from "@/components/Inputs";
import { Button } from "@/components/Buttons";
import { useEffect, useState } from "react";
import { Modal } from "@/components/Modals";

type User = {
  id: string;
  username: string;
  email: string;
  cargo: "admin" | "user";
};

type ModalActionType = "delete" | "reset";
type ModalType = "create" | ModalActionType;

export default function UserPage() {
  const [users, setUsers] = useState<User[] | null>(null);
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

  const findUser = (id: string) => {
    return users?.find((user) => user.id == id);
  };

  useEffect(() => {
    setUsers([
      {
        id: "8d0c2c22-9892-4de8-a2f6-3888b15d5f27",
        username: "Admin",
        email: "admin@example.com",
        cargo: "admin",
      },
      {
        id: "b1bbc2af-bf16-4413-b66b-a37db7df8cb8",
        username: "User1",
        email: "user1@example.com",
        cargo: "user",
      },
      {
        id: "f4862f05-3994-4a72-8b80-0a619d6678dc",
        username: "User2",
        email: "user2@example.com",
        cargo: "user",
      },
    ]);
  }, []);

  return (
    <div className="page-container">
      <main className="main-content">
        <h1 className="page-title">Gerenciamento de Usuários</h1>

        <div className="controls-bar">
          <div>
            <Input placeholder="Buscar usuários..." label="Pesquisa" />
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
                  <td className="table-cell">{user.cargo}</td>
                  <td className="table-cell">
                    <div>
                      <Button
                        variant="icon"
                        onClick={() => openActionModal("delete", user.id)}
                      >
                        🗑️
                      </Button>
                      <Button
                        variant="icon"
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
        {!users && <span className="load-message">Carregando...</span>}
      </main>

      <Modal
        isOpen={modalOpen == "create"}
        onClose={closeModal}
        title="Criar Novo Usuário"
        footer={
          <Button type="submit" fullWidth>
            Criar Usuário
          </Button>
        }
      >
        <form className="modal-form">
          <Input label="username" placeholder="Gabriel" />
          <Input label="email" placeholder="gabriel@example" />
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
            <Button variant="danger" onClick={closeModal} fullWidth>
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
