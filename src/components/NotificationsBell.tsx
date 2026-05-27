import React, { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

import { toast } from 'sonner';

interface Notification {
  id: string;
  content: string;
  title: string | null;
  type: string | null;
  link: string | null;
  family_id: string | null;
  read: boolean;
  created_at: string;
}

const NotificationsBell: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const { isAuthenticated, supabaseSession } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  const fetchNotifications = async () => {
    if (!isAuthenticated || !supabaseSession?.user) return;

    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', supabaseSession.user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Erreur lors du chargement des notifications:', error);
      return;
    }

    setNotifications(data || []);
    setUnreadCount(data?.filter(n => !n.read).length || 0);
  };

  const markAsRead = async (notificationId: string) => {
    await supabase
      .from('notifications')
      .update({ read: true, updated_at: new Date().toISOString() })
      .eq('id', notificationId);
  };

  const markAllAsRead = async () => {
    await supabase.from('notifications').update({ read: true, updated_at: new Date().toISOString() }).eq('user_id', supabaseSession!.user!.id);
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchNotifications();

      const channel = supabase
        .channel('notifications-realtime')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'notifications',
            filter: `user_id=eq.${supabaseSession?.user?.id}`,
          },
          (payload) => {
            setNotifications(prev => [payload.new as Notification, ...prev]);
            setUnreadCount(prev => prev + 1);
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [isAuthenticated, supabaseSession?.user?.id]);

  if (!isAuthenticated) return null;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <button className="relative p-2 hover:bg-muted rounded-full transition-colors">
          <Bell size={20} className="text-foreground" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs animate-bounce"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </button>
      </DialogTrigger>
      <DialogContent className="w-[95vw] max-w-2xl max-h-[80vh] p-0 overflow-hidden rounded-2xl">
        <DialogHeader className="px-8 pt-7 pb-5 border-b flex flex-row items-center justify-between space-y-0">
          <DialogTitle className="text-xl font-bold">Notifications</DialogTitle>
          {unreadCount > 0 && (
            <button onClick={markAllAsRead} className="text-xs text-blue-500 hover:text-blue-700 font-medium transition-colors">
              Tout marquer comme lu
            </button>
          )}
        </DialogHeader>

        <div className="divide-y divide-border overflow-y-auto" style={{ maxHeight: 'calc(80vh - 80px)' }}>
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
              <Bell size={40} className="text-muted-foreground/30 mb-3" />
              <p className="text-sm font-medium text-muted-foreground">Aucune notification pour le moment</p>
              <p className="text-xs text-muted-foreground/60 mt-1">Les mises à jour importantes apparaîtront ici</p>
            </div>
          ) : (
            notifications.map((notification) => (
              <div
                key={notification.id}
                onClick={async () => {
                  setNotifications(prev =>
                    prev.map(n => n.id === notification.id ? { ...n, read: true } : n)
                  );
                  setUnreadCount(prev => notification.read ? prev : Math.max(0, prev - 1));
                  await markAsRead(notification.id);
                  if (notification.link) {
                    navigate(notification.link);
                  }
                  setIsOpen(false);
                }}
                className={`flex items-start gap-3 px-8 py-5 cursor-pointer hover:bg-accent/40 transition-colors ${!notification.read ? 'bg-blue-50/50' : ''}`}
              >
                <div className="shrink-0 text-3xl mt-1">
                  {notification.type === 'birthday_avatar' ? '🎂' : notification.type === 'age_threshold' ? '⏳' : '🔔'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-base font-semibold text-foreground leading-snug">
                    {notification.title || notification.content}
                  </p>
                  {notification.title && (
                    <p className="text-sm text-muted-foreground mt-0.5 leading-relaxed">{notification.content}</p>
                  )}
                  <p className="text-xs text-muted-foreground mt-2">
                    {new Date(notification.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                {!notification.read && (
                  <span className="shrink-0 mt-2 h-2 w-2 rounded-full bg-blue-500" />
                )}
              </div>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default NotificationsBell;
