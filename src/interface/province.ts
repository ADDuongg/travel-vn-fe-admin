export interface Province {
  _id: string;
  code: string;
  slug: string;
  name: { vi: string; en: string };
  fullName?: { vi: string; en: string };
}
