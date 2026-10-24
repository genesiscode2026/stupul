export type Language = 'ro' | 'en';

export interface Translations {
  common: {
    close: string;
    cancel: string;
    save: string;
    yes: string;
    no: string;
    credits: string;
    materials: string;
    food: string;
    level: string;
    status: string;
    anonymous: string;
    dayStep: string;
    vCreditsTitle: string;
    satisfaction: string;
  };
  topbar: {
    stages: Record<string, string>;
    pause: string;
    play: string;
    step: string;
    governance: string;
    aqueduct: string;
    work: string;
    workshop: string;
    guide: string;
    timeline: string;
    audit: string;
    shareCity: string;
    shareSuccess: string;
    shareInfo: string;
    langToggle: string;
  };
  mission: {
    missionLabel: string;
    growingTitle: string;
    growingHint: string;
    helpTitle: string;
    aqueductHint: string;
    farmHint: string;
    houseHint: string;
  };
  tools: {
    house: string;
    farm: string;
    well: string;
    road: string;
    warehouse: string;
    school: string;
    workshop: string;
    clinic: string;
    guard_post: string;
    upgrade: string;
    demolish: string;
    claim: string;
    creditsCost: string;
  };
  buildings: Record<string, { name: string; description: string; shortName: string }>;
  inspector: {
    parcelTitle: string;
    terrain: string;
    ownershipStatus: string;
    publicDomain: string;
    freeParcel: string;
    virtualDisclaimer: string;
    buyParcel: string;
    buildFacility: string;
    upgradeBtn: string;
    upgradeTitle: string;
    demolishTitle: string;
  };
  civicTasks: {
    modalTitle: string;
    disclaimer: string;
    farmingTitle: string;
    farmingDesc: string;
    farmingReward: string;
    woodcuttingTitle: string;
    woodcuttingDesc: string;
    woodcuttingReward: string;
    masonryTitle: string;
    masonryDesc: string;
    masonryReward: string;
    civicDutyTitle: string;
    civicDutyDesc: string;
    civicDutyReward: string;
    rewardLabel: string;
    workBtn: string;
  };
  puzzle: {
    title: string;
    description: string;
    solvedTitle: string;
    solvedBonus: string;
    rotateHint: string;
    rotateTitle: string;
    solvesCount: string;
  };
  timeline: {
    title: string;
    subtitle: string;
    noEvents: string;
    initialEvent1: string;
    initialEvent2: string;
  };
  governance: {
    modalTitle: string;
    tabCitizens: string;
    tabContributors: string;
    tabMayor: string;
    tabLaws: string;
    govPrinciple: string;
    activeProposals: string;
    voteYes: string;
    voteNo: string;
    yesLabel: string;
    noLabel: string;
    inVoting: string;
    initiatedBy: string;
    contributorsRule: string;
    registryTitle: string;
    activeMerit: string;
    acceptedToday: string;
    mayorTitle: string;
    mayorSub: string;
    mayorActive: string;
    holderLabel: string;
    holderVal: string;
    durationLabel: string;
    civicActLabel: string;
    civicActVal: string;
    recallProc: string;
    recallVal: string;
    policyTuning: string;
    taxRateLabel: string;
    taxRateDesc: string;
    foodRationLabel: string;
    austere: string;
    standard: string;
    abundant: string;
    educationLabel: string;
    fromFund: string;
  };
  audit: {
    title: string;
    hashLabel: string;
    hashSub: string;
    downloadSnapshot: string;
    uploadSnapshot: string;
    snapshotSuccess: string;
    royaltyModelTitle: string;
    royaltyBadge: string;
    royaltyFormula: string;
    gross: string;
    taxes: string;
    refunds: string;
    processorFees: string;
    eligibleBase: string;
    founderRoyalty: string;
    legalGateTitle: string;
    monetizationLocked: string;
    legalGateDesc: string;
  };
  tutorial: {
    modalTitle: string;
    prev: string;
    next: string;
    start: string;
    step1Title: string;
    step1Badge: string;
    step1P1: string;
    step1P2: string;
    step1Tip: string;
    step2Title: string;
    step2Badge: string;
    step2P1: string;
    step2House: string;
    step2Farm: string;
    step2Well: string;
    step2Barn: string;
    step2Tip: string;
    step3Title: string;
    step3Badge: string;
    step3P1: string;
    step3P2: string;
    step3Reward: string;
    step4Title: string;
    step4Badge: string;
    step4P1: string;
    step4P2: string;
    step4P3: string;
    step5Title: string;
    step5Badge: string;
    step5P1: string;
    step5P2: string;
    step5Chamber1: string;
    step5Chamber2: string;
    step5Disclaimer: string;
  };
  workshop: {
    modalTitle: string;
    subtitle: string;
    tabProposals: string;
    tabProjects: string;
    tabMerit: string;
    formTitle: string;
    titlePlaceholder: string;
    descPlaceholder: string;
    dcoLabel: string;
    submitBtn: string;
    consultationHeader: string;
    promotedProject: string;
    author: string;
    independenceNotice: string;
    inTesting: string;
    assigned: string;
    reviewer: string;
    pointsAtDelivery: string;
    meritDesc: string;
    thContributor: string;
    thWork: string;
    thPoints: string;
    thWeight: string;
    thDco: string;
    signedDigital: string;
    maxCap: string;
    footerAutonomy: string;
    closeWorkshop: string;
  };
  toasts: {
    simStarted: string;
  };
}

