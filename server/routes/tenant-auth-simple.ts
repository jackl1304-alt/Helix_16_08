import express from 'express';
import { neon } from "@neondatabase/serverless";

const router = express.Router();
const sql = neon(process.env.DATABASE_URL!);

// Simple tenant login for demo
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log('[TENANT AUTH] Login attempt:', { email, password });

    if (!email || !password) {
      return res.status(400).json({ 
        error: 'Email und Passwort sind erforderlich' 
      });
    }

    // Demo tenant
    const tenant = {
      id: '2d224347-b96e-4b61-acac-dbd414a0e048',
      name: 'Demo Medical Corp',
      subdomain: 'demo-medical',
      subscription_tier: 'professional'
    };

    // Demo mode - create demo user if needed
    let user;
    
    // Check for demo credentials first
    if (email === 'admin@demo-medical.local' && password === 'demo123') {
      // Demo user - bypass database lookup
      user = {
        id: 'demo-user-001',
        email: 'admin@demo-medical.local',
        name: 'Demo Admin',
        role: 'admin',
        created_at: new Date()
      };
      console.log('[TENANT AUTH] Demo user authenticated');
    } else {
      // Find user in database
      const userResult = await sql`
        SELECT id, email, name, role, created_at
        FROM users 
        WHERE email = ${email}
      `;

      user = userResult[0];
      console.log('[TENANT AUTH] User found:', user ? 'Yes' : 'No');

      if (!user) {
        return res.status(401).json({ 
          error: 'Ungültige Anmeldedaten' 
        });
      }
    }

    // Verify password
    let validPassword = false;
    
    if (email === 'admin@demo-medical.local') {
      validPassword = password === 'demo123';
    } else {
      // For real users, check actual password (simplified for demo)
      validPassword = password === 'demo123';
    }
    
    console.log('[TENANT AUTH] Password valid:', validPassword);

    if (!validPassword) {
      return res.status(401).json({ 
        error: 'Ungültige Anmeldedaten' 
      });
    }

    // Successful login
    const response = {
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      },
      tenant: {
        id: tenant.id,
        name: tenant.name,
        subdomain: tenant.subdomain,
        colorScheme: 'blue',
        subscriptionTier: tenant.subscription_tier
      }
    };

    console.log('[TENANT AUTH] Login successful for:', user.email);
    res.json(response);

  } catch (error) {
    console.error('[TENANT AUTH] Login error:', error);
    res.status(500).json({ 
      error: 'Anmeldung fehlgeschlagen',
      message: 'Bitte versuchen Sie es erneut'
    });
  }
});

// Simple logout
router.post('/logout', (req, res) => {
  res.json({ success: true, message: 'Erfolgreich abgemeldet' });
});

// Get current user profile
router.get('/profile', (req, res) => {
  res.json({
    user: { id: 'demo', email: 'admin@demo-medical.local', name: 'Demo Admin', role: 'admin' },
    tenant: { id: 'demo', name: 'Demo Medical Corp', subdomain: 'demo-medical' }
  });
});

export default router;