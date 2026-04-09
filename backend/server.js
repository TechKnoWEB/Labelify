const express = require('express');
const cors = require('cors');
const puppeteer = require('puppeteer-core');
const chromium = require('@sparticuz/chromium');
const multer = require('multer');
const { parse } = require('csv-parse/sync');
const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
require('dotenv').config({ path: require('path').join(__dirname, '.env') });
const Razorpay = require('razorpay');
const { createClient } = require('@supabase/supabase-js');

const disposableEmailDomains = new Set(
  JSON.parse(fs.readFileSync(path.join(__dirname, 'disposable_email.json'), 'utf8'))
);

const razorpay = new Razorpay({
  key_id:     process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

process.on('uncaughtException', (err) => {
  console.error('[uncaughtException]', err);
});
process.on('unhandledRejection', (reason) => {
  console.error('[unhandledRejection]', reason);
});

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' }));

const upload = multer({ dest: '/tmp/uploads/' });

function buildLabelRows(data) {
  // If row grouping metadata is present, use it to render inline fields correctly
  if (data._rows && Array.isArray(data._rows)) {
    return data._rows.map(rowGroup => {
      const cells = rowGroup.map(field => {
        const value = data[field.key] || '';
        const styles = [
          `font-size:${field.fontSize || '10pt'}`,
          `font-family:${field.fontFamily || 'Arial, sans-serif'}`,
          field.bold   ? 'font-weight:bold'   : '',
          field.italic ? 'font-style:italic'  : '',
        ].filter(Boolean).join(';');
        return `<span class="field-cell" style="${styles}">${value}</span>`;
      }).join('');
      return `<div class="row">${cells}</div>`;
    }).join('');
  }
  // Fallback: flat key/value (legacy, no row info)
  return Object.keys(data)
    .filter(k => k !== '_rows')
    .map(key => `<div class="row"><span class="field-cell">${data[key]}</span></div>`)
    .join('');
}

function generateHTMLTemplate(labels) {
  const labelsPerPage = 30; // Avery 5160 standard
  const pages = [];

  for (let i = 0; i < labels.length; i += labelsPerPage) {
    const pageLabels = labels.slice(i, i + labelsPerPage);
    const labelCells = pageLabels.map(data => {
      return `<div class="label-cell">${buildLabelRows(data)}</div>`;
    }).join('');

    pages.push(`
      <div class="page">
        <div class="label-grid">
          ${labelCells}
        </div>
      </div>
    `);
  }

  return `
    <html>
      <head>
        <style>
          body { margin: 0; padding: 0; background: #fff; }
          .page {
            width: 8.5in;
            height: 11in;
            padding: 0.5in 0.1875in;
            box-sizing: border-box;
            page-break-after: always;
          }
          .label-grid {
            display: grid;
            grid-template-columns: repeat(3, 2.625in);
            grid-auto-rows: 1in;
            column-gap: 0.125in;
            row-gap: 0;
          }
          .label-cell {
            width: 2.625in;
            height: 1in;
            padding: 0.125in 0.25in;
            box-sizing: border-box;
            display: flex;
            flex-direction: column;
            justify-content: center;
            font-family: Arial, sans-serif;
            font-size: 10pt;
            overflow: hidden;
            line-height: 1.2;
          }
          .row {
            display: flex;
            flex-direction: row;
            gap: 4pt;
            margin-bottom: 2pt;
            white-space: nowrap;
            overflow: hidden;
          }
          .field-cell {
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }
        </style>
      </head>
      <body>
        ${pages.join('')}
      </body>
    </html>
  `;
}

app.post('/api/check-email', (req, res) => {
  const { email } = req.body;
  if (!email || typeof email !== 'string') {
    return res.status(400).json({ error: 'Email is required' });
  }
  const domain = email.split('@')[1]?.toLowerCase();
  if (!domain) return res.status(400).json({ error: 'Invalid email' });
  if (disposableEmailDomains.has(domain)) {
    return res.status(400).json({ blocked: true, error: 'Disposable email addresses are not allowed. Please use a real email.' });
  }
  res.json({ blocked: false });
});

app.post('/api/parse-csv', upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  try {
    const content = fs.readFileSync(req.file.path, 'utf8');
    const records = parse(content, { columns: true, skip_empty_lines: true, trim: true });
    fs.unlinkSync(req.file.path);
    if (records.length === 0) return res.status(400).json({ error: 'CSV file is empty' });
    const headers = Object.keys(records[0]);
    const rows = records.map(r => headers.map(h => r[h]));
    res.json({ headers, rows });
  } catch (err) {
    if (req.file?.path) fs.unlinkSync(req.file.path);
    res.status(400).json({ error: 'Failed to parse CSV: ' + err.message });
  }
});

app.post('/api/parse-xlsx', upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  const ext = req.file.originalname.split('.').pop().toLowerCase();
  if (!['xls', 'xlsx'].includes(ext)) {
    fs.unlinkSync(req.file.path);
    return res.status(400).json({ error: 'Please upload an .xls or .xlsx file.' });
  }
  try {
    const workbook = XLSX.readFile(req.file.path);
    fs.unlinkSync(req.file.path);
    const sheetName = workbook.SheetNames[0];
    if (!sheetName) return res.status(400).json({ error: 'Workbook has no sheets.' });
    const sheet = workbook.Sheets[sheetName];
    const records = XLSX.utils.sheet_to_json(sheet, { defval: '' });
    if (records.length === 0) return res.status(400).json({ error: 'Spreadsheet is empty.' });
    const headers = Object.keys(records[0]);
    const rows = records.map(r => headers.map(h => String(r[h] ?? '')));
    res.json({ headers, rows });
  } catch (err) {
    if (req.file?.path && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
    res.status(400).json({ error: 'Failed to parse spreadsheet: ' + err.message });
  }
});

app.post('/api/generate', async (req, res) => {
  const { labels } = req.body;
  if (!labels || !Array.isArray(labels)) {
    return res.status(400).json({ error: 'Labels array is required' });
  }

  const html = generateHTMLTemplate(labels);

  try {
    const browser = await puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath(),
      headless: chromium.headless,
    });
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });
    
    const pdfBuffer = await page.pdf({
      format: 'Letter',
      printBackground: true,
      margin: { top: '0', right: '0', bottom: '0', left: '0' }
    });

    await browser.close();

    const pdfBuf = Buffer.from(pdfBuffer);
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="peelify_labels_${Date.now()}.pdf"`,
      'Content-Length': pdfBuf.length
    });

    res.send(pdfBuf);
  } catch (error) {
    console.error('Error generating PDF:', error);
    res.status(500).json({ error: 'Failed to generate PDF' });
  }
});

// ── Razorpay: create order ────────────────────────────────────────────────────
app.post('/api/create-order', async (req, res) => {
  const { packId, amount } = req.body; // amount in paise (e.g. 199 for $1.99 → ₹ equivalent, or use INR amounts)
  if (!packId || !amount || typeof amount !== 'number' || amount <= 0) {
    return res.status(400).json({ error: 'packId and a positive amount (paise) are required' });
  }

  try {
    const order = await razorpay.orders.create({
      amount,           // paise
      currency: 'INR',
      receipt: `peelify_${packId}_${Date.now()}`,
      notes: { packId },
    });
    res.json({ orderId: order.id, amount: order.amount, currency: order.currency });
  } catch (err) {
    console.error('[create-order]', err);
    res.status(500).json({ error: 'Failed to create Razorpay order' });
  }
});

// ── Razorpay: verify payment & credit user ────────────────────────────────────
app.post('/api/verify-payment', async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, userId, credits } = req.body;

  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !userId || !credits) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  // Verify HMAC-SHA256 signature
  const expected = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest('hex');

  if (expected !== razorpay_signature) {
    return res.status(400).json({ error: 'Invalid payment signature' });
  }

  // Add credits to user profile using service-role (bypasses RLS)
  const { data: profile, error: fetchErr } = await supabaseAdmin
    .from('profiles')
    .select('credits')
    .eq('id', userId)
    .single();

  if (fetchErr) {
    console.error('[verify-payment] fetch profile:', fetchErr);
    return res.status(500).json({ error: 'Failed to fetch user profile' });
  }

  const { error: updateErr } = await supabaseAdmin
    .from('profiles')
    .update({ credits: (profile.credits ?? 0) + credits })
    .eq('id', userId);

  if (updateErr) {
    console.error('[verify-payment] update credits:', updateErr);
    return res.status(500).json({ error: 'Payment verified but failed to add credits' });
  }

  res.json({ success: true, creditsAdded: credits });
});

app.get('/', (req, res) => {
  res.send('Peelify API is running');
});

// ════════════════════════════════════════════════════════════════
//  SUPERADMIN ROUTES
// ════════════════════════════════════════════════════════════════

// ── Admin auth middleware ─────────────────────────────────────
// Verifies the short-lived admin JWT signed by the Supabase Edge Function.
// No database lookup — the secret is the gate.
function requireAdmin(req, res, next) {
  const authHeader = req.headers['authorization'] ?? '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'Missing token' });

  const secret = process.env.ADMIN_JWT_SECRET;
  if (!secret) {
    console.error('[requireAdmin] ADMIN_JWT_SECRET is not set in .env');
    return res.status(500).json({ error: 'Server misconfiguration' });
  }

  try {
    const payload = jwt.verify(token, secret, { algorithms: ['HS256'] });
    if (payload.role !== 'superadmin') {
      return res.status(403).json({ error: 'Forbidden — SuperAdmin role required' });
    }
    req.adminUser = { id: payload.sub, email: payload.email };
    next();
  } catch (err) {
    const msg = err.name === 'TokenExpiredError' ? 'Admin session expired — please sign in again' : 'Invalid admin token';
    return res.status(401).json({ error: msg });
  }
}

// ── Audit log helper ──────────────────────────────────────────
async function auditLog(adminUser, action, targetType, targetId, payload) {
  await supabaseAdmin.from('audit_log').insert({
    admin_id:    adminUser.id,
    admin_email: adminUser.email,
    action,
    target_type: targetType ?? null,
    target_id:   String(targetId ?? ''),
    payload:     payload ?? null,
  }).catch(err => console.error('[auditLog]', err.message));
}

// ── Users ─────────────────────────────────────────────────────
app.get('/api/admin/users', requireAdmin, async (req, res) => {
  const { page = 1, limit = 20, sort = 'created_at', dir = 'desc', search = '' } = req.query;
  const offset = (parseInt(page) - 1) * parseInt(limit);
  const validSort = ['email', 'credits', 'subscription_tier', 'created_at', 'full_name'].includes(sort) ? sort : 'created_at';
  const validDir  = dir === 'asc' ? true : false;

  let query = supabaseAdmin.from('profiles')
    .select('id, email, credits, subscription_tier, is_banned, banned_reason, created_at', { count: 'exact' });

  if (search) {
    query = query.ilike('email', `%${search}%`);
  }

  const { data, error, count } = await query
    .order(validSort, { ascending: validDir })
    .range(offset, offset + parseInt(limit) - 1);

  if (error) return res.status(500).json({ error: error.message });

  // Fetch full_names from auth.users metadata
  const userIds = (data ?? []).map(p => p.id);
  let nameMap = {};
  if (userIds.length > 0) {
    const { data: { users: authUsers } } = await supabaseAdmin.auth.admin.listUsers({ perPage: 1000 });
    authUsers?.forEach(u => { nameMap[u.id] = u.user_metadata?.full_name ?? null; });
  }

  const users = (data ?? []).map(p => ({ ...p, full_name: nameMap[p.id] ?? null }));

  // Stats
  const { data: allP } = await supabaseAdmin.from('profiles').select('is_banned, credits');
  const stats = {
    active:      allP?.filter(p => !p.is_banned).length ?? 0,
    banned:      allP?.filter(p => p.is_banned).length ?? 0,
    superadmins: null, // managed via Edge Function secret, not DB
    totalCredits: allP?.reduce((s, p) => s + (p.credits ?? 0), 0) ?? 0,
  };

  res.json({ users, total: count ?? 0, stats });
});

app.patch('/api/admin/users/:id/credits', requireAdmin, async (req, res) => {
  const { credits } = req.body;
  if (typeof credits !== 'number' || credits < 0) return res.status(400).json({ error: 'Invalid credits value' });

  const { data: before } = await supabaseAdmin.from('profiles').select('credits').eq('id', req.params.id).single();
  const { error } = await supabaseAdmin.from('profiles').update({ credits }).eq('id', req.params.id);
  if (error) return res.status(500).json({ error: error.message });

  await auditLog(req.adminUser, 'credits.update', 'user', req.params.id, { before: before?.credits, after: credits });
  res.json({ updated: true });
});

app.patch('/api/admin/users/:id/ban', requireAdmin, async (req, res) => {
  const { banned, reason } = req.body;
  if (typeof banned !== 'boolean') return res.status(400).json({ error: 'banned must be boolean' });

  const update = { is_banned: banned, banned_reason: banned ? (reason ?? null) : null };
  const { error } = await supabaseAdmin.from('profiles').update(update).eq('id', req.params.id);
  if (error) return res.status(500).json({ error: error.message });

  // Also ban in Supabase Auth
  await supabaseAdmin.auth.admin.updateUserById(req.params.id, {
    ban_duration: banned ? '87600h' : 'none',
  }).catch(() => {});

  await auditLog(req.adminUser, banned ? 'user.ban' : 'user.unban', 'user', req.params.id, { reason: reason ?? null });
  res.json({ updated: true });
});

app.delete('/api/admin/users/:id', requireAdmin, async (req, res) => {
  if (req.params.id === req.adminUser.id) return res.status(400).json({ error: 'Cannot delete your own account' });

  await auditLog(req.adminUser, 'user.delete', 'user', req.params.id, null);
  const { error } = await supabaseAdmin.auth.admin.deleteUser(req.params.id);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ deleted: true });
});

// ── Profiles (database view) ──────────────────────────────────
app.get('/api/admin/profiles', requireAdmin, async (req, res) => {
  const { page = 1, limit = 25, sort = 'created_at', dir = 'desc', search = '', tier = '' } = req.query;
  const offset = (parseInt(page) - 1) * parseInt(limit);
  const validSort = ['email', 'credits', 'subscription_tier', 'created_at'].includes(sort) ? sort : 'created_at';

  let query = supabaseAdmin.from('profiles')
    .select('id, email, credits, subscription_tier, is_banned, created_at', { count: 'exact' });

  if (search) query = query.ilike('email', `%${search}%`);
  if (tier)   query = query.eq('subscription_tier', tier);

  const { data, error, count } = await query
    .order(validSort, { ascending: dir === 'asc' })
    .range(offset, offset + parseInt(limit) - 1);

  if (error) return res.status(500).json({ error: error.message });

  const { data: allP } = await supabaseAdmin.from('profiles').select('subscription_tier, credits');
  const stats = {
    freeTier:     allP?.filter(p => (p.subscription_tier ?? 'free') === 'free').length ?? 0,
    proTier:      allP?.filter(p => p.subscription_tier === 'pro').length ?? 0,
    totalCredits: allP?.reduce((s, p) => s + (p.credits ?? 0), 0) ?? 0,
  };

  res.json({ profiles: data ?? [], total: count ?? 0, stats });
});

// ── Content blocks ────────────────────────────────────────────
app.get('/api/admin/content', requireAdmin, async (req, res) => {
  const { data, error } = await supabaseAdmin
    .from('content_blocks')
    .select('key, value, description, updated_at, updated_by')
    .order('key');
  if (error) return res.status(500).json({ error: error.message });
  res.json({ blocks: data ?? [] });
});

app.patch('/api/admin/content/:key', requireAdmin, async (req, res) => {
  const { value } = req.body;
  if (typeof value !== 'string') return res.status(400).json({ error: 'value must be a string' });

  const { data: before } = await supabaseAdmin.from('content_blocks').select('value').eq('key', req.params.key).single();
  const { error } = await supabaseAdmin.from('content_blocks').update({
    value,
    updated_at: new Date().toISOString(),
    updated_by: req.adminUser.id,
  }).eq('key', req.params.key);

  if (error) return res.status(500).json({ error: error.message });
  await auditLog(req.adminUser, 'content.update', 'content_block', req.params.key, { before: before?.value, after: value });
  res.json({ updated: true });
});

// ── Pricing ───────────────────────────────────────────────────
app.get('/api/admin/pricing', requireAdmin, async (req, res) => {
  const { data, error } = await supabaseAdmin.from('pricing_config').select('*').order('sort_order');
  if (error) return res.status(500).json({ error: error.message });
  res.json({ packs: data ?? [] });
});

app.patch('/api/admin/pricing/:packId', requireAdmin, async (req, res) => {
  const allowed = ['name','credits','price_usd','amount_paise','labels_count','per_credit','saving_label','is_popular','is_active'];
  const update  = {};
  allowed.forEach(k => { if (k in req.body) update[k] = req.body[k]; });
  update.updated_at = new Date().toISOString();
  update.updated_by = req.adminUser.id;

  const { data: before } = await supabaseAdmin.from('pricing_config').select('*').eq('pack_id', req.params.packId).single();
  const { error } = await supabaseAdmin.from('pricing_config').update(update).eq('pack_id', req.params.packId);
  if (error) return res.status(500).json({ error: error.message });

  await auditLog(req.adminUser, 'pricing.update', 'pricing_config', req.params.packId, { before, after: update });
  res.json({ updated: true });
});

// ── Feature flags ─────────────────────────────────────────────
app.get('/api/admin/flags', requireAdmin, async (req, res) => {
  const { data, error } = await supabaseAdmin.from('feature_flags').select('*').order('key');
  if (error) return res.status(500).json({ error: error.message });
  res.json({ flags: data ?? [] });
});

app.patch('/api/admin/flags/:key', requireAdmin, async (req, res) => {
  const { enabled } = req.body;
  if (typeof enabled !== 'boolean') return res.status(400).json({ error: 'enabled must be boolean' });

  const { data: before } = await supabaseAdmin.from('feature_flags').select('enabled').eq('key', req.params.key).single();
  const { error } = await supabaseAdmin.from('feature_flags').update({
    enabled,
    updated_at: new Date().toISOString(),
    updated_by: req.adminUser.id,
  }).eq('key', req.params.key);

  if (error) return res.status(500).json({ error: error.message });
  await auditLog(req.adminUser, 'flag.toggle', 'feature_flag', req.params.key, { before: before?.enabled, after: enabled });
  res.json({ updated: true });
});

// ── Audit logs ────────────────────────────────────────────────
app.get('/api/admin/logs', requireAdmin, async (req, res) => {
  const { page = 1, limit = 50, action = '' } = req.query;
  const offset = (parseInt(page) - 1) * parseInt(limit);

  let query = supabaseAdmin
    .from('audit_log')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false });

  if (action) query = query.eq('action', action);

  const { data, error, count } = await query.range(offset, offset + parseInt(limit) - 1);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ logs: data ?? [], total: count ?? 0 });
});

// ── Settings: Sub-admins ──────────────────────────────────────
// SuperAdmin list is managed via the SUPERADMIN_EMAILS env var (Edge Function secret).
// The backend exposes it as a read-only list so the Settings UI can display it.
// To add/remove admins: update SUPERADMIN_EMAILS in Supabase Edge Function secrets.
app.get('/api/admin/settings/admins', requireAdmin, (_req, res) => {
  const raw = process.env.SUPERADMIN_EMAILS ?? '';
  const emails = raw.split(',').map(e => e.trim()).filter(Boolean);
  const admins = emails.map(email => ({ email }));
  res.json({ admins, note: 'Managed via SUPERADMIN_EMAILS Edge Function secret.' });
});

// Local dev: start the server. Vercel imports this file as a module (no listen needed).
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

module.exports = app;