export const translations: Record<Language, Translations> = {
  ro: {
    common: {
      close: 'Închide',
      cancel: 'Anulează',
      save: 'Salvează',
      yes: 'DA',
      no: 'NU',
      credits: 'credite',
      materials: 'materiale',
      food: 'hrană',
      level: 'Nivelul',
      status: 'Statut',
      anonymous: 'Mod Oaspete (Anonim)',
      dayStep: 'Ziua / Pasul:',
      vCreditsTitle: 'Credite Virtuale STUPUL (100% virtuale, neconvertibile în bani reali)',
      satisfaction: 'mulțumire',
    },
    topbar: {
      stages: {
        frontier_outpost: 'Avanpost de Frontieră',
        wild_west_settlement: 'Așezare Vestul Sălbatic',
        growing_town: 'Târg în Creștere',
        modern_civilisation: 'Civilizație Prosperă',
      },
      pause: 'Pauză',
      play: 'Pornire Simulare',
      step: 'Avansează un pas (1 Tick)',
      governance: 'Guvernanță',
      aqueduct: 'Apeduct',
      work: 'Muncă',
      workshop: 'Atelier',
      guide: 'Ghid',
      timeline: 'Jurnal',
      audit: 'Audit',
      shareCity: 'Partajează Așezarea (Link Civic)',
      shareSuccess: 'Link civic copiat în clipboard! Trimite-l comunității.',
      shareInfo: 'Link așezare:',
      langToggle: '🇷🇴 RO',
    },
    mission: {
      missionLabel: '🎯 Misiune',
      growingTitle: 'Așezarea crește!',
      growingHint: 'Continuă să construiești, să câștigi V-Credits și să cumperi parcele noi.',
      helpTitle: 'AJUTĂ AȘEZAREA SĂ CREASCĂ',
      aqueductHint: 'Rezolvă puzzle-ul Apeductului pentru apă potabilă.',
      farmHint: 'Construiește o Fermă pentru a asigura hrana.',
      houseHint: 'Colectează materiale prin „Muncă" și construiește o Casă.',
    },
    tools: {
      house: 'Casă',
      farm: 'Fermă',
      well: 'Puț',
      road: 'Drum',
      warehouse: 'Hambar',
      school: 'Școală',
      workshop: 'Atelier',
      clinic: 'Dispensar',
      guard_post: 'Pază',
      upgrade: 'Modernizează',
      demolish: 'Demolează',
      claim: 'Ia Parcelă',
      creditsCost: 'credite',
    },
    buildings: {
      house: {
        shortName: 'Casă',
        name: 'Casă de Lemn',
        description: 'Oferă adăpost pentru până la 25 de cetățeni.',
      },
      farm: {
        shortName: 'Fermă',
        name: 'Fermă Comunitară',
        description: 'Produce 40 unități de hrană pe ciclu.',
      },
      well: {
        shortName: 'Puț',
        name: 'Puț cu Ciutură',
        description: 'Furnizează apă potabilă în raza de 3 parcele.',
      },
      warehouse: {
        shortName: 'Hambar',
        name: 'Hambar & Depozit',
        description: 'Crește capacitatea de stocare cu 250 unități.',
      },
      school: {
        shortName: 'Școală',
        name: 'Școală Publică',
        description: 'Crește educația și productivitatea muncii cu 20%.',
      },
      town_hall: {
        shortName: 'Primărie',
        name: 'Primărie & Sfat Civic',
        description: 'Centrul administrativ și guvernanța așezării.',
      },
      road: {
        shortName: 'Drum',
        name: 'Drum Pietruit',
        description: 'Conectează parcelele și îmbunătățește circulația.',
      },
      workshop: {
        shortName: 'Atelier',
        name: 'Atelier Meșteșugăresc',
        description: 'Produce 25 unități de materiale de construcție pe ciclu.',
      },
      clinic: {
        shortName: 'Dispensar',
        name: 'Dispensar Medical',
        description: 'Îmbunătățește sănătatea publică și reduce mortalitatea.',
      },
      guard_post: {
        shortName: 'Pază',
        name: 'Post de Pază & Siguranță',
        description: 'Asigură ordinea civică și protecția împotriva abuzurilor.',
      },
    },
    inspector: {
      parcelTitle: 'Parcela',
      terrain: 'Teren:',
      ownershipStatus: 'Statut Proprietate:',
      publicDomain: 'Domeniu Public',
      freeParcel: 'Liberă (Revendicabilă)',
      virtualDisclaimer: 'Proprietate exclusiv virtuală în joc (STP-008)',
      buyParcel: 'Cumpără Parcela',
      buildFacility: 'Construiește o facilitate:',
      upgradeBtn: 'Modernizează',
      upgradeTitle: 'Modernizează clădirea la următorul nivel',
      demolishTitle: 'Demolează clădirea',
    },
    civicTasks: {
      modalTitle: 'Muncă & Activități Economice Civice',
      disclaimer: 'Creditele câștigate sunt exclusiv virtuale, utilizabile doar în interiorul jocului STUPUL pentru parcele și dezvoltare urbană (fără convertibilitate reală).',
      farmingTitle: 'Muncă la Ferma Comunitară',
      farmingDesc: 'Ajută la cultivarea grâului și întreținerea culturilor de frontieră.',
      farmingReward: '+15 Hrană, +8 Credite Virtuale',
      woodcuttingTitle: 'Tăiere Lemne în Pădure',
      woodcuttingDesc: 'Recoltează bușteni de pin și stejar pentru șantierele de construcții.',
      woodcuttingReward: '+15 Materiale, +8 Credite Virtuale',
      masonryTitle: 'Cariera de Piatră și Zidărie',
      masonryDesc: 'Extrage blocuri de piatră pentru consolidarea drumurilor și a primăriei.',
      masonryReward: '+20 Materiale, +10 Credite Virtuale',
      civicDutyTitle: 'Serviciu Public la Primărie',
      civicDutyDesc: 'Contribuie la ținerea registrelor civice și organizarea consiliului comunitar.',
      civicDutyReward: '+12 Credite Virtuale',
      rewardLabel: 'Recompensă:',
      workBtn: 'Muncește',
    },
    puzzle: {
      title: 'Puzzle Apeduct: Conectarea Apei',
      description: 'Rotește segmentele de conductă pentru a ghida apa de la Izvor (stânga-sus) la Rezervorul orașului (dreapta-jos). O rețea conectată crește producția de hrană cu 30%!',
      solvedTitle: 'Apeduct Funcțional! Apa curge spre rezervor.',
      solvedBonus: 'Bonus activ: +30% producție agricolă la ferme.',
      rotateHint: 'Apasă pe segmente pentru a le roti la 90°.',
      rotateTitle: 'Rotește segment',
      solvesCount: 'Rezolvări:',
    },
    timeline: {
      title: 'Jurnalul Istoric al Orașului (Append-Only)',
      subtitle: 'Istoric determinist imutabil (STP-007, STP-100). Pasul curent:',
      noEvents: 'Niciun eveniment înregistrat încă.',
      initialEvent1: 'Avanpostul de Frontieră a fost întemeiat pe malul râului.',
      initialEvent2: 'Primele 100 de suflete s-au așezat în vale.',
    },
    governance: {
      modalTitle: 'Guvernanța Democratică a STUPUL',
      tabCitizens: 'Camera Cetățenilor (1 om = 1 vot)',
      tabContributors: 'Camera Contributorilor (Merit 90z)',
      tabMayor: 'Primar & Alegeri',
      tabLaws: 'Legi & Politici Publice',
      govPrinciple: 'Principiu Constituțional GOV-001: Fiecare cetățean are exact 1 vot egal. Bogăția în joc, parcelele deținute sau numărul de acțiuni în firma comercială conferă 0 voturi în plus.',
      activeProposals: 'Propuneri Civice Active',
      voteYes: 'Votează DA',
      voteNo: 'Votează NU',
      yesLabel: 'DA:',
      noLabel: 'NU:',
      inVoting: 'În votare',
      initiatedBy: 'Inițiat de:',
      contributorsRule: 'GOV-010 & GOV-020: Reputația și meritul se acordă exclusiv pentru contribuții testate și validate independent. Meritul scade la jumătate după 45 de zile și expiră complet la 90 de zile. Niciun contributor nu poate deține peste 5% din votul camerei.',
      registryTitle: 'Registrul Contribuțiilor Validate',
      activeMerit: 'Merit Activ',
      acceptedToday: 'Acceptat: Astăzi (100% greutate)',
      mayorTitle: 'Primarul Așezării',
      mayorSub: 'Mandat civic temporar (GOV-030)',
      mayorActive: 'Activ • Mandatul 1 din max 2',
      holderLabel: 'Titular Mandat:',
      holderVal: 'Sfatul Cetățenilor / Primar Ales',
      durationLabel: 'Durată Mandat:',
      civicActLabel: 'Activitate Civică:',
      civicActVal: 'Livrări verificate la zi',
      recallProc: 'Procedură Revocare:',
      recallVal: '30z inactivitate + 7z remediere',
      policyTuning: 'Reglajul Politicilor Publice',
      taxRateLabel: 'Impozit Virtual pe Cifra Economică:',
      taxRateDesc: 'Generează credite virtuale la bugetul orașului. Dacă depășește 20%, scade satisfacția cetățenilor.',
      foodRationLabel: 'Regimul Rațiilor de Hrană:',
      austere: 'Auster (0.7x)',
      standard: 'Standard (1.0x)',
      abundant: 'Abundent (1.4x)',
      educationLabel: 'Subvenție Școli & Educație:',
      fromFund: 'din fond',
    },
    audit: {
      title: 'Audit, Integritate & Redevențe Fondator (GENESIS v1.1)',
      hashLabel: 'Hash Canonic SHA-256 de Integritate:',
      hashSub: 'Verificabil pe orice mașină',
      downloadSnapshot: 'Descarcă Snapshot JSON',
      uploadSnapshot: 'Încarcă Snapshot JSON',
      snapshotSuccess: 'Snapshot încărcat cu succes! Integritatea stării a fost validată.',
      royaltyModelTitle: 'Modelul Contractual al Redevenței de 5% (LEG-001)',
      royaltyBadge: '5% FIX DIN NET ELIGIBIL',
      royaltyFormula: 'Formula contractuală: Încasări Brute minus Taxe/TVA, Rambursări și Comisioane Directe de Procesare. Cheltuielile generale, salariile și marketingul NU reduc baza eligibilă (anti-deturnare).',
      gross: 'Încasări Brute (€)',
      taxes: 'Taxe / TVA (€)',
      refunds: 'Rambursări (€)',
      processorFees: 'Taxe Procesator (€)',
      eligibleBase: 'Bază Netă Eligibilă:',
      founderRoyalty: 'Redevență Fondator (5%):',
      legalGateTitle: 'Statut Legal Gates (Fail-Closed):',
      monetizationLocked: 'MONETIZARE STRICT BLOCATĂ',
      legalGateDesc: 'Conform LEG-T05 și regulilor GENESIS v1.1, nicio funcție de plată reală sau monedă tranzacționabilă nu poate fi activată fără îndeplinirea cumulativă a tuturor celor 6 porți legale (Operator verificat, Licență 5% semnată, Aviz Avocat IP/Fiscal, GDPR, etc.).',
    },
    tutorial: {
      modalTitle: 'Ghidul Pionierului STUPUL',
      prev: 'Înapoi',
      next: 'Următorul',
      start: 'Începe Jocul!',
      step1Title: '1. Bun venit în STUPUL — Avanpostul de Frontieră',
      step1Badge: 'Începutul Civilizației',
      step1P1: 'Ai preluat conducerea unei mici așezări de pionieri pe malul unui râu sălbatic. Comunitatea inițială numără 100 de cetățeni simulați.',
      step1P2: 'Orașul evoluează pe 4 trepte istorice: de la Avanpost de Frontieră, la Așezare Vestul Sălbatic, Târg în Creștere și în final Civilizație Prosperă.',
      step1Tip: '💡 Sfat: Folosește rotița mouse-ului sau butoanele + / - pentru a mări harta și trage cu mouse-ul pentru a naviga pe cele 16x16 parcele.',
      step2Title: '2. Construcția și Nevoile Cetățenilor',
      step2Badge: 'Economie & Resurse',
      step2P1: 'Populația are 5 nevoi fundamentale: Hrană, Adăpost, Apă, Siguranță și Educație.',
      step2House: 'Casele de Lemn: Oferă adăpost pentru 25 de oameni per nivel.',
      step2Farm: 'Fermele Comunitare: Produc grâu și alimente pentru a preveni foametea.',
      step2Well: 'Puțurile de Apă: Asigură aprovizionarea cu apă potabilă a parcelelor învecinate.',
      step2Barn: 'Atelierele & Hambarele: Generează materiale de construcție și extind depozitele.',
      step2Tip: 'Alege orice clădire din Bara de Jos și fă clic pe o parcelă liberă pentru a construi!',
      step3Title: '3. Infrastructura & Mini-Puzzle-ul Apeductului',
      step3Badge: 'Utilități Vitale',
      step3P1: 'Apa este resursa vitală a oricărei civilizații. În joc ai la dispoziție un puzzle interactiv 4x4 de apeduct.',
      step3P2: 'Apasă pe butonul albastru Apeduct din bara de sus, rotește segmentele de conductă până când apa curge de la izvor la bazinul orașului.',
      step3Reward: '🎉 Recompensă la conectare: +50 Credite Virtuale, +30 Materiale și un bonus permanent de +30% producție la toate fermele!',
      step4Title: '4. Muncă și Moneda Virtuală (V-Credits)',
      step4Badge: 'Activitate Civică',
      step4P1: 'În STUPUL nu există bani reali sau token-uri speculative. Moneda este 100% virtuală (V-Credits), câștigată exclusiv prin merite și muncă în joc.',
      step4P2: 'Deschide meniul Muncă din bara de sus pentru a efectua activități economice (tăiat lemne, agricultură, carieră de piatră, serviciu public la primărie).',
      step4P3: 'Cu creditele adunate poți cumpăra parcele neocupate și le poți dezvolta în cartiere moderne!',
      step5Title: '5. Guvernanță Democratică — Invarianta GENESIS',
      step5Badge: '1 Om = 1 Vot',
      step5P1: 'Principiul fondator suprem: Nimeni nu poate cumpăra putere politică. Averea în joc, parcelele deținute sau cota de acțiuni în firma comercială oferă exact 0 voturi în plus.',
      step5P2: 'Sistemul este Bicameral:',
      step5Chamber1: 'Camera Cetățenilor: 1 om = 1 vot egal pentru politicile și viața orașului.',
      step5Chamber2: 'Camera Contributorilor: Vot bazat pe reputație din lucrări verificate, cu plafon strict de 5% și decay la 45/90 de zile.',
      step5Disclaimer: 'Totul rulează 100% offline în mod oaspete, fără cont obligatoriu și fără urmărire de date!',
    },
    workshop: {
      modalTitle: 'Atelierul Comunității (Community Workshop)',
      subtitle: 'P3 — Dezvoltare descentralizată, acorduri CLA/DCO & recunoaștere merit civic',
      tabProposals: 'Propuneri Publice',
      tabProjects: 'Proiecte & Review Activ',
      tabMerit: 'Registrul Meritelor Civice',
      formTitle: 'Propune o îmbunătățire pentru așezare',
      titlePlaceholder: 'Titlul propunerii (ex: Moară de vânt pe dealul de nord)',
      descPlaceholder: 'Descrie cum această contribuție ajută așezarea și ce resurse civice necesită...',
      dcoLabel: 'Accept Developer Certificate of Origin (DCO) & licențierea comunitară',
      submitBtn: 'Trimite Propunerea',
      consultationHeader: 'Propuneri supuse consultării cetățenești',
      promotedProject: 'Promovat în Proiect',
      author: 'Autor:',
      independenceNotice: 'Garanție de Independență (P3): Niciun membru nu își poate aproba propria muncă (Anti-Self-Review) și nici propria recompensă (Anti-Self-Reward).',
      inTesting: 'În Testare',
      assigned: 'Asignat:',
      reviewer: 'Recenzor:',
      pointsAtDelivery: 'Puncte Civice la recepție',
      meritDesc: 'Punctele civice de merit reflectă contribuții tehnice și civice verificate, supuse regulii de decădere în caz de inactivitate prelungită (Inactivity Decay) și plafonate la maxim 5% per persoană în Camera Contributorilor.',
      thContributor: 'Contributor',
      thWork: 'Muncă Verificată',
      thPoints: 'Puncte Civice',
      thWeight: 'Ponderea Vot Contributor',
      thDco: 'Statut DCO/CLA',
      signedDigital: 'Semnat Digital',
      maxCap: 'Plafon Max',
      footerAutonomy: 'STUPUL GENESIS v3.1 — Autonomie & Guvernanță Comunitară',
      closeWorkshop: 'Închide Atelierul',
    },
    toasts: {
      simStarted: 'Simularea orașului a pornit. Construiește prima ta Casă!',
    },
  },
  en: {
    common: {
      close: 'Close',
      cancel: 'Cancel',
      save: 'Save',
      yes: 'YES',
      no: 'NO',
      credits: 'credits',
      materials: 'materials',
      food: 'food',
      level: 'Level',
      status: 'Status',
      anonymous: 'Guest Mode (Anonymous)',
      dayStep: 'Day / Step:',
      vCreditsTitle: 'STUPUL Virtual Credits (100% virtual, non-convertible to real money)',
      satisfaction: 'satisfaction',
    },
    topbar: {
      stages: {
        frontier_outpost: 'Frontier Outpost',
        wild_west_settlement: 'Wild West Settlement',
        growing_town: 'Growing Town',
        modern_civilisation: 'Prosperous Civilisation',
      },
      pause: 'Pause',
      play: 'Start Simulation',
      step: 'Advance 1 Tick',
      governance: 'Governance',
      aqueduct: 'Aqueduct',
      work: 'Civic Work',
      workshop: 'Workshop',
      guide: 'Guide',
      timeline: 'Timeline',
      audit: 'Audit & Legal',
      shareCity: 'Share Settlement (Civic Link)',
      shareSuccess: 'Civic link copied to clipboard! Share it with your community.',
      shareInfo: 'Settlement link:',
      langToggle: '🇬🇧 EN',
    },
    mission: {
      missionLabel: '🎯 Mission',
      growingTitle: 'Settlement is growing!',
      growingHint: 'Keep building, earning V-Credits, and claiming new parcels.',
      helpTitle: 'HELP THE SETTLEMENT GROW',
      aqueductHint: 'Solve the Aqueduct puzzle to secure fresh drinking water.',
      farmHint: 'Build a Farm to secure food supply.',
      houseHint: 'Collect materials through "Civic Work" and construct a House.',
    },
    tools: {
      house: 'House',
      farm: 'Farm',
      well: 'Well',
      road: 'Road',
      warehouse: 'Barn',
      school: 'School',
      workshop: 'Workshop',
      clinic: 'Clinic',
      guard_post: 'Watchtower',
      upgrade: 'Upgrade',
      demolish: 'Demolish',
      claim: 'Claim Parcel',
      creditsCost: 'credits',
    },
    buildings: {
      house: {
        shortName: 'House',
        name: 'Wooden House',
        description: 'Provides shelter for up to 25 citizens.',
      },
      farm: {
        shortName: 'Farm',
        name: 'Community Farm',
        description: 'Produces 40 units of food per simulation cycle.',
      },
      well: {
        shortName: 'Well',
        name: 'Sweep Water Well',
        description: 'Supplies fresh drinking water within a 3-parcel radius.',
      },
      warehouse: {
        shortName: 'Barn',
        name: 'Barn & Warehouse',
        description: 'Increases resource storage capacity by 250 units.',
      },
      school: {
        shortName: 'School',
        name: 'Public School',
        description: 'Boosts education and labor productivity by 20%.',
      },
      town_hall: {
        shortName: 'Town Hall',
        name: 'Town Hall & Civic Council',
        description: 'The administrative heart and governance center of the town.',
      },
      road: {
        shortName: 'Road',
        name: 'Cobblestone Road',
        description: 'Connects parcels and enhances movement and transit.',
      },
      workshop: {
        shortName: 'Workshop',
        name: 'Artisan Workshop',
        description: 'Produces 25 construction materials per simulation cycle.',
      },
      clinic: {
        shortName: 'Clinic',
        name: 'Medical Clinic',
        description: 'Improves public health and reduces population mortality.',
      },
      guard_post: {
        shortName: 'Watchtower',
        name: 'Watchtower & Safety Post',
        description: 'Ensures civic safety and protection against abuses.',
      },
    },
    inspector: {
      parcelTitle: 'Parcel',
      terrain: 'Terrain:',
      ownershipStatus: 'Ownership Status:',
      publicDomain: 'Public Domain',
      freeParcel: 'Unclaimed (Available)',
      virtualDisclaimer: 'Exclusively in-game virtual property (STP-008)',
      buyParcel: 'Claim Parcel',
      buildFacility: 'Construct a facility:',
      upgradeBtn: 'Upgrade',
      upgradeTitle: 'Upgrade building to next level',
      demolishTitle: 'Demolish building',
    },
    civicTasks: {
      modalTitle: 'Civic Work & Economic Activities',
      disclaimer: 'Earned credits are strictly virtual, usable solely inside STUPUL for parcels and urban growth (no real-world convertibility).',
      farmingTitle: 'Community Farm Labor',
      farmingDesc: 'Help cultivate crops and maintain frontier agriculture.',
      farmingReward: '+15 Food, +8 Virtual Credits',
      woodcuttingTitle: 'Forest Logging',
      woodcuttingDesc: 'Harvest pine and oak logs for construction projects.',
      woodcuttingReward: '+15 Materials, +8 Virtual Credits',
      masonryTitle: 'Stone Quarry & Masonry',
      masonryDesc: 'Extract stone blocks for reinforcing roads and town structures.',
      masonryReward: '+20 Materials, +10 Virtual Credits',
      civicDutyTitle: 'Town Hall Public Service',
      civicDutyDesc: 'Assist with civic registries and organizing council meetings.',
      civicDutyReward: '+12 Virtual Credits',
      rewardLabel: 'Reward:',
      workBtn: 'Work',
    },
    puzzle: {
      title: 'Aqueduct Puzzle: Water Connection',
      description: 'Rotate pipe segments to route water from Spring (top-left) to City Reservoir (bottom-right). A connected network increases farm food production by 30%!',
      solvedTitle: 'Aqueduct Connected! Water is flowing to the reservoir.',
      solvedBonus: 'Active bonus: +30% agricultural production on farms.',
      rotateHint: 'Click segments to rotate 90° clockwise.',
      rotateTitle: 'Rotate segment',
      solvesCount: 'Solves:',
    },
    timeline: {
      title: 'City Historical Log (Append-Only)',
      subtitle: 'Immutable deterministic history (STP-007, STP-100). Current step:',
      noEvents: 'No events recorded yet.',
      initialEvent1: 'Frontier Outpost was founded on the river bank.',
      initialEvent2: 'The first 100 souls settled in the fertile valley.',
    },
    governance: {
      modalTitle: 'STUPUL Democratic Governance',
      tabCitizens: 'Citizens Chamber (1 person = 1 vote)',
      tabContributors: 'Contributors Chamber (90d Merit)',
      tabMayor: 'Mayor & Elections',
      tabLaws: 'Laws & Public Policies',
      govPrinciple: 'Constitutional Principle GOV-001: Every citizen has exactly 1 equal vote. In-game wealth, owned parcels, or shares in commercial entities grant exactly 0 additional votes.',
      activeProposals: 'Active Civic Proposals',
      voteYes: 'Vote YES',
      voteNo: 'Vote NO',
      yesLabel: 'YES:',
      noLabel: 'NO:',
      inVoting: 'Active Vote',
      initiatedBy: 'Initiated by:',
      contributorsRule: 'GOV-010 & GOV-020: Reputation and merit are awarded solely for tested, independently validated contributions. Merit decays to half after 45 days and expires at 90 days. No contributor may hold more than 5% of chamber votes.',
      registryTitle: 'Validated Contributions Registry',
      activeMerit: 'Active Merit',
      acceptedToday: 'Accepted: Today (100% weight)',
      mayorTitle: 'Town Mayor',
      mayorSub: 'Temporary civic mandate (GOV-030)',
      mayorActive: 'Active • Term 1 of max 2',
      holderLabel: 'Mandate Holder:',
      holderVal: 'Citizens Council / Elected Mayor',
      durationLabel: 'Mandate Duration:',
      civicActLabel: 'Civic Activity:',
      civicActVal: 'Verified deliveries up to date',
      recallProc: 'Recall Procedure:',
      recallVal: '30d inactivity + 7d cure period',
      policyTuning: 'Public Policy Settings',
      taxRateLabel: 'Virtual Economic Turnover Tax:',
      taxRateDesc: 'Generates virtual credits for the town budget. Exceeding 20% lowers citizen satisfaction.',
      foodRationLabel: 'Food Rationing Mode:',
      austere: 'Austere (0.7x)',
      standard: 'Standard (1.0x)',
      abundant: 'Abundant (1.4x)',
      educationLabel: 'School & Education Subsidy:',
      fromFund: 'of budget',
    },
    audit: {
      title: 'Audit, Integrity & Founder Royalties (GENESIS v1.1)',
      hashLabel: 'Canonical SHA-256 Integrity Hash:',
      hashSub: 'Verifiable on any machine',
      downloadSnapshot: 'Download JSON Snapshot',
      uploadSnapshot: 'Upload JSON Snapshot',
      snapshotSuccess: 'Snapshot loaded successfully! State integrity has been validated.',
      royaltyModelTitle: 'Contractual 5% Royalty Model (LEG-001)',
      royaltyBadge: 'FIXED 5% OF ELIGIBLE NET',
      royaltyFormula: 'Contractual formula: Gross Receipts minus Taxes/VAT, Refunds, and Direct Processor Fees. Overhead, salaries, and marketing do NOT reduce the eligible base (anti-diversion).',
      gross: 'Gross Receipts (€)',
      taxes: 'Taxes / VAT (€)',
      refunds: 'Refunds (€)',
      processorFees: 'Processor Fees (€)',
      eligibleBase: 'Eligible Net Base:',
      founderRoyalty: 'Founder Royalty (5%):',
      legalGateTitle: 'Legal Gates Status (Fail-Closed):',
      monetizationLocked: 'MONETIZATION STRICTLY LOCKED',
      legalGateDesc: 'Per LEG-T05 and GENESIS v1.1 rules, no real payment rail or tradeable currency may be enabled without cumulative fulfillment of all 6 legal gates (Verified Operator, 5% License executed, Legal/Tax Counsel signoff, GDPR, etc.).',
    },
    tutorial: {
      modalTitle: 'STUPUL Pioneer Guide',
      prev: 'Back',
      next: 'Next',
      start: 'Start Game!',
      step1Title: '1. Welcome to STUPUL — Frontier Outpost',
      step1Badge: 'Dawn of Civilisation',
      step1P1: 'You lead a frontier settlement of pioneers by a wild river. The initial community numbers 100 simulated citizens.',
      step1P2: 'The town evolves across 4 historical stages: Frontier Outpost, Wild West Settlement, Growing Town, and Prosperous Civilisation.',
      step1Tip: '💡 Tip: Use your mouse wheel or +/- buttons to zoom the map, and drag to navigate across the 16x16 parcels.',
      step2Title: '2. Construction & Citizen Needs',
      step2Badge: 'Economy & Resources',
      step2P1: 'The population has 5 core needs: Food, Shelter, Water, Safety, and Education.',
      step2House: 'Wooden Houses: Provide shelter for 25 people per level.',
      step2Farm: 'Community Farms: Produce wheat and food to prevent starvation.',
      step2Well: 'Water Wells: Supply drinking water to neighboring parcels.',
      step2Barn: 'Workshops & Barns: Generate building materials and expand storage.',
      step2Tip: 'Pick any building from the Bottom Toolbar and click an open parcel to build!',
      step3Title: '3. Infrastructure & Aqueduct Puzzle',
      step3Badge: 'Vital Utilities',
      step3P1: 'Water is vital to any civilisation. The game features an interactive 4x4 aqueduct puzzle.',
      step3P2: 'Click the blue Aqueduct button in the top bar, rotate pipe segments until water flows from spring to reservoir.',
      step3Reward: '🎉 Connection Reward: +50 Virtual Credits, +30 Materials, and a permanent +30% production bonus to all farms!',
      step4Title: '4. Work & Virtual Currency (V-Credits)',
      step4Badge: 'Civic Activity',
      step4P1: 'In STUPUL there is no real money or speculative tokens. The currency is 100% virtual (V-Credits), earned solely through merits and gameplay effort.',
      step4P2: 'Open the Civic Work menu from the top bar to perform economic tasks (logging, farming, stone masonry, public service).',
      step4P3: 'Use accumulated credits to purchase unclaimed parcels and develop modern quarters!',
      step5Title: '5. Democratic Governance — GENESIS Invariant',
      step5Badge: '1 Person = 1 Vote',
      step5P1: 'Supreme founding principle: Nobody can buy political power. In-game wealth, owned parcels, or equity in the commercial entity grant exactly 0 additional votes.',
      step5P2: 'The governance system is Bicameral:',
      step5Chamber1: 'Citizens Chamber: 1 person = 1 equal vote on town policies and civic life.',
      step5Chamber2: 'Contributors Chamber: Vote based on reputation from verified work, capped at 5% and decaying at 45/90 days.',
      step5Disclaimer: 'Everything runs 100% offline in guest mode, with no required account and zero tracking!',
    },
    workshop: {
      modalTitle: 'Community Workshop',
      subtitle: 'P3 — Decentralized development, CLA/DCO agreements & civic merit recognition',
      tabProposals: 'Public Proposals',
      tabProjects: 'Projects & Active Review',
      tabMerit: 'Civic Merit Registry',
      formTitle: 'Propose an improvement for the settlement',
      titlePlaceholder: 'Proposal title (e.g., Windmill on the north hill)',
      descPlaceholder: 'Describe how this contribution helps the settlement and what civic resources it needs...',
      dcoLabel: 'I agree to Developer Certificate of Origin (DCO) & community licensing',
      submitBtn: 'Submit Proposal',
      consultationHeader: 'Proposals under civic consultation',
      promotedProject: 'Promoted to Project',
      author: 'Author:',
      independenceNotice: 'Independence Guarantee (P3): No member may review their own work (Anti-Self-Review) nor their own reward (Anti-Self-Reward).',
      inTesting: 'Under Review',
      assigned: 'Assigned:',
      reviewer: 'Reviewer:',
      pointsAtDelivery: 'Civic Points on delivery',
      meritDesc: 'Civic merit points reflect verified technical and civic contributions, subject to Inactivity Decay and capped at max 5% per person in the Contributors Chamber.',
      thContributor: 'Contributor',
      thWork: 'Verified Work',
      thPoints: 'Civic Points',
      thWeight: 'Contributor Vote Share',
      thDco: 'DCO/CLA Status',
      signedDigital: 'Digitally Signed',
      maxCap: 'Max Cap',
      footerAutonomy: 'STUPUL GENESIS v3.1 — Community Autonomy & Governance',
      closeWorkshop: 'Close Workshop',
    },
    toasts: {
      simStarted: 'City simulation started. Build your first House!',
    },
  },
};
