import type { Lead } from "@/lib/types";

/** A couple of sample leads so the admin desk isn't empty on first run. */
export const seedLeads: Lead[] = [
  {
    id: "lead-1",
    vehicleId: "car-thar-2022",
    customerName: "Rohit Sharma",
    customerPhone: "+919812345678",
    status: "new",
    createdAt: "2026-05-26T07:15:00.000Z",
  },
  {
    id: "lead-2",
    vehicleId: "car-creta-2020",
    customerName: "Anjali Mehta",
    customerPhone: "+919876501234",
    status: "contacted",
    createdAt: "2026-05-24T18:40:00.000Z",
  },
  {
    id: "lead-3",
    vehicleId: "bike-re-classic-2021",
    customerName: "Imran Khan",
    customerPhone: "+919900112233",
    status: "closed",
    createdAt: "2026-05-23T12:05:00.000Z",
  },
];
