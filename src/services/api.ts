/**
 * Base API Service
 * Provides CRUD operations with localStorage persistence
 * Simulates backend API calls with async/await patterns
 */

// Delay simulation for realistic API behavior
const delay = (ms: number = 100): Promise<void> => new Promise(resolve => setTimeout(resolve, ms));

class ApiService {
  private storagePrefix: string;
  private version: string;

  constructor() {
    this.storagePrefix = 'sms_';
    this.version = '1.0.0';
  }

  /**
   * Get storage key for an entity type
   */
  getStorageKey(entityType: string): string {
    return `${this.storagePrefix}${entityType}`;
  }

  /**
   * Get all items of a type
   */
  async getAll<T = any>(entityType: string): Promise<T[]> {
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
  async getById<T = any>(entityType: string, id: string): Promise<T> {
    try {
      await delay();
      const items = await this.getAll<T>(entityType);
      const item = items.find((item: any) => item.id === id);
      
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
  async create<T = any>(entityType: string, data: Partial<T>): Promise<T> {
    try {
      await delay();
      const items = await this.getAll<T>(entityType);
      
      // Generate ID if not provided
      const newItem = {
        ...data,
        id: (data as any).id || this.generateId(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      } as T;
      
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
  async update<T = any>(entityType: string, id: string, data: Partial<T>): Promise<T> {
    try {
      await delay();
      const items = await this.getAll<T>(entityType);
      const index = items.findIndex((item: any) => item.id === id);
      
      if (index === -1) {
        throw new Error(`${entityType} with ID ${id} not found`);
      }
      
      items[index] = {
        ...items[index],
        ...data,
        id, // Ensure ID doesn't change
        updatedAt: new Date().toISOString()
      } as T;
      
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
  async delete(entityType: string, id: string): Promise<{ success: boolean; id: string }> {
    try {
      await delay();
      const items = await this.getAll(entityType);
      const filtered = items.filter((item: any) => item.id !== id);
      
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
  async deleteMany(entityType: string, ids: string[]): Promise<{ success: boolean; deletedCount: number }> {
    try {
      await delay();
      const items = await this.getAll(entityType);
      const filtered = items.filter((item: any) => !ids.includes(item.id));
      
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
  async saveAll<T = any>(entityType: string, items: T[]): Promise<boolean> {
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
  async query<T = any>(entityType: string, condition: (item: T) => boolean): Promise<T[]> {
    try {
      await delay();
      const items = await this.getAll<T>(entityType);
      return items.filter(condition);
    } catch (error) {
      console.error(`Error querying ${entityType}:`, error);
      throw error;
    }
  }

  /**
   * Find first item matching condition
   */
  async findOne<T = any>(entityType: string, condition: (item: T) => boolean): Promise<T | null> {
    try {
      await delay();
      const items = await this.getAll<T>(entityType);
      return items.find(condition) || null;
    } catch (error) {
      console.error(`Error finding ${entityType}:`, error);
      throw error;
    }
  }

  /**
   * Generate a unique ID
   */
  generateId(): string {
    return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Clear all data for an entity type
   */
  async clear(entityType: string): Promise<{ success: boolean }> {
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
  async clearAll(): Promise<{ success: boolean }> {
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
  async hasData(entityType: string): Promise<boolean> {
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
  async count(entityType: string, condition: ((item: any) => boolean) | null = null): Promise<number> {
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
  async initDefaultData<T = any>(entityType: string, defaultData: T[]): Promise<boolean> {
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

