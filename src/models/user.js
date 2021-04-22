/**
 * Mongoose model user.
 *
 * @author Ida Rosvall <ir222gn@student.lnu.se>
 * @version 1.0.0
 */

import mongoose from 'mongoose'
import validator from 'validator'

const schema = new mongoose.Schema({
  username: {
    type: String,
    unique: 'The username is already in use.',
    required: [true, 'Username is required.'],
    trim: true,
    minlength: [2, 'The username must contain at least {MINLENGTH} characters.'],
    maxlenght: [24, 'The username has extended the limit of {MAXLENGTH} characters.'],
    validate: [validator.isAlphanumeric, 'The username is only allowed to contain numbers and letters (a-z)']
  },
  email: {
    type: String,
    unique: 'The email is already in use.',
    required: [true, 'Email is required.'],
    trim: true,
    maxlenght: [320, 'The email has extended the limit of {MAXLENGTH} characters.'],
    validate: [validator.isEmail, 'The email is not an valid email address.']
  },
  about: {
    type: String,
    maxlenght: [5000, 'The about text has extended the limit of {MAXLENGTH} characters.']
  },
  friends: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  chats: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Chat'
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
    }
  }
})

/**
 * Gets a user by username.
 *
 * @param {string} accountUsername - The username of the account.
 * @returns {Promise<User>} The Promise to be fulfilled.
 */
schema.statics.getByName = async function (accountUsername) {
  return this.findOne({ username: accountUsername })
}

/**
 * Creates and inserts a new user.
 *
 * @param {object} userData - The user data.
 * @param {string} userData.username - Required username.
 * @param {string} userData.email - Required email.
 * @param {string} userData.about - Optional about text.
 * @param {string} userData.friends - Optional friends list.
 * @param {string} userData.chats - Optional chats list.
 * @returns {Promise<User>} The Promise to be fulfilled.
 */
schema.statics.insert = async function (userData) {
  const user = new User(userData)
  return user.save()
}

// Create a model using the schema.
export const User = mongoose.model('User', schema)
