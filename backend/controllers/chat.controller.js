const Chat = require('../models/Chat.model');
const { chatWithAI } = require('../utils/chat.ai');

// ─── SEND MESSAGE (create chat if new, or continue existing) ─────────────────
// POST /api/chat/send
const sendMessage = async (req, res) => {
  try {
    const { message, chatId } = req.body;
    if (!message?.trim()) return res.status(400).json({ success: false, message: 'Message is required' });

    let chat;

    if (chatId) {
      // Continue existing chat
      chat = await Chat.findOne({ _id: chatId, user: req.user._id });
      if (!chat) return res.status(404).json({ success: false, message: 'Chat not found' });
    } else {
      // New chat
      chat = await Chat.create({
        user: req.user._id,
        messages: [],
      });
    }

    // Add user message
    chat.messages.push({ role: 'user', content: message.trim() });

    // Get AI reply (pass full history for context)
    const aiReply = await chatWithAI(chat.messages);

    // Add AI reply
    chat.messages.push({ role: 'assistant', content: aiReply });

    // Update title from first message if still default
    if (chat.title === 'New Chat' && chat.messages.length >= 1) {
      const first = chat.messages.find(m => m.role === 'user');
      if (first) chat.title = first.content.slice(0, 50) + (first.content.length > 50 ? '…' : '');
    }

    await chat.save();

    res.json({
      success: true,
      chatId: chat._id,
      reply: aiReply,
      title: chat.title,
    });
  } catch (error) {
    console.error('sendMessage error:', error);
    res.status(500).json({ success: false, message: error.message || 'Chat failed' });
  }
};

// ─── GET ALL CHATS (sidebar history list) ────────────────────────────────────
// GET /api/chat
const getChats = async (req, res) => {
  try {
    const chats = await Chat.find({ user: req.user._id, isActive: true })
      .select('title createdAt updatedAt messages')
      .sort({ updatedAt: -1 })
      .limit(50);

    // Return with last message preview
    const list = chats.map(c => ({
      _id:       c._id,
      title:     c.title,
      updatedAt: c.updatedAt,
      preview:   c.messages[c.messages.length - 1]?.content?.slice(0, 80) || '',
      count:     c.messages.length,
    }));

    res.json({ success: true, chats: list });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── GET SINGLE CHAT WITH ALL MESSAGES ───────────────────────────────────────
// GET /api/chat/:id
const getChatById = async (req, res) => {
  try {
    const chat = await Chat.findOne({ _id: req.params.id, user: req.user._id });
    if (!chat) return res.status(404).json({ success: false, message: 'Chat not found' });
    res.json({ success: true, chat });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── DELETE CHAT ──────────────────────────────────────────────────────────────
// DELETE /api/chat/:id
const deleteChat = async (req, res) => {
  try {
    const chat = await Chat.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!chat) return res.status(404).json({ success: false, message: 'Chat not found' });
    res.json({ success: true, message: 'Chat deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── CLEAR ALL CHATS ──────────────────────────────────────────────────────────
// DELETE /api/chat
const clearAllChats = async (req, res) => {
  try {
    await Chat.deleteMany({ user: req.user._id });
    res.json({ success: true, message: 'All chats cleared' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── RENAME CHAT ──────────────────────────────────────────────────────────────
// PUT /api/chat/:id/rename
const renameChat = async (req, res) => {
  try {
    const { title } = req.body;
    if (!title?.trim()) return res.status(400).json({ success: false, message: 'Title required' });
    const chat = await Chat.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { title: title.trim() },
      { new: true }
    );
    if (!chat) return res.status(404).json({ success: false, message: 'Chat not found' });
    res.json({ success: true, chat });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { sendMessage, getChats, getChatById, deleteChat, clearAllChats, renameChat };