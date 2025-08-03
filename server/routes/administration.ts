import { Router } from 'express';
import fs from 'fs/promises';
import path from 'path';
import archiver from 'archiver';
import type { Request, Response } from 'express';

const router = Router();

// Get development phases
router.get('/development-phases', async (req: Request, res: Response) => {
  try {
    // Return development phases data
    const phases = [
      {
        id: 'phase1',
        name: 'Phase 1: System-Grundlagen',
        description: 'Grundlegende Systemarchitektur und Core-Funktionalitäten',
        status: 'completed',
        progress: 100,
        startDate: '2025-07-15T00:00:00Z',
        completedDate: '2025-07-31T00:00:00Z',
        estimatedDuration: '2 Wochen',
        tasks: [
          {
            id: 'p1-t1',
            name: 'Datenbank-Schema erstellen',
            description: 'PostgreSQL Schema für Knowledge Base, Legal Cases und Regulatory Updates',
            status: 'completed',
            category: 'database',
            priority: 'high'
          },
          {
            id: 'p1-t2',
            name: 'Backend API Grundgerüst',
            description: 'Express.js Server mit TypeScript und Drizzle ORM',
            status: 'completed',
            category: 'backend',
            priority: 'high'
          },
          {
            id: 'p1-t3',
            name: 'Frontend Basis-Setup',
            description: 'React mit TypeScript und Tailwind CSS',
            status: 'completed',
            category: 'frontend',
            priority: 'high'
          },
          {
            id: 'p1-t4',
            name: 'Authentication System',
            description: 'Replit OpenID Connect Integration',
            status: 'completed',
            category: 'backend',
            priority: 'medium'
          }
        ]
      },
      {
        id: 'phase2',
        name: 'Phase 2: Data Collection & AI',
        description: 'Automatisierte Datensammlung und KI-gestützte Analyse',
        status: 'completed',
        progress: 95,
        startDate: '2025-07-31T00:00:00Z',
        completedDate: '2025-08-01T00:00:00Z',
        estimatedDuration: '1 Woche',
        tasks: [
          {
            id: 'p2-t1',
            name: 'Universal Knowledge Extractor',
            description: '13 internationale Datenquellen Integration',
            status: 'completed',
            category: 'backend',
            priority: 'high'
          },
          {
            id: 'p2-t2',
            name: 'JAMA Network Integration',
            description: 'Spezielle Integration für medizinische Fachartikel',
            status: 'completed',
            category: 'backend',
            priority: 'high'
          },
          {
            id: 'p2-t3',
            name: 'Knowledge Base Frontend',
            description: 'Benutzeroberfläche für Knowledge Articles',
            status: 'completed',
            category: 'frontend',
            priority: 'medium'
          },
          {
            id: 'p2-t4',
            name: 'AI Content Analysis',
            description: 'Automatische Kategorisierung und Bewertung',
            status: 'in-progress',
            category: 'backend',
            priority: 'medium'
          }
        ]
      },
      {
        id: 'phase3',
        name: 'Phase 3: Production & Optimization',
        description: 'Production-Deployment und Performance-Optimierung',
        status: 'in-progress',
        progress: 85,
        startDate: '2025-08-01T00:00:00Z',
        estimatedDuration: '1 Woche',
        tasks: [
          {
            id: 'p3-t1',
            name: 'Production Deployment',
            description: 'Replit Deployment mit Custom Domain',
            status: 'completed',
            category: 'deployment',
            priority: 'high'
          },
          {
            id: 'p3-t2',
            name: 'Performance Monitoring',
            description: 'Winston Logging und Health Checks',
            status: 'completed',
            category: 'backend',
            priority: 'high'
          },
          {
            id: 'p3-t3',
            name: 'Security Hardening',
            description: 'Rate Limiting, Input Validation, HTTPS',
            status: 'completed',
            category: 'backend',
            priority: 'high'
          },
          {
            id: 'p3-t4',
            name: 'Documentation Suite',
            description: 'Umfassende System-Dokumentation',
            status: 'completed',
            category: 'backend',
            priority: 'medium'
          },
          {
            id: 'p3-t5',
            name: 'Administration Panel',
            description: 'Phase-Management und System-Administration',
            status: 'completed',
            category: 'frontend',
            priority: 'medium'
          },
          {
            id: 'p3-t6',
            name: 'Advanced Analytics',
            description: 'Dashboard-Optimierung und Reporting',
            status: 'in-progress',
            category: 'frontend',
            priority: 'medium'
          },
          {
            id: 'p3-t7',
            name: 'User Experience Polish',
            description: 'UI/UX Verbesserungen und Mobile Optimierung',
            status: 'pending',
            category: 'frontend',
            priority: 'low'
          }
        ]
      }
    ];

    res.json(phases);
  } catch (error) {
    console.error('Error fetching development phases:', error);
    res.status(500).json({ error: 'Failed to fetch development phases' });
  }
});

