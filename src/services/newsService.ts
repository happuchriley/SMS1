/**
 * News Service
 * Handles news, announcements, and academic calendar
 */
import apiService from './api';

const NEWS_TYPE = 'news';
const ACADEMIC_CALENDAR_TYPE = 'academicCalendar';

interface NewsData {
  title: string;
  content: string;
  author?: string;
  status?: string;
  publishDate?: string;
  category?: string;
  [key: string]: any;
}

interface CalendarEventData {
  title: string;
  date: string;
  [key: string]: any;
}

const newsService = {
  // News Operations
  async getAllNews(): Promise<(NewsData & { id: string })[]> {
    return await apiService.getAll<NewsData & { id: string }>(NEWS_TYPE);
  },

  async getNewsById(id: string): Promise<NewsData & { id: string }> {
    return await apiService.getById<NewsData & { id: string }>(NEWS_TYPE, id);
  },

  async createNews(newsData: NewsData): Promise<NewsData & { id: string }> {
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

    return await apiService.create<NewsData & { id: string }>(NEWS_TYPE, newsData);
  },

  async updateNews(id: string, newsData: Partial<NewsData>): Promise<NewsData & { id: string }> {
    return await apiService.update<NewsData & { id: string }>(NEWS_TYPE, id, newsData);
  },

  async deleteNews(id: string): Promise<void> {
    await apiService.delete(NEWS_TYPE, id);
  },

  async getPublishedNews(): Promise<(NewsData & { id: string })[]> {
    return await apiService.query<NewsData & { id: string }>(NEWS_TYPE, (news: NewsData & { id: string }) => news.status === 'published');
  },

  async getNewsByCategory(category: string): Promise<(NewsData & { id: string })[]> {
    return await apiService.query<NewsData & { id: string }>(NEWS_TYPE, (news: NewsData & { id: string }) => news.category === category);
  },

  async searchNews(searchTerm: string): Promise<(NewsData & { id: string })[]> {
    const term = searchTerm.toLowerCase();
    return await apiService.query<NewsData & { id: string }>(NEWS_TYPE, (news: NewsData & { id: string }) => 
      (news.title ? news.title.toLowerCase().includes(term) : false) ||
      (news.content ? news.content.toLowerCase().includes(term) : false) ||
      (news.author ? news.author.toLowerCase().includes(term) : false)
    );
  },

  async getRecentNews(limit: number = 10): Promise<(NewsData & { id: string })[]> {
    const news = await this.getPublishedNews();
    return news
      .sort((a, b) => new Date(b.publishDate || 0).getTime() - new Date(a.publishDate || 0).getTime())
      .slice(0, limit);
  },

  async toggleStatus(id: string): Promise<NewsData & { id: string }> {
    const news = await this.getNewsById(id);
    const newStatus = news.status === 'published' ? 'draft' : 'published';
    return await this.updateNews(id, { status: newStatus });
  },

  // Academic Calendar Operations
  async getAllCalendarEvents(): Promise<(CalendarEventData & { id: string })[]> {
    return await apiService.getAll<CalendarEventData & { id: string }>(ACADEMIC_CALENDAR_TYPE);
  },

  async getCalendarEventById(id: string): Promise<CalendarEventData & { id: string }> {
    return await apiService.getById<CalendarEventData & { id: string }>(ACADEMIC_CALENDAR_TYPE, id);
  },

  async createCalendarEvent(eventData: CalendarEventData): Promise<CalendarEventData & { id: string }> {
    if (!eventData.title || !eventData.date) {
      throw new Error('Title and date are required');
    }
    return await apiService.create<CalendarEventData & { id: string }>(ACADEMIC_CALENDAR_TYPE, eventData);
  },

  async updateCalendarEvent(id: string, eventData: Partial<CalendarEventData>): Promise<CalendarEventData & { id: string }> {
    return await apiService.update<CalendarEventData & { id: string }>(ACADEMIC_CALENDAR_TYPE, id, eventData);
  },

  async deleteCalendarEvent(id: string): Promise<void> {
    await apiService.delete(ACADEMIC_CALENDAR_TYPE, id);
  },

  async getEventsByDateRange(startDate: string, endDate: string): Promise<(CalendarEventData & { id: string })[]> {
    return await apiService.query<CalendarEventData & { id: string }>(ACADEMIC_CALENDAR_TYPE, (event: CalendarEventData & { id: string }) => {
      const eventDate = new Date(event.date);
      const start = new Date(startDate);
      const end = new Date(endDate);
      return eventDate >= start && eventDate <= end;
    });
  },

  async getEventsByMonth(year: number, month: number): Promise<(CalendarEventData & { id: string })[]> {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);
    return await this.getEventsByDateRange(startDate.toISOString(), endDate.toISOString());
  }
};

export default newsService;

