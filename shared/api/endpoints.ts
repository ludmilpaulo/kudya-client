export const API_V1_PREFIX = '/api/v1';

export const v1Endpoints = {
  businesses: `${API_V1_PREFIX}/businesses`,
  businessMe: `${API_V1_PREFIX}/businesses/me/`,
  notifications: `${API_V1_PREFIX}/notifications`,
  notificationsUnread: `${API_V1_PREFIX}/notifications/unread-count/`,
  analyticsTrack: `${API_V1_PREFIX}/analytics/track/`,
} as const;
