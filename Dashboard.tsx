import { useEffect, useMemo, useState } from "react";
import { getMyProfile, updateMyProfile, UserProfile } from "./useProfile";
import { getVehicleByPlate, VehicleRecord } from "./useVehicles";
import { setTodayCheckin } from "./useCheckins";
import { upsertTodayBlock } from "./useBlocks";
import { buildMsgBloqueo, buildMsgAvisoYoBloqueo, waLinkCL, normPlate } from "./utils";

type Props = {
  uid: string;
  email: string;
  onLogout: () => Promise<void>;
};

export default function Dashboard({ uid, email, onLogout }: Props) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [plateSearch, setPlateSearch] = useState("");
  const [found, setFound] = useState<VehicleRecord | null>(null);
  const [unitToday, setUnitToday] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const primaryPlate = useMemo(() => (profile?.plates?.[0] ? normPlate(profile.plates[0]) : ""), [profile]);

  useEffect(() => {
    (async () => {
      const p = await getMyProfile(uid);
      setProfile(p);
    })();
  }, [uid]);

  async function refreshProfile() {
    const p = await getMyProfile(uid);
    setProfile(p);
  }

  async function doSearch() {
    setMsg(null);
    const rec = await getVehicleByPlate(plateSearch);
    setFound(rec);
    if (!rec) setMsg("No encontré esa patente en el directorio.");
  }

  async function doCheckin() {
    if (!profile) return;
    if (!unitToday.trim()) {
      setMsg("Escribe tu unidad/servicio para el check-in.");
      return;
    }
    setBusy(true);
    setMsg(null);
    try {
      await setTodayCheckin({
        uid,
        unitToday,
        plate: primaryPlate,
        name: profile.name,
        sector: profile.sector,
      });
      setMsg("✅ Check-in guardado para hoy.");
    } catch (e: any) {
      setMsg(e?.message ?? "Error guardando check-in");
    } finally {
      setBusy(false);
    }
  }

  async function doBlock(kind: "me_blocked" | "im_blocking") {
    if (!profile) return;
    if (!found?.plate) {
      setMsg("Primero busca una patente.");
      return;
    }
    setBusy(true);
    setMsg(null);
    try {
      const blockedPlate = found.plate;

      await upsertTodayBlock({
        blockerUid: uid,
        blockerPlate: primaryPlate,
        blockerName: profile.name,
        blockerPhone: profile.phone,
        blockerSector: profile.sector,

        blockedPlate,

        ownerUid: found.ownerUid,
        ownerEmail: found.ownerEmail,
        ownerName: found.ownerName,
        ownerPhone: found.ownerPhone,
        ownerSector: found.ownerSector,
      });

      const phone = found.ownerPhone ?? "";
      if (!phone) {
        setMsg("✅ Bloqueo registrado. (No tengo teléfono del dueño para WhatsApp)");
        return;
      }

      const message =
        kind === "me_blocked"
          ? buildMsgBloqueo({
              bloqueadoNombre: found.ownerName,
              bloqueadoPatente: blockedPlate,
              bloqueadorNombre: profile.name,
              bloqueadorPatente: primaryPlate,
              lugar: unitToday || profile.sector || "CESFAM Karol Wojtyla",
            })
          : buildMsgAvisoYoBloqueo({
              bloqueadoNombre: found.ownerName,
              bloqueadoPatente: blockedPlate,
              bloqueadorNombre: profile.name,
              bloqueadorPatente: primaryPlate,
              lugar: unitToday || profile.sector || "CESFAM Karol Wojtyla",
            });

      const link = waLinkCL(phone, message);
      window.open(link, "_blank", "noopener,noreferrer");

      setMsg("✅ Bloqueo registrado y WhatsApp listo.");
    } catch (e: any) {
      setMsg(e?.message ?? "Error registrando bloqueo");
    } finally {
      setBusy(false);
    }
  }

  async function saveContactPatch() {
    if (!profile) return;
    setBusy(true);
    setMsg(null);
    try {
      await updateMyProfile(uid, { phone: profile.phone, sector: profile.sector, name: profile.name });
      await refreshProfile();
      setMsg("✅ Datos actualizados.");
    } catch (e: any) {
      setMsg(e?.message ?? "Error guardando datos");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={{ maxWidth: 720, margin: "18px auto", padding: 16, fontFamily: "-apple-system, system-ui, Arial" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 10 }}>
        <h1 style={{ fontSize: 20, margin: 0 }}>Estacionamiento KW</h1>
        <button onClick={onLogout} style={{ padding: "10px 12px", borderRadius: 10, border: "1px solid #111", background: "#fff" }}>
          Salir
        </button>
      </div>
      <div style={{ fontSize: 13, opacity: 0.7, marginTop: 6 }}>{email}</div>

      <div style={{ border: "1px solid #ddd", borderRadius: 12, padding: 12, marginTop: 12 }}>
        <div style={{ fontWeight: 600, marginBottom: 8 }}>Mi perfil</div>

        {profile ? (
          <>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <div>
                <label style={{ display: "block", fontSize: 12, opacity: 0.8 }}>Nombre</label>
                <input
                  value={profile.name ?? ""}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                  style={{ width: "100%", padding: 10, borderRadius: 10, border: "1px solid #ccc" }}
                />
              </div>
              <div>
                <label style={{ display: "block", fontSize: 12, opacity: 0.8 }}>Teléfono</label>
                <input
                  value={profile.phone ?? ""}
                  onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                  style={{ width: "100%", padding: 10, borderRadius: 10, border: "1px solid #ccc" }}
                  inputMode="tel"
                />
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 10 }}>
              <div>
                <label style={{ display: "block", fontSize: 12, opacity: 0.8 }}>Sector / Unidad base</label>
                <input
                  value={profile.sector ?? ""}
                  onChange={(e) => setProfile({ ...profile, sector: e.target.value })}
                  style={{ width: "100%", padding: 10, borderRadius: 10, border: "1px solid #ccc" }}
                />
              </div>
              <div>
                <label style={{ display: "block", fontSize: 12, opacity: 0.8 }}>Mis patentes</label>
                <input
                  value={(profile.plates ?? []).join(", ")}
                  readOnly
                  style={{ width: "100%", padding: 10, borderRadius: 10, border: "1px solid #eee", background: "#fafafa" }}
                />
              </div>
            </div>

            <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
              <button
                disabled={busy}
                onClick={saveContactPatch}
                style={{ padding: "10px 12px", borderRadius: 10, border: "1px solid #111", background: "#111", color: "#fff" }}
              >
                Guardar datos
              </button>
            </div>
          </>
        ) : (
          <div style={{ opacity: 0.7 }}>Cargando perfil...</div>
        )}
      </div>

      <div style={{ border: "1px solid #ddd", borderRadius: 12, padding: 12, marginTop: 12 }}>
        <div style={{ fontWeight: 600, marginBottom: 8 }}>Check-in (hoy)</div>
        <label style={{ display: "block", fontSize: 12, opacity: 0.8 }}>¿En qué unidad estarás hoy?</label>
        <input
          value={unitToday}
          onChange={(e) => setUnitToday(e.target.value)}
          placeholder="Ej: SOME / Dental / Enfermería / Matrona..."
          style={{ width: "100%", padding: 10, borderRadius: 10, border: "1px solid #ccc" }}
        />
        <button
          disabled={busy}
          onClick={doCheckin}
          style={{ marginTop: 10, padding: "10px 12px", borderRadius: 10, border: "1px solid #111", background: "#111", color: "#fff" }}
        >
          Guardar check-in
        </button>
        <div style={{ fontSize: 12, opacity: 0.7, marginTop: 6 }}>Se guarda 1 check-in por día (se sobreescribe si lo cambias).</div>
      </div>

      <div style={{ border: "1px solid #ddd", borderRadius: 12, padding: 12, marginTop: 12 }}>
        <div style={{ fontWeight: 600, marginBottom: 8 }}>Buscar patente</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 140px", gap: 10 }}>
          <input
            value={plateSearch}
            onChange={(e) => setPlateSearch(e.target.value)}
            placeholder="Ej: KHDC46"
            style={{ width: "100%", padding: 10, borderRadius: 10, border: "1px solid #ccc" }}
          />
          <button
            onClick={doSearch}
            style={{ padding: "10px 12px", borderRadius: 10, border: "1px solid #111", background: "#111", color: "#fff" }}
          >
            Buscar
          </button>
        </div>

        {found && (
          <div style={{ marginTop: 12, padding: 10, borderRadius: 10, background: "#fafafa", border: "1px solid #eee" }}>
            <div><b>Patente:</b> {found.plate}</div>
            <div><b>Nombre:</b> {found.ownerName || "-"}</div>
            <div><b>Teléfono:</b> {found.ownerPhone || "-"}</div>
            <div><b>Sector:</b> {found.ownerSector || "-"}</div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginTop: 10 }}>
              <button
                disabled={busy}
                onClick={() => doBlock("me_blocked")}
                style={{ padding: "10px 12px", borderRadius: 10, border: "1px solid #111", background: "#111", color: "#fff" }}
              >
                Me está bloqueando (WhatsApp)
              </button>
              <button
                disabled={busy}
                onClick={() => doBlock("im_blocking")}
                style={{ padding: "10px 12px", borderRadius: 10, border: "1px solid #111", background: "#fff", color: "#111" }}
              >
                Lo estoy bloqueando (WhatsApp)
              </button>
            </div>

            <div style={{ fontSize: 12, opacity: 0.7, marginTop: 8 }}>
              Tip: si el teléfono está vacío, completa el directorio en Firestore → vehicles/{found.plate}.
            </div>
          </div>
        )}

        {msg && <div style={{ marginTop: 10, fontSize: 13 }}>{msg}</div>}
      </div>
    </div>
  );
}
