# Hyper-Local Civic Intelligence Platform

Production-oriented civic intelligence stack for verified Indian public-infrastructure projects. The app detects device location, finds nearby projects through a geospatial API, renders them on a multi-mode map, and explains civic impact with source-linked project detail.

## What Ships

- React/Vite frontend with map modes, nearby alerts, impact panels, reporting, and admin intake
- Express backend with `/api/projects`, `/api/projects/nearby`, `/api/projects/:id`, `/api/report`, and `/api/admin/project`
- Postgres/PostGIS schema in [`server/sql/schema.sql`](/Users/charan/Downloads/indiainno-main/server/sql/schema.sql)
- Verified 31-project source dataset in [`shared/verifiedProjects.js`](/Users/charan/Downloads/indiainno-main/shared/verifiedProjects.js)
- Dataset validation script in [`server/scripts/validate-data.js`](/Users/charan/Downloads/indiainno-main/server/scripts/validate-data.js)

## Stack

- Frontend: React 19, Vite, `react-map-gl`, Tailwind CSS utilities, Lucide icons
- Backend: Node.js, Express 5, Zod validation, Postgres, PostGIS
- Data layer: shared verified project catalogue plus Postgres seed path

## Run Locally

1. Install dependencies:
```bash
npm install
```
2. Copy env files:
```bash
cp .env.example .env
cp server/.env.example server/.env
```
3. Start the frontend:
```bash
npm run dev
```
4. Start the backend in a second terminal:
```bash
npm run server
```
5. Optional PostGIS seed:
```bash
npm run server:seed
```

## Validation

```bash
npm run validate:data
npm run lint
npm run build
```

## Key Files

- [`src/App.jsx`](/Users/charan/Downloads/indiainno-main/src/App.jsx): main operational workspace
- [`src/components/MapCanvas.jsx`](/Users/charan/Downloads/indiainno-main/src/components/MapCanvas.jsx): map rendering, clustering, selection, user marker
- [`src/components/GeoFenceNotification.jsx`](/Users/charan/Downloads/indiainno-main/src/components/GeoFenceNotification.jsx): session-scoped nearby alerts
- [`server/services/projectService.js`](/Users/charan/Downloads/indiainno-main/server/services/projectService.js): project list, nearby geo search, admin project creation
- [`server/routes/projects.js`](/Users/charan/Downloads/indiainno-main/server/routes/projects.js): project API routes
- [`docs/architecture.md`](/Users/charan/Downloads/indiainno-main/docs/architecture.md): architecture, folder layout, deployment
- [`docs/data-sourcing.md`](/Users/charan/Downloads/indiainno-main/docs/data-sourcing.md): source methodology and geo-anchor rules

## Notes

- The seed catalogue uses verified project identities only. Missing source fields stay `unknown`.
- Coordinates are representative anchors for named stations, campuses, facilities, or corridor midpoints. They are not survey-grade parcel coordinates.
- The backend runs with an in-memory fallback when `DATABASE_URL` is not configured; production mode should use Postgres/PostGIS.
