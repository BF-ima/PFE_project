// routes/messageRoutes.js
const express = require("express");
const router  = require("express").Router();
const ctrl    = require("../controllers/messageController");
const upload = require('../middleware/uploadsfilemsg');


router.post('/upload', upload.single('file'), ctrl.uploadFile);
router.get('/conversations', ctrl.getConversations);
router.get('/download', ctrl.downloadFile);
router.get('/:convId',       ctrl.getMessages);
router.post('/',             ctrl.sendMessage);
router.patch('/:convId/read', ctrl.markAsRead);



module.exports = router;