"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export type Machine = {
    id: string; 
    model: string;
    brand: string;
    category: "POWER_TOOL" | "HOME_APPLIANCE" | "SMALL_APPLIANCE" | "BEAUTY_SALON";
    description: string;
    customer: {
        id: string;
        name: string;
    };
};

export type CustomerOption = {
    id: string;
    name: string;
};

type PageData<T> = {
    content: T[];
    totalPages: number;
    totalElements: number;
};

type ActionResult = {
    success: boolean;
    message?: string;
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

export const loadCustomersForSelect = async (): Promise<CustomerOption[]> => {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_URL}/customers?page=0&size=100`, { headers });
    if (!res.ok) return [];
    const data = await res.json();
    return data.content.map((c: any) => ({ id: c.id, name: c.name }));
};
export const createMachineAction = async (formData: FormData): Promise<ActionResult> => {
    const headers = await getAuthHeaders();

    const body = {
        model: formData.get("model")?.toString(),
        brand: formData.get("brand")?.toString(),
        category: formData.get("category")?.toString(),
        description: formData.get("description")?.toString(),
        customerID: formData.get("customerID")?.toString(),
    };

    const res = await fetch(`${API_URL}/machines`, {
        method: "POST",
        headers,
        body: JSON.stringify(body),
    });

    if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        return {
            success: false,
            message: errorData.message || "Erro ao criar máquina. Verifique os dados."
        };
    }

    return { success: true };
};

export const updateMachineAction = async (id: string, formData: FormData): Promise<ActionResult> => {
    const headers = await getAuthHeaders();

    const body = {
        id,
        model: formData.get("model")?.toString(),
        brand: formData.get("brand")?.toString(),
        category: formData.get("category")?.toString(),
        description: formData.get("description")?.toString(),
        customerID: formData.get("customerID")?.toString(),
    };

    const res = await fetch(`${API_URL}/machines/${id}`, {
        method: "PUT",
        headers,
        body: JSON.stringify(body),
    });

    if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        return {
            success: false,
            message: errorData.message || "Erro ao atualizar máquina."
        };
    }

    return { success: true };
};

export const deleteMachineAction = async (id: string) => {
    const headers = await getAuthHeaders();
    await fetch(`${API_URL}/machines/${id}`, {
        method: "DELETE",
        headers,
    });
};