const noteService = require('../services/noteService');

class NoteController {
  async createNote(req, res) {
    const { title, content, color, status, notificationTimeStatus, notificationTime, userId } = req.body
    try {
      const note = await noteService.createNote(title, content, color, status, notificationTimeStatus, notificationTime, userId);
      res.status(201).json(note);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async getAllNotes(req, res) {
    
    const { userId } = req.params
    try {
      const notes = await noteService.getAll(userId);
      res.status(200).json(notes);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async updateNote(req, res) {
    const { userId, noteId } = req.params
    const { title, content, color, status, notificationTimeStatus, notificationTime } = req.body
    console.log("notificationTimeStatus", notificationTimeStatus);
    console.log("notificationTime", notificationTime);


    try {
      const updatededNote = await noteService.update(userId, noteId, title, content, color, status, notificationTimeStatus, notificationTime);
      res.status(200).json(updatededNote);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async deleteNote(req, res) {
    const { userId, noteId } = req.params
    try {
      await noteService.delete(userId, noteId);
      res.status(200).json({ message: 'Note deleted successfully' });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async createUser(req, res) {
    const { email, password } = req.body;
    try {
      const newUser = await noteService.createUserr(email, password);
      res.status(200).json({ message: 'User created successfully' });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  };

  async loginUser(req, res) {
    const { email, password } = req.body
    try {
      const token = await noteService.loginUser(email, password);

      res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'None',
        // domain: '.suphasan.site', // ตรวจสอบให้แน่ใจว่าโดเมนตรงกัน
        // domain: '.patheeratee.site', // ตรวจสอบให้แน่ใจว่าโดเมนตรงกัน
        maxAge: 1800000000 // 5 hours
      });


      res.status(200).json({ message: 'Login success' });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async forgotPassword(req, res) {
    const { email } = req.body;
    try {
      const status = await noteService.forgotPassword(email);
      res.status(200).json({ message: "sent email success" });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async changepassword(req, res) {
    const { token, password, confirmPassword } = req.body;

    try {
      const status = await noteService.changepassword(token, password, confirmPassword);
      res.status(200).json({ status: status });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  //add by pond
  async getUserEmail(req, res) {
    const { userId } = req.params;
    try {
      const userEmail = await noteService.getUserEmail(userId);
      res.status(200).json({ email: userEmail });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }  
}

module.exports = new NoteController();