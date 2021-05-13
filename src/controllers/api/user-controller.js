/**
 * Module for the user controller.
 *
 * @author Ida Rosvall <ir222gn@student.lnu.se>
 * @version 1.0.0
 */

import createError from 'http-errors'
import { User } from '../../models/user.js'

/**
 * Encapsulates the user controller.
 */
export class UserController {
  /**
   * Provide req.targetedUser to the route if :userID is present.
   *
   * @param {object} req - Express request object.
   * @param {object} res - Express response object.
   * @param {Function} next - Express next middleware function.
   * @param {string} userID - The value of the id for the user to load.
   */
  async loadUser (req, res, next, userID) {
    const user = await User.getById(userID)

    if (!user) {
      next(createError(404))
      return
    }

    req.targetedUser = user
    next()
  }

  /**
   * Provide req.currentUser to the route.
   *
   * @param {object} req - Express request object.
   * @param {object} res - Express response object.
   * @param {Function} next - Express next middleware function.
   */
  async loadCurrentUser (req, res, next) {
    const user = await User.getById(req.account.userID)

    if (!user) {
      next(createError(404))
      return
    }

    req.currentUser = user
    next()
  }

  /**
   * Sends a JSON response containing the current user.
   *
   * @param {object} req - Express request object.
   * @param {object} res - Express response object.
   * @param {Function} next - Express next middleware function.
   */
  async findCurrentUser (req, res, next) {
    try {
      res
        .status(200)
        .json(this._filterUser(req.currentUser))
    } catch (error) {
      next(error)
    }
  }

  /**
   * Sends a JSON response containing the specified user.
   *
   * @param {object} req - Express request object.
   * @param {object} res - Express response object.
   * @param {Function} next - Express next middleware function.
   */
  async find (req, res, next) {
    try {
      // Sends full user information if the user is requesting itself.
      if (req.targetedUser.userID === req.account.userID) {
        res
          .status(200)
          .json(this._filterUser(req.targetedUser))
      } else {
        res
          .status(200)
          .json({
            userID: req.targetedUser.userID,
            username: req.targetedUser.username,
            about: req.targetedUser.about
          })
      }
    } catch (error) {
      next(error)
    }
  }

  /**
   * Creates a new user.
   *
   * @param {object} req - Express request object.
   * @param {object} res - Express response object.
   * @param {Function} next - Express next middleware function.
   */
  async create (req, res, next) {
    try {
      await User.insert({
        username: req.body.username,
        userID: req.body.userID,
        email: req.body.email,
        about: req.body.about
      })

      res
        .status(201)
        .end()
    } catch (error) {
      let err = error
      if (err.code === 11000) {
        let message = ''

        if (err.keyPattern.email) {
          message = 'The email is already taken'
        } else if (err.keyPattern.username) {
          message = 'The username is already taken'
        }

        err = createError(409, message)
        err.innerException = error
      } else if (error.name === 'ValidationError') {
        err = createError(400)
        err.innerException = error
      }
      next(err)
    }
  }

  /**
   * Deletes the user.
   *
   * @param {object} req - Express request object.
   * @param {object} res - Express response object.
   * @param {Function} next - Express next middleware function.
   */
  async delete (req, res, next) {
    try {
      await User.deleteOne({ userID: req.currentUser.userID })

      res
        .status(204)
        .end()
    } catch (error) {
      let err = error
      if (error.name === 'ValidationError') {
        err = createError(400)
        err.innerException = error
      }
      next(err)
    }
  }

  /**
   * Sends a friend request to the specified user.
   *
   * @param {object} req - Express request object.
   * @param {object} res - Express response object.
   * @param {Function} next - Express next middleware function.
   */
  async sendFriendRequest (req, res, next) {
    try {
      // Don't send friend request if it's to the current user or if they're already friends.
      if (req.currentUser.userID === req.targetedUser.userID ||
        req.currentUser.friends.find(user => user.userID === req.targetedUser.userID)) {
        next(createError(400))
        return
      }

      const sentFriendRequests = req.currentUser.sentFriendRequests
      const recievedFriendRequests = req.targetedUser.recievedFriendRequests

      sentFriendRequests.push(req.targetedUser)
      recievedFriendRequests.push(req.currentUser)

      await req.currentUser.update({ sentFriendRequests: sentFriendRequests })
      await req.targetedUser.update({ recievedFriendRequests: recievedFriendRequests })

      res
        .status(204)
        .end()
    } catch (error) {
      let err = error
      if (err.code === 11000) {
        err = createError(409)
        err.innerException = error
      } else if (error.name === 'ValidationError') {
        err = createError(400)
        err.innerException = error
      }
      next(err)
    }
  }

