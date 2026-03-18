import mongoose, { InferSchemaType, Model } from 'mongoose';

const nearbyPlaceSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      required: true,
      trim: true,
    },
    distanceKm: {
      type: Number,
      required: true,
      min: 0,
    },
    walkMinutes: {
      type: Number,
      required: true,
      min: 0,
    },
    highlight: {
      type: String,
      default: '',
      trim: true,
    },
  },
  {
    _id: true,
  },
);

const roomSchema = new mongoose.Schema(
  {
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    ownerName: {
      type: String,
      required: true,
      trim: true,
    },
    title: { type: String, required: true, trim: true },
    city: { type: String, required: true, trim: true },
    locality: { type: String, required: true, trim: true },
    address: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0 },
    deposit: { type: Number, required: true, min: 0 },
    rating: { type: Number, required: true, min: 0, max: 5 },
    reviewCount: { type: Number, required: true, min: 0, default: 0 },
    occupancy: {
      type: String,
      enum: ['Single', 'Double', 'Shared'],
      required: true,
    },
    roomType: {
      type: String,
      enum: ['Private Room', 'Studio', 'PG', 'Coliving'],
      required: true,
    },
    gender: {
      type: String,
      enum: ['Any', 'Boys', 'Girls'],
      required: true,
    },
    availableFrom: { type: String, required: true },
    seatsLeft: { type: Number, required: true, min: 0 },
    description: { type: String, required: true, trim: true },
    heroTag: { type: String, required: true, trim: true },
    image: { type: String, required: true, trim: true },
    amenities: [{ type: String }],
    rules: [{ type: String }],
    transit: [{ type: String }],
    nearbyPlaces: [nearbyPlaceSchema],
    featured: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  },
);

export type RoomDocument = InferSchemaType<typeof roomSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const RoomModel = (mongoose.models.Room as Model<RoomDocument>) || mongoose.model('Room', roomSchema);