// Execute phase action
router.post('/phases/:phaseId/:action', async (req: Request, res: Response) => {
  try {
    const { phaseId, action } = req.params;
    
    console.log(`[ADMIN] Executing phase action: ${action} on phase ${phaseId}`);
    
    // Simulate phase action
    let message = '';
    switch (action) {
      case 'start':
        message = `Phase ${phaseId} wurde gestartet`;
        break;
      case 'pause':
        message = `Phase ${phaseId} wurde pausiert`;
        break;
      case 'restart':
        message = `Phase ${phaseId} wurde neu gestartet`;
        break;
      default:
        return res.status(400).json({ error: 'Invalid action' });
    }

    res.json({
      success: true,
      message,
      phaseId,
      action,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error executing phase action:', error);
    res.status(500).json({ error: 'Failed to execute phase action' });
  }
});

// Download documentation
router.get('/download-documentation', async (req: Request, res: Response) => {
  try {
    const format = req.query.format as string || 'zip';
    
    if (format === 'zip') {
      // Create ZIP archive
      const archive = archiver('zip', { zlib: { level: 9 } });
      
      res.setHeader('Content-Type', 'application/zip');
      res.setHeader('Content-Disposition', 'attachment; filename="helix-documentation.zip"');
      
      archive.pipe(res);
      
      // Add documentation files to archive
      const docFiles = [
        'SOFTWARE_DOKUMENTATION_HELIX.md',
        'API_REFERENCE_HELIX.md',
        'DEPLOYMENT_GUIDE_HELIX.md',
        'README.md'
      ];
      
      for (const file of docFiles) {
        try {
          const filePath = path.join(process.cwd(), file);
          const content = await fs.readFile(filePath, 'utf8');
          archive.append(content, { name: file });
        } catch (error) {
          console.warn(`Could not add ${file} to archive:`, error);
        }
      }
      
      // Add package.json for reference
      try {
        const packagePath = path.join(process.cwd(), 'package.json');
        const packageContent = await fs.readFile(packagePath, 'utf8');
        archive.append(packageContent, { name: 'package.json' });
      } catch (error) {
        console.warn('Could not add package.json to archive');
      }
      
      archive.finalize();
      
    } else if (format === 'pdf') {
      // For PDF, we'll return the main documentation as text
      // In a real implementation, you'd convert to PDF
      try {
        const docPath = path.join(process.cwd(), 'SOFTWARE_DOKUMENTATION_HELIX.md');
        const content = await fs.readFile(docPath, 'utf8');
        
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Content-Disposition', 'attachment; filename="helix-documentation.txt"');
        res.json({
          success: true,
          content: content,
          contentType: 'application/json',
          filename: 'helix-documentation.txt'
        });
      } catch (error) {
        res.status(404).json({ error: 'Documentation file not found' });
      }
    } else {
      res.status(400).json({ error: 'Invalid format. Use zip or pdf' });
    }
    
  } catch (error) {
    console.error('Error generating documentation download:', error);
    res.status(500).json({ error: 'Failed to generate documentation download' });
  }
});

export default router;