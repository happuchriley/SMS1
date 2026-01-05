/**
 * TLMs Service
 * Handles Teaching/Learning Materials management
 */
import apiService from './api';
import documentsService from './documentsService';

const TLMS_TYPE = 'tlms';
const TLM_CATEGORIES_TYPE = 'tlmCategories';

interface TlmData {
  title: string;
  fileName?: string;
  fileData?: string;
  file?: File;
  fileSize?: number;
  fileType?: string;
  uploadedBy?: string;
  status?: string;
  categoryId?: string;
  description?: string;
  tags?: string[];
  [key: string]: any;
}

interface TlmCategoryData {
  name: string;
  [key: string]: any;
}

const tlmsService = {
  // TLMs Operations
  async getAll(): Promise<(TlmData & { id: string })[]> {
    return await apiService.getAll<TlmData & { id: string }>(TLMS_TYPE);
  },

  async getById(id: string): Promise<TlmData & { id: string }> {
    return await apiService.getById<TlmData & { id: string }>(TLMS_TYPE, id);
  },

  async uploadTlm(tlmData: TlmData): Promise<TlmData & { id: string }> {
    if (!tlmData.title) {
      throw new Error('TLM title is required');
    }
    if (!tlmData.fileName && !tlmData.fileData && !tlmData.file) {
      throw new Error('File is required');
    }

    // Handle file upload similar to documents
    if (tlmData.file && tlmData.file instanceof File) {
      tlmData.fileData = await documentsService.fileToBase64(tlmData.file);
      tlmData.fileName = tlmData.file.name;
      tlmData.fileSize = tlmData.file.size;
      tlmData.fileType = tlmData.file.type;
      delete tlmData.file;
    }

    if (!tlmData.uploadedBy) {
      tlmData.uploadedBy = sessionStorage.getItem('username') || 'Unknown';
    }

    if (!tlmData.status) {
      tlmData.status = 'active';
    }

    return await apiService.create<TlmData & { id: string }>(TLMS_TYPE, tlmData);
  },

  async updateTlm(id: string, tlmData: Partial<TlmData>): Promise<TlmData & { id: string }> {
    return await apiService.update<TlmData & { id: string }>(TLMS_TYPE, id, tlmData);
  },

  async deleteTlm(id: string): Promise<void> {
    await apiService.delete(TLMS_TYPE, id);
  },

  async getByCategory(categoryId: string): Promise<(TlmData & { id: string })[]> {
    return await apiService.query<TlmData & { id: string }>(TLMS_TYPE, (tlm: TlmData & { id: string }) => tlm.categoryId === categoryId);
  },

  async getMyMaterials(userId: string | null = null): Promise<(TlmData & { id: string })[]> {
    const username = userId || sessionStorage.getItem('username');
    return await apiService.query<TlmData & { id: string }>(TLMS_TYPE, (tlm: TlmData & { id: string }) => tlm.uploadedBy === username);
  },

  async search(searchTerm: string): Promise<(TlmData & { id: string })[]> {
    const term = searchTerm.toLowerCase();
    return await apiService.query<TlmData & { id: string }>(TLMS_TYPE, (tlm: TlmData & { id: string }) => 
      (tlm.title ? tlm.title.toLowerCase().includes(term) : false) ||
      (tlm.description ? tlm.description.toLowerCase().includes(term) : false) ||
      (tlm.fileName ? tlm.fileName.toLowerCase().includes(term) : false) ||
      (tlm.tags && Array.isArray(tlm.tags) ? tlm.tags.some(tag => tag.toLowerCase().includes(term)) : false)
    );
  },

  async downloadTlm(id: string): Promise<TlmData & { id: string }> {
    const tlm = await this.getById(id);
    
    if (tlm.fileData) {
      const blob = await documentsService.base64ToBlob(tlm.fileData, tlm.fileType || 'application/octet-stream');
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = tlm.fileName || tlm.title;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }

    return tlm;
  },

  async toggleStatus(id: string): Promise<TlmData & { id: string }> {
    const tlm = await this.getById(id);
    const newStatus = tlm.status === 'active' ? 'inactive' : 'active';
    return await this.updateTlm(id, { status: newStatus });
  },

  // TLM Categories
  async getAllCategories(): Promise<(TlmCategoryData & { id: string })[]> {
    return await apiService.getAll<TlmCategoryData & { id: string }>(TLM_CATEGORIES_TYPE);
  },

  async getCategoryById(id: string): Promise<TlmCategoryData & { id: string }> {
    return await apiService.getById<TlmCategoryData & { id: string }>(TLM_CATEGORIES_TYPE, id);
  },

  async createCategory(categoryData: TlmCategoryData): Promise<TlmCategoryData & { id: string }> {
    if (!categoryData.name) {
      throw new Error('Category name is required');
    }
    return await apiService.create<TlmCategoryData & { id: string }>(TLM_CATEGORIES_TYPE, categoryData);
  },

  async updateCategory(id: string, categoryData: Partial<TlmCategoryData>): Promise<TlmCategoryData & { id: string }> {
    return await apiService.update<TlmCategoryData & { id: string }>(TLM_CATEGORIES_TYPE, id, categoryData);
  },

  async deleteCategory(id: string): Promise<void> {
    await apiService.delete(TLM_CATEGORIES_TYPE, id);
  }
};

export default tlmsService;

