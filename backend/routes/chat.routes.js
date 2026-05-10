const express = require('express');
const router  = express.Router();
const {
  sendMessage, getChats, getChatById,
  deleteChat, clearAllChats, renameChat,
} = require('../controllers/chat.controller');
const { protect } = require('../middleware/auth.middleware');

router.use(protect);

router.post('/send',        sendMessage);   // send message (new or existing chat)
router.get('/',             getChats);      // all chats list
router.get('/:id',          getChatById);   // single chat with messages
router.put('/:id/rename',   renameChat);    // rename chat
router.delete('/',          clearAllChats); // clear all
router.delete('/:id',       deleteChat);    // delete one

module.exports = router;