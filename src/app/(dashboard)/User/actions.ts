"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const API_URL = process.env.NEXT_PUBLIC_API_URL + "/api/v1/users";

type JsonMessage = {
  message: string;
  validationErrors?: {
    username: string;
    email: string;
  };
};

const errorMessage = (json: JsonMessage) => {
  if (json.validationErrors?.username) {
    return "O username deve ter entre 5 e 20 caracteres";
  }

  if (json.validationErrors?.email) {
    return "O email deve ser válido";
  }

  const message = json.message;
  const messagePtBr: Record<string, string> = {
    "A user with this username already exists.":
      "Já existe um usuário com esse username",
    "A user with this email already exists.":
      "Já existe um usuário com esse email",
  };

  return messagePtBr[message] || "Error inesperado";
};

export const loadData = async (search: string | null, page: number) => {
  const cookiesStore = await cookies();
  const token = cookiesStore.get("token")?.value;

  if (!token) {
    redirect("/Login");
  }

  const res = await fetch(
    API_URL + `?searchTerm=${search}&page=${page}&size=10`,
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

  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  const json = await response.json();

  if (response.status != 201) {
    return {
      success: false,
      errors: errorMessage(json),
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

  const res = await fetch(API_URL + "/" + id, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

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

  const res = await fetch(API_URL + "/" + id, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (res.status == 401) {
    redirect("/Login");
  }
};