  /**
   * Accepts a friend request of the specified user.
   *
   * @param {object} req - Express request object.
   * @param {object} res - Express response object.
   * @param {Function} next - Express next middleware function.
   */
  async acceptFriendRequest (req, res, next) {
    try {
      if (req.currentUser.userID === req.targetedUser.userID) {
        next(createError(400))
        return
      }

      const currentUserRecievedFriendRequests = req.currentUser.recievedFriendRequests
      const currentUserSentFriendRequests = req.currentUser.sentFriendRequests
      const currentUserFriends = req.currentUser.friends
      const targetUserSentFriendRequests = req.targetedUser.sentFriendRequests
      const targetUserRecievedFriendRequests = req.targetedUser.recievedFriendRequests
      const targetedUserFriends = req.targetedUser.friends

      const friendRequestID = targetUserSentFriendRequests.findIndex(user => user.userID === req.currentUser.userID)

      // If targeted user has sent a friend request then add each other as friends.
      if (friendRequestID !== -1) {
        targetUserSentFriendRequests.splice(friendRequestID, 1)
        currentUserFriends.push(req.targetedUser)
        targetedUserFriends.push(req.currentUser)

        // Removes friend requests from both users.
        this._removeUserFromArray(currentUserRecievedFriendRequests, req.targetedUser)
        this._removeUserFromArray(currentUserSentFriendRequests, req.targetedUser)
        this._removeUserFromArray(targetUserRecievedFriendRequests, req.currentUser)

        await req.currentUser.update({
          recievedFriendRequests: currentUserRecievedFriendRequests,
          sentFriendRequests: currentUserSentFriendRequests,
          friends: currentUserFriends
        })
        await req.targetedUser.update({
          recievedFriendRequests: targetUserRecievedFriendRequests,
          sentFriendRequests: targetUserSentFriendRequests,
          friends: targetedUserFriends
        })
      } else {
        next(createError(404))
        return
      }

      res
        .status(204)
        .end()
    } catch (error) {
      let err = error
      if (err.code === 11000) {
        err = createError(409)
        err.innerException = error
      } else if (error.name === 'ValidationError') {
        err = createError(400)
        err.innerException = error
      }
      next(err)
    }
  }

  /**
   * Declines a friend request of the specified user.
   *
   * @param {object} req - Express request object.
   * @param {object} res - Express response object.
   * @param {Function} next - Express next middleware function.
   */
  async declineFriendRequest (req, res, next) {
    try {
      const recievedFriendRequests = req.currentUser.recievedFriendRequests
      const sentFriendRequests = req.targetedUser.sentFriendRequests

      const isRemovedFromCurrent = this._removeUserFromArray(recievedFriendRequests, req.targetedUser)
      const isRemovedFromTarget = this._removeUserFromArray(sentFriendRequests, req.currentUser)

      // If a friend request was deleted update database, otherwise send 404 status.
      if (isRemovedFromCurrent || isRemovedFromTarget) {
        await req.targetedUser.update({ sentFriendRequests: sentFriendRequests })
        await req.currentUser.update({ recievedFriendRequests: recievedFriendRequests })
      } else {
        next(createError(404))
        return
      }

      res
        .status(204)
        .end()
    } catch (error) {
      let err = error
      if (err.code === 11000) {
        err = createError(409)
        err.innerException = error
      } else if (error.name === 'ValidationError') {
        err = createError(400)
        err.innerException = error
      }
      next(err)
    }
  }

  /**
   * Removes a specified friend.
   *
   * @param {object} req - Express request object.
   * @param {object} res - Express response object.
   * @param {Function} next - Express next middleware function.
   */
  async removeFriend (req, res, next) {
    try {
      const currentUserFriends = req.currentUser.friends
      const targetUserFriends = req.targetedUser.friends

      const isRemovedFromCurrent = this._removeUserFromArray(currentUserFriends, req.targetedUser)
      const isRemovedFromTarget = this._removeUserFromArray(targetUserFriends, req.currentUser)

      // If a friend was deleted update database, otherwise send 404 status.
      if (isRemovedFromCurrent || isRemovedFromTarget) {
        await req.currentUser.update({ friends: currentUserFriends })
        await req.targetedUser.update({ friends: targetUserFriends })
      } else {
        next(createError(404))
        return
      }

      res
        .status(204)
        .end()
    } catch (error) {
      let err = error
      if (err.code === 11000) {
        err = createError(409)
        err.innerException = error
      } else if (error.name === 'ValidationError') {
        err = createError(400)
        err.innerException = error
      }
      next(err)
    }
  }

  /**
   * Removes a user from an array.
   *
   * @param {User[]} array - An array of users.
   * @param {User} user - The user to remove from array.
   * @returns {boolean} - True if user got removed, otherwise false.
   */
  _removeUserFromArray (array, user) {
    for (let i = 0; i < array.length; i++) {
      if (array[i].userID === user.userID) {
        array.splice(i, 1)
        return true
      }
    }
    return false
  }

  /**
   * Filters a user's information of other users from their sensitive information.
   *
   * @param {User} user - The user to filter.
   * @returns {User} Returns the user with filtered information.
   */
  _filterUser (user) {
    const friends = this._filterSensitiveInformation(user.friends)
    const sentFriendRequests = this._filterSensitiveInformation(user.sentFriendRequests)
    const recievedFriendRequests = this._filterSensitiveInformation(user.recievedFriendRequests)

    return {
      username: user.username,
      userID: user.userID,
      email: user.email,
      about: user.about,
      friends: friends,
      sentFriendRequests: sentFriendRequests,
      recievedFriendRequests: recievedFriendRequests
    }
  }

  /**
   * Filters an array of users from their sensetive information.
   *
   * @param {User[]} users - The users.
   * @returns {User[]} The filtered array of users.
   */
  _filterSensitiveInformation (users) {
    return users.map(user => ({
      userID: user.userID,
      username: user.username,
      about: user.about
    }))
  }
}
