// Chat Board API Routes für Tenant-Administrator-Kommunikation
import { Router } from 'express';
import { storage } from '../storage';
import { insertChatMessageSchema, insertChatConversationSchema } from '../../shared/schema';
import { z } from 'zod';

const router = Router();

// GET /api/chat/messages/:tenantId - Alle Nachrichten für einen Tenant
router.get('/messages/:tenantId', async (req, res) => {
  try {
    console.log(`[CHAT API] Getting messages for tenant: ${req.params.tenantId}`);
    const messages = await storage.getChatMessagesByTenant(req.params.tenantId);
    
    res.json({
      success: true,
      data: messages,
      total: messages.length
    });
  } catch (error) {
    console.error('[CHAT API] Get messages error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch messages'
    });
  }
});

// POST /api/chat/messages - Neue Nachricht erstellen
router.post('/messages', async (req, res) => {
  try {
    console.log('[CHAT API] Creating new message:', req.body);
    
    // Validierung mit Zod Schema
    const validationSchema = insertChatMessageSchema.extend({
      tenantId: z.string().min(1, 'Tenant ID ist erforderlich'),
      senderName: z.string().min(1, 'Sender Name ist erforderlich'),
      senderEmail: z.string().email('Gültige E-Mail ist erforderlich'),
      message: z.string().min(1, 'Nachricht ist erforderlich'),
      senderType: z.enum(['tenant', 'admin'])
    });

    const validatedData = validationSchema.parse(req.body);
    
    const newMessage = await storage.createChatMessage({
      tenantId: validatedData.tenantId,
      senderId: validatedData.senderId || null,
      senderType: validatedData.senderType,
      senderName: validatedData.senderName,
      senderEmail: validatedData.senderEmail,
      messageType: validatedData.messageType || 'message',
      subject: validatedData.subject,
      message: validatedData.message,
      priority: validatedData.priority || 'normal',
      attachments: validatedData.attachments || [],
      metadata: validatedData.metadata || {}
    });

    console.log('[CHAT API] Message created successfully:', newMessage.id);
    
    res.status(201).json({
      success: true,
      data: newMessage,
      message: 'Nachricht erfolgreich gesendet'
    });
  } catch (error) {
    console.error('[CHAT API] Create message error:', error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Validierungsfehler',
        details: error.errors
      });
    }
    
    return res.status(500).json({
      success: false,
      error: 'Failed to create message'
    });
  }
});

// PUT /api/chat/messages/:id/status - Nachrichtenstatus aktualisieren
router.put('/messages/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const messageId = req.params.id;
    
    if (!['unread', 'read', 'resolved', 'in_progress'].includes(status)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid status'
      });
    }

    console.log(`[CHAT API] Updating message ${messageId} status to: ${status}`);
    
    const updatedMessage = await storage.updateChatMessageStatus(
      messageId, 
      status, 
      status === 'read' ? new Date() : undefined
    );

    res.json({
      success: true,
      data: updatedMessage,
      message: `Status auf ${status} geändert`
    });
  } catch (error) {
    console.error('[CHAT API] Update status error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update message status'
    });
  }
});

// GET /api/chat/messages/unread-count/:tenantId? - Anzahl ungelesener Nachrichten
router.get('/messages/unread-count/:tenantId?', async (req, res) => {
  try {
    const tenantId = req.params.tenantId;
    const count = await storage.getUnreadChatMessagesCount(tenantId);
    
    res.json({
      success: true,
      data: { count },
      tenantId: tenantId || 'all'
    });
  } catch (error) {
    console.error('[CHAT API] Unread count error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get unread count'
    });
  }
});

// GET /api/chat/admin/messages - Alle Nachrichten für Admin-Übersicht
router.get('/admin/messages', async (req, res) => {
  try {
    console.log('[CHAT API] Getting all messages for admin');
    const messages = await storage.getAllChatMessages();
    
    // Gruppierung nach Tenant für bessere Übersicht
    const messagesByTenant = messages.reduce((acc, message) => {
      const tenantId = message.tenant_id;
      if (!acc[tenantId]) {
        acc[tenantId] = {
          tenant_name: message.tenant_name,
          tenant_subdomain: message.subdomain,
          color_scheme: message.color_scheme,
          messages: []
        };
      }
      acc[tenantId].messages.push(message);
      return acc;
    }, {} as any);

    res.json({
      success: true,
      data: {
        allMessages: messages,
        messagesByTenant,
        totalMessages: messages.length,
        unreadCount: messages.filter(m => m.status === 'unread').length
      }
    });
  } catch (error) {
    console.error('[CHAT API] Get admin messages error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch admin messages'
    });
  }
});

// GET /api/chat/conversations/:tenantId - Conversations für einen Tenant
router.get('/conversations/:tenantId', async (req, res) => {
  try {
    const conversations = await storage.getChatConversationsByTenant(req.params.tenantId);
    
    res.json({
      success: true,
      data: conversations,
      total: conversations.length
    });
  } catch (error) {
    console.error('[CHAT API] Get conversations error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch conversations'
    });
  }
});

// POST /api/chat/conversations - Neue Conversation erstellen
router.post('/conversations', async (req, res) => {
  try {
    const validationSchema = insertChatConversationSchema.extend({
      tenantId: z.string().min(1, 'Tenant ID ist erforderlich'),
      subject: z.string().min(1, 'Betreff ist erforderlich')
    });

    const validatedData = validationSchema.parse(req.body);
    
    const newConversation = await storage.createChatConversation({
      tenantId: validatedData.tenantId,
      subject: validatedData.subject,
      status: validatedData.status || 'open',
      priority: validatedData.priority || 'normal',
      participantIds: validatedData.participantIds || [],
      metadata: validatedData.metadata || {}
    });

    res.status(201).json({
      success: true,
      data: newConversation,
      message: 'Conversation erfolgreich erstellt'
    });
  } catch (error) {
    console.error('[CHAT API] Create conversation error:', error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Validierungsfehler',
        details: error.errors
      });
    }
    
    return res.status(500).json({
      success: false,
      error: 'Failed to create conversation'
    });
  }
});

export default router;