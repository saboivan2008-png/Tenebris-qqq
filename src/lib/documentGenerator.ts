import { jsPDF } from 'jspdf';

export interface ContractPdfParams {
  title: string;
  contractType: string;
  workerName: string;
  workerId: string;
  workerCity: string;
  hourlyRate?: string;
  destinationCountry?: string;
  content: string;
}

export interface OrderReceiptPdfParams {
  orderId: string;
  customerName: string;
  phone: string;
  email?: string;
  address: string;
  items: Array<{ name: string; size?: string; quantity: number; price: string }>;
  totalAmount: string;
  paymentStatus: string;
  dateStr?: string;
}

export interface CargoManifestPdfParams {
  manifestId: string;
  origin: string;
  destination: string;
  cargoDescription: string;
  cargoWeightKg: number;
  escrowAmountEur: number;
  escortRequired: boolean;
  clearanceLevel: string;
  epochHour: string;
  hashFingerprint: string;
  authorizedOperator: string;
}

/**
 * Generates an official U.S.C. formatted PDF Contract
 */
export function generateContractPdf(params: ContractPdfParams): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  // Header branding bar
  doc.setFillColor(15, 15, 15);
  doc.rect(0, 0, 210, 28, 'F');

  doc.setFillColor(245, 158, 11); // Amber
  doc.rect(0, 28, 210, 2, 'F');

  // Header Title
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('UNDERGROUND STREET COLLECTIVE // U.S.C. LEGAL MATRIX', 14, 13);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(200, 200, 200);
  doc.text('PLATFORMA PRE PRAVNE VZORY, ZMLUVY A SPROSTREDKOVANIE // AURU SPACE', 14, 21);

  // Document Title
  doc.setTextColor(20, 20, 20);
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.text(params.title.toUpperCase(), 14, 40);

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 100, 100);
  doc.text(`Identifikator zaznamu: USC-DOC-${Date.now().toString().slice(-6)}  |  Generovane: ${new Date().toLocaleDateString('sk-SK')}`, 14, 46);

  // Key Parties Box
  doc.setFillColor(245, 245, 245);
  doc.rect(14, 50, 182, 24, 'F');
  doc.setDrawColor(200, 200, 200);
  doc.rect(14, 50, 182, 24, 'S');

  doc.setFontSize(8);
  doc.setTextColor(50, 50, 50);
  doc.setFont('helvetica', 'bold');
  doc.text('ZMLUVNE STRANY / UCHADZAC:', 18, 56);

  doc.setFont('helvetica', 'normal');
  doc.text(`Meno a priezvisko: ${params.workerName || '-'}`, 18, 62);
  doc.text(`ICO / Identifikator: ${params.workerId || '-'}`, 18, 68);

  doc.text(`Mesto / Sidlo: ${params.workerCity || '-'}`, 110, 62);
  if (params.hourlyRate) {
    doc.text(`Dohodnuta sadzba: ${params.hourlyRate} EUR/h  |  Krajina: ${params.destinationCountry || 'EU'}`, 110, 68);
  }

  // Contract Content
  doc.setFontSize(8.5);
  doc.setTextColor(30, 30, 30);
  doc.setFont('helvetica', 'normal');

  // Split lines for clean rendering
  const splitText = doc.splitTextToSize(params.content, 182);
  let currentY = 82;

  for (let i = 0; i < splitText.length; i++) {
    if (currentY > 270) {
      doc.addPage();
      currentY = 20;
    }
    doc.text(splitText[i], 14, currentY);
    currentY += 4.5;
  }

  // Signatures Section
  if (currentY > 240) {
    doc.addPage();
    currentY = 25;
  } else {
    currentY += 10;
  }

  doc.setDrawColor(180, 180, 180);
  doc.line(14, currentY, 196, currentY);
  currentY += 10;

  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(80, 80, 80);
  doc.text('ZA U.S.C. CENTRALU & DISPECING:', 18, currentY);
  doc.text('DODAVATEL / KANDIDAT (SZCO):', 120, currentY);

  currentY += 16;
  doc.setFont('helvetica', 'normal');
  doc.text('......................................................', 18, currentY);
  doc.text('......................................................', 120, currentY);

  // Footer
  const pageCount = doc.getNumberOfPages();
  for (let p = 1; p <= pageCount; p++) {
    doc.setPage(p);
    doc.setFontSize(7);
    doc.setTextColor(140, 140, 140);
    doc.text(`U.S.C. Legal Matrix // Strana ${p} z ${pageCount} // https://auru.space`, 14, 290);
  }

  doc.save(`USC_Zmluva_${params.workerName.replace(/\s+/g, '_')}_${Date.now().toString().slice(-4)}.pdf`);
}

/**
 * Generates an official U.S.C. Order / Booking Confirmation Receipt
 */
export function generateOrderReceiptPdf(params: OrderReceiptPdfParams): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  // Header branding bar
  doc.setFillColor(15, 15, 15);
  doc.rect(0, 0, 210, 30, 'F');
  doc.setFillColor(220, 38, 38); // Red
  doc.rect(0, 30, 210, 2, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('UNDERGROUND STREET COLLECTIVE // DOKLAD O OBJEDNAVKE', 14, 14);

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(200, 200, 200);
  doc.text(`OBJEDNAVKA ID: #${params.orderId}  |  STATUS: ${params.paymentStatus.toUpperCase()}`, 14, 22);

  // Customer Summary
  doc.setFillColor(248, 248, 248);
  doc.rect(14, 40, 182, 32, 'F');
  doc.setDrawColor(220, 220, 220);
  doc.rect(14, 40, 182, 32, 'S');

  doc.setFontSize(8.5);
  doc.setTextColor(30, 30, 30);
  doc.setFont('helvetica', 'bold');
  doc.text('FAKTURACNE & DORUCOVACIE UDAJE:', 18, 47);

  doc.setFont('helvetica', 'normal');
  doc.text(`Zakaznik: ${params.customerName}`, 18, 54);
  doc.text(`Telefon: ${params.phone}`, 18, 60);
  doc.text(`Email: ${params.email || 'neuvedeny'}`, 18, 66);

  doc.text(`Adresa dorucenia: ${params.address}`, 110, 54);
  doc.text(`Datum vystavenia: ${params.dateStr || new Date().toLocaleDateString('sk-SK')}`, 110, 60);

  // Items Table Header
  doc.setFillColor(30, 30, 30);
  doc.rect(14, 80, 182, 8, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text('POLOZKA / POPIS', 18, 85);
  doc.text('VELKOST', 100, 85);
  doc.text('POCET', 140, 85);
  doc.text('SPOLU', 170, 85);

  let y = 96;
  doc.setTextColor(30, 30, 30);
  doc.setFont('helvetica', 'normal');

  params.items.forEach((item, idx) => {
    doc.text(`${idx + 1}. ${item.name}`, 18, y);
    doc.text(item.size || '-', 100, y);
    doc.text(`${item.quantity} ks`, 140, y);
    doc.text(item.price, 170, y);
    y += 8;
  });

  // Total summary line
  doc.setDrawColor(200, 200, 200);
  doc.line(14, y + 2, 196, y + 2);
  y += 10;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text(`CELKOVA SUMA K UHRADE:`, 100, y);
  doc.setTextColor(220, 38, 38);
  doc.text(params.totalAmount, 170, y);

  // Security and delivery note
  y += 20;
  doc.setFillColor(240, 240, 240);
  doc.rect(14, y, 182, 22, 'F');
  doc.setFontSize(7.5);
  doc.setTextColor(60, 60, 60);
  doc.setFont('helvetica', 'normal');
  doc.text('Tento doklad sluzi ako potvrdenie rezervacie a objednavky v sieti Underground Street Collective.', 18, y + 6);
  doc.text('V pripade otazok kontaktujte nas dispecing: contact@auru.space alebo navstivte https://auru.space', 18, y + 12);
  doc.text('Dakujeme za doveru v street ekosystem U.S.C.', 18, y + 17);

  doc.save(`USC_Objednavka_${params.orderId.slice(-6)}.pdf`);
}

/**
 * Generates an official Cryptographic Cargo Manifest PDF for Trade Zakasajee
 */
export function generateCargoManifestPdf(params: CargoManifestPdfParams): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  // Black Tech Header
  doc.setFillColor(10, 10, 10);
  doc.rect(0, 0, 210, 32, 'F');
  doc.setFillColor(220, 38, 38); // Red strip
  doc.rect(0, 32, 210, 2.5, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.text('TRADE ZAKASAJEE // KRYPTOGRAFICKY NAKLADOVY MANIFEST', 14, 14);

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(239, 68, 68);
  doc.text(`BEZPECNOSTNY STUPEN: ${params.clearanceLevel}  |  AES-256 EPOCH: ${params.epochHour}`, 14, 23);

  // Manifest Details
  doc.setFillColor(245, 245, 245);
  doc.rect(14, 42, 182, 54, 'F');
  doc.setDrawColor(200, 200, 200);
  doc.rect(14, 42, 182, 54, 'S');

  doc.setFontSize(8.5);
  doc.setTextColor(20, 20, 20);
  doc.setFont('helvetica', 'bold');
  doc.text('PARAMETRE TRANZITU & NAKLADU:', 18, 50);

  doc.setFont('helvetica', 'normal');
  doc.text(`Cislo manifestu: ${params.manifestId}`, 18, 58);
  doc.text(`Miesto nakladky: ${params.origin}`, 18, 65);
  doc.text(`Cielova destinacia: ${params.destination}`, 18, 72);
  doc.text(`Popis nakladu: ${params.cargoDescription}`, 18, 79);
  doc.text(`Hmotnost nakladu: ${params.cargoWeightKg} kg`, 18, 86);

  doc.text(`Zabezpecena kaucia (Escrow): EUR ${params.escrowAmountEur.toLocaleString()}`, 110, 58);
  doc.text(`Ozbrojeny Escort: ${params.escortRequired ? 'VYZADOVANY (TIER-3)' : 'STANDARTNY TRANZIT'}`, 110, 65);
  doc.text(`Autorizovany operator: ${params.authorizedOperator}`, 110, 72);
  doc.text(`Kryptograficky Hash: ${params.hashFingerprint}`, 110, 79);

  // Security Notice
  doc.setFillColor(20, 20, 20);
  doc.rect(14, 105, 182, 35, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('BEZPECNOSTNA DOLOZKA O UTAJENI TRANZITU', 18, 114);

  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(180, 180, 180);
  doc.text('Tento manifest je zabezpeceny rotujucim hodinovym klucom siete Trade Zakasajee.', 18, 122);
  doc.text('Aka-kolvek manipulacia s nakladom bez autorizovaneho potvrdzovacieho hashu vedie k okamzitej blokacii eskró uctu.', 18, 128);
  doc.text('Overenie integrity: https://auru.space/trade', 18, 134);

  doc.save(`USC_Manifest_${params.manifestId}_${Date.now().toString().slice(-4)}.pdf`);
}

export interface AuruBlueprintPdfParams {
  title: string;
  clientOrProject: string;
  architectureTier: string;
  pillarsConnected: string[];
  techStack: string[];
  estimatedHoursSaved: string;
  revenueOptimization: string;
  modules: string[];
  notes?: string;
}

/**
 * Generates an official A.I. Auru Trinity Architecture & Automation Blueprint PDF
 */
export function generateAuruBlueprintPdf(params: AuruBlueprintPdfParams): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  // Black Tech Header
  doc.setFillColor(10, 10, 10);
  doc.rect(0, 0, 210, 32, 'F');
  doc.setFillColor(245, 158, 11); // Amber strip
  doc.rect(0, 32, 210, 2.5, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.text('A.I. AURU_TRINITY // AUTOMATION & ARCHITECTURE BLUEPRINT', 14, 14);

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(245, 158, 11);
  doc.text(`AURU MATRIX CORE 3.69  |  ENGINE: GEMINI 3.7 FLASH  |  HOST: auru.space`, 14, 23);

  // Project Details Box
  doc.setFillColor(245, 245, 245);
  doc.rect(14, 42, 182, 48, 'F');
  doc.setDrawColor(200, 200, 200);
  doc.rect(14, 42, 182, 48, 'S');

  doc.setFontSize(9);
  doc.setTextColor(20, 20, 20);
  doc.setFont('helvetica', 'bold');
  doc.text('SPECIFIKACIA PROJEKTU A AUTOMATIZACIE:', 18, 50);

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text(`Nazov projektu / Klient: ${params.clientOrProject || 'U.S.C. Partner Enterprise'}`, 18, 58);
  doc.text(`Architektura / Tier: ${params.architectureTier || 'Auru Production Node (3.69)'}`, 18, 65);
  doc.text(`Uspora casu: ${params.estimatedHoursSaved || '20+ hodin tyzdenne'}`, 18, 72);
  doc.text(`Optimalizacia vynosov: ${params.revenueOptimization || '+35% az +60%'}`, 18, 79);

  doc.text(`Datum generovania: ${new Date().toLocaleDateString('sk-SK')}`, 110, 58);
  doc.text(`Technologicky stack: ${params.techStack.slice(0, 3).join(', ')}`, 110, 65);
  doc.text(`Piliere ekosystemu: ${params.pillarsConnected.length} aktivnych prepojeni`, 110, 72);

  // Active Modules
  doc.setFillColor(255, 255, 255);
  doc.rect(14, 98, 182, 80, 'F');
  doc.setDrawColor(220, 220, 220);
  doc.rect(14, 98, 182, 80, 'S');

  doc.setFontSize(9);
  doc.setTextColor(20, 20, 20);
  doc.setFont('helvetica', 'bold');
  doc.text('NASADENE AUTOMATIZACNE MODULY & JADRO:', 18, 108);

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  let yOffset = 118;
  params.modules.forEach((mod, idx) => {
    doc.setFillColor(245, 158, 11);
    doc.circle(20, yOffset - 1, 1.2, 'F');
    doc.setTextColor(30, 30, 30);
    doc.text(`${mod}`, 25, yOffset);
    yOffset += 11;
  });

  // Footer / Verification Notice
  doc.setFillColor(15, 15, 15);
  doc.rect(14, 186, 182, 38, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('CERTIFIKACIA & OVERENIE AUTONOMNEJ PLATFORMY', 18, 196);

  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(200, 200, 200);
  doc.text('Tento architektonicky blueprint bol overeny a vygenerovany jadrom A.I. Auru_Trinity.', 18, 204);
  doc.text('Infrastruktura garantuje 99.9% uptime, end-to-end sifrovanie a priame napojenie na platobnu branu.', 18, 210);
  doc.text('Oficialny portal a dispecing: https://auru.space/auru-trinity', 18, 216);

  doc.save(`Auru_Trinity_Blueprint_${Date.now().toString().slice(-6)}.pdf`);
}

