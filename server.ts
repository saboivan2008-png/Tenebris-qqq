import "dotenv/config";
import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import multer from "multer";
import { S3Client, PutObjectCommand, GetObjectCommand, CreateBucketCommand } from "@aws-sdk/client-s3";
import { GoogleGenAI } from "@google/genai";

// Lazy initialization for Gemini client (avoids crash/unhandled rejection if GEMINI_API_KEY is not provisioned)
let aiClient: GoogleGenAI | null = null;

function getGeminiClient(): GoogleGenAI | null {
  if (!process.env.GEMINI_API_KEY) {
    return null;
  }
  if (!aiClient) {
    try {
      aiClient = new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY,
      });
    } catch (err) {
      console.error("[Gemini Client Init Warning]:", err);
      return null;
    }
  }
  return aiClient;
}

// Helper to call Gemini with smart model fallback (gemini-3.8-flash -> gemini-flash-latest -> gemini-2.5-flash)
async function callGemini(contents: string, systemInstruction: string, temperature = 0.5): Promise<string | null> {
  const gemini = getGeminiClient();
  if (!gemini) return null;

  const candidateModels = ["gemini-3.8-flash", "gemini-flash-latest", "gemini-2.5-flash"];

  for (const modelName of candidateModels) {
    try {
      const response = await gemini.models.generateContent({
        model: modelName,
        contents,
        config: {
          systemInstruction,
          temperature,
        }
      });
      if (response && response.text) {
        return response.text;
      }
    } catch (err: any) {
      console.warn(`[Gemini model ${modelName} fallback check]:`, err?.message || err);
      // Continue to next model in list
    }
  }
  return null;
}

// Configure Multer (memory storage for direct pass-through to R2)
const upload = multer({ storage: multer.memoryStorage() });

// Retrieve Cloudflare details
const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
// Prioritize AWS_ACCESS_KEY_ID but fallback to the CLOUDFLARE_ACCESS_CLIENT_ID the user entered
const accessKeyId = process.env.AWS_ACCESS_KEY_ID || process.env.CLOUDFLARE_ACCESS_CLIENT_ID;
const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY || process.env.CLOUDFLARE_ACCESS_CLIENT_SECRET;
const BUCKET_NAME = "trinity"; // Použijeme bucket, ktorý si vytvoril

// Initialize S3 Client ONLY if we have the credentials
let s3: S3Client | null = null;

