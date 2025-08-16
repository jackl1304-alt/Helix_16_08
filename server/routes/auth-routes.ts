import express from 'express';
// Simple password validation for demo (replace with bcrypt in production)
import { neon } from "@neondatabase/serverless";
import { TenantRequest } from '../middleware/tenant-isolation';

const router = express.Router();
const sql = neon(process.env.DATABASE_URL!);

/**
 * Tenant Login
 * Authenticates users within their tenant context
 */
router.post('/login', async (req: TenantRequest, res) => {
  try {
    const { email, password } = req.body;
    const tenantSubdomain = req.headers['x-tenant-subdomain'] as string;

    if (!email || !password) {
      return res.status(400).json({ 
        error: 'Email und Passwort sind erforderlich' 
      });
    }

    // Use demo tenant for testing (simplified)
    const tenant = {
      id: '2d224347-b96e-4b61-acac-dbd414a0e048',
      name: 'Demo Medical Corp',
      subdomain: 'demo-medical',
      subscription_tier: 'professional'
    };

    // Find user (simplified for demo)
    const userResult = await sql`
      SELECT id, email, name, role, created_at
      FROM users 
      WHERE email = ${email}
    `;

    const user = userResult[0];
    if (!user) {
      return res.status(401).json({ 
        error: 'Ungültige Anmeldedaten' 
      });
    }

    // Verify password (demo implementation)
    const validPassword = password === 'demo123';

    if (!validPassword) {
      return res.status(401).json({ 
        error: 'Ungültige Anmeldedaten' 
      });
    }

    // Update last login (skip for demo)
    try {
      await sql`
        UPDATE users 
        SET updated_at = NOW() 
        WHERE id = ${user.id}
      `;
    } catch (error) {
      console.log('[AUTH] Update user login time skipped:', error.message);
    }

    // Create session
    const sessionUser = {
      id: user.id,
      tenantId: tenant.id,
      email: user.email,
      name: user.name,
      role: user.role
    };

    // Store in session
    if (req.session) {
      req.session.user = sessionUser;
    }

    res.json({
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
    });

  } catch (error) {
    console.error('[AUTH] Login error:', error);
    res.status(500).json({ 
      error: 'Anmeldung fehlgeschlagen',
      message: 'Bitte versuchen Sie es erneut oder kontaktieren Sie den Support'
    });
  }
});

/**
 * Tenant Logout
 */
router.post('/logout', async (req: TenantRequest, res) => {
  try {
    if (req.session) {
      req.session.destroy((err) => {
        if (err) {
          console.error('[AUTH] Logout error:', err);
          return res.status(500).json({ error: 'Abmeldung fehlgeschlagen' });
        }
        res.json({ success: true, message: 'Erfolgreich abgemeldet' });
      });
    } else {
      res.json({ success: true, message: 'Bereits abgemeldet' });
    }
  } catch (error) {
    console.error('[AUTH] Logout error:', error);
    res.status(500).json({ error: 'Abmeldung fehlgeschlagen' });
  }
});

/**
 * Current User Profile
 */
router.get('/profile', async (req: TenantRequest, res) => {
  try {
    if (!req.user || !req.tenant) {
      return res.status(401).json({ error: 'Nicht angemeldet' });
    }

    res.json({
      user: {
        id: req.user.id,
        email: req.user.email,
        name: req.user.name,
        role: req.user.role
      },
      tenant: {
        id: req.tenant.id,
        name: req.tenant.name,
        subdomain: req.tenant.subdomain,
        colorScheme: req.tenant.colorScheme,
        subscriptionTier: req.tenant.subscriptionTier
      }
    });
  } catch (error) {
    console.error('[AUTH] Profile error:', error);
    res.status(500).json({ error: 'Profil konnte nicht geladen werden' });
  }
});

export default router;