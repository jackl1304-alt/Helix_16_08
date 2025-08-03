import { Router } from 'express';
import { historicalDataService } from '../services/historicalDataService';

const router = Router();

// Einzelnes Dokument abrufen
router.get('/documents/:documentId', async (req, res) => {
  try {
    const { documentId } = req.params;
    
    // Suche Dokument in allen historischen Daten
    const allSources = ['fda_guidance', 'ema_guidelines', 'bfarm_guidance', 'mhra_guidance', 'swissmedic_guidance'];
    
    for (const sourceId of allSources) {
      const documents = await historicalDataService.getHistoricalData(sourceId);
      const document = documents.find(doc => doc.id === documentId || doc.documentId === documentId);
      
      if (document) {
        return res.json(document);
      }
    }
    
    res.status(404).json({ message: 'Dokument nicht gefunden' });
  } catch (error) {
    console.error('Fehler beim Abrufen des Dokuments:', error);
    res.status(500).json({ message: 'Serverfehler beim Abrufen des Dokuments' });
  }
});

// Dokument-Inhalt als Text herunterladen
router.get('/documents/:documentId/download', async (req, res) => {
  try {
    const { documentId } = req.params;
    
    // Suche Dokument in allen historischen Daten
    const allSources = ['fda_guidance', 'ema_guidelines', 'bfarm_guidance', 'mhra_guidance', 'swissmedic_guidance'];
    
    for (const sourceId of allSources) {
      const documents = await historicalDataService.getHistoricalData(sourceId);
      const document = documents.find(doc => doc.id === documentId || doc.documentId === documentId);
      
      if (document) {
        const filename = `${document.documentTitle.replace(/[^a-z0-9]/gi, '_')}.txt`;
        
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        
        return res.json({
          success: true,
          content: document.content,
          contentType: 'application/json',
          filename: filename
        });
      }
    }
    
    res.status(404).json({ message: 'Dokument nicht gefunden' });
  } catch (error) {
    console.error('Fehler beim Herunterladen des Dokuments:', error);
    res.status(500).json({ message: 'Serverfehler beim Herunterladen des Dokuments' });
  }
});

// Dokument in originalem Format öffnen (Weiterleitung zur ursprünglichen URL)
router.get('/documents/:documentId/original', async (req, res) => {
  try {
    const { documentId } = req.params;
    
    // Suche Dokument in allen historischen Daten
    const allSources = ['fda_guidance', 'ema_guidelines', 'bfarm_guidance', 'mhra_guidance', 'swissmedic_guidance'];
    
    for (const sourceId of allSources) {
      const documents = await historicalDataService.getHistoricalData(sourceId);
      const document = documents.find(doc => doc.id === documentId || doc.documentId === documentId);
      
      if (document && document.documentUrl) {
        return res.redirect(document.documentUrl);
      }
    }
    
    res.status(404).json({ message: 'Originaldokument nicht verfügbar' });
  } catch (error) {
    console.error('Fehler beim Öffnen des Originaldokuments:', error);
    res.status(500).json({ message: 'Serverfehler beim Öffnen des Originaldokuments' });
  }
});

export default router;