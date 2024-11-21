import AWS from "aws-sdk";
import Mailgun from "mailgun.js";
import formData from "form-data";

const secretsManager = new AWS.SecretsManager();

export const handler = async (event) => {
  try {
    // Retrieve Mailgun API key from Secrets Manager
    const secretValue = await secretsManager
      .getSecretValue({
        SecretId: process.env.MAILGUN_SECRET_ARN,
      })
      .promise();

    const secret = JSON.parse(secretValue.SecretString);
    const MAILGUN_API_KEY = secret.MAILGUN_API_KEY;
    const DOMAIN = process.env.MAILGUN_DOMAIN;
    console.log("MAILGUN_API_KEY:", MAILGUN_API_KEY);
    console.log("MAILGUN_DOMAIN:", DOMAIN);
    console.log("url:", DOMAIN);

    // Initialize Mailgun client
    const mailgun = new Mailgun(formData);
    const mg = mailgun.client({
      username: "api",
      key: MAILGUN_API_KEY,
    });

    // Process SNS event
    const snsMessage = event.Records[0].Sns.Message;
    const payload = JSON.parse(snsMessage);

    const { email, url } = payload;

    console.log("verification url: " + url);
    // Send email via Mailgun
    const msgData = {
      from: `noreply@${DOMAIN}`,
      to: email,
      subject: "Verify Your Email Address",
      template: "verify_email",
      "h:X-Mailgun-Variables": JSON.stringify({
        email: email,
        verification_url: url,
      }),
    };

    await mg.messages.create(DOMAIN, msgData);

    console.log("Email sent successfully to", email);

    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Email sent successfully." }),
    };
  } catch (error) {
    console.error("Error sending email:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: "Internal Server Error",
        error: error.message,
      }),
    };
  }
};
