import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
  username: string;
  email: string;
  password: string;
  playlists: mongoose.Types.ObjectId[];
}

const UserSchema: Schema = new Schema({
  username: { 
    type: String, 
    required: true, 
    unique: true,
    trim: true,
    minlength: 3 
  },
  email: { 
    type: String, 
    required: true, 
    unique: true,
    lowercase: true,
    trim: true 
  },
  password: { 
    type: String, 
    required: true,
    minlength: 6 
  },
  playlists: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Playlist' 
  }]
}, {
  timestamps: true
});

const User = mongoose.model<IUser>('User', UserSchema);

export default User;
