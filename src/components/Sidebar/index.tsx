import Link from "next/link";
import "./styles.css";

const menuItems = [
  { label: "Recente", icon: "⏰", className: "icon-recent", href: "/" },
  { label: "Usuários", icon: "👥", className: "icon-users", href: "/User" },
  { label: "Clientes", icon: "😊", className: "icon-customers", href: "/" },
  {
    label: "Maquinas",
    icon: "🧰",
    className: "icon-machines",
    href: "/",
  },
  { label: "Pedidos", icon: "📦", className: "icon-orders", href: "/Order" },
  { label: "Serviços", icon: "🛠️", className: "icon-services", href: "/" },
  { label: "Peças", icon: "⚙️", className: "icon-engines", href: "/" },
];

export const Sidebar = () => {
  return (
    <aside className="sidebar">
      <div className="user-profile">
        <span className="avatar-icon">👤</span>
        <span className="user-info">Usuário</span>
        <span className="arrow-icon">▼</span>
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
  );
};
