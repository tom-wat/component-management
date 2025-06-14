// ==================== Core Types ====================

export interface Component {
  id: string;
  name: string;
  category: string;
  html: string;
  css: string;
  js: string;
  tags: string[];
  author: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ComponentFormData {
  name: string;
  category: string;
  html: string;
  css: string;
  js: string;
  tags: string;
}

export type Category = 
  | 'UI' 
  | 'Layout' 
  | 'Form' 
  | 'Navigation' 
  | 'Content' 
  | 'Other';

export interface SearchFilters {
  query: string;
  category: string;
  tags: string[];
}

// ==================== API Types ====================

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  success?: boolean;
  message?: string;
}

export interface ComponentApiResponse {
  id: string;
  name: string;
  category: string;
  html: string;
  css: string;
  js: string;
  tags: string[];
  author: string;
  createdAt: string;
  updatedAt: string;
}

export interface ComponentsListResponse {
  components: ComponentApiResponse[];
  total: number;
  hasMore: boolean;
}

// ==================== Admin Types ====================

export interface AdminStats {
  totalComponents: number;
  deletedComponents: number;
  recentDeleted: number;
  categoriesStats: Array<{
    category: string;
    total: number;
    active: number;
    deleted: number;
  }>;
}

export interface DeletedComponent extends Component {
  isDeleted: boolean;
}

// ==================== UI Types ====================

export interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
}

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  enableEscapeKey?: boolean;
  disableBodyScroll?: boolean;
}

// ==================== Hook Types ====================

export interface UseComponentsResult {
  components: Component[];
  loading: boolean;
  error: string | null;
  addComponent: (data: ComponentFormData) => Promise<void>;
  updateComponent: (id: string, data: ComponentFormData) => Promise<void>;
  deleteComponent: (id: string) => Promise<void>;
  refreshComponents: () => Promise<void>;
}

export interface NetworkStatus {
  isOnline: boolean;
  isConnected: boolean;
  lastChecked?: Date;
}
