/**
 * Realistic Case Data Generator - Demo Legal Case Enhancement
 * 
 * WICHTIGER HINWEIS: Diese Daten sind SIMULIERT und für Demonstrationszwecke.
 * Nicht für rechtliche Beratung oder echte Gerichtsfälle verwenden.
 * 
 * Generiert realistische, detaillierte Fallinformationen für Legal Cases
 * mit authentisch wirkenden Medizinprodukt-Details und Verfahrensverläufen.
 */

export class RealCaseDataGenerator {
  
  private germanDevices = [
    {
      name: "CardioSecure Stent System",
      manufacturer: "MedTech Deutschland GmbH",
      type: "Cardiac Stent",
      fdaNumber: "K191234",
      issues: ["Stent-Thrombose", "Gefäßverschluss", "Notfall-OP erforderlich"]
    },
    {
      name: "NeuroLink Stimulator",
      manufacturer: "Berlin NeuroTech AG",
      type: "Neurostimulator",
      fdaNumber: "P180045",
      issues: ["Elektrische Fehlfunktion", "Gewebeschädigung", "Permanente Nervenschäden"]
    },
    {
      name: "FlexiJoint Hip Implant",
      manufacturer: "Orthopädie Systeme GmbH",
      type: "Hüftprothese",
      fdaNumber: "K201567",
      issues: ["Metallabrieb", "Gelenkverschleiß", "Revisionsoperation nötig"]
    },
    {
      name: "VisionClear IOL",
      manufacturer: "Augen-Implantate Deutschland",
      type: "Intraokularlinse",
      fdaNumber: "K190876",
      issues: ["Linsentrübung", "Sehverlust", "Netzhautablösung"]
    }
  ];

  private usDevices = [
    {
      name: "TotalCare Insulin Pump",
      manufacturer: "DiabetesTech Corp",
      type: "Insulin Pump",
      fdaNumber: "K182341",
      issues: ["Software malfunction", "Insulin overdose", "Hypoglycemic coma"]
    },
    {
      name: "FlexSpine Disc Replacement",
      manufacturer: "Spinal Solutions Inc",
      type: "Spinal Disc",
      fdaNumber: "P170023",
      issues: ["Device migration", "Nerve compression", "Paralysis risk"]
    },
    {
      name: "HeartFlow Monitor",
      manufacturer: "Cardiac Devices LLC",
      type: "Heart Monitor",
      fdaNumber: "K195432",
      issues: ["False alarms", "Missed arrhythmias", "Cardiac arrest"]
    }
  ];

  private generateGermanCase(caseId: string, caseNumber: string): string {
    const device = this.germanDevices[Math.floor(Math.random() * this.germanDevices.length)];
    const settlementAmount = Math.floor(Math.random() * 800000) + 200000; // 200k-1M EUR
    const injuryType = device.issues[Math.floor(Math.random() * device.issues.length)];
    
    return `
## VOLLSTÄNDIGE FALLREKONSTRUKTION - DEUTSCHE GERICHTSBARKEIT
### ⚠️ HINWEIS: SIMULIERTE DATEN FÜR DEMONSTRATIONSZWECKE ⚠️

### FALLÜBERSICHT
**Aktenzeichen:** ${caseNumber}
**Gericht:** Bundesgerichtshof / Landgericht München
**Entscheidungsdatum:** ${new Date(2021 + Math.floor(Math.random() * 3), Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1).toLocaleDateString('de-DE')}

### BETEILIGTE PARTEIEN

**Kläger:** 
- ${Math.random() > 0.5 ? 'Herr' : 'Frau'} ${['Müller', 'Schmidt', 'Weber', 'Fischer', 'Meyer'][Math.floor(Math.random() * 5)]}
- Alter: ${Math.floor(Math.random() * 40) + 40} Jahre
- Beruf: ${['Ingenieur', 'Lehrer', 'Krankenpfleger', 'Verkäufer', 'Beamter'][Math.floor(Math.random() * 5)]}

**Beklagte:**
- ${device.manufacturer}
- Medizinproduktehersteller mit Sitz in Deutschland
- Jahresumsatz: ${Math.floor(Math.random() * 500) + 100} Millionen EUR

### MEDIZINPRODUKT DETAILS

**Produktname:** ${device.name}
**Typ:** ${device.type}
**FDA-Nummer:** ${device.fdaNumber}
**Zulassungsdatum:** ${new Date(2018 + Math.floor(Math.random() * 3), Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1).toLocaleDateString('de-DE')}

**Bekannte Probleme:**
${device.issues.map(issue => `- ${issue}`).join('\n')}

### SCHADENSVERLAUF

**Implantationsdatum:** ${new Date(2020, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1).toLocaleDateString('de-DE')}

**Komplikationen aufgetreten:** ${new Date(2021, Math.floor(Math.random() * 6) + 3, Math.floor(Math.random() * 28) + 1).toLocaleDateString('de-DE')}

**Hauptverletzung:** ${injuryType}

**Behandlungskosten:** ${Math.floor(settlementAmount * 0.3).toLocaleString('de-DE')} EUR

**Nachbehandlung erforderlich:** ${Math.random() > 0.5 ? 'Ja, lebenslang' : 'Ja, weitere 2-3 Jahre'}

### RECHTLICHE BEWERTUNG

**Produkthaftung:** Verschuldensunabhängige Haftung nach §1 ProdHaftG
**Vertragsrecht:** Verletzung der Verkehrssicherungspflicht
**Schadensersatz:** Schmerzensgeld und Verdienstausfall

### VERGLEICHSVERHANDLUNGEN

**Erstes Angebot Beklagte:** ${Math.floor(settlementAmount * 0.4).toLocaleString('de-DE')} EUR
**Forderung Kläger:** ${Math.floor(settlementAmount * 1.2).toLocaleString('de-DE')} EUR
**Finaler Vergleich:** ${settlementAmount.toLocaleString('de-DE')} EUR

### URTEILSSPRUCH

Das Gericht erkannte auf Zahlung von **${settlementAmount.toLocaleString('de-DE')} EUR** Schadensersatz zuzüglich Zinsen und Verfahrenskosten.

**Begründung:** Der Beklagte hat seine Verkehrssicherungspflicht verletzt, indem das Medizinprodukt ${device.name} schwerwiegende Gesundheitsschäden verursachte. Die Konstruktionsmängel waren zum Zeitpunkt des Inverkehrbringens erkennbar.

### AUSWIRKUNGEN AUF DIE BRANCHE

- Verschärfte Qualitätskontrollen für ${device.type}
- BfArM-Untersuchung eingeleitet
- Rückruf von ${Math.floor(Math.random() * 5000) + 1000} Geräten empfohlen
`;
  }

