"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart, CLP } from "@/components/CartContext";

export default function CarritoPage() {
  const router = useRouter();
  const { items, setQty, removeItem, clear, subtotalTransfer, subtotalCard } = useCart();

  const count = useMemo(() => items.reduce((a, it) => a + it.quantity, 0), [items]);

  return (
    <main className="rb-container cart-page">
      <h1 className="cp-title">Tu carrito</h1>

      {items.length === 0 ? (
        <section className="cp-card">
          <div className="cp-empty-title">Tu carrito está vacío</div>
          <p className="cp-empty-sub">Agrega productos para continuar.</p>
          <div className="cp-actions">
            <button className="rb-btn" onClick={() => router.push("/")}>
              Seguir comprando
            </button>
          </div>
        </section>
      ) : (
        <div className="cp-grid">
          <section className="cp-card">
            <div className="cp-head">
              <div className="cp-pill">
                {count} {count === 1 ? "ítem" : "ítems"}
              </div>
              <button className="rb-btn rb-btn--ghost" onClick={clear}>
                Vaciar
              </button>
            </div>

            <ul className="cp-list">
              {items.map((it) => (
                <li key={it.id} className="cp-item">
                  <div className="cp-row">
                    <div className="cp-thumb">
                      {it.image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={it.image} alt={it.name} draggable={false} />
                      ) : (
                        <div className="cp-thumb-fallback" />
                      )}
                    </div>

                    <div className="cp-main">
                      <div className="cp-name" title={it.name}>
                        {it.name}
                      </div>

                      <div className="cp-prices">
                        <div className="cp-price-col">
                          <div className="cp-price-label">Transferencia</div>
                          <div className="cp-price-val">{CLP(it.priceTransfer)}</div>
                        </div>
                        <div className="cp-price-col">
                          <div className="cp-price-label">Otros medios</div>
                          <div className="cp-price-val">{CLP(it.priceCard)}</div>
                        </div>
                      </div>

                      <div className="cp-controls">
                        <div className="cp-stepper">
                          <button
                            type="button"
                            className="cp-stepper-btn"
                            onClick={() => setQty(it.id, it.quantity - 1)}
                            aria-label="Restar"
                          >
                            −
                          </button>
                          <div className="cp-stepper-val">{it.quantity}</div>
                          <button
                            type="button"
                            className="cp-stepper-btn"
                            onClick={() => setQty(it.id, it.quantity + 1)}
                            aria-label="Sumar"
                          >
                            +
                          </button>
                        </div>

                        <button type="button" className="cp-remove" onClick={() => removeItem(it.id)}>
                          Eliminar
                        </button>
                      </div>
                    </div>

                    <div className="cp-totals">
                      <div className="cp-total-transfer">{CLP(it.priceTransfer * it.quantity)}</div>
                      <div className="cp-total-card">{CLP(it.priceCard * it.quantity)}</div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            <div className="cp-bottom-actions">
              <button className="rb-btn rb-btn--ghost" onClick={() => router.push("/")}>
                Seguir comprando
              </button>

              <Link href="/checkout/opciones" className="rb-btn">
                Ir al pago
              </Link>
            </div>
          </section>

          <aside className="cp-aside">
            <div className="cp-aside-card">
              <div className="cp-aside-title">Resumen</div>

              <div className="cp-srow">
                <span className="cp-slabel">Total Transferencia</span>
                <span className="cp-svalue lime">{CLP(subtotalTransfer)}</span>
              </div>

              <div className="cp-srow">
                <span className="cp-slabel">Total Otros medios</span>
                <span className="cp-svalue">{CLP(subtotalCard)}</span>
              </div>

              <div className="cp-hint">
                El total final puede variar según el medio de pago y el envío.
              </div>
            </div>
          </aside>
        </div>
      )}

      <style jsx>{`
        .cart-page {
          padding-top: 24px;
          padding-bottom: 24px;
        }

        .cp-title {
          margin: 0 0 14px;
          font-size: 30px;
          font-weight: 900;
          color: #fff;
          letter-spacing: -0.02em;
        }

        .cp-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 18px;
          align-items: start;
        }

        @media (min-width: 1024px) {
          .cp-grid {
            grid-template-columns: 1fr 420px;
            gap: 22px;
          }
        }

        .cp-card {
          background: #0d0d0d;
          border: 1px solid #262626;
          border-radius: 16px;
          padding: 18px;
          box-shadow: 0 14px 40px rgba(0, 0, 0, 0.45);
        }

        .cp-head {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 12px;
          margin-bottom: 12px;
        }

        .cp-pill {
          display: inline-flex;
          align-items: center;
          height: 26px;
          padding: 0 10px;
          border-radius: 999px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          background: rgba(20, 20, 20, 0.6);
          color: #d4d4d4;
          font-size: 12px;
          font-weight: 900;
        }

        .cp-list {
          display: grid;
          gap: 12px;
        }

        .cp-item {
          border: 1px solid rgba(255, 255, 255, 0.08);
          background: rgba(20, 20, 20, 0.35);
          border-radius: 14px;
          padding: 12px;
        }

        .cp-row {
          display: grid;
          grid-template-columns: 64px 1fr auto;
          gap: 12px;
          align-items: start;
        }

        .cp-thumb {
          width: 64px;
          height: 64px;
          border-radius: 12px;
          overflow: hidden;
          border: 1px solid rgba(255, 255, 255, 0.08);
          background: #0f0f0f;
        }
        .cp-thumb img {
          width: 64px;
          height: 64px;
          object-fit: cover;
          display: block;
        }
        .cp-thumb-fallback {
          width: 64px;
          height: 64px;
          background: linear-gradient(135deg, rgba(182, 255, 46, 0.12), rgba(255, 255, 255, 0.03));
        }

        .cp-main {
          min-width: 0;
        }

        .cp-name {
          color: #fff;
          font-weight: 900;
          font-size: 13px;
          line-height: 1.25;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .cp-prices {
          margin-top: 8px;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
        }

        .cp-price-col {
          border: 1px solid rgba(255, 255, 255, 0.06);
          background: rgba(20, 20, 20, 0.35);
          border-radius: 12px;
          padding: 8px;
        }
        .cp-price-label {
          color: #a3a3a3;
          font-size: 11px;
          font-weight: 800;
        }
        .cp-price-val {
          margin-top: 2px;
          color: #e5e7eb;
          font-size: 12px;
          font-weight: 900;
        }

        .cp-controls {
          margin-top: 10px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          flex-wrap: wrap;
        }

        .cp-stepper {
          display: inline-flex;
          align-items: center;
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 999px;
          overflow: hidden;
          background: rgba(20, 20, 20, 0.55);
        }
        .cp-stepper-btn {
          width: 34px;
          height: 32px;
          border: 0;
          background: transparent;
          color: #e5e7eb;
          font-weight: 900;
          cursor: pointer;
        }
        .cp-stepper-btn:hover {
          background: rgba(255, 255, 255, 0.06);
        }
        .cp-stepper-val {
          width: 34px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #fff;
          font-weight: 900;
          font-size: 13px;
          border-left: 1px solid rgba(255, 255, 255, 0.06);
          border-right: 1px solid rgba(255, 255, 255, 0.06);
        }

        .cp-remove {
          border: 1px solid rgba(255, 255, 255, 0.08);
          background: rgba(20, 20, 20, 0.55);
          color: #a3a3a3;
          font-weight: 900;
          font-size: 12px;
          padding: 8px 10px;
          border-radius: 999px;
          cursor: pointer;
        }
        .cp-remove:hover {
          border-color: rgba(255, 255, 255, 0.14);
          color: #e5e7eb;
        }

        .cp-totals {
          text-align: right;
          padding-left: 6px;
          white-space: nowrap;
        }
        .cp-total-transfer {
          color: #b6ff2e;
          font-weight: 900;
          font-size: 13px;
        }
        .cp-total-card {
          margin-top: 4px;
          color: #a3a3a3;
          font-weight: 800;
          font-size: 12px;
        }

        .cp-bottom-actions {
          margin-top: 14px;
          display: flex;
          justify-content: space-between;
          gap: 10px;
          flex-wrap: wrap;
        }
        .cp-bottom-actions :global(.rb-btn) {
          min-width: 160px;
        }

        .cp-aside {
          position: sticky;
          top: 1.5rem;
        }

        .cp-aside-card {
          background: rgba(10, 10, 10, 0.6);
          border: 1px solid #262626;
          border-radius: 16px;
          padding: 16px;
        }

        .cp-aside-title {
          color: #fff;
          font-weight: 900;
          font-size: 14px;
          margin-bottom: 10px;
        }

        .cp-srow {
          display: flex;
          justify-content: space-between;
          gap: 12px;
          margin: 8px 0;
          font-size: 13px;
        }

        .cp-slabel {
          color: #a3a3a3;
          font-weight: 800;
        }

        .cp-svalue {
          color: #e5e7eb;
          font-weight: 900;
          white-space: nowrap;
        }

        .cp-svalue.lime {
          color: #b6ff2e;
        }

        .cp-hint {
          margin-top: 10px;
          color: #737373;
          font-size: 12px;
          line-height: 1.4;
        }

        .cp-empty-title {
          color: #fff;
          font-weight: 900;
          font-size: 16px;
        }
        .cp-empty-sub {
          margin: 6px 0 0;
          color: #a3a3a3;
          font-size: 13px;
          line-height: 1.45;
        }
        .cp-actions {
          margin-top: 14px;
        }
      `}</style>
    </main>
  );
}
