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
    <div className="login-container">
      <div className="login-content">
        <h1 className="login-title">Login</h1>
        <form action={loginFormAction} className="login-form">
          <Input label="username" name="username" />
          {loginState.username && (
            <span className="login-error">{loginState.username}</span>
          )}
          <Input label="senha" type="password" name="" />
          {loginState.password && (
            <span className="login-error">{loginState.password}</span>
          )}
          <Button disabled={loginPending}>Login</Button>
        </form>
      </div>
    </div>
  );
}
