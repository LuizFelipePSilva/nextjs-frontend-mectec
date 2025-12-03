"use server";

type LoginState = {
  username?: string;
  password?: string;
};

export const loginAction = async (
  state: LoginState,
  formData: FormData
): Promise<LoginState> => {

  const username = formData.get("username")?.toString() || "";
  const password = formData.get("senha")?.toString() || "";

  const data = {
    username: username.trim(),
    password: password.trim(),
  };

  console.log(data)

  if (data.username.length < 3) {
    return {
      username: "precisa ter pelo menos 3 caracteres",
    };
  }

  return {
  };
};