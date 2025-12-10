"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export type Piece = {
  id: number;
  name: string;
  price: number;
  brand: string;
  description: string;
};

type PageData<T> = {
  content: T[];
  totalPages: number;
  number: number;
  size: number;
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

export const loadPiecesData = async (page: number, size: number) => {
  const headers = await getAuthHeaders();
  const res = await fetch(`${API_URL}/pieces?page=${page}&size=${size}`, {
    headers,
  });

  if (res.status === 401) redirect("/Login");
  if (!res.ok) return { content: [], totalPages: 0 };

  const data: PageData<Piece> = await res.json();
  return { content: data.content, totalPages: data.totalPages };
};

export const getPieceDetails = async (id: number): Promise<Piece | null> => {
  const headers = await getAuthHeaders();
  const res = await fetch(`${API_URL}/pieces/${id}`, { headers });
  if (!res.ok) return null;
  return res.json();
};

export const createPieceAction = async (formData: FormData) => {
  const headers = await getAuthHeaders();
  const body = {
    name: formData.get("name")?.toString() || "",
    price: Number(formData.get("price") || 0),
    brand: formData.get("brand")?.toString() || "",
    description: formData.get("description")?.toString() || "",
  };

  await fetch(`${API_URL}/pieces`, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });
};

export const updatePieceAction = async (id: number, data: Piece) => {
  const headers = await getAuthHeaders();
  await fetch(`${API_URL}/pieces/${id}`, {
    method: "PUT",
    headers,
    body: JSON.stringify(data),
  });
};

export const deletePieceAction = async (id: number) => {
  const headers = await getAuthHeaders();
  await fetch(`${API_URL}/pieces/${id}`, {
    method: "DELETE",
    headers,
  });
};
