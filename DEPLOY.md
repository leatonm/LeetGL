# Push to GitHub (LeetGL) and Deploy on Vercel

## Is it ready for Vercel?

Yes. This is a standard Next.js app. Vercel will:

- Detect Next.js and run `npm install` + `npm run build`
- No env vars or extra config needed

---

## Push to https://github.com/leatonm/LeetGL.git

Your LeetGL repo currently has WebGL files. Choose one:

### Option A – Replace repo with JSON Checker (recommended)

The repo becomes only this app; Vercel uses repo root.

**In PowerShell, from a folder where you want to work:**

```powershell
# Clone your repo
git clone https://github.com/leatonm/LeetGL.git leetgl-json
cd leetgl-json

# Remove existing files (keep .git)
Get-ChildItem -Force | Where-Object { $_.Name -ne '.git' } | Remove-Item -Recurse -Force

# Copy app contents from your project (change path if needed)
Copy-Item -Path "C:\Users\leato\OneDrive\Desktop\CodeProjects\upwork\json-checker\*" -Destination "." -Recurse -Force

# Remove .next and node_modules so they aren't pushed (Vercel will install)
Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force node_modules -ErrorAction SilentlyContinue

# Commit and push
git add -A
git commit -m "Replace with JSON URL Checker app"
git push -u origin main
```

If your default branch is `master`, use `git push -u origin master` instead.

### Option B – Keep LeetGL and add JSON Checker as subfolder

Repo keeps existing files and gains a `json-checker` folder.

```powershell
git clone https://github.com/leatonm/LeetGL.git leetgl-json
cd leetgl-json

# Copy the whole json-checker folder (no .next or node_modules in git - .gitignore handles that)
Copy-Item -Path "C:\Users\leato\OneDrive\Desktop\CodeProjects\upwork\json-checker" -Destination "json-checker" -Recurse -Force
Remove-Item -Recurse -Force json-checker\.next -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force json-checker\node_modules -ErrorAction SilentlyContinue

git add -A
git commit -m "Add JSON URL Checker app"
git push -u origin main
```

---

## Deploy on Vercel

1. Go to [vercel.com](https://vercel.com) and sign in (e.g. with GitHub).
2. **Add New** → **Project** → import **leatonm/LeetGL**.
3. **Root Directory**:  
   - **Option A**: leave blank.  
   - **Option B**: set to `json-checker`.
4. **Build and Output**: leave default (Vercel detects Next.js).
5. Click **Deploy**.

Your app will get a URL like `https://leet-gl-xxx.vercel.app`. You can add a custom domain in the project settings.
