const nodemailer = require("nodemailer");

async function sendEmail(email, token) {
    const transporter = nodemailer.createTransport({
        host: "smtp.gmail.com", // SMTP server for Gmail
        port: 465,
        secure: true, // Use `true` for port 465, `false` for other ports
        auth: {
            user: "suphasan.m@kkumail.com", // Your email address
            pass: "qbji nsrg mtoz skgz", // Your email password or app-specific password
        },
    });

    try {
        const info = await transporter.sendMail({
            from: 'suphasan.m@kkumail.com', // Sender address
            to: `${email}`, // List of receivers
            subject: "Change Password", // Subject line
            text: "Change Password?", // Plain text body
            html: `<b>Change Password Click => <a href="http://localhost:3000/change_password/${token}">Click me</a></b>`, // HTML body
        });
        return 1;
    } catch (error) {
        return 0;
    }
}

async function sendEmail_v2(email, text) {
    const transporter = nodemailer.createTransport({
        host: "smtp.gmail.com", // SMTP server for Gmail
        port: 465,
        secure: true, // Use `true` for port 465, `false` for other ports
        auth: {
            user: "suphasan.m@kkumail.com", // Your email address
            pass: "qbji nsrg mtoz skgz", // Your email password or app-specific password
        },
    });

    try {
        const info = await transporter.sendMail({
            from: 'suphasan.m@kkumail.com', // Sender address
            to: `${email}`, // List of receivers
            subject: "Reminder Notification", // หัวเรื่องของอีเมลที่เหมาะสม
            text: "This is a reminder for an important event.", // ข้อความแจ้งเตือน
            html: `
                <b>Reminder</b><br>
                <p>${text}</p><br>
            `
        });
        return 1;
    } catch (error) {
        console.log(error);
        return 0;
    }
}


module.exports = {
    sendEmail,
    sendEmail_v2
};
