# LeadRat — Real Estate CRM

A responsive real-estate CRM starter inspired by common property-sales workflows. It is an original implementation and does not copy Leadrat's proprietary code or assets.

## Features in this build

- **Dashboard:** live counts from local records, pipeline distribution, lead activity visualization, and upcoming tasks.
- **Lead management:** search by name/phone/email/area, filter by status and source, add/edit/delete leads, update assignments and follow-ups, bulk status updates, activity timeline, CSV export.
- **Properties:** inventory cards, location and price details, search/type filters, add and remove properties.
- **Follow-ups:** create tasks, filter open/completed tasks, mark tasks complete, view task-type progress.
- **Site visits:** schedule tours, assign agents, and update visit statuses.
- **Campaigns:** summarize lead source volume and bookings by channel; create a demo campaign form.
- **Team:** add team members and view sample activity metrics.
- **Reports:** calculated funnel metrics and downloadable report.
- **Settings:** workspace preferences, notification preferences, integration placeholders, role descriptions, and demo data reset.
- **Responsive interface:** desktop sidebar, mobile navigation, accessible dialogs, and keyboard focus styling.

## Run locally

Requirements: Node.js 20 or later.

```bash
npm install
npm run dev
```

Open http://localhost:3000.

To create a production build:

```bash
npm run build
npm start
```

## Data and integration status

This version deliberately has **no Supabase or external database connection** yet. Records are stored in the current browser's localStorage. This makes it useful for reviewing the product and trying the main workflows, but data is local to one browser/device and is not suitable for production or shared teams. Workspace settings are currently held in the running session.

The dashboard uses seed/demo records and illustrative activity history. Some team/campaign metrics are sample values, not business analytics from a live system. Campaign records are saved locally; automatic sync with advertising platforms is not connected.

## Before production

1. Connect Supabase/Postgres and add migrations/schema for organizations, profiles, leads, properties, tasks, visits, campaigns, activity, and team membership.
2. Add authentication, organization scoping, and database-enforced role-based authorization.
3. Validate data server-side and add duplicate detection, audit history, pagination, and safe bulk actions.
4. Add authorized WhatsApp, property portal, calling, email, and calendar integrations with secrets stored server-side.
5. Add automated tests, error monitoring, backups, and a privacy/retention policy.

Do not store real customer or sensitive business information in this prototype.
