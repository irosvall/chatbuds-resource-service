/**
 * Mongoose model user.
 *
 * @author Ida Rosvall <ir222gn@student.lnu.se>
 * @version 1.0.0
 */

import mongoose from 'mongoose'
import validator from 'validator'
import createError from 'http-errors'

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
  userID: {
    type: String,
    unique: 'The user ID is already in use.',
    required: [true, 'An ID for the user is required.']
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
  sentFriendRequests: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  recievedFriendRequests: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
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
 * Gets a user by user ID.
 *
 * @param {string} id - The user ID of the account.
 * @returns {Promise<User>} The Promise to be fulfilled.
 */
schema.statics.getById = async function (id) {
  return this.findOne({ userID: id }).populate('friends').populate('sentFriendRequests').populate('recievedFriendRequests')
}

/**
 * Creates and inserts a new user.
 *
 * @param {object} userData - The user data.
 * @param {string} userData.username - Required username.
 * @param {string} userData.userID - Required user ID.
 * @param {string} userData.email - Required email.
 * @param {string} userData.about - Optional about text.
 * @returns {Promise<User>} The Promise to be fulfilled.
 */
schema.statics.insert = async function (userData) {
  const user = new User(userData)
  return user.save()
}

/**
 * Partially updates a user.
 *
 * @param {object} userData - The user data.
 * @param {string} userData.username - Required username.
 * @param {string} userData.email - Required email.
 * @param {string} userData.about - Optional about text.
 * @param {string} userData.friends - Optional friends list.
 * @param {string} userData.sentFriendRequests - Optional sent friend requests list.
 * @param {string} userData.recievedFriendRequests - Optional recieved friend requests list.
 * @param {string} userData.chats - Optional chats list.
 * @returns {Promise} The Promise to be fulfilled.
 */
schema.methods.update = async function (userData) {
  for (const property in userData) {
    if (this[property]) {
      this[property] = userData[property]

      // If the property being changed is an array controll that all it's elements are unique.
      if (this[property].isMongooseArray) {
        if (!_uniqueArrayElementsValidator(this[property])) {
          throw createError(409)
        }
      }
    }
  }
  return this.save()
}

/**
 * Custom validator to make sure each element is unique in an array.
 *
 * @param {Array} array - The array to be validated.
 * @returns {boolean} - A boolean indecating if the validation passed or not.
 */
function _uniqueArrayElementsValidator (array) {
  return !array.some(element => array.indexOf(element) !== array.lastIndexOf(element))
}

// Create a model using the schema.
export const User = mongoose.model('User', schema)
