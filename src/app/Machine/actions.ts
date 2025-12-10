"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

// Tipos baseados nos seus DTOs Java
export type Machine = {
    id: string; // UUID
    model: string;
    brand: string;
    category: "POWER_TOOL" | "HOME_APPLIANCE" | "SMALL_APPLIANCE" | "BEAUTY_SALON";
    description: string;
    customer: {
        id: string;
        name: string;
        // outros campos do customer se necessário
    };
};

// Tipo simplificado para o Select de Clientes
export type CustomerOption = {
    id: string;
    name: string;
};

type PageData<T> = {
    content: T[];
    totalPages: number;
    totalElements: number;
};

const API_URL = process.env.NEXT_PUBLIC_API_URL + "/api/v1";

async function getAuthHeaders() {
    const store = await cookies();
    const token = store.get("token")?.value;
    if (!token) redirect("/Login");

    return {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
    };
}

export const loadMachinesData = async (page: number, size: number) => {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_URL}/machines?page=${page}&size=${size}`, {
        headers,
    });

    if (res.status === 401) redirect("/Login");
    if (!res.ok) return { content: [], totalPages: 0 };

    const data: PageData<Machine> = await res.json();
    return { content: data.content, totalPages: data.totalPages };
};

// Busca todos os clientes para preencher o Modal (limitado a 100 para exemplo)
export const loadCustomersForSelect = async (): Promise<CustomerOption[]> => {
    const headers = await getAuthHeaders();
    // Buscando tamanho 100 para garantir que pegamos bastante gente para a lista
    const res = await fetch(`${API_URL}/customers?page=0&size=100`, { headers });
    if (!res.ok) return [];
    const data = await res.json();

    // Mapeia apenas o que o modal precisa
    return data.content.map((c: any) => ({ id: c.id, name: c.name }));
};

export const createMachineAction = async (formData: FormData) => {
    const headers = await getAuthHeaders();

    const body = {
        model: formData.get("model")?.toString(),
        brand: formData.get("brand")?.toString(),
        category: formData.get("category")?.toString(),
        description: formData.get("description")?.toString(),
        customerID: formData.get("customerID")?.toString(), // UUID
    };

    const res = await fetch(`${API_URL}/machines`, {
        method: "POST",
        headers,
        body: JSON.stringify(body),
    });

    if (!res.ok) {
        const err = await res.json();
        console.error("Erro ao criar:", err);
        // Aqui você poderia retornar o erro para mostrar na tela
    }
};

export const updateMachineAction = async (id: string, formData: FormData) => {
    const headers = await getAuthHeaders();

    const body = {
        id,
        model: formData.get("model")?.toString(),
        brand: formData.get("brand")?.toString(),
        category: formData.get("category")?.toString(),
        description: formData.get("description")?.toString(),
        customerID: formData.get("customerID")?.toString(),
    };

    await fetch(`${API_URL}/machines/${id}`, {
        method: "PUT",
        headers,
        body: JSON.stringify(body),
    });
};

export const deleteMachineAction = async (id: string) => {
    const headers = await getAuthHeaders();
    await fetch(`${API_URL}/machines/${id}`, {
        method: "DELETE",
        headers,
    });
};