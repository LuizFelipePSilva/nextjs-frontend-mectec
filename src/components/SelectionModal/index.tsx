import React, { useState, useEffect } from "react";
import { Modal } from "../Modals";
import { Input } from "../Inputs";
import { Button } from "../Buttons";
import "./styles.css";

type Option = {
    id: string | number;
    label: string;
};

interface SelectionModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    options: Option[];
    // Agora onConfirm aceita um valor único OU um array
    onConfirm: (selected: string | number | (string | number)[]) => void;
    // initialSelected também pode ser array
    initialSelected?: string | number | (string | number)[];
    multiple?: boolean; // Nova prop
}

export const SelectionModal = ({
    isOpen,
    onClose,
    title,
    options,
    onConfirm,
    initialSelected,
    multiple = false,
}: SelectionModalProps) => {
    const [search, setSearch] = useState("");

    // Estado interno agora é sempre um Array para facilitar a lógica
    const [selectedIds, setSelectedIds] = useState<(string | number)[]>([]);

    useEffect(() => {
        if (isOpen) {
            setSearch("");
            if (initialSelected === undefined || initialSelected === null) {
                setSelectedIds([]);
            } else if (Array.isArray(initialSelected)) {
                setSelectedIds(initialSelected);
            } else {
                setSelectedIds([initialSelected]);
            }
        }
    }, [isOpen, initialSelected]);

    const filteredOptions = options.filter((opt) =>
        opt.label.toLowerCase().includes(search.toLowerCase())
    );

    const handleSelect = (id: string | number) => {
        if (multiple) {
            // Lógica Toggle para Múltipla escolha
            if (selectedIds.includes(id)) {
                setSelectedIds(selectedIds.filter((item) => item !== id));
            } else {
                setSelectedIds([...selectedIds, id]);
            }
        } else {
            // Lógica Substituir para Única escolha
            setSelectedIds([id]);
        }
    };

    const handleConfirm = () => {
        if (multiple) {
            onConfirm(selectedIds); // Retorna Array
        } else {
            // Retorna valor único (o primeiro do array) ou null se vazio
            if (selectedIds.length > 0) {
                onConfirm(selectedIds[0]);
            }
        }
        onClose();
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={title}
            footer={
                <Button onClick={handleConfirm} fullWidth disabled={selectedIds.length === 0}>
                    Confirmar
                </Button>
            }
        >
            <div className="selection-modal-body">
                <Input
                    placeholder="Buscar..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    autoFocus
                />

                <ul className="selection-list">
                    {filteredOptions.map((opt) => {
                        const isSelected = selectedIds.includes(opt.id);
                        return (
                            <li
                                key={opt.id}
                                className={`selection-item ${isSelected ? "selected" : ""}`}
                                onClick={() => handleSelect(opt.id)}
                            >
                                <input
                                    type={multiple ? "checkbox" : "radio"} // Muda o input visualmente
                                    checked={isSelected}
                                    readOnly
                                    className="selection-radio"
                                />
                                <span>{opt.label}</span>
                            </li>
                        );
                    })}
                    {filteredOptions.length === 0 && (
                        <li className="no-results">Nenhum resultado encontrado.</li>
                    )}
                </ul>
            </div>
        </Modal>
    );
};