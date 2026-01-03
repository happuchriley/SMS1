/**
 * Base API Service
 * Provides CRUD operations with localStorage persistence
 * Simulates backend API calls with async/await patterns
 */

// Delay simulation for realistic API behavior
const delay = (ms = 100) => new Promise(resolve => setTimeout(resolve, ms));

class ApiService {
  constructor() {
    this.storagePrefix = 'sms_';
    this.version = '1.0.0';
  }

  /**
   * Get storage key for an entity type
   */
  getStorageKey(entityType) {
    return `${this.storagePrefix}${entityType}`;
  }

  /**
   * Get all items of a type
   */
  async getAll(entityType) {
    try {
      await delay();
      const key = this.getStorageKey(entityType);
      const data = localStorage.getItem(key);
      
      if (!data) {
        return [];
      }
      
      const parsed = JSON.parse(data);
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      console.error(`Error getting all ${entityType}:`, error);
      throw new Error(`Failed to fetch ${entityType} records`);
    }
  }

  /**
   * Get a single item by ID
   */
  async getById(entityType, id) {
    try {
      await delay();
      const items = await this.getAll(entityType);
      const item = items.find(item => item.id === id);
      
      if (!item) {
        throw new Error(`${entityType} with ID ${id} not found`);
      }
      
      return item;
    } catch (error) {
      console.error(`Error getting ${entityType} by ID:`, error);
      throw error;
    }
  }

  /**
   * Create a new item
   */
  async create(entityType, data) {
    try {
      await delay();
      const items = await this.getAll(entityType);
      
      // Generate ID if not provided
      const newItem = {
        ...data,
        id: data.id || this.generateId(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      items.push(newItem);
      await this.saveAll(entityType, items);
      
      return newItem;
    } catch (error) {
      console.error(`Error creating ${entityType}:`, error);
      throw new Error(`Failed to create ${entityType} record`);
    }
  }

  /**
   * Update an existing item
   */
  async update(entityType, id, data) {
    try {
      await delay();
      const items = await this.getAll(entityType);
      const index = items.findIndex(item => item.id === id);
      
      if (index === -1) {
        throw new Error(`${entityType} with ID ${id} not found`);
      }
      
      items[index] = {
        ...items[index],
        ...data,
        id, // Ensure ID doesn't change
        updatedAt: new Date().toISOString()
      };
      
      await this.saveAll(entityType, items);
      return items[index];
    } catch (error) {
      console.error(`Error updating ${entityType}:`, error);
      throw error;
    }
  }

  /**
   * Delete an item by ID
   */
  async delete(entityType, id) {
    try {
      await delay();
      const items = await this.getAll(entityType);
      const filtered = items.filter(item => item.id !== id);
      
      if (filtered.length === items.length) {
        throw new Error(`${entityType} with ID ${id} not found`);
      }
      
      await this.saveAll(entityType, filtered);
      return { success: true, id };
    } catch (error) {
      console.error(`Error deleting ${entityType}:`, error);
      throw error;
    }
  }

  /**
   * Delete multiple items by IDs
   */
  async deleteMany(entityType, ids) {
    try {
      await delay();
      const items = await this.getAll(entityType);
      const filtered = items.filter(item => !ids.includes(item.id));
      
      await this.saveAll(entityType, filtered);
      return { success: true, deletedCount: ids.length };
    } catch (error) {
      console.error(`Error deleting multiple ${entityType}:`, error);
      throw error;
    }
  }

  /**
   * Save all items to localStorage
   */
  async saveAll(entityType, items) {
    try {
      const key = this.getStorageKey(entityType);
      localStorage.setItem(key, JSON.stringify(items));
      return true;
    } catch (error) {
      console.error(`Error saving ${entityType}:`, error);
      throw new Error(`Failed to save ${entityType} records`);
    }
  }

  /**
   * Query items by a condition function
   */
  async query(entityType, condition) {
    try {
      await delay();
      const items = await this.getAll(entityType);
      return items.filter(condition);
    } catch (error) {
      console.error(`Error querying ${entityType}:`, error);
      throw error;
    }
  }

  /**
   * Find first item matching condition
   */
  async findOne(entityType, condition) {
    try {
      await delay();
      const items = await this.getAll(entityType);
      return items.find(condition) || null;
    } catch (error) {
      console.error(`Error finding ${entityType}:`, error);
      throw error;
    }
  }

  /**
   * Generate a unique ID
   */
  generateId() {
    return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Clear all data for an entity type
   */
  async clear(entityType) {
    try {
      const key = this.getStorageKey(entityType);
      localStorage.removeItem(key);
      return { success: true };
    } catch (error) {
      console.error(`Error clearing ${entityType}:`, error);
      throw error;
    }
  }

  /**
   * Clear all application data
   */
  async clearAll() {
    try {
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith(this.storagePrefix)) {
          localStorage.removeItem(key);
        }
      });
      return { success: true };
    } catch (error) {
      console.error('Error clearing all data:', error);
      throw error;
    }
  }

  /**
   * Check if entity type has data
   */
  async hasData(entityType) {
    try {
      const items = await this.getAll(entityType);
      return items.length > 0;
    } catch (error) {
      return false;
    }
  }

  /**
   * Count items of a type
   */
  async count(entityType, condition = null) {
    try {
      const items = condition 
        ? await this.query(entityType, condition)
        : await this.getAll(entityType);
      return items.length;
    } catch (error) {
      console.error(`Error counting ${entityType}:`, error);
      return 0;
    }
  }

  /**
   * Initialize with default data if empty
   */
  async initDefaultData(entityType, defaultData) {
    try {
      const hasData = await this.hasData(entityType);
      if (!hasData && Array.isArray(defaultData)) {
        await this.saveAll(entityType, defaultData);
        return true;
      }
      return false;
    } catch (error) {
      console.error(`Error initializing default data for ${entityType}:`, error);
      return false;
    }
  }
}

// Create and export singleton instance
const apiService = new ApiService();
export default apiService;

