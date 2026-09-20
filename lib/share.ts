export const defaultShareTemplate = `Yth. {nama},

Dengan penuh kebahagiaan, kami mengundang Bapak/Ibu/Saudara/i ke pernikahan {mempelai} pada {tanggal}.

Detail acara dan konfirmasi kehadiran:
{link}

Terima kasih atas doa dan kehadirannya.`;
export function invitationLink(base: string, token: string) {
  const url = new URL(base);
  if (!["https:", "http:"].includes(url.protocol)) throw new Error("Gunakan alamat http atau https.");
  url.pathname = "/"; url.search = ""; url.hash = "";
  if (!/^[a-f0-9]{48}$/.test(token)) throw new Error("Token tamu tidak valid.");
  url.searchParams.set("guest", token);
  return url.toString();
}
export function guestMessage(template: string, values: Record<string, string>) {
  return template.replace(/\{(nama|mempelai|tanggal|link)\}/g, (match, key) => values[key] ?? match);
}
export function whatsappPhone(value: string) {
  let phone = value.replace(/[\s()+.-]/g, "");
  if (phone.startsWith("0")) phone = "62" + phone.slice(1);
  else if (phone.startsWith("8")) phone = "62" + phone;
  return /^\d{8,15}$/.test(phone) ? phone : "";
}
