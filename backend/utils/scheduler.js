import cron from 'node-cron';
import { prisma } from '../config/db.js';
import { sendReminderEmail } from './emailUtils.js';

export const initScheduler = () => {
  // Run every day at 9:00 AM
  cron.schedule('0 9 * * *', async () => {
    console.log('--- RUNNING DAILY REMINDERS ---');
    
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateStr = tomorrow.toISOString().split('T')[0];

    try {
      const appointments = await prisma.appointment.findMany({
        where: {
          date: dateStr,
          status: 'approved',
          isDeleted: false,
        },
        include: {
          staff: { select: { id: true, name: true } },
          serviceRelation: { select: { id: true, name: true } }
        }
      });

      console.log(`Found ${appointments.length} appointments for ${dateStr}`);

      for (const app of appointments) {
        // Send reminders
        const mappedApp = {
          ...app,
          _id: app.id,
          staffId: app.staff ? { ...app.staff, _id: app.staff.id } : null,
        };

        try {
          if (app.email) {
            await sendReminderEmail(mappedApp);
            console.log(`Sent reminder email to ${app.email}`);
          }
          if (app.phone) {
            // await sendReminderSMS(mappedApp);
            console.log(`Would send reminder SMS to ${app.phone}`);
          }
        } catch (err) {
          console.error(`Error sending reminder for ${app.id}:`, err.message);
        }
      }
    } catch (error) {
      console.error('Scheduler Error:', error.message);
    }
  });
};
