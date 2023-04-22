import mongoose from 'mongoose'

const listSchema = new mongoose.Schema({
  title: {
    type: String,
    required: false,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  sharedWithUsers: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  ],
  shortcuts: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Shortcut',
    },
  ],
})

const List = mongoose.model('List', listSchema)

export default List
