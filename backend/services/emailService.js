const nodemailer = require('nodemailer');

// ─── Transporter (Gmail SMTP — free, up to 500 emails/day) ───────────────────
let transporter = null;

function getTransporter() {
    if (transporter) return transporter;

    if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
        console.warn('⚠️ [Email] GMAIL_USER / GMAIL_APP_PASSWORD not set — email notifications disabled.');
        return null;
    }

    transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.GMAIL_USER,
            pass: process.env.GMAIL_APP_PASSWORD   // Gmail App Password (not normal password)
        }
    });

    return transporter;
}

/**
 * sendEmail({ to, subject, html })
 * Returns { success, messageId } or { success: false, error }
 */
async function sendEmail({ to, subject, html, text }) {
    try {
        const t = getTransporter();
        if (!t) return { success: false, error: 'Email not configured' };

        const info = await t.sendMail({
            from: `"NagarMitra Civic Portal" <${process.env.GMAIL_USER}>`,
            to,
            subject,
            html,
            text: text || html.replace(/<[^>]+>/g, '')
        });

        console.log(`📧 [Email Sent] To: ${to} | Subject: ${subject} | ID: ${info.messageId}`);
        return { success: true, messageId: info.messageId };
    } catch (err) {
        console.error('❌ [Email Error]', err.message);
        return { success: false, error: err.message };
    }
}

// ─── Email Templates ──────────────────────────────────────────────────────────

/**
 * authorityNotificationEmail — sent to Gram Panchayat / Municipal authority
 */
function authorityNotificationEmail(complaint, authority) {
    const severityColor = {
        Critical: '#dc2626', High: '#ea580c',
        Medium: '#d97706', Low: '#16a34a'
    }[complaint.severity] || '#d97706';

    return {
        subject: `[NagarMitra] New Civic Complaint #${complaint.complaintId} — ${complaint.category} at ${complaint.location}`,
        html: `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:'Segoe UI',system-ui,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0">
  <tr><td align="center" style="padding:30px 20px;">
    <table width="600" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.1);">
      <!-- Header -->
      <tr><td style="background:linear-gradient(135deg,#0f172a,#1e3a5f);padding:30px 40px;">
        <table width="100%"><tr>
          <td><span style="background:#0284c7;color:#fff;padding:4px 10px;border-radius:6px;font-size:12px;font-weight:700;">NAGARMITRA</span></td>
          <td align="right"><span style="color:#94a3b8;font-size:13px;">Complaint Notification</span></td>
        </tr></table>
        <h1 style="color:#fff;margin:16px 0 4px;font-size:22px;">New Civic Complaint Filed</h1>
        <p style="color:#94a3b8;margin:0;font-size:14px;">This complaint requires your department's attention</p>
      </td></tr>

      <!-- Complaint ID Badge -->
      <tr><td style="padding:0 40px;">
        <div style="background:#eff6ff;border-left:4px solid #0284c7;padding:16px 20px;margin:24px 0 0;">
          <span style="color:#1d4ed8;font-weight:700;font-size:18px;">Complaint ID: ${complaint.complaintId}</span>
          <span style="display:inline-block;margin-left:16px;background:${severityColor};color:#fff;padding:3px 10px;border-radius:50px;font-size:12px;font-weight:600;">${complaint.severity || 'Medium'} Priority</span>
        </div>
      </td></tr>

      <!-- Details Table -->
      <tr><td style="padding:20px 40px 0;">
        <table width="100%" cellspacing="0" style="border-collapse:collapse;">
          <tr style="background:#f8fafc;">
            <td style="padding:12px 16px;color:#64748b;font-size:13px;width:140px;font-weight:600;">Category</td>
            <td style="padding:12px 16px;color:#1e293b;font-size:14px;font-weight:500;">${complaint.category}</td>
          </tr>
          <tr>
            <td style="padding:12px 16px;color:#64748b;font-size:13px;font-weight:600;">Location</td>
            <td style="padding:12px 16px;color:#1e293b;font-size:14px;">📍 ${complaint.location}</td>
          </tr>
          <tr style="background:#f8fafc;">
            <td style="padding:12px 16px;color:#64748b;font-size:13px;font-weight:600;">Description</td>
            <td style="padding:12px 16px;color:#1e293b;font-size:14px;">${complaint.description}</td>
          </tr>
          <tr>
            <td style="padding:12px 16px;color:#64748b;font-size:13px;font-weight:600;">Department</td>
            <td style="padding:12px 16px;color:#1e293b;font-size:14px;">${complaint.department}</td>
          </tr>
          <tr style="background:#f8fafc;">
            <td style="padding:12px 16px;color:#64748b;font-size:13px;font-weight:600;">Reported By</td>
            <td style="padding:12px 16px;color:#1e293b;font-size:14px;">${complaint.citizenName || 'Anonymous Citizen'}</td>
          </tr>
          <tr>
            <td style="padding:12px 16px;color:#64748b;font-size:13px;font-weight:600;">Date Filed</td>
            <td style="padding:12px 16px;color:#1e293b;font-size:14px;">${new Date(complaint.createdAt || Date.now()).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}</td>
          </tr>
          <tr style="background:#f8fafc;">
            <td style="padding:12px 16px;color:#64748b;font-size:13px;font-weight:600;">Status</td>
            <td style="padding:12px 16px;"><span style="background:#fef3c7;color:#92400e;padding:3px 10px;border-radius:50px;font-size:12px;font-weight:600;">Submitted — Awaiting Action</span></td>
          </tr>
        </table>
      </td></tr>

      <!-- Action Required Box -->
      <tr><td style="padding:24px 40px;">
        <div style="background:#fef2f2;border:1px solid #fecaca;border-radius:10px;padding:20px;">
          <p style="color:#991b1b;font-weight:700;margin:0 0 8px;">⚠️ Action Required</p>
          <p style="color:#7f1d1d;font-size:14px;margin:0;line-height:1.6;">
            Dear ${authority.name},<br>
            A citizen has filed a civic complaint in your jurisdiction via NagarMitra. 
            Please review and take appropriate action within the prescribed timeline.
            ${authority.note ? `<br><br><strong>Note:</strong> ${authority.note}` : ''}
          </p>
        </div>
      </td></tr>

      <!-- Footer -->
      <tr><td style="background:#f8fafc;padding:20px 40px;border-top:1px solid #e2e8f0;">
        <p style="color:#94a3b8;font-size:12px;margin:0;text-align:center;">
          This is an automated notification from <strong>NagarMitra</strong> — Smart City Complaint Portal<br>
          <a href="https://nagarmitra.pages.dev" style="color:#0284c7;">nagarmitra.pages.dev</a> · 
          <a href="mailto:fmdumair07@gmail.com" style="color:#0284c7;">fmdumair07@gmail.com</a>
        </p>
      </td></tr>
    </table>
  </td></tr>
</table>
</body>
</html>`
    };
}

/**
 * citizenConfirmationEmail — acknowledgement sent to the citizen
 */
function citizenConfirmationEmail(complaint) {
    return {
        subject: `✅ Complaint Received — ${complaint.complaintId} | NagarMitra`,
        html: `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:'Segoe UI',system-ui,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0">
  <tr><td align="center" style="padding:30px 20px;">
    <table width="580" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.1);">
      <!-- Header -->
      <tr><td style="background:linear-gradient(135deg,#064e3b,#065f46);padding:30px 40px;text-align:center;">
        <div style="width:60px;height:60px;background:rgba(255,255,255,0.15);border-radius:50%;margin:0 auto 16px;display:flex;align-items:center;justify-content:center;">
          <span style="font-size:28px;">✅</span>
        </div>
        <h1 style="color:#fff;margin:0 0 8px;font-size:24px;">Complaint Registered!</h1>
        <p style="color:#a7f3d0;margin:0;font-size:14px;">We've received your complaint and notified the authorities</p>
      </td></tr>

      <!-- Complaint ID -->
      <tr><td style="padding:30px 40px 0;text-align:center;">
        <div style="background:#eff6ff;border-radius:12px;padding:20px;display:inline-block;min-width:200px;">
          <p style="color:#64748b;font-size:13px;margin:0 0 4px;">Your Complaint ID</p>
          <p style="color:#0284c7;font-size:28px;font-weight:800;margin:0;letter-spacing:1px;">${complaint.complaintId}</p>
          <p style="color:#94a3b8;font-size:12px;margin:8px 0 0;">Save this ID to track your complaint</p>
        </div>
      </td></tr>

      <!-- Summary -->
      <tr><td style="padding:24px 40px 0;">
        <table width="100%" cellspacing="0" style="border-collapse:collapse;border:1px solid #e2e8f0;border-radius:10px;overflow:hidden;">
          <tr style="background:#f8fafc;">
            <td style="padding:10px 16px;color:#64748b;font-size:13px;width:120px;">Category</td>
            <td style="padding:10px 16px;color:#1e293b;font-size:14px;font-weight:500;">${complaint.category}</td>
          </tr>
          <tr>
            <td style="padding:10px 16px;color:#64748b;font-size:13px;">Location</td>
            <td style="padding:10px 16px;color:#1e293b;font-size:14px;">📍 ${complaint.location}</td>
          </tr>
          <tr style="background:#f8fafc;">
            <td style="padding:10px 16px;color:#64748b;font-size:13px;">Filed On</td>
            <td style="padding:10px 16px;color:#1e293b;font-size:14px;">${new Date(complaint.createdAt || Date.now()).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}</td>
          </tr>
        </table>
      </td></tr>

      <!-- Track steps -->
      <tr><td style="padding:24px 40px 0;">
        <p style="color:#374151;font-weight:600;margin:0 0 16px;">What happens next?</p>
        <table width="100%">
          ${['Submitted — Complaint registered', 'Under Review — Authority reviewing', 'Assigned — Field team assigned', 'In Progress — Work started', 'Resolved — Issue fixed ✅']
            .map((step, i) => `<tr><td style="padding:8px 0;">
              <span style="display:inline-block;width:24px;height:24px;border-radius:50%;background:${i === 0 ? '#0284c7' : '#e2e8f0'};color:${i === 0 ? '#fff' : '#94a3b8'};text-align:center;line-height:24px;font-size:12px;font-weight:700;">${i + 1}</span>
              <span style="margin-left:12px;color:${i === 0 ? '#1e293b' : '#94a3b8'};font-size:14px;">${step}</span>
            </td></tr>`).join('')}
        </table>
      </td></tr>

      <!-- Track button -->
      <tr><td style="padding:24px 40px;text-align:center;">
        <a href="https://nagarmitra.pages.dev" style="display:inline-block;background:#0284c7;color:#fff;text-decoration:none;padding:14px 32px;border-radius:10px;font-weight:600;font-size:15px;">Track My Complaint →</a>
      </td></tr>

      <!-- Footer -->
      <tr><td style="background:#f8fafc;padding:20px 40px;border-top:1px solid #e2e8f0;text-align:center;">
        <p style="color:#94a3b8;font-size:12px;margin:0;">
          <strong>NagarMitra</strong> — Your City, Your Voice, Our Responsibility<br>
          <a href="https://nagarmitra.pages.dev" style="color:#0284c7;">nagarmitra.pages.dev</a>
        </p>
      </td></tr>
    </table>
  </td></tr>
</table>
</body>
</html>`
    };
}

module.exports = { sendEmail, authorityNotificationEmail, citizenConfirmationEmail };
