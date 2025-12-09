"use client";
import { useEffect, useState } from "react";
import "./styles.css";

import { Button } from "@/components/Buttons";
import { Input } from "@/components/Inputs";
import { Modal } from "@/components/Modals";

export type Piece = {
  id: number;
  name: string;
  price: number;
  brand: string;
  description: string;
};

export type PiecesResponse = {
  content: Piece[];
  totalPages: number;
  totalElements: number;
  number: number;
  size: number;
};

export default function OrderPage() {
  const [modalType, setModalType] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const token =
    "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJhZG1pbiIsInJvbGVzIjpbIlJPTEVfQURNSU4iXSwiaWF0IjoxNzY1Mjk3NzYwLCJleHAiOjE3NjUzMDEzNjB9.GfAbN8WivI_GU3_UOjhj48DEav_vODdE7KR20TaWix0";
  const [page, setPage] = useState(0);
  const size = 10;

  const [items, setItems] = useState<Piece[]>([]);
  const [totalPages, setTotalPages] = useState(0);
  const [editData, setEditData] = useState<Piece | null>(null);
  const [createData, setCreateData] = useState({
    name: "",
    price: 0,
    brand: "",
    description: "",
  });
  const [search, setSearch] = useState("");

  const reload = () => {
    fetch(`http://localhost:8080/api/v1/pieces?page=${page}&size=${size}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((d: PiecesResponse) => {
        setItems(d.content);
        setTotalPages(d.totalPages);
      });
  };

  useEffect(reload, [page, token]);

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editData) return;

    await fetch(`http://localhost:8080/api/v1/pieces/${editData.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(editData),
    });

    close();
    reload();
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();

    await fetch("http://localhost:8080/api/v1/pieces", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(createData),
    });
    close();
    reload();
  };

  const handleDelete = async () => {
    if (!selectedId) return;

    await fetch(`http://localhost:8080/api/v1/pieces/${selectedId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });

    close();
    reload();
  };

  const open = (type: string, id: number | null = null) => {
    setModalType(type);
    setSelectedId(id);

    if (type === "editar" && id) {
      const item = items.find((x) => x.id === id);
      if (item) setEditData(item);
    }
  };

  const close = () => {
    setModalType(null);
    setSelectedId(null);
    setEditData(null);
    setCreateData({
      name: "",
      price: 0,
      brand: "",
      description: "",
    });
  };

  return (
    <div className="page-container">
      <main className="main-content">
        <h1 className="page-title">Gerenciamento de Peças</h1>

        <div className="controls-bar">
          <div style={{ flex: 1 }}>
            <Input
              placeholder="Buscar peças..."
              label="Pesquisa"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
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
            {items
              .filter(
                (x) =>
                  x.name.toLowerCase().includes(search.toLowerCase()) ||
                  x.brand.toLowerCase().includes(search.toLowerCase()) ||
                  x.description.toLowerCase().includes(search.toLowerCase()),
              )
              .map((item) => (
                <tr key={item.id} className="table-row">
                  <td className="table-cell">{item.name}</td>
                  <td className="table-cell">{item.price}</td>
                  <td className="table-cell">{item.brand}</td>
                  <td className="table-cell">{item.description}</td>
                  <td className="table-cell">
                    <div
                      style={{
                        display: "flex",
                        gap: "0.5rem",
                        justifyContent: "flex-end",
                      }}
                    >
                      <Button
                        variant="icon"
                        onClick={() => open("deletar", item.id)}
                      >
                        🗑️
                      </Button>
                      <Button
                        variant="icon"
                        onClick={() => open("editar", item.id)}
                      >
                        ✏️
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>

        <div className="pagination">
          <Button disabled={page === 0} onClick={() => setPage(page - 1)}>
            Prev
          </Button>

          <span>
            {page + 1} / {totalPages}
          </span>

          <Button
            disabled={page + 1 >= totalPages}
            onClick={() => setPage(page + 1)}
          >
            Next
          </Button>
        </div>
      </main>

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
        <form id="form-criar" onSubmit={handleCreate}>
          <Input
            label="Nome"
            value={createData.name}
            onChange={(e) =>
              setCreateData({ ...createData, name: e.target.value })
            }
          />
          <Input
            label="Preço"
            value={createData.price}
            onChange={(e) =>
              setCreateData({ ...createData, price: Number(e.target.value) })
            }
          />
          <Input
            label="Marca"
            value={createData.brand}
            onChange={(e) =>
              setCreateData({ ...createData, brand: e.target.value })
            }
          />
          <Input
            label="Descrição"
            isTextArea
            value={createData.description}
            onChange={(e) =>
              setCreateData({ ...createData, description: e.target.value })
            }
          />
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
        <form id="form-editar" onSubmit={handleEdit}>
          <Input
            label="Nome"
            value={editData?.name || ""}
            onChange={(e) =>
              setEditData({ ...editData!, name: e.target.value })
            }
          />
          <Input
            label="Preço"
            value={editData?.price || ""}
            onChange={(e) =>
              setEditData({ ...editData!, price: Number(e.target.value) })
            }
          />
          <Input
            label="Marca"
            value={editData?.brand || ""}
            onChange={(e) =>
              setEditData({ ...editData!, brand: e.target.value })
            }
          />
          <Input
            label="Descrição"
            isTextArea
            value={editData?.description || ""}
            onChange={(e) =>
              setEditData({ ...editData!, description: e.target.value })
            }
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
            <Button variant="danger" onClick={handleDelete}>
              Confirmar
            </Button>
          </>
        }
      >
        <p>Tem certeza que deseja remover a peça #{selectedId}?</p>
      </Modal>
    </div>
  );
}
