"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

type LoginState = {
  errors?: string;
};

export const loginAction = async (
  state: LoginState,
  formData: FormData
): Promise<LoginState> => {
  const username = formData.get("username")?.toString() || "";
  const password = formData.get("password")?.toString() || "";

  const data = {
    username: username.trim(),
    password: password.trim(),
  };

  const response = await fetch(
    process.env.NEXT_PUBLIC_API_URL + "/api/v1/auth/login",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    }
  );

  const res = await response.json();

  if (res.error) {
    if (res.error == "Invalid credentials") {
      return {
        errors: "Usuário ou senha invalido",
      };
    }
    return {
      errors: "Aconteceu um error inesperado",
    };
  }

  const cookiesStore = await cookies();
  cookiesStore.set("token", res.token);

  redirect("/");
};
