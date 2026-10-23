export type LeadStatus = "New" | "Contacted" | "Visit Scheduled" | "Negotiation" | "Booked" | "Lost";
export type LeadSource = "99acres" | "Website" | "Magicbricks" | "Facebook Ads" | "Referral" | "Walk-in" | "Instagram";
export type Lead = {
  id: string; name: string; phone: string; email: string; source: LeadSource | string;
  budget: string; propertyType: string; area: string; status: LeadStatus; agent: string;
  nextFollowUp: string; notes: string; createdAt: string; activity: Activity[];
};
export type Activity = { id: string; title: string; description: string; date: string };
export type Property = { id: string; name: string; type: string; location: string; price: string; configuration: string; availableUnits: number; status: "Available" | "Limited units" | "Sold out"; color: string; };
export type Task = { id: string; title: string; description: string; due: string; kind: "Call" | "Site visit" | "Email" | "Meeting"; leadName: string; completed: boolean };
export type SiteVisit = { id: string; leadName: string; propertyName: string; date: string; agent: string; status: "Confirmed" | "Pending" | "Completed" | "Cancelled" };
export type TeamMember = { id: string; name: string; role: string; initials: string; leads: number; visits: number; bookings: number; target: number; };
