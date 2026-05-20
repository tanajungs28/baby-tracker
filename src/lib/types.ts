export type RecordType = "breastfeeding" | "pumping" | "formula" | "pee" | "poop";

export interface Baby {
  id: string;
  user_id: string;
  name: string;
  birth_date: string;
  created_at: string;
}

export interface BabyRecord {
  id: string;
  user_id: string;
  baby_id: string;
  recorded_date: string;
  recorded_hour: number;
  type: RecordType;
  count: number | null;
  amount_ml: number | null;
  created_at: string;
  updated_at: string;
}

export const RECORD_TYPES: RecordType[] = [
  "breastfeeding",
  "pumping",
  "formula",
  "pee",
  "poop",
];

export const RECORD_TYPE_LABELS: { [K in RecordType]: string } = {
  breastfeeding: "授乳",
  pumping: "搾乳",
  formula: "ミルク",
  pee: "尿",
  poop: "便",
};

export const RECORD_TYPE_COLORS: { [K in RecordType]: string } = {
  breastfeeding: "#FFB6C8",
  pumping: "#D8B4FE",
  formula: "#FEF08A",
  pee: "#BAE6FD",
  poop: "#C4A882",
};

export const RECORD_TYPE_EMOJIS: { [K in RecordType]: string } = {
  breastfeeding: "🌸",
  pumping: "💜",
  formula: "🍼",
  pee: "💧",
  poop: "🟤",
};
