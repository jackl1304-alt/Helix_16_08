export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface RegulatoryUpdate {
  id: string;
  title: string;
  description: string;
  region: string;
  update_type: 'guidance' | 'regulation' | 'alert' | 'approval' | 'clearance';
  priority: 'high' | 'medium' | 'low' | 'urgent';
  device_classes: string[];
  published_at: string;
  created_at: string;
  effective_date?: string;
  source_id: string;
  source_url: string;
  content?: string;
  categories?: Record<string, unknown>;
  raw_data?: Record<string, unknown>;
}

export interface LegalCase {
  id: string;
  case_number: string;
  title: string;
  jurisdiction: string;
  court: string;
  status: 'open' | 'closed' | 'appeal';
  verdict?: string;
  damages?: number;
  defendants: string[];
  plaintiffs: string[];
  filed_date: string;
  decision_date?: string;
  closed_date?: string;
  documents: Document[];
  case_summary?: string;
  legal_issues: string[];
  outcome?: string;
}

export interface DataSource {
  id: string;
  name: string;
  type: string;
  url: string;
  is_active: boolean;
  last_sync: string;
  sync_frequency: string;
  status: 'active' | 'inactive' | 'error';
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}