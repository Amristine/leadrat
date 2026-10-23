import type { Lead, Property, Task, SiteVisit, TeamMember } from "./types";

const activity = (id: string, title: string, description: string, date: string) => ({ id, title, description, date });
export const seedLeads: Lead[] = [
 {id:"LD-1001",name:"Aditi Sharma",phone:"+91 98201 45821",email:"aditi.sharma@example.com",source:"99acres",budget:"₹75L–₹1Cr",propertyType:"2 BHK Apartment",area:"Thane West",status:"Visit Scheduled",agent:"Priya Mehta",nextFollowUp:"Today, 11:30 AM",notes:"Looking for possession within six months. Family of three.",createdAt:"Today",activity:[activity("a1","Call completed","Discussed 2 BHK options in Thane West","Today, 9:42 AM"),activity("a2","Site visit scheduled","Greenwood Heights · Today, 11:30 AM","Yesterday, 4:20 PM")]},
 {id:"LD-1002",name:"Rohan Desai",phone:"+91 98206 72319",email:"rohan.d@example.com",source:"Website",budget:"₹1Cr–₹2Cr",propertyType:"3 BHK Apartment",area:"Powai",status:"Negotiation",agent:"Arjun Rao",nextFollowUp:"Today, 12:00 PM",notes:"Interested in lake-facing units. Needs home-loan guidance.",createdAt:"Today",activity:[activity("a3","Price discussion","Shared updated price sheet","Today, 10:05 AM")]},
 {id:"LD-1003",name:"Neha Kapoor",phone:"+91 98192 38044",email:"neha.k@example.com",source:"Magicbricks",budget:"₹50L–₹75L",propertyType:"2 BHK Apartment",area:"Dombivli",status:"Contacted",agent:"Priya Mehta",nextFollowUp:"Today, 1:00 PM",notes:"Prefers east-facing flat near the station.",createdAt:"Yesterday",activity:[activity("a4","Call completed","Initial requirements captured","Today, 8:50 AM")]},
 {id:"LD-1004",name:"Karan Malhotra",phone:"+91 98920 11743",email:"karan.m@example.com",source:"Referral",budget:"₹2Cr+",propertyType:"Villa",area:"Lonavala",status:"New",agent:"Unassigned",nextFollowUp:"Today, 2:30 PM",notes:"Looking for a weekend villa; follow up on preferred plot size.",createdAt:"Today",activity:[activity("a5","New lead received","Referred by an existing customer","Today, 9:05 AM")]},
 {id:"LD-1005",name:"Meera Iyer",phone:"+91 98190 66122",email:"meera.iyer@example.com",source:"Facebook Ads",budget:"₹75L–₹1Cr",propertyType:"2 BHK Apartment",area:"Mulund",status:"Booked",agent:"Arjun Rao",nextFollowUp:"Oct 25, 10:00 AM",notes:"Booking amount received. Coordinate agreement paperwork.",createdAt:"Yesterday",activity:[activity("a6","Booking confirmed","Orchid Park · Unit B-1203","Yesterday, 5:45 PM")]},
 {id:"LD-1006",name:"Vikram Shah",phone:"+91 98211 08051",email:"vikram.s@example.com",source:"Walk-in",budget:"Below ₹50L",propertyType:"1 BHK Apartment",area:"Kalyan",status:"New",agent:"Priya Mehta",nextFollowUp:"Tomorrow, 10:00 AM",notes:"First-time buyer. Share home-loan eligibility checklist.",createdAt:"Today",activity:[activity("a7","Walk-in enquiry","Visited office with spouse","Today, 10:15 AM")]},
 {id:"LD-1007",name:"Sana Khan",phone:"+91 98330 50271",email:"sana.k@example.com",source:"Website",budget:"₹1Cr–₹2Cr",propertyType:"3 BHK Apartment",area:"Chembur",status:"Contacted",agent:"Arjun Rao",nextFollowUp:"Tomorrow, 11:30 AM",notes:"Wants a ready-to-move property.",createdAt:"Yesterday",activity:[activity("a8","Call completed","Shared three available properties","Today, 9:10 AM")]},
 {id:"LD-1008",name:"Dev Patel",phone:"+91 98200 32418",email:"dev.patel@example.com",source:"Instagram",budget:"₹50L–₹75L",propertyType:"2 BHK Apartment",area:"Kalyan West",status:"Lost",agent:"Sneha Patil",nextFollowUp:"—",notes:"Paused search until next quarter.",createdAt:"Oct 20",activity:[activity("a9","Lead marked lost","Customer postponed purchase","Oct 21, 4:10 PM")]}
];
export const seedProperties: Property[] = [
 {id:"PR-101",name:"Greenwood Heights",type:"Residential",location:"Thane West, Mumbai",price:"₹82 Lakh onwards",configuration:"2 & 3 BHK",availableUnits:18,status:"Available",color:"sage"},
 {id:"PR-102",name:"Lakeview Residences",type:"Residential",location:"Powai, Mumbai",price:"₹1.45 Cr onwards",configuration:"2 & 3 BHK",availableUnits:7,status:"Limited units",color:"sand"},
 {id:"PR-103",name:"Orchid Park",type:"Residential",location:"Mulund West, Mumbai",price:"₹96 Lakh onwards",configuration:"2 BHK",availableUnits:12,status:"Available",color:"blue"},
 {id:"PR-104",name:"Palm Grove Villas",type:"Gated community",location:"Lonavala, Maharashtra",price:"₹2.2 Cr onwards",configuration:"3 & 4 BHK",availableUnits:4,status:"Limited units",color:"sand"},
 {id:"PR-105",name:"Metro Square",type:"Commercial",location:"Dombivli East, Mumbai",price:"₹48 Lakh onwards",configuration:"Office suites",availableUnits:24,status:"Available",color:"blue"},
 {id:"PR-106",name:"Skyline Aura",type:"Residential",location:"Chembur, Mumbai",price:"₹1.28 Cr onwards",configuration:"2 & 3 BHK",availableUnits:3,status:"Limited units",color:"sage"}
];
export const seedTasks: Task[] = [
 {id:"TK-1",title:"Call Aditi Sharma",description:"Discuss payment plan · Greenwood Heights",due:"Today · 11:30 AM",kind:"Call",leadName:"Aditi Sharma",completed:false},
 {id:"TK-2",title:"Site visit with Rohan Desai",description:"Lakeview Residences · Powai",due:"Today · 12:00 PM",kind:"Site visit",leadName:"Rohan Desai",completed:false},
 {id:"TK-3",title:"Call Neha Kapoor",description:"Confirm budget and preferred floor",due:"Today · 1:00 PM",kind:"Call",leadName:"Neha Kapoor",completed:false},
 {id:"TK-4",title:"Send brochure to Karan Malhotra",description:"Palm Grove Villas · Lonavala",due:"Today · 2:30 PM",kind:"Email",leadName:"Karan Malhotra",completed:false},
 {id:"TK-5",title:"Follow up with Sana Khan",description:"Ready-to-move options · Chembur",due:"Tomorrow · 11:30 AM",kind:"Call",leadName:"Sana Khan",completed:false},
 {id:"TK-6",title:"Agreement review — Meera Iyer",description:"Orchid Park · Unit B-1203",due:"Oct 25 · 10:00 AM",kind:"Meeting",leadName:"Meera Iyer",completed:false}
];
export const seedVisits: SiteVisit[] = [
 {id:"SV-1",leadName:"Aditi Sharma",propertyName:"Greenwood Heights",date:"Today, 11:30 AM",agent:"Priya Mehta",status:"Confirmed"},
 {id:"SV-2",leadName:"Rohan Desai",propertyName:"Lakeview Residences",date:"Today, 12:00 PM",agent:"Arjun Rao",status:"Confirmed"},
 {id:"SV-3",leadName:"Neha Kapoor",propertyName:"Metro Square",date:"Oct 24, 3:00 PM",agent:"Priya Mehta",status:"Pending"},
 {id:"SV-4",leadName:"Sana Khan",propertyName:"Skyline Aura",date:"Oct 25, 11:00 AM",agent:"Arjun Rao",status:"Confirmed"}
];
export const seedTeam: TeamMember[] = [
 {id:"TM-1",name:"Priya Mehta",role:"Senior Sales Executive",initials:"PM",leads:88,visits:42,bookings:8,target:88},
 {id:"TM-2",name:"Arjun Rao",role:"Sales Executive",initials:"AR",leads:76,visits:37,bookings:6,target:76},
 {id:"TM-3",name:"Sneha Patil",role:"Sales Executive",initials:"SP",leads:64,visits:29,bookings:5,target:64},
 {id:"TM-4",name:"Kabir Nair",role:"Relationship Manager",initials:"KN",leads:59,visits:24,bookings:4,target:59}
];

export const seedCampaigns = [
 {id:"CP-101",name:"October Property Enquiries",channel:"Meta Ads",startDate:"2026-10-01",budget:25000,status:"Active" as const},
 {id:"CP-102",name:"Thane 2 BHK Search",channel:"99acres",startDate:"2026-10-04",budget:12000,status:"Active" as const},
 {id:"CP-103",name:"Homebuyer Newsletter",channel:"Email",startDate:"2026-10-10",budget:3500,status:"Draft" as const}
];
