const { Schema, model } = require('mongoose');
// const Populate = require('../util/autopopulate');

const eventSchema = new Schema({
    title:       { type: String, required: true },
    description: { type: String, required: true },
    startTime:   { type: Date, required: true },
    endTime:     { type: Date, required: true },
    location:    { type: String, required: true },
    attending:   [{ type: Schema.Types.ObjectId, ref: 'User' }],
	favorited :  [{ type: Schema.Types.ObjectId, ref: 'User' }],
	photoUrl :   { type: String, required: true },
    createdBy:   { type: Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

// // Always populate the author field
// postSchema
// 	.pre('findOne', Populate('author'))
// 	.pre('find', Populate('author'));

module.exports = model('Event', eventSchema);