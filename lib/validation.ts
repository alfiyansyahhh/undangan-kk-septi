import type { InvitationData } from "./gdrive";
const object = (value: unknown): value is Record<string, unknown> => !!value && typeof value === "object" && !Array.isArray(value);
const strings = (value: unknown): value is string[] => Array.isArray(value) && value.every(v => typeof v === "string");
const fields = (value: unknown, keys: string[]) => object(value) && keys.every(key => typeof value[key] === "string");
export function validInvitation(value: unknown): value is InvitationData {
  if (!object(value) || !object(value.couple) || !object(value.events) || !object(value.photos)) return false;
  if (!fields(value.couple, ["title", "hashtag", "quote", "quoteSource"])) return false;
  if (!["bride", "groom"].every(key => fields((value.couple as Record<string, unknown>)[key], ["shortName", "fullName", "fatherName", "motherName", "instagram", "photo"]))) return false;
  if (!fields(value.events, ["targetDate", "displayDate"]) || !Number.isFinite(Date.parse(String(value.events.targetDate)))) return false;
  if (!["akad", "resepsi"].every(key => fields((value.events as Record<string, unknown>)[key], ["title", "date", "time", "venue", "address", "mapsUrl"]))) return false;
  if (typeof value.photos.cover !== "string" || !strings(value.photos.gallery)) return false;
  for (const key of ["coverSlides", "background", "quoteSlides"]) if (value.photos[key] !== undefined && !strings(value.photos[key])) return false;
  for (const key of ["akad", "resepsi", "gift", "galleryCover"]) if (value.photos[key] !== undefined && typeof value.photos[key] !== "string") return false;
  if (value.sections !== undefined && (!object(value.sections) || !Object.values(value.sections).every(v => typeof v === "string"))) return false;
  if (value.story !== undefined && (!Array.isArray(value.story) || !value.story.every(v => fields(v, ["year", "title", "desc"]) && (v.image === undefined || typeof v.image === "string")))) return false;
  if (value.gifts !== undefined && (!Array.isArray(value.gifts) || !value.gifts.every(v => fields(v, ["bank", "number", "holder"])))) return false;
  return true;
}
