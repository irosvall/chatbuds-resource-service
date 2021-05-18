/* eslint-disable no-undef */

/**
 * Tests for user functionality.
 *
 * @author Ida Rosvall <ir222gn@student.lnu.se>
 */

import mongoose from 'mongoose'
import chai from 'chai'
import { mockdata } from './mockdata.js'
import { TestUtils } from './utils.js'
import { User } from '../src/models/user.js'
import { UserController } from '../src/controllers/api/user-controller.js'

const userController = new UserController()
const utils = new TestUtils()

describe('User tests', () => {
  before(async () => {
    // Connect to the test database.
    await mongoose.connect(process.env.DB_CONNECTION_STRING_TEST, {
      useCreateIndex: true,
      useNewUrlParser: true,
      useUnifiedTopology: true
    })
  })

  after(async () => {
    await mongoose.connection.close()
  })

  describe('Deleting user', () => {
    beforeEach(async () => {
      await resetTestDatabase()
    })

    it('User should not exist in user database anymore', async () => {
      const req = {
        account: { userID: 'test' }
      }
      const res = utils.mockResponse()

      await userController.delete(req, res, () => {})
      chai.assert.isTrue(res.status.calledWith(204), 'Expected response to send status 204')
      chai.assert.equal(await User.getById('test'), null)
    })

    it('User should not exist in other users information', async () => {
      const req = {
        account: { userID: 'test' }
      }
      const res = utils.mockResponse()

      await userController.delete(req, res, () => {})

      const friendWithCurrentUser = await User.getById('test3friendsWithTest')
      const userWithFriendRequestFromCurrentUser = await User.getById('test2friendRequestFromTest')

      chai.assert.isFalse(friendWithCurrentUser.friends.some(user => user.userID === currentUser.userID))
      chai.assert.isFalse(userWithFriendRequestFromCurrentUser.recievedFriendRequests.some(user => user.userID === currentUser.userID))
    })

    it('Deleting a nonexistent user results in status 404', async () => {
      const req = {
        account: { userID: 'test' }
      }
      const res = utils.mockResponse()

      await userController.delete(req, res, () => {})

      const friendWithCurrentUser = await User.getById('test3friendsWithTest')
      const userWithFriendRequestFromCurrentUser = await User.getById('test2friendRequestFromTest')

      chai.assert.isFalse(friendWithCurrentUser.friends.some(user => user.userID === currentUser.userID))
      chai.assert.isFalse(userWithFriendRequestFromCurrentUser.recievedFriendRequests.some(user => user.userID === currentUser.userID))
    })
  })
})

/**
 * Resets the test database by removing all users and then insert all mocked users.
 */
const resetTestDatabase = async () => {
  await User.deleteMany()
  await User.insertMany(mockdata.users)
}
