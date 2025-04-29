import jwt from "jsonwebtoken";
import { MongoClient } from "mongodb";
import { NextResponse } from "next/server";
import { createSecureRedisClient } from "@/_lib/redis";
import { checkRateLimit } from "@/_lib/checkRateLimit";

async function saveEmailToDatabase(email) {
  let client;
  try {
    client = new MongoClient(process.env.MONGODB_URI);

    await client.connect();
    const collection = client.db("newsletter").collection("subscribers");

    const existingUser = await collection.findOne({ email });
    if (existingUser) {
      console.log(`ERROR: User already subscribed: ${email}`);
      throw new Error("User is already subscribed");
    }

    await collection.insertOne({ email, verified: true });
  } catch (err) {
    console.error(`DATABASE ERROR: ${err.message}`);
    throw new Error(err.message);
  } finally {
    if (client) {
      await client.close();
    }
  }
}

// Shared HTML template for all pages
function generateHtmlTemplate(title, description, isError = false) {
  return `
<!DOCTYPE html>
<html>
<head>
    <title>${title} - DeepIntoDev</title>
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
        .action-button {
            display: inline-block;
            background-color: ${isError ? "#3B82F6" : "#34D399"};
            color: white;
            padding: 10px 16px;
            text-decoration: none;
            border-radius: 4px;
            font-weight: 500;
            margin-top: 10px;
        }
        .action-button:hover {
            background-color: ${isError ? "#2563EB" : "#10B981"};
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>${title}</h1>
        <div class="description">
            ${description}
        </div>
        ${
          isError
            ? `<a href="https://www.deepintodev.com/newsletter" class="action-button">Get a New Verification Link</a>`
            : ""
        }
        <div class="footer">
            &copy; 2025 DeepIntoDev
        </div>
    </div>
</body>
</html>
  `;
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams?.get("token");

  if (!token) {
    console.error("ERROR: Token missing in request");
    return new NextResponse(
      generateHtmlTemplate(
        "Token Required",
        "No verification token was provided. Please use the link sent to your email or request a new verification email.",
        true
      ),
      {
        status: 400,
        headers: { "Content-Type": "text/html" },
      }
    );
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
      generateHtmlTemplate(
        "Email Verified Successfully",
        "You've been successfully subscribed to DeepIntoDev's blog. Every ~one week you'll get something good to read. You can now close this page."
      ),
      {
        status: 200,
        headers: { "Content-Type": "text/html" },
      }
    );
  } catch (error) {
    if (error.message === "RateLimitExceeded") {
      console.error(`RATE LIMIT EXCEEDED: ${request.url}`);
      return new NextResponse(
        generateHtmlTemplate(
          "Rate Limit Exceeded",
          "You've made too many verification attempts. Please wait 30 minutes before trying again.",
          true
        ),
        {
          status: 429,
          headers: { "Content-Type": "text/html" },
        }
      );
    }

    if (error instanceof jwt.TokenExpiredError) {
      console.error(`TOKEN EXPIRED: ${token}`);
      return new NextResponse(
        generateHtmlTemplate(
          "Verification Token Expired",
          "The verification link has expired. Please request a new verification email using the button below.",
          true
        ),
        {
          status: 400,
          headers: { "Content-Type": "text/html" },
        }
      );
    }

    if (error instanceof jwt.JsonWebTokenError) {
      console.error(`INVALID TOKEN: ${error.message}`);
      return new NextResponse(
        generateHtmlTemplate(
          "Invalid Verification Token",
          "The verification token is not valid. It may have been tampered with or is incorrect. Please request a new verification email using the button below.",
          true
        ),
        {
          status: 400,
          headers: { "Content-Type": "text/html" },
        }
      );
    }

    if (error.message === "User is already subscribed") {
      console.error(`USER ALREADY SUBSCRIBED`);
      return new NextResponse(
        generateHtmlTemplate(
          "Already Subscribed",
          "This email address is already subscribed to DeepIntoDev's newsletter. No further action is needed.",
          false
        ),
        {
          status: 200,
          headers: { "Content-Type": "text/html" },
        }
      );
    }

    console.error(`GENERIC ERROR: ${error.message}`);
    return new NextResponse(
      generateHtmlTemplate(
        "Verification Failed",
        "An unexpected error occurred during email verification. Please try again by requesting a new verification email using the button below.",
        true
      ),
      {
        status: 400,
        headers: { "Content-Type": "text/html" },
      }
    );
  }
}
