export function normPlate(x: string): string {
  return (x ?? "").toUpperCase().replace(/\s+/g, "");
}

export function digitsOnly(x: string): string {
  return (x ?? "").replace(/\D+/g, "");
}

// Chile: +56
export function toWaNumberCL(rawPhone: string): string {
  const d = digitsOnly(rawPhone);
  if (!d) return "";
  if (d.startsWith("56")) return d;
  return "56" + d;
}

export function yyyyMmDd(d: Date = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function waLinkCL(rawPhone: string, message: string): string {
  const num = toWaNumberCL(rawPhone);
  if (!num) return "";
  const text = encodeURIComponent(message);
  return `https://wa.me/${num}?text=${text}`;
}

export function buildMsgBloqueo(params: {
  bloqueadoNombre?: string;
  bloqueadoPatente: string;
  bloqueadorNombre?: string;
  bloqueadorPatente?: string;
  lugar?: string;
}): string {
  const n = params.bloqueadoNombre ? `Hola ${params.bloqueadoNombre}, ` : "Hola, ";
  const bloqueado = params.bloqueadoPatente ? `tu vehículo ${params.bloqueadoPatente}` : "tu vehículo";
  const bloqueador = params.bloqueadorNombre ? `Soy ${params.bloqueadorNombre}` : "Soy un funcionario del CESFAM";
  const patenteBloq = params.bloqueadorPatente ? ` (${params.bloqueadorPatente})` : "";
  const lugar = params.lugar ? ` Estoy en ${params.lugar}.` : "";
  return `${n}${bloqueador}${patenteBloq}. ${bloqueado} está bloqueando mi salida. ¿Podrías venir a moverlo por favor?${lugar} Gracias.`;
}

export function buildMsgAvisoYoBloqueo(params: {
  bloqueadoNombre?: string;
  bloqueadoPatente: string;
  bloqueadorNombre?: string;
  bloqueadorPatente?: string;
  lugar?: string;
}): string {
  const n = params.bloqueadoNombre ? `Hola ${params.bloqueadoNombre}, ` : "Hola, ";
  const bloqueado = params.bloqueadoPatente ? `tu vehículo ${params.bloqueadoPatente}` : "tu vehículo";
  const bloqueador = params.bloqueadorNombre ? `Soy ${params.bloqueadorNombre}` : "Soy un funcionario del CESFAM";
  const patenteBloq = params.bloqueadorPatente ? ` (${params.bloqueadorPatente})` : "";
  const lugar = params.lugar ? ` Estoy en ${params.lugar}.` : "";
  return `${n}${bloqueador}${patenteBloq}. Estoy estacionado de forma temporal y ${bloqueado} quedó bloqueado.${lugar} Si necesitas salir, avísame y lo muevo altiro.`;
}
