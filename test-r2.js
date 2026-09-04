import { S3Client, ListBucketsCommand } from "@aws-sdk/client-s3";

const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
const accessKeyId = process.env.AWS_ACCESS_KEY_ID || process.env.CLOUDFLARE_ACCESS_CLIENT_ID;
const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY || process.env.CLOUDFLARE_ACCESS_CLIENT_SECRET;

console.log("Kontrola premenných:");
console.log("- Account ID prítomné:", !!accountId);
console.log("- Access Key prítomný:", !!accessKeyId);
console.log("- Secret Key prítomný:", !!secretAccessKey);

if (!accountId || !accessKeyId || !secretAccessKey) {
  console.log("CHYBA: Chýbajú kľúče.");
  process.exit(1);
}

const s3 = new S3Client({
  region: "auto",
  endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId,
    secretAccessKey,
  }
});

async function testR2() {
  try {
    console.log("Skúšam sa pripojiť na Cloudflare R2...");
    const data = await s3.send(new ListBucketsCommand({}));
    console.log("✅ ÚSPECH! Kľúče fungujú.");
    console.log("📦 Nájdené buckety:");
    if (data.Buckets && data.Buckets.length > 0) {
      data.Buckets.forEach(b => console.log(`  - ${b.Name}`));
    } else {
      console.log("  (Zatiaľ žiadne buckety, ale pripojenie je OK)");
    }
  } catch (error) {
    console.log("❌ ZLYHANIE! Pripojenie bolo odmietnuté.");
    console.log("Dôvod:", error.message || error);
    console.log("Kód chyby:", error.name || error.Code);
  }
}

testR2();
