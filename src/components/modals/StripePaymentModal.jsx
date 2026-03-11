import { useState, useEffect } from "react";
import { Icon } from "../Icons";

const StripePaymentModal = ({ invoice, onClose, onPaid }) => {
  const [stripeObj, setStripeObj] = useState(null);
  const [clientSecret, setClientSecret] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState("");
  const [succeeded, setSucceeded] = useState(false);
  const cardRef = useRef(null);
  const cardElementRef = useRef(null);

  const PUBLISHABLE_KEY = "pk_test_mFGPDRnLh3fxMNQagtNff367";
  const BASE = "https://api.counselbridge.me";

  useEffect(() => {
    const init = (Stripe) => setStripeObj(Stripe(PUBLISHABLE_KEY));
    if (window.Stripe) { init(window.Stripe); return; }
    const script = document.createElement("script");
    script.src = "https://js.stripe.com/v3/";
    script.onload = () => init(window.Stripe);
    document.head.appendChild(script);
  }, []);

  useEffect(() => {
    if (!invoice?.id) return;
    const token = localStorage.getItem("cb_token");
    fetch(`${BASE}/api/invoices/${invoice.id}/payment-intent`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.json())
      .then(data => {
        if (data.clientSecret) setClientSecret(data.clientSecret);
        else setError(data.error || "Could not load payment details.");
      })
      .catch(() => setError("Could not connect to payment service."))
      .finally(() => setLoading(false));
  }, [invoice?.id]);

  useEffect(() => {
    if (!stripeObj || !clientSecret || !cardRef.current || cardElementRef.current) return;
    const els = stripeObj.elements({ clientSecret });
    const card = els.create("card", {
      style: {
        base: { fontFamily: "'DM Sans', system-ui, sans-serif", fontSize: "15px", color: "#1E293B", "::placeholder": { color: "#94A3B8" } },
        invalid: { color: "#DC2626" },
      },
    });
    card.mount(cardRef.current);
    cardElementRef.current = card;
    return () => { try { card.unmount(); } catch(e) {} cardElementRef.current = null; };
  }, [stripeObj, clientSecret]);

  const handlePay = async () => {
    if (!stripeObj || !cardElementRef.current || !clientSecret) return;
    setPaying(true);
    setError("");
    const { error: stripeError, paymentIntent } = await stripeObj.confirmCardPayment(clientSecret, {
      payment_method: { card: cardElementRef.current },
    });
    if (stripeError) {
      setError(stripeError.message);
      setPaying(false);
    } else if (paymentIntent.status === "succeeded") {
      setSucceeded(true);
      setTimeout(() => { onPaid(invoice.id); onClose(); }, 2200);
    }
  };

  const amt = typeof invoice.amount === "number"
    ? invoice.amount.toLocaleString("en-US", { minimumFractionDigits: 2 })
    : String(invoice.amount);

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(15,34,64,0.6)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(3px)" }} onClick={onClose}>
      <div className="card fade-in" style={{ width: 460, padding: 32, boxShadow: "var(--shadow-xl)" }} onClick={e => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 22 }}>
          <div>
            <div style={{ fontSize: 18, fontWeight: 700, color: "var(--navy)", fontFamily: "var(--font-serif)", marginBottom: 3 }}>Pay Invoice</div>
            <div style={{ fontSize: 12.5, color: "var(--gray-400)" }}>{invoice.number} · {invoice.desc}</div>
          </div>
          <button className="btn btn-ghost btn-sm" onClick={onClose} style={{ marginTop: -4 }}><Icon name="x" size={16} /></button>
        </div>
        <div style={{ background: "#EFF6FF", border: "1px solid #BFDBFE", borderRadius: "var(--radius-md)", padding: "14px 20px", marginBottom: 22, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: 13, color: "#2563EB", fontWeight: 500 }}>Amount due</span>
          <span style={{ fontSize: 26, fontWeight: 700, color: "var(--navy)", fontFamily: "var(--font-serif)" }}>${amt}</span>
        </div>
        {succeeded ? (
          <div style={{ textAlign: "center", padding: "20px 0 8px" }}>
            <div style={{ width: 60, height: 60, background: "#DCFCE7", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px" }}>
              <Icon name="check-circle" size={30} color="#16A34A" />
            </div>
            <div style={{ fontSize: 17, fontWeight: 700, color: "var(--gray-900)", marginBottom: 5 }}>Payment successful!</div>
            <div style={{ fontSize: 13.5, color: "var(--gray-500)" }}>A receipt has been sent to your email.</div>
          </div>
        ) : loading ? (
          <div style={{ textAlign: "center", padding: "32px 0", color: "var(--gray-400)", fontSize: 14 }}>
            <div style={{ width: 22, height: 22, border: "2px solid var(--gray-200)", borderTopColor: "var(--blue)", borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 12px" }} />
            Loading secure payment form...
          </div>
        ) : error && !clientSecret ? (
          <div style={{ background: "#FEF2F2", color: "#DC2626", border: "1px solid #FECACA", borderRadius: "var(--radius-sm)", padding: "11px 14px", fontSize: 13.5 }}>{error}</div>
        ) : (
          <>
            <div style={{ marginBottom: 6 }}>
              <label style={{ fontSize: 12.5, fontWeight: 600, color: "var(--gray-600)", marginBottom: 7, display: "block", textTransform: "uppercase", letterSpacing: "0.05em" }}>Card details</label>
              <div ref={cardRef} style={{ border: "1.5px solid var(--gray-200)", borderRadius: "var(--radius-sm)", padding: "12px 14px", background: "white", minHeight: 46 }} />
            </div>
            {error && <div style={{ background: "#FEF2F2", color: "#DC2626", border: "1px solid #FECACA", borderRadius: "var(--radius-sm)", padding: "9px 13px", fontSize: 13, marginTop: 8 }}>{error}</div>}
            <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11.5, color: "var(--gray-400)", margin: "12px 0 20px" }}>
              <Icon name="lock" size={11} color="var(--gray-400)" />
              Secured by Stripe · 256-bit TLS · Card details never touch our servers
            </div>
            <button
              className="btn btn-primary"
              style={{ width: "100%", justifyContent: "center", padding: "13px 0", fontSize: 15, borderRadius: "var(--radius-md)", gap: 8 }}
              disabled={paying || !stripeObj}
              onClick={handlePay}
            >
              {paying ? (
                <>
                  <div style={{ width: 16, height: 16, border: "2px solid rgba(255,255,255,0.35)", borderTopColor: "white", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
                  Processing...
                </>
              ) : (
                <>
                  <Icon name="lock" size={14} color="white" />
                  Pay ${amt}
                </>
              )}
            </button>
          </>
        )}
      </div>
    </div>
  );
};

// ─── MAIN APP ─────────────────────────────────────────────────────────────────

export default StripePaymentModal;
