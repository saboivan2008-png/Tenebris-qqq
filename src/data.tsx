import { Hammer, Crown, Car, Briefcase, Globe, HeartHandshake } from 'lucide-react';
import hoodieImg from './assets/images/usw_hoodie_1787053117615.jpg';
import pantsImg from './assets/images/usw_pants_1787053134133.jpg';
import tshirtImg from './assets/images/usw_tshirt_1787053146393.jpg';
import sneakersImg from './assets/images/usw_sneakers_1787053158566.jpg';

import grafHoodieBlack from './assets/images/hoodie_graffiti_black_1787053769923.jpg';
import grafHoodieGrey from './assets/images/hoodie_graffiti_grey_1787053786209.jpg';
import grafTshirt from './assets/images/tshirt_graffiti_1787053796346.jpg';
import grafPants from './assets/images/pants_graffiti_1787053808395.jpg';
import grafSneakers from './assets/images/sneakers_graffiti_1787053819503.jpg';

// New Choice Is Yours Images
import choiceJacket from './assets/images/jacket_windstopper_choice_1787086265491.jpg';
import choiceGear from './assets/images/gear_tactical_choice_1787086275179.jpg';
import choiceHoodie from './assets/images/hoodie_choice_1787086283671.jpg';
import choicePants from './assets/images/pants_choice_1787086294459.jpg';
import choiceTshirt from './assets/images/tshirt_choice_1787086305350.jpg';

// Women's Edition Images
import womenHoodie from './assets/images/women_hoodie_usw_1787132355723.jpg';
import womenPants from './assets/images/women_pants_usw_1787132366117.jpg';
import womenTshirt from './assets/images/women_tshirt_usw_1787132378347.jpg';
import womenSneakers from './assets/images/women_sneakers_usw_1787132386581.jpg';
import womenJacket from './assets/images/women_jacket_usw_1787132395744.jpg';
import womenGear from './assets/images/women_gear_usw_1787132404604.jpg';

export const imageMap: Record<string, string> = {
  'usw_hoodie_1787053117615.jpg': hoodieImg,
  'usw_pants_1787053134133.jpg': pantsImg,
  'usw_tshirt_1787053146393.jpg': tshirtImg,
  'usw_sneakers_1787053158566.jpg': sneakersImg,
  'hoodie_graffiti_black_1787053769923.jpg': grafHoodieBlack,
  'hoodie_graffiti_grey_1787053786209.jpg': grafHoodieGrey,
  'tshirt_graffiti_1787053796346.jpg': grafTshirt,
  'pants_graffiti_1787053808395.jpg': grafPants,
  'sneakers_graffiti_1787053819503.jpg': grafSneakers,
  'jacket_windstopper_choice_1787086265491.jpg': choiceJacket,
  'gear_tactical_choice_1787086275179.jpg': choiceGear,
  'hoodie_choice_1787086283671.jpg': choiceHoodie,
  'pants_choice_1787086294459.jpg': choicePants,
  'tshirt_choice_1787086305350.jpg': choiceTshirt,
  'women_hoodie_usw_1787132355723.jpg': womenHoodie,
  'women_pants_usw_1787132366117.jpg': womenPants,
  'women_tshirt_usw_1787132378347.jpg': womenTshirt,
  'women_sneakers_usw_1787132386581.jpg': womenSneakers,
  'women_jacket_usw_1787132395744.jpg': womenJacket,
  'women_gear_usw_1787132404604.jpg': womenGear,
};

