import "server-only"

import { escapeEmailHtml, getTheirsAppUrl, THEIRS_SUPPORT_ADDRESS } from "@/lib/email/caretaker-notifications"

export type EmailAction = {
  label: string
  url: string
}

export function renderTheirsEmail(input: {
  preheader: string
  eyebrow?: string
  title: string
  bodyHtml: string
  heroAction?: EmailAction
  heroSubAction?: EmailAction
  bodyHtmlAfterHero?: string
  primaryAction?: EmailAction
  secondaryAction?: EmailAction
  signoff?: string
}): string {
  const heroActionHtml = input.heroAction
    ? `<table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin:22px 0 0"><tr><td style="border-radius:999px;background:#305dde"><a href="${escapeEmailHtml(input.heroAction.url)}" style="display:inline-block;padding:13px 28px;border-radius:999px;color:#ffffff;text-decoration:none;font:600 14px Arial,sans-serif">${escapeEmailHtml(input.heroAction.label)}</a></td></tr></table>`
    : ""

  const heroSubActionHtml = input.heroSubAction
    ? `<p style="margin:12px 0 0;font:13px Arial,sans-serif"><a href="${escapeEmailHtml(input.heroSubAction.url)}" style="color:#305dde;text-decoration:underline">${escapeEmailHtml(input.heroSubAction.label)}</a></p>`
    : ""

  const primaryActionHtml = input.primaryAction
    ? `<table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin:28px 0 0"><tr><td style="border-radius:999px;background:#305dde"><a href="${escapeEmailHtml(input.primaryAction.url)}" style="display:inline-block;padding:13px 28px;border-radius:999px;color:#ffffff;text-decoration:none;font:600 14px Arial,sans-serif">${escapeEmailHtml(input.primaryAction.label)}</a></td></tr></table>`
    : ""

  const secondaryActionHtml = input.secondaryAction
    ? `<p style="margin:14px 0 0;font:13px Arial,sans-serif;color:#6f7078"><a href="${escapeEmailHtml(input.secondaryAction.url)}" style="color:#305dde;text-decoration:underline">${escapeEmailHtml(input.secondaryAction.label)}</a></p>`
    : ""

  const afterHeroHtml = input.bodyHtmlAfterHero || ""

  return `<!doctype html>
<html>
<head>
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <meta name="x-apple-disable-message-reformatting">
</head>
<body style="margin:0;padding:0;background:#f2f4f3">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent">${escapeEmailHtml(input.preheader)}</div>
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="width:100%;background:#f2f4f3">
    <tr>
      <td align="center" style="padding:36px 12px">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="width:100%;max-width:620px;background:#ffffff;border:1px solid #e2e6e4;border-radius:16px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.03)">
          <tr>
            <td style="height:5px;background:#305dde;font-size:0;line-height:0">&nbsp;</td>
          </tr>
          <tr>
            <td style="padding:28px 36px 20px;border-bottom:1px solid #edf0ee">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td>
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                      <tr>
                        <td style="width:28px;height:28px;border-radius:50%;background:#305dde;color:#ffffff;text-align:center;font:italic 17px Georgia,serif;line-height:28px">t</td>
                        <td style="padding-left:10px;color:#181925;font:600 19px Arial,sans-serif;letter-spacing:-0.4px">theirs<span style="color:#305dde">.page</span></td>
                      </tr>
                    </table>
                  </td>
                  <td align="right" style="color:#8a8c92;font:12px Arial,sans-serif;letter-spacing:0.2px">
                    A place for a life
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:36px 36px 32px;color:#34353a">
              <p style="margin:0 0 10px;color:#305dde;font:700 11px Arial,sans-serif;letter-spacing:1.5px;text-transform:uppercase">${escapeEmailHtml(input.eyebrow || "Theirs")}</p>
              <h1 style="margin:0 0 22px;color:#181925;font:400 28px/1.3 Georgia,serif;letter-spacing:-0.3px">${escapeEmailHtml(input.title)}</h1>
              <div style="font:15px/1.7 Arial,sans-serif;color:#46484e">${input.bodyHtml}</div>
              ${heroActionHtml}
              ${heroSubActionHtml}
              ${afterHeroHtml ? `<div style="font:15px/1.7 Arial,sans-serif;color:#46484e">${afterHeroHtml}</div>` : ""}
              ${primaryActionHtml}
              ${secondaryActionHtml}
            </td>
          </tr>
          <tr>
            <td style="padding:26px 36px;background:#fafaf8;border-top:1px solid #edf0ee;color:#797b81;font:13px/1.6 Arial,sans-serif">
              <p style="margin:0 0 4px;color:#34353a;font-weight:600">${escapeEmailHtml(input.signoff || "With care,")}</p>
              <p style="margin:0 0 14px;color:#54565c">The Theirs team<br><a href="${escapeEmailHtml(getTheirsAppUrl())}" style="color:#305dde;text-decoration:none">www.theirs.page</a></p>
              <p style="margin:0;font-size:12px;color:#8a8c92">Questions or need help? Reply directly to this email or write to <a href="mailto:${THEIRS_SUPPORT_ADDRESS}" style="color:#305dde;text-decoration:none">${THEIRS_SUPPORT_ADDRESS}</a>.</p>
              <p style="margin:6px 0 0;font-size:12px;color:#a4a6ac">theirs.page — a place dedicated to a human life.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}

export function emailChecklist(items: Array<{ title: string; description: string }>): string {
  return `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin:20px 0 0">${items.map((item) => `<tr><td valign="top" style="width:24px;padding:0 0 14px;color:#305dde;font:700 16px Arial,sans-serif">✓</td><td style="padding:0 0 14px;color:#46484e;font:14px/1.6 Arial,sans-serif"><strong style="color:#181925">${escapeEmailHtml(item.title)}.</strong> ${escapeEmailHtml(item.description)}</td></tr>`).join("")}</table>`
}

export function emailQuoteCard(text: string): string {
  return `<div style="margin:22px 0 0;padding:18px 20px;border-left:4px solid #305dde;background:#f6f7fb;border-radius:0 12px 12px 0;color:#34353a;font:italic 16px/1.65 Georgia,serif;white-space:pre-wrap">${escapeEmailHtml(text)}</div>`
}

export function emailNotice(text: string): string {
  return `<div style="margin:22px 0 0;padding:14px 18px;background:#f6f7f6;border:1px solid #e5e8e6;border-radius:12px;color:#666970;font:13px/1.55 Arial,sans-serif">${escapeEmailHtml(text)}</div>`
}
