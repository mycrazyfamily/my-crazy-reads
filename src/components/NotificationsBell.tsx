// NotificationsBell v2.0
// Changelog v2.0 — LA CLOCHE NE DÉPEND PLUS DU TEMPS RÉEL.
//   L'abonnement realtime (INSERT sur notifications) existe depuis l'origine et
//   son code est correct, mais aucun événement n'arrive au navigateur : une
//   alerte n'apparaissait qu'au changement de page, quand le composant se
//   remontait et refaisait sa requête. Un parent qui reste sur son espace
//   famille n'était donc jamais prévenu.
//   L'abonnement est CONSERVÉ — il rendra la notification instantanée le jour où
//   le transport sera réparé. On lui ajoute deux filets qui, eux, marchent
//   partout : un rafraîchissement périodique, et un au retour sur l'onglet.
//   Même principe que pour les cartes : le temps réel devient un confort, pas
//   une condition de fonctionnement.
import React, { useState, useEffect, useRef, useCallback } from 'react';
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

// Retire un éventuel emoji en tout début de chaîne (+ espace) : l'icône de gauche
// porte déjà l'emoji, on évite le doublon (ex. "🎂 Léo a fêté…" → "Léo a fêté…").
const stripLeadingEmoji = (s?: string | null): string =>
  (s ?? '').replace(/^\s*\p{Extended_Pictographic}\uFE0F?\s*/u, '');

// Remappe les liens de notification vers une route existante.
// Le workflow n8n écrit un lien historique "/children/:id" qui n'existe pas
// dans le routeur → on redirige vers l'espace famille (tous les profils).
const resolveNotificationLink = (link: string | null): string | null => {
  if (!link) return null;
  if (link.startsWith('/children/')) return '/espace-famille';
  return link;
};

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

  // Intervalle de repli. 15 s : assez court pour que l'alerte suive de près le
  // basculement de la carte en rouge, assez long pour rester négligeable (une
  // requête filtrée sur un seul utilisateur).
  const FALLBACK_POLL_MS = 15000;
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

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

      // ─── Filet 1 : rafraîchissement périodique ───
      // Ne tourne que si la cloche est montée et l'onglet visible.
      const startPolling = () => {
        if (pollRef.current) return;
        pollRef.current = setInterval(() => {
          if (document.visibilityState === 'visible') fetchNotifications();
        }, FALLBACK_POLL_MS);
      };
      const stopPolling = () => {
        if (pollRef.current) {
          clearInterval(pollRef.current);
          pollRef.current = null;
        }
      };
      startPolling();

      // ─── Filet 2 : retour sur l'onglet ───
      // Couvre le parent qui laisse la page ouverte en arrière-plan pendant que
      // la génération tourne, puis y revient.
      const onFocus = () => {
        if (document.visibilityState === 'visible') fetchNotifications();
      };
      window.addEventListener('focus', onFocus);
      document.addEventListener('visibilitychange', onFocus);

      return () => {
        supabase.removeChannel(channel);
        stopPolling();
        window.removeEventListener('focus', onFocus);
        document.removeEventListener('visibilitychange', onFocus);
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
                  const target = resolveNotificationLink(notification.link);
                  if (target) {
                    navigate(target);
                  }
                  setIsOpen(false);
                }}
                className={`flex items-start gap-3 px-8 py-5 cursor-pointer hover:bg-accent/40 transition-colors ${!notification.read ? 'bg-blue-50/50' : ''}`}
              >
                <div className="shrink-0 text-3xl mt-1">
                  {notification.type === 'birthday_avatar'
                    ? '🎂'
                    : notification.type === 'age_threshold'
                      ? '⏳'
                      : notification.type === 'avatar_failed'
                        ? '⚠️'
                        : '🔔'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-base font-semibold text-foreground leading-snug">
                    {stripLeadingEmoji(notification.title || notification.content)}
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
