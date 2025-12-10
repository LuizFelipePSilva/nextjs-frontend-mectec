"use server";

import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";

const adminPaths = ["/User"];

export const loadUserData = async (path: string) => {
  const cookiesStore = await cookies();
  const token = cookiesStore.get("token")?.value;

  const headersStore = await headers();

  if (!token) {
    redirect("/Login");
  }

  const data = JSON.parse(decodeURIComponent(atob(token!.split(".")[1])));

  const admin = data.roles[0] == "ROLE_ADMIN";
  const username = data.sub as string;

  if (!admin && adminPaths.includes(path)) {
    redirect("/");
  }

  return {
    admin,
    username,
  };
};

type changePasswordState = {
  success: boolean;
  errors?: string;
  oldPassword: string;
  newPassword: string;
  confirm: string;
};

export const changePasswordAction = async (
  state: changePasswordState,
  formData: FormData
): Promise<changePasswordState> => {
  const oldPassword = formData.get("oldPassword")?.toString() || "";
  const newPassword = formData.get("newPassword")?.toString() || "";
  const confirm = formData.get("confirm")?.toString() || "";

  const data = {
    oldPassword: oldPassword.trim(),
    newPassword: newPassword.trim(),
  };

  if (confirm.trim() != data.newPassword) {
    return {
      success: false,
      errors: "A senha está diferente",
      oldPassword,
      newPassword,
      confirm: "",
    };
  }

  const cookiesStore = await cookies();
  const token = cookiesStore.get("token")?.value;

  if (!token) {
    redirect("/Login");
  }

  const response = await fetch(
    process.env.NEXT_PUBLIC_API_URL + "/api/v1/users",
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    }
  );

  if (response.status != 204) {
    const res = await response.json();
    const message = res.message;
    const messagePtBr: Record<string, string> = {
      "Old password is incorrect.": "Senha antiga está incorreta",
    };

    return {
      success: false,
      errors: messagePtBr[message] || "Aconteceu um error inesperado",
      oldPassword,
      newPassword,
      confirm,
    };
  }

  return {
    success: true,
    oldPassword: "",
    newPassword: "",
    confirm: "",
  };
};

export const logout = async () => {
  const cookiesStore = await cookies();
  cookiesStore.delete("token");
  redirect("/Login");
};
