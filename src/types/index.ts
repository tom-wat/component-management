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
