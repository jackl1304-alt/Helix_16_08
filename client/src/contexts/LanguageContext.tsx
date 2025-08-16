import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'de' | 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const translations = {
  de: {
    // Navigation
    'nav.dashboard': 'Dashboard',
    'nav.analytics': 'Berichte & Analysen',
    'nav.dataCollection': 'Datensammlung',
    'nav.newsletterAdmin': 'Newsletter-Verwaltung',
    'nav.emailManagement': 'Email-Verwaltung',
    'nav.knowledgeBase': 'Wissensdatenbank',
    'nav.regulatoryUpdates': 'Regulatorische Updates',
    'nav.legalCases': 'Rechtsprechung',
    'nav.globalApprovals': 'Globale Zulassungen',
    'nav.ongoingApprovals': 'Laufende Zulassungen',
    'nav.intelligentSearch': 'Intelligente Suche',
    'nav.syncManager': 'Sync-Verwaltung',
    'nav.globalSources': 'Globale Quellen',
    'nav.newsletterManager': 'Newsletter Manager',
    'nav.historicalData': 'Historische Daten',
    'nav.customerManagement': 'Kunden-Management',
    'nav.userManagement': 'Benutzerverwaltung',
    'nav.systemAdmin': 'System-Verwaltung',
    'nav.auditLogs': 'Audit-Protokolle',
    
    // Navigation Sections
    'nav.sections.overview': 'ÜBERSICHT & STEUERUNG',
    'nav.sections.dataManagement': 'DATENMANAGEMENT',
    'nav.sections.compliance': 'COMPLIANCE & REGULIERUNG',
    'nav.sections.approvals': 'ZULASSUNGEN & REGISTRIERUNG',
    'nav.sections.advanced': 'ERWEITERT',
    
    // Search
    'search.askQuestion': 'Frage stellen...',
    
    // Status
    'status.label': 'Status',
    'status.online': 'Online',
    'status.dataSources': '46 Datenquellen',
    
    // Common
    'common.search': 'Suchen',
    'common.loading': 'Wird geladen...',
    'common.error': 'Fehler',
    'common.save': 'Speichern',
    'common.cancel': 'Abbrechen',
    'common.delete': 'Löschen',
    'common.edit': 'Bearbeiten',
    'common.view': 'Anzeigen',
    'common.download': 'Herunterladen',
    'common.export': 'Exportieren',
    'common.filter': 'Filter',
    'common.all': 'Alle',
    'common.active': 'Aktiv',
    'common.inactive': 'Inaktiv',
    'common.pending': 'Ausstehend',
    'common.completed': 'Abgeschlossen',
    'common.date': 'Datum',
    'common.status': 'Status',
    'common.priority': 'Priorität',
    'common.region': 'Region',
    'common.category': 'Kategorie',
    'common.source': 'Quelle',
    'common.language': 'Sprache',
    
    // Dashboard
    'dashboard.title': 'Helix Regulatory Intelligence',
    'dashboard.subtitle': 'Comprehensive Medical Device Regulatory Platform',
    'dashboard.totalUpdates': 'Gesamt Updates',
    'dashboard.legalCases': 'Rechtsfälle',
    'dashboard.knowledgeArticles': 'Knowledge Articles',
    'dashboard.activeDataSources': 'Aktive Datenquellen',
    'dashboard.recentActivity': 'Aktuelle Aktivitäten',
    'dashboard.welcomeBack': 'Willkommen zurück',
    
    // Intelligent Search
    'search.title': 'Intelligente Suche',
    'search.subtitle': 'KI-gestützte Suche durch alle Helix-Datenquellen',
    'search.placeholder': 'z.B. "MDR-Anforderungen für Klasse III Geräte"',
    'search.searching': 'Suche...',
    'search.results': 'Suchergebnisse',
    'search.aiAnswer': 'KI-Antwort',
    'search.noResults': 'Keine Ergebnisse gefunden',
    'search.confidence': 'Vertrauen',
    'search.relevance': 'Relevanz',
    'search.databaseResults': 'Eigene Daten',
    'search.aiResults': 'KI-Ergebnis',
    
    // Analytics
    'analytics.title': 'Analytics Intelligence',
    'analytics.subtitle': 'Umfassende Analyse der regulatorischen Datenlandschaft',
    'analytics.totalUpdates': 'Gesamt Updates',
    'analytics.pendingApprovals': 'Wartende Genehmigungen',
    'analytics.regionalDistribution': 'Regionale Verteilung',
    'analytics.categoryBreakdown': 'Kategorie Breakdown',
    'analytics.sourcePerformance': 'Datenquellen Performance',
    
    // Knowledge Base
    'knowledge.title': 'Wissensdatenbank',
    'knowledge.subtitle': 'Medizintechnik Wissensartikel aus authentischen Quellen',
    'knowledge.totalArticles': 'Gesamt Artikel',
    'knowledge.activeSources': 'Aktive Quellen',
    'knowledge.regions': 'Regionen',
    'knowledge.languages': 'Sprachen',
    'knowledge.searchPlaceholder': 'Nach Artikeln suchen...',
    
    // Newsletter Admin
    'newsletter.title': 'Newsletter Administration',
    'newsletter.subtitle': 'Verwalten Sie authentische Newsletter-Quellen',
    'newsletter.addSource': 'Neue Quelle hinzufügen',
    'newsletter.configuredSources': 'Konfigurierte Newsletter-Quellen',
    'newsletter.authenticSources': 'Authentische Newsletter-Quellen',
    
    // Data Collection
    'dataCollection.title': 'Datensammlung',
    'dataCollection.subtitle': 'Zentrale Verwaltung aller Datenquellen und Sync-Prozesse',
    'dataCollection.activeSources': 'Aktive Quellen',
    'dataCollection.syncStatus': 'Sync-Status',
    'dataCollection.lastSync': 'Letzter Sync',
    'dataCollection.syncNow': 'Jetzt synchronisieren',
    'dataCollection.manageSource': 'Quelle verwalten',
    'dataCollection.newsletterSources': 'Newsletter-Quellen',
    'dataCollection.runningSyncs': 'Laufende Syncs',
    'dataCollection.pendingSyncs': 'Ausstehende Syncs',
    'dataCollection.recentSyncs': 'Kürzliche Syncs',
    
    // Regulatory Updates
    'regulatory.title': 'Regulatorische Updates',
    'regulatory.subtitle': 'Aktuelle Vorschriften und Richtlinien für Medizinprodukte',
    'regulatory.region': 'Region',
    'regulatory.authority': 'Behörde',
    'regulatory.deviceClass': 'Geräteklasse',
    'regulatory.published': 'Veröffentlicht',
    'regulatory.viewDetails': 'Details anzeigen',
    'regulatory.searchUpdates': 'Updates durchsuchen...',
    'regulatory.allRegions': 'Alle Regionen',
    'regulatory.allAuthorities': 'Alle Behörden',
    'regulatory.allCategories': 'Alle Kategorien',
    
    // Legal Cases
    'legal.title': 'Rechtsprechung',
    'legal.subtitle': 'Medizinrechtliche Fälle und Entscheidungen',
    'legal.court': 'Gericht',
    'legal.jurisdiction': 'Zuständigkeit',
    'legal.caseType': 'Falltyp',
    'legal.decision': 'Entscheidung',
    'legal.searchCases': 'Fälle durchsuchen...',
    'legal.viewCase': 'Fall anzeigen',
    
    // Buttons and Actions
    'action.viewAll': 'Alle anzeigen',
    'action.refresh': 'Aktualisieren',
    'action.configure': 'Konfigurieren',
    'action.test': 'Testen',
    'action.sync': 'Synchronisieren',
    'action.details': 'Details',
    'action.manage': 'Verwalten',
    'action.add': 'Hinzufügen',
    'action.remove': 'Entfernen',
    'action.update': 'Aktualisieren',
    'action.export': 'Export',
    
    // Knowledge Base specific
    'knowledge.noSummary': 'Keine Zusammenfassung verfügbar',
    'knowledge.fullContent': 'Vollständiger Inhalt',
    'knowledge.exportGenerated': 'Export generiert am',
    'search.summary': 'Zusammenfassung',
    
    // Time and Date
    'time.today': 'Heute',
    'time.yesterday': 'Gestern',
    'time.thisWeek': 'Diese Woche',
    'time.thisMonth': 'Dieser Monat',
    'time.lastMonth': 'Letzter Monat',
    'time.lastSync': 'Letzter Sync',
    'time.noSync': 'Noch kein Sync',
    
    // Metrics and Statistics
    'metrics.total': 'Gesamt',
    'metrics.active': 'Aktiv',
    'metrics.pending': 'Ausstehend',
    'metrics.completed': 'Abgeschlossen',
    'metrics.failed': 'Fehlgeschlagen',
    'metrics.success': 'Erfolgreich',
    'metrics.trend': 'Trend',
    'metrics.increase': 'Anstieg',
    'metrics.decrease': 'Rückgang',
    'metrics.stable': 'Stabil',
    
    // Subscription Plans
    'basic.updates': 'Grundlegende Updates',
    'basic.notifications': 'Email-Benachrichtigungen',
    'basic.support': 'Standard-Support',
    'professional.analytics': 'Erweiterte Analytics',
    'professional.support': 'Priority Support',
    'professional.reports': 'Custom Reports',
    'professional.api': 'API Access',
    'enterprise.unlimited': 'Unbegrenzte Zugriffe',
    'enterprise.dedicated': 'Dedicated Account Manager',
    'enterprise.custom': 'Custom Integrations',
    
    // Authentication
    'auth.loginFailed': 'Anmeldung fehlgeschlagen. Bitte versuchen Sie es erneut.',
    'auth.login': 'Anmelden',
    'auth.email': 'E-Mail',
    'auth.password': 'Passwort',
    'auth.demo': 'Demo-Zugang',
    
    // Access Control
    'access.restricted': 'Zugriff beschränkt',
    'access.noPermission': 'Keine Berechtigung',
    'access.contactAdmin': 'Kontaktieren Sie Ihren Administrator',
    
    // Customer Portal
    'customer.dashboard': 'Kunden-Dashboard',
    'customer.portal': 'Kundenportal',
    'customer.logout': 'Abmelden',
    'customer.chat': 'Support Chat'
  },
  en: {
    // Navigation
    'nav.dashboard': 'Dashboard',
    'nav.analytics': 'Reports & Analytics',
    'nav.dataCollection': 'Data Collection',
    'nav.newsletterAdmin': 'Newsletter Management',
    'nav.emailManagement': 'Email Management',
    'nav.knowledgeBase': 'Knowledge Base',
    'nav.regulatoryUpdates': 'Regulatory Updates',
    'nav.legalCases': 'Legal Cases',
    'nav.globalApprovals': 'Global Approvals',
    'nav.ongoingApprovals': 'Ongoing Approvals',
    'nav.intelligentSearch': 'Intelligent Search',
    'nav.syncManager': 'Sync Management',
    'nav.globalSources': 'Global Sources',
    'nav.newsletterManager': 'Newsletter Manager',
    'nav.historicalData': 'Historical Data',
    'nav.customerManagement': 'Customer Management',
    'nav.userManagement': 'User Management',
    'nav.systemAdmin': 'System Administration',
    'nav.auditLogs': 'Audit Logs',
    
    // Navigation Sections
    'nav.sections.overview': 'OVERVIEW & CONTROL',
    'nav.sections.dataManagement': 'DATA MANAGEMENT',
    'nav.sections.compliance': 'COMPLIANCE & REGULATION',
    'nav.sections.approvals': 'APPROVALS & REGISTRATION',
    'nav.sections.advanced': 'ADVANCED',
    
    // Search
    'search.askQuestion': 'Ask a question...',
    
    // Status
    'status.label': 'Status',
    'status.online': 'Online',
    'status.dataSources': '46 Data Sources',
    
    // Common
    'common.search': 'Search',
    'common.loading': 'Loading...',
    'common.error': 'Error',
    'common.save': 'Save',
    'common.cancel': 'Cancel',
    'common.delete': 'Delete',
    'common.edit': 'Edit',
    'common.view': 'View',
    'common.download': 'Download',
    'common.export': 'Export',
    'common.filter': 'Filter',
    'common.all': 'All',
    'common.active': 'Active',
    'common.inactive': 'Inactive',
    'common.pending': 'Pending',
    'common.completed': 'Completed',
    'common.date': 'Date',
    'common.status': 'Status',
    'common.priority': 'Priority',
    'common.region': 'Region',
    'common.category': 'Category',
    'common.source': 'Source',
    'common.language': 'Language',
    
    // Dashboard
    'dashboard.title': 'Helix Regulatory Intelligence',
    'dashboard.subtitle': 'Comprehensive Medical Device Regulatory Platform',
    'dashboard.totalUpdates': 'Total Updates',
    'dashboard.legalCases': 'Legal Cases',
    'dashboard.knowledgeArticles': 'Knowledge Articles',
    'dashboard.activeDataSources': 'Active Data Sources',
    'dashboard.recentActivity': 'Recent Activity',
    'dashboard.welcomeBack': 'Welcome Back',
    
    // Intelligent Search
    'search.title': 'Intelligent Search',
    'search.subtitle': 'AI-powered search across all Helix data sources',
    'search.placeholder': 'e.g. "MDR requirements for Class III devices"',
    'search.searching': 'Searching...',
    'search.results': 'Search Results',
    'search.aiAnswer': 'AI Answer',
    'search.noResults': 'No results found',
    'search.confidence': 'Confidence',
    'search.relevance': 'Relevance',
    'search.databaseResults': 'Database Results',
    'search.aiResults': 'AI Results',
    
    // Analytics
    'analytics.title': 'Analytics Intelligence',
    'analytics.subtitle': 'Comprehensive analysis of regulatory data landscape',
    'analytics.totalUpdates': 'Total Updates',
    'analytics.pendingApprovals': 'Pending Approvals',
    'analytics.regionalDistribution': 'Regional Distribution',
    'analytics.categoryBreakdown': 'Category Breakdown',
    'analytics.sourcePerformance': 'Data Sources Performance',
    
    // Knowledge Base
    'knowledge.title': 'Knowledge Base',
    'knowledge.subtitle': 'Medical device knowledge articles from authentic sources',
    'knowledge.totalArticles': 'Total Articles',
    'knowledge.activeSources': 'Active Sources',
    'knowledge.regions': 'Regions',
    'knowledge.languages': 'Languages',
    'knowledge.searchPlaceholder': 'Search for articles...',
    
    // Newsletter Admin
    'newsletter.title': 'Newsletter Administration',
    'newsletter.subtitle': 'Manage authentic newsletter sources',
    'newsletter.addSource': 'Add New Source',
    'newsletter.configuredSources': 'Configured Newsletter Sources',
    'newsletter.authenticSources': 'Authentic Newsletter Sources',
    
    // Data Collection
    'dataCollection.title': 'Data Collection',
    'dataCollection.subtitle': 'Central management of all data sources and sync processes',
    'dataCollection.activeSources': 'Active Sources',
    'dataCollection.syncStatus': 'Sync Status',
    'dataCollection.lastSync': 'Last Sync',
    'dataCollection.syncNow': 'Sync Now',
    'dataCollection.manageSource': 'Manage Source',
    'dataCollection.newsletterSources': 'Newsletter Sources',
    'dataCollection.runningSyncs': 'Running Syncs',
    'dataCollection.pendingSyncs': 'Pending Syncs',
    'dataCollection.recentSyncs': 'Recent Syncs',
    
    // Regulatory Updates
    'regulatory.title': 'Regulatory Updates',
    'regulatory.subtitle': 'Current regulations and guidelines for medical devices',
    'regulatory.region': 'Region',
    'regulatory.authority': 'Authority',
    'regulatory.deviceClass': 'Device Class',
    'regulatory.published': 'Published',
    'regulatory.viewDetails': 'View Details',
    'regulatory.searchUpdates': 'Search updates...',
    'regulatory.allRegions': 'All Regions',
    'regulatory.allAuthorities': 'All Authorities',
    'regulatory.allCategories': 'All Categories',
    
    // Legal Cases
    'legal.title': 'Legal Cases',
    'legal.subtitle': 'Medical law cases and decisions',
    'legal.court': 'Court',
    'legal.jurisdiction': 'Jurisdiction',
    'legal.caseType': 'Case Type',
    'legal.decision': 'Decision',
    'legal.searchCases': 'Search cases...',
    'legal.viewCase': 'View Case',
    
    // Buttons and Actions
    'action.viewAll': 'View All',
    'action.refresh': 'Refresh',
    'action.configure': 'Configure',
    'action.test': 'Test',
    'action.sync': 'Sync',
    'action.details': 'Details',
    'action.manage': 'Manage',
    'action.add': 'Add',
    'action.remove': 'Remove',
    'action.update': 'Update',
    'action.export': 'Export',
    
    // Knowledge Base specific
    'knowledge.noSummary': 'No summary available',
    'knowledge.fullContent': 'Full Content',
    'knowledge.exportGenerated': 'Export generated on',
    'search.summary': 'Summary',
    
    // Time and Date
    'time.today': 'Today',
    'time.yesterday': 'Yesterday',
    'time.thisWeek': 'This Week',
    'time.thisMonth': 'This Month',
    'time.lastMonth': 'Last Month',
    'time.lastSync': 'Last Sync',
    'time.noSync': 'No Sync Yet',
    
    // Metrics and Statistics
    'metrics.total': 'Total',
    'metrics.active': 'Active',
    'metrics.pending': 'Pending',
    'metrics.completed': 'Completed',
    'metrics.failed': 'Failed',
    'metrics.success': 'Successful',
    'metrics.trend': 'Trend',
    'metrics.increase': 'Increase',
    'metrics.decrease': 'Decrease',
    'metrics.stable': 'Stable',
    
    // Subscription Plans
    'basic.updates': 'Basic Updates',
    'basic.notifications': 'Email Notifications',
    'basic.support': 'Standard Support',
    'professional.analytics': 'Advanced Analytics',
    'professional.support': 'Priority Support',
    'professional.reports': 'Custom Reports',
    'professional.api': 'API Access',
    'enterprise.unlimited': 'Unlimited Access',
    'enterprise.dedicated': 'Dedicated Account Manager',
    'enterprise.custom': 'Custom Integrations',
    
    // Authentication
    'auth.loginFailed': 'Login failed. Please try again.',
    'auth.login': 'Login',
    'auth.email': 'Email',
    'auth.password': 'Password',
    'auth.demo': 'Demo Access',
    
    // Access Control
    'access.restricted': 'Access Restricted',
    'access.noPermission': 'No Permission',
    'access.contactAdmin': 'Contact your administrator',
    
    // Customer Portal
    'customer.dashboard': 'Customer Dashboard',
    'customer.portal': 'Customer Portal',
    'customer.logout': 'Logout',
    'customer.chat': 'Support Chat'
  }
};

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem('helix-language');
    return (saved as Language) || 'de';
  });

  useEffect(() => {
    localStorage.setItem('helix-language', language);
    document.documentElement.lang = language;
  }, [language]);

  const t = (key: string): string => {
    return (translations[language] as Record<string, string>)[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}