export const services = [
  {
    id: 'auru-trinity',
    title: 'Trinity Super AI Asistent',
    subtitle: 'Autonómny Mozog & Dielňa 3.69',
    icon: <Hammer className="w-10 h-10 text-amber-500" strokeWidth={1.5} />,
    description: 'Autonómny supermozog a digitálny riaditeľ celého ekosystému U.S.C. Riadi flotilu Rent-a-Wheel, turnusové zmluvy A1, streetwear dropy U.S.W. a eskró ochranu.',
    accent: 'border-amber-500',
    shadow: 'hover:shadow-[-6px_6px_0px_0px_rgba(245,158,11,1)]',
    path: '/auru-trinity'
  },
  {
    id: 'usw',
    title: 'U. S. W.',
    subtitle: 'Underground-Street-Wear',
    icon: <Crown className="w-10 h-10 text-red-600" strokeWidth={1.5} />,
    description: 'Vlastný brand značky oblečenia. Hip hop, hustle, street, hooligans. Žiadna masovka, čistá ulica a surový dizajn pre tých, čo vedia.',
    accent: 'border-red-600',
    shadow: 'hover:shadow-[-6px_6px_0px_0px_rgba(220,38,38,1)]',
    path: '/usw'
  },
  {
    id: 'rent-a-wheel',
    title: 'Rent a wheel',
    icon: <Car className="w-10 h-10 text-zinc-100" strokeWidth={1.5} />,
    description: 'Vozový park pre osobné aj pracovné účely (Bolt, Wolt, taxi). Kuriérska služba na zavolanie - vybavíme od taxíka až po veci, o ktorých sa nehovorí nahlas.',
    accent: 'border-zinc-100',
    shadow: 'hover:shadow-[-6px_6px_0px_0px_rgba(244,244,245,1)]',
    path: '/rent-a-wheel'
  },
  {
    id: 'usc-work',
    title: 'U. S. C. Work',
    subtitle: 'Underground-Street-Collective work',
    icon: <Briefcase className="w-10 h-10 text-amber-500" strokeWidth={1.5} />,
    description: 'Personálna agentúra. Vybavovanie živností, s.r.o., hľadanie zamestnania. Úplná starostlivosť od daňových priznaní, certifikátov, až po vyslanie do zahraničia.',
    accent: 'border-amber-500',
    shadow: 'hover:shadow-[-6px_6px_0px_0px_rgba(245,158,11,1)]',
    path: '/usc-work'
  },
  {
    id: 'trade',
    title: 'Trade Zakasajee',
    subtitle: 'Logistika & Biznis',
    icon: <Globe className="w-10 h-10 text-red-600" strokeWidth={1.5} />,
    description: 'Export, import, biznis, logistika. Transport všetkého a všetkých. Zákazník povie, my vybavíme, dovezieme, predáme (aj zákazníka samému sebe).',
    accent: 'border-red-600',
    shadow: 'hover:shadow-[-6px_6px_0px_0px_rgba(220,38,38,1)]',
    path: '/trade'
  },
  {
    id: 'usc-solidarity',
    title: 'U.S.C. Solidarity',
    subtitle: 'Street Support / Charita',
    icon: <HeartHandshake className="w-10 h-10 text-zinc-100" strokeWidth={1.5} />,
    description: 'Kód ulice hovorí jasne: silnejší ťahá slabšieho. Pomáhame rodinám v núdzi, útulkom a ľuďom na okraji vrátiť sa späť do hry. Transparentne a napriamo.',
    accent: 'border-zinc-100',
    shadow: 'hover:shadow-[-6px_6px_0px_0px_rgba(255,255,255,1)]',
    path: '/usc-solidarity'
  },
];

export const uswProducts = [
  // Mikiny
  { id: 'm0', cat: 'mikiny', name: 'Choice Is Yours Hoodie', price: '€89', color: 'Graffiti Black', image: choiceHoodie },
  { id: 'wm1', cat: 'mikiny', name: 'U.S.W Queens Oversize', price: '€79', color: 'Concrete Black (W)', image: womenHoodie },
  { id: 'm1', cat: 'mikiny', name: '"JEBE TY!" Heavyweight', price: '€69', color: 'Black', image: grafHoodieBlack },
  { id: 'm2', cat: 'mikiny', name: '369 Matrix Pullover', price: '€65', color: 'Ash Grey', image: grafHoodieGrey },
  { id: 'm3', cat: 'mikiny', name: 'Hustle Hard Zip-Up', price: '€75', color: 'Blood Red', image: hoodieImg },
  { id: 'm4', cat: 'mikiny', name: 'Syndicate Core Hoodie', price: '€79', color: 'Washed Black', image: grafHoodieBlack },
  { id: 'm5', cat: 'mikiny', name: 'Garage Rules Raw-Cut', price: '€60', color: 'Concrete', image: grafHoodieGrey },
  
  // Tepláky
  { id: 't0', cat: 'tepláky', name: 'Choice Is Yours Cargo', price: '€75', color: 'Graffiti Grey', image: choicePants },
  { id: 'wt1', cat: 'tepláky', name: 'U.S.W Queens Cargo', price: '€69', color: 'Dark Grey (W)', image: womenPants },
  { id: 't1', cat: 'tepláky', name: '"JEBE TY!" Cargo Sweats', price: '€55', color: 'Black', image: grafPants },
  { id: 't2', cat: 'tepláky', name: '369 Tactical Joggers', price: '€59', color: 'Dark Grey', image: pantsImg },
  { id: 't3', cat: 'tepláky', name: 'Syndicate Heavyweight', price: '€65', color: 'Black', image: grafPants },
  { id: 't4', cat: 'tepláky', name: 'Concrete Jungle Track', price: '€50', color: 'Grey', image: pantsImg },
  { id: 't5', cat: 'tepláky', name: 'Raw Hustle Baggy', price: '€49', color: 'Washed Black', image: grafPants },
  
  // Tričká
  { id: 'tr0', cat: 'tričká', name: 'Choice Is Yours Oversize', price: '€45', color: 'Graffiti Black', image: choiceTshirt },
  { id: 'wtr1', cat: 'tričká', name: 'U.S.W Queens Cropped Tee', price: '€39', color: 'Black (W)', image: womenTshirt },
  { id: 'tr1', cat: 'tričká', name: '"JEBE TY!" Oversized Tee', price: '€35', color: 'Black', image: grafTshirt },
  { id: 'tr2', cat: 'tričká', name: '369 Eye Graphic Tee', price: '€35', color: 'White', image: tshirtImg },
  { id: 'tr3', cat: 'tričká', name: 'U.S.W Core Logo Tee', price: '€30', color: 'Red', image: grafTshirt },
  { id: 'tr4', cat: 'tričká', name: 'Hustle Protocol Acid', price: '€40', color: 'Acid Wash', image: tshirtImg },
  { id: 'tr5', cat: 'tričká', name: 'Garage Syndicate Raw', price: '€35', color: 'Black', image: grafTshirt },
  
  // Tenisky
  { id: 's1', cat: 'tenisky', name: 'U.S.W "Concrete" Stompers', price: '€120', color: 'Grey/Black', image: grafSneakers },
  { id: 'ws1', cat: 'tenisky', name: 'U.S.W Queens Chunky', price: '€125', color: 'Concrete Grey (W)', image: womenSneakers },
  { id: 's2', cat: 'tenisky', name: '369 Matrix Runners', price: '€135', color: 'Triple Black', image: sneakersImg },
  { id: 's3', cat: 'tenisky', name: 'Hustle High-Tops', price: '€110', color: 'Blood/Black', image: grafSneakers },
  { id: 's4', cat: 'tenisky', name: 'Syndicate "Street Rule"', price: '€125', color: 'White/Red', image: sneakersImg },
  { id: 's5', cat: 'tenisky', name: '"JEBE TY!" Slip-Ons', price: '€89', color: 'Checkered Black', image: grafSneakers },

  // Bundy (New)
  { id: 'b1', cat: 'bundy', name: 'Choice Is Yours Windstopper', price: '€130', color: 'Tactical Black', image: choiceJacket },
  { id: 'wb1', cat: 'bundy', name: 'U.S.W Queens Cropped Jacket', price: '€120', color: 'Tactical Black (W)', image: womenJacket },
  { id: 'b2', cat: 'bundy', name: 'U.S.W Block Jacket', price: '€115', color: 'Concrete Grey', image: grafHoodieGrey }, // Using existing images as placeholders
  { id: 'b3', cat: 'bundy', name: 'Syndicate Weather-Proof', price: '€140', color: 'Blood Red', image: hoodieImg },

  // Taktické Pomôcky (New)
  { id: 'd1', cat: 'pomôcky', name: 'Choice Is Yours Chest Rig', price: '€65', color: 'Tactical Black', image: choiceGear },
  { id: 'wd1', cat: 'pomôcky', name: 'U.S.W Queens Utility Rig', price: '€55', color: 'Black (W)', image: womenGear },
  { id: 'd2', cat: 'pomôcky', name: 'U.S.W Utility Sling Bag', price: '€45', color: 'Black', image: grafHoodieBlack },
  { id: 'd3', cat: 'pomôcky', name: '369 Tactical Mask', price: '€25', color: 'Washed Black', image: tshirtImg },
];
