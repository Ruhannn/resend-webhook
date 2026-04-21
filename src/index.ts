import { fetch } from "bun";
import { RESTPostAPIWebhookWithTokenJSONBody } from "discord-api-types/v10";
import { Elysia, t } from "elysia";

const app = new Elysia()
  .get("/", () => "❤️ I Love K")
  .post(
    "/webhook",
    async ({ body }) => {
      const { data } = body;

      const webhookPayload: RESTPostAPIWebhookWithTokenJSONBody = {
        username: "Resend Webhook",
        avatar_url: "https://resend.com/static/favicons/favicon@180x180.png",
        embeds: [
          {
            title: "Email Bounced",
            description: "A sent email has bounced. Full details below:",
            color: 0xFF0000,
            timestamp: new Date().toISOString(),
            fields: [
              { name: "From", value: `\`${data.from}\``, inline: true },
              { name: "To", value: `\`${data.to.join(", ")}\``, inline: true },
              { name: "Subject", value: data.subject || "_No subject_", inline: false },
              { name: "Bounce Type", value: `\`${data.bounce.type} - ${data.bounce.subType}\``, inline: true },
              { name: "Bounce Message", value: `\`\`\`${data.bounce.message}\`\`\``, inline: false },
              { name: "Email ID", value: `\`${data.email_id}\``, inline: true },
              { name: "Broadcast ID", value: `\`${data.broadcast_id}\``, inline: true },
              { name: "Template ID", value: `\`${data.template_id}\``, inline: true },
              { name: "Category", value: data.tags?.category || "_None_", inline: true },
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

        return {
          success: true,
          message: `Bounce processed and sent to Discord for ${data.from}`,
        };

      } catch (e) {
        console.error(e);

        return {
          success: false,
          message: `Failed to send webhook to Discord`,
        };
      }
    },
    {
      body: t.Object({
        type: t.Literal("email.bounced"),
        created_at: t.Date(),
        data: t.Object({
          broadcast_id: t.String(),
          created_at: t.Date(),
          email_id: t.String(),
          from: t.String(),
          to: t.Array(t.String()),
          subject: t.String(),
          template_id: t.String(),
          bounce: t.Object({
            message: t.String(),
            subType: t.String(),
            type: t.String(),
          }),
          tags: t.Object({
            category: t.String(),
          }),
        }),
      }),
    }
  )

console.log("Love K is running at http://localhost:3000");

export default app;
