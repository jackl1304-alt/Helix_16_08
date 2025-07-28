# Helix - Vollständige Datenquellen & API Dokumentation
*Stand: 28. Juli 2025 - Umfassende Recherche für Regulatory Intelligence Platform*

## 🇺🇸 USA - FDA (Food and Drug Administration)

### **openFDA API** (Primäre Quelle)
- **Base URL**: `https://api.fda.gov/`
- **Authentifizierung**: Keine erforderlich für Standard-Endpunkte
- **Rate Limits**: Standard-Rate-Limiting aktiviert
- **Datenformat**: JSON mit Metadaten

#### Medizinprodukte-Endpunkte:
```javascript
// 510(k) Clearances
https://api.fda.gov/device/510k.json
// PMA (Premarket Approval)
https://api.fda.gov/device/pma.json
// Device Classification
https://api.fda.gov/device/classification.json
// Recall Enforcement
https://api.fda.gov/device/enforcement.json
// Adverse Events
https://api.fda.gov/device/event.json
// Registration & Listing
https://api.fda.gov/device/registrationlisting.json
// UDI (Unique Device Identifier)
https://api.fda.gov/device/udi.json
```

#### Code-Beispiel:
```javascript
// Genehmigte PMA Devices
const response = await fetch(
  'https://api.fda.gov/device/pma.json?search=decision_code:APPR&limit=10'
);
const data = await response.json();

// 510(k) Clearances nach Produktcode
const clearances = await fetch(
  'https://api.fda.gov/device/510k.json?search=product_code:LWP&limit=5'
);
```

### **AccessGUDID API**
- **URL**: `https://accessgudid.nlm.nih.gov/`
- **Zweck**: Global Unique Device Identification Database
- **Features**: RSS-Feeds und APIs verfügbar

### **FDA Data Dashboard API** (Authentifizierung erforderlich)
- **Authentifizierung**: Authorization-User und Authorization-Key
- **Anmeldung**: Über OII Unified Logon Application
- **Methode**: HTTP POST mit JSON Body
- **TLS**: TLS 1.2 erforderlich

---

## 🇪🇺 Europa - EMA (European Medicines Agency)

### **Wichtiger Hinweis**: EMA reguliert **Arzneimittel**, nicht Medizinprodukte
- Medizinprodukte fallen unter MDR (Medical Device Regulation)
- Daten in EUDAMED (European Database on Medical Devices)

### **Verfügbare EMA APIs**:

#### 1. **Download Medicine Data Tables**
- **Direkter Download**: Excel-Tabellen mit detaillierten Arzneimitteldaten
- **Update**: Nächtlich aktualisiert
- **Datentypen**: Zulassungen, Post-Authorization-Verfahren
- **Zugang**: Öffentlich, kein API-Schlüssel erforderlich
- **URL**: `https://www.ema.europa.eu/en/medicines/download-medicine-data`

#### 2. **Electronic Product Information (ePI) API**
- **Zweck**: Zugang zu elektronischen Produktinformationen
- **Status**: Pilotphase abgeschlossen (August 2024)
- **Zugang**: API für ePIs verfügbar

#### 3. **Union Product Database API** (Veterinärmedizin)
- **Bereich**: Nur Tierarzneimittel
- **Zugang**: API für Machine-to-Machine-Kommunikation
- **Status**: Operativ seit Juli 2021

---

## 🇩🇪 Deutschland - BfArM (Bundesinstitut für Arzneimittel und Medizinprodukte)

### **DMIDS** (Deutsches Medizinprodukte-Informations- und Datenbanksystem)
- **URL**: `https://www.bfarm.de/EN/Medical-devices/Portals/DMIDS/`
- **Zweck**: Marktüberwachung von Medizinprodukten
- **Sprache**: Nur Deutsch verfügbar
- **Update**: Neue Version seit 1. Juli 2025

#### **Verfügbare Datenbanken** (Kostenpflichtig):
1. **Medical Devices Notifications (MPA)**
   - Erstinverkehrbringung-Meldungen (§25 MPG/§96 MPDG)
   - UMDNS-Klassifikation
2. **In Vitro Diagnostic Medical Devices (MPIVDA)**
3. **Adressdatenbanken** (MPADOE, MPADC)

#### **Preisstruktur**:
- Wöchentliche Pauschalen verfügbar
- Jährliche Pauschalen verfügbar
- 19% deutsche MwSt. (ab 2021)
- Online-Buchung mit sofortigem Zugang

#### **Zugriffsmethoden**:
- **Web-Interface**: Login-basiertes System
- **Keine REST API**: System nutzt Web-Formulare
- **Browser-Anforderungen**: Firefox, Chrome, Edge
- **Sicherheit**: TLS-Verschlüsselung erforderlich

---

## 🇬🇧 Vereinigtes Königreich - MHRA (Medicines and Healthcare products Regulatory Agency)

### **DORS** (Device Online Registration System)
- **URL**: `https://www.gov.uk/guidance/register-medical-devices-to-place-on-the-market`
- **Zweck**: Primäre Plattform für Medizinprodukt-Zulassungen
- **Erforderlich**: Alle Medizinprodukte vor UK-Markteinführung
- **UKCA-Kennzeichnung**: Ersetzt CE-Kennzeichnung für UK-Markt

### **MORE Portal** (Manufacturer's Online Reporting Environment)
- **Zweck**: Vigilance & Post-Market Surveillance
- **API-Integration**: Verfügbar für automatisierte Einreichungen
- **Kontakt**: `AIC@mhra.gov.uk` für API-Setup
- **Neue Anforderungen**: Seit 16. Juni 2025

#### **API-Zugang**:
```
Production API Guide: gov.uk/government/publications/more-platform-api-application-programming-interface-set-up-user-reference-guide
Setup: Email an AIC@mhra.gov.uk
Daten-Schemas: Aktualisiert für GB-Einreichungen
```

### **Zulassungsverfahren nach Geräteklasse**:
- **Klasse I**: Selbstzertifizierung möglich
- **Klasse IIa/IIb/III**: UK Approved Body (UKAB) erforderlich

### **Internationale Anerkennung** (2025):
- TGA (Australien)
- Health Canada
- EU/EEA
- USA (FDA)

---

## 🇨🇭 Schweiz - Swissmedic

### **Swissdamed Database**
- **Status**: Erste Module seit 6. August 2024
- **Actors Module**: Online-Registrierung für Wirtschaftsakteure
- **Device Registration Module**: Geplant für 2025
- **Obligatorische Registrierung**: Ab 1. Juli 2026

### **Regulatorische Updates 2024-2025**:

#### **API-Leitlinien** (Januar 2024):
- Aktualisierte Guidance für Active Pharmaceutical Ingredients
- Zusätzliche Dokumentation für komplexe APIs

#### **IVD-Updates** (Januar 2025):
- EU-Übergangszeiten in IvDO-Verordnung übernommen
- Vereinfachte Kennzeichnungsanforderungen

#### **Vigilance Reporting** (November 2025):
- Neues MIR-Formular v7.3.1 obligatorisch
- Elektronische Einreichung: `materiovigilance@swissmedic.ch`

### **Implementierungs-Timeline**:
| Datum | Anforderung |
|-------|-------------|
| 6. Aug 2024 | Swissdamed Actors Modul aktiv |
| 1. Jan 2025 | IVD-Verordnungs-Updates |
| 2025 | Device Registration (freiwillig) |
| Nov 2025 | Neues MIR-Formular obligatorisch |
| 1. Juli 2026 | Device Registration obligatorisch |

---

## 🇯🇵 Japan - PMDA (Pharmaceuticals and Medical Devices Agency)

### **Offizielle PMDA-Quellen**:
- **Hauptwebsite**: `https://www.pmda.go.jp/english/`
- **Sprache**: Englische Bereiche begrenzt im Vergleich zu Japanisch

### **Datenbank-Zugriffspunkte**:

#### 1. **Approved Products Database**
- **URL**: `https://www.pmda.go.jp/english/review-services/reviews/approved-information/drugs/0002.html`
- **Inhalt**: Zugelassene Arzneimittel, Medizinprodukte, regenerative Medizinprodukte
- **Format**: Jahresberichte mit detaillierten Zulassungsdaten

#### 2. **Regulatory Information Portal**
- **URL**: `https://www.pmda.go.jp/english/review-services/regulatory-info/0002.html`
- **Inhalt**: Leitlinien, Mitteilungen, administrative Hinweise
- **Standards**: Medizinprodukte-Standards und Kriterien

#### 3. **Medical Device Regulations**
- **URL**: `https://www.pmda.go.jp/english/review-services/reviews/0004.html`
- **Klassifikation**: Geräteklassifikationssystem (Klasse I-IV)
- **Liste**: Registrierte Zertifizierungsstellen

### **Wichtiger Hinweis**: 
**Keine öffentliche API verfügbar** - PMDA bietet keine programmgesteuerten APIs. Alle Datenzugriffe erfolgen über die Website-Oberfläche.

### **Alternative Datenquellen**:
- **PubChem Integration**: `https://pubchem.ncbi.nlm.nih.gov/source/26624`
- **Drittanbieter-Regulatory Intelligence**: Global Regulatory Partners

---

## 🇨🇳 China - NMPA (National Medical Products Administration)

### **Offizielle NMPA-Ressourcen**:
- **Hauptwebsite**: `https://english.nmpa.gov.cn/`
- **Datenbank-Portal**: `http://english.nmpa.gov.cn/database.html`

### **Verfügbare Datenbanken**:

#### 1. **UDI Database** (Unique Device Identification)
- **Zweck**: Suche nach zugelassenen Medizinprodukten
- **Suchoptionen**: UDI-Codes, Produktnamen, Firmennamen
- **API-Zugang**: Verfügbar für NMPA Legal Agents, Unternehmen und medizinische Institute
- **Features**:
  - Schnellsuche nach Produktname, Firmenname oder UDI-Code
  - Erweiterte Suche mit komplexer Filterung
  - Download-Ergebnisse in Batch-Formaten (täglich, wöchentlich, monatlich)
  - Echtzeit-Updates registrierter Medizinproduktinformationen

#### 2. **Medical Device Registration Database**
- **Klassifikationen**: Klasse I, II und III (aufsteigende Risikostufen)
- **Suchfunktionen**: 
  - Registrierungszertifikat-Status
  - Geräteklassifikations-Lookup
  - Zugelassene Produktlisten

### **Registrierungsanforderungen nach Klasse**:
| Geräteklasse | Registrierungsverfahren | Klinische Studien | Testanforderungen |
|--------------|-------------------------|-------------------|-------------------|
| **Klasse I** | Vereinfachte Meldung | Nicht erforderlich | Basisdokumentation |
| **Klasse II** | Vollständiges Registrierungsdossier | Möglicherweise erforderlich | In-Country-Tests erforderlich |
| **Klasse III** | Umfassende Prüfung | Meist erforderlich | Umfangreiche Tests + klinische Daten |

### **API-Integration für Entwickler**:
1. **UDI Database API**: Direkte Integration für Geräte-Lookup
2. **Registrierungsstatus-Abfragen**: Programmgesteuerte Statusprüfungen
3. **Daten-Sharing-Services**: Bulk-Datenzugang für autorisierte Einrichtungen

---

## 🇮🇳 Indien - CDSCO (Central Drugs Standard Control Organisation)

### **Offizielle CDSCO-Plattformen**:
- **Hauptportal**: `https://cdsco.gov.in/opencms/opencms/en/Home/`
- **Hauptsitz**: FDA Bhawan, Kotla Road, New Delhi 110002

### **Online-Systeme**:

#### 1. **SUGAM Portal**
- **URL**: `https://cdscoonline.gov.in/CDSCO/homepage`
- **Vollständiger Name**: System for Unmanned Gateways Approval of Manufacturers
- **Start**: Januar 2016
- **Features**:
  - Elektronische Antragseinreichung für Arzneimittel, Kosmetika und Medizinprodukte
  - Echtzeit-Antrags-Tracking
  - Dokument-Upload und -verwaltung
  - Direkte Kommunikation mit CDSCO-Beamten
  - Zahlungsabwicklung

#### 2. **Medical Device Portal**
- **URL**: `https://cdscomdonline.gov.in/`
- **Zweck**: Dediziertes Portal für Medizinprodukt-Anträge
- **Login**: SUGAM-Anmeldedaten verwendbar

#### 3. **Approved Devices Database**
- **Liste**: 21.277 zugelassene Medizinprodukte
- **URL**: `https://cdscomdonline.gov.in/NewMedDev/ListOfApprovedDevices`
- **Zweck**: Suche nach Prädikat-Geräten für Äquivalenznachweis

### **Antragsformulare & Verfahren**:
- **Form MD-14**: Klasse A/B Medizinprodukte
- **Form MD-15**: Klasse C/D Medizinprodukte
- **Form MD-18**: Import von Prüfgeräten
- **Form MD-22/MD-23**: Genehmigungen für klinische Prüfungen

### **Zulassungszeitrahmen**:
- **Klasse A/B**: 3-6 Monate
- **Klasse C/D**: 6-12 Monate (mit technischer Prüfung)
- **Lizenzgültigkeit**: 5 Jahre mit Wartungsgebühren

### **API-Status**: 
**Aktuell keine öffentlichen APIs verfügbar** - System ist webportal-basiert, nicht API-gesteuert.

---

## 🇧🇷 Brasilien - ANVISA (Agência Nacional de Vigilância Sanitária)

### **Wichtige regulatorische Änderungen 2024-2025**:

#### **RDC 848/2024** - Essential Safety & Performance Requirements (ESPR)
- **Veröffentlicht**: 6. März 2024
- **Wirksam**: 4. September 2024
- **Ersetzt**: RDC 546/2021
- **Hauptausweitung**: Gilt nun für Medizinprodukte UND IVDs

**Hauptanforderungen**:
- Obligatorische ESPR-Checklisten für technische Dokumentation
- Erweiterte Software-Anforderungen für SaMD
- Spezifische Bestimmungen für Laien-Geräte
- Verstärkte Cybersecurity-Anforderungen
- Klinische Bewertungsanforderungen nach IMDRF-Standards

#### **RDC 830/2023** - IVD Medical Devices Regulation
- **Veröffentlicht**: Dezember 2023
- **Wirksam**: 1. Juni 2024
- **Auswirkung**: Wesentliche Änderungen am IVD-Klassifikationssystem
- **Übergangsfrist**: 365 Tage ab 1. Juni 2024

#### **RDC 850/2024** (20. März 2024):
- Verlängert Brasilien-GMP-Zertifikate von 2 auf 4 Jahre für MDSAP-Hersteller
- **Wirksam**: 1. April 2024

#### **IN 290/2024** (8. April 2024):
- Ermöglicht Nutzung ausländischer Regulierungsgenehmigungen
- **Anwendbar**: Klasse III & IV Geräte
- **Akzeptierte Behörden**: TGA (Australien), Health Canada, US FDA, Japan MHLW
- **Wirksam**: 3. Juni 2024

### **ANVISA 2024-2025 Regulatorische Agenda**:
**Aktuelle Agenda umfasst 172 Themen**:
- 11 abgeschlossen
- 89 in Bearbeitung
- 50 nicht begonnen

**Prioritäts-Medizinprodukte-Themen**:
1. E-Labeling-Gesetzgebung für Laien-Geräte
2. Medizinprodukte-Wiederaufbereitungsverordnungen
3. INMETRO-Zertifizierungsregel-Updates
4. Risikobasierte Ansatz-Implementierung
5. Cybersecurity-Bewertungsanforderungen

### **Internationale Harmonisierung**:
- **IMDRF-Harmonisierung**: RDC 848/2024 entspricht IMDRF/GRRP WG/N47FINAL: 2018
- **Mercosur-Integration**: Integriert Mercosur-Technische Verordnung
- **EU MDR-Angleichung**: Klassifikationsregeln nahezu identisch mit EU MDR 2017/745

---

## 📊 ISO Standards für Medizinprodukte

### **Offizieller Zugang**:

#### **ISO Store** (Primäre offizielle Quelle)
- **Website**: `https://www.iso.org/store.html`
- **Methode**: Direktkauf von ISO oder autorisierten nationalen Mitgliedsgremien
- **Formate**: Digitales PDF, Hardcopy
- **Bundle**: ISO 13485:2016 + ISO 14971:2019 + praktische Leitfäden
- **Kosten**: Standards sind kostenpflichtige Publikationen

#### **Autorisierte Wiederverkäufer**:
**Intertek Inform US**
- **Website**: `https://www.intertekinform.com/en-us/`
- **Abdeckung**: 1,6 Millionen Standards von 360+ Herausgebern
- **Features**: Suchen, kaufen, zentralisierte Verwaltungsplattform

### **Wichtige Medizinprodukte-Standards**:
- **ISO 13485:2016** - Qualitätsmanagementsysteme für Medizinprodukte
- **ISO 14971:2019** - Risikomanagement für Medizinprodukte
- **ISO 10993 Serie** - Biokompatibilitätsbewertung
- **IEC 62304** - Medizinprodukte-Software-Lebenszyklusprozesse

### **Kostenstruktur**:
- Einzelstandards: Typischerweise $100-300 pro Standard
- Bundle-Pakete: Kosteneffektiv für mehrere verwandte Standards
- Enterprise-Lizenzierung: Verfügbar für Organisationen mit breitem Bedarf

---

## 🔧 Implementierungsempfehlungen für Helix

### **Priorität 1 - Sofort implementierbar**:
1. **FDA openFDA API** - Keine Authentifizierung, vollständige Dokumentation
2. **EMA Medicine Data Tables** - Täglich aktualisierte Excel-Downloads
3. **ISO Standards** - Über autorisierte Wiederverkäufer

### **Priorität 2 - Authentifizierung erforderlich**:
1. **MHRA MORE Portal API** - Kontakt: AIC@mhra.gov.uk
2. **NMPA UDI Database API** - Für autorisierte Einrichtungen
3. **FDA Data Dashboard API** - Über OII Unified Logon

### **Priorität 3 - Kostenpflichtig/Komplex**:
1. **BfArM DMIDS** - Kostenpflichtige Pauschalen
2. **Swissdamed** - Ab 2025 verfügbar
3. **CDSCO SUGAM** - Web-Portal-basiert

### **Empfohlene Integration-Architektur**:
```javascript
// Helix Data Source Manager
const dataSources = {
  fda: {
    baseUrl: 'https://api.fda.gov/',
    auth: false,
    endpoints: ['device/510k', 'device/pma', 'device/classification']
  },
  ema: {
    baseUrl: 'https://www.ema.europa.eu/en/medicines/download-medicine-data',
    auth: false,
    format: 'excel'
  },
  mhra: {
    baseUrl: 'https://more.mhra.gov.uk/api/',
    auth: true,
    contact: 'AIC@mhra.gov.uk'
  }
};
```

---

## 📈 Nächste Schritte für vollständige Integration

1. **API-Schlüssel beantragen** für authentifizierte Services
2. **Rechtliche Prüfung** für Datennutzungsrechte
3. **Pilot-Integration** mit FDA openFDA API starten
4. **Datenbank-Schema** für Multi-Source-Integration erweitern
5. **Monitoring-System** für Datenqualität und -aktualität implementieren

Diese Dokumentation bietet eine vollständige Übersicht aller verfügbaren offiziellen Datenquellen für das Helix Regulatory Intelligence System.