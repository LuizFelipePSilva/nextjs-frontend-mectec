import "./globals.css";

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
        <div style={{ display: "flex", minHeight: "100vh" }}>{children}</div>
      </body>
    </html>
  );
}
