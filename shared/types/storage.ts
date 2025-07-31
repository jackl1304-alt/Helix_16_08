import { 
  DashboardStats, 
  DataSource, 
  RegulatoryUpdate, 
  LegalCase 
} from './api';

// Legacy storage interfaces (kept for backward compatibility)
export interface StorageRegulatoryUpdate {
  id: string;
  title: string;
  description: string;
  source_id: string;
  source_url: string;
  content?: string;
  region: string;
  update_type: string;
  priority: string;
  device_classes: string[];
  categories?: Record<string, unknown>;
  raw_data?: Record<string, unknown>;
  published_at: string;
  created_at: string;
  effective_date?: string;
}

export interface StorageLegalCase {
  id: string;
  case_number: string;
  title: string;
  court: string;
  jurisdiction: string;
  status: string;
  verdict?: string;
  damages?: number;
  defendants: string[];
  plaintiffs: string[];
  filed_date: string;
  decision_date?: string;
  closed_date?: string;
  case_summary?: string;
  summary?: string;
  legal_issues: string[];
  outcome?: string;
  impact_level?: string;
  document_url?: string;
}

export interface StorageDataSource {
  id: string;
  name: string;
  type: string;
  url: string;
  is_active: boolean;
  last_sync: string;
  sync_frequency: string;
  status: string;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

// User related types
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user' | 'viewer';
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
}

export interface CreateUserInput {
  name: string;
  email: string;
  role: 'admin' | 'user' | 'viewer';
}

export interface UpdateUserInput {
  name?: string;
  email?: string;
  role?: 'admin' | 'user' | 'viewer';
  isActive?: boolean;
}

// Knowledge Article types
export interface KnowledgeArticle {
  id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  author: string;
  publishedAt: Date;
  updatedAt: Date;
  isPublished: boolean;
  viewCount: number;
}

export interface CreateKnowledgeArticleInput {
  title: string;
  content: string;
  category: string;
  tags: string[];
  author: string;
  isPublished?: boolean;
}

// Newsletter types
export interface Newsletter {
  id: string;
  title: string;
  content: string;
  scheduledDate: Date;
  sentDate?: Date;
  status: 'draft' | 'scheduled' | 'sent' | 'cancelled';
  recipientCount: number;
  openRate?: number;
  clickRate?: number;
}

export interface Subscriber {
  id: string;
  email: string;
  name?: string;
  subscribedAt: Date;
  isActive: boolean;
  preferences: {
    regulations: boolean;
    legal: boolean;
    newsletters: boolean;
  };
}

// Approval types
export interface Approval {
  id: string;
  contentType: 'regulatory_update' | 'legal_case' | 'knowledge_article';
  contentId: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedBy: string;
  reviewedBy?: string;
  submittedAt: Date;
  reviewedAt?: Date;
  comments?: string;
  confidence?: number;
  aiRecommendation?: 'approve' | 'reject' | 'review';
}

export interface CreateApprovalInput {
  contentType: 'regulatory_update' | 'legal_case' | 'knowledge_article';
  contentId: string;
  submittedBy: string;
  comments?: string;
  confidence?: number;
  aiRecommendation?: 'approve' | 'reject' | 'review';
}

export interface UpdateApprovalInput {
  status?: 'pending' | 'approved' | 'rejected';
  reviewedBy?: string;
  comments?: string;
}

// Storage interface with proper typing
export interface IStorage {
  // Dashboard operations
  getDashboardStats(): Promise<DashboardStats>;
  
  // Data source operations  
  getAllDataSources(): Promise<DataSource[]>;
  getActiveDataSources(): Promise<DataSource[]>;
  getDataSourceById(id: string): Promise<DataSource | undefined>;
  updateDataSource(id: string, updates: Partial<DataSource>): Promise<DataSource>;
  updateDataSourceLastSync(id: string, lastSync: Date): Promise<void>;
  addDataSource(dataSource: Omit<DataSource, 'id'>): Promise<DataSource>;
  deleteDataSource(id: string): Promise<void>;
  
  // User operations
  createUser(user: CreateUserInput): Promise<User>;
  getUserById(id: string): Promise<User | undefined>;
  getAllUsers(): Promise<User[]>;
  updateUser(id: string, updates: UpdateUserInput): Promise<User>;
  deleteUser(id: string): Promise<void>;
  
  // Regulatory update operations
  addRegulatoryUpdate(update: Omit<RegulatoryUpdate, 'id'>): Promise<RegulatoryUpdate>;
  getAllRegulatoryUpdates(): Promise<RegulatoryUpdate[]>;
  getRegulatoryUpdateById(id: string): Promise<RegulatoryUpdate | undefined>;
  getRegulatoryUpdatesByRegion(region: string): Promise<RegulatoryUpdate[]>;
  getRecentRegulatoryUpdates(limit?: number): Promise<RegulatoryUpdate[]>;
  updateRegulatoryUpdate(id: string, updates: Partial<RegulatoryUpdate>): Promise<RegulatoryUpdate>;
  deleteRegulatoryUpdate(id: string): Promise<void>;
  
  // Legal case operations
  addLegalCase(legalCase: Omit<LegalCase, 'id'>): Promise<LegalCase>;
  getAllLegalCases(): Promise<LegalCase[]>;
  getLegalCaseById(id: string): Promise<LegalCase | undefined>;
  getLegalCasesByJurisdiction(jurisdiction: string): Promise<LegalCase[]>;
  updateLegalCase(id: string, updates: Partial<LegalCase>): Promise<LegalCase>;
  deleteLegalCase(id: string): Promise<void>;
  
  // Knowledge article operations
  addKnowledgeArticle(article: CreateKnowledgeArticleInput): Promise<KnowledgeArticle>;
  getAllKnowledgeArticles(): Promise<KnowledgeArticle[]>;
  getKnowledgeArticleById(id: string): Promise<KnowledgeArticle | undefined>;
  updateKnowledgeArticle(id: string, updates: Partial<KnowledgeArticle>): Promise<KnowledgeArticle>;
  deleteKnowledgeArticle(id: string): Promise<void>;
  
  // Newsletter and subscriber operations
  addNewsletter(newsletter: Omit<Newsletter, 'id'>): Promise<Newsletter>;
  getAllNewsletters(): Promise<Newsletter[]>;
  getNewsletterById(id: string): Promise<Newsletter | undefined>;
  updateNewsletter(id: string, updates: Partial<Newsletter>): Promise<Newsletter>;
  deleteNewsletter(id: string): Promise<void>;
  
  addSubscriber(subscriber: Omit<Subscriber, 'id'>): Promise<Subscriber>;
  getAllSubscribers(): Promise<Subscriber[]>;
  getSubscriberById(id: string): Promise<Subscriber | undefined>;
  updateSubscriber(id: string, updates: Partial<Subscriber>): Promise<Subscriber>;
  deleteSubscriber(id: string): Promise<void>;
  
  // Approval operations
  addApproval(approval: CreateApprovalInput): Promise<Approval>;
  getAllApprovals(): Promise<Approval[]>;
  getApprovalById(id: string): Promise<Approval | undefined>;
  getPendingApprovals(): Promise<Approval[]>;
  updateApproval(id: string, updates: UpdateApprovalInput): Promise<Approval>;
  deleteApproval(id: string): Promise<void>;
}