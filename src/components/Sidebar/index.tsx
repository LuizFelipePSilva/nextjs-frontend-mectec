"use client";

import Link from "next/link";
import "./styles.css";
import { useActionState, useEffect, useRef, useState } from "react";
import { Button } from "../Buttons";
import { Modal } from "../Modals";
import { changePasswordAction, logout } from "./actions";
import { Input } from "../Inputs";

const menuItems = [
  { label: "Recente", icon: "⏰", className: "icon-recent", href: "/" },
  { label: "Usuários", icon: "👥", className: "icon-users", href: "/User" },
  {
    label: "Clientes",
    icon: "😊",
    className: "icon-customers",
    href: "/Customer",
  },
  {
    label: "Maquinas",
    icon: "🧰",
    className: "icon-machines",
    href: "/",
  },
  { label: "Pedidos", icon: "📦", className: "icon-orders", href: "/Order" },
  { label: "Serviços", icon: "🛠️", className: "icon-services", href: "/" },
  { label: "Peças", icon: "⚙️", className: "icon-engines", href: "/Piece" },
];

export const Sidebar = () => {
  const [openDropdown, setOpenDropdown] = useState(false);
  const [openModal, setOpenModal] = useState(false);

  const [changePasswordState, changePasswordFormAction, changePasswordPending] =
    useActionState(changePasswordAction, {
      success: false,
      oldPassword: "",
      newPassword: "",
      confirm: "",
    });

  const onClickLogout = () => {
    logout();
  };

  useEffect(() => {
    if (changePasswordState.success) {
      setOpenDropdown(false);
      setOpenModal(false);
    }
  }, [changePasswordState]);

  return (
    <>
      <aside className="sidebar">
        <div
          onMouseEnter={() => setOpenDropdown(true)}
          onMouseLeave={() => setOpenDropdown(false)}
        >
          <div className="user-profile">
            <span className="avatar-icon">👤</span>
            <span className="user-info">Usuário</span>
            <span className="arrow-icon">▼</span>
          </div>
          {openDropdown && (
            <div className="dropdown">
              <Button variant="ghost" onClick={() => setOpenModal(true)}>
                Troca senha
              </Button>
              <Button variant="ghost" onClick={onClickLogout}>
                Logout
              </Button>
            </div>
          )}
        </div>
        <nav>
          <ul className="nav-list">
            {menuItems.map((item, index) => (
              <li key={index}>
                <Link href={item.href} className="nav-item">
                  <span className={`nav-icon ${item.className}`}>
                    {item.icon}
                  </span>
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </aside>
      <Modal
        isOpen={openModal}
        onClose={() => setOpenModal(false)}
        title="Mudar senha"
        footer={
          <Button
            form="change-password-form"
            type="submit"
            fullWidth
            disabled={changePasswordPending}
          >
            Mudar senha
          </Button>
        }
      >
        <form
          id="change-password-form"
          className="modal-form"
          action={changePasswordFormAction}
        >
          {changePasswordState.errors && (
            <span className="form-error">{changePasswordState.errors}</span>
          )}
          <Input
            label="Senha antiga"
            type="password"
            name="oldPassword"
            defaultValue={changePasswordState.oldPassword}
          />
          <Input
            label="Senha nova"
            type="password"
            name="newPassword"
            defaultValue={changePasswordState.newPassword}
          />
          <Input
            label="Confirma"
            type="password"
            name="confirm"
            defaultValue={changePasswordState.confirm}
          />
        </form>
      </Modal>
    </>
  );
};
