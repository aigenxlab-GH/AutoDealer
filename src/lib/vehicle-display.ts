import type { Vehicle } from "@/lib/types";
import { formatKms } from "@/lib/format";

/** "1st Owner", "2nd Owner", "3rd Owner", "4th Owner"… */
export function ownerLabel(owners: number): string {
  const suffix =
    owners % 10 === 1 && owners % 100 !== 11
      ? "st"
      : owners % 10 === 2 && owners % 100 !== 12
        ? "nd"
        : owners % 10 === 3 && owners % 100 !== 13
          ? "rd"
          : "th";
  return `${owners}${suffix} Owner`;
}

const cap = (s?: string) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : "");

/** Compact attribute tags shown on cards: fuel/cc · kms · owner. */
export function specPills(v: Vehicle): string[] {
  const pills: string[] = [];
  if (v.type === "bike") {
    if (v.engineCc) pills.push(`${v.engineCc} cc`);
  } else {
    if (v.fuelType) pills.push(cap(v.fuelType));
    if (v.transmission) pills.push(cap(v.transmission));
  }
  pills.push(formatKms(v.kmsDriven));
  pills.push(ownerLabel(v.owners));
  return pills;
}

export { cap as capitalize };
