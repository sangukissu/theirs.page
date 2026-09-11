import {
  escapeEmailHtml,
  getTheirsAppUrl,
  sendTheirsEmail,
  THEIRS_INVITATION_SENDER,
} from "@/lib/email/caretaker-notifications"
import {
  renderTheirsEmail,
  emailQuoteCard,
  emailNotice,
} from "@/lib/email/templates"

export interface SendGiftRecipientEmailInput {
  giftId: string
  buyerName: string
  recipientName: string
  recipientEmail: string
  giftMessage?: string | null
  claimToken: string
}

export interface SendGiftBuyerReceiptEmailInput {
  giftId: string
  buyerName: string
  buyerEmail: string
  recipientName: string
  recipientEmail: string
  giftMessage?: string | null
  claimToken: string
  amount: number
  currency: string
}

export async function sendGiftRecipientEmail(
  input: SendGiftRecipientEmailInput
): Promise<boolean> {
  const appUrl = getTheirsAppUrl()
  const claimUrl = `${appUrl}/gift/claim?token=${encodeURIComponent(input.claimToken)}`

  const bodyHtml = `
    <p style="margin:0 0 16px">Dear ${escapeEmailHtml(input.recipientName)},</p>
    <p style="margin:0 0 16px"><strong>${escapeEmailHtml(input.buyerName)}</strong> has gifted you a <strong>Complete memorial</strong> on Theirs to give you a quiet, lasting place to honor someone you love.</p>
    ${input.giftMessage?.trim() ? emailQuoteCard(input.giftMessage.trim()) : ""}
    <p style="margin:20px 0 0;line-height:1.65">Take all the time you need. Grieving has no set timetable. Whenever you feel ready, you can use this gift to create a new memorial, or apply it to a memorial you have already started.</p>
    ${emailNotice("This gift never expires. The memorial will be completely yours to care for, with full privacy controls and original high-resolution photo preservation.")}
  `

  const html = renderTheirsEmail({
    preheader: `${input.buyerName} has gifted you a Complete memorial on Theirs.`,
    eyebrow: "A gift for your family",
    title: "A Complete memorial has been gifted to you",
    bodyHtml,
    heroAction: {
      label: "Accept your gift",
      url: claimUrl,
    },
    signoff: "Thinking of you,",
  })

  return sendTheirsEmail({
    to: input.recipientEmail,
    from: THEIRS_INVITATION_SENDER,
    subject: `A memorial gift from ${input.buyerName}`,
    html,
    eventKey: `gift-recipient-${input.giftId}`,
  })
}

export async function sendGiftBuyerReceiptEmail(
  input: SendGiftBuyerReceiptEmailInput
): Promise<boolean> {
  const appUrl = getTheirsAppUrl()
  const claimUrl = `${appUrl}/gift/claim?token=${encodeURIComponent(input.claimToken)}`

  const bodyHtml = `
    <p style="margin:0 0 16px">Dear ${escapeEmailHtml(input.buyerName)},</p>
    <p style="margin:0 0 16px">Thank you for your kindness. Your gift of a Complete memorial for <strong>${escapeEmailHtml(input.recipientName)}</strong> (${escapeEmailHtml(input.recipientEmail)}) is confirmed.</p>
    <p style="margin:0 0 16px">We’ve sent an email to ${escapeEmailHtml(input.recipientName)} with your message and instructions on how to create or upgrade their memorial whenever they feel ready.</p>
    
    <div style="margin:22px 0 0;padding:16px 20px;background:#fafaf9;border:1px solid #e7e5e4;border-radius:8px">
      <p style="margin:0 0 6px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:12px;font-weight:600;text-transform:uppercase;color:#71717a;letter-spacing:0.06em">Backup Gift Link</p>
      <p style="margin:0 0 10px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:13px;line-height:1.5;color:#52525b">If our email is delayed or caught in their spam folder, you can copy and text this direct link to ${escapeEmailHtml(input.recipientName)}:</p>
      <a href="${escapeEmailHtml(claimUrl)}" style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#df702b;word-break:break-all;font-size:13px;text-decoration:underline">${escapeEmailHtml(claimUrl)}</a>
    </div>

    ${input.giftMessage?.trim() ? `
      <div style="margin:18px 0 0">
        <p style="margin:0 0 4px;font-size:12px;color:#71717a;font-weight:500">Your personal note to ${escapeEmailHtml(input.recipientName)}:</p>
        ${emailQuoteCard(input.giftMessage.trim())}
      </div>
    ` : ""}
  `

  const html = renderTheirsEmail({
    preheader: `Your memorial gift for ${input.recipientName} is confirmed.`,
    eyebrow: "Gift Confirmation",
    title: "Thank you for your gift",
    bodyHtml,
    heroAction: {
      label: "View gift claim page",
      url: claimUrl,
    },
    signoff: "With gratitude,",
  })

  return sendTheirsEmail({
    to: input.buyerEmail,
    subject: `Your memorial gift for ${input.recipientName} is confirmed`,
    html,
    eventKey: `gift-receipt-${input.giftId}`,
  })
}
