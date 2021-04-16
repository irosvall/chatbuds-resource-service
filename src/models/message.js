/**
 * Mongoose model message.
 *
 * @author Ida Rosvall <ir222gn@student.lnu.se>
 * @version 1.0.0
 */

import mongoose from 'mongoose'

const schema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'A sender is required.']
  },
  message: {
    type: String,
    required: [true, 'A message is required.'],
    minlength: [1, 'The message must contain at least {MINLENGTH} characters.'],
    maxlenght: [500, 'The message has extended the limit of {MAXLENGTH} characters.']
  }
}, {
  timestamps: true,
  versionKey: false
})

// Create a model using the schema.
export const Message = mongoose.model('Message', schema)
