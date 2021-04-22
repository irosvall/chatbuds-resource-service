/**
 * Mongoose model chat.
 *
 * @author Ida Rosvall <ir222gn@student.lnu.se>
 * @version 1.0.0
 */

import mongoose from 'mongoose'

const schema = new mongoose.Schema({
  members: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Members are required.']
  }],
  messages: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message'
  }]
}, {
  timestamps: true,
  versionKey: false,
  toJSON: {
    /**
     * Performs a transformation of the resulting object to remove sensitive information.
     *
     * @param {object} doc - The mongoose document which is being converted.
     * @param {object} ret - The plain object representation which has been converted.
     */
    transform: function (doc, ret) {
      delete ret._id
    },
    virtuals: true // ensure virtual fields are serialized
  }
})

schema.virtual('id').get(function () {
  return this._id.toHexString()
})

// Create a model using the schema.
export const Chat = mongoose.model('Chat', schema)
