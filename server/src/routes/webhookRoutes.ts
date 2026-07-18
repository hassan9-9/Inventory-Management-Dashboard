import { Router } from "express";
import { Webhook } from "svix";
import { PrismaClient } from "@prisma/client";

const router = Router();
const prisma = new PrismaClient();

router.post("/clerk", async (req, res) => {
  console.log("========== CLERK WEBHOOK ==========");

  try {
    const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

    if (!WEBHOOK_SECRET) {
      console.error("Missing CLERK_WEBHOOK_SECRET");
      return res.status(500).json({
        error: "Webhook secret not configured",
      });
    }

    const svixId = req.header("svix-id");
    const svixTimestamp = req.header("svix-timestamp");
    const svixSignature = req.header("svix-signature");

    if (!svixId || !svixTimestamp || !svixSignature) {
      console.error("Missing Svix headers");

      return res.status(400).json({
        error: "Missing Svix headers",
      });
    }

    const payload = Buffer.isBuffer(req.body)
      ? req.body.toString("utf8")
      : JSON.stringify(req.body);

    const wh = new Webhook(WEBHOOK_SECRET);

    let evt: any;

    try {
      evt = wh.verify(payload, {
        "svix-id": svixId,
        "svix-timestamp": svixTimestamp,
        "svix-signature": svixSignature,
      });
    } catch (err) {
      console.error("Webhook signature verification failed");
      console.error(err);

      return res.status(400).json({
        error: "Invalid webhook signature",
      });
    }

    console.log(`Event: ${evt.type}`);

    switch (evt.type) {
      case "user.created":
      case "user.updated": {
        const data = evt.data;

        const email =
          data.email_addresses?.find(
            (email: any) => email.id === data.primary_email_address_id
          )?.email_address ??
          data.email_addresses?.[0]?.email_address;

        if (!email) {
          console.error("No primary email found.");

          return res.status(400).json({
            error: "Primary email not found.",
          });
        }

        await prisma.users.upsert({
          where: {
            userId: data.id,
          },

          update: {
            firstName: data.first_name,
            lastName: data.last_name,
            username: data.username,
            email,
          },

          create: {
            userId: data.id,
            firstName: data.first_name,
            lastName: data.last_name,
            username: data.username,
            email,
            role: "STAFF",
          },
        });

        console.log(`User ${data.id} synced successfully.`);
        break;
      }

      case "user.deleted": {
        const userId = evt.data.id;

        console.log(`Deleting user ${userId}`);

        const deleted = await prisma.users.deleteMany({
          where: {
            userId,
          },
        });

        console.log(`Deleted ${deleted.count} record(s).`);
        break;
      }

      default:
        console.log(`Ignoring event: ${evt.type}`);
        break;
    }

    return res.status(200).json({
      success: true,
    });
  } catch (error) {
    console.error("Unexpected webhook error:");
    console.error(error);

    return res.status(500).json({
      error: "Internal server error",
    });
  }
});

export default router;