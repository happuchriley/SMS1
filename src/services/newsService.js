/**
 * News Service
 * Handles news, announcements, and academic calendar
 */
import apiService from './api';

const NEWS_TYPE = 'news';
const ACADEMIC_CALENDAR_TYPE = 'academicCalendar';

const newsService = {
  // News Operations
  async getAllNews() {
    return await apiService.getAll(NEWS_TYPE);
  },

  async getNewsById(id) {
    return await apiService.getById(NEWS_TYPE, id);
  },

  async createNews(newsData) {
    if (!newsData.title || !newsData.content) {
      throw new Error('Title and content are required');
    }

    if (!newsData.author) {
      newsData.author = sessionStorage.getItem('username') || 'Unknown';
    }

    if (!newsData.status) {
      newsData.status = 'draft';
    }

    if (!newsData.publishDate) {
      newsData.publishDate = new Date().toISOString().split('T')[0];
    }

    return await apiService.create(NEWS_TYPE, newsData);
  },

  async updateNews(id, newsData) {
    return await apiService.update(NEWS_TYPE, id, newsData);
  },

  async deleteNews(id) {
    return await apiService.delete(NEWS_TYPE, id);
  },

  async getPublishedNews() {
    return await apiService.query(NEWS_TYPE, news => news.status === 'published');
  },

  async getNewsByCategory(category) {
    return await apiService.query(NEWS_TYPE, news => news.category === category);
  },

  async searchNews(searchTerm) {
    const term = searchTerm.toLowerCase();
    return await apiService.query(NEWS_TYPE, news => 
      news.title.toLowerCase().includes(term) ||
      (news.content && news.content.toLowerCase().includes(term)) ||
      (news.author && news.author.toLowerCase().includes(term))
    );
  },

  async getRecentNews(limit = 10) {
    const news = await this.getPublishedNews();
    return news
      .sort((a, b) => new Date(b.publishDate) - new Date(a.publishDate))
      .slice(0, limit);
  },

  async toggleStatus(id) {
    const news = await this.getNewsById(id);
    const newStatus = news.status === 'published' ? 'draft' : 'published';
    return await this.updateNews(id, { status: newStatus });
  },

  // Academic Calendar Operations
  async getAllCalendarEvents() {
    return await apiService.getAll(ACADEMIC_CALENDAR_TYPE);
  },

  async getCalendarEventById(id) {
    return await apiService.getById(ACADEMIC_CALENDAR_TYPE, id);
  },

  async createCalendarEvent(eventData) {
    if (!eventData.title || !eventData.date) {
      throw new Error('Title and date are required');
    }
    return await apiService.create(ACADEMIC_CALENDAR_TYPE, eventData);
  },

  async updateCalendarEvent(id, eventData) {
    return await apiService.update(ACADEMIC_CALENDAR_TYPE, id, eventData);
  },

  async deleteCalendarEvent(id) {
    return await apiService.delete(ACADEMIC_CALENDAR_TYPE, id);
  },

  async getEventsByDateRange(startDate, endDate) {
    return await apiService.query(ACADEMIC_CALENDAR_TYPE, event => {
      const eventDate = new Date(event.date);
      const start = new Date(startDate);
      const end = new Date(endDate);
      return eventDate >= start && eventDate <= end;
    });
  },

  async getEventsByMonth(year, month) {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);
    return await this.getEventsByDateRange(startDate, endDate);
  }
};

export default newsService;

