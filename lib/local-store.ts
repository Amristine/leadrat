import type { Lead, Property, Task, SiteVisit, TeamMember, Campaign } from "./types";
import { seedLeads, seedProperties, seedTasks, seedVisits, seedTeam, seedCampaigns } from "./demo-data";

const keys = { leads: "leadrat:v1:leads", properties: "leadrat:v1:properties", tasks: "leadrat:v1:tasks", visits: "leadrat:v1:visits", team: "leadrat:v1:team", campaigns: "leadrat:v1:campaigns" } as const;

function load<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try { const raw = window.localStorage.getItem(key); return raw ? JSON.parse(raw) as T : fallback; }
  catch { return fallback; }
}
function save<T>(key: string, value: T) {
  if (typeof window !== "undefined") window.localStorage.setItem(key, JSON.stringify(value));
}
export const localStore = {
  loadLeads: () => load<Lead[]>(keys.leads, seedLeads),
  saveLeads: (value: Lead[]) => save(keys.leads, value),
  loadProperties: () => load<Property[]>(keys.properties, seedProperties),
  saveProperties: (value: Property[]) => save(keys.properties, value),
  loadTasks: () => load<Task[]>(keys.tasks, seedTasks),
  saveTasks: (value: Task[]) => save(keys.tasks, value),
  loadVisits: () => load<SiteVisit[]>(keys.visits, seedVisits),
  saveVisits: (value: SiteVisit[]) => save(keys.visits, value),
  loadTeam: () => load<TeamMember[]>(keys.team, seedTeam),
  saveTeam: (value: TeamMember[]) => save(keys.team, value),
  loadCampaigns: () => load<Campaign[]>(keys.campaigns, seedCampaigns),
  saveCampaigns: (value: Campaign[]) => save(keys.campaigns, value),
};
