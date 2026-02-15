import { useState } from "react";

type Props = {
  onLogin: (email: string, password: string) => Promise<void>;
};

export default function LoginForm({ onLogin }: Props) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setBusy(true);
    try {
      await onLogin(email, password);
    } catch (e: any) {
      setErr(e?.message ?? "Error al iniciar sesión");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={{ maxWidth: 420, margin: "40px auto", padding: 16, border: "1px solid #ddd", borderRadius: 12 }}>
      <h2 style={{ margin: "0 0 12px" }}>Estacionamiento KW</h2>
      <form onSubmit={submit}>
        <label style={{ display: "block", fontSize: 12, opacity: 0.8 }}>Email</label>
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{ width: "100%", padding: 10, borderRadius: 10, border: "1px solid #ccc", marginBottom: 10 }}
          inputMode="email"
          autoCapitalize="none"
        />
        <label style={{ display: "block", fontSize: 12, opacity: 0.8 }}>Contraseña</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{ width: "100%", padding: 10, borderRadius: 10, border: "1px solid #ccc", marginBottom: 10 }}
        />

        {err && <div style={{ color: "crimson", fontSize: 13, marginBottom: 10 }}>{err}</div>}

        <button
          disabled={busy}
          style={{ width: "100%", padding: 12, borderRadius: 10, border: "1px solid #111", background: "#111", color: "#fff" }}
        >
          {busy ? "Entrando..." : "Entrar"}
        </button>
        <div style={{ fontSize: 12, opacity: 0.7, marginTop: 8 }}>
          Tip: si tu clave original era corta, quedó con sufijo <b>KW!</b> (ej: 1234 → 1234KW!)
        </div>
      </form>
    </div>
  );
}
