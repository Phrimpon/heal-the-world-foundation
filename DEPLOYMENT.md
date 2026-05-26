# 🚀 Deploy Heal The World Foundation to Render
# Your site will be live at → https://htw.onrender.com

---

## STEP 1 — Create a Free GitHub Account

1. Go to **https://github.com**
2. Click **Sign up** (top-right corner)
3. Enter your email, create a password, choose a username
4. Verify your email address
5. ✅ You now have a GitHub account

---

## STEP 2 — Create a New GitHub Repository

1. Once logged in, click the **+** icon (top-right) → **New repository**
2. Fill in:
   - **Repository name**: `htw` (or `heal-the-world-foundation`)
   - **Description**: Heal The World Foundation Portal
   - Set to **Public**
   - Do NOT tick "Add a README"
3. Click **Create repository**
4. ✅ GitHub shows you an empty repo page — copy the URL at the top (e.g. `https://github.com/YourName/htw.git`)

---

## STEP 3 — Install Git on Your Laptop (If Not Already)

### Check if Git is installed:
Open your laptop terminal (Command Prompt / PowerShell on Windows, Terminal on Mac) and type:
```
git --version
```
If you see a version number, skip to Step 4.

### Install Git:
- **Windows**: Download from https://git-scm.com/download/win → Run the installer
- **Mac**: Run `xcode-select --install` in Terminal
- **Linux**: Run `sudo apt install git`

---

## STEP 4 — Push Your Project to GitHub

Open your terminal inside the project folder and run these commands **one by one**:

```bash
git init
git add .
git commit -m "Heal The World Foundation - Initial Deploy"
git branch -M main
git remote add origin https://github.com/YourName/htw.git
git push -u origin main
```

> ⚠️ Replace `YourName/htw.git` with the actual URL from your GitHub repo page.

When asked for credentials, enter your GitHub username and password.
If it asks for a token instead of a password, go to:
GitHub → Settings → Developer Settings → Personal Access Tokens → Generate new token → tick "repo" → Copy the token and paste it as your password.

✅ Your code is now on GitHub!

---

## STEP 5 — Create a Free Render Account

1. Go to **https://render.com**
2. Click **Get Started for Free**
3. Sign up using your **GitHub account** (recommended — it links them automatically)
4. ✅ You are now logged into Render

---

## STEP 6 — Deploy on Render (The Easy Part)

1. On the Render dashboard, click **New +** (top-right)
2. Click **Static Site**
3. Click **Connect GitHub** if not already connected
4. Find and click your **htw** repository
5. Fill in these settings:

   | Setting | Value |
   |---------|-------|
   | **Name** | `htw` |
   | **Branch** | `main` |
   | **Build Command** | `npm install && npm run build` |
   | **Publish Directory** | `dist` |

6. Click **Create Static Site**
7. ✅ Render starts building your project automatically!

---

## STEP 7 — Wait for the Build (2–3 minutes)

You will see a build log scrolling. When it says:
```
==> Your site is live 🎉
```
Your site is deployed!

---

## STEP 8 — Get Your Live URL

Your site will be at:
```
https://htw.onrender.com
```

Click **Open in Browser** on the Render dashboard to confirm it's working.

---

## 🔁 Future Updates (Every Time You Change the Code)

Whenever you make changes, just run:
```bash
git add .
git commit -m "Updated site"
git push
```
Render will automatically detect the push and redeploy your site within 1–2 minutes!

---

## ✅ Quick Checklist

- [ ] GitHub account created
- [ ] New repository created (`htw`)
- [ ] Git installed on laptop
- [ ] Code pushed to GitHub
- [ ] Render account created (signed up with GitHub)
- [ ] Static Site created on Render
- [ ] Build successful
- [ ] Site live at https://htw.onrender.com

---

## 🆘 Common Problems & Fixes

| Problem | Fix |
|---------|-----|
| `git: command not found` | Install Git from https://git-scm.com |
| `npm: command not found` | Install Node.js from https://nodejs.org |
| Build fails on Render | Make sure `package.json` is in the root folder |
| Blank white page | Check that Publish Directory is exactly `dist` |
| Page refreshes give 404 | The `render.yaml` rewrite rule handles this automatically |
| Wrong GitHub URL | Delete remote with `git remote remove origin` then re-add it |
