"use client";

import { useEffect, useState, useCallback } from "react";
import "./styles.css";

import { Button } from "@/components/Buttons";
import { Input } from "@/components/Inputs";
import { Modal } from "@/components/Modals";

import {
  loadPiecesData,
  getPieceDetails,
  createPieceAction,
  updatePieceAction,
  deletePieceAction,
  type Piece,
} from "./actions";

export default function PiecePage() {
  const [modal, setModal] = useState<"criar" | "editar" | "deletar" | null>(
    null,
  );
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const [items, setItems] = useState<Piece[]>([]);
  const [totalPages, setTotalPages] = useState(0);
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState("");

  const [editing, setEditing] = useState<Piece | null>(null);

  const [createData, setCreateData] = useState({
    name: "",
    price: "",
    brand: "",
    description: "",
  });

  const close = useCallback(() => {
    setModal(null);
    setSelectedId(null);
    setEditing(null);
    setCreateData({
      name: "",
      price: "",
      brand: "",
      description: "",
    });
  }, []);

  const open = useCallback(
    async (type: "criar" | "editar" | "deletar", id: number | null = null) => {
      setModal(type);
      setSelectedId(id);

      if (type === "editar" && id) {
        const data = await getPieceDetails(id);
        if (data) setEditing(data);
      }
    },
    [],
  );

  useEffect(() => {
    let mounted = true;
    (async () => {
      const data = await loadPiecesData(page, 10);
      if (!mounted) return;
      setItems(data.content);
      setTotalPages(data.totalPages);
    })();
    return () => {
      mounted = false;
    };
  }, [page]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const fd = new FormData();
    fd.set("name", createData.name);
    fd.set("price", String(Number(createData.price)));
    fd.set("brand", createData.brand);
    fd.set("description", createData.description);

    await createPieceAction(fd);
    close();
    const data = await loadPiecesData(page, 10);
    setItems(data.content);
    setTotalPages(data.totalPages);
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing) return;
    await updatePieceAction(editing.id, editing);
    close();
    const data = await loadPiecesData(page, 10);
    setItems(data.content);
    setTotalPages(data.totalPages);
  };

  const handleDelete = async () => {
    if (!selectedId) return;
    await deletePieceAction(selectedId);
    close();
    const data = await loadPiecesData(page, 10);
    setItems(data.content);
    setTotalPages(data.totalPages);
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
        isOpen={modal === "criar"}
        onClose={close}
        title="Criar Nova Peça"
        footer={
          <Button type="submit" form="form-criar" fullWidth>
            Criar
          </Button>
        }
      >
        <form id="form-criar" onSubmit={handleCreate}>
          <Input
            label="Nome"
            required
            onInvalid={(e) =>
              (e.target as HTMLInputElement).setCustomValidity(
                "Campo obrigatório",
              )
            }
            onInput={(e) =>
              (e.target as HTMLInputElement).setCustomValidity("")
            }
            value={createData.name}
            onChange={(e) =>
              setCreateData({ ...createData, name: e.target.value })
            }
          />

          <Input
            label="Preço"
            type="number"
            required
            placeholder="0"
            onInvalid={(e) =>
              (e.target as HTMLInputElement).setCustomValidity(
                "Campo obrigatório",
              )
            }
            onInput={(e) =>
              (e.target as HTMLInputElement).setCustomValidity("")
            }
            value={createData.price}
            onChange={(e) =>
              setCreateData({ ...createData, price: e.target.value })
            }
          />

          <Input
            label="Marca"
            required
            onInvalid={(e) =>
              (e.target as HTMLInputElement).setCustomValidity(
                "Campo obrigatório",
              )
            }
            onInput={(e) =>
              (e.target as HTMLInputElement).setCustomValidity("")
            }
            value={createData.brand}
            onChange={(e) =>
              setCreateData({ ...createData, brand: e.target.value })
            }
          />

          <Input
            label="Descrição"
            isTextArea
            required
            onInvalid={(e) =>
              (e.target as HTMLTextAreaElement).setCustomValidity(
                "Campo obrigatório",
              )
            }
            onInput={(e) =>
              (e.target as HTMLTextAreaElement).setCustomValidity("")
            }
            value={createData.description}
            onChange={(e) =>
              setCreateData({ ...createData, description: e.target.value })
            }
          />
        </form>
      </Modal>

      <Modal
        isOpen={modal === "editar"}
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
            required
            onInvalid={(e) =>
              (e.target as HTMLInputElement).setCustomValidity(
                "Campo obrigatório",
              )
            }
            onInput={(e) =>
              (e.target as HTMLInputElement).setCustomValidity("")
            }
            value={editing?.name || ""}
            onChange={(e) => setEditing({ ...editing!, name: e.target.value })}
          />

          <Input
            label="Preço"
            type="number"
            required
            onInvalid={(e) =>
              (e.target as HTMLInputElement).setCustomValidity(
                "Campo obrigatório",
              )
            }
            onInput={(e) =>
              (e.target as HTMLInputElement).setCustomValidity("")
            }
            value={editing?.price || ""}
            onChange={(e) =>
              setEditing({ ...editing!, price: Number(e.target.value) })
            }
          />

          <Input
            label="Marca"
            required
            onInvalid={(e) =>
              (e.target as HTMLInputElement).setCustomValidity(
                "Campo obrigatório",
              )
            }
            onInput={(e) =>
              (e.target as HTMLInputElement).setCustomValidity("")
            }
            value={editing?.brand || ""}
            onChange={(e) => setEditing({ ...editing!, brand: e.target.value })}
          />

          <Input
            label="Descrição"
            isTextArea
            required
            onInvalid={(e) =>
              (e.target as HTMLTextAreaElement).setCustomValidity(
                "Campo obrigatório",
              )
            }
            onInput={(e) =>
              (e.target as HTMLTextAreaElement).setCustomValidity("")
            }
            value={editing?.description || ""}
            onChange={(e) =>
              setEditing({ ...editing!, description: e.target.value })
            }
          />
        </form>
      </Modal>

      <Modal
        isOpen={modal === "deletar"}
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
