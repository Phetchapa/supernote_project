const express = require('express');
const noteController = require('../controllers/noteController');
const authenticate = require('../middleware');

const router = express.Router();
try {

    router.post('/login', noteController.loginUser);
    router.post('/register', noteController.createUser);
    router.post('/forgotpassword', noteController.forgotPassword);
    router.post('/changepassword', noteController.changepassword);

    router.use(authenticate);

    router.post('/notes', noteController.createNote);
    router.get('/notes/:userId', noteController.getAllNotes);

    router.put('/notes/:userId/:noteId', noteController.updateNote); // แก้ไข note
    router.delete('/notes/:userId/:noteId', noteController.deleteNote); // ลบ note

    //add by pond
    router.get('/user/:userId/email', noteController.getUserEmail);

}
catch (error) {
    console.error(error);
}

module.exports = router;