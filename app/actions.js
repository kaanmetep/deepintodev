"use server";
import { createSecureRedisClient } from "@/_lib/redis";
import { checkRateLimit } from "@/_lib/checkRateLimit";
import nodemailer from "nodemailer";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { randomBytes } from "crypto";
import { headers } from "next/headers";
const emailSchema = z
  .string()
  .email("Invalid email format")
  .max(255, "Email too long");

async function sendVerificationEmail(email, transporter) {
  const token = jwt.sign(
    {
      email,
      jti: randomBytes(16).toString("hex"),
    },
    process.env.SECRET_KEY,
    { expiresIn: "10m" }
  );

  const verificationLink = `${process.env.BASE_URL}/api/verify?token=${token}`;

  try {
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
                <table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0" style="background-color: #fff; padding: 30px; border-radius: 6px; box-shadow: 0px 2px 4px rgba(0,0,0,0.1); text-align: left;">
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
                            <a href="${verificationLink}" style="background-color: #000; color: white; padding: 12px 24px; text-decoration: none; font-size: 16px; border-radius: 4px; display: inline-block;">Verify Email</a>
                        </td>
                    </tr>
                    <tr>
                        <td style="color: #666; font-size: 14px; padding-top: 20px;">
                            Link expires in 10 minutes.
                        </td>
                    </tr>
                    <tr>
                        <td style="color: #666; font-size: 14px; padding-top: 10px;">
                            Every ~one week, you'll get something good to read after completing your subscription.
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
  } catch (error) {
    console.error("Email sending failed", error);
    throw new Error("Failed to send verification email");
  }
}

export async function subscribe(_, formData) {
  const email = formData.get("email");

  try {
    if (!email) {
      throw new Error("Email is required!");
    }

    const result = emailSchema.safeParse(email);
    if (!result.success) {
      throw new Error(result.error.errors[0].message);
    }

    const redis = await createSecureRedisClient();

    const clientIp =
      headers().get("x-forwarded-for")?.split(",")[0] ||
      headers().get("x-real-ip");

    await checkRateLimit(redis, `ratelimit:subscribe:${clientIp}`, {
      limit: 3,
      duration: 300, // 5 minutes window
      blockDuration: 1800, // 30 mins block if exceeded
    });

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

    await sendVerificationEmail(email, transporter);

    return {
      message: "Invitation email sent. Please check your inbox.",
      status: "success",
    };
  } catch (err) {
    if (err.message === "RateLimitExceeded") {
      return {
        message: "Too many requests. Please try again later.",
        status: "rate_limited",
      };
    }

    console.error("Subscription process error", err);

    return {
      message: err.message,
      status: "error",
    };
  }
}
