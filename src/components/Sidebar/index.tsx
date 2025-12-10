"use client";

import Link from "next/link";
import "./styles.css";
import { useActionState, useEffect, useState } from "react";
import { Button } from "../Buttons";
import { Modal } from "../Modals";
import { changePasswordAction, loadUserData, logout } from "./actions";
import { Input } from "../Inputs";
import { usePathname } from "next/navigation";

const menuItems = [
  {
    label: "Recente",
    icon: "⏰",
    className: "icon-recent",
    href: "/",
    admin: false,
  },
  {
    label: "Usuários",
    icon: "👥",
    className: "icon-users",
    href: "/User",
    admin: true,
  },
  {
    label: "Clientes",
    icon: "😊",
    className: "icon-customers",
    href: "/Customer",
    admin: false,
  },
  {
    label: "Maquinas",
    icon: "🧰",
    className: "icon-machines",
    href: "/Machine",
    admin: false,
  },
  {
    label: "Pedidos",
    icon: "📦",
    className: "icon-orders",
    href: "/Order",
    admin: false,
  },
  {
    label: "Serviços",
    icon: "🛠️",
    className: "icon-services",
    href: "/Task",
    admin: false,
  },
  {
    label: "Peças",
    icon: "⚙️",
    className: "icon-engines",
    href: "/Piece",
    admin: false,
  },
];

export const Sidebar = () => {
  const pathname = usePathname();

  const [openDropdown, setOpenDropdown] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [username, setUsername] = useState("");

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

  useEffect(() => {
    const load = async () => {
      const { admin, username } = await loadUserData(pathname);
      setIsAdmin(admin);
      setUsername(username);
    };
    load();
  }, [pathname]);

  return (
    <>
      <aside className="sidebar">
        <div
          onMouseEnter={() => setOpenDropdown(true)}
          onMouseLeave={() => setOpenDropdown(false)}
        >
          <div className="user-profile">
            <span className="avatar-icon">👤</span>
            <span className="user-info">{username}</span>
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
                {(item.admin == false || isAdmin) && (
                  <Link href={item.href} className="nav-item">
                    <span className={`nav-icon ${item.className}`}>
                      {item.icon}
                    </span>
                    {item.label}
                  </Link>
                )}
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
