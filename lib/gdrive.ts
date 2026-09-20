export interface GDrivePhoto {
  id: string;
  name: string;
  thumbnail: string;
  full: string;
}

export interface InvitationData {
  couple: {
    title: string;
    hashtag: string;
    quote: string;
    quoteSource: string;
    bride: {
      shortName: string;
      fullName: string;
      fatherName: string;
      motherName: string;
      instagram: string;
      photo: string;
      photoId?: string;
    };
    groom: {
      shortName: string;
      fullName: string;
      fatherName: string;
      motherName: string;
      instagram: string;
      photo: string;
      photoId?: string;
    };
  };
  photos: {
    cover: string;
    coverId?: string;
    gallery: string[];
    coverSlides?: string[];
    /** Legacy field, normalized to coverSlides when loaded/saved. */
    background?: string[];
    quoteSlides?: string[];
    akad?: string;
    resepsi?: string;
    gift?: string;
    galleryCover?: string;
  };
  events: {
    targetDate: string;
    displayDate: string;
    akad: {
      title: string;
      date: string;
      time: string;
      venue: string;
      address: string;
      mapsUrl: string;
    };
    resepsi: {
      title: string;
      date: string;
      time: string;
      venue: string;
      address: string;
      mapsUrl: string;
    };
  };
  story?: Array<{
    image?: string;
    year: string;
    title: string;
    desc: string;
  }>;
  sections?: {
    shareTemplate?: string;
    galleryTitle?: string;
    galleryVideo?: string;
    storyTitle?: string;
    giftTitle?: string;
    giftDescription?: string;
    wishTitle?: string;
    wishDescription?: string;
    footerText?: string;
  };
  gifts?: Array<{
    bank: string;
    number: string;
    holder: string;
  }>;
}

/**
 * Ekstraksi ID file Google Drive dari berbagai format URL atau ID mentah
 */
export function extractDriveId(urlOrId: string): string | null {
  if (!urlOrId) return null;
  const trimmed = urlOrId.trim();

  // Jika sudah berupa ID langsung (umumnya 25-45 karakter alfanumerik + '-' + '_')
  if (/^[a-zA-Z0-9_-]{25,50}$/.test(trimmed)) {
    return trimmed;
  }

  // Pola /file/d/[ID]
  const matchFileD = trimmed.match(/\/file\/d\/([a-zA-Z0-9_-]{25,50})/);
  if (matchFileD) return matchFileD[1];

  // Pola /d/[ID]
  const matchD = trimmed.match(/\/d\/([a-zA-Z0-9_-]{25,50})/);
  if (matchD) return matchD[1];

  // Pola id=[ID] query param
  const matchParam = trimmed.match(/[?&]id=([a-zA-Z0-9_-]{25,50})/);
  if (matchParam) return matchParam[1];

  // Pola folders/[ID]
  const matchFolder = trimmed.match(/\/folders\/([a-zA-Z0-9_-]{25,50})/);
  if (matchFolder) return matchFolder[1];

  return null;
}

/**
 * Mendapatkan URL gambar thumbnail Google Drive yang cepat untuk web
 */
export function getDriveThumbnailUrl(idOrUrl: string, width = 800): string {
  if (!idOrUrl) return "";
  if (/^(https?:\/\/|\/)/.test(idOrUrl) && !extractDriveId(idOrUrl)) return idOrUrl;
  const id = extractDriveId(idOrUrl) || idOrUrl;
  return `https://drive.google.com/thumbnail?id=${id}&sz=w${width}`;
}

/**
 * Mendapatkan URL resolusi tinggi Google User Content CDN
 */
export function getDriveFullUrl(idOrUrl: string): string {
  if (!idOrUrl) return "";
  if (/^(https?:\/\/|\/)/.test(idOrUrl) && !extractDriveId(idOrUrl)) return idOrUrl;
  const id = extractDriveId(idOrUrl) || idOrUrl;
  return `https://lh3.googleusercontent.com/d/${id}`;
}
