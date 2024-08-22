import nodemailer from "nodemailer";
// SOL_PRIVATE_KEY=""
// SMTP_USERNAME=""
// SMTP_PASSWORD=""
// SMTP_ENDPOINT

const transport = nodemailer.createTransport({
    host: process.env.SMTP_ENDPOINT,
    port: 587,
    secure: false, // upgrade later with STARTTLS
    auth: {
      user: process.env.SMTP_USERNAME,
      pass: process.env.SMTP_PASSWORD,
    },
  });

export async function sendEmail(to: string, body: string , subject : string) {
    await transport.sendMail({
        from: "vighnxsh.codes@gmail.com",
        sender: "vighnxsh.codes@gmail.com",
        to,
        subject: subject,
        text: body
    })
}