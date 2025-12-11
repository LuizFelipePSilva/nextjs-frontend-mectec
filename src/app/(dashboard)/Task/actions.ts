"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export type TaskStatus = "PENDING" | "IN_PROGRESS" | "COMPLETED" | "CANCELED";

export type Task = {
    id: string;
    name: string;
    price: number;
    description: string;
    status: TaskStatus;
    machine: {
        id: string;
        model: string;
        customer?: { name: string };
    };
    pieces: {
        id: string;
        name: string;
        price: number;
    }[];
};

export type OptionItem = {
    id: string;
    label: string;
    price?: number; 
};

type PageData<T> = {
    content: T[];
    totalPages: number;
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


export const loadTasksData = async (page: number, size: number) => {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_URL}/tasks?page=${page}&size=${size}`, { headers });
    if (res.status === 401) redirect("/Login");
    if (!res.ok) return { content: [], totalPages: 0 };

    const data: PageData<Task> = await res.json();
    return { content: data.content, totalPages: data.totalPages };
};

export const loadMachinesForSelect = async (): Promise<OptionItem[]> => {
    const headers = await getAuthHeaders();
    // Buscando 100 maquinas para o exemplo
    const res = await fetch(`${API_URL}/machines?page=0&size=100`, { headers });
    if (!res.ok) return [];
    const data = await res.json();
    return data.content.map((m: any) => ({
        id: m.id,
        label: `${m.model} - ${m.brand} (${m.customer?.name || 'Sem Dono'})`
    }));
};

export const loadPiecesForSelect = async (): Promise<OptionItem[]> => {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_URL}/pieces?page=0&size=100`, { headers });
    if (!res.ok) return [];
    const data = await res.json();
    return data.content.map((p: any) => ({
        id: p.id,
        label: `${p.name} (R$ ${p.price})`,
        price: p.price
    }));
};

type ActionResult = {
    success: boolean;
    message?: string;
};

export const createTaskAction = async (formData: FormData): Promise<ActionResult> => {
    const headers = await getAuthHeaders();

    const piecesIdString = formData.get("piecesId")?.toString();
    const piecesId = piecesIdString ? JSON.parse(piecesIdString) : [];

    const body = {
        name: formData.get("name")?.toString(),
        price: Number(formData.get("price")),
        description: formData.get("description")?.toString(),
        status: "PENDING",
        machineId: formData.get("machineId")?.toString(),
        piecesId: piecesId,
    };

    const res = await fetch(`${API_URL}/tasks`, {
        method: "POST",
        headers,
        body: JSON.stringify(body),
    });

    if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        return {
            success: false,
            message: errorData.message || "Erro ao criar serviço. Verifique os dados."
        };
    }

    return { success: true };
};

export const updateTaskAction = async (id: string, formData: FormData): Promise<ActionResult> => {
    const headers = await getAuthHeaders();

    const piecesIdString = formData.get("piecesId")?.toString();
    const piecesId = piecesIdString ? JSON.parse(piecesIdString) : [];

    const body = {
        id,
        name: formData.get("name")?.toString(),
        price: Number(formData.get("price")),
        description: formData.get("description")?.toString(),
        status: formData.get("status")?.toString(),
        machineId: formData.get("machineId")?.toString(),
        piecesId: piecesId,
    };

    const res = await fetch(`${API_URL}/tasks/${id}`, {
        method: "PUT",
        headers,
        body: JSON.stringify(body),
    });

    if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        return {
            success: false,
            message: errorData.message || "Erro ao atualizar serviço."
        };
    }

    return { success: true };
};

export const deleteTaskAction = async (id: string) => {
    const headers = await getAuthHeaders();
    await fetch(`${API_URL}/tasks/${id}`, {
        method: "DELETE",
        headers,
    });
};