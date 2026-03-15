import { supabase } from './supabaseClient';
import { SupabaseNotificationRepository } from '../repositories/SupabaseNotificationRepository';
import { NotificationService } from '@/application/services/NotificationService';

const notificationRepository = new SupabaseNotificationRepository(supabase);
export const notificationService = new NotificationService(notificationRepository);
