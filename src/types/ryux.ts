import type { LucideIcon } from "lucide-react";

export type PlatformCard = {
  number: string;
  title: string;
  body: string;
  icon: LucideIcon;
  cta?: string;
  badges?: string[];
  wide?: boolean;
};

export type Metric = {
  value: string;
  label: string;
  note?: string;
};
