"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const API_URL = process.env.NEXT_PUBLIC_API_URL + "/api/v1/customers";

type JsonMessage = {
  message: string;
  validationErrors?: {
    name?: string;
    cpf?: string;
    phone?: string;
    email?: string;
    address?: string;
  };
};

const errorMessage = (json: JsonMessage) => {
  if (json.validationErrors?.name) {
    return "O nome é obrigatório";
  }

  if (json.validationErrors?.cpf) {
    return "O cpf deve ter exatamente 11 dígitos";
  }

  if (json.validationErrors?.phone) {
    return "O telefone deve ter entre 1 à 20 dígitos";
  }

  if (json.validationErrors?.email) {
    return "O email deve ser válido";
  }

  if (json.validationErrors?.address) {
    return "O endereço é obrigatório";
  }

  const message = json.message;
  const messagePtBr: Record<string, string> = {
    "A customer with this cpf, phone or email already exists.":
      "Um cliente com esse cpf, telefone ou email já existe",
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
    API_URL + `?searchTerm=${search}&page=${page}&size=5`,
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
  name: string;
  cpf: string;
  phone: string;
  email: string;
  address: string;
};

export const createAction = async (
  state: createState,
  formData: FormData
): Promise<createState> => {
  const name = formData.get("name")?.toString() || "";
  const cpf = formData.get("cpf")?.toString() || "";
  const phone = formData.get("phone")?.toString() || "";
  const email = formData.get("email")?.toString() || "";
  const address = formData.get("address")?.toString() || "";

  const data = {
    name: name.trim(),
    cpf: cpf.trim(),
    phone: phone.trim(),
    email: email.trim(),
    address: address.trim(),
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
      name,
      cpf,
      phone,
      email,
      address,
    };
  }

  return {
    success: true,
    name: "",
    cpf: "",
    phone: "",
    email: "",
    address: "",
  };
};

export const deleteCustomer = async (id: string) => {
  const cookiesStore = await cookies();
  const token = cookiesStore.get("token")?.value;

  if (!token) {
    redirect("/Login");
  }

  const res = await fetch(
    process.env.NEXT_PUBLIC_API_URL + "/api/v1/customers/" + id,
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

type updateState = {
  success: boolean;
  errors?: string;
};

export const updateAction = async (
  state: updateState,
  formData: FormData
): Promise<updateState> => {
  const id = formData.get("id")?.toString() || "";
  const name = formData.get("name")?.toString() || "";
  const cpf = formData.get("cpf")?.toString() || "";
  const phone = formData.get("phone")?.toString() || "";
  const email = formData.get("email")?.toString() || "";
  const address = formData.get("address")?.toString() || "";

  const data = {
    id: id.trim(),
    name: name.trim(),
    cpf: cpf.trim(),
    phone: phone.trim(),
    email: email.trim(),
    address: address.trim(),
  };

  const cookiesStore = await cookies();
  const token = cookiesStore.get("token")?.value;

  if (!token) {
    redirect("/Login");
  }

  const response = await fetch(API_URL, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  const json = await response.json();

  if (response.status != 200) {
    return {
      success: false,
      errors: errorMessage(json),
    };
  }

  return {
    success: true,
  };
};
