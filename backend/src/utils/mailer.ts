import nodemailer, { Transporter } from 'nodemailer';

let transporterPromise: Promise<Transporter> | null = null;

const createTransporter = async (): Promise<Transporter> => {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;

  if (SMTP_HOST && SMTP_USER && SMTP_PASS) {
    return nodemailer.createTransport({
      host: SMTP_HOST,
      port: Number(SMTP_PORT) || 587,
      auth: { user: SMTP_USER, pass: SMTP_PASS },
    });
  }

  const testAccount = await nodemailer.createTestAccount();
  return nodemailer.createTransport({
    host: testAccount.smtp.host,
    port: testAccount.smtp.port,
    secure: testAccount.smtp.secure,
    auth: { user: testAccount.user, pass: testAccount.pass },
  });
};

const getTransporter = (): Promise<Transporter> => {
  if (!transporterPromise) {
    transporterPromise = createTransporter().catch((error) => {
      transporterPromise = null;
      throw error;
    });
  }
  return transporterPromise;
};

interface SendMailParams {
  to: string;
  subject: string;
  text: string;
  replyTo?: string;
}

export const sendMail = async (
  params: SendMailParams
): Promise<{ previewUrl: string | null }> => {
  const transporter = await getTransporter();

  const info = await transporter.sendMail({
    from: process.env.MAIL_FROM || '"Book Exchange" <no-reply@bookexchange.test>',
    to: params.to,
    subject: params.subject,
    text: params.text,
    replyTo: params.replyTo,
  });

  const previewUrl = nodemailer.getTestMessageUrl(info);
  return { previewUrl: previewUrl || null };
};