# ⚡ UNDERGROUND STREET COLLECTIVE (U.S.C.) & AURU TRINITY
> **Repozitár:** `https://github.com/uscolective-byte/Tenebris`

Kompletná digitálna platforma pre ekosystém U.S.C. a Auru Trinity s plnou integráciou 6 pilierov, Cloudflare Pages/Workers, Firebase Firestore, AI Matrix dispečingu a správy fleetu a montáží.

---

## 🚀 Rýchly Push do GitHub repozitára `uscolective-byte/Tenebris`

Ak chceš nahrať celý tento projekt do tvojho repozitára `https://github.com/uscolective-byte/Tenebris`:

```bash
# 1. Inicializácia gitu v priečinku projektu
git init

# 2. Pridanie vzdialeného repozitára (Remote origin)
git remote add origin https://github.com/uscolective-byte/Tenebris.git

# 3. Nastavenie hlavnej vetvy
git branch -M main

# 4. Pridanie všetkých súborov a commit
git add .
git commit -m "feat: complete USC & Auru Trinity ecosystem codebase"

# 5. Push do GitHubu (v prípade prázdneho repozitára)
git push -u origin main

# Ak už v repozitári niečo bolo a chceš to nahradiť týmto projektom:
git push -u origin main --force
```

---

## 🛠️ Inštalácia & Lokálne Spustenie

```bash
# 1. Klonovanie repozitára
git clone https://github.com/uscolective-byte/Tenebris.git
cd Tenebris

# 2. Inštalácia závislostí
npm install
# alebo
bun install

# 3. Nastavenie premenných prostredia
cp .env.example .env

# 4. Spustenie vývojového servera (Port 3000)
npm run dev
# alebo
bun run dev
```

---

## ☁️ Cloudflare Pages / Workers Deploy

Projekt je predkonfigurovaný pre Cloudflare cez `wrangler.toml` a automatický GitHub Action workflow (`.github/workflows/deploy.yml`).

Pre manuálny build a deploy:
```bash
npm run build
npx wrangler pages deploy dist --project-name=usc-underground
```

---

## 📂 Architektúra
* `src/` – Frontend v React 18, TypeScript, Tailwind CSS, Lucide ikony a Motion animácie.
* `server.ts` – Express backend server, Gemini AI proxy a Cloudflare R2 S3 storage integrácia.
* `firestore.rules` – Zabezpečenie 14 databázových kolekcií vo Firestore.
* `.github/workflows/deploy.yml` – Automatický CI/CD deploy pri každom pushi na vetvu `main`.

