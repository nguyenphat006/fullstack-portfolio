"use server";

import nodemailer from "nodemailer";

const MESSAGES = {
  vi: {
    missing: "Vui lòng điền đầy đủ các thông tin bắt buộc!",
    notConfigured: "Tính năng gửi mail đang bảo trì hoặc chưa cấu hình đúng. Vui lòng dùng nút gửi Email thay thế!",
    success: "Đã gửi tin nhắn thành công! Mình sẽ phản hồi bạn sớm nhất.",
    failed: "Có lỗi kĩ thuật khi gửi mail. Vui lòng thử lại sau hoặc gửi mail trực tiếp.",
  },
  en: {
    missing: "Please fill in all required fields!",
    notConfigured: "Email sending is under maintenance or not configured correctly. Please use the Email button instead!",
    success: "Message sent successfully! I will get back to you as soon as possible.",
    failed: "A technical error occurred while sending. Please try again later or email me directly.",
  },
} as const;

export async function sendContactEmail(prevState: unknown, formData: FormData) {
  const rawLocale = formData.get("locale");
  const msg = MESSAGES[rawLocale === "en" ? "en" : "vi"];

  try {
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const message = formData.get("message") as string;

    if (!name || !email || !message) {
      return { error: msg.missing };
    }

    const { GMAIL_USER, GMAIL_APP_PASSWORD } = process.env;

    if (!GMAIL_USER || !GMAIL_APP_PASSWORD || GMAIL_APP_PASSWORD === "your-16-digit-app-password") {
      console.error("Thiếu cấu hình GMAIL_USER hoặc GMAIL_APP_PASSWORD hợp lệ trong .env.local");
      return { error: msg.notConfigured };
    }

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: GMAIL_USER,
        pass: GMAIL_APP_PASSWORD,
      },
    });

    const mailOptions = {
      from: `"${name} (Portfolio)" <${GMAIL_USER}>`,
      replyTo: email,
      to: GMAIL_USER,
      subject: `[Portfolio Contact] Tin nhắn mới từ ${name}`,
      text: `Bạn nhận được tin nhắn tĩnh:\nTên: ${name}\nEmail: ${email}\nNội dung: ${message}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; background-color: #f9f9f9; border-radius: 10px;">
          <h2 style="color: #333;">Bạn có một liên hệ mới từ Portfolio! 🚀</h2>
          <div style="background-color: white; padding: 20px; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
            <p><strong>Tên người gửi:</strong> ${name}</p>
            <p><strong>Email liên hệ:</strong> <a href="mailto:${email}">${email}</a></p>
            <p><strong>Nội dung:</strong></p>
            <blockquote style="border-left: 4px solid #10b981; padding-left: 1rem; color: #444; background: #f0fdf4; padding: 10px; border-radius: 0 5px 5px 0;">
              ${message.replace(/\n/g, '<br>')}
            </blockquote>
          </div>
          <p style="margin-top: 20px; font-size: 12px; color: #888; text-align: center;">Email này được tự động gửi từ module tính năng Liên hệ của Portfolio.</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);

    return { success: msg.success };
  } catch (error) {
    console.error("Lỗi thực tế khi gửi thư qua Nodemailer:", error);
    return { error: msg.failed };
  }
}
