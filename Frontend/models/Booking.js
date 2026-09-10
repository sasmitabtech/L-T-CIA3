const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  guestId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  hotelId: { type: mongoose.Schema.Types.ObjectId, ref: 'Hotel', required: true },
  roomTypeId: { type: mongoose.Schema.Types.ObjectId, ref: 'RoomType', required: true },
  roomId: { type: mongoose.Schema.Types.ObjectId, ref: 'Room' },
  checkIn: { type: Date, required: true },
  checkOut: { type: Date, required: true },
  status: {
    type: String,
    enum: ['Reserved', 'Confirmed', 'Checked-in', 'Checked-out', 'Cancelled'],
    default: 'Reserved',
  },
  totalAmount: { type: Number, required: true, min: 0 },
  actualCheckIn: Date,
  actualCheckOut: Date,
  cancellationFee: { type: Number, min: 0, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('Booking', bookingSchema);
