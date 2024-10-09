const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const cron = require('node-cron');

const noteRoutes = require('./routes/noteRoutes');
const noteRepository = require('./repositories/noteRepository'); // Add this to access the repository
const { sendEmail_v2 } = require('./utils/sendEmail'); // นำเข้าฟังก์ชัน sendEmail_v2

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(cors({
    origin: ['http://localhost:3000', 'https://www.suphasan.site','https://www.patheeratee.site', 'http://10.53.50.183:3000'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
}));

app.use(express.json());

// Cron job to check notificationTimeStatus every minute, based on Thai timezone
cron.schedule('* * * * *', async () => {
    console.log('Checking notifications in Thai time...');
    try {
        // Fetch all notes where notificationTimeStatus is true
        const notesWithNotifications = await noteRepository.getNotesWithNotification();

        // Get the current date and time in 'dd/MM/yyyy HH:mm' format for Thai time
        const now = new Date();
        const currentDateTime = now.toLocaleString('en-GB', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            timeZone: 'Asia/Bangkok', // Thailand timezone
        });

        
        // Check each note
        notesWithNotifications.forEach(async (note) => {

            const notificationDateTime = new Date(note.notificationTime);
            notificationDateTime.setHours(notificationDateTime.getHours() - 7); // ลบ 7 ชั่วโมง

            const formattedNotificationDateTime = notificationDateTime.toLocaleString('en-GB', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                timeZone: 'Asia/Bangkok', // Thailand timezone
            });
            console.log('formattedNotificationDateTime:', formattedNotificationDateTime);
            console.log('currentDateTime:', currentDateTime);
            

            // If current date and time matches notification time, send an email
            if (formattedNotificationDateTime === currentDateTime) {
                console.log("Sending email to: ", note.user.email);
                
                await sendEmail_v2(note.user.email, `Reminder for note: <b>${note.title}</b>`);
            }
        });
    } catch (error) {
        console.error(error);
    }
});

app.use('/', noteRoutes);

module.exports = app;