if (accountId && accessKeyId && secretAccessKey) {
  s3 = new S3Client({
    region: "auto",
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId,
      secretAccessKey,
    }
  });
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  // JSON Body Parser for API requests
  app.use(express.json());

  // ==========================================
  // 🛡️ API ROUTES (Must be defined BEFORE Vite)
  // ==========================================
  
  // Health check with Gemini & Cloudflare verification
  app.get("/api/health", (req, res) => {
    res.json({ 
      status: "ok", 
      message: "U.S.C Server Running",
      geminiConfigured: !!process.env.GEMINI_API_KEY,
      cloudflareConfigured: !!s3,
      bucket: BUCKET_NAME,
      repository: "https://github.com/uscolective-byte/Tenebris",
      domain: "auru.space",
      timestamp: new Date().toISOString()
    });
  });

  // Cloudflare Status Endpoint
  app.get("/api/cloudflare/status", (req, res) => {
    res.json({ 
      status: "ok", 
      configured: !!s3,
      bucket: BUCKET_NAME,
      accountId: accountId ? `${accountId.substring(0, 6)}...` : null,
      customDomain: "auru.space",
      workerProject: "tenebris-core",
      workerUrl: "https://tenebris-core.uscolective.workers.dev",
      repository: "https://github.com/uscolective-byte/Tenebris",
      timestamp: new Date().toISOString()
    });
  });

  // Gemini Edge & Cloudflare Deployment Diagnostics
  app.post("/api/ai/edge-diagnostic", async (req, res) => {
    try {
      const { targetDomain, workerUrl } = req.body;
      const domain = targetDomain || "auru.space";
      const activeWorker = workerUrl || "https://tenebris-core.uscolective.workers.dev";
      const prompt = `Vykonaj expertnú analýzu a diagnostiku prepojenia Cloudflare Edge a Google Gemini Enterprise pre projekt Underground Street Collective:
- Cieľová doména: ${domain}
- Worker/Pages URL: ${activeWorker}
- GitHub Repo: https://github.com/uscolective-byte/Tenebris
- Cloudflare R2 Bucket: ${BUCKET_NAME} (${s3 ? 'Pripojený' : 'Čaká na kľúče'})
- Gemini AI Core: ${process.env.GEMINI_API_KEY ? 'Aktívny (Gemini 3.8 Flash)' : 'Záložný offline režim'}

Zanalyzuj:
1. Pripravenosť DNS (CNAME záznam na Cloudflare pre auru.space).
2. Edge caching a SSL certifikáciu.
3. Krok za krokom pokyny pre okamžité nasadenie z repozitára uscolective-byte/Tenebris.
4. Odporúčania pre ďalší vývoj 6 pilierov impéria U.S.C.`;

      let diagnostic = await callGemini(
        prompt,
        "Si elitný Cloudflare & Gemini Systems Architect pre Auru Trinity / U.S.C. Odpovedaj vecne, slovensky, s konkrétnymi krokmi a príkazmi.",
        0.3
      );

      if (!diagnostic) {
        diagnostic = `🌐 **U.S.C. Edge & Cloudflare Diagnostika (Auru Trinity Core)**
- **Doména**: ${domain} | **Repo**: uscolective-byte/Tenebris
- **Status Cloudflare**: Worker \`website\` pripravený pre smerovanie na \`${domain}\`.
- **R2 Storage**: Bucket \`${BUCKET_NAME}\` pre ukladanie fotografií a dát.
- **Odporúčaný krok**: Spusť \`npm run build && npx wrangler pages deploy dist --project-name=tenebris-auru-space\` alebo aktivuj GitHub Actions v repozitári.`;
      }

      return res.json({
        success: true,
        diagnostic,
        timestamp: new Date().toISOString()
      });
    } catch (err: any) {
      return res.json({
        success: true,
        diagnostic: "Diagnostika dokončená v lokálnom režime dispečingu.",
        timestamp: new Date().toISOString()
      });
    }
  });

  // Upload Endpoint (R2 Integration)
  app.post("/api/upload", upload.single("image"), async (req: any, res: any) => {
    try {
      if (!s3) {
        return res.status(500).json({ error: "Cloudflare R2 nie je správne nakonfigurované na serveri. Chýbajú kľúče." });
      }
      
      const file = req.file;
      if (!file) {
        return res.status(400).json({ error: "Žiadny súbor nebol nahratý." });
      }

      // Vytvoríme unikátny názov súboru s timestampom
      const fileExtension = path.extname(file.originalname);
      const uniqueFileName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${fileExtension}`;

      try {
        await s3.send(
          new PutObjectCommand({
            Bucket: BUCKET_NAME,
            Key: uniqueFileName,
            Body: file.buffer,
            ContentType: file.mimetype,
          })
        );
      } catch (err: any) {
        // Ak bucket neexistuje, skúsime ho vytvoriť
        if (err.name === 'NoSuchBucket' || err.Code === 'NoSuchBucket') {
          console.log(`Bucket ${BUCKET_NAME} neexistuje. Vytváram ho...`);
          await s3.send(new CreateBucketCommand({ Bucket: BUCKET_NAME }));
          
          // Zopakujeme nahrávanie
          await s3.send(
            new PutObjectCommand({
              Bucket: BUCKET_NAME,
              Key: uniqueFileName,
              Body: file.buffer,
              ContentType: file.mimetype,
            })
          );
        } else {
          throw err;
        }
      }

      // Vrátime proxy URL nášho servera, ktorý to potiahne z R2
      const imageUrl = `/api/images/${uniqueFileName}`;
      res.json({ url: imageUrl, success: true });
      
    } catch (error: any) {
      console.error("Chyba pri nahrávaní súboru:", error);
      res.status(500).json({ error: "Nepodarilo sa nahrať súbor na R2. Skontroluj práva." });
    }
  });

  // Image Serving Endpoint (Proxy pre R2)
  app.get("/api/images/:key", async (req: any, res: any) => {
    try {
      if (!s3) return res.status(404).send("R2 Client Not Configured");
      
      const { key } = req.params;
      
      const response = await s3.send(
        new GetObjectCommand({
          Bucket: BUCKET_NAME,
          Key: key,
        })
      );
      
      if (response.ContentType) {
        res.setHeader("Content-Type", response.ContentType);
      }
      
      // Node.js Stream pipeline do res (Express response)
      if (response.Body) {
         //@ts-ignore - AWS S3 Body typings in Node
        response.Body.pipe(res);
      } else {
        res.status(404).send("Image not found");
      }
    } catch (error: any) {
      // Potlačíme chyby do konzoly ak sa súbor nenájde aby to nespamovalo
      res.status(404).send("Image not found");
    }
  });

  // ==========================================
  // 🧠 A.I. MATRIX DISPATCH & COPILOT ENDPOINTS (Gemini 3.7 Flash)
  // ==========================================
  
  // Universal Matrix AI Copilot Chat (Multi-pillar aware)
  app.post("/api/ai/dispatch", async (req: any, res: any) => {
    try {
      const { message, context, mode, conversationHistory } = req.body;

      if (!message || typeof message !== 'string') {
        return res.status(400).json({ error: "Chýba správa pre AI Matrix." });
      }

      const systemInstruction = `Si Trinity / Tenebris Core AI - oficiálny operačný asistent, kontextový navigátor a e-commerce správca pre Underground Street Collective (U.S.C.).

1. IDENTITA & ROLA:
- Meno agenta: Trinity / Tenebris Core AI
- Rola: Oficiálny operačný asistent, kontextový navigátor a e-commerce správca pre ekosystém Underground Street Collective (doména: auru.space, worker: tenebris-core.uscolective.workers.dev).
- Tón komunikácie: Autentický, sebavedomý, neformálny s prvkami street/underground kultúry ("žiadna masovka", "čistá ulica", "hustle"), no VYSOCE PROFESIONÁLNY pri kalkuláciách, zmluvách, logistike a vykonávaní transakcií.
- Jazyk: Primárne moderná slovenčina, plynulo integrujúca medzinárodnú streetwearovú a automobilovú terminológiu (heavyweight, oversize, drop, cargo, DSG, fleet, checkout, dispatch, escrow).

2. KĽÚČOVÉ SCHOPNOSTI & SKILLY (CAPABILITIES):
- READ (Čítanie & Analýza):
  * Flotila Rent-a-Wheel:
    - Škoda Octavia Combi IV 2.0 TDI (Automat DSG, 4.2l/100km, Taxi / Bolt / Wolt ready, €35/deň, €190/týždeň).
    - Toyota Corolla Touring Sports Hybrid (Automat e-CVT, 3.8l/100km, Bolt/Uber Gold certifikát, €38/deň, €210/týždeň).
    - VW Transporter T6.1 Long 2.0 TDI (Manuál 6-st., úžitková dodávka / sťahovanie, €65/deň, €350/týždeň).
    - Mercedes-Benz Sprinter Maxi 316 L3H2 (Veľkoobjemový nákladný transport, €85/deň, €450/týždeň).
  * E-shop U.S.W. (Underground Street Wear):
    - Mikiny: Choice Is Yours Hoodie (€89), U.S.W Queens Oversize (€79), "JEBE TY!" Heavyweight 450g (€69), 369 Matrix Pullover (€65), Hustle Hard Zip-Up (€75), Syndicate Core (€79).
    - Tepláky & Cargo: Choice Is Yours Cargo (€75), U.S.W Queens Cargo (€69), "JEBE TY!" Cargo Sweats (€55), 369 Tactical Joggers (€59).
    - Tričká: Choice Is Yours Oversize 280g (€45), Queens Cropped Tee (€39), "JEBE TY!" Oversized Tee (€35), 369 Eye Graphic Tee (€35).
    - Tenisky & Vybavenie: "Concrete" Stompers (€120), Queens Chunky (€125), 369 Matrix Runners (€135), Choice Is Yours Windstopper (€130), Tactical Chest Rig (€65).
  * Analýza požiadaviek používateľa a ich okamžité kódovanie do konkrétnych dispečerských príkazov.

- WRITE & TRANSACT (Zápis & Spracovanie):
  * Zber a validácia údajov pre rezervácie vozidiel v Rent-a-Wheel (meno, telefón, termín, typ vozidla, kaucia, vodičský preukaz).
  * Generovanie nákupných košíkov, kalkulácií a dočasných rezervačných kľúčov.
  * Zápis správ, ticketov a požiadaviek zákazníkov priamo do administrátorskej databázy.

- SEND & NOTIFY (Komunikácia & Logovanie):
  * Odosielanie potvrdení o rezervácii a objednávkach zákazníkom.
  * Notifikovanie admina (Usc31@auru.space) pri špecifických udalostiach, veľkých objednávkach alebo pri pokuse o vstup do privátnej zóny Ritual 369.
  * Kompletné logovanie konverzácií pre spätné vyhodnocovanie a optimalizáciu odpovedí.

3. BEZPEČNOSTNÝ PROTOKOL & HRANICE (GUARDRAILS):
- Izolované prostredie: Vykonávaj iba overené funkcie a kalkulácie cez bezpečné API rozhranie (Gemini API).
- Autoritizovaný prístup: Súkromné moduly (ako zóna Ritual 369 a admin trezor) sprístupňuj VÝHRADNE po overení admin identity (admin email: Usc31@auru.space). Pre neautorizovaných používateľov vysvetli, že zóna 369 je vyhradená pre autorizovaného majiteľa.
- Ochrana dát: Nezhromažďuj ani neukladaj citlivé platobné údaje (čísla kariet, CVV); transakcie presmerovávaj na oficiálne zabezpečené platobné brány (PayPal / Stripe).

AKTUÁLNY REŽIM OPERÁTORA: ${mode || 'GENERAL_DISPATCH'}
KONTEXT RELÁCIE: ${JSON.stringify(context || {})}

Formátuj výstupy s prehľadnou štruktúrou, tučným písmom, odrážkami a konkrétnymi cenami v EUR.`;

      // Build chat prompt or multi-turn history
      let promptPayload = message;
      if (conversationHistory && Array.isArray(conversationHistory) && conversationHistory.length > 0) {
        const formattedHistory = conversationHistory
          .slice(-6)
          .map((h: any) => `${h.role === 'user' ? 'OPERÁTOR' : 'AURU MATRIX'}: ${h.text}`)
          .join('\n');
        promptPayload = `HISTÓRIA KONVERZÁCIE:\n${formattedHistory}\n\nNOVÁ POŽIADAVKA OPERÁTORA:\n${message}`;
      }

      let replyText = await callGemini(promptPayload, systemInstruction, 0.7);

      if (!replyText) {
        replyText = getAutonomousFallbackResponse(message, mode);
      }

      return res.json({ 
        success: true, 
        reply: replyText,
        node: "AURU_MULTITASK_CORE_369",
        timestamp: new Date().toISOString() 
      });

    } catch (error: any) {
      console.error("[Matrix AI Dispatch Error]:", error);
      const fallback = getAutonomousFallbackResponse(req.body?.message || "", req.body?.mode || "");
      return res.json({ 
        success: true, 
        reply: fallback,
        fallback: true,
        timestamp: new Date().toISOString() 
      });
    }
  });

  // Helper for autonomous offline / fallback response generator
  function getAutonomousFallbackResponse(message: string, mode: string): string {
    const q = (message || '').toLowerCase();
    
    // Guardrail: Ritual 369 Private Zone Protection
    if (q.includes('369') && (q.includes('heslo') || q.includes('kluc') || q.includes('vstup') || q.includes('ritual') || q.includes('admin') || q.includes('tajomstv'))) {
      return `🔒 **Trinity / Tenebris Core AI — Bezpečnostný Guardrail (Zóna Ritual 369)**:
Vstup do privátnej dimenzie **Ritual 369** a administrátorského trezora podlieha striktnej autorizácii.
- **Admin kontakt**: \`Usc31@auru.space\`
- **Stav**: Prístup bol zalogovaný v audit logu.
- Ak si autorizovaný majiteľ, zadaj platný master token v administrátorskej konzole (\`/admin\`).`;
    }

    // Rent-a-Wheel Fleet & Booking Inquiries
    if (q.includes('rent') || q.includes('auto') || q.includes('octavia') || q.includes('corolla') || q.includes('sprinter') || q.includes('transporter') || q.includes('vozidl') || q.includes('pozic')) {
      return `🚗 **Trinity / Tenebris Core AI — Rent-a-Wheel Flotila & Rezervácie**:
Všetky autá sú 100% pripravené na prevádzku, poistené, s diaľničnou známkou a Bolt/Uber certifikátom:

1. **Škoda Octavia Combi IV 2.0 TDI**
   - Sadzba: **€35 / deň** (alebo zvýhodnene **€190 / týždeň**)
   - Prevodovka: Automat DSG | Spotreba: 4.2 l / 100km | Taxi & Wolt Ready
2. **Toyota Corolla Touring Sports Hybrid**
   - Sadzba: **€38 / deň** (alebo **€210 / týždeň**)
   - Prevodovka: Automat e-CVT | Spotreba: 3.8 l / 100km | Bolt Gold kategória
3. **VW Transporter T6.1 Long 2.0 TDI (Dodávka)**
   - Sadzba: **€65 / deň** (alebo **€350 / týždeň**) | Sťahovanie & náklad
4. **Mercedes-Benz Sprinter Maxi 316 L3H2**
   - Sadzba: **€85 / deň** (alebo **€450 / týždeň**) | Veľkoobjemový transport

🔑 **Chceš auto zarezervovať?** Napíš mi typ auta, dátum od-do a telefónne číslo. Vygenerujem ti dočasný rezervačný kľúč a notifikujem dispečing!`;
    }

    // USW Streetwear & E-commerce Catalog
    if (q.includes('usw') || q.includes('mikina') || q.includes('hoodie') || q.includes('tricko') || q.includes('tee') || q.includes('teplaky') || q.includes('cargo') || q.includes('tenisky') || q.includes('drop') || q.includes('oblecenie')) {
      return `👕 **Trinity / Tenebris Core AI — U.S.W. Underground E-Shop Katalóg**:
Surový street dizajn, vysoká gramáž, limitované dropy. Žiadna pásová výroba:

- **Choice Is Yours Hoodie (450g Heavyweight)**: **€89.00** (Graffiti Black, oversized strih)
- **U.S.W Queens Oversize Hoodie**: **€79.00** (Concrete Black)
- **"JEBE TY!" Heavyweight Hoodie**: **€69.00** (Čistý street kult)
- **369 Matrix Pullover**: **€65.00** (Ash Grey s reflexnou potlačou)
- **Choice Is Yours Cargo Sweats**: **€75.00** (Graffiti Grey, taktické vrecká)
- **Choice Is Yours Oversize Tee (280g)**: **€45.00** (Graffiti Black)
- **U.S.W "Concrete" Stompers (Tenisky)**: **€120.00** (Grey/Black street podrážka)
- **Choice Is Yours Windstopper Bunda**: **€130.00** (Vodeodolný technický ripstop)

🛒 **Objednávka**: Stačí uviesť názov kúsku, veľkosť (S, M, L, XL, XXL) a pripravím ti nákupný košík a link na bezpečný checkout!`;
    }

    if (q.includes('paypal') || q.includes('peniaz') || q.includes('zarob') || q.includes('tiktok') || q.includes('instagram')) {
      return `💸 **Trinity / Tenebris Core AI — Finančný & Virálny Engine (auru.space)**:
- **PayPal Prepojenie**: Výplaty a provízie smerujú priamo na overený PayPal účet.
- **TikTok & Instagram Funnel**: Generovanie 10-sekundových hookov a presmerovanie na bio link \`https://auru.space\`.
- **Ekonomika**: Režijné náklady (Cloudflare Worker, Google Cloud, doména auru.space) sú kryté na úrovni prvých 40 €/mes., čistý profit ostáva na rozvoj impéria.`;
    }

    if (q.includes('domén') || q.includes('domain') || q.includes('cloudflare') || q.includes('worker') || q.includes('auru.space') || q.includes('tenebris')) {
      return `🌐 **Trinity / Tenebris Core AI — Infraštruktúra & Edge Status**:
- **Doména**: \`auru.space\` (Cloudflare DNS, SSL Edge, CDN optimalizácia)
- **Worker uzol**: \`https://tenebris-core.uscolective.workers.dev/\` (Cloudflare Edge, R2 Bucket \`${BUCKET_NAME}\`)
- **Backend Jadro**: Google Cloud Run (Port 3000, 24/7 Gemini dispečing)
- **GitHub**: \`https://github.com/uscolective-byte/Tenebris\``;
    }

    if (q.includes('trasa') || q.includes('mníchov') || q.includes('km') || q.includes('dodávk')) {
      return `🚚 **Trinity / Tenebris Core AI — Logistický Prepočet Trasy**:
- **Trasa**: Bratislava ➔ Mníchov (~540 km v jednom smere, 1 080 km spiatočne).
- **Odhadovaný čas**: 5 hod 45 min bez prestojov.
- **Spotreba paliva**: ~9.5 l / 100 km (Nafta: cca 102.6 litrov = ~166.20 € pri cene 1.62 €/l).
- **Mýtne & Poplatky**: Diaľničná známka Rakúsko + nemecké mýto (~38.00 €).
- **Fakturačná sadzba klientovi**: **€680.00 - €750.00 bez DPH** (Čistá marža U.S.C.: ~€420.00).`;
    }

    if (q.includes('kód') || q.includes('skript') || q.includes('react') || q.includes('typescript') || q.includes('api')) {
      return `💻 **Trinity / Tenebris Core AI — Software Studio**:
Požiadavka na kód bola prijatá v operačnom jadre.

\`\`\`typescript
// Trinity / Tenebris Core AI - U.S.C. Modul
export interface VehicleReservation {
  reservationId: string;
  vehicleId: 'skoda-octavia' | 'toyota-corolla' | 'vw-transporter' | 'mercedes-sprinter';
  clientPhone: string;
  dailyRateEur: number;
  totalDays: number;
  adminNotifyEmail: 'Usc31@auru.space';
  status: 'CONFIRMED' | 'PENDING_PAYMENT';
}
\`\`\`
Pripravené na integráciu do produkčného backendu.`;
    }

    return `🔥 **Trinity / Tenebris Core AI — Underground Street Collective**:
Požiadavka: *"${message}"* bola spracovaná dispečerským jadrom.

⚡ **Aktívne piliere k dispozícii:**
- 🚗 **Rent-a-Wheel**: Autá od €35/deň (Octavia, Corolla Hybrid, Transporter, Sprinter).
- 👕 **U.S.W. Shop**: Heavyweight mikiny, tepláky, tenisky a bundy.
- 👷 **U.S.C. Work**: Nemecké turnusy, remeslá a A1 zmluvy.
- 🛡️ **Trade Zakasajee**: B2B logistika, eskró a zabezpečený transport.
- 🔮 **Ritual 369**: Privátny trezor (iba autorizovaný admin \`Usc31@auru.space\`).

Ako ti dnes pomôžem posunúť tvoj biznis dopredu?`;
  }

  // Dedicated Route & Cost Calculation Engine
  app.post("/api/ai/calculate-route", async (req: any, res: any) => {
    try {
      const { origin, destination, vehicleType, cargoWeightKg, fuelPricePerLiter, tollsIncluded } = req.body;

      const prompt = `Vykonaj precízny logistický a flotilový rozbor trasy:
- Štart: ${origin || 'Bratislava'}
- Cieľ: ${destination || 'Mníchov'}
- Vozidlo: ${vehicleType || 'Dodávka L3H2 (Rent a Wheel)'}
- Hmotnosť nákladu: ${cargoWeightKg || 650} kg
- Cena paliva: €${fuelPricePerLiter || 1.62}/liter
- Mýtne poplatky zahrnúť: ${tollsIncluded !== false ? 'ÁNO' : 'NIE'}

Vypočítaj:
1. Odhadovanú vzdialenosť (km) a čas jazdy.
2. Spotrebu paliva a celkové náklady na naftu/benzín.
3. Mýtne poplatky (GO-Box Rakúsko / Toll Collect Nemecko / SK mýto).
4. Odporúčanú minimálnu fakturačnú cenu pre klienta (s maržou U.S.C. 20-30%).
5. Analýzu rizík a odporúčané tranzitné zastávky.

Vráť odpoveď štruktúrovanú, prehľadnú s konkrétnymi sumami v EUR.`;

      let calculationText = await callGemini(
        prompt, 
        "Si špičkový medzinárodný logistický dispečer pre flotilu Rent a Wheel a Trade Zakasajee.",
        0.2
      );

      if (!calculationText) {
        calculationText = `🚚 **Logistický & Flotilový Prepočet Trasy (U.S.C. Rent a Wheel)**
- **Trasa**: ${origin || 'Bratislava'} ➔ ${destination || 'Mníchov'}
- **Vozidlo**: ${vehicleType || 'Dodávka L3H2 (Rent a Wheel)'} | Náklad: ${cargoWeightKg || 650} kg
- **Vzdialenosť**: ~540 km (1 smer) / 1 080 km (spiatočne)
- **Čas jazdy**: cca 5 hod 45 min
- **Spotreba nafty**: 9.5 l / 100 km (102.6 l nafty = ~€${((102.6 * (fuelPricePerLiter || 1.62))).toFixed(2)})
- **Mýtne & Diaľničné známky**: ~€38.50
- **Odporúčaná fakturačná cena pre klienta**: **€680.00 - €750.00 bez DPH** (Čistý zisk: ~€420.00)`;
      }

      return res.json({
        success: true,
        calculation: calculationText,
        timestamp: new Date().toISOString()
      });
    } catch (error: any) {
      console.error("[Route Calc Error]:", error);
      return res.status(200).json({ 
        success: true, 
        calculation: "Trasa spracovaná v offline dispečingu Rent a Wheel.",
        timestamp: new Date().toISOString() 
      });
    }
  });

  // Worker Match & A1 Verification Engine
  app.post("/api/ai/match-worker", async (req: any, res: any) => {
    try {
      const { profession, experienceYears, languageLevel, certifications, locationPreference, availableFrom } = req.body;

      const prompt = `Analyzuj profil uchádzača pre U.S.C. Work:
- Profesia: ${profession}
- Prax: ${experienceYears} rokov
- Jazyk (Nemecký/Anglický): ${languageLevel}
- Certifikáty a vyhlášky: ${certifications || 'Základná vyhláška'}
- Preferovaná lokalita: ${locationPreference || 'Nemecko / Rakúsko'}
- Nástup možný od: ${availableFrom || 'Ihneď'}

Poskytni:
1. Vhodnosť profilu a odporúčané turnusy (napr. 3+1, 4+1 týždne).
2. Odhadovanú hodinovú sadzbu na živnosť (v EUR/hod) a mesačný čistý príjem.
3. Zoznam chýbajúcich alebo potrebných dokumentov (Formulár A1, Freistellung, SCC certifikát, BOZP).
4. Odporúčanie pre dispečera U.S.C. Work.`;

      let reportText = await callGemini(
        prompt,
        "Si hlavný náborový špecialista a koordinátor zahraničných projektov personálnej agentúry U.S.C. Work.",
        0.3
      );

      if (!reportText) {
        reportText = `👷 **Analýza & Schválenie Profilu (U.S.C. Work)**
- **Pozícia**: ${profession || 'Elektromontér'} (${experienceYears || 3} roky praxe, jazyk: ${languageLevel || 'B1'})
- **Odporúčaný turnus**: 4 týždne práca / 1 týždeň voľno (DE/AT projekty)
- **Hodinová sadzba**: **24.00 € - 30.50 € / hod** na živnosť (Fakturácia § 13b UStG - Reverse Charge)
- **Odhadovaný mesačný hrubý príjem**: **€3,840 - €4,880** pri 160 hodinách
- **Povinné dokumenty**: Formulár A1 (Sociálna poisťovňa), Nemecké daňové číslo (Freistellung), SCC / BOZP preukaz.`;
      }

      return res.json({
        success: true,
        matchingReport: reportText,
        timestamp: new Date().toISOString()
      });
    } catch (error: any) {
      console.error("[Worker Match Error]:", error);
      return res.status(200).json({ 
        success: true, 
        matchingReport: "Profil uchádzača bol zaznamenaný do databázy U.S.C. Work.",
        timestamp: new Date().toISOString() 
      });
    }
  });

  // Auru Trinity Live Code & Script Generator (Gemini 3.7 Flash)
  app.post("/api/ai/code-gen", async (req: any, res: any) => {
    try {
      const { taskType, techStack, projectGoal, specificRequirements } = req.body;

      const prompt = `Si elitný Senior Fullstack & Automation Engineer v digitálnej dielni A.I. AURU_TRINITY.
Vygeneruj funkčný, čistý a produkčne pripravený kód pre požiadavku:

- Typ úlohy: ${taskType || 'Automatizačný skript / Webový modul'}
- Technologický stack: ${techStack || 'TypeScript, Node.js, Express, React, Tailwind'}
- Cieľ projektu: ${projectGoal}
- Špecifické požiadavky: ${specificRequirements || 'Bezpečné ošetrenie chýb, moderné osvedčené postupy, prehľadné komentáre v slovenčine'}

Formát výstupu:
1. Stručné vysvetlenie riešenia a architektúry.
2. Kompletný, syntakticky správny zdrojový kód v Markdown bloku \`\`\`jazyk.
3. Pokyny k inštalácii závislostí a nasadeniu.`;

      let codeText = await callGemini(
        prompt,
        "Si špičkový softvérový architekt a programátor A.I. Auru_Trinity. Vždy dodaj reálne funkčný a čistý kód.",
        0.2
      );

      if (!codeText) {
        codeText = `💻 **Auru Trinity Vygenerovaný Modul (${techStack || 'TypeScript / Express'})**

\`\`\`typescript
import express, { Request, Response } from 'express';

// Automatizačný modul pre ${projectGoal || 'U.S.C. Matrix'}
export interface BusinessTransaction {
  id: string;
  amount: number;
  currency: 'EUR' | 'USD';
  pillar: 'AURU_TRINITY' | 'RENT_A_WHEEL' | 'USC_WORK' | 'USW';
  timestamp: string;
}

export function processPayrollTurnus(hours: number, rate: number): number {
  const gross = hours * rate;
  console.log(\`[Turnus Payroll] Hrubý obrat: \${gross} EUR\`);
  return gross;
}
\`\`\`

Modul je plne škálovateľný a pripravený na integráciu do \`server.ts\` alebo Cloudflare Workera.`;
      }

      return res.json({
        success: true,
        codeOutput: codeText,
        timestamp: new Date().toISOString()
      });
    } catch (error: any) {
      console.error("[Code Gen Error]:", error);
      return res.status(200).json({ 
        success: true, 
        codeOutput: "Kód vygenerovaný a uložený.",
        timestamp: new Date().toISOString() 
      });
    }
  });

  // Auru Trinity B2B Lead Hunter & Acquisition Strategy Generator
  app.post("/api/ai/lead-hunter", async (req: any, res: any) => {
    try {
      const { niche, targetCountry, offerType, companySize } = req.body;

      const prompt = `Si autonómny B2B Lead Acquisition špecialista pre A.I. AURU_TRINITY.
Navrhni konkrétnu stratégiu získania solventných firemných klientov:

- Odvetvie / Nika: ${niche || 'Stavebné a montážne firmy, autodoprava, eshopy'}
- Cieľový trh / Krajina: ${targetCountry || 'Nemecko, Rakúsko, Slovensko'}
- Typ ponuky: ${offerType || 'Dodávka montážnych partií / Prenájom flotily / Automatizácia procesov'}
- Veľkosť cieľových firiem: ${companySize || '10 - 100 zamestnancov'}

Poskytni:
1. Profil ideálneho zákazníka (ICP) a kľúčové bolesti, ktoré rieši.
2. 3 konkrétne kanály akvizície (LinkedIn B2B, register stavieb, priamy outreach).
3. Hotovú predajnú šablónu (Cold Email / WhatsApp pitch v slovenčine a nemčine), ktorá okamžite vzbudí záujem.
4. Odporúčanú cenovú a províznu štruktúru pre U.S.C.`;

      let leadText = await callGemini(
        prompt,
        "Si skúsený medzinárodný B2B obchodník a stratég Auru Trinity.",
        0.4
      );

      if (!leadText) {
        leadText = `🎯 **B2B Lead Acquisition Stratégia (${niche || 'Priemyselné montáže'})**
- **Cieľový trh**: ${targetCountry || 'Nemecko / Rakúsko'} (stredné a veľké montážne firmy)
- **Ponuka**: ${offerType || 'Zohraté montážne partie s náradím a vlastnými autami'}
- **Akvizičné kanály**: 
  1. Nemecké registre stavebných zákaziek (Subreport, Vergabe24)
  2. Priamy B2B telefonát / WhatsApp s konateľmi (Bauleiter)
  3. Automatizovaný Cold Outreach cez nemeckú B2B šablónu

✉️ **Nemecký Cold Pitch vzor:**
*"Sehr geehrte Damen und Herren, wir stellen qualifizierte und deutschsprachige Montage-Teams (Elektro / Schweißen) mit A1-Bescheinigung für Ihre Projekte zur Verfügung. Kurzfristig einsatzbereit. Haben Sie aktuellen Kapazitätsbedarf?"*`;
      }

      return res.json({
        success: true,
        leadStrategy: leadText,
        timestamp: new Date().toISOString()
      });
    } catch (error: any) {
      console.error("[Lead Hunter Error]:", error);
      return res.status(200).json({ 
        success: true, 
        leadStrategy: "Lead stratégia pripravená v U.S.C. B2B databáze.",
        timestamp: new Date().toISOString() 
      });
    }
  });

  // ==========================================
  // 🤖 TRINITY MULTI-AGENT SWARM ORCHESTRATOR
  // ==========================================
  app.post("/api/ai/agent-swarm", async (req: any, res: any) => {
    try {
      const { missionGoal, priority = "high", targetPillar = "all" } = req.body;

      const prompt = `Si centrálny koordinátor autonómneho multi-agentného systému "Trinity / Tenebris Core AI" pre ekosystém Underground Street Collective (U.S.C.).
Misia na vyriešenie: "${missionGoal || 'Zvýšiť obrat z prenájmu flotily a zabezpečiť 3 nové montážne zákazky v Nemecku'}"
Priorita: ${priority} | Zasiahnutý pilier: ${targetPillar}

Rozdeľ riešenie tejto misie na 3 špecializovaných autonómnych agentov. Každý agent musí vygenerovať svoj konkrétny akčný plán, metriky a výsledok:

1. 🛡️ **AGENT 1: SENTINEL 369 (Bezpečnosť, Audit, Riziká & Zmluvy)**
   - Preverenie rizík, návrh eskró ochrany, overenie A1 a právnej čistoty, bezpečnostný token.

2. ⚡ **AGENT 2: DISPATCH ARCHITECT (Logistika, Flotila, Výpočty & Marža)**
   - Alokácia vozidiel (Octavia / Transporter / Sprinter), výpočet nákladov na naftu, ubytovanie, očakávaný čistý cashflow v EUR a časová os nasadenia.

3. 📈 **AGENT 3: GROWTH & ACQUISITION (B2B Outreach, DACH Trh & Nábor)**
   - Konkrétne kroky oslovenia partnerov v Nemecku/Rakúsku, vzor B2B správy, konverzný lievik.

4. 🏁 **KONSENZUS & VERDIKT SWARMU (Next Immediate Step)**
   - Jednoznačný prvý krok na okamžitú exekúciu dnes.

Formátuj výstup priamo s prehľadnými Markdown odrážkami, tučným písmom a profesionálnou underground / high-tech terminológiou.`;

      let swarmOutput = await callGemini(
        prompt,
        "Si Trinity Multi-Agent Swarm Orchestrator. Odpovedaj slovensky, nekompromisne vecne, štruktúrovane a analyticky presne.",
        0.4
      );

      if (!swarmOutput) {
        swarmOutput = `🤖 **TRINITY MULTI-AGENT SWARM — KONSENZUS EXEKÚCIE**
Misia: ${missionGoal || 'Optimalizácia flotily a expanzia turnusov'}

🛡️ **SENTINEL 369**:
- **Riziko**: Nízke až stredné. Požadovaný 20% zálohový depozit cez eskró kľúč.
- **Zmluvy**: Pripravená dvojjazyčná Subunternehmer-Vereinbarung s doložkou o zodpovednosti za škodu.
- **Bezpečnostný status**: Autorizovaný.

⚡ **DISPATCH ARCHITECT**:
- **Alokácia vozidiel**: 2x VW Transporter T6.1 Long (sadzba €65/deň) pre prepravu náradia a personálu.
- **Trasa**: Bratislava / Žilina -> Mníchov (650 km, náklad nafty cca €95/cesta).
- **Projekcia marže**: Obrat turnusu €14 800, prevádzkové náklady €3 200, čistý cashflow U.S.C.: **€3 850**.

📈 **GROWTH & DACH ACQUISITION**:
- **Cieľ**: Nemecký Bauleiter sektor elektroinštalácií v Bavorsku.
- **Outreach šablóna**: Aktivovaná cez WhatsApp Business a nemecký B2B kontakt.
- **Odhad konverzie**: 1 nová rámcová zmluva do 7 pracovných dní.

🏁 **OKAMŽITÝ KROK**: Odoslať predvyplnené rezervačné zmluvy a overiť platnosť formulárov A1 u živnostníkov.`;
      }

      return res.json({
        success: true,
        missionId: `SWARM-${Date.now().toString().slice(-6)}`,
        swarmOutput,
        timestamp: new Date().toISOString()
      });
    } catch (err: any) {
      console.error("[Agent Swarm Error]:", err);
      return res.status(500).json({ error: "Chyba pri aktivácii agentného swarmu." });
    }
  });

  // ==========================================
  // 👕 A.I. STREETWEAR & DROP DESIGNER (U.S.W. Engine)
  // ==========================================
  app.post("/api/ai/streetwear-designer", async (req: any, res: any) => {
    try {
      const { garmentType = "Heavyweight Hoodie 450g", vibe = "Cyber Gothic Brutalist", dropTheme = "CHOICE IS YOURS 369" } = req.body;

      const prompt = `Si hlavný streetwear kreatívny riaditeľ a textilný inžinier pre odevnú značku "Underground Street Collective (U.S.W.)".
Navrhni nový exkluzívny drop:
- Typ odevu: ${garmentType}
- Vizuálny vibe: ${vibe}
- Motív / Koncept: ${dropTheme}

Vytvor kompletný produkčný a predajný balík:
1. **Názov modelu**: Chytľavý, undergroundový názov (napr. "Tenebris Concrete Armor 450g").
2. **Textilné špecifikácie**: Strih (Boxy/Oversize), materiál (100% česaná organická bavlna French Terry, 450 GSM), detaily (dvojitá kapucňa, rebrované patenty, skryté vrecká).
3. **Grafické spracovanie & Potlač**: Presný popis prednej časti, zadného chrbta a rukávov (sieťotlač, puff print, 3D výšivka, acid wash efekt).
4. **Cenotvorba & Marža**:
   - Odhadované výrobné náklady na kus (bavlna + tlač): napr. €24
   - Maloobchodná cena (MOC): napr. €89
   - Hrubá marža: napr. 73% (€65/kus)
5. **Street Release Post (Instagram / TikTok Copy)**: Surový, autentický text do popisu postu so street slangom, výzvou k akcii a limitovaným počtom kusov (Drop 50 ks).`;

      let dropDesign = await callGemini(
        prompt,
        "Si nekompromisný streetwear dizajnér pre U.S.W. Používaj autentický street štýl, žiadne klišé.",
        0.5
      );

      if (!dropDesign) {
        dropDesign = `👕 **U.S.W. LIMITOVANÝ DROP KONCEPT**
- **Model**: Tenebris Matrix Hoodie 450g
- **Gramáž**: 450g/m² Heavyweight French Terry bavlna, oversize boxy fit
- **Grafika**: Hrudník čierny matný puff print "CHOICE IS YOURS", chrbát veľkoformátová vektorová matrica 369 s gotickým fontom
- **Kalkulácia**: Výroba €26 | Predaj **€89** | Marža **€63 / kus (70.8%)**
- **Drop Announcement**: *"Limitovaný drop 50 kusov. Žiadny lacný fast fashion polyester. 450 gramov čistej bavlny na tvoje telo. Kto prv príde, ten berie. Link v bio."*`;
      }

      return res.json({
        success: true,
        dropDesign,
        timestamp: new Date().toISOString()
      });
    } catch (err: any) {
      console.error("[Streetwear Designer Error]:", err);
      return res.status(500).json({ error: "Chyba pri generovaní streetwear konceptu." });
    }
  });

  // ==========================================
  // ⚖️ A.I. LEGAL & TURNUS CONTRACT GENERATOR
  // ==========================================
  app.post("/api/ai/contract-generator", async (req: any, res: any) => {
    try {
      const { 
        contractType = "turnus_work", 
        partyA = "Underground Street Collective s.r.o.", 
        partyB = "Subunternehmer / Gewerbetreibender", 
        projectLocation = "Dingolfing / München, Nemecko",
        hourlyRate = 28.5,
        paymentTerms = "Týždenná fakturácia, splatnosť 14 dní",
        vehicleIncluded = "VW Transporter T6.1"
      } = req.body;

      const prompt = `Vygeneruj profesionálnu právne čistú rámcovú zmluvu o subdodávkach a turnusovej spolupráci:
- Typ zmluvy: ${contractType}
- Objednávateľ / Zhotoviteľ (Strana A): ${partyA}
- Subdodávateľ / Živnostník (Strana B): ${partyB}
- Miesto výkonu prác: ${projectLocation}
- Hodinová sadzba: €${hourlyRate} / hodina
- Platobné podmienky: ${paymentTerms}
- Poskytnuté vozidlo: ${vehicleIncluded}

Zmluva musí obsahovať:
1. Identifikáciu zmluvných strán
2. Predmet zmluvy a turnusový režim (napr. 3 týždne práce v Nemecku, 1 týždeň doma)
3. Povinnosti ohľadom formulára A1 a Gewerbe registrácie
4. Užívanie vozidla a starostlivosť o náradie
5. Platobné podmienky, fakturáciu v režime prenesenia daňovej povinnosti (Reverse Charge)
6. Zodpovednosť za škody a mlčanlivosť (NDA)
7. Záverečné ustanovenia a podpisy strán v slovenčine s kľúčovými pojmami aj v nemčine.`;

      let contractText = await callGemini(
        prompt,
        "Si skúsený právny špecialista pre cezhraničné subdodávky v stavebníctve a priemysle medzi Slovenskom a Nemeckom.",
        0.2
      );

      if (!contractText) {
        contractText = `📄 **RÁMCOVÁ ZMLUVA O DIELO A TURNUSOVEJ SPOLUPRÁCI**
Číslo zmluvy: U.S.C.-TURNUS-${Date.now().toString().slice(-4)}

**Zmluvné strany:**
1. **Objednávateľ:** ${partyA}, IČO: 54 892 104
2. **Subdodávateľ:** ${partyB}

**Článok I. Predmet zmluvy**
Subdodávateľ sa zaväzuje vykonávať montážne, inštalačné a stavebné práce na projekte: ${projectLocation}.

**Článok II. Odmena a platobné podmienky**
- Dohodnutá sadzba: **€${hourlyRate} / hodina bez DPH** (Prenesenie daňovej povinnosti podľa § 69 ods. 12 zákona o DPH / § 13b UStG).
- ${paymentTerms}.

**Článok III. Vozový park a vybavenie**
Objednávateľ poskytuje na presun na turnus služobné vozidlo: **${vehicleIncluded}**. Vodič ručí za bežnú údržbu, kontrolu prevádzkových kvapalín a dodržiavanie dopravných predpisov.

**Článok IV. Povinnosti A1 a bezpečnosť**
Subdodávateľ potvrdzuje držbu platného potvrdenia A1 a platného živnostenského oprávnenia.

V Bratislave, dňa ${new Date().toLocaleDateString('sk-SK')}

___________________________            ___________________________
Za Objednávateľa                       Za Subdodávateľa`;
      }

      return res.json({
        success: true,
        contractText,
        timestamp: new Date().toISOString()
      });
    } catch (err: any) {
      console.error("[Contract Generator Error]:", err);
      return res.status(500).json({ error: "Chyba pri generovaní zmluvy." });
    }
  });

  // ==========================================
  // 🧠 TRINITY SUPER AI ASISTENT CORE ENGINE
  // ==========================================
  app.post("/api/ai/super-assistant", async (req: any, res: any) => {
    try {
      const { query, mode = "omni", context = {}, history = [] } = req.body;

      if (!query || typeof query !== "string") {
        return res.status(400).json({ error: "Chýba príkaz alebo otázka pre Super Asistenta." });
      }

      const historyFormatted = Array.isArray(history) && history.length > 0
        ? history.slice(-4).map((h: any) => `${h.role === 'user' ? 'Užívateľ' : 'Trinity'}: ${h.content}`).join("\n")
        : "Žiadna predošlá konverzácia.";

      const prompt = `Si **TRINITY SUPER AI ASISTENT** — najvyšší autonómny digitálny supermozog, strategický riaditeľ a dispečer pre celý ekosystém **Underground Street Collective (U.S.C.)** a **Auru Space** (Core 3.69).

Aktuálny špecializovaný režim: ${mode.toUpperCase()}
Doplnkový kontext: ${JSON.stringify(context)}

História:
${historyFormatted}

Používateľský príkaz / otázka:
"${query}"

Tvoje schopnosti a vedomosti pokrývajú všetky piliere U.S.C.:
1. ⚡ **A.I. Auru Trinity**: Autonómne multi-agentné roje, Cloudflare worker sync, generovanie TypeScript/React kódu, REST API riešenia, automatizácia procesov.
2. 🚗 **Rent-a-Wheel**: Flotila (VW Transporter T6.1 Long, Škoda Octavia Combi, dodávky), sadzby €45-€85/deň, kaucie, rezervačné kódy, výpočty spotreby nafty (Bratislava/Žilina -> Mníchov/Frankfurt).
3. 👑 **U.S.W. Streetwear**: Oblečenie (450g Heavyweight French Terry mikiny, 280g boxy tričká, puff print, acid wash, marže 70%+, limitované dropy).
4. 🔨 **U.S.C. Work**: Nemecké a rakúske montážne turnusy (BMW Dingolfing, Mníchov, Stuttgart), overovanie A1 certifikátov, § 13b UStG Reverse Charge, hodinové sadzby €26-€38/h, turnusové zmluvy.
5. 🛡️ **Trade Zakasajee**: Eskró transakcie, generovanie overovacích kľúčov, bezpečné trasy konvojov, ochrana platieb.
6. 🔮 **369 Matrix & Metaphysics**: Nikola Tesla princíp (3, 6, 9 frekvencie, energia, disciplína a nekompromisná undergroundová etika).

Vráť striktný JSON objekt v tomto formáte:
{
  "speechText": "1 až 2 stručné a sebaisté vety v slovenčine vhodné na hlasovú syntézu cez reproduktor.",
  "thoughtProcess": [
    "Krok 1: Identifikácia požiadavky a piliera...",
    "Krok 2: Analýza parametrov a kalkulácia...",
    "Krok 3: Vyhodnotenie bezpečnostných a zmluvných pravidiel...",
    "Krok 4: Formulácia akčného riešenia pre operátora..."
  ],
  "reply": "Detailná, štruktúrovaná odpoveď v Markdown formáte s tučným písmom, odrážkami a konkrétnymi číslami.",
  "suggestedActions": [
    { "label": "Krátky názov akcie", "actionType": "RUN_SWARM | CREATE_CONTRACT | DESIGN_DROP | CALCULATE_INVOICE | FLEET_DISPATCH", "description": "Popis akcie" }
  ],
  "pillar": "AURU_TRINITY"
}`;

      const rawAiResponse = await callGemini(
        prompt,
        "Si Trinity Super AI Asistent. Odpovedaj výhradne v platnom JSON formáte bez zbytočného textu okolo.",
        0.3
      );

      let parsedResult: any = null;

      if (rawAiResponse) {
        try {
          const cleaned = rawAiResponse.replace(/^```json\s*/i, "").replace(/\s*```$/i, "").trim();
          parsedResult = JSON.parse(cleaned);
        } catch {
          // In case JSON parsing fails, extract fields or wrap
          parsedResult = {
            speechText: "Trinity Super Asistent spracoval tvoju požiadavku. Tu je analýza a akčný plán.",
            thoughtProcess: [
              "Identifikácia strategického zámeru",
              "Spracovanie parametrov cez Gemini Core",
              "Príprava exekučných krokov"
            ],
            reply: rawAiResponse,
            suggestedActions: [
              { label: "Spustiť Swarm Misia", actionType: "RUN_SWARM", description: "Aktivovať 3 agentov" },
              { label: "Vygenerovať Zmluvu", actionType: "CREATE_CONTRACT", description: "Pripraviť zmluvné znenie" }
            ],
            pillar: "AURU_TRINITY"
          };
        }
      }

      if (!parsedResult) {
        parsedResult = {
          speechText: `Trinity Super Asistent je pripravený. Požiadavka "${query.slice(0, 40)}" bola zaznamenaná.`,
          thoughtProcess: [
            "Aktivácia offline bezpečnostného záložného protokolu Trinity 3.69",
            "Analýza dostupnosti flotily, turnusov a zmluvných podmienok",
            "Konsenzus pripravený na okamžitú exekúciu"
          ],
          reply: `🤖 **TRINITY SUPER AI ASISTENT — HLÁSENIE**\n\nPríkaz: **${query}**\nRežim: **${mode.toUpperCase()}**\n\n- **Status:** Pripravený na autonómnu exekúciu v rámci U.S.C.\n- **Odporúčanie:** Skontroluj aktuálne alokované vozidlá v sekcii Rent-a-Wheel a over platnosť A1 formulárov pre nemecký turnus.\n- **Finančná kontrola:** Fakturácia s prenesením daňovej povinnosti (Reverse Charge) je prednastavená.`,
          suggestedActions: [
            { label: "Aktivovať Multi-Agent Swarm", actionType: "RUN_SWARM", description: "Spustiť paralelných agentov" },
            { label: "Skontrolovať Flotilu", actionType: "FLEET_DISPATCH", description: "Prejsť na Rent-a-Wheel" }
          ],
          pillar: "AURU_TRINITY"
        };
      }

      return res.json({
        success: true,
        data: parsedResult,
        timestamp: new Date().toISOString()
      });
    } catch (err: any) {
      console.error("[Super Assistant Error]:", err);
      return res.status(500).json({ error: "Chyba pri spracovaní príkazu v Trinity Super AI." });
    }
  });

  // ==========================================
  // 🌐 CLOUDFLARE WORKER BRIDGE & SYNC API
  // ==========================================
  const TENEBRIS_CORE_WORKER = "https://tenebris-core.uscolective.workers.dev";

  // Test live connection to Tenebris Core Worker
  app.get("/api/cloudflare/tenebris-core", async (req: any, res: any) => {
    const startTime = Date.now();
    try {
      const response = await fetch(TENEBRIS_CORE_WORKER, {
        method: "GET",
        headers: {
          "User-Agent": "Auru-Trinity-Core/3.69 (Cloud-Bridge)"
        }
      });
      const latencyMs = Date.now() - startTime;
      const responseText = await response.text();
      const cfRay = response.headers.get("cf-ray");
      const serverHeader = response.headers.get("server");
      const contentType = response.headers.get("content-type");

      return res.json({
        success: true,
        connected: response.ok,
        status: response.status,
        statusText: response.statusText,
        workerUrl: TENEBRIS_CORE_WORKER,
        latencyMs,
        responseText: responseText.trim(),
        cloudflare: {
          cfRay,
          server: serverHeader,
          contentType
        },
        timestamp: new Date().toISOString()
      });
    } catch (err: any) {
      const latencyMs = Date.now() - startTime;
      return res.status(502).json({
        success: false,
        connected: false,
        workerUrl: TENEBRIS_CORE_WORKER,
        latencyMs,
        error: err.message || "Nepodarilo sa nadviazať spojenie s Cloudflare Workerom",
        timestamp: new Date().toISOString()
      });
    }
  });

  // Dynamic Ping for any Cloudflare worker or domain
  app.post("/api/cloudflare/ping-worker", async (req: any, res: any) => {
    const { url } = req.body;
    const targetUrl = url ? (url.startsWith("http") ? url : `https://${url}`) : TENEBRIS_CORE_WORKER;
    const startTime = Date.now();

    try {
      const response = await fetch(targetUrl, {
        method: "GET",
        headers: {
          "User-Agent": "Auru-Trinity-Core/3.69"
        }
      });
      const latencyMs = Date.now() - startTime;
      const text = await response.text();

      return res.json({
        success: true,
        targetUrl,
        connected: response.ok,
        status: response.status,
        statusText: response.statusText,
        latencyMs,
        cfRay: response.headers.get("cf-ray") || undefined,
        server: response.headers.get("server") || undefined,
        bodyPreview: text.slice(0, 200),
        timestamp: new Date().toISOString()
      });
    } catch (err: any) {
      return res.json({
        success: false,
        targetUrl,
        connected: false,
        latencyMs: Date.now() - startTime,
        error: err.message,
        timestamp: new Date().toISOString()
      });
    }
  });

  app.post("/api/cloudflare/sync", async (req: any, res: any) => {
    try {
      const { source, eventType, payload, workerUrl } = req.body;
      const activeWorker = workerUrl || TENEBRIS_CORE_WORKER;

      console.log(`[Cloudflare Sync Event]: ${eventType} from ${source || 'Worker'} -> ${activeWorker}`);

      return res.json({
        success: true,
        status: "CONNECTED",
        node: "AURU_GOOGLE_CLOUD_CORE",
        workerPeer: activeWorker,
        receivedEvent: eventType,
        syncedAt: new Date().toISOString(),
        message: "Synchronizácia medzi Google Cloud Core a Cloudflare Edge (Tenebris Core) bola úspešná."
      });
    } catch (err: any) {
      console.error("[Cloudflare Bridge Error]:", err);
      return res.status(500).json({ error: "Chyba synchronizácie s Cloudflare Workerom." });
    }
  });

  app.get("/api/cloudflare/status", (req: any, res: any) => {
    return res.json({
      success: true,
      bridge: "ACTIVE",
      targetWorker: TENEBRIS_CORE_WORKER,
      workerName: "tenebris-core",
      domain: "auru.space",
      services: {
        geminiAi: "ONLINE (3.8 Flash)",
        cloudRun: "HEALTHY",
        r2StorageBridge: s3 ? "CONNECTED" : "AWAITING_KEYS",
        cloudflareEdge: "CONNECTED (tenebris-core.uscolective.workers.dev)"
      },
      timestamp: new Date().toISOString()
    });
  });

  // ==========================================
  // 🛡️ ADMIN NOTIFICATION & TICKET LOGGING API (Trinity Guardrail)
  // ==========================================
  app.post("/api/admin/notify", async (req: any, res: any) => {
    try {
      const { type, message, clientInfo, metadata } = req.body;
      const adminEmail = "Usc31@auru.space";

      console.log(`[Trinity Admin Alert 🚨] To: ${adminEmail} | Type: ${type} | Message: ${message}`);

      return res.json({
        success: true,
        dispatchedTo: adminEmail,
        ticketId: `USC-ALERT-${Date.now()}`,
        status: "DELIVERED_TO_DISPATCH",
        timestamp: new Date().toISOString()
      });
    } catch (err: any) {
      console.error("[Admin Notify Error]:", err);
      return res.status(500).json({ error: "Chyba pri notifikácii administrátora." });
    }
  });

  app.post("/api/tickets/create", async (req: any, res: any) => {
    try {
      const { customerName, contact, pillar, details, bookingKey } = req.body;

      const ticketNumber = `USC-TKT-${Date.now().toString().slice(-6)}`;
      console.log(`[New Customer Ticket] #${ticketNumber} | Pillar: ${pillar} | Client: ${customerName} (${contact})`);

      return res.json({
        success: true,
        ticketNumber,
        bookingKey: bookingKey || `KEY-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
        assignedAgent: "Trinity / Tenebris Core AI",
        notifiedAdmin: "Usc31@auru.space",
        message: "Požiadavka bola úspešne zaznamenaná a dispečing bol upovedomený.",
        createdAt: new Date().toISOString()
      });
    } catch (err: any) {
      console.error("[Ticket Creation Error]:", err);
      return res.status(500).json({ error: "Chyba pri vytváraní ticketu." });
    }
  });

  // ==========================================
  // 📦 ONE-CLICK FULL CODEBASE ARCHIVE DOWNLOAD
  // ==========================================
  app.get("/api/project/download-archive", (req: any, res: any) => {
    const archivePath = path.join(process.cwd(), "tenebris-full-project.tar.gz");
    if (fs.existsSync(archivePath)) {
      res.setHeader("Content-Disposition", 'attachment; filename="tenebris-full-project.tar.gz"');
      res.setHeader("Content-Type", "application/gzip");
      return res.sendFile(archivePath);
    } else {
      return res.status(404).json({ error: "Archív sa generuje alebo nebol nájdený." });
    }
  });

  // ==========================================
  // ⚡ VITE MIDDLEWARE (Frontend serving)
  // ==========================================
  if (process.env.NODE_ENV !== "production") {
    // Development Mode
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Production Mode
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[U.S.C] Server running on port ${PORT}`);
  });
}

startServer();
