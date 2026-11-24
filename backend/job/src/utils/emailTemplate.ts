import { ApplicationStatus } from "@prisma/client";

const escapeHtml = (value: string): string =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");

const statusStyle: Record<
  ApplicationStatus,
  { label: string; background: string; color: string }
> = {
  PENDING: {
    label: "Pending",
    background: "#fef3c7",
    color: "#92400e",
  },
  REVIEWED: {
    label: "Reviewed",
    background: "#dbeafe",
    color: "#1d4ed8",
  },
  SHORTLISTED: {
    label: "Shortlisted",
    background: "#ede9fe",
    color: "#6d28d9",
  },
  REJECTED: {
    label: "Rejected",
    background: "#fee2e2",
    color: "#b91c1c",
  },
  ACCEPTED: {
    label: "Accepted",
    background: "#dcfce7",
    color: "#166534",
  },
};

export const applicationStatusUpdateTemplate = (
  jobTitle: string,
  status: ApplicationStatus,
  applicantName?: string,
): string => {
  const safeJobTitle = escapeHtml(jobTitle);
  const safeApplicantName = escapeHtml(applicantName?.trim() || "there");
  const safeStatus = statusStyle[status] || statusStyle.PENDING;

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Application status update</title>
  </head>
  <body style="margin:0;padding:24px;background:#f3f4f6;font-family:Arial,'Helvetica Neue',sans-serif;color:#111827;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;">
      <tr>
        <td align="center">
          <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="max-width:600px;width:100%;border-collapse:collapse;">
            <tr>
              <td style="padding:28px 40px;background:#111827;border-radius:16px 16px 0 0;">
                <div style="font-size:22px;font-weight:700;letter-spacing:-0.3px;color:#ffffff;">Job Portal</div>
              </td>
            </tr>
            <tr>
              <td style="padding:40px;background:#ffffff;border-left:1px solid #e5e7eb;border-right:1px solid #e5e7eb;">
                <p style="margin:0 0 12px;font-size:15px;color:#6b7280;">Application update</p>
                <h1 style="margin:0 0 20px;font-size:28px;line-height:36px;color:#111827;">Hi ${safeApplicantName},</h1>
                <p style="margin:0 0 24px;font-size:16px;line-height:26px;color:#4b5563;">
                  Your application status has been updated for
                  <strong style="color:#111827;">${safeJobTitle}</strong>.
                </p>
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;">
                  <tr>
                    <td style="padding:24px;background:#f9fafb;border:1px solid #e5e7eb;border-radius:12px;">
                      <p style="margin:0 0 10px;font-size:13px;color:#6b7280;text-transform:uppercase;letter-spacing:0.8px;">Current status</p>
                      <span style="display:inline-block;padding:9px 14px;border-radius:999px;background:${safeStatus.background};color:${safeStatus.color};font-size:14px;font-weight:700;">
                        ${safeStatus.label}
                      </span>
                    </td>
                  </tr>
                </table>
                <p style="margin:24px 0 0;font-size:14px;line-height:22px;color:#6b7280;">
                  Sign in to your Job Portal account to view the full application details.
                </p>
              </td>
            </tr>
            <tr>
              <td style="padding:24px 40px;background:#f9fafb;border:1px solid #e5e7eb;border-radius:0 0 16px 16px;text-align:center;">
                <p style="margin:0;font-size:13px;line-height:20px;color:#9ca3af;">
                  This is an automated message from Job Portal. Please do not reply.
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
};
