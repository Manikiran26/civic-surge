# Data Sourcing

## Rules Applied

- Only real project identities were included.
- Missing source-backed fields remain `unknown`.
- Coordinates are representative anchors for named facilities or corridor midpoints, not land-survey coordinates.
- Duplicate checks run on normalized project name plus state.

## Source Backbone

The current catalogue in [`shared/verifiedProjects.js`](/Users/charan/Downloads/indiainno-main/shared/verifiedProjects.js) draws primarily from:

- PIB Mumbai projects release: https://www.pib.gov.in/PressReleasePage.aspx?PRID=1892302
- PIB Kolkata connectivity release: https://www.pib.gov.in/PressReleasePage.aspx?PRID=2011855
- PIB Rewari/Haryana projects release: https://www.pib.gov.in/PressReleasePage.aspx?PRID=2006554
- PIB Jodhpur projects release: https://www.pib.gov.in/PressReleasePage.aspx?PRID=1964539
- PIB / PM India Meghalaya projects release: https://www.pib.gov.in/Pressreleaseshare.aspx?PRID=1884553
- Verified Visakhapatnam coverage: https://nagalandtribune.in/pm-launches-infra-projects-worth-rs-15233-cr-in-ap-lays-foundation-stone-for-redevelopment-of-vizag-railway-station/
- Supporting Visakhapatnam package coverage: https://indiainfrahub.com/news/andhra-pradesh-prime-minister-modi-to-launch-development-projects-in-visakhapatnam-on-11-november/

## Validation

Run:

```bash
npm run validate:data
```

This checks:

- required fields
- coordinate range validity
- duplicate project identity collisions
- presence of geo metadata used by the frontend and geofence engine
