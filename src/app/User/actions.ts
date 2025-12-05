"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export const loadData = async (search: string | null, page: number) => {
  const cookiesStore = await cookies();
  const token = cookiesStore.get("token")?.value;

  if (!token) {
    redirect("/Login");
  }

  const res = await fetch(
    process.env.NEXT_PUBLIC_API_URL +
      "/api/v1/users" +
      `?searchTerm=${search}&page=${page}&size=5`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }
  );

  if (res.status == 401) {
    redirect("/Login");
  }

  const json = await res.json();

  return {
    content: json.content,
    totalPages: json.totalPages,
  };
};

type createState = {
  success: boolean;
  errors?: string;
  username: string;
  email: string;
};

export const createAction = async (
  state: createState,
  formData: FormData
): Promise<createState> => {
  const username = formData.get("username")?.toString() || "";
  const email = formData.get("email")?.toString() || "";

  const data = {
    username: username.trim(),
    email: email.trim(),
  };

  const cookiesStore = await cookies();
  const token = cookiesStore.get("token")?.value;

  if (!token) {
    redirect("/Login");
  }

  const response = await fetch(
    process.env.NEXT_PUBLIC_API_URL + "/api/v1/users",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    }
  );

  const res = await response.json();

  if (response.status != 201) {
    const message = res.message;
    const messagePtBr: Record<string, string> = {
      "A user with this username already exists.":
        "Já existe um usuário com esse username",
      "A user with this email already exists.":
        "Já existe um usuário com esse email",
    };

    return {
      success: false,
      errors: messagePtBr[message] || "Aconteceu um error inesperado",
      username,
      email,
    };
  }

  return {
    success: true,
    username: "",
    email: "",
  };
};

export const deleteUser = async (id: string) => {
  const cookiesStore = await cookies();
  const token = cookiesStore.get("token")?.value;

  if (!token) {
    redirect("/Login");
  }

  const res = await fetch(
    process.env.NEXT_PUBLIC_API_URL + "/api/v1/users/" + id,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }
  );

  if (res.status == 401) {
    redirect("/Login");
  }
};

export const resetUser = async (id: string) => {
  const cookiesStore = await cookies();
  const token = cookiesStore.get("token")?.value;

  if (!token) {
    redirect("/Login");
  }

  const res = await fetch(
    process.env.NEXT_PUBLIC_API_URL + "/api/v1/users/" + id,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }
  );

  if (res.status == 401) {
    redirect("/Login");
  }
};
