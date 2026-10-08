# 🚀 How to Deploy FreeVideoAIMaker on Render for FREE (with Secure HF Token Protection)

Follow these simple steps to deploy **FreeVideoAIMaker** on **Render.com** at zero cost, with full protection of your Hugging Face API key so it is never exposed or revoked by automated secret scanners.

---

## 🔒 Step 1: Why You Must Never Hardcode Your Token in Git Files
Hugging Face and GitHub run automated secret scanners (GitGuardian, GitHub Secret Scanning, HF Token Bots). If a raw token starting with `hf_...` is detected in a public repository commit, Hugging Face **automatically invalidates and revokes** that token immediately within seconds.

**The Solution:**
We set the token inside Render's **Private Environment Variables** (or via the built-in Secure Key Settings modal inside the app). Render encrypts it in secure hardware enclaves that public scanners cannot inspect.

---

## 🛠️ Step 2: Push Your Code to GitHub
1. Create a new repository on your GitHub account (named `FreeVideoAIMaker`).
2. Push your project code to GitHub:
   ```bash
   git init
   git add .
   git commit -m "Initial commit of FreeVideoAIMaker"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/FreeVideoAIMaker.git
   git push -u origin main
   ```

---

## 🌐 Step 3: Deploy on Render.com (100% Free)
1. Go to [https://render.com](https://render.com) and sign in (or sign up for a free account).
2. Click **New +** in the top navigation bar and select **Web Service**.
3. Select **Build and deploy from a Git repository** and connect your GitHub repo `FreeVideoAIMaker`.
4. Fill in the deployment details:
   - **Name**: `freevideoaimaker` (or any name you prefer)
   - **Region**: Frankfurt, Oregon, or Ohio (closest to your audience)
   - **Branch**: `main`
   - **Runtime**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Instance Type**: `Free` ($0/month)

---

## 🔑 Step 4: Add Your Hugging Face Key Safely in Render
1. In the same Render setup page, scroll down to the **Environment Variables** section (or click **Environment** in your service dashboard).
2. Click **Add Environment Variable**:
   - **Key**: `HF_TOKEN`
   - **Value**: `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`
3. Click **Create Web Service** (or **Save Changes**).

🎉 **Render will now build and launch your site!** Within 2-3 minutes, your site will be live at:
`https://freevideoaimaker.onrender.com`

---

## 💡 Alternative Option: Client-Side Token Storage
If you do not want to set an environment variable on the server, you and your users can also click the **"API Key / Settings"** button directly in the web app navigation bar:
- Paste the Hugging Face token in the secure input field.
- The app stores it locally in the browser's encrypted session storage and passes it via safe HTTPS request headers (`x-hf-token`).
- It is never exposed in the source code or build artifacts.

---

## 📈 Monetization & Ads Setup (Google AdSense)
The app includes pre-positioned, non-intrusive standard ad units:
- **Leaderboard Banner** (728x90 desktop / 320x50 mobile)
- **Generator Sidebar** (300x250 medium rectangle)
- **Showcase In-Feed Banner** (728x90 / responsive)

To activate real Google AdSense ads:
1. Open `src/components/AdBanner.tsx`
2. Replace `ca-pub-XXXXXXXXXXXXXXXX` with your approved AdSense Publisher ID.
3. Replace the `data-ad-slot` numbers with your ad unit slots.
4. Add the Google AdSense script tag to `index.html`.
