import mongoose from 'mongoose'

const testId = mongoose.Types.ObjectId()
const test3Id = mongoose.Types.ObjectId()

export const mockdata = {
  users: [
    {
      _id: testId,
      username: 'test',
      userID: 'test',
      email: 'test@test.test',
      friends: [{
        _id: test3Id
      }],
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
    },
    {
      _id: test3Id,
      username: 'test3',
      userID: 'test3friendsWithTest',
      email: 'test3@test.test',
      friends: [{
        _id: testId
      }],
      sentFriendRequests: [],
      recievedFriendRequests: []
    }
  ]
}
