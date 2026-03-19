import { supabase } from '@/infrastructure/core/supabaseClient';
import { SupabaseNotificationRepository } from './repositories/SupabaseNotificationRepository';
import { NotificationService } from '@/application/modules/notifications/services/NotificationService';

const notificationRepository = new SupabaseNotificationRepository(supabase);
export const notificationService = new NotificationService(notificationRepository);
