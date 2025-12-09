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
      "/api/v1/customers" +
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

  console.log(data);

  const cookiesStore = await cookies();
  const token = cookiesStore.get("token")?.value;

  if (!token) {
    redirect("/Login");
  }

  const response = await fetch(
    process.env.NEXT_PUBLIC_API_URL + "/api/v1/customers",
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
      "A customer with this cpf, phone or email already exists.":
        "Um cliente com esse cpf, telefone ou email já existe",
    };

    return {
      success: false,
      errors: messagePtBr[message] || "Aconteceu um error inesperado",
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

  const response = await fetch(
    process.env.NEXT_PUBLIC_API_URL + "/api/v1/customers",
    {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    }
  );

  const res = await response.json();

  if (response.status != 200) {
    const message = res.message;
    const messagePtBr: Record<string, string> = {
      "A user with this username already exists.":
        "Já existe um usuário com esse username",
      "A user with this email already exists.":
        "Já existe um usuário com esse email",
    };

    return {
      success: false,
      errors: messagePtBr[message] || message,
    };
  }

  return {
    success: true,
  };
};
