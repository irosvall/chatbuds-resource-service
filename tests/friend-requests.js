/* eslint-disable no-undef */

/**
 * Tests for friend requests logic.
 *
 * @author Ida Rosvall <ir222gn@student.lnu.se>
 */

import mongoose from 'mongoose'
import chai from 'chai'
import sinon from 'sinon'
import { mockdata } from './mockdata.js'
import { User } from '../src/models/user.js'
import { UserController } from '../src/controllers/api/user-controller.js'

const userController = new UserController()

describe('Friends functionality', () => {
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

  describe('Testing friend requests', () => {
    beforeEach(async () => {
      // Inserts the premade users into the database.
      await User.deleteMany()
      await User.insertMany(mockdata.users)
    })

    it('Should send successful friend request', async () => {
      const currentUser = await User.getById('test')
      const targetedUser = await User.getById('test1NoFriends')

      const req = {
        currentUser: currentUser,
        targetedUser: targetedUser
      }
      const res = mockResponse()

      await userController.sendFriendRequest(req, res, () => { })
      chai.assert.isTrue(res.status.calledWith(204), 'Expected response to send status 204')
    })

    it('Should not send duplicate friend request', async () => {
      const currentUser = await User.getById('test')
      const targetedUser = await User.getById('test2friendRequestFromTest')

      const req = {
        currentUser: currentUser,
        targetedUser: targetedUser
      }
      const callback = mockCallback()

      await userController.sendFriendRequest(req, {}, callback)
      chai.assert.equal('ConflictError', callback.getCall(0).args[0].name)
    })

    it('Should not send friend request to already friend', async () => {
      const currentUser = await User.getById('test')
      const targetedUser = await User.getById('test3friendsWithTest')

      const req = {
        currentUser: currentUser,
        targetedUser: targetedUser
      }
      const callback = mockCallback()

      await userController.sendFriendRequest(req, {}, callback)
      chai.assert.equal('BadRequestError', callback.getCall(0).args[0].name)
    })

    it('Should not send friend request to itself', async () => {
      const currentUser = await User.getById('test')
      const targetedUser = await User.getById('test')

      const req = {
        currentUser: currentUser,
        targetedUser: targetedUser
      }
      const callback = mockCallback()

      await userController.sendFriendRequest(req, {}, callback)
      chai.assert.equal('BadRequestError', callback.getCall(0).args[0].name)
    })
  })

  describe('Testing accepting friend requests', () => {
    it('Should successfully accept friend request', async () => {
      const currentUser = await User.getById('test2friendRequestFromTest')
      const targetedUser = await User.getById('test')

      const req = {
        currentUser: currentUser,
        targetedUser: targetedUser
      }
      const res = mockResponse()

      await userController.acceptFriendRequest(req, res, () => { })
      chai.assert.isTrue(res.status.calledWith(204), 'Expected response to send status 204')
    })

    it('Should not accept friend request if no request has been sent', async () => {
      const currentUser = await User.getById('test1NoFriends')
      const targetedUser = await User.getById('test')

      const req = {
        currentUser: currentUser,
        targetedUser: targetedUser
      }
      const callback = mockCallback()

      await userController.acceptFriendRequest(req, {}, callback)
      chai.assert.equal('NotFoundError', callback.getCall(0).args[0].name)
    })
  })
})

/**
 * Creates a mocked response object.
 *
 * @returns {object} - The response object.
 */
const mockResponse = () => {
  const res = {}
  res.status = sinon.stub().returns(res)
  res.json = sinon.stub().returns(res)
  res.send = sinon.stub().returns(res)
  res.end = sinon.stub().returns(res)
  return res
}

/**
 * Returns a mocked next function.
 *
 * @returns {Function} - The mocked function.
 */
const mockCallback = () => {
  return sinon.spy()
}
