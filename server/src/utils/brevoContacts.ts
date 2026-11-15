// brevoContacts.ts server/src/utils/brevoContacts.ts
// Adds newsletter subscribers to (and removes them from) your Brevo contacts.
// Then you can send them a newsletter from Brevo's website: Campaigns -> Create an email campaign.

// STEP 24 (part 2): Brevo contacts

import { env } from "../config/env";

const BREVO_CONTACTS_URL = "https://api.brevo.com/v3/contacts";

// One request to Brevo's contacts API. Like sendEmail, it NEVER throws: if Brevo is down or not set up,
// the subscriber is still saved in OUR database, and the problem is only logged.
const brevoContacts = async (
  method: "POST" | "PUT",
  url: string,
  body: object,
) => {
  if (!env.brevoApiKey) {
    console.log(
      `(Brevo contacts skipped: no BREVO_API_KEY in .env) ${method} ${url}`,
    );
    return;
  }

  try {
    const response = await fetch(url, {
      method,
      headers: {
        "api-key": env.brevoApiKey,
        "content-type": "application/json",
        accept: "application/json",
      },
      body: JSON.stringify(body),
    });

    // 201 = created, 204 = updated: both are fine
    if (!response.ok) {
      console.error(
        `Brevo contacts refused (${response.status}):`,
        await response.text(),
      );
    }
  } catch (error) {
    console.error("Could not reach Brevo:", (error as Error).message);
  }
};

// The list in Brevo, e.g. 3 (from BREVO_LIST_ID). No list = the contact is saved without a list.
const listIds = () => (env.brevoListId ? [env.brevoListId] : undefined);

// Subscribe: create the contact, or update it if it already exists (updateEnabled), and allow emails again
export const addContact = (email: string) =>
  brevoContacts("POST", BREVO_CONTACTS_URL, {
    email,
    listIds: listIds(),
    updateEnabled: true, // already a contact? fine, just update it (no "duplicate" error)
    emailBlacklisted: false, // someone who unsubscribed and subscribes again can get emails again
  });

// Unsubscribe: "blacklisted" = Brevo will never send this contact a campaign
// encodeURIComponent: "ada+news@example.com" -> "ada%2Bnews%40example.com" (safe inside a URL)
export const removeContact = (email: string) =>
  brevoContacts("PUT", `${BREVO_CONTACTS_URL}/${encodeURIComponent(email)}`, {
    emailBlacklisted: true,
  });
