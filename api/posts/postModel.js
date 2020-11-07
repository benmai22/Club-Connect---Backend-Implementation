const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const PostSchema = new Schema(
    {
        title: { type: String, required: true },
        name:  { type: String, required: true },
        date:  { type: Date },
        description: { type: String },
        image: { type: String },
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'user' },
        date_created: {type: Date, default: Date.now},

    });
module.exports = User = mongoose.model('post', PostSchema);