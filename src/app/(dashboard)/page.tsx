"use client";

import "./styles.css";

import { useEffect, useState } from "react";
import { loadOrdersData, Order } from "./actions";

export default function Home() {
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    (async () => {
      const data = await loadOrdersData("", 0, 10);
      setOrders(data.content);
    })();
  }, []);

  const toStatusPt = (s: string) =>
    s === "OPEN" ? "Aberto" : s === "CLOSE" ? "Finalizado" : s;

  return (
    <div className="content">
      <h1 className="title">Sistema de Gerenciamento EletroSmart</h1>
      <section className="cards">
        {orders &&
          orders.map((o) => (
            <div className="card" key={o.orderId}>
              <p>
                <strong>Máquina:</strong>{" "}
                {o.tasks.length >= 1 && o.tasks[0].machine.model}
              </p>
              <p>
                <strong>Cliente:</strong>{" "}
                {o.tasks.length >= 1 && o.tasks[0].machine.customer.name}
              </p>
              <p>
                <strong>Data de Entrada:</strong> {o.createdAt.split("T")[0]}
              </p>
              <p>
                <strong>Status:</strong> {toStatusPt(o.status)}
              </p>
              <p>
                <strong>Serviço:</strong>{" "}
                {[...new Set(o.tasks.flatMap((t) => t.name))].join(", ")}
              </p>
              <p>
                <strong>Peça(s):</strong>{" "}
                {[
                  ...new Set(
                    o.tasks.flatMap((t) => t.pieces.flatMap((p) => p.name))
                  ),
                ].join(", ")}
              </p>
            </div>
          ))}
      </section>
    </div>
  );
}
