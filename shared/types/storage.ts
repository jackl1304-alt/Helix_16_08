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