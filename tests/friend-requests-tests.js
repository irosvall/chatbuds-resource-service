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

  describe('Testing sending friend requests', () => {
    beforeEach(async () => {
      await resetTestDatabase()
    })

    it('Should successfully send friend request', async () => {
      const req = await createReqWithCurrentAndTargetUser('test', 'test1NoFriends')
      const res = mockResponse()

      await userController.sendFriendRequest(req, res, () => { })

      const updatedCurrentUser = await User.getById('test')
      const updatedTargetedUser = await User.getById('test1NoFriends')

      chai.assert.isTrue(res.status.calledWith(204), 'Expected response to send status 204')
      chai.assert.equal(updatedTargetedUser.userID, updatedCurrentUser.sentFriendRequests[1].userID)
      chai.assert.equal(updatedCurrentUser.userID, updatedTargetedUser.recievedFriendRequests[0].userID)
    })

    it('Should not send duplicate friend request', async () => {
      const req = await createReqWithCurrentAndTargetUser('test', 'test2friendRequestFromTest')
      const callback = mockCallback()

      await userController.sendFriendRequest(req, {}, callback)

      const updatedCurrentUser = await User.getById('test')
      const updatedTargetedUser = await User.getById('test2friendRequestFromTest')

      chai.assert.equal('ConflictError', callback.getCall(0).args[0].name)
      chai.assert.equal(1, updatedCurrentUser.sentFriendRequests.length)
      chai.assert.equal(1, updatedTargetedUser.recievedFriendRequests.length)
    })

    it('Should not send friend request to already friend', async () => {
      const req = await createReqWithCurrentAndTargetUser('test', 'test3friendsWithTest')
      const callback = mockCallback()

      await userController.sendFriendRequest(req, {}, callback)

      const updatedCurrentUser = await User.getById('test')
      const updatedTargetedUser = await User.getById('test3friendsWithTest')

      chai.assert.equal('BadRequestError', callback.getCall(0).args[0].name)
      chai.assert.equal(1, updatedCurrentUser.sentFriendRequests.length)
      chai.assert.equal(0, updatedTargetedUser.recievedFriendRequests.length)
    })

    it('Should not send friend request to itself', async () => {
      const currentUser = await User.getById('test')
      const targetedUser = currentUser

      const req = {
        currentUser: currentUser,
        targetedUser: targetedUser
      }
      const callback = mockCallback()

      await userController.sendFriendRequest(req, {}, callback)

      const updatedUser = await User.getById('test')

      chai.assert.equal('BadRequestError', callback.getCall(0).args[0].name)
      chai.assert.equal(1, updatedUser.sentFriendRequests.length)
      chai.assert.equal(0, updatedUser.recievedFriendRequests.length)
    })
  })

  describe('Testing accepting friend requests', () => {
    beforeEach(async () => {
      await resetTestDatabase()
    })

    it('Should successfully accept friend request', async () => {
      const req = await createReqWithCurrentAndTargetUser('test2friendRequestFromTest', 'test')
      const res = mockResponse()

      await userController.acceptFriendRequest(req, res, () => { })

      const updatedCurrentUser = await User.getById('test2friendRequestFromTest')
      const updatedTargetedUser = await User.getById('test')

      chai.assert.isTrue(res.status.calledWith(204), 'Expected response to send status 204')
      chai.assert.equal(updatedTargetedUser.userID, updatedCurrentUser.friends[0].userID)
      chai.assert.equal(updatedCurrentUser.userID, updatedTargetedUser.friends[1].userID)
      chai.assert.equal(0, updatedCurrentUser.recievedFriendRequests.length)
      chai.assert.equal(0, updatedTargetedUser.sentFriendRequests.length)
    })

    it('Should remove all friend requests when both users has sent friend request', async () => {
      const req = await createReqWithCurrentAndTargetUser('test4friendRequestToTest5', 'test5friendRequestToTest4')
      const res = mockResponse()

      await userController.acceptFriendRequest(req, res, () => { })

      const updatedCurrentUser = await User.getById('test4friendRequestToTest5')
      const updatedTargetedUser = await User.getById('test5friendRequestToTest4')

      chai.assert.isTrue(res.status.calledWith(204), 'Expected response to send status 204')
      chai.assert.equal(updatedTargetedUser.userID, updatedCurrentUser.friends[0].userID)
      chai.assert.equal(updatedCurrentUser.userID, updatedTargetedUser.friends[0].userID)
      chai.assert.equal(0, updatedCurrentUser.recievedFriendRequests.length)
      chai.assert.equal(0, updatedCurrentUser.sentFriendRequests.length)
      chai.assert.equal(0, updatedTargetedUser.recievedFriendRequests.length)
      chai.assert.equal(0, updatedTargetedUser.sentFriendRequests.length)
    })

    it('Should not accept friend request if no request has been sent', async () => {
      const req = await createReqWithCurrentAndTargetUser('test1NoFriends', 'test')
      const callback = mockCallback()

      await userController.acceptFriendRequest(req, {}, callback)

      const updatedCurrentUser = await User.getById('test1NoFriends')
      const updatedTargetedUser = await User.getById('test')

      chai.assert.equal('NotFoundError', callback.getCall(0).args[0].name)
      chai.assert.equal(0, updatedCurrentUser.friends.length)
      chai.assert.equal(1, updatedTargetedUser.friends.length)
      chai.assert.equal(0, updatedCurrentUser.recievedFriendRequests.length)
      chai.assert.equal(1, updatedTargetedUser.sentFriendRequests.length)
    })
  })

  describe('Testing declining friend requests', () => {
    beforeEach(async () => {
      await resetTestDatabase()
    })

    it('Should successfully decline friend request', async () => {
      const req = await createReqWithCurrentAndTargetUser('test2friendRequestFromTest', 'test')
      const res = mockResponse()

      await userController.declineFriendRequest(req, res, () => { })

      const updatedCurrentUser = await User.getById('test2friendRequestFromTest')
      const updatedTargetedUser = await User.getById('test')

      chai.assert.isTrue(res.status.calledWith(204), 'Expected response to send status 204')
      chai.assert.equal(0, updatedCurrentUser.recievedFriendRequests.length)
      chai.assert.equal(0, updatedTargetedUser.sentFriendRequests.length)
    })

    it('Should not decline friend request if no request has been sent', async () => {
      const req = await createReqWithCurrentAndTargetUser('test1NoFriends', 'test')
      const callback = mockCallback()

      await userController.acceptFriendRequest(req, {}, callback)

      const updatedCurrentUser = await User.getById('test1NoFriends')
      const updatedTargetedUser = await User.getById('test')

      chai.assert.equal('NotFoundError', callback.getCall(0).args[0].name)
      chai.assert.equal(0, updatedCurrentUser.recievedFriendRequests.length)
      chai.assert.equal(1, updatedTargetedUser.sentFriendRequests.length)
    })
  })

  describe('Testing removing friends', () => {
    beforeEach(async () => {
      await resetTestDatabase()
    })

    it('Should successfully remove friend', async () => {
      const req = await createReqWithCurrentAndTargetUser('test', 'test3friendsWithTest')
      const res = mockResponse()

      await userController.removeFriend(req, res, () => { })

      const updatedCurrentUser = await User.getById('test')
      const updatedTargetedUser = await User.getById('test3friendsWithTest')

      chai.assert.isTrue(res.status.calledWith(204), 'Expected response to send status 204')
      chai.assert.equal(0, updatedCurrentUser.friends.length)
      chai.assert.equal(0, updatedTargetedUser.friends.length)
    })

    it('Should not remove friend if the users are not friends', async () => {
      const req = await createReqWithCurrentAndTargetUser('test', 'test1NoFriends')
      const callback = mockCallback()

      await userController.removeFriend(req, {}, callback)

      const updatedCurrentUser = await User.getById('test')
      const updatedTargetedUser = await User.getById('test1NoFriends')

      chai.assert.equal('NotFoundError', callback.getCall(0).args[0].name)
      chai.assert.equal(1, updatedCurrentUser.friends.length)
      chai.assert.equal(0, updatedTargetedUser.friends.length)
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

/**
 * Creates a req object with the current user and target user on it,
 * retrieved from the test database.
 *
 * @param {string} currentUserID - The ID of the current user.
 * @param {string} targetUserID - The ID of the targeted user.
 * @returns {object} - The mocked req object.
 */
const createReqWithCurrentAndTargetUser = async (currentUserID, targetUserID) => {
  const currentUser = await User.getById(currentUserID)
  const targetedUser = await User.getById(targetUserID)

  return {
    currentUser: currentUser,
    targetedUser: targetedUser
  }
}

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
