import ejs from "ejs";
import nodeMailer, { Transporter } from "nodemailer";
import path from "path";

interface ISendMail {
  email: string;
  subject: string;
  template: string;
  data: { [key: string]: any };
}

const sendMail = async ({
  email,
  subject,
  template,
  data,
}: ISendMail): Promise<void> => {
  const transporter: Transporter = nodeMailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || "587"),
    service: process.env.SMTP_SERVICE,
    auth: {
      user: process.env.SMTP_MAIL,
      pass: process.env.SMTP_PASSWORD,
    },
  });

  console.log("__dirname: ", path.join(__dirname, "../views", template));
  console.log("data: ", data);
  console.log('email: ', email);
  const mailOptions = {
    from: process.env.SMTP_EMAIL,
    to: email,
    subject,
    html: await ejs.renderFile(
      path.join(__dirname, "../views", template),
      data,
    ),
  };

  await transporter
    .sendMail(mailOptions)
    .then((info) => {
      console.log("Message sent: %s", info.messageId);
    })
    .catch((error) => {
      console.log("Error: ", error);
    });
};

export default sendMail;
