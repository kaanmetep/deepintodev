import jwt from "jsonwebtoken";
import { MongoClient } from "mongodb";
import { NextResponse } from "next/server";
import { createSecureRedisClient } from "@/_lib/redis";
import { checkRateLimit } from "@/_lib/checkRateLimit";

async function saveEmailToDatabase(email) {
  try {
    const client = new MongoClient(process.env.MONGODB_URI);

    await client.connect();
    const collection = client.db("newsletter").collection("subscribers");

    const existingUser = await collection.findOne({ email });
    if (existingUser) {
      throw new Error("User is already subscribed");
    }

    await collection.insertOne({ email, verified: true });
  } catch (err) {
    throw new Error(err.message);
  } finally {
    await client.close();
  }
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token");

  if (!token) {
    return new NextResponse("<h1>Token is required</h1>", {
      status: 400,
      headers: { "Content-Type": "text/html" },
    });
  }

  try {
    const redis = await createSecureRedisClient();
    const decoded = jwt.verify(token, process.env.SECRET_KEY);
    const { email } = decoded;

    await checkRateLimit(redis, `ratelimit:verify:${email}`, {
      limit: 5,
      duration: 300,
      blockDuration: 1800,
    });

    await saveEmailToDatabase(email);
    return new NextResponse(
      `
       <!DOCTYPE html>
<html>
<head>
    <title>Email Verified - DeepIntoDev</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
            margin: 0;
            line-height: 1.6;
            color: #333;
            background-color: #f4f4f4;
        }
        .container {
            max-width: 600px;
            margin: 50px auto;
            background: white;
            padding: 40px;
            border-radius: 8px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        }
        h1 {
            color: #0A0A0A;
            margin-bottom: 20px;
            font-size: 24px;
        }
        .success-icon {
            color: #34D399;
            font-size: 48px;
            margin-bottom: 20px;
        }
        .description {
            color: #6B7280;
            margin-bottom: 30px;
        }
        .footer {
            font-size: 14px;
            color: #6B7280;
            text-align: center;
            margin-top: 20px;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>Email Verified Successfully</h1>
        <p class="description">
            You've been succesfully subscribed to DeepIntoDev's blog. 
            every ~one week you'll get something good to read.
        </p>
        <div class="footer">
         2025 DeepIntoDev. You can now close this page.
        </div>
    </div>
</body>
</html>
       `,
      {
        status: 200,
        headers: { "Content-Type": "text/html" },
      }
    );
  } catch (error) {
    if (error.message === "RateLimitExceeded") {
      return new NextResponse(
        `<h1>Rate Limit Exceeded</h1>
        <p>You've made too many verification attempts. Please wait 30 minutes before trying again.</p>
        <small>Error: ${error.message}</small>`,
        {
          status: 429,
          headers: { "Content-Type": "text/html" },
        }
      );
    }

    if (error instanceof jwt.TokenExpiredError) {
      return new NextResponse(
        `<h1>Verification Token Expired</h1>
        <p>The verification link has expired. Please request a new verification email.</p>
        <small>Error: Token has expired</small>`,
        {
          status: 400,
          headers: { "Content-Type": "text/html" },
        }
      );
    }

    if (error instanceof jwt.JsonWebTokenError) {
      return new NextResponse(
        `<h1>Invalid Verification Token</h1>
        <p>The verification token is not valid. It may have been tampered with or is incorrect.</p>
        <small>Error: ${error.message}</small>`,
        {
          status: 400,
          headers: { "Content-Type": "text/html" },
        }
      );
    }

    return new NextResponse(
      `<h1>Verification Failed</h1>
      <p>An unexpected error occurred during email verification.</p>
      <small>Details: ${error.message}</small>`,
      {
        status: 400,
        headers: { "Content-Type": "text/html" },
      }
    );
  }
}
