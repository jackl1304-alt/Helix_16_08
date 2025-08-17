import { Router } from "express";
import type { Request, Response } from "express";

const router = Router();

// Einfache Mock-Daten für sofortige Funktionalität
const mockRegulatoryUpdates = [
  {
    id: "1",
    title: "FDA 510(k): Iconic Spezial Anchor, Iconic Spezial HA+ Anchor (K252544)",
    description: "FDA 510(k) • Regulatory Update",
    source: "FDA",
    date: "30.7.2025",
    type: "510k",
    status: "approved",
    deviceType: "Medical Device",
    riskLevel: "Class II"
  },
  {
    id: "2", 
    title: "FDA 510(k): IntellaMAX System (K252235)",
    description: "FDA 510(k) • Regulatory Update",
    source: "FDA",
    date: "25.7.2025",
    type: "510k",
    status: "approved",
    deviceType: "Medical Device",
    riskLevel: "Class II"
  },
  {
    id: "3",
    title: "FDA 510(k): MF-SC GEN2 Facial Toning System (K252238)",
    description: "FDA 510(k) • Regulatory Update", 
    source: "FDA",
    date: "18.7.2025",
    type: "510k",
    status: "approved",
    deviceType: "Medical Device",
    riskLevel: "Class II"
  },
  {
    id: "4",
    title: "FDA 510(k): Iconic Spezial Anchor, Iconic Spezial HA+ Anchor (K252544)",
    description: "FDA 510(k) • Regulatory Update",
    source: "FDA", 
    date: "30.7.2025",
    type: "510k",
    status: "approved",
    deviceType: "Medical Device",
    riskLevel: "Class II"
  },
  {
    id: "5",
    title: "FDA 510(k): IntellaMAX System (K252235)",
    description: "FDA 510(k) • Regulatory Update",
    source: "FDA",
    date: "23.7.2025", 
    type: "510k",
    status: "approved",
    deviceType: "Medical Device",
    riskLevel: "Class II"
  }
];

const mockLegalCases = [
  {
    id: "1",
    title: "Medical Device Patent Litigation - Cardiovascular Stents",
    description: "Rechtsprechung bezüglich Patentstreitigkeiten bei Herz-Kreislauf-Stents",
    court: "Federal Circuit Court",
    date: "2025-07-15",
    status: "ongoing",
    relevance: "high",
    deviceType: "Cardiovascular"
  },
  {
    id: "2", 
    title: "FDA Approval Challenges - Orthopedic Implants",
    description: "Gerichtsverfahren zur FDA-Zulassung orthopädischer Implantate",
    court: "District Court",
    date: "2025-06-20",
    status: "resolved",
    relevance: "medium", 
    deviceType: "Orthopedic"
  }
];

const mockDataSources = [
  { id: "1", name: "FDA News & Updates", status: "active", type: "regulatory" },
  { id: "2", name: "EMA Announcements", status: "active", type: "regulatory" },
  { id: "3", name: "Health Canada", status: "active", type: "regulatory" },
  { id: "4", name: "TGA Australia", status: "inactive", type: "regulatory" },
  { id: "5", name: "MedTech Dive", status: "active", type: "news" },
  { id: "6", name: "JAMA Network", status: "active", type: "research" },
  { id: "7", name: "MDO Newsletter", status: "active", type: "industry" }
];

const mockNewsletterSources = [
  { id: "1", name: "FDA News & Updates", active: true },
  { id: "2", name: "EMA Newsletter", active: true },
  { id: "3", name: "MedTech Dive", active: true },
  { id: "4", name: "Medical Device Network", active: false },
  { id: "5", name: "JAMA Updates", active: true },
  { id: "6", name: "Regulatory Affairs Professional", active: true },
  { id: "7", name: "BioWorld Intelligence", active: false }
];

// Regulatory Updates API
router.get("/regulatory-updates", (req: Request, res: Response) => {
  res.json({
    success: true,
    data: mockRegulatoryUpdates,
    total: mockRegulatoryUpdates.length
  });
});

router.get("/regulatory-updates/:id", (req: Request, res: Response) => {
  const update = mockRegulatoryUpdates.find(u => u.id === req.params.id);
  if (!update) {
    return res.status(404).json({ success: false, error: "Update not found" });
  }
  res.json({ success: true, data: update });
});

// Legal Cases API
router.get("/legal-cases", (req: Request, res: Response) => {
  res.json({
    success: true,
    data: mockLegalCases,
    total: mockLegalCases.length
  });
});

// Data Sources API
router.get("/data-sources", (req: Request, res: Response) => {
  res.json({
    success: true,
    data: mockDataSources,
    total: mockDataSources.length
  });
});

// Newsletter Sources API  
router.get("/newsletter-sources", (req: Request, res: Response) => {
  res.json({
    success: true,
    data: mockNewsletterSources,
    total: mockNewsletterSources.length
  });
});

// Dashboard Stats API
router.get("/dashboard/stats", (req: Request, res: Response) => {
  res.json({
    success: true,
    data: {
      regulatory_updates: 66,
      legal_cases: 65, 
      data_sources: 70,
      newsletters: 7,
      knowledge_articles: 131,
      ai_insights: 24
    }
  });
});

// Knowledge Base API
router.get("/knowledge-base", (req: Request, res: Response) => {
  res.json({
    success: true,
    data: [
      {
        id: "1",
        title: "Medical Device Classification Guidelines",
        content: "Comprehensive guide to FDA medical device classification",
        category: "Regulatory",
        lastUpdated: "2025-07-30"
      },
      {
        id: "2", 
        title: "510(k) Submission Requirements",
        content: "Complete requirements for 510(k) submissions",
        category: "FDA",
        lastUpdated: "2025-07-25"
      }
    ],
    total: 131
  });
});

// AI Insights API
router.get("/ai-insights", (req: Request, res: Response) => {
  res.json({
    success: true,
    data: [
      {
        id: "1",
        title: "Trend Analysis: Cardiovascular Device Approvals",
        insight: "AI analysis shows increasing approval rates for cardiovascular devices",
        confidence: 0.85,
        generatedAt: "2025-08-17"
      },
      {
        id: "2",
        title: "Risk Assessment: Orthopedic Implant Regulations", 
        insight: "Potential regulatory changes detected in orthopedic device sector",
        confidence: 0.78,
        generatedAt: "2025-08-16"
      }
    ],
    total: 24
  });
});

// Health Check
router.get("/health", (req: Request, res: Response) => {
  res.json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    version: "2.1.0"
  });
});

export default router;