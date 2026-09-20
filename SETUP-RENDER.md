# OcePvP setup — Render + MongoDB

Same setup as Rift Events, so this is the short version. Everything is free.

You need this only for the **suggestion form** and the **admin panel**. The rest of the site
works without it.

---

## 1. Put this folder on GitHub

Use GitHub Desktop: **File → Add local repository** → pick `D:\OcePvP-flat` → click the
**create a repository** link in the warning → **Commit to main** → **Publish repository**.
Keep it private.

---

## 2. Make the database (MongoDB Atlas)

⚠️ Make a **new project** for OcePvP. Atlas only allows one free cluster per project, and your
Rift Events cluster is in its own project. Use the project dropdown at the top left → **New
Project**.

1. In the new project, create a cluster → **M0 / Free**.
2. On the "Connect" popup, copy the **username** and **password** it makes for you.
3. **Security → Network Access → Add IP Address** → type `0.0.0.0/0` → **Confirm**.
4. **Connect → Drivers** → copy the link, and replace `<db_password>` with your password.

That finished link is your **MONGODB_URI**.

---

## 3. Put the API online (Render Web Service)

**New + → Web Service** → pick your `OcePvP-flat` repo.

| Field | Value |
|---|---|
| Name | `ocepvp-api` |
| Root Directory | `server` ← don't skip |
| Build Command | `npm install` |
| Start Command | `npm start` |
| Instance Type | Free |

Environment variables:

| Key | Value |
|---|---|
| `MONGODB_URI` | the link from step 2 |
| `ADMIN_PASSWORD` | a password you make up — this is your admin login |
| `ALLOWED_ORIGIN` | `*` for now |

✅ When it says **Live**, open its URL. You should see `{"ok":true,"service":"OcePvP API"}`.
Copy that URL.

---

## 4. Tell the website about the API

Open **`config.js`** and put your API URL between the quotes:

```js
const OCE_API = "https://ocepvp-api.onrender.com";
```

No slash on the end. Save, then in GitHub Desktop: **Commit to main** → **Push origin**.

That's the only line you change.

---

## 5. Put the website online (Render Static Site)

**New + → Static Site** → same repo → Build Command **blank**, Publish Directory `.`

You'll get a URL like `https://ocepvp.onrender.com`.

---

## 6. Lock it down

Back on the **ocepvp-api** service → **Environment** → change `ALLOWED_ORIGIN` from `*` to
your website URL from step 5, exactly, with no slash on the end. Save.

---

## 7. Test

1. Go to your site → **Games** → scroll to the suggestion form → send one.
2. Go to `/admin.html`, log in with your `ADMIN_PASSWORD`.
3. Your suggestion should be there. Try changing its status and deleting it.

---

## Things worth knowing

**The free API sleeps.** After 15 minutes with no visitors, the first request takes 30–60
seconds to wake it. You'll notice it on the admin panel login and the first suggestion someone
sends after a quiet spell. Everything else on the site is a static file and is always instant.

**Changing the admin password:** it lives only in Render → `ocepvp-api` → Environment →
`ADMIN_PASSWORD`. Change it there and it takes effect after the service restarts. Nothing in
the website files needs changing.

**Spam protection:** 3 suggestions per person per 10 minutes, plus a hidden trap field that
catches most bots. Visitor IPs are never stored, only a scrambled version held in memory.

---

## If something goes wrong

**"Couldn't reach the server."** The API is asleep or still deploying. Wait a minute. If it
keeps failing, open the API's URL directly and check for the `{"ok":true}` message.

**"No API address set."** `config.js` is still empty, or the push didn't go through.

**A CORS error in the browser console.** `ALLOWED_ORIGIN` doesn't exactly match your website
URL. Check for a trailing slash or `http` vs `https`.

**"Wrong password."** It's checked against `ADMIN_PASSWORD` in Render, exactly, capitals
included.

**The API won't start.** Render → **Logs**. `Missing MONGODB_URI` means a misspelled variable
name. `Authentication failed` means the password inside the connection link is wrong, or you
left `<db_password>` in there. A timeout means you missed the `0.0.0.0/0` step.
