"use server";
import { createSecureRedisClient } from "@/_lib/redis";
import { checkRateLimit } from "@/_lib/checkRateLimit";
import nodemailer from "nodemailer";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { randomBytes } from "crypto";
import { headers } from "next/headers";
import { MongoClient } from "mongodb";

const emailSchema = z
  .string()
  .email("Invalid email format!")
  .max(255, "Email is too long!");

async function sendVerificationEmail(email, transporter) {
  if (!process.env.SECRET_KEY) {
    throw new Error("SECRET_KEY is not defined");
  }

  if (!process.env.BASE_URL) {
    throw new Error("BASE_URL is not defined");
  }

  const token = jwt.sign(
    {
      email,
      jti: randomBytes(16).toString("hex"),
    },
    process.env.SECRET_KEY,
    { expiresIn: "60m" }
  );

  const verificationLink = `${process.env.BASE_URL}/api/verify?token=${token}`;

  await transporter.sendMail({
    from: `"DeepIntoDev" <${process.env.EMAIL}>`,
    to: email,
    subject: "DeepIntoDev Newsletter - Email Verification",
    html: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Verify Your Subscription</title>
</head>
<body style="font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 20px; text-align: center;">

    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
        <tr>
            <td align="center">
                <table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0" style="background-color: #fff; padding: 30px; border-radius: 6px; box-shadow: 0px 2px 4px rgba(0,0,0,0.1); text-align: left; max-width: 100%;">
                    <tr>
                        <td style="font-size: 18px; font-weight: bold; color: #000;">
                            DeepIntoDev Newsletter
                        </td>
                    </tr>
                    <tr>
                        <td style="font-size: 16px; color: #333; padding: 20px 0;">
                            To verify your subscription, click the button below:
                        </td>
                    </tr>
                    <tr>
                        <td align="center">
                            <!-- Main Verification Button -->
                            <a href="${verificationLink}" style="background-color: #000; color: white !important; padding: 12px 24px; text-decoration: none; font-size: 16px; border-radius: 4px; display: inline-block; margin: 10px 0; border: 2px solid #000; font-weight: bold;">Verify Email</a>
                        </td>
                    </tr>
                    <tr>
                        <td align="center" style="padding-top: 10px;">
                            <!-- Alternative Text Link -->
                            <p style="font-size: 14px; color: #666;">
                                If you can't see the button above, <a href="${verificationLink}" style="color: #0066cc; text-decoration: underline; font-weight: bold;">click here to verify your email</a>.
                            </p>
                        </td>
                    </tr>
                    <tr>
                        <td style="color: #666; font-size: 14px; padding-top: 20px;">
                            Link expires in 60 minutes.
                        </td>
                    </tr>
                    <tr>
                        <td style="color: #666; font-size: 14px; padding-top: 10px;">
                            Every ~one week, you'll get something good to read after completing your subscription.
                        </td>
                    </tr>
                    <tr>
                        <td style="color: #666; font-size: 14px; padding-top: 20px; border-top: 1px solid #eee; margin-top: 20px;">
                            <p style="margin-top: 20px;">
                                Has your link expired? <a href="https://www.deepintodev.com/newsletter" style="color: #0066cc; text-decoration: underline; font-weight: bold;">Click here to request a new verification email</a>.
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>

</body>
</html>
`,
  });
}

export async function subscribe(_, formData) {
  let client = null;
  let redis = null;

  try {
    const email = formData.get("email");
    if (!email) {
      throw new Error("Email is required!");
    }

    const result = emailSchema.safeParse(email);
    if (!result.success) {
      throw new Error(result.error.errors[0].message);
    }

    if (!process.env.MONGODB_URI) {
      throw new Error("MongoDB connection string is not defined");
    }
    client = new MongoClient(process.env.MONGODB_URI);
    await client.connect();

    const collection = client.db("newsletter").collection("subscribers");
    const existingUser = await collection.findOne({ email });

    if (existingUser) {
      throw new Error("User is already subscribed to DeepIntoDev.");
    }

    redis = await createSecureRedisClient();

    const clientIp =
      (await headers()).get("x-forwarded-for")?.split(",")[0] ||
      (await headers()).get("x-real-ip");

    if (!clientIp) {
      throw new Error("Could not determine client IP. Please try again.");
    }

    try {
      await checkRateLimit(redis, `ratelimit:subscribe:${clientIp}`, {
        limit: 3,
        duration: 300, // 5 minutes window
        blockDuration: 1800, // 30 mins block if exceeded
      });
    } catch (err) {
      if (err.message === "RateLimitExceeded") {
        return {
          message: "Too many requests. Please try again later.",
          status: "rate_limited",
        };
      }
      throw err;
    }

    // Check email configuration
    if (!process.env.EMAIL || !process.env.EMAIL_PASSWORD) {
      throw new Error("Email credentials are not configured");
    }

    // Set up email transporter
    const transporter = nodemailer.createTransport({
      host: "smtp.zoho.eu",
      port: 465,
      secure: true,
      auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASSWORD,
      },
      timeout: 10000, // 10 seconds timeout
    });

    await transporter.verify();

    // Send verification email
    await sendVerificationEmail(email, transporter);

    return {
      message:
        "Invitation email sent. Please check your inbox. (Don't forget to check your spam folder)",
      status: "success",
    };
  } catch (err) {
    console.error("Subscription process error", err);

    return {
      message: err.message,
      status: "error",
    };
  } finally {
    if (client) {
      try {
        await client.close();
      } catch (err) {
        console.error("Error closing MongoDB connection", err);
      }
    }
  }
}
