/**
 * TLMs Service
 * Handles Teaching/Learning Materials management
 */
import apiService from './api';
import documentsService from './documentsService';

const TLMS_TYPE = 'tlms';
const TLM_CATEGORIES_TYPE = 'tlmCategories';

const tlmsService = {
  // TLMs Operations
  async getAll() {
    return await apiService.getAll(TLMS_TYPE);
  },

  async getById(id) {
    return await apiService.getById(TLMS_TYPE, id);
  },

  async uploadTlm(tlmData) {
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

    return await apiService.create(TLMS_TYPE, tlmData);
  },

  async updateTlm(id, tlmData) {
    return await apiService.update(TLMS_TYPE, id, tlmData);
  },

  async deleteTlm(id) {
    return await apiService.delete(TLMS_TYPE, id);
  },

  async getByCategory(categoryId) {
    return await apiService.query(TLMS_TYPE, tlm => tlm.categoryId === categoryId);
  },

  async getMyMaterials(userId = null) {
    const username = userId || sessionStorage.getItem('username');
    return await apiService.query(TLMS_TYPE, tlm => tlm.uploadedBy === username);
  },

  async search(searchTerm) {
    const term = searchTerm.toLowerCase();
    return await apiService.query(TLMS_TYPE, tlm => 
      tlm.title.toLowerCase().includes(term) ||
      (tlm.description && tlm.description.toLowerCase().includes(term)) ||
      (tlm.fileName && tlm.fileName.toLowerCase().includes(term)) ||
      (tlm.tags && Array.isArray(tlm.tags) && tlm.tags.some(tag => tag.toLowerCase().includes(term)))
    );
  },

  async downloadTlm(id) {
    const tlm = await this.getById(id);
    
    if (tlm.fileData) {
      const blob = await documentsService.base64ToBlob(tlm.fileData, tlm.fileType);
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

  async toggleStatus(id) {
    const tlm = await this.getById(id);
    const newStatus = tlm.status === 'active' ? 'inactive' : 'active';
    return await this.updateTlm(id, { status: newStatus });
  },

  // TLM Categories
  async getAllCategories() {
    return await apiService.getAll(TLM_CATEGORIES_TYPE);
  },

  async getCategoryById(id) {
    return await apiService.getById(TLM_CATEGORIES_TYPE, id);
  },

  async createCategory(categoryData) {
    if (!categoryData.name) {
      throw new Error('Category name is required');
    }
    return await apiService.create(TLM_CATEGORIES_TYPE, categoryData);
  },

  async updateCategory(id, categoryData) {
    return await apiService.update(TLM_CATEGORIES_TYPE, id, categoryData);
  },

  async deleteCategory(id) {
    return await apiService.delete(TLM_CATEGORIES_TYPE, id);
  }
};

export default tlmsService;

