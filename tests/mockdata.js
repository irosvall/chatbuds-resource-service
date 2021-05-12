import mongoose from 'mongoose'

const testId = mongoose.Types.ObjectId()

export const mockdata = {
  users: [
    {
      _id: testId,
      username: 'test',
      userID: 'testNoFriends',
      email: 'test@test.test',
      friends: [],
      sentFriendRequests: [],
      recievedFriendRequests: []
    },
    {
      username: 'test1',
      userID: 'test1NoFriends',
      email: 'test1@test.test',
      friends: [],
      sentFriendRequests: [],
      recievedFriendRequests: []
    },
    {
      username: 'test2',
      userID: 'test2friendRequestFromTest',
      email: 'test2@test.test',
      friends: [],
      sentFriendRequests: [],
      recievedFriendRequests: [{
        _id: testId
      }]
    }
  ]
}
