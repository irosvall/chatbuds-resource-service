/**
 * Module for test utility methods.
 *
 * @author Ida Rosvall <ir222gn@student.lnu.se>
 */

import sinon from 'sinon'
import { User } from '../src/models/user.js'

/**
 * Encapsulates the test utility methods.
 */
export class TestUtils {
  /**
   * Creates a req object with the current user and target user on it,
   * retrieved from the test database.
   *
   * @param {string} currentUserID - The ID of the current user.
   * @param {string} targetUserID - The ID of the targeted user.
   * @returns {object} - The mocked req object.
   */
  async createReqWithCurrentAndTargetUser (currentUserID, targetUserID) {
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
  mockResponse () {
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
  mockCallback () {
    return sinon.spy()
  }
}
