const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  role:    { type: String, enum: ['user', 'assistant'], required: true },
  content: { type: String, required: true },
}, { timestamps: true });

const chatSchema = new mongoose.Schema(
  {
    user:     { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title:    { type: String, default: 'New Chat' },
    messages: [messageSchema],
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Auto-title from first user message
chatSchema.pre('save', function (next) {
  if (this.messages.length >= 1 && this.title === 'New Chat') {
    const firstMsg = this.messages.find(m => m.role === 'user');
    if (firstMsg) {
      this.title = firstMsg.content.slice(0, 50) + (firstMsg.content.length > 50 ? '…' : '');
    }
  }
  next();
});

module.exports = mongoose.model('Chat', chatSchema);