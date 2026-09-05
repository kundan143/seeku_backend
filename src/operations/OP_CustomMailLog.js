const { customMailLog } = require("../models");
const { responseCodes } = require("../services/baseReponse");
const transporter = require("../services/mailTransporterService");
const path = require("path");

// Rough plain-text fallback for mail clients that don't render HTML - the compose body is now
// rich HTML from p-editor (Quill), so this only needs to be readable, not pixel-perfect. Block
// elements get a trailing newline before their tags are stripped, so paragraphs/list items don't
// all run together on one line.
function htmlToPlainText(html) {
  return html
    .replace(/<\/(p|div|li|h[1-6])>/gi, "\n")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

// Backs the reusable Mail Compose dialog (see MailComposeDialogComponent) - sends whatever
// To/Cc/Bcc/Subject/Body the user composed and logs it into custom_mail_log regardless of
// outcome, same success/failure logging pattern as OP_salaryPayment.js's emailSlip.
// attachment_urls are /uploads/... paths already saved by api/file/upload (the dialog itself
// never uploads - the caller does that first, same division of labor as everywhere else).
//
// Each To address gets its OWN individual email - never one email with every address bundled
// into a single To header, so no recipient ever sees anyone else's address. Cc/Bcc (if set) are
// repeated on every individual send, so a Cc'd person is included on each of the N emails rather
// than just one. Sends run in batches (not one giant Promise.all, and not strictly sequential)
// sized to the transporter's own SMTP connection pool (mailTransporterService.js, maxConnections:
// 5) so recipients within a batch go out concurrently instead of waiting on each other's full
// round trip one at a time.
const SEND_BATCH_SIZE = 5;

async function sendOneCustomMail(recipient, { cc, bcc, subject, message, textBody, attachments, attachmentUrlsJoined, sentBy }) {
  try {
    await transporter.sendMail({
      from: process.env.EXP_HANDLE_USER_NAME || "no-reply@seeku.in",
      to: recipient,
      cc: cc || undefined,
      bcc: bcc || undefined,
      subject,
      html: message,
      text: textBody,
      attachments: attachments.length ? attachments : undefined,
    });
    await customMailLog.create({
      recipient_email: recipient, cc, bcc, subject, body: message,
      attachment_urls: attachmentUrlsJoined, status: 1, sent_by: sentBy || null, sent_date: new Date(),
    });
    return { email: recipient, ok: true };
  } catch (e) {
    await customMailLog.create({
      recipient_email: recipient, cc, bcc, subject, body: message,
      attachment_urls: attachmentUrlsJoined, status: 0, sent_by: sentBy || null, sent_date: new Date(),
    });
    return { email: recipient, ok: false, reason: e.message };
  }
}

exports.sendCustomMail = async function (body) {
  const to = Array.isArray(body.to) ? body.to.filter(Boolean) : [];
  if (!to.length) {
    responseCodes.BAD_REQUEST.data = null;
    responseCodes.BAD_REQUEST.message = "At least one recipient is required";
    return responseCodes.BAD_REQUEST;
  }

  const cc = Array.isArray(body.cc) && body.cc.length ? body.cc.join(", ") : null;
  const bcc = Array.isArray(body.bcc) && body.bcc.length ? body.bcc.join(", ") : null;
  const subject = body.subject || "";
  const message = body.body || "";
  const textBody = htmlToPlainText(message);
  const attachmentUrls = Array.isArray(body.attachment_urls) ? body.attachment_urls.filter(Boolean) : [];
  const attachmentUrlsJoined = attachmentUrls.length ? attachmentUrls.join(", ") : null;
  const attachments = attachmentUrls.map((url) => ({
    filename: path.basename(url),
    path: path.join(__dirname, "..", "public", url.replace(/^\//, "")),
  }));
  const sendCtx = { cc, bcc, subject, message, textBody, attachments, attachmentUrlsJoined, sentBy: body.sent_by };

  const results = [];
  for (let i = 0; i < to.length; i += SEND_BATCH_SIZE) {
    const batch = to.slice(i, i + SEND_BATCH_SIZE);
    const batchResults = await Promise.all(batch.map((recipient) => sendOneCustomMail(recipient, sendCtx)));
    results.push(...batchResults);
  }

  const sent = results.filter((r) => r.ok).map((r) => r.email);
  const failed = results.filter((r) => !r.ok).map((r) => ({ email: r.email, reason: r.reason }));
  const data = { sent, failed };
  if (!sent.length) {
    responseCodes.BAD_REQUEST.data = data;
    responseCodes.BAD_REQUEST.message = `Failed to send to all ${to.length} recipient(s)`;
    return responseCodes.BAD_REQUEST;
  }
  responseCodes.SUCCESS.data = data;
  responseCodes.SUCCESS.message = `Sent to ${sent.length} recipient(s)${failed.length ? `, ${failed.length} failed` : ""}`;
  return responseCodes.SUCCESS;
};
