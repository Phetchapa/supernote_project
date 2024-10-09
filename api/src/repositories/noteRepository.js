const prisma = require('../prisma/client');
const { ObjectId } = require('mongodb');

class NoteRepository {
  async createNote(title, content, color, status, notificationTimeStatus, notificationTime, userId) {
    const now = new Date();
    now.setHours(now.getHours() + 7);


    const noteId = new ObjectId();

    const note = {
      noteId: noteId.toString(), // noteId เก็บเป็น String
      title: title,
      content: content,
      color: color,
      userId: userId, // userId ต้องเป็น ObjectId ที่แปลงเป็น string เช่นกัน
      date: now, // บันทึกเวลาปัจจุบันในรูปแบบ Date object
      status: status, // ค่าเริ่มต้น
      notificationTimeStatus: notificationTimeStatus, // หรือค่าที่ตั้งไว้
      notificationTime: notificationTime, // ค่าเริ่มต้นเป็นพรุ่งนี้เวลา 00:00
    };

    const createdNote = await prisma.note.create({
      data: note
    });

    return createdNote;
  }

  async getNoteByUserId(userId) {
    return prisma.note.findMany({
      where: { userId: userId }
    });
  }

  async getAllNotes(userId) {
    return await prisma.note.findMany({
      where: {
        userId: userId,
      },
      orderBy: {
        noteId: 'desc',
      },
    });
  }

  async updateNote(noteId, title, content, color, status, notificationTimeStatus, notificationTime) {
    return prisma.note.update({
      where: { noteId: noteId },
      data: {
        title: title,
        content: content,
        color: color,
        status: status, // อัปเดตสถานะ
        notificationTimeStatus: notificationTimeStatus, // อัปเดตสถานะการแจ้งเตือน
        notificationTime: notificationTime, // อัปเดตเวลาแจ้งเตือน
      },
    });
  }


  async deleteNoteById(noteId) {
    return prisma.note.delete({ where: { noteId: noteId } });
  }

  async createUser(email, password) {

    let user; // ประกาศตัวแปร user ที่ระดับสูงกว่า

    user = await prisma.user.create({
      data: {
        userId: new ObjectId().toString(),
        email: email,
        password: password,
      },
    });


    let updatedUser; // ประกาศตัวแปร updatedUser ที่ระดับสูงกว่า

    // จากนั้นทำการอัปเดต userId ให้เท่ากับ _id
    updatedUser = await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        userId: user.id, // อัปเดต userId ให้เท่ากับ _id ที่เพิ่งถูกสร้าง
      },
    });


    // ส่ง response กลับไปพร้อมข้อมูลของผู้ใช้ที่ถูกอัปเดต
    return updatedUser;
  }

  async loginUser(email) {
    const user = await prisma.user.findUnique({
      where: { email },
    })
    return user;

  }

  async changepassword(userId, password) {
    await prisma.user.update({
      where: { userId: userId },
      data: {
        password: password,
      },
    });
    return "Password changed successfully";
  }

  async getUserByEmail(email) {
    return prisma.user.findUnique({ where: { email: email } });
  }

  async getUserById(userId) {
    return prisma.user.findUnique({ where: { userId: userId } });
  }

  async getNotesWithNotification() {
    return prisma.note.findMany({
      where: {
        notificationTimeStatus: true,
      },
      include: {
        user: true, // ดึงข้อมูล user ที่เชื่อมโยงกับ note
      },
    });
  }

}
module.exports = new NoteRepository();
