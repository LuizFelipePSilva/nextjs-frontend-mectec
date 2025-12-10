"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export type Task = {
  id: string;
  name: string;
  price: number;
  description: string;
  status: string;
  machine: {
    model: string;
    brand: string;
    customer: { name: string };
  };
};

export type Order = {
  orderId: number;
  description: string;
  status: string;
  createdAt: string;
  tasks: Task[];
};

type PageData<T> = {
  content: T[];
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
};

const API_URL = process.env.NEXT_PUBLIC_API_URL + "/api/v1";

async function getAuthHeaders() {
  const cookiesStore = await cookies();
  const token = cookiesStore.get("token")?.value;

  if (!token) {
    redirect("/Login");
  }

  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
}

export const loadOrdersData = async (
  search: string,
  page: number,
  size: number,
) => {
  const headers = await getAuthHeaders();

  try {
    const res = await fetch(`${API_URL}/orders?page=${page}&size=${size}`, {
      method: "GET",
      headers,
    });

    if (res.status === 401) redirect("/Login");
    if (!res.ok) return { content: [], totalPages: 0 };

    const pageData: PageData<Order> = await res.json();

    const ordersFull = await Promise.all(
      pageData.content.map(async (o: Order) => {
        if (search && !o.orderId.toString().includes(search)) return null;

        const resOrder = await fetch(`${API_URL}/orders/${o.orderId}`, {
          headers,
        });
        const orderFull: Order = await resOrder.json();

        const fullTasks = await Promise.all(
          orderFull.tasks.map(async (t: Task) => {
            const resTask = await fetch(`${API_URL}/tasks/${t.id}`, {
              headers,
            });
            return resTask.json() as Promise<Task>;
          }),
        );

        return { ...orderFull, tasks: fullTasks };
      }),
    );

    const filteredOrders = ordersFull.filter((o): o is Order => o !== null);

    return {
      content: filteredOrders,
      totalPages: pageData.totalPages,
    };
  } catch (error) {
    return { content: [], totalPages: 0 };
  }
};

export const loadAllTasks = async (): Promise<Task[]> => {
  const headers = await getAuthHeaders();
  const res = await fetch(`${API_URL}/tasks`, { headers });
  if (!res.ok) return [];
  const data: PageData<Task> = await res.json();
  return data.content;
};

export const getOrderDetails = async (id: number): Promise<Order | null> => {
  const headers = await getAuthHeaders();
  const resOrder = await fetch(`${API_URL}/orders/${id}`, { headers });
  if (!resOrder.ok) return null;

  const order: Order = await resOrder.json();
  const fullTasks = await Promise.all(
    order.tasks.map(async (t: Task) => {
      const resTask = await fetch(`${API_URL}/tasks/${t.id}`, { headers });
      return resTask.json() as Promise<Task>;
    }),
  );

  return { ...order, tasks: fullTasks };
};

type CreateState = {
  success: boolean;
  errors?: string;
};

export const createOrderAction = async (
  state: CreateState,
  formData: FormData,
): Promise<CreateState> => {
  const headers = await getAuthHeaders();
  const description = formData.get("description")?.toString() || "";
  const taskIds = formData.getAll("taskIds");

  const data = {
    description,
    taskIds,
  };

  const res = await fetch(`${API_URL}/orders`, {
    method: "POST",
    headers,
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    return { success: false, errors: "Erro ao criar pedido" };
  }

  return { success: true };
};

export const deleteOrderAction = async (id: number) => {
  const headers = await getAuthHeaders();
  await fetch(`${API_URL}/orders/${id}`, {
    method: "DELETE",
    headers,
  });
};

export const approveOrderAction = async (id: number) => {
  const headers = await getAuthHeaders();
  await fetch(`${API_URL}/orders/${id}/close`, {
    method: "PATCH",
    headers,
  });
};

export const removeTaskFromOrderAction = async (
  orderId: number,
  taskId: string,
) => {
  const headers = await getAuthHeaders();
  await fetch(`${API_URL}/orders/task?orderId=${orderId}&taskId=${taskId}`, {
    method: "DELETE",
    headers,
  });
};
