// sendEmail.ts server/src/utils/sendEmail.ts
// "Sends" an email by printing it in the server terminal.
// Every email goes through this one function, so a real email service could be plugged in here later
// without changing anything else.

// STEP 19 (part 3): Emails (printed, not sent)

export const sendEmail = async (to: string, subject: string, text: string) => {
  console.log(
    [
      "",
      "================ EMAIL (not really sent) ================",
      `To:      ${to}`,
      `Subject: ${subject}`,
      "",
      text,
      "=========================================================",
      "",
    ].join("\n"),
  );
};
