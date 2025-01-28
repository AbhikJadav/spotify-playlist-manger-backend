import mongoose, { Document, Schema } from 'mongoose';

export interface ISong {
  spotifyId: string;
  title: string;
  artist: string;
  album: string;
  duration: number;
  previewUrl?: string;
}

export interface IPlaylist extends Document {
  name: string;
  description?: string;
  user: mongoose.Types.ObjectId;
  songs: ISong[];
  isPublic: boolean;
}

const SongSchema: Schema = new Schema({
  spotifyId: { 
    type: String, 
    required: true 
  },
  title: { 
    type: String, 
    required: true 
  },
  artist: { 
    type: String, 
    required: true 
  },
  album: { 
    type: String, 
    required: true 
  },
  duration: { 
    type: Number, 
    required: true 
  },
  previewUrl: { 
    type: String 
  }
});

const PlaylistSchema: Schema = new Schema({
  name: { 
    type: String, 
    required: true,
    trim: true 
  },
  description: { 
    type: String, 
    trim: true 
  },
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  songs: [SongSchema],
  isPublic: { 
    type: Boolean, 
    default: false 
  }
}, {
  timestamps: true
});

const Playlist = mongoose.model<IPlaylist>('Playlist', PlaylistSchema);

export default Playlist;
