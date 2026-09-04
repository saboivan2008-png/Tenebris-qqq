import React, { useState } from 'react';
import { FileText, Printer, ShieldCheck, Download, Copy, Check } from 'lucide-react';
import { generateContractPdf } from '../../lib/documentGenerator';

export default function AdminLegalContracts() {
  const [selectedContract, setSelectedContract] = useState<'gdpr' | 'agency_contract' | 'subcontractor'>('gdpr');
  const [copied, setCopied] = useState(false);

  // Dynamicke polia pre rychlu generaciu
  const [workerName, setWorkerName] = useState('Ján Vzorný');
  const [workerId, setWorkerId] = useState('12345678');
  const [workerCity, setWorkerCity] = useState('Bratislava');
  const [hourlyRate, setHourlyRate] = useState('22.50');
  const [destinationCountry, setDestinationCountry] = useState('Nemecko / Rakúsko');

  const gdprText = `SÚHLAS SO SPRACOVANÍM OSOBNÝCH ÚDAJOV (GDPR)
podľa Nariadenia Európskeho parlamentu a Rady (EÚ) 2016/679

1. PREVÁDZKOVATEĽ:
   Názov: Underground Street Collective (U.S.C.) / Auru Network
   Kontaktná e-mailová adresa: contact@auru.space
   
2. DOTKNUTÁ OSOBA (KANDIDÁT / UCHÁDZAČ):
   Meno a priezvisko: ${workerName}
   Miesto trvalého bydliska / Mesto: ${workerCity}
   IČO / Dátum narodenia: ${workerId}

3. ÚČEL SPRACOVANIA:
   - Zaradenie do internej personálnej databázy uchádzačov o prácu, montážne projekty a turnusové zákazky.
   - Analýza profesijnej kvalifikácie, overenie oprávnení (elektro vyhlášky, zváračské preukazy, vodičské preukazy).
   - Prezentovanie a sprostredkovanie profilu uchádzača overeným odberateľom a partnerom v SR a EÚ (${destinationCountry}).
   - Vybavovanie formulárov vyslania A1, zmluvnej a fakturačnej agendy.

4. ROZSAH SPRACOVÁVANÝCH ÚDAJOV:
   Titul, meno, priezvisko, telefón, e-mail, adresa, jazykové znalosti, prax, certifikáty, informácie o živnostenskom oprávnení.

5. DOBA UDELENIA SÚHLASU:
   Súhlas sa udeľuje na dobu 3 rokov odo dňa jeho udelenia, alebo do písomného odvolania dotknutou osobou.

6. POUČENIE O PRÁVACH:
   Dotknutá osoba má právo kedykoľvek svoj súhlas odvolať, požadovať prístup k svojim osobným údajom, ich opravu alebo vymazanie.

V ............................. dňa ....................

Podpis dotknutej osoby: .......................................`;

  const agencyContractText = `RÁMCOVÁ ZMLUVA O SPROSTREDKOVANÍ OBCHODNÝCH PRÍLEŽITOSTÍ A ZÁKAZIEK
(pre samostatne zárobkovo činné osoby - SZČO)

ZMLUVNÉ STRANY:
Sprostredkovateľ: Underground Street Collective (U.S.C.) / Auru Space Platform
a
Dodávateľ / Živnostník:
Meno / Obchodné meno: ${workerName}
Sídlo: ${workerCity}
IČO: ${workerId}

ČLÁNOK I. - PREDMET ZMLUVY
1. Sprostredkovateľ sa zaväzuje pre Dodávateľa aktívne vyhľadávať a zabezpečovať zákazky, subdodávateľské práce a turnusové projekty v cieľových krajinách: ${destinationCountry}.
2. Dodávateľ sa zaväzuje vykonávať dohodnuté dielo s odbornou starostlivosťou a v súlade s bezpečnostnými normami odberateľa.

ČLÁNOK II. - FINANČNÉ PODMIENKY A SADZBY
1. Dohodnutá hodinová / projektová odmena Dodávateľa: ${hourlyRate} EUR / hodina (resp. dohodnutá sadzba na projektovej objednávke).
2. Fakturácia prebieha na základe odsúhlasených výkazov hodín (Stundenzettel / Montážny list) s dohodnutou splatnosťou.
3. Sprostredkovateľský servis zahŕňa asistenciu s ubytovaním, koordináciu dispečingu a prekladovú podporu.

ČLÁNOK III. - POVINNOSTI A DOKLADY
1. Dodávateľ ručí za platnosť svojho živnostenského oprávnenia, platné poistenie zodpovednosti a vybavenie formulára A1 (Sociálna poisťovňa).
2. Zmluvné strany sa zaväzujú zachovávať mlčanlivosť o všetkých obchodných a technických skutočnostiach.

V ............................. dňa ....................

Za U.S.C. Centrálu: .......................       Dodávateľ (SZČO): .......................`;

  const subcontractorText = `DOHODA O SPOLUPRÁCI A VZÁJOMNEJ SÚČINNOSTI
(Garáž Flotily & Kuriérsky Subdodávateľ)

1. ÚČASTNÍCI DOHODY:
   Flotilový dispečing: U.S.C. Rent a Wheel & Courier Division
   Partner / Vodič: ${workerName} (${workerCity}), IČO/RČ: ${workerId}

2. PREDMET:
   Poskytnutie flotilového vozidla a integrácia do kuriérskych a prepravných trás s garanciou technickej podpory 24/7.
   Garantovaná sadzba/percentuálny podiel: stanovené podľa turnusu a dojazdu.

Podpis: .......................................`;

  const getCurrentText = () => {
    if (selectedContract === 'gdpr') return gdprText;
    if (selectedContract === 'agency_contract') return agencyContractText;
    return subcontractorText;
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(getCurrentText());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPdf = () => {
    const titleMap = {
      gdpr: 'Súhlas so spracovaním osobných údajov (GDPR)',
      agency_contract: 'Rámcová zmluva o sprostredkovaní práce (SZČO Turnus)',
      subcontractor: 'Dohoda o spolupráci - Garáž Flotily a Kuriér'
    };

    generateContractPdf({
      title: titleMap[selectedContract],
      contractType: selectedContract,
      workerName,
      workerId,
      workerCity,
      hourlyRate,
      destinationCountry,
      content: getCurrentText()
    });
  };

  return (
    <div className="flex flex-col gap-8">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <FileText className="w-8 h-8 text-amber-400" />
          <h1 className="text-4xl font-black uppercase">Zmluvná & GDPR Právna Matrica</h1>
        </div>
        <p className="text-zinc-500 font-bold uppercase tracking-widest">
          Centrálny generátor právnych vzorov, GDPR súhlasov a zmlúv o sprostredkovaní práce pre U.S.C. ekosystém
        </p>
      </div>

      {/* Rychly generator parametrov */}
      <div className="bg-zinc-900 border-4 border-black p-6">
        <h3 className="text-xs font-mono font-bold text-amber-400 uppercase tracking-widest mb-4">
          // Rýchle parametre pre vyplnenie zmluvy na kľúč:
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
          <div>
            <label className="block text-[11px] font-mono font-bold text-zinc-400 uppercase mb-1">Meno Pracovníka / Firmy</label>
            <input
              type="text"
              value={workerName}
              onChange={(e) => setWorkerName(e.target.value)}
              className="w-full bg-black border-2 border-zinc-800 p-2 text-white font-mono text-xs uppercase focus:border-amber-400 outline-none"
            />
          </div>
          <div>
            <label className="block text-[11px] font-mono font-bold text-zinc-400 uppercase mb-1">IČO / Dátum Nar.</label>
            <input
              type="text"
              value={workerId}
              onChange={(e) => setWorkerId(e.target.value)}
              className="w-full bg-black border-2 border-zinc-800 p-2 text-white font-mono text-xs uppercase focus:border-amber-400 outline-none"
            />
          </div>
          <div>
            <label className="block text-[11px] font-mono font-bold text-zinc-400 uppercase mb-1">Mesto / Bydlisko</label>
            <input
              type="text"
              value={workerCity}
              onChange={(e) => setWorkerCity(e.target.value)}
              className="w-full bg-black border-2 border-zinc-800 p-2 text-white font-mono text-xs uppercase focus:border-amber-400 outline-none"
            />
          </div>
          <div>
            <label className="block text-[11px] font-mono font-bold text-zinc-400 uppercase mb-1">Sadzba (€/h)</label>
            <input
              type="text"
              value={hourlyRate}
              onChange={(e) => setHourlyRate(e.target.value)}
              className="w-full bg-black border-2 border-zinc-800 p-2 text-white font-mono text-xs uppercase focus:border-amber-400 outline-none"
            />
          </div>
          <div>
            <label className="block text-[11px] font-mono font-bold text-zinc-400 uppercase mb-1">Krajina Projektu</label>
            <input
              type="text"
              value={destinationCountry}
              onChange={(e) => setDestinationCountry(e.target.value)}
              className="w-full bg-black border-2 border-zinc-800 p-2 text-white font-mono text-xs uppercase focus:border-amber-400 outline-none"
            />
          </div>
        </div>
      </div>

      {/* Volba dokumentu */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-zinc-800 pb-4">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedContract('gdpr')}
            className={`px-4 py-2 text-xs font-black uppercase tracking-widest border-2 transition-all flex items-center gap-2 ${
              selectedContract === 'gdpr' ? 'bg-amber-500 text-black border-black' : 'bg-black text-zinc-400 border-zinc-800 hover:text-white'
            }`}
          >
            <ShieldCheck className="w-4 h-4" /> 1. GDPR Súhlas Kandidáta
          </button>
          <button
            onClick={() => setSelectedContract('agency_contract')}
            className={`px-4 py-2 text-xs font-black uppercase tracking-widest border-2 transition-all flex items-center gap-2 ${
              selectedContract === 'agency_contract' ? 'bg-amber-500 text-black border-black' : 'bg-black text-zinc-400 border-zinc-800 hover:text-white'
            }`}
          >
            <FileText className="w-4 h-4" /> 2. Rámcová Zmluva (SZČO Turnus)
          </button>
          <button
            onClick={() => setSelectedContract('subcontractor')}
            className={`px-4 py-2 text-xs font-black uppercase tracking-widest border-2 transition-all flex items-center gap-2 ${
              selectedContract === 'subcontractor' ? 'bg-amber-500 text-black border-black' : 'bg-black text-zinc-400 border-zinc-800 hover:text-white'
            }`}
          >
            <FileText className="w-4 h-4" /> 3. Kuriér & Flotilová Dohoda
          </button>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={handleCopy}
            className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 border-2 border-zinc-700 text-white font-mono text-xs uppercase flex items-center gap-2 transition-all"
          >
            {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
            {copied ? 'Skopírované!' : 'Kopírovať'}
          </button>
          <button
            onClick={handleDownloadPdf}
            className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-black font-black text-xs uppercase flex items-center gap-2 border-2 border-black transition-all shadow-[2px_2px_0px_0px_rgba(255,255,255,1)]"
          >
            <Download className="w-4 h-4" /> Stiahnuť PDF Zmluvu
          </button>
          <button
            onClick={handlePrint}
            className="px-4 py-2 bg-white hover:bg-zinc-200 text-black font-black text-xs uppercase flex items-center gap-2 border-2 border-black transition-all"
          >
            <Printer className="w-4 h-4" /> Tlačiť
          </button>
        </div>
      </div>

      {/* Nahlad zmluvy */}
      <div className="bg-black border-4 border-zinc-800 p-8 font-mono text-xs text-zinc-200 leading-relaxed whitespace-pre-wrap selection:bg-amber-500 selection:text-black">
        {getCurrentText()}
      </div>
    </div>
  );
}
