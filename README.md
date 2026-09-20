# OcePvP website

Every file sits in this one folder — no subfolders, no database, no server.

| File | What it is |
|---|---|
| index.html | Home page |
| games.html | Games page + the suggestion form |
| rules.html | Rules & Policies |
| support.html | Support |
| style.css | All the styling |
| site.js | Menu, copy-IP buttons, games grid, suggestion form |
| games.js | **The games list — edit this to add or change games** |
| config.js | **The Discord webhook URL for suggestions** |
| logo.webp | Logo, favicon |

Server IP: ocepvp.xyz — Discord: https://discord.ocepvp.xyz

## Turning on suggestions

Suggestions from the Games page get posted straight into a Discord channel.

1. In Discord, right-click a **staff-only** channel → **Edit Channel**
2. **Integrations → Webhooks → New Webhook**
3. Name it "OcePvP Suggestions" → **Copy Webhook URL**
4. Paste it into `config.js`, between the quotes
5. Save and upload

Until you do that, the form tells people to use the Discord instead.

### One thing to know

The webhook URL is in the website's code, where anyone can read it. With it they can post to
that channel or delete the webhook. That's unavoidable on a site with no server. If it ever
gets abused: delete the webhook in Discord, make a new one, paste the new URL into
`config.js`. Point it at a staff channel, never anything important.

Built-in spam guards: a hidden trap field that catches most bots, one suggestion per minute
and five per hour per browser, and `@everyone`/`@here` in a suggestion can't ping anyone.

## Adding games

Edit `games.js`. The format is in the comment at the top of that file.

## Putting it online

It's plain files, so anything works — Render Static Site (build command blank, publish
directory `.`), GitHub Pages, Netlify, or normal web hosting.

## Previewing locally

Open `index.html` in a browser, or serve the folder with any static file server.
