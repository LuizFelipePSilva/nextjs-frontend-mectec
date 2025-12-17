import { Sidebar } from "@/components/Sidebar";

export default function DashBoardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Sidebar />
      <div style={{ flex: 1, backgroundColor: "#f9f9f9" }}>{children}</div>
    </>
  );
}
