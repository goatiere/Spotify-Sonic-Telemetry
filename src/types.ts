export interface AllTimeSong {
  alltime_rank: number;
  song_title: string;
  artist: string;
  total_streams_billions: number;
  primary_genre: string;
  bpm: number;
  release_year: number;
  artist_country: string;
  explicit: boolean;
  danceability: number;
  energy: number;
  valence: number;
  acousticness: number;
}

export interface Artist2025 {
  wrapped_2025_rank: number;
  artist_name: string;
  monthly_listeners_millions_mar2026: number;
  primary_genre: string;
  country: string;
  followers_millions: number;
  grammy_wins: number;
  debut_year: number;
  gender: string;
  top_2025_song: string;
}

export interface Song2025 {
  wrapped_2025_rank: number;
  song_title: string;
  artist: string;
  streams_2025_billions: number;
  primary_genre: string;
  bpm: number;
  duration_seconds: number;
  release_year: number;
  artist_country: string;
  explicit: boolean;
  danceability: number;
  energy: number;
  valence: number;
  acousticness: number;
  peak_global_chart_position: number;
}
