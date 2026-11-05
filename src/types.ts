export type Source = {
  id: number;
  title: string;
  institution: string;
  url: string;
  verified: boolean;
  accessed_on: string | null;
  publication_date: string;
  notes: string;
};
export type HistoricalEvent = {
  id: number;
  title: string;
  year: number;
  description: string;
  verified: boolean;
  source: Source;
  place_slug: string;
  place_name: string;
};
export type Place = {
  id: number;
  name: string;
  slug: string;
  municipality: string;
  category: string;
  period: string;
  description: string;
  context: string;
  significance: string;
  review_status: string;
  latitude: number | null;
  longitude: number | null;
  coordinate_source: Source | null;
  sources: Source[];
  claims: {
    id: number;
    text: string;
    source: Source;
    locator: string;
    kind: string;
  }[];
  events: HistoricalEvent[];
  media: {
    id: number;
    title: string;
    kind: string;
    url: string;
    creator: string;
    license: string;
    permission_url: string;
    alt_text: string;
  }[];
};
export type Route = {
  id: number;
  slug: string;
  title: string;
  description: string;
  stops: { order: number; prompt: string; place: Place }[];
};
export type Question = {
  id: number;
  prompt: string;
  options: string[];
  place__slug: string;
};
