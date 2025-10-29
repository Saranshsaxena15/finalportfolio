import axios from 'axios';
import { NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

// Helper function to send Telegram message
async function sendTelegramMessage(token, chat_id, message) {
  const url = `https://api.telegram.org/bot${token}/sendMessage`;
  try {
    const res = await axios.post(url, { text: message, chat_id });
    return res.data.ok;
  } catch (error) {
    console.error('Error sending Telegram message:', error.response?.data || error.message);
    return false;
  }
}

// Email HTML template
const generateEmailTemplate = (name, email, userMessage) => `
  <div style="font-family: Arial, sans-serif; color: #333; padding: 20px;">
    <h2 style="color:#007BFF;">New Message Received</h2>
    <p><strong>Name:</strong> ${name}</p>
    <p><strong>Email:</strong> ${email}</p>
    <p><strong>Message:</strong></p>
    <blockquote style="border-left: 4px solid #007BFF; padding-left: 10px;">
      ${userMessage}
    </blockquote>
  </div>
`;

// Send email using Resend
async function sendEmail(payload) {
  const { name, email, message } = payload;

  try {
    await resend.emails.send({
      from: 'Portfolio <onboarding@resend.dev>', // You can use your own verified domain later
      to: process.env.EMAIL_ADDRESS,
      subject: `New Message From ${name}`,
      html: generateEmailTemplate(name, email, message),
      reply_to: email,
    });

    return true;
  } catch (error) {
    console.error('Error sending email via Resend:', error);
    return false;
  }
}

export async function POST(request) {
  try {
    const payload = await request.json();
    const { name, email, message } = payload;
    const token = process.env.TELEGRAM_BOT_TOKEN;
    const chat_id = process.env.TELEGRAM_CHAT_ID;

    if (!token || !chat_id) {
      return NextResponse.json({ success: false, message: 'Telegram credentials missing' }, { status: 400 });
    }

    const telegramMessage = `New message from ${name}\n\nEmail: ${email}\n\nMessage:\n\n${message}`;

    const telegramSuccess = await sendTelegramMessage(token, chat_id, telegramMessage);
    const emailSuccess = await sendEmail(payload);

    if (telegramSuccess && emailSuccess) {
      return NextResponse.json({ success: true, message: 'Message and email sent successfully!' }, { status: 200 });
    }

    return NextResponse.json({ success: false, message: 'Failed to send message or email.' }, { status: 500 });
  } catch (error) {
    console.error('API Error:', error.message);
    return NextResponse.json({ success: false, message: 'Server error occurred.' }, { status: 500 });
  }
}
