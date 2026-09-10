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
    ? `<table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin:22px 0 0">
        <tr>
          <td style="border-radius:999px;background:#df702b">
            <a href="${escapeEmailHtml(input.heroAction.url)}" style="display:inline-block;padding:12px 26px;border-radius:999px;background:#df702b;color:#ffffff;text-decoration:none;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:14px;font-weight:600;letter-spacing:-0.1px">
              ${escapeEmailHtml(input.heroAction.label)}
            </a>
          </td>
        </tr>
      </table>`
    : ""

  const heroSubActionHtml = input.heroSubAction
    ? `<p style="margin:10px 0 0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:13px">
        <a href="${escapeEmailHtml(input.heroSubAction.url)}" style="color:#71717a;text-decoration:underline">
          ${escapeEmailHtml(input.heroSubAction.label)}
        </a>
      </p>`
    : ""

  const primaryActionHtml = input.primaryAction
    ? `<table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin:24px 0 0">
        <tr>
          <td style="border-radius:999px;background:#df702b">
            <a href="${escapeEmailHtml(input.primaryAction.url)}" style="display:inline-block;padding:12px 26px;border-radius:999px;background:#df702b;color:#ffffff;text-decoration:none;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:14px;font-weight:600;letter-spacing:-0.1px">
              ${escapeEmailHtml(input.primaryAction.label)}
            </a>
          </td>
        </tr>
      </table>`
    : ""

  const secondaryActionHtml = input.secondaryAction
    ? `<p style="margin:12px 0 0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:13px">
        <a href="${escapeEmailHtml(input.secondaryAction.url)}" style="color:#71717a;text-decoration:underline">
          ${escapeEmailHtml(input.secondaryAction.label)}
        </a>
      </p>`
    : ""

  const afterHeroHtml = input.bodyHtmlAfterHero || ""
  const appUrl = getTheirsAppUrl()

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <meta name="x-apple-disable-message-reformatting">
  <title>${escapeEmailHtml(input.title)}</title>
</head>
<body style="margin:0;padding:0;background:#fafaf9;-webkit-font-smoothing:antialiased">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;mso-hide:all">${escapeEmailHtml(input.preheader)}</div>
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="width:100%;background:#fafaf9">
    <tr>
      <td align="center" style="padding:28px 12px 40px">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="width:100%;max-width:580px;background:#ffffff;border:1px solid #e7e5e4;border-radius:12px;overflow:hidden">
          <!-- Header -->
          <tr>
            <td style="padding:22px 32px;border-bottom:1px solid #f4f4f5">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td>
                    <a href="${escapeEmailHtml(appUrl)}" style="text-decoration:none;display:inline-block">
                      <span style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:18px;font-weight:700;color:#181925;letter-spacing:-0.4px">
                        theirs<span style="color:#df702b">.page</span>
                      </span>
                    </a>
                  </td>
                  <td align="right" style="color:#a1a1aa;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:12px;letter-spacing:0.2px">
                    Online memorials
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Main Content -->
          <tr>
            <td style="padding:32px 32px 28px;color:#3f3f46">
              ${input.eyebrow ? `<p style="margin:0 0 10px;color:#df702b;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:11px;font-weight:600;letter-spacing:0.12em;text-transform:uppercase">${escapeEmailHtml(input.eyebrow)}</p>` : ""}
              <h1 style="margin:0 0 20px;color:#181925;font-family:Georgia,'Times New Roman',serif;font-size:26px;line-height:1.3;font-weight:400;letter-spacing:-0.3px">${escapeEmailHtml(input.title)}</h1>
              <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:15px;line-height:1.65;color:#3f3f46">${input.bodyHtml}</div>
              ${heroActionHtml}
              ${heroSubActionHtml}
              ${afterHeroHtml ? `<div style="margin-top:16px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:15px;line-height:1.65;color:#3f3f46">${afterHeroHtml}</div>` : ""}
              ${primaryActionHtml}
              ${secondaryActionHtml}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:24px 32px;background:#fafaf9;border-top:1px solid #f4f4f5;color:#71717a;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:13px;line-height:1.6">
              <p style="margin:0 0 2px;color:#181925;font-weight:600">${escapeEmailHtml(input.signoff || "With care,")}</p>
              <p style="margin:0 0 12px;color:#52525b">The Theirs team<br><a href="${escapeEmailHtml(appUrl)}" style="color:#df702b;text-decoration:none">theirs.page</a></p>
              <p style="margin:0;font-size:12px;color:#a1a1aa">Questions or need help? Reply directly to this email or write to <a href="mailto:${THEIRS_SUPPORT_ADDRESS}" style="color:#71717a;text-decoration:underline">${THEIRS_SUPPORT_ADDRESS}</a>.</p>
              <p style="margin:4px 0 0;font-size:11px;color:#a1a1aa">theirs.page — Online memorial website for loved ones</p>
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
  return `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin:18px 0 0">${items
    .map(
      (item) =>
        `<tr><td valign="top" style="width:22px;padding:0 0 12px;color:#df702b;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-weight:700;font-size:15px;line-height:1.5">✓</td><td style="padding:0 0 12px;color:#3f3f46;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:14px;line-height:1.6"><strong style="color:#181925">${escapeEmailHtml(item.title)}.</strong> ${escapeEmailHtml(item.description)}</td></tr>`
    )
    .join("")}</table>`
}

export function emailQuoteCard(text: string): string {
  return `<div style="margin:20px 0 0;padding:16px 20px;border-left:3px solid #df702b;background:#faf8f5;border-radius:0 8px 8px 0;color:#27272a;font-family:Georgia,'Times New Roman',serif;font-style:italic;font-size:15px;line-height:1.65;white-space:pre-wrap">${escapeEmailHtml(text)}</div>`
}

export function emailNotice(text: string): string {
  return `<div style="margin:20px 0 0;padding:12px 16px;background:#faf8f5;border:1px solid rgba(223,112,43,0.18);border-radius:8px;color:#52525b;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:13px;line-height:1.5">${escapeEmailHtml(text)}</div>`
}
