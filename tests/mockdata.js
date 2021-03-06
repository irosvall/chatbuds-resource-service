import mongoose from 'mongoose'

const testId = mongoose.Types.ObjectId()
const test2Id = mongoose.Types.ObjectId()
const test3Id = mongoose.Types.ObjectId()
const test4Id = mongoose.Types.ObjectId()
const test5Id = mongoose.Types.ObjectId()

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
      sentFriendRequests: [{
        _id: test2Id
      }],
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
      _id: test2Id,
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
    },
    {
      _id: test4Id,
      username: 'test4',
      userID: 'test4friendRequestToTest5',
      email: 'test4@test.test',
      friends: [],
      sentFriendRequests: [{
        _id: test5Id
      }],
      recievedFriendRequests: [{
        _id: test5Id
      }]
    },
    {
      _id: test5Id,
      username: 'test5',
      userID: 'test5friendRequestToTest4',
      email: 'test5@test.test',
      friends: [],
      sentFriendRequests: [{
        _id: test4Id
      }],
      recievedFriendRequests: [{
        _id: test4Id
      }]
    }
  ]
}
