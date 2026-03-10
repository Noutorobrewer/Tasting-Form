// ---- Existing tables (from isekadoproduction Supabase) ----

export type FillingSchedule = {
  id: string;
  filling_date: string;
  cellar_lot_id: string | null;
  tank_id: string | null;
  product_id: string | null;
  best_before_date: string | null;
  project_id: string | null;
  crown_type: string | null;
  submitter_email: string | null;
  is_full_drain: boolean;
  date_type: string | null;
  version: number;
  created_at: string;
  updated_at: string;
  created_by: string | null;
};

export type FillingProduct = {
  id: string;
  name: string;
  volume_l: number | null;
  created_at: string;
};

export type CellarLot = {
  id: string;
  name: string;
  tank_id: string | null;
  stage: string | null;
};

export type Beer = {
  id: string;
  name: string;
  volume_kl: number | null;
};

export type Brew = {
  id: string;
  cellar_lot_id: string | null;
  beer_id: string | null;
};

// ---- Tasting form tables ----

export type BeerColor =
  | "Straw"
  | "Gold"
  | "Light Amber"
  | "Deep Amber/Copper"
  | "Brown"
  | "Black";

export type InappropriateAppearance =
  | "Head Color"
  | "Foam Volume"
  | "Head Retention"
  | "Beer Color"
  | "Beer Clarity";

export type InappropriateAroma =
  | "Malt"
  | "Hops"
  | "Fermentation Character";

export type OffFlavor =
  | "Bacteria or Wild Yeast"
  | "Acidic/Sour"
  | "Diacetyl"
  | "DMS"
  | "Phenolic"
  | "Vegetal";

export type TechnicalDefect =
  | "Balance Not Example of Style"
  | "Carbonation"
  | "Oxidation"
  | "Unexpected Ingredient Choice";

export interface Profile {
  id: string;
  display_name: string;
  email: string | null;
  photo_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface ProductTasting {
  id: string;
  taster_id: string;
  filling_schedule_id: string;
  // Appearance
  head_color: number | null;
  foam_volume: number | null;
  head_retention: number | null;
  beer_color: BeerColor | null;
  clarity: number | null;
  inappropriate_appearance: InappropriateAppearance[];
  appearance_comments: string | null;
  // Aroma
  malt_aroma: number | null;
  hop_aroma: number | null;
  fermentation_aroma: number | null;
  inappropriate_aroma: InappropriateAroma[];
  aroma_comments: string | null;
  // Flavor
  sweetness: number | null;
  bitterness: number | null;
  sourness: number | null;
  malt_flavor: number | null;
  hop_flavor: number | null;
  fermentation_flavor: number | null;
  balance: number | null;
  flavor_comments: string | null;
  // Mouthfeel
  alcohol: number | null;
  carbonation: number | null;
  body: number | null;
  astringency: number | null;
  // Defects
  off_flavor: string[];
  technical_defects: string[];
  // Overall
  overall: number | null;
  overall_comments: string | null;
  created_at: string;
  updated_at: string;
}

export interface TastingSummary {
  filling_schedule_id: string;
  filling_date: string | null;
  container: string | null;
  cellar_lot_name: string | null;
  beer_name: string | null;
  tasting_count: number;
  avg_overall: number | null;
}

// ---- Joined type for filling schedule selection ----

export type FillingScheduleWithRelations = FillingSchedule & {
  cellar_lots: Pick<CellarLot, "name"> | null;
  filling_products: Pick<FillingProduct, "name"> | null;
};

// ---- Enum option arrays for form rendering ----

export const BEER_COLORS: BeerColor[] = [
  "Straw",
  "Gold",
  "Light Amber",
  "Deep Amber/Copper",
  "Brown",
  "Black",
];

export const INAPPROPRIATE_APPEARANCE_OPTIONS: InappropriateAppearance[] = [
  "Head Color",
  "Foam Volume",
  "Head Retention",
  "Beer Color",
  "Beer Clarity",
];

export const INAPPROPRIATE_AROMA_OPTIONS: InappropriateAroma[] = [
  "Malt",
  "Hops",
  "Fermentation Character",
];

export const OFF_FLAVOR_OPTIONS: OffFlavor[] = [
  "Bacteria or Wild Yeast",
  "Acidic/Sour",
  "Diacetyl",
  "DMS",
  "Phenolic",
  "Vegetal",
];

export const TECHNICAL_DEFECT_OPTIONS: TechnicalDefect[] = [
  "Balance Not Example of Style",
  "Carbonation",
  "Oxidation",
  "Unexpected Ingredient Choice",
];