  private generateUSCase(caseId: string, caseNumber: string): string {
    const device = this.usDevices[Math.floor(Math.random() * this.usDevices.length)];
    const settlementAmount = Math.floor(Math.random() * 2000000) + 500000; // $500k-2.5M
    const injuryType = device.issues[Math.floor(Math.random() * device.issues.length)];
    
    return `
## COMPREHENSIVE CASE RECONSTRUCTION - US FEDERAL JURISDICTION
### ⚠️ NOTE: SIMULATED DATA FOR DEMONSTRATION PURPOSES ⚠️

### CASE OVERVIEW
**Case Number:** ${caseNumber}
**Court:** U.S. District Court for the ${['Eastern', 'Western', 'Northern', 'Southern'][Math.floor(Math.random() * 4)]} District of ${['California', 'Texas', 'New York', 'Florida'][Math.floor(Math.random() * 4)]}
**Decision Date:** ${new Date(2021 + Math.floor(Math.random() * 3), Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1).toLocaleDateString('en-US')}

### PARTIES INVOLVED

**Plaintiff:** 
- ${['John', 'Jane', 'Michael', 'Sarah', 'David'][Math.floor(Math.random() * 5)]} ${['Johnson', 'Williams', 'Brown', 'Davis', 'Miller'][Math.floor(Math.random() * 5)]}
- Age: ${Math.floor(Math.random() * 40) + 35} years
- Occupation: ${['Engineer', 'Teacher', 'Nurse', 'Manager', 'Consultant'][Math.floor(Math.random() * 5)]}

**Defendant:**
- ${device.manufacturer}
- Medical device manufacturer
- Annual Revenue: $${Math.floor(Math.random() * 800) + 200} million

### MEDICAL DEVICE DETAILS

**Product Name:** ${device.name}
**Type:** ${device.type}
**FDA Number:** ${device.fdaNumber}
**Approval Date:** ${new Date(2018 + Math.floor(Math.random() * 3), Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1).toLocaleDateString('en-US')}

**Known Issues:**
${device.issues.map(issue => `- ${issue}`).join('\n')}

### INCIDENT TIMELINE

**Implantation Date:** ${new Date(2020, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1).toLocaleDateString('en-US')}

**Complications Occurred:** ${new Date(2021, Math.floor(Math.random() * 6) + 3, Math.floor(Math.random() * 28) + 1).toLocaleDateString('en-US')}

**Primary Injury:** ${injuryType}

**Medical Costs:** $${Math.floor(settlementAmount * 0.4).toLocaleString('en-US')}

**Ongoing Treatment Required:** ${Math.random() > 0.5 ? 'Lifetime monitoring' : 'Additional 2-3 years'}

### LEGAL ANALYSIS

**Product Liability:** Strict liability under state law
**Negligence:** Failure to warn of known risks
**Damages:** Pain and suffering, lost wages, medical expenses

### SETTLEMENT NEGOTIATIONS

**Initial Defendant Offer:** $${Math.floor(settlementAmount * 0.3).toLocaleString('en-US')}
**Plaintiff Demand:** $${Math.floor(settlementAmount * 1.4).toLocaleString('en-US')}
**Final Settlement:** $${settlementAmount.toLocaleString('en-US')}

### COURT RULING

The court awarded **$${settlementAmount.toLocaleString('en-US')}** in damages plus legal fees and costs.

**Reasoning:** Defendant failed to adequately test and warn about the risks associated with the ${device.name}. The design defect was a substantial factor in causing plaintiff's injuries.

### INDUSTRY IMPACT

- Enhanced FDA oversight for ${device.type}
- Class II recall issued for ${Math.floor(Math.random() * 10000) + 2000} devices
- New safety protocols mandated
`;
  }

  public generateDetailedCaseContent(caseId: string, caseNumber: string, jurisdiction: string, title: string): string {
    // Extract case type from ID or caseNumber
    if (jurisdiction.includes('DE') || jurisdiction.includes('CH')) {
      return this.generateGermanCase(caseId, caseNumber);
    } else if (jurisdiction.includes('US')) {
      return this.generateUSCase(caseId, caseNumber);
    } else {
      // International or EU cases - use English format
      return this.generateUSCase(caseId, caseNumber);
    }
  }
}

export const realCaseDataGenerator = new RealCaseDataGenerator();