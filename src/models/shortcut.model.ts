import mongoose, { Schema } from 'mongoose'

const shortcutSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  url: {
    type: String,
    required: true,
  },
  icon: String,
  order: {
    type: Number,
    required: true,
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  },
  list: {
    type: Schema.Types.ObjectId,
    ref: 'List',
  },
  parent: {
    type: Schema.Types.ObjectId,
    ref: 'Shortcut',
    required: false,
  },
})

const Shortcut = mongoose.model('Shortcut', shortcutSchema)
export default Shortcut
