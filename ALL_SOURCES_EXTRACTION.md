# Universelle Knowledge Article Extraktion - Alle Quellen

## ✅ IMPLEMENTIERT: Universal Knowledge Extractor

### Service: `UniversalKnowledgeExtractor`
- **Dateispeicherort**: `server/services/universalKnowledgeExtractor.ts`
- **API Endpoint**: `POST /api/knowledge/extract-all-sources`
- **Status Endpoint**: `GET /api/knowledge/sources-status`

## 📚 Alle konfigurierten Quellen (13 Quellen):

### 🏥 Medical Journals & Research (4 Quellen)
1. **JAMA Network - Medical Devices Collection**
   - Authority: JAMA Network
   - Region: Global
   - Priority: High
   - URL: https://jamanetwork.com/collections/5738/medical-devices-and-equipment

2. **New England Journal of Medicine - Medical Devices**
   - Authority: NEJM
   - Region: Global
   - Priority: High

3. **The Lancet Digital Health**
   - Authority: The Lancet
   - Region: Global
   - Priority: High

4. **MTD - Medizintechnik Fachartikel**
   - Authority: MTD
   - Region: Germany
   - Priority: Medium

### ⚖️ Regulatory Guidance Sources (5 Quellen)
1. **FDA Guidance Documents - Medical Devices**
   - Authority: FDA
   - Region: USA
   - Priority: High

2. **EMA Guidelines - Medical Devices**
   - Authority: EMA
   - Region: EU
   - Priority: High

3. **BfArM Leitfäden**
   - Authority: BfArM
   - Region: Germany
   - Priority: High

4. **Swissmedic Guidance**
   - Authority: Swissmedic
   - Region: Switzerland
   - Priority: Medium

5. **MHRA Guidance**
   - Authority: MHRA
   - Region: UK
   - Priority: Medium

6. **Johner Institute - Regulatory Knowledge**
   - Authority: Johner Institute
   - Region: Germany
   - Priority: High

### 📋 Technical Standards (2 Quellen)
1. **ISO Standards - Medical Devices**
   - Authority: ISO
   - Region: Global
   - Priority: Medium

2. **IEC Standards - Medical Equipment**
   - Authority: IEC
   - Region: Global
   - Priority: Medium

### 🔍 Legal & Research Databases (1 Quelle)
1. **PubMed - Medical Technology Law**
   - Authority: NCBI
   - Region: Global
   - Priority: Medium

## 🌍 Regional Distribution:
- **Global**: 6 Quellen
- **Germany**: 3 Quellen  
- **USA**: 1 Quelle
- **EU**: 1 Quelle
- **UK**: 1 Quelle
- **Switzerland**: 1 Quelle

## ⭐ High Priority Quellen: 6 von 13

## 🔄 Automatisierte Extraktion:
Jede Quelle wird individuell verarbeitet mit:
- Respektvolle 3-Sekunden Verzögerung zwischen Quellen
- Spezifische Extraktor-Typen für verschiedene Content-Arten
- Automatische Kategorisierung und Tagging
- Duplikate-Erkennung und Überspringen
- Strukturiertes Logging für jede Quelle

## 📊 Erwartete Artikel-Extraktion:
- **JAMA Network**: ~50 Artikel (bereits implementiert)
- **Andere Medical Journals**: ~3 Artikel pro Quelle
- **Regulatory Guidance**: ~2 Artikel pro Quelle  
- **Technical Standards**: ~2 Artikel pro Quelle
- **Legal Database**: ~2 Artikel pro Quelle

**Geschätzt insgesamt**: ~75+ Knowledge Articles aus allen Quellen

## 🎯 Alle Artikel werden automatisch katalogisiert mit:
- Überschrift und vollständiger URL
- Quelle und Autorität
- Region und Kategorie
- Priorität und Tags
- Device Classes und Zusammenfassung