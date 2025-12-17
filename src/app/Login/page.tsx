"use client";

import "./styles.css";

import { loginAction } from "./actions";

import { Input } from "@/components/Inputs";
import { Button } from "@/components/Buttons";

import { useActionState } from "react";

export default function LoginPage() {
  const [loginState, loginFormAction, loginPending] = useActionState(
    loginAction,
    {}
  );
  return (
    <div style={{ flex: 1, backgroundColor: "#f9f9f9" }}>
      <div className="login-container">
        <div className="login-content">
          <h1 className="login-title">Login</h1>
          <form action={loginFormAction} className="login-form">
            {loginState.errors && (
              <div className="login-error">⚠️ {loginState.errors}</div>
            )}
            <Input label="username" name="username" />
            <Input label="senha" type="password" name="password" />
            <Button disabled={loginPending}>Login</Button>
          </form>
        </div>
      </div>
    </div>
  );
}
