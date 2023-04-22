import mongoose from 'mongoose'

const userSchema = new mongoose.Schema({
  uuid: {
    type: String,
    required: true,
    unique: true,
  },
  username: {
    type: String,
    required: false,
    unique: true,
  },
  password: {
    type: String,
    required: false,
  },
  lists: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'List',
    },
  ],
  sharedLists: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'List',
    },
  ],
  shortcuts: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Shortcut',
    },
  ],
})

const User = mongoose.model('User', userSchema)

export default User
