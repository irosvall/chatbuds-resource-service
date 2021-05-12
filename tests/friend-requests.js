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

describe('Testing friend requests', () => {
  before(async () => {
    // Connect to the test database.
    await mongoose.connect(process.env.DB_CONNECTION_STRING_TEST, {
      useCreateIndex: true,
      useNewUrlParser: true,
      useUnifiedTopology: true
    })
  })

  beforeEach(async () => {
    // Inserts the premade users into the database.
    await User.deleteMany()
    await User.insertMany(mockdata.users)
  })

  after(async () => {
    await mongoose.connection.close()
  })

  it('Should send successful friend request', async () => {
    const currentUser = await User.getById('60911823912a5649b4c05g2b')
    const targetedUser = await User.getById('60911823912a5649b4c05b72')

    const req = {
      currentUser: currentUser,
      targetedUser: targetedUser
    }
    const res = mockResponse()

    await userController.sendFriendRequest(req, res, () => { })
    chai.assert(res.status.calledWith(204))
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
