/**
 * Documents Service
 * Handles document management and file operations
 */
import apiService from './api';

const DOCUMENTS_TYPE = 'documents';
const DOCUMENT_CATEGORIES_TYPE = 'documentCategories';
const DOWNLOAD_HISTORY_TYPE = 'downloadHistory';

interface DocumentData {
  title: string;
  fileName?: string;
  fileData?: string;
  file?: File;
  fileSize?: number;
  fileType?: string;
  uploadedBy?: string;
  status?: string;
  categoryId?: string;
  isShared?: boolean;
  description?: string;
  tags?: string[];
  createdAt?: string;
  [key: string]: any;
}

export interface CategoryData {
  name: string;
  [key: string]: any;
}

interface DownloadHistoryData {
  documentId: string;
  documentTitle: string;
  downloadedBy: string;
  downloadedAt: string;
  [key: string]: any;
}

const documentsService = {
  // Documents Operations
  async getAllDocuments(): Promise<(DocumentData & { id: string })[]> {
    return await apiService.getAll<DocumentData & { id: string }>(DOCUMENTS_TYPE);
  },

  async getDocumentById(id: string): Promise<DocumentData & { id: string }> {
    return await apiService.getById<DocumentData & { id: string }>(DOCUMENTS_TYPE, id);
  },

  async uploadDocument(documentData: DocumentData): Promise<DocumentData & { id: string }> {
    if (!documentData.title) {
      throw new Error('Document title is required');
    }
    if (!documentData.fileName && !documentData.fileData) {
      throw new Error('File is required');
    }

    // Convert file to base64 if it's a File object
    if (documentData.file && documentData.file instanceof File) {
      documentData.fileData = await this.fileToBase64(documentData.file);
      documentData.fileName = documentData.file.name;
      documentData.fileSize = documentData.file.size;
      documentData.fileType = documentData.file.type;
      delete documentData.file;
    }

    if (!documentData.uploadedBy) {
      documentData.uploadedBy = sessionStorage.getItem('username') || 'Unknown';
    }

    if (!documentData.status) {
      documentData.status = 'active';
    }

    return await apiService.create<DocumentData & { id: string }>(DOCUMENTS_TYPE, documentData);
  },

  async updateDocument(id: string, documentData: Partial<DocumentData>): Promise<DocumentData & { id: string }> {
    return await apiService.update<DocumentData & { id: string }>(DOCUMENTS_TYPE, id, documentData);
  },

  async deleteDocument(id: string): Promise<void> {
    await apiService.delete(DOCUMENTS_TYPE, id);
  },

  async getDocumentsByCategory(categoryId: string): Promise<(DocumentData & { id: string })[]> {
    return await apiService.query<DocumentData & { id: string }>(DOCUMENTS_TYPE, (doc: DocumentData & { id: string }) => doc.categoryId === categoryId);
  },

  async getMyDocuments(userId: string | null = null): Promise<(DocumentData & { id: string })[]> {
    const username = userId || sessionStorage.getItem('username');
    return await apiService.query<DocumentData & { id: string }>(DOCUMENTS_TYPE, (doc: DocumentData & { id: string }) => doc.uploadedBy === username);
  },

  async getSharedDocuments(): Promise<(DocumentData & { id: string })[]> {
    return await apiService.query<DocumentData & { id: string }>(DOCUMENTS_TYPE, (doc: DocumentData & { id: string }) => doc.isShared === true);
  },

  async getRecentDocuments(limit: number = 10): Promise<(DocumentData & { id: string })[]> {
    const docs = await this.getAllDocuments();
    const username = sessionStorage.getItem('username');
    
    // Filter by user's access (uploaded by them or shared)
    const accessible = docs.filter((doc: DocumentData & { id: string }) => 
      doc.uploadedBy === username || doc.isShared === true
    );

    // Sort by date and limit
    return accessible
      .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
      .slice(0, limit);
  },

  async searchDocuments(searchTerm: string): Promise<(DocumentData & { id: string })[]> {
    const term = searchTerm.toLowerCase();
    return await apiService.query<DocumentData & { id: string }>(DOCUMENTS_TYPE, (doc: DocumentData & { id: string }) => 
      (doc.title ? doc.title.toLowerCase().includes(term) : false) ||
      (doc.description ? doc.description.toLowerCase().includes(term) : false) ||
      (doc.fileName ? doc.fileName.toLowerCase().includes(term) : false) ||
      (doc.tags ? doc.tags.some(tag => tag.toLowerCase().includes(term)) : false)
    );
  },

  async downloadDocument(id: string): Promise<DocumentData & { id: string }> {
    const document = await this.getDocumentById(id);
    
    // Record download history
    await this.recordDownload(id, document.title);

    // If fileData is base64, convert to blob and download
    if (document.fileData) {
      const blob = await this.base64ToBlob(document.fileData, document.fileType || 'application/octet-stream');
      const url = URL.createObjectURL(blob);
      const a = window.document.createElement('a');
      a.href = url;
      a.download = document.fileName || document.title;
      window.document.body.appendChild(a);
      a.click();
      window.document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }

    return document;
  },

  async recordDownload(documentId: string, documentTitle: string): Promise<DownloadHistoryData & { id: string }> {
    return await apiService.create<DownloadHistoryData & { id: string }>(DOWNLOAD_HISTORY_TYPE, {
      documentId,
      documentTitle,
      downloadedBy: sessionStorage.getItem('username') || 'Unknown',
      downloadedAt: new Date().toISOString()
    });
  },

  async getDownloadHistory(userId: string | null = null): Promise<(DownloadHistoryData & { id: string })[]> {
    const username = userId || sessionStorage.getItem('username');
    const history = await apiService.getAll<DownloadHistoryData & { id: string }>(DOWNLOAD_HISTORY_TYPE);
    return history
      .filter((h: DownloadHistoryData & { id: string }) => h.downloadedBy === username)
      .sort((a, b) => new Date(b.downloadedAt).getTime() - new Date(a.downloadedAt).getTime());
  },

  // Document Categories
  async getAllCategories(): Promise<(CategoryData & { id: string })[]> {
    return await apiService.getAll<CategoryData & { id: string }>(DOCUMENT_CATEGORIES_TYPE);
  },

  async getCategoryById(id: string): Promise<CategoryData & { id: string }> {
    return await apiService.getById<CategoryData & { id: string }>(DOCUMENT_CATEGORIES_TYPE, id);
  },

  async createCategory(categoryData: CategoryData): Promise<CategoryData & { id: string }> {
    if (!categoryData.name) {
      throw new Error('Category name is required');
    }
    return await apiService.create<CategoryData & { id: string }>(DOCUMENT_CATEGORIES_TYPE, categoryData);
  },

  async updateCategory(id: string, categoryData: Partial<CategoryData>): Promise<CategoryData & { id: string }> {
    return await apiService.update<CategoryData & { id: string }>(DOCUMENT_CATEGORIES_TYPE, id, categoryData);
  },

  async deleteCategory(id: string): Promise<void> {
    await apiService.delete(DOCUMENT_CATEGORIES_TYPE, id);
  },

  // File Utilities
  async fileToBase64(file: File): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  },

  async base64ToBlob(base64: string, mimeType: string): Promise<Blob> {
    const base64Response = await fetch(base64);
    return await base64Response.blob();
  }
};

export default documentsService;

