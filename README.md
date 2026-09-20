# OcePvP website

The website itself is all in this one folder. The only subfolder is `server/`, which holds the
API and is deployed separately to Render.

**To put it online, follow [SETUP-RENDER.md](SETUP-RENDER.md).**

| File | What it is |
|---|---|
| index.html | Home page |
| games.html | Games page + the suggestion form |
| rules.html | Rules & Policies |
| support.html | Support |
| admin.html | Admin panel for suggestions — not linked anywhere, go to `/admin.html` |
| style.css | All the styling |
| site.js | Menu, copy-IP buttons, games grid, suggestion form |
| games.js | **The games list — edit this to add or change games** |
| admin.js | Admin panel behaviour |
| config.js | **The API address — one line, set after deploying** |
| server/ | The API that saves suggestions to MongoDB (deployed to Render) |
| logo.webp | Logo, favicon |

Server IP: ocepvp.xyz — Discord: https://discord.ocepvp.xyz

## Passwords

The admin password lives only in Render, as the `ADMIN_PASSWORD` environment variable on the
`ocepvp-api` service. Nothing secret is stored in these files, so the repo is safe to push.
