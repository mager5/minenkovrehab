const express = require('express');
const { signJwt } = require('../utils/jwt');

const router = express.Router();

function requireAdmin(req, res) {
  const expected = process.env.ADMIN_SECRET || '';
  const provided = String(
    req.headers['x-admin-secret'] || req.query?.secret || ''
  ).trim();
  if (!expected || provided !== expected) {
    res.status(404).send('Not Found');
    return false;
  }
  return true;
}

function getSupabaseConfig() {
  const url = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url) throw new Error('SUPABASE_URL is not set');
  if (!serviceRoleKey) throw new Error('SUPABASE_SERVICE_ROLE_KEY is not set');
  return { url, serviceRoleKey };
}

async function supabaseRestRequest(pathWithQuery, method, body, prefer) {
  const { url, serviceRoleKey } = getSupabaseConfig();
  const response = await fetch(`${url}${pathWithQuery}`, {
    method,
    headers: {
      apikey: serviceRoleKey,
      Authorization: `Bearer ${serviceRoleKey}`,
      'Content-Type': 'application/json',
      Prefer: prefer || 'return=representation',
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await response.json().catch(() => null);
  return { response, data };
}

async function resendEmail({ to, subject, html }) {
  if (!process.env.RESEND_API_KEY) {
    return { ok: false, error: 'RESEND_API_KEY is missing' };
  }

  const from =
    process.env.RESEND_FROM ||
    'Вадим Миненков | Реабилитация <noreply@minenkovrehab.ru>';

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ from, to, subject, html }),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    return {
      ok: false,
      error: data?.message || data?.error || `Resend error: ${response.status}`,
    };
  }

  return { ok: true, data };
}

async function writeAuditLog({
  invoiceId,
  event,
  productSlug,
  email,
  userId,
  payload,
}) {
  try {
    await supabaseRestRequest('/rest/v1/payment_audit_logs', 'POST', {
      invoice_id: invoiceId ? Number(invoiceId) : null,
      event: String(event || ''),
      product_slug: productSlug ? String(productSlug) : null,
      email: email ? String(email) : null,
      user_id: userId ? String(userId) : null,
      payload: payload ?? {},
    });
  } catch (_e) {
    return;
  }
}

router.get('/invoices', async (req, res) => {
  try {
    if (!requireAdmin(req, res)) return;

    const status =
      typeof req.query?.status === 'string' ? req.query.status : '';
    const email = typeof req.query?.email === 'string' ? req.query.email : '';
    const limitRaw =
      typeof req.query?.limit === 'string' ? req.query.limit : '';
    const limit = Math.min(
      200,
      Math.max(1, Number.parseInt(limitRaw || '50', 10))
    );

    const parts = ['/rest/v1/payment_invoices?select=*'];
    if (status) parts.push(`&status=eq.${encodeURIComponent(status)}`);
    if (email) parts.push(`&email=ilike.${encodeURIComponent(`%${email}%`)}`);
    parts.push(`&order=created_at.desc&limit=${limit}`);

    const { response, data } = await supabaseRestRequest(parts.join(''), 'GET');
    if (!response.ok) {
      return res.status(500).json({ success: false, error: 'Supabase error' });
    }
    return res.json({ success: true, data: { invoices: data } });
  } catch (error) {
    console.error('Admin invoices error:', error);
    return res.status(500).json({ success: false, error: 'Internal error' });
  }
});

router.post('/invoices/:invoiceId/resend-email', async (req, res) => {
  try {
    if (!requireAdmin(req, res)) return;

    const invoiceId = String(req.params.invoiceId || '').trim();
    if (!invoiceId) {
      return res
        .status(400)
        .json({ success: false, error: 'invoiceId required' });
    }

    const invoiceLookup = await supabaseRestRequest(
      `/rest/v1/payment_invoices?select=*&invoice_id=eq.${encodeURIComponent(invoiceId)}&limit=1`,
      'GET'
    );
    const invoice =
      invoiceLookup.response.ok && Array.isArray(invoiceLookup.data)
        ? invoiceLookup.data[0]
        : null;
    if (!invoice) {
      return res
        .status(404)
        .json({ success: false, error: 'Invoice not found' });
    }

    const email = String(invoice.email || '').toLowerCase();
    const productSlug = String(invoice.product_slug || '');
    const userId = invoice.user_id ? String(invoice.user_id) : null;
    if (!email || !userId) {
      return res.status(400).json({
        success: false,
        error: 'Invoice missing email/user_id',
      });
    }

    const apiUrl = process.env.API_PUBLIC_URL || 'https://api.minenkovrehab.ru';
    const siteUrl = process.env.FRONTEND_URL || 'https://minenkovrehab.ru';

    const magicToken = signJwt(
      {
        typ: 'magic',
        sub: userId,
        email,
        full_name: invoice?.metadata?.name || 'Покупатель',
      },
      60 * 30
    );
    const magicUrl = `${apiUrl}/api/auth/magic?token=${encodeURIComponent(
      magicToken
    )}&next=${encodeURIComponent('/dashboard')}`;

    const html = `<div style="font-family: Arial, sans-serif; line-height: 1.5;">
        <h2>Доступ к курсу открыт</h2>
        <p><strong>Курс:</strong> ${productSlug}</p>
        <p>Войти по ссылке: <a href="${magicUrl}">${magicUrl}</a></p>
        <p>Личный кабинет: <a href="${siteUrl}/dashboard">${siteUrl}/dashboard</a></p>
      </div>`;

    const emailResult = await resendEmail({
      to: email,
      subject: 'Доступ к курсу открыт',
      html,
    });

    const meta = invoice.metadata || {};
    await supabaseRestRequest(
      `/rest/v1/payment_invoices?invoice_id=eq.${encodeURIComponent(invoiceId)}`,
      'PATCH',
      {
        metadata: {
          ...meta,
          email_status: emailResult.ok ? 'sent' : 'failed',
          email_error: emailResult.ok ? null : emailResult.error,
          email_attempts: Number(meta?.email_attempts || 0) + 1,
        },
      }
    );

    await writeAuditLog({
      invoiceId,
      event: emailResult.ok ? 'email.sent' : 'email.failed',
      productSlug,
      email,
      userId,
      payload: {
        via: 'admin.resend',
        error: emailResult.ok ? null : emailResult.error,
      },
    });

    return res.json({ success: true, data: { emailSent: emailResult.ok } });
  } catch (error) {
    console.error('Admin resend-email error:', error);
    return res.status(500).json({ success: false, error: 'Internal error' });
  }
});

