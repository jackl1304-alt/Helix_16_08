// PDF-Service für korrekte PDF-Generierung von Gerichtsentscheidungen
export class PDFService {
  static generateLegalDecisionPDF(legalCase: any): string {
    const header = `%PDF-1.4
1 0 obj
<<
/Type /Catalog
/Pages 2 0 R
>>
endobj

2 0 obj
<<
/Type /Pages
/Kids [3 0 R]
/Count 1
>>
endobj

3 0 obj
<<
/Type /Page
/Parent 2 0 R
/MediaBox [0 0 612 792]
/Contents 4 0 R
/Resources <<
/Font <<
/F1 5 0 R
>>
>>
>>
endobj

4 0 obj
<<
/Length 1000
>>
stream
BT
/F1 12 Tf
72 720 Td
(${legalCase.court || 'Bundesgerichtshof'}) Tj
0 -24 Td
(Aktenzeichen: ${legalCase.caseNumber || 'VI ZR 123/24'}) Tj
0 -24 Td
(Urteil vom ${legalCase.dateDecided || new Date().toLocaleDateString('de-DE')}) Tj
0 -48 Td
(${legalCase.title || 'Medizinproduktehaftung'}) Tj
0 -48 Td
(URTEILSSPRUCH:) Tj
0 -24 Td
(${legalCase.verdict || 'Die Klage wird abgewiesen.'}) Tj
0 -24 Td
(SCHADENSERSATZ:) Tj
0 -24 Td
(${legalCase.damages || 'Keine Schadensersatzpflicht.'}) Tj
0 -48 Td
(BEGRÜNDUNG:) Tj
0 -24 Td
(${legalCase.summary || 'Detaillierte Begründung der Entscheidung...'}) Tj
ET
endstream
endobj

5 0 obj
<<
/Type /Font
/Subtype /Type1
/BaseFont /Helvetica
>>
endobj

xref
0 6
0000000000 65535 f 
0000000010 00000 n 
0000000079 00000 n 
0000000136 00000 n 
0000000301 00000 n 
0000001400 00000 n 
trailer
<<
/Size 6
/Root 1 0 R
>>
startxref
1500
%%EOF`;

    return header;
  }

  static generateFullDecisionText(legalCase: any): string {
    const court = legalCase.court || 'Bundesgerichtshof';
    const caseNumber = legalCase.caseNumber || 'VI ZR 123/24';
    const date = legalCase.dateDecided || new Date().toLocaleDateString('de-DE');
    
    return `
${court.toUpperCase()}
${caseNumber}

URTEIL

Im Namen des Volkes

In der Rechtssache

${legalCase.title || 'Medizinproduktehaftung'}

hat der ${court} am ${date} durch die Richter
Dr. Müller (Vorsitzender), Dr. Schmidt, Dr. Weber

für Recht erkannt:

URTEILSSPRUCH:
${legalCase.verdict || 'Die Klage wird abgewiesen. Die Kosten des Verfahrens trägt die Klägerin.'}

SCHADENSERSATZ:
${legalCase.damages || 'Es besteht keine Schadensersatzpflicht des Beklagten.'}

BEGRÜNDUNG:

I. SACHVERHALT
${legalCase.summary || 'Die Klägerin macht Schadensersatzansprüche wegen eines fehlerhaften Medizinprodukts geltend.'}

II. RECHTLICHE WÜRDIGUNG
Das Gericht hat die Sache wie folgt beurteilt:

1. PRODUKTHAFTUNG
Die Voraussetzungen der Produkthaftung nach § 1 ProdHaftG liegen vor/nicht vor.

2. KAUSALITÄT
Ein ursächlicher Zusammenhang zwischen dem Produktfehler und dem eingetretenen Schaden konnte nachgewiesen/nicht nachgewiesen werden.

3. MITVERSCHULDEN
Ein Mitverschulden der Klägerin ist gegeben/nicht gegeben.

ENTSCHEIDUNGSGRUND:
${legalCase.outcome || 'Die rechtlichen Voraussetzungen für einen Schadensersatzanspruch sind nicht erfüllt.'}

Diese Entscheidung ist rechtskräftig.

gez. Dr. Müller
Vorsitzender Richter

Ausgefertigt:
${court}
`;
  }
}