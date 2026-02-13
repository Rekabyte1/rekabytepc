"use client";

import React, { useMemo } from "react";
import { useRouter } from "next/navigation";
import Portal from "./Portal";
import { useCart, CLP } from "./CartContext";

export default function CartDrawer() {
  const router = useRouter();
  const {
    isOpen,
    toggleCart,
    items,
    clear,
    subtotalTransfer,
    subtotalCard,
    setQty,
    removeItem,
  } = useCart();

  const itemCount = useMemo(
    () => items.reduce((a, it) => a + it.quantity, 0),
    [items]
  );

  const handleGoCheckout = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    router.push("/checkout/opciones");
    requestAnimationFrame(() => toggleCart());
  };

  const handleGoCartPage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    router.push("/carrito");
    requestAnimationFrame(() => toggleCart());
  };

  return (
    <Portal>
      <div
        className={`rb-overlay ${isOpen ? "open" : ""}`}
        onClick={toggleCart}
      />

      <aside
        className={`rb-drawer ${isOpen ? "open" : ""}`}
        role="dialog"
        aria-label="Carrito"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="rb-drawer__header">
          <div className="cd-head">
            <h3 className="cd-title">Tu carrito</h3>
            <span className="cd-pill">
              {itemCount} {itemCount === 1 ? "ítem" : "ítems"}
            </span>
          </div>

          <button onClick={toggleCart} className="rb-drawer__close" aria-label="Cerrar">
            ×
          </button>
        </div>

        <div className="rb-drawer__content">
          {items.length === 0 ? (
            <div className="cd-empty">
              <div className="cd-empty-title">Tu carrito está vacío</div>
              <p className="cd-empty-sub">
                Agrega productos para continuar con el checkout.
              </p>

              <div className="cd-empty-actions">
                <button className="rb-btn" onClick={toggleCart}>
                  Seguir comprando
                </button>
              </div>
            </div>
          ) : (
            <ul className="cd-list">
              {items.map((it) => (
                <li key={it.id} className="cd-item">
                  <div className="cd-row">
                    <div className="cd-thumb">
                      {it.image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={it.image} alt={it.name} draggable={false} />
                      ) : (
                        <div className="cd-thumb-fallback" />
                      )}
                    </div>

                    <div className="cd-main">
                      <div className="cd-name" title={it.name}>
                        {it.name}
                      </div>

                      <div className="cd-prices">
                        <div className="cd-price-col">
                          <div className="cd-price-label">Transferencia</div>
                          <div className="cd-price-val">{CLP(it.priceTransfer)}</div>
                        </div>
                        <div className="cd-price-col">
                          <div className="cd-price-label">Otros medios</div>
                          <div className="cd-price-val">{CLP(it.priceCard)}</div>
                        </div>
                      </div>

                      <div className="cd-controls">
                        <div className="cd-stepper" aria-label="Cantidad">
                          <button
                            type="button"
                            className="cd-stepper-btn"
                            onClick={() => setQty(it.id, it.quantity - 1)}
                            aria-label="Restar"
                          >
                            −
                          </button>
                          <div className="cd-stepper-val">{it.quantity}</div>
                          <button
                            type="button"
                            className="cd-stepper-btn"
                            onClick={() => setQty(it.id, it.quantity + 1)}
                            aria-label="Sumar"
                          >
                            +
                          </button>
                        </div>

                        <button
                          type="button"
                          className="cd-remove"
                          onClick={() => removeItem(it.id)}
                        >
                          Eliminar
                        </button>
                      </div>
                    </div>

                    <div className="cd-totals">
                      <div className="cd-total-transfer">
                        {CLP(it.priceTransfer * it.quantity)}
                      </div>
                      <div className="cd-total-card">
                        {CLP(it.priceCard * it.quantity)}
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="cd-summary">
          <div className="cd-srow">
            <span className="cd-slabel">Total Transferencia</span>
            <span className="cd-svalue lime">{CLP(subtotalTransfer)}</span>
          </div>
          <div className="cd-srow">
            <span className="cd-slabel">Total Otros medios</span>
            <span className="cd-svalue">{CLP(subtotalCard)}</span>
          </div>

          <div className="cd-hint">
            El total final puede variar según el medio de pago y el envío.
          </div>
        </div>

        <div className="rb-drawer__footer cd-footer">
          <button className="rb-btn rb-btn--ghost" onClick={toggleCart}>
            Seguir comprando
          </button>

          <button className="rb-btn rb-btn--ghost" onClick={clear} disabled={items.length === 0}>
            Vaciar
          </button>

          <button className="rb-btn" onClick={handleGoCheckout} disabled={items.length === 0}>
            Ir al pago
          </button>

          <button className="cd-link" onClick={handleGoCartPage} disabled={items.length === 0}>
            Ver carrito
          </button>
        </div>

        <style jsx>{`
          .cd-head {
            display: flex;
            align-items: center;
            gap: 10px;
          }
          .cd-title {
            margin: 0;
            font-weight: 900;
            font-size: 18px;
            color: #fff;
          }
          .cd-pill {
            display: inline-flex;
            align-items: center;
            height: 24px;
            padding: 0 10px;
            border-radius: 999px;
            border: 1px solid rgba(255, 255, 255, 0.1);
            background: rgba(20, 20, 20, 0.6);
            color: #d4d4d4;
            font-size: 12px;
            font-weight: 800;
            white-space: nowrap;
          }

          .cd-empty {
            padding: 18px 4px;
          }
          .cd-empty-title {
            color: #fff;
            font-weight: 900;
            font-size: 16px;
          }
          .cd-empty-sub {
            margin: 6px 0 0;
            color: #a3a3a3;
            font-size: 13px;
            line-height: 1.45;
          }
          .cd-empty-actions {
            margin-top: 14px;
          }

          .cd-list {
            display: grid;
            gap: 12px;
          }

          .cd-item {
            border: 1px solid rgba(255, 255, 255, 0.08);
            background: rgba(20, 20, 20, 0.35);
            border-radius: 14px;
            padding: 12px;
          }

          .cd-row {
            display: grid;
            grid-template-columns: 64px 1fr auto;
            gap: 12px;
            align-items: start;
          }

          .cd-thumb {
            width: 64px;
            height: 64px;
            border-radius: 12px;
            overflow: hidden;
            border: 1px solid rgba(255, 255, 255, 0.08);
            background: #0f0f0f;
          }
          .cd-thumb img {
            width: 64px;
            height: 64px;
            object-fit: cover;
            display: block;
          }
          .cd-thumb-fallback {
            width: 64px;
            height: 64px;
            background: linear-gradient(135deg, rgba(182, 255, 46, 0.12), rgba(255, 255, 255, 0.03));
          }

          .cd-main {
            min-width: 0;
          }

          .cd-name {
            color: #fff;
            font-weight: 900;
            font-size: 13px;
            line-height: 1.25;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }

          .cd-prices {
            margin-top: 8px;
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 10px;
          }

          .cd-price-col {
            border: 1px solid rgba(255, 255, 255, 0.06);
            background: rgba(20, 20, 20, 0.35);
            border-radius: 12px;
            padding: 8px;
          }
          .cd-price-label {
            color: #a3a3a3;
            font-size: 11px;
            font-weight: 800;
          }
          .cd-price-val {
            margin-top: 2px;
            color: #e5e7eb;
            font-size: 12px;
            font-weight: 900;
          }

          .cd-controls {
            margin-top: 10px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 10px;
            flex-wrap: wrap;
          }

          .cd-stepper {
            display: inline-flex;
            align-items: center;
            border: 1px solid rgba(255, 255, 255, 0.08);
            border-radius: 999px;
            overflow: hidden;
            background: rgba(20, 20, 20, 0.55);
          }
          .cd-stepper-btn {
            width: 34px;
            height: 32px;
            border: 0;
            background: transparent;
            color: #e5e7eb;
            font-weight: 900;
            cursor: pointer;
          }
          .cd-stepper-btn:hover {
            background: rgba(255, 255, 255, 0.06);
          }
          .cd-stepper-val {
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

          .cd-remove {
            border: 1px solid rgba(255, 255, 255, 0.08);
            background: rgba(20, 20, 20, 0.55);
            color: #a3a3a3;
            font-weight: 900;
            font-size: 12px;
            padding: 8px 10px;
            border-radius: 999px;
            cursor: pointer;
          }
          .cd-remove:hover {
            border-color: rgba(255, 255, 255, 0.14);
            color: #e5e7eb;
          }

          .cd-totals {
            text-align: right;
            padding-left: 6px;
            white-space: nowrap;
          }
          .cd-total-transfer {
            color: #b6ff2e;
            font-weight: 900;
            font-size: 13px;
          }
          .cd-total-card {
            margin-top: 4px;
            color: #a3a3a3;
            font-weight: 800;
            font-size: 12px;
          }

          .cd-summary {
            border-top: 1px solid rgba(255, 255, 255, 0.08);
            padding: 12px 16px;
            background: rgba(10, 10, 10, 0.85);
          }

          .cd-srow {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 12px;
            font-size: 13px;
            margin: 6px 0;
          }
          .cd-slabel {
            color: #a3a3a3;
            font-weight: 800;
          }
          .cd-svalue {
            color: #e5e7eb;
            font-weight: 900;
            white-space: nowrap;
          }
          .cd-svalue.lime {
            color: #b6ff2e;
          }

          .cd-hint {
            margin-top: 8px;
            color: #737373;
            font-size: 12px;
            line-height: 1.4;
          }

          .cd-footer {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 10px;
            padding: 12px 16px;
          }

          .cd-footer .rb-btn {
            width: 100%;
            min-width: 0;
          }

          .cd-link {
            grid-column: 1 / -1;
            border: 1px solid rgba(255, 255, 255, 0.08);
            background: rgba(20, 20, 20, 0.55);
            color: #e5e7eb;
            font-weight: 900;
            font-size: 12px;
            padding: 10px 12px;
            border-radius: 12px;
            cursor: pointer;
          }
          .cd-link:hover {
            border-color: rgba(255, 255, 255, 0.14);
          }

          @media (min-width: 420px) {
            .cd-footer {
              grid-template-columns: 1fr 1fr 1fr;
            }
            .cd-link {
              grid-column: 1 / -1;
            }
          }
        `}</style>
      </aside>
    </Portal>
  );
}
