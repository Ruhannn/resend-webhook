import { fetch } from "bun";
import { RESTPostAPIWebhookWithTokenJSONBody } from "discord-api-types/v10";
import { Elysia, t } from "elysia";

const app = new Elysia()
  .get("/", () => "❤️ I Love K")

  .post(
    "/webhook",
    async ({ body }) => {
      const { data } = body;

      const attachments = data.attachments && data.attachments.length > 0 ? data.attachments.map((a) => `📎 ${a.filename} (${a.content_type})`).join("\n") : "No attachments";

      const webhookPayload: RESTPostAPIWebhookWithTokenJSONBody = {
        username: "Resend Inbox",
        avatar_url:
          "https://resend.com/static/favicons/favicon@180x180.png",
        embeds: [
          {
            title: "📩 New Email Received",
            color: 0x00ff99,
            timestamp: new Date().toISOString(),
            fields: [
              {
                name: "From",
                value: `\`${data.from}\``,
                inline: true,
              },
              {
                name: "To",
                value: `\`${data.to.join(", ")}\``,
                inline: true,
              },
              {
                name: "Subject",
                value: data.subject || "_No subject_",
                inline: false,
              },
              {
                name: "Message ID",
                value: `\`${data.message_id}\``,
                inline: false,
              },
              {
                name: "Attachments",
                value: attachments,
                inline: false,
              },
            ],
          },
        ],
      };

      try {
        await fetch(Bun.env.DISCORD_WEBHOOK_URL!, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(webhookPayload),
        });

        return { success: true };
      } catch (e) {
        console.error(e);
        return { success: false };
      }
    },
    {
      body: t.Object({
        type: t.Literal("email.received"),
        created_at: t.String(),
        data: t.Object({
          email_id: t.String(),
          created_at: t.String(),
          from: t.String(),
          to: t.Array(t.String()),
          subject: t.Optional(t.String()),
          message_id: t.Optional(t.String()),
          attachments: t.Optional(t.Array(t.Any())),
        }),
      })
    }
  );

console.log("Love k at http://localhost:3000");

export default app;