router.post('/purchases/:purchaseId/revoke', async (req, res) => {
  try {
    if (!requireAdmin(req, res)) return;

    const purchaseId = String(req.params.purchaseId || '').trim();
    if (!purchaseId) {
      return res
        .status(400)
        .json({ success: false, error: 'purchaseId required' });
    }

    const { response } = await supabaseRestRequest(
      `/rest/v1/purchases?id=eq.${encodeURIComponent(purchaseId)}`,
      'PATCH',
      { status: 'refunded' }
    );
    if (!response.ok) {
      return res.status(500).json({ success: false, error: 'Supabase error' });
    }
    return res.json({ success: true });
  } catch (error) {
    console.error('Admin revoke error:', error);
    return res.status(500).json({ success: false, error: 'Internal error' });
  }
});

router.get('/users/count', async (req, res) => {
  try {
    if (!requireAdmin(req, res)) return;

    const { response, data } = await supabaseRestRequest(
      '/rest/v1/profiles?select=count',
      'GET'
    );
    if (!response.ok) {
      return res.status(500).json({ success: false, error: 'Supabase error' });
    }
    const count =
      Array.isArray(data) && data[0]?.count ? Number(data[0].count) : 0;
    return res.json({ success: true, data: { totalUsers: count } });
  } catch (error) {
    console.error('Admin users count error:', error);
    return res.status(500).json({ success: false, error: 'Internal error' });
  }
});

router.get('/users/list', async (req, res) => {
  try {
    if (!requireAdmin(req, res)) return;

    const limitRaw =
      typeof req.query?.limit === 'string' ? req.query.limit : '';
    const offsetRaw =
      typeof req.query?.offset === 'string' ? req.query.offset : '';
    const limit = Math.min(
      100,
      Math.max(1, Number.parseInt(limitRaw || '20', 10))
    );
    const offset = Math.max(0, Number.parseInt(offsetRaw || '0', 10));

    // Get profiles with purchase counts
    const { response: profilesResponse, data: profiles } =
      await supabaseRestRequest(
        `/rest/v1/profiles?select=id,email,full_name,created_at&order=created_at.desc&limit=${limit}&offset=${offset}`,
        'GET'
      );

    if (!profilesResponse.ok) {
      return res.status(500).json({ success: false, error: 'Supabase error' });
    }

    if (!Array.isArray(profiles)) {
      return res.json({ success: true, data: { users: [] } });
    }

    // Get all purchases for these users to calculate active counts
    const userIds = profiles.map(p => p.id);
    const purchaseCounts = {};
    if (userIds.length > 0) {
      const { response: purchasesResponse, data: purchases } =
        await supabaseRestRequest(
          `/rest/v1/purchases?select=user_id,status&user_id=in.(${encodeURIComponent(`(${userIds.join(',')})`)})`,
          'GET'
        );
      if (purchasesResponse.ok && Array.isArray(purchases)) {
        for (const purchase of purchases) {
          if (!purchaseCounts[purchase.user_id]) {
            purchaseCounts[purchase.user_id] = { total: 0, active: 0 };
          }
          purchaseCounts[purchase.user_id].total++;
          if (purchase.status === 'active') {
            purchaseCounts[purchase.user_id].active++;
          }
        }
      }
    }

    // Combine data
    const users = profiles.map(p => ({
      id: p.id,
      email: p.email,
      full_name: p.full_name,
      created_at: p.created_at,
      total_purchases: purchaseCounts[p.id]?.total || 0,
      active_purchases: purchaseCounts[p.id]?.active || 0,
    }));

    return res.json({ success: true, data: { users } });
  } catch (error) {
    console.error('Admin users list error:', error);
    return res.status(500).json({ success: false, error: 'Internal error' });
  }
});

module.exports = router;
