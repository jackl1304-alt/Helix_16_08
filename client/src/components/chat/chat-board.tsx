// Chat Board Komponente für Tenant-Administrator-Kommunikation
import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import {
  MessageCircle,
  Send,
  Clock,
  CheckCircle,
  AlertTriangle,
  User,
  Shield,
  Star,
  Bug,
  HelpCircle,
  MessageSquare
} from 'lucide-react';

interface ChatMessage {
  id: string;
  tenantId: string;
  senderId?: string;
  senderType: 'tenant' | 'admin';
  senderName: string;
  senderEmail: string;
  messageType: 'message' | 'feature_request' | 'bug_report' | 'question' | 'feedback';
  subject?: string;
  message: string;
  status: 'unread' | 'read' | 'resolved' | 'in_progress';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  createdAt: string;
  readAt?: string;
  tenantName?: string;
  subdomain?: string;
}

interface ChatBoardProps {
  tenantId: string;
  userType: 'tenant' | 'admin';
  userEmail: string;
  userName: string;
}

export function ChatBoard({ tenantId, userType, userEmail, userName }: ChatBoardProps) {
  const [newMessage, setNewMessage] = useState('');
  const [newSubject, setNewSubject] = useState('');
  const [messageType, setMessageType] = useState<ChatMessage['messageType']>('message');
  const [priority, setPriority] = useState<ChatMessage['priority']>('normal');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Messages für aktuellen Tenant abrufen
  const { data: messages = [], isLoading, error } = useQuery({
    queryKey: ['/api/chat/messages', tenantId],
    queryFn: async () => {
      const response = await fetch(`/api/chat/messages/${tenantId}`);
      if (!response.ok) throw new Error('Failed to fetch messages');
      const result = await response.json();
      return result.data || [];
    },
    refetchInterval: 30000, // Alle 30 Sekunden aktualisieren
  });

  // Ungelesene Nachrichten-Count
  const { data: unreadCount = 0 } = useQuery({
    queryKey: ['/api/chat/messages/unread-count', tenantId],
    queryFn: async () => {
      const response = await fetch(`/api/chat/messages/unread-count/${tenantId}`);
      if (!response.ok) throw new Error('Failed to fetch unread count');
      const result = await response.json();
      return result.data.count || 0;
    },
    refetchInterval: 10000, // Alle 10 Sekunden aktualisieren
  });

  // Nachricht senden
  const sendMessageMutation = useMutation({
    mutationFn: async (messageData: any) => {
      return apiRequest('/api/chat/messages', {
        method: 'POST',
        body: JSON.stringify(messageData),
      });
    },
    onSuccess: () => {
      setNewMessage('');
      setNewSubject('');
      setMessageType('message');
      setPriority('normal');
      toast({
        title: "Nachricht gesendet",
        description: "Ihre Nachricht wurde erfolgreich an den Administrator gesendet.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/chat/messages', tenantId] });
      queryClient.invalidateQueries({ queryKey: ['/api/chat/messages/unread-count', tenantId] });
    },
    onError: () => {
      toast({
        title: "Fehler",
        description: "Nachricht konnte nicht gesendet werden.",
        variant: "destructive"
      });
    }
  });

  // Nachrichtenstatus ändern (für Admin)
  const updateStatusMutation = useMutation({
    mutationFn: async ({ messageId, status }: { messageId: string; status: string }) => {
      return apiRequest(`/api/chat/messages/${messageId}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/chat/messages', tenantId] });
      queryClient.invalidateQueries({ queryKey: ['/api/chat/messages/unread-count', tenantId] });
      toast({
        title: "Status aktualisiert",
        description: "Nachrichtenstatus wurde erfolgreich geändert.",
      });
    }
  });

  const handleSendMessage = () => {
    if (!newMessage.trim()) {
      toast({
        title: "Fehler",
        description: "Bitte geben Sie eine Nachricht ein.",
        variant: "destructive"
      });
      return;
    }

    sendMessageMutation.mutate({
      tenantId,
      senderType: userType,
      senderName: userName,
      senderEmail: userEmail,
      messageType,
      subject: newSubject.trim() || undefined,
      message: newMessage.trim(),
      priority,
    });
  };

  const getMessageTypeIcon = (type: ChatMessage['messageType']) => {
    switch (type) {
      case 'feature_request': return <Star className="h-4 w-4" />;
      case 'bug_report': return <Bug className="h-4 w-4" />;
      case 'question': return <HelpCircle className="h-4 w-4" />;
      case 'feedback': return <MessageSquare className="h-4 w-4" />;
      default: return <MessageCircle className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: ChatMessage['status']) => {
    switch (status) {
      case 'unread': return 'bg-red-100 text-red-800';
      case 'read': return 'bg-blue-100 text-blue-800';
      case 'in_progress': return 'bg-yellow-100 text-yellow-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: ChatMessage['priority']) => {
    switch (priority) {
      case 'urgent': return 'bg-red-500 text-white';
      case 'high': return 'bg-orange-500 text-white';
      case 'normal': return 'bg-blue-500 text-white';
      case 'low': return 'bg-gray-500 text-white';
      default: return 'bg-blue-500 text-white';
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            Chat Board wird geladen...
          </CardTitle>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              Chat Board - Direkte Kommunikation
              {unreadCount > 0 && (
                <Badge variant="destructive">{unreadCount} ungelesen</Badge>
              )}
            </div>
            {userType === 'admin' && <Shield className="h-5 w-5 text-blue-600" />}
          </CardTitle>
          <CardDescription>
            {userType === 'tenant' 
              ? 'Hier können Sie direkt mit dem Administrator kommunizieren. Perfekt für die Testphase um Probleme oder Wünsche zu melden.'
              : 'Nachrichten von Tenants verwalten und beantworten.'
            }
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Neue Nachricht erstellen */}
      {userType === 'tenant' && (
        <Card>
          <CardHeader>
            <CardTitle>Neue Nachricht senden</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Nachrichtentyp</label>
                <select 
                  value={messageType} 
                  onChange={(e) => setMessageType(e.target.value as ChatMessage['messageType'])}
                  className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="message">Allgemeine Nachricht</option>
                  <option value="question">Frage</option>
                  <option value="bug_report">Bug Report</option>
                  <option value="feature_request">Feature-Wunsch</option>
                  <option value="feedback">Feedback</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">Priorität</label>
                <select 
                  value={priority} 
                  onChange={(e) => setPriority(e.target.value as ChatMessage['priority'])}
                  className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="low">Niedrig</option>
                  <option value="normal">Normal</option>
                  <option value="high">Hoch</option>
                  <option value="urgent">Dringend</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">Betreff (optional)</label>
              <Input
                value={newSubject}
                onChange={(e) => setNewSubject(e.target.value)}
                placeholder="Kurzer Betreff..."
                className="mt-1"
              />
            </div>

            <div>
              <label className="text-sm font-medium">Nachricht</label>
              <Textarea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Ihre Nachricht an den Administrator..."
                rows={4}
                className="mt-1"
              />
            </div>

            <Button 
              onClick={handleSendMessage}
              disabled={sendMessageMutation.isPending || !newMessage.trim()}
              className="flex items-center gap-2"
            >
              <Send className="h-4 w-4" />
              {sendMessageMutation.isPending ? 'Wird gesendet...' : 'Nachricht senden'}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Nachrichten-Liste */}
      <Card>
        <CardHeader>
          <CardTitle>Nachrichten-Verlauf</CardTitle>
        </CardHeader>
        <CardContent>
          {messages.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Noch keine Nachrichten vorhanden.</p>
              {userType === 'tenant' && (
                <p className="text-sm mt-2">Senden Sie Ihre erste Nachricht an den Administrator!</p>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((message: ChatMessage) => (
                <div 
                  key={message.id}
                  className={`border rounded-lg p-4 ${
                    message.status === 'unread' ? 'bg-blue-50 border-blue-200' : 'bg-gray-50'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {getMessageTypeIcon(message.messageType)}
                      <span className="font-medium">{message.senderName}</span>
                      <Badge variant={message.senderType === 'admin' ? 'default' : 'secondary'}>
                        {message.senderType === 'admin' ? 'Administrator' : 'Tenant'}
                      </Badge>
                      <Badge className={getPriorityColor(message.priority)}>
                        {message.priority.toUpperCase()}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getStatusColor(message.status)}>
                        {message.status}
                      </Badge>
                      <span className="text-sm text-gray-500">
                        {new Date(message.createdAt).toLocaleDateString('de-DE', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                  </div>

                  {message.subject && (
                    <div className="font-medium text-gray-900 mb-2">
                      {message.subject}
                    </div>
                  )}

                  <div className="text-gray-700 whitespace-pre-wrap mb-3">
                    {message.message}
                  </div>

                  {userType === 'admin' && message.status !== 'resolved' && (
                    <div className="flex gap-2">
                      {message.status === 'unread' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateStatusMutation.mutate({ 
                            messageId: message.id, 
                            status: 'read' 
                          })}
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Als gelesen markieren
                        </Button>
                      )}
                      {message.status === 'read' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateStatusMutation.mutate({ 
                            messageId: message.id, 
                            status: 'in_progress' 
                          })}
                        >
                          <Clock className="h-4 w-4 mr-1" />
                          In Bearbeitung
                        </Button>
                      )}
                      {(message.status === 'read' || message.status === 'in_progress') && (
                        <Button
                          size="sm"
                          variant="default"
                          onClick={() => updateStatusMutation.mutate({ 
                            messageId: message.id, 
                            status: 'resolved' 
                          })}
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Erledigt
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}