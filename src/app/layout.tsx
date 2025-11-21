import "./globals.css";
import { Sidebar } from "@/components/Sidebar"; // Importe a Sidebar

export const metadata = {
  title: "Meu App",
  description: "Dashboard",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt">
      <body>
        <div style={{ display: "flex", minHeight: "100vh" }}>
          <Sidebar />
          <div style={{ flex: 1, backgroundColor: "#f9f9f9" }}>{children}</div>
        </div>
      </body>
    </html>
  );
}
