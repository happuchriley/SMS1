/**
 * Documents Service
 * Handles document management and file operations
 */
import apiService from './api';

const DOCUMENTS_TYPE = 'documents';
const DOCUMENT_CATEGORIES_TYPE = 'documentCategories';
const DOWNLOAD_HISTORY_TYPE = 'downloadHistory';

const documentsService = {
  // Documents Operations
  async getAllDocuments() {
    return await apiService.getAll(DOCUMENTS_TYPE);
  },

  async getDocumentById(id) {
    return await apiService.getById(DOCUMENTS_TYPE, id);
  },

  async uploadDocument(documentData) {
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

    return await apiService.create(DOCUMENTS_TYPE, documentData);
  },

  async updateDocument(id, documentData) {
    return await apiService.update(DOCUMENTS_TYPE, id, documentData);
  },

  async deleteDocument(id) {
    return await apiService.delete(DOCUMENTS_TYPE, id);
  },

  async getDocumentsByCategory(categoryId) {
    return await apiService.query(DOCUMENTS_TYPE, doc => doc.categoryId === categoryId);
  },

  async getMyDocuments(userId = null) {
    const username = userId || sessionStorage.getItem('username');
    return await apiService.query(DOCUMENTS_TYPE, doc => doc.uploadedBy === username);
  },

  async getSharedDocuments() {
    return await apiService.query(DOCUMENTS_TYPE, doc => doc.isShared === true);
  },

  async getRecentDocuments(limit = 10) {
    const docs = await this.getAllDocuments();
    const username = sessionStorage.getItem('username');
    
    // Filter by user's access (uploaded by them or shared)
    const accessible = docs.filter(doc => 
      doc.uploadedBy === username || doc.isShared === true
    );

    // Sort by date and limit
    return accessible
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, limit);
  },

  async searchDocuments(searchTerm) {
    const term = searchTerm.toLowerCase();
    return await apiService.query(DOCUMENTS_TYPE, doc => 
      doc.title.toLowerCase().includes(term) ||
      (doc.description && doc.description.toLowerCase().includes(term)) ||
      (doc.fileName && doc.fileName.toLowerCase().includes(term)) ||
      (doc.tags && doc.tags.some(tag => tag.toLowerCase().includes(term)))
    );
  },

  async downloadDocument(id) {
    const document = await this.getDocumentById(id);
    
    // Record download history
    await this.recordDownload(id, document.title);

    // If fileData is base64, convert to blob and download
    if (document.fileData) {
      const blob = await this.base64ToBlob(document.fileData, document.fileType);
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

  async recordDownload(documentId, documentTitle) {
    return await apiService.create(DOWNLOAD_HISTORY_TYPE, {
      documentId,
      documentTitle,
      downloadedBy: sessionStorage.getItem('username') || 'Unknown',
      downloadedAt: new Date().toISOString()
    });
  },

  async getDownloadHistory(userId = null) {
    const username = userId || sessionStorage.getItem('username');
    const history = await apiService.getAll(DOWNLOAD_HISTORY_TYPE);
    return history
      .filter(h => h.downloadedBy === username)
      .sort((a, b) => new Date(b.downloadedAt) - new Date(a.downloadedAt));
  },

  // Document Categories
  async getAllCategories() {
    return await apiService.getAll(DOCUMENT_CATEGORIES_TYPE);
  },

  async getCategoryById(id) {
    return await apiService.getById(DOCUMENT_CATEGORIES_TYPE, id);
  },

  async createCategory(categoryData) {
    if (!categoryData.name) {
      throw new Error('Category name is required');
    }
    return await apiService.create(DOCUMENT_CATEGORIES_TYPE, categoryData);
  },

  async updateCategory(id, categoryData) {
    return await apiService.update(DOCUMENT_CATEGORIES_TYPE, id, categoryData);
  },

  async deleteCategory(id) {
    return await apiService.delete(DOCUMENT_CATEGORIES_TYPE, id);
  },

  // File Utilities
  async fileToBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = error => reject(error);
    });
  },

  async base64ToBlob(base64, mimeType) {
    const base64Response = await fetch(base64);
    return await base64Response.blob();
  }
};

export default documentsService;

