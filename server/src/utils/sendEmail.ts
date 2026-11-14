// sendEmail.ts server/src/utils/sendEmail.ts
// Sends an email with Brevo (free plan: 300 emails a day).
// Every email in the project goes through this one function.
// No BREVO_API_KEY in .env, or Brevo refuses? Then the email is printed in the server terminal instead,
// so the website keeps working (and you can still copy the link or code from the terminal).

// STEP 19B: Real emails with Brevo

import { env } from "../config/env";

const BREVO_URL = "https://api.brevo.com/v3/smtp/email";

// Prints the email in the terminal (the STEP 19 version, kept as the fallback)
const printEmail = (to: string, subject: string, text: string, why: string) => {
  console.log(
    [
      "",
      `================ EMAIL (not sent: ${why}) ================`,
      `To:      ${to}`,
      `Subject: ${subject}`,
      "",
      text,
      "=========================================================",
      "",
    ].join("\n"),
  );
};

// Brevo wants an HTML version too. This turns plain text into simple HTML:
// escape < > & (so text can't break the HTML), make links clickable, keep the line breaks.
const textToHtml = (text: string) => {
  const escaped = text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
  const linked = escaped.replace(/(https?:\/\/\S+)/g, '<a href="$1">$1</a>');
  return `<div style="font-family:Arial,sans-serif;font-size:15px;line-height:1.6">${linked.replace(/\n/g, "<br>")}</div>`;
};

// sendEmail("ada.obi@example.com", "Subject", "Text...")
// It never throws: a failed email must not crash "forgot password" or an order. The problem is logged instead.
export const sendEmail = async (to: string, subject: string, text: string) => {
  if (!env.brevoApiKey || !env.emailFrom) {
    printEmail(
      to,
      subject,
      text,
      "BREVO_API_KEY or EMAIL_FROM missing in .env",
    );
    return;
  }

  try {
    const response = await fetch(BREVO_URL, {
      method: "POST",
      headers: {
        "api-key": env.brevoApiKey, // your secret Brevo key
        "content-type": "application/json",
        accept: "application/json",
      },
      body: JSON.stringify({
        sender: { name: env.emailFromName, email: env.emailFrom }, // must be a sender you verified in Brevo
        to: [{ email: to }],
        subject,
        textContent: text,
        htmlContent: textToHtml(text),
      }),
    });

    if (!response.ok) {
      // e.g. 401 = wrong API key, 400 = sender not verified. Brevo explains why in the reply.
      console.error(
        `Brevo refused the email (${response.status}):`,
        await response.text(),
      );
      printEmail(to, subject, text, `Brevo error ${response.status}`);
      return;
    }

    console.log(`Email sent with Brevo to ${to}: "${subject}"`);
  } catch (error) {
    // No internet, Brevo down...
    console.error("Could not reach Brevo:", (error as Error).message);
    printEmail(to, subject, text, "could not reach Brevo");
  }
};
