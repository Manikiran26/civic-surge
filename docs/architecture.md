# Architecture

## System Layout

The platform is split into three production layers:

1. Frontend workspace
   - React app in [`src/`](/Users/charan/Downloads/indiainno-main/src)
   - Map surface, nearby alerts, detail panel, impact widgets, report form, admin intake

2. API and geospatial layer
   - Express app in [`server/`](/Users/charan/Downloads/indiainno-main/server)
   - Zod validation for report/admin payloads
   - Nearby search via PostGIS in production and Haversine fallback in memory mode

3. Verified project catalogue
   - Source-backed records in [`shared/verifiedProjects.js`](/Users/charan/Downloads/indiainno-main/shared/verifiedProjects.js)
   - Validation in [`server/scripts/validate-data.js`](/Users/charan/Downloads/indiainno-main/server/scripts/validate-data.js)

## Folder Structure

```text
.
├── docs/
├── server/
│   ├── config/
│   ├── controllers/
│   ├── data/
│   ├── db/
│   ├── middleware/
│   ├── routes/
│   ├── scripts/
│   ├── services/
│   └── sql/
├── shared/
│   └── verifiedProjects.js
└── src/
    ├── components/
    ├── hooks/
    ├── services/
    └── utils/
```

## Database Model

- `projects`
  - geo-enabled via `GEOGRAPHY(POINT, 4326)`
  - stores source link, city/state, geo precision, budget/timeline display, and geofence radius
- `users`
  - reserved for future auth/home-location persistence
- `notifications`
  - server-side notification ledger
- `reports`
  - citizen issue reports and moderation queue

## API Surface

- `GET /api/projects`
- `GET /api/projects/nearby?lat=&lng=&radius=`
- `GET /api/projects/:id`
- `POST /api/report`
- `POST /api/admin/project`
- `GET /api/health`

## Deployment

### Frontend

- Vercel or Netlify
- Set `VITE_API_BASE_URL` to the backend origin
- Set `VITE_MAPBOX_TOKEN` for production map rendering

### Backend

- Render, Railway, Fly.io, or AWS App Runner
- Provision Postgres with PostGIS enabled
- Apply [`server/sql/schema.sql`](/Users/charan/Downloads/indiainno-main/server/sql/schema.sql)
- Set env from [`server/.env.example`](/Users/charan/Downloads/indiainno-main/server/.env.example)
- Run `npm run server:seed`

## Performance Notes

- Nearby queries are cached with TTL in [`server/config/cache.js`](/Users/charan/Downloads/indiainno-main/server/config/cache.js)
- Marker clustering is handled on the map layer
- The frontend uses deferred search input to keep filtering responsive
- Large map bundle remains the main remaining optimization target
