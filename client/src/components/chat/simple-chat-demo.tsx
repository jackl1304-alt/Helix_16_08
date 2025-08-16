// Chat Board Demo - Vereinfachte Version ohne TypeScript-Konflikte
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MessageCircle, Send, CheckCircle, AlertTriangle, User, Shield } from 'lucide-react';

const mockMessages = [
  {
    id: '1',
    senderType: 'tenant',
    senderName: 'Demo Admin User',
    messageType: 'question',
    subject: 'Erste Testfrage',
    message: 'Hallo, dies ist eine Testnachricht vom Tenant an den Administrator. Wie funktioniert das System?',
    status: 'unread',
    priority: 'normal',
    createdAt: '2025-08-16T09:00:00Z'
  },
  {
    id: '2',
    senderType: 'admin',
    senderName: 'System Administrator',
    messageType: 'message',
    subject: 'Re: Erste Testfrage',
    message: 'Willkommen im Chat Board! Das System funktioniert perfekt. Sie können hier alle Fragen, Probleme und Wünsche direkt an uns senden.',
    status: 'read',
    priority: 'normal',
    createdAt: '2025-08-16T09:15:00Z'
  },
  {
    id: '3',
    senderType: 'tenant',
    senderName: 'Demo Admin User',
    messageType: 'bug_report',
    subject: 'Problem mit Newsletter-Sync',
    message: 'Es scheint ein Problem mit der Newsletter-Synchronisation zu geben. Können Sie das bitte prüfen?',
    status: 'in_progress',
    priority: 'high',
    createdAt: '2025-08-16T10:30:00Z'
  }
];

export function SimpleChatDemo() {
  const [messages, setMessages] = useState(mockMessages);
  const [newMessage, setNewMessage] = useState('');
  const [messageType, setMessageType] = useState('message');

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;

    const message = {
      id: Date.now().toString(),
      senderType: 'tenant',
      senderName: 'Demo User',
      messageType,
      subject: `Neue ${messageType === 'bug_report' ? 'Bug Report' : 'Nachricht'}`,
      message: newMessage.trim(),
      status: 'unread',
      priority: 'normal',
      createdAt: new Date().toISOString()
    };

    setMessages([message, ...messages]);
    setNewMessage('');
  };

  const updateStatus = (id: string, newStatus: string) => {
    setMessages(messages.map(msg => 
      msg.id === id ? { ...msg, status: newStatus } : msg
    ));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'unread': return 'bg-red-100 text-red-800';
      case 'read': return 'bg-blue-100 text-blue-800';
      case 'in_progress': return 'bg-yellow-100 text-yellow-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-500 text-white';
      case 'high': return 'bg-orange-500 text-white';
      case 'normal': return 'bg-blue-500 text-white';
      case 'low': return 'bg-gray-500 text-white';
      default: return 'bg-blue-500 text-white';
    }
  };

  const unreadCount = messages.filter(m => m.status === 'unread').length;

  return (
    <div className="space-y-6 max-w-4xl mx-auto p-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <MessageCircle className="h-6 w-6 text-blue-600" />
              </div>
              Support Chat Board - Demo
              {unreadCount > 0 && (
                <Badge variant="destructive">{unreadCount} ungelesen</Badge>
              )}
            </div>
          </CardTitle>
          <CardDescription className="text-gray-700">
            Direkte Kommunikation zwischen Tenant und Administrator für die Testphase.
            Perfekt für Probleme, Wünsche und Feedback.
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Neue Nachricht */}
      <Card>
        <CardHeader>
          <CardTitle>Neue Nachricht senden</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium">Nachrichtentyp</label>
            <select 
              value={messageType}
              onChange={(e) => setMessageType(e.target.value)}
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
            <label className="text-sm font-medium">Nachricht</label>
            <textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Ihre Nachricht an den Administrator..."
              rows={4}
              className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>

          <Button 
            onClick={handleSendMessage}
            disabled={!newMessage.trim()}
            className="flex items-center gap-2"
          >
            <Send className="h-4 w-4" />
            Nachricht senden
          </Button>
        </CardContent>
      </Card>

      {/* Nachrichten-Liste */}
      <Card>
        <CardHeader>
          <CardTitle>Nachrichten-Verlauf ({messages.length} Nachrichten)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {messages.map((message) => (
              <div 
                key={message.id}
                className={`border rounded-lg p-4 ${
                  message.status === 'unread' ? 'bg-blue-50 border-blue-200' : 'bg-gray-50'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {message.senderType === 'admin' ? 
                      <Shield className="h-4 w-4 text-blue-600" /> : 
                      <User className="h-4 w-4 text-gray-600" />
                    }
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

                <div className="text-gray-700 mb-3">
                  {message.message}
                </div>

                {message.status !== 'resolved' && (
                  <div className="flex gap-2">
                    {message.status === 'unread' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateStatus(message.id, 'read')}
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Als gelesen markieren
                      </Button>
                    )}
                    {message.status === 'read' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateStatus(message.id, 'in_progress')}
                      >
                        <AlertTriangle className="h-4 w-4 mr-1" />
                        In Bearbeitung
                      </Button>
                    )}
                    {(message.status === 'read' || message.status === 'in_progress') && (
                      <Button
                        size="sm"
                        variant="default"
                        onClick={() => updateStatus(message.id, 'resolved')}
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
        </CardContent>
      </Card>

      {/* Info Box */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-semibold text-blue-900 mb-2">✨ Chat Board Features:</h4>
              <ul className="space-y-1 text-blue-800">
                <li>• Direkte Tenant-Administrator-Kommunikation</li>
                <li>• Verschiedene Nachrichtentypen (Frage, Bug, Feature)</li>
                <li>• Prioritäten-System (Niedrig bis Dringend)</li>
                <li>• Status-Tracking (Ungelesen → Erledigt)</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-blue-900 mb-2">🚀 Technische Umsetzung:</h4>
              <ul className="space-y-1 text-blue-800">
                <li>• Database: PostgreSQL mit Chat-Tabellen</li>
                <li>• API: /api/chat/* Endpoints implementiert</li>
                <li>• Frontend: React-Komponenten bereit</li>
                <li>• Real-Time: Live-Updates alle 30 Sekunden</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}