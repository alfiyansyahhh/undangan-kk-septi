import type { InvitationData } from "./gdrive";

const months = ["januari", "februari", "maret", "april", "mei", "juni", "juli", "agustus", "september", "oktober", "november", "desember"];
const stamp = (date: Date) => date.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");

/** Parse the displayed Indonesian schedule, never the browser's local timezone. */
export function calendarSchedule(event: InvitationData["events"]["akad"]) {
  const date = event.date.toLowerCase().match(/\b(\d{1,2})\s+([a-z]+)\s+(\d{4})\b/);
  const time = event.time.trim().toUpperCase().match(/^(?:PUKUL\s+)?(\d{1,2})[:.](\d{2})\s*(?:-|–|—|S\.?D\.?|SAMPAI)\s*(\d{1,2})[:.](\d{2})\s*(WIB|WITA|WIT)$/);
  if (!date || !time) return null;
  const month = months.indexOf(date[2]);
  const day = Number(date[1]), year = Number(date[3]);
  const check = new Date(Date.UTC(year, month, day));
  if (month < 0 || check.getUTCMonth() !== month || check.getUTCDate() !== day) return null;
  const [hour, minute, endHour, endMinute] = time.slice(1, 5).map(Number);
  if (hour > 23 || endHour > 23 || minute > 59 || endMinute > 59) return null;
  const offset = { WIB: 7, WITA: 8, WIT: 9 }[time[5]]!;
  const start = new Date(Date.UTC(year, month, day, hour - offset, minute));
  const end = new Date(Date.UTC(year, month, day, endHour - offset, endMinute));
  if (end.getTime() === start.getTime()) return null;
  if (end <= start) end.setUTCDate(end.getUTCDate() + 1);
  return { start: stamp(start), end: stamp(end) };
}

const escapeText = (value: string) => value.replace(/\\/g, "\\\\").replace(/\r\n|\r|\n/g, "\\n").replace(/;/g, "\\;").replace(/,/g, "\\,");
function fold(line: string) {
  const parts: string[] = [];
  let part = "", bytes = 0;
  for (const char of line) {
    const size = new TextEncoder().encode(char).length;
    if (bytes + size > 75) { parts.push(part); part = " "; bytes = 1; }
    part += char; bytes += size;
  }
  return [...parts, part].join("\r\n");
}
export function calendarEvent(data: InvitationData, key: "akad" | "resepsi") {
  const event = data.events[key], schedule = calendarSchedule(event);
  if (!schedule) return null;
  const title = `${event.title} — ${data.couple.bride.shortName} & ${data.couple.groom.shortName}`;
  const location = `${event.venue}, ${event.address}`;
  const description = `${data.couple.title}\n${event.date}\n${event.time}\n${event.mapsUrl}`;
  const google = `https://calendar.google.com/calendar/render?${new URLSearchParams({ action: "TEMPLATE", text: title, dates: `${schedule.start}/${schedule.end}`, details: description, location })}`;
  const ics = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Undangan//Wedding Calendar//ID", "CALSCALE:GREGORIAN", "BEGIN:VEVENT", `UID:${key}-${schedule.start}@undangan.local`, `DTSTAMP:${stamp(new Date())}`, `DTSTART:${schedule.start}`, `DTEND:${schedule.end}`, `SUMMARY:${escapeText(title)}`, `DESCRIPTION:${escapeText(description)}`, `LOCATION:${escapeText(location)}`, "END:VEVENT", "END:VCALENDAR", ""].map(fold).join("\r\n");
  return { google, ics };
}
