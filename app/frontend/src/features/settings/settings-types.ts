export type SettingsSection = 'account' | 'privacy' | 'notifications' | 'display' | 'security';

export interface UserSettings {
    language: string;
    theme: 'light' | 'dark' | 'system';
    email_notifications: boolean;
    push_notifications: boolean;
    profile_visibility: 'public' | 'connections' | 'private';
}
