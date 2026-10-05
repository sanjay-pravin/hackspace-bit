import { localDb } from './supabase';

export const notificationService = {
  async getUserNotifications(userId) {
    if (!userId) return [];
    const notifs = localDb.getNotifications().filter(n => n.user_id === userId);
    return notifs.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  },

  async markAsRead(notificationId) {
    const notifs = localDb.getNotifications();
    const idx = notifs.findIndex(n => n.id === notificationId);
    if (idx !== -1) {
      notifs[idx].is_read = true;
      localDb.saveNotifications(notifs);
      return notifs[idx];
    }
  },

  async markAllAsRead(userId) {
    const notifs = localDb.getNotifications();
    notifs.forEach(n => {
      if (n.user_id === userId) {
        n.is_read = true;
      }
    });
    localDb.saveNotifications(notifs);
    return true;
  },

  async createNotification({ userId, title, message, notificationType = 'general', relatedEventId = null }) {
    const newNotif = {
      id: `notif-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      user_id: userId,
      title,
      message,
      notification_type: notificationType,
      related_event_id: relatedEventId,
      is_read: false,
      created_at: new Date().toISOString(),
      is_demonstration: false,
    };
    const notifs = localDb.getNotifications();
    notifs.unshift(newNotif);
    localDb.saveNotifications(notifs);
    return newNotif;
  }
};