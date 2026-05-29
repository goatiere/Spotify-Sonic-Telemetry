import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  allTimeSongsData,
  top2025ArtistsData,
  top2025SongsData,
} from "./data";
import { AllTimeSong, Artist2025, Song2025 } from "./types";
import {
  Music,
  Database,
  Search,
  Sparkles,
  TrendingUp,
  Award,
  Globe,
  Sliders,
  CheckCircle2,
  ListFilter,
  Info,
  ArrowUpDown,
  BookOpen,
  Filter,
  Volume2,
  Smile,
  Zap,
  Flame,
  User,
  Disc,
  ArrowRight,
} from "lucide-react";
import {
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  ZAxis,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  CartesianGrid,
} from "recharts";

export default function App() {
  // Active primary tab
  const [activeTab, setActiveTab] = useState<"analysis" | "alltime" | "artists" | "songs25">("analysis");

  // Search query & filters
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGenre, setSelectedGenre] = useState("All");
  const [selectedCountry, setSelectedCountry] = useState("All");
  const [explicitFilter, setExplicitFilter] = useState<"All" | "Yes" | "No">("All");

  // Interactive sorting
  const [sortKey, setSortKey] = useState<string>("");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  // Interactive custom chart fields
  const [chartXAttr, setChartXAttr] = useState<"danceability" | "energy" | "valence" | "bpm">("danceability");
  const [chartYAttr, setChartYAttr] = useState<"energy" | "danceability" | "valence" | "bpm">("energy");

  // State for tracking hovered particle in the Data Art plot
  const [hoveredParticle, setHoveredParticle] = useState<any | null>(null);

  // Custom particle shape renderer for Recharts with high resolution glowing canvas effects
  const renderGlowParticle = (props: any) => {
    const { cx, cy, payload } = props;
    if (cx === undefined || cy === undefined || !payload) return null;
    
    // Dynamic particle radius by stream volumes (billions)
    const streamsValue = parseFloat(payload.streams) || 1.0;
    const sizeRadius = Math.max(5, Math.min(20, 5 + (streamsValue * 3)));
    
    // Core valence color spectrum
    const val = payload.valence !== undefined ? payload.valence : 0.5;
    let particleColor = "";
    let glowColor = "";
    if (val < 0.3) {
      particleColor = "#00dfff"; // cold neon cyan
      glowColor = "rgba(0, 223, 255, 0.7)";
    } else if (val < 0.5) {
      particleColor = "#3b82f6"; // neon blue
      glowColor = "rgba(59, 130, 246, 0.6)";
    } else if (val < 0.7) {
      particleColor = "#10b981"; // calm emerald
      glowColor = "rgba(16, 185, 129, 0.6)";
    } else if (val < 0.85) {
      particleColor = "#00ff00"; // hot neon green
      glowColor = "rgba(0, 255, 0, 0.8)";
    } else {
      particleColor = "#ffff00"; // extreme neon yellow
      glowColor = "rgba(255, 255, 0, 0.9)";
    }
    
    const isHovered = hoveredParticle && 
      hoveredParticle.name === payload.name && 
      hoveredParticle.artist === payload.artist;

    return (
      <g key={`${payload.name}-${payload.artist}`}>
        {/* Outer glowing halo ring */}
        <circle
          cx={cx}
          cy={cy}
          r={sizeRadius + (isHovered ? 12 : 6)}
          fill="none"
          stroke={particleColor}
          strokeWidth={isHovered ? 2.5 : 1}
          opacity={isHovered ? 0.95 : 0.25}
          style={{ transition: "all 0.2s ease-out", filter: `drop-shadow(0px 0px 8px ${glowColor})` }}
        />
        {/* Middle pulsing softer glow */}
        <circle
          cx={cx}
          cy={cy}
          r={sizeRadius + (isHovered ? 6 : 3)}
          fill={particleColor}
          opacity={isHovered ? 0.5 : 0.15}
          style={{ transition: "all 0.2s ease-out" }}
        />
        {/* Main solid particle core */}
        <circle
          cx={cx}
          cy={cy}
          r={sizeRadius}
          fill={particleColor}
          stroke="#ffffff"
          strokeWidth={isHovered ? 2 : 0.75}
          opacity={isHovered ? 1 : 0.85}
          style={{ transition: "all 0.2s ease-out", filter: `drop-shadow(0px 0px 4px ${glowColor})`, cursor: "pointer" }}
        />
      </g>
    );
  };

  // 1. All unique genres for filtering
  const allGenres = useMemo(() => {
    const genres = new Set<string>();
    allTimeSongsData.forEach((s) => genres.add(s.primary_genre));
    top2025ArtistsData.forEach((a) => genres.add(a.primary_genre));
    top2025SongsData.forEach((s) => genres.add(s.primary_genre));
    return ["All", ...Array.from(genres).sort()];
  }, []);

  // 2. All unique countries for filtering
  const allCountries = useMemo(() => {
    const countries = new Set<string>();
    allTimeSongsData.forEach((s) => countries.add(s.artist_country));
    top2025ArtistsData.forEach((a) => countries.add(a.country));
    top2025SongsData.forEach((s) => countries.add(s.artist_country));
    return ["All", ...Array.from(countries).sort()];
  }, []);

  // Filtered lists
  const filteredAllTime = useMemo(() => {
    let result = [...allTimeSongsData];
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (s) =>
          s.song_title.toLowerCase().includes(q) ||
          s.artist.toLowerCase().includes(q)
      );
    }
    if (selectedGenre !== "All") {
      result = result.filter((s) => s.primary_genre === selectedGenre);
    }
    if (selectedCountry !== "All") {
      result = result.filter((s) => s.artist_country === selectedCountry);
    }
    if (explicitFilter !== "All") {
      const matchesExplicit = explicitFilter === "Yes";
      result = result.filter((s) => s.explicit === matchesExplicit);
    }
    if (sortKey) {
      result.sort((a: any, b: any) => {
        const valA = a[sortKey];
        const valB = b[sortKey];
        if (typeof valA === "string") {
          return sortDirection === "asc"
            ? valA.localeCompare(valB)
            : valB.localeCompare(valA);
        }
        return sortDirection === "asc" ? valA - valB : valB - valA;
      });
    }
    return result;
  }, [searchQuery, selectedGenre, selectedCountry, explicitFilter, sortKey, sortDirection]);

  const filteredArtists = useMemo(() => {
    let result = [...top2025ArtistsData];
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (a) =>
          a.artist_name.toLowerCase().includes(q) ||
          a.top_2025_song.toLowerCase().includes(q)
      );
    }
    if (selectedGenre !== "All") {
      result = result.filter((a) => a.primary_genre === selectedGenre);
    }
    if (selectedCountry !== "All") {
      result = result.filter((a) => a.country === selectedCountry);
    }
    if (sortKey && sortKey in (result[0] || {})) {
      result.sort((a: any, b: any) => {
        const valA = a[sortKey];
        const valB = b[sortKey];
        if (typeof valA === "string") {
          return sortDirection === "asc"
            ? valA.localeCompare(valB)
            : valB.localeCompare(valA);
        }
        return sortDirection === "asc" ? valA - valB : valB - valA;
      });
    }
    return result;
  }, [searchQuery, selectedGenre, selectedCountry, sortKey, sortDirection]);

  const filteredSongs25 = useMemo(() => {
    let result = [...top2025SongsData];
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (s) =>
          s.song_title.toLowerCase().includes(q) ||
          s.artist.toLowerCase().includes(q)
      );
    }
    if (selectedGenre !== "All") {
      result = result.filter((s) => s.primary_genre === selectedGenre);
    }
    if (selectedCountry !== "All") {
      result = result.filter((s) => s.artist_country === selectedCountry);
    }
    if (explicitFilter !== "All") {
      const matchesExplicit = explicitFilter === "Yes";
      result = result.filter((s) => s.explicit === matchesExplicit);
    }
    if (sortKey && sortKey in (result[0] || {})) {
      result.sort((a: any, b: any) => {
        const valA = a[sortKey];
        const valB = b[sortKey];
        if (typeof valA === "string") {
          return sortDirection === "asc"
            ? valA.localeCompare(valB)
            : valB.localeCompare(valA);
        }
        return sortDirection === "asc" ? valA - valB : valB - valA;
      });
    }
    return result;
  }, [searchQuery, selectedGenre, selectedCountry, explicitFilter, sortKey, sortDirection]);

  // Handle Sort trigger
  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDirection("desc");
    }
  };

  // Pre-cached descriptive details for question 4's top 3 custom features
  const audioFeatureDescriptions = {
    danceability: {
      title: "Danceability",
      icon: <Volume2 className="w-5 h-5 text-spotify-green" />,
      text: "Scale: 0.0 - 1.0. Describes how suitable a track is for dancing based on tempo, rhythm stability, beat strength, and overall regularity.",
      color: "from-emerald-500 to-teal-400"
    },
    energy: {
      title: "Energy",
      icon: <Zap className="w-5 h-5 text-yellow-400" />,
      text: "Scale: 0.0 - 1.0. Represents a perceptual measure of intensity and activity. Typically, fast-paced electronic or metal tracks score higher, while classical piano scores lower.",
      color: "from-yellow-500 to-orange-400"
    },
    valence: {
      title: "Valence",
      icon: <Smile className="w-5 h-5 text-pink-400" />,
      text: "Scale: 0.0 - 1.0. Measures the musical positiveness conveyed. High valence songs sound happy and joyful, while low valence songs feel melancholic or dark.",
      color: "from-pink-500 to-purple-400"
    }
  };

  // Combined scatter chart points for visualizing All-time + 2025 songs together
  const scatterChartData = useMemo(() => {
    const points: any[] = [];
    allTimeSongsData.forEach((s) => {
      points.push({
        name: s.song_title,
        artist: s.artist,
        x: s[chartXAttr],
        y: s[chartYAttr],
        z: Math.round((s.valence || 0.5) * 100),
        valence: s.valence || 0.5,
        streams: s.total_streams_billions,
        type: "All-Time",
        color: "#1db954"
      });
    });
    top2025SongsData.forEach((s) => {
      points.push({
        name: s.song_title,
        artist: s.artist,
        x: s[chartXAttr],
        y: s[chartYAttr],
        z: Math.round((s.valence || 0.5) * 100),
        valence: s.valence || 0.5,
        streams: s.streams_2025_billions,
        type: "2025 Wrapped",
        color: "#38bdf8"
      });
    });
    return points;
  }, [chartXAttr, chartYAttr]);

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white flex flex-col antialiased">
      {/* Spotify Brutalist Bold Header */}
      <header className="border-b border-white/20 bg-[#0A0A0A] px-6 py-8 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-baseline justify-between gap-6">
          <div className="flex flex-col gap-1">
            <span className="text-spotify-green font-mono text-xs tracking-[0.2em] uppercase">Dataset Analysis / active_session_2026</span>
            <h1 className="text-2xl md:text-4xl lg:text-5xl font-black tracking-tighter leading-none uppercase">
              Spotify Sonic Telemetry: A Data Art Exploration.
            </h1>
          </div>

          {/* Quick Stats Summary Grid - Large typewriter numbers */}
          <div className="flex gap-8 md:gap-12 text-left md:text-right font-mono self-end">
            <div>
              <p className="text-[10px] uppercase text-white/55 tracking-widest">TOTAL RECORDS</p>
              <p className="text-3xl md:text-4xl font-extrabold text-white">200</p>
            </div>
            <div>
              <p className="text-[10px] uppercase text-white/55 tracking-widest">TRACKS</p>
              <p className="text-3xl md:text-4xl font-extrabold text-spotify-green">150</p>
            </div>
            <div>
              <p className="text-[10px] uppercase text-white/55 tracking-widest">ARTISTS</p>
              <p className="text-3xl md:text-4xl font-extrabold text-white">50</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Navigation Tabs */}
      <div className="border-b border-white/10 bg-[#0A0A0A] py-4 px-6">
        <div className="max-w-7xl mx-auto flex flex-wrap gap-3">
          <button
            onClick={() => {
              setActiveTab("analysis");
              setSortKey("");
            }}
            className={`flex items-center gap-2 px-5 py-3 text-xs tracking-widest font-black uppercase rounded-none transition-all cursor-pointer border ${
              activeTab === "analysis"
                ? "bg-spotify-green text-black border-spotify-green shadow-[4px_4px_0px_0px_rgba(255,255,255,0.15)]"
                : "text-white/60 border-white/10 hover:border-white/30 hover:text-white"
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            01 / ANALYSIS REPORT
          </button>
          <button
            onClick={() => {
              setActiveTab("alltime");
              setSortKey("alltime_rank");
              setSortDirection("asc");
            }}
            className={`flex items-center gap-2 px-5 py-3 text-xs tracking-widest font-black uppercase rounded-none transition-all cursor-pointer border ${
              activeTab === "alltime"
                ? "bg-spotify-green text-black border-spotify-green shadow-[4px_4px_0px_0px_rgba(255,255,255,0.15)]"
                : "text-white/60 border-white/10 hover:border-white/30 hover:text-white"
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            02 / ALL-TIME TOP 100
          </button>
          <button
            onClick={() => {
              setActiveTab("artists");
              setSortKey("wrapped_2025_rank");
              setSortDirection("asc");
            }}
            className={`flex items-center gap-2 px-5 py-3 text-xs tracking-widest font-black uppercase rounded-none transition-all cursor-pointer border ${
              activeTab === "artists"
                ? "bg-spotify-green text-black border-spotify-green shadow-[4px_4px_0px_0px_rgba(255,255,255,0.15)]"
                : "text-white/60 border-white/10 hover:border-white/30 hover:text-white"
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            03 / 2025 TOP ARTISTS
          </button>
          <button
            onClick={() => {
              setActiveTab("songs25");
              setSortKey("wrapped_2025_rank");
              setSortDirection("asc");
            }}
            className={`flex items-center gap-2 px-5 py-3 text-xs tracking-widest font-black uppercase rounded-none transition-all cursor-pointer border ${
              activeTab === "songs25"
                ? "bg-spotify-green text-black border-spotify-green shadow-[4px_4px_0px_0px_rgba(255,255,255,0.15)]"
                : "text-white/60 border-white/10 hover:border-white/30 hover:text-white"
            }`}
          >
            <Flame className="w-3.5 h-3.5" />
            04 / 2025 TOP SONGS
          </button>
        </div>
      </div>

      {/* Global Filter Toolbar */}
      {activeTab !== "analysis" && (
        <div className="bg-[#0A0A0A] border-b border-white/20 py-5 px-6">
          <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50 w-4 h-4" />
              <input
                type="text"
                placeholder="SEARCH: Track title or artist..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-black border border-white/20 pl-9 pr-4 py-2 text-xs font-mono uppercase text-white placeholder-white/40 focus:outline-none focus:border-spotify-green transition-colors rounded-none"
              />
            </div>

            {/* Genre Select */}
            <div className="flex items-center gap-2">
              <ListFilter className="text-spotify-green w-4 h-4 shrink-0" />
              <select
                value={selectedGenre}
                onChange={(e) => setSelectedGenre(e.target.value)}
                className="w-full bg-black border border-white/20 px-3 py-2 text-xs font-mono uppercase text-white focus:outline-none focus:border-spotify-green rounded-none"
              >
                <option value="All">ALL GENRES ({allGenres.length - 1})</option>
                {allGenres.filter(g => g !== "All").map((g) => (
                  <option key={g} value={g}>
                    {g.toUpperCase()}
                  </option>
                ))}
              </select>
            </div>

            {/* Country Select */}
            <div className="flex items-center gap-2">
              <Globe className="text-spotify-green w-4 h-4 shrink-0" />
              <select
                value={selectedCountry}
                onChange={(e) => setSelectedCountry(e.target.value)}
                className="w-full bg-black border border-white/20 px-3 py-2 text-xs font-mono uppercase text-white focus:outline-none focus:border-spotify-green rounded-none"
              >
                <option value="All">ALL COUNTRIES ({allCountries.length - 1})</option>
                {allCountries.filter(c => c !== "All").map((c) => (
                  <option key={c} value={c}>
                    {c.toUpperCase()}
                  </option>
                ))}
              </select>
            </div>

            {/* Explicit Filter (Not visible on Artists tab) */}
            <div className="flex items-center gap-2">
              <Filter className="text-spotify-green w-4 h-4 shrink-0" />
              <select
                value={explicitFilter}
                onChange={(e) => setExplicitFilter(e.target.value as any)}
                disabled={activeTab === "artists"}
                className="w-full bg-black border border-white/20 px-3 py-2 text-xs font-mono uppercase text-white focus:outline-none focus:border-spotify-green disabled:opacity-30 disabled:cursor-not-allowed rounded-none"
              >
                <option value="All">CONTENT RATING (ALL)</option>
                <option value="No">CLEAN CONTENT ONLY</option>
                <option value="Yes">EXPLICIT CONTENT ONLY</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Body */}
      <main className="flex-1 w-full max-w-7xl mx-auto p-4 md:p-6">
        <AnimatePresence mode="wait">
          {activeTab === "analysis" && (
            <motion.div
              key="analysis-panel"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
              className="space-y-8"
            >
              {/* Top Banner introducing the workspace analysis */}
              <div className="relative overflow-hidden border-2 border-spotify-green bg-black p-8 rounded-none shadow-none">
                <div className="absolute right-0 top-0 w-32 h-32 bg-spotify-green/5 pointer-events-none" />
                
                <div className="max-w-4xl space-y-4">
                  <div className="inline-flex items-center gap-2 bg-spotify-green text-black text-xs font-mono font-black px-3 py-1 rounded-none border border-spotify-green">
                    <Sparkles className="w-3.5 h-3.5" /> REAL DATA ANALYSIS REPORT / ACTIVE
                  </div>
                  <h2 className="text-3xl md:text-5xl font-black text-white tracking-tighter uppercase leading-none">
                    Welcome to the Spotify Dataset Explorer!
                  </h2>
                  <p className="text-sm md:text-base text-white/80 leading-relaxed font-sans max-w-3xl">
                    Below is the definitive and precise analysis answering every question for the provided dataset. You can use the tabs above to filter, search, sort, and deeply explore all data subdivisions.
                  </p>
                </div>
              </div>

              {/* Answers Grid: Q1, Q2 & Q4 */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                
                {/* Q1: Sütun İsimleri (Headers List) */}
                <div className="bg-black border border-white/20 rounded-none p-6 relative flex flex-col justify-between">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 pb-3 border-b border-white/20">
                      <div className="p-2 bg-white text-black font-black font-mono text-xs rounded-none">
                        01
                      </div>
                      <div>
                        <span className="text-xs font-bold text-spotify-green uppercase tracking-[0.2em] font-mono">QUESTION 1</span>
                        <h3 className="text-xl font-black text-white uppercase tracking-tight">All Dataset Column Names (Headers)</h3>
                      </div>
                    </div>
                    
                    <p className="text-xs uppercase text-white/60 tracking-wider font-mono">
                      Your dataset contains three rich subsets with zesty structural schemas mapping musical parameters:
                    </p>

                    <div className="space-y-4 max-h-[350px] overflow-y-auto pr-1">
                      {/* Section 1 Headers */}
                      <div className="bg-black/40 rounded-none p-4 border border-white/10">
                        <h4 className="text-xs font-bold text-spotify-green uppercase tracking-[0.1em] mb-2 flex items-center gap-2 font-mono">
                          <span className="w-2 h-2 bg-spotify-green" />
                          1. All-Time Most Streamed Tracks (14 Columns)
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {["alltime_rank", "song_title", "artist", "total_streams_billions", "primary_genre", "bpm", "release_year", "artist_country", "explicit", "danceability", "energy", "valence", "acousticness", "dataset_part"].map(h => (
                            <span key={h} className="text-[10px] font-mono bg-[#111] px-2.5 py-1 border border-white/10 text-white/80 hover:border-spotify-green hover:text-white transition-colors uppercase">
                              {h}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Section 2 Headers */}
                      <div className="bg-black/40 rounded-none p-4 border border-white/10">
                        <h4 className="text-xs font-bold text-white uppercase tracking-[0.1em] mb-2 flex items-center gap-2 font-mono">
                          <span className="w-2 h-2 bg-white" />
                          2. 2025 Top 50 Artists Subdivision (11 Columns)
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {["wrapped_2025_rank", "artist_name", "monthly_listeners_millions_mar2026", "primary_genre", "country", "followers_millions", "grammy_wins", "debut_year", "gender", "top_2025_song", "dataset_part"].map(h => (
                            <span key={h} className="text-[10px] font-mono bg-[#111] px-2.5 py-1 border border-white/10 text-white/80 hover:border-white hover:text-white transition-colors uppercase">
                              {h}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Section 3 Headers */}
                      <div className="bg-black/40 rounded-none p-4 border border-white/10">
                        <h4 className="text-xs font-bold text-spotify-green uppercase tracking-[0.1em] mb-2 flex items-center gap-2 font-mono">
                          <span className="w-2 h-2 bg-spotify-green" />
                          3. 2025 Global Top 50 Tracks Subdivision (16 Columns)
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {["wrapped_2025_rank", "song_title", "artist", "streams_2025_billions", "primary_genre", "bpm", "duration_seconds", "release_year", "artist_country", "explicit", "danceability", "energy", "valence", "acousticness", "peak_global_chart_position", "dataset_part"].map(h => (
                            <span key={h} className="text-[10px] font-mono bg-[#111] px-2.5 py-1 border border-white/10 text-white/80 hover:border-spotify-green hover:text-white transition-colors uppercase">
                              {h}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between text-xs font-mono text-white/60 uppercase">
                    <span>Total Unique Attributes Identified:</span>
                    <span className="font-bold text-black font-mono bg-white px-3 py-1 border border-white rounded-none">26 UNIQUE COLUMNS</span>
                  </div>
                </div>

                {/* Q2: Kaç Şarkı ve Kaç Özellik Var? */}
                <div className="bg-black border border-white/20 rounded-none p-6 flex flex-col justify-between">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 pb-3 border-b border-white/20">
                      <div className="p-2 bg-spotify-green text-black font-black font-mono text-xs rounded-none">
                        02
                      </div>
                      <div>
                        <span className="text-xs font-bold text-spotify-green uppercase tracking-[0.2em] font-mono">QUESTION 2</span>
                        <h3 className="text-xl font-black text-white uppercase tracking-tight">Volume Stats and Attribute Distributions</h3>
                      </div>
                    </div>

                    <p className="text-xs uppercase text-white/60 tracking-wider font-mono">
                      Divided into distinct metadata classifications, the element weights are explicitly mapped as follows:
                    </p>

                    {/* Brutalist card structure: Solid white, Solid Green, Outline */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="bg-white text-black p-5 rounded-none flex flex-col justify-between border border-white min-h-[140px]">
                        <div>
                          <span className="text-[10px] font-mono text-black/60 block uppercase font-bold">01 / TRACKS</span>
                          <span className="text-2xl font-black uppercase leading-none mt-2 block">100 Tracks</span>
                        </div>
                        <div className="mt-4 border-t border-black/20 pt-3 flex justify-between items-center text-[11px] font-mono font-bold">
                          <span>ALL-TIME</span>
                          <div className="w-8 h-1 bg-black"></div>
                        </div>
                      </div>
                      
                      <div className="bg-[#00FF00] text-black p-5 rounded-none flex flex-col justify-between border border-[#00FF00] min-h-[140px]">
                        <div>
                          <span className="text-[10px] font-mono text-black/60 block uppercase font-bold">02 / ARTISTS</span>
                          <span className="text-2xl font-black uppercase leading-none mt-2 block">50 Artists</span>
                        </div>
                        <div className="mt-4 border-t border-black/20 pt-3 flex justify-between items-center text-[11px] font-mono font-bold">
                          <span>ARTISTS</span>
                          <div className="w-8 h-1 bg-black"></div>
                        </div>
                      </div>

                      <div className="outline outline-1 outline-white/30 p-5 rounded-none flex flex-col justify-between min-h-[140px]">
                        <div>
                          <span className="text-[10px] font-mono text-white/50 block uppercase font-bold">03 / TRACKS</span>
                          <span className="text-2xl font-black text-white uppercase leading-none mt-2 block">50 Tracks</span>
                        </div>
                        <div className="mt-4 border-t border-white/20 pt-3 flex justify-between items-center text-[11px] font-mono font-bold text-white/70">
                          <span>2025 TOP</span>
                          <div className="w-8 h-1 bg-[#00FF00]"></div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-black p-4 rounded-none border border-white/20 space-y-2">
                      <h4 className="text-xs font-bold text-white uppercase tracking-widest font-mono">KEY DATA ANALYSIS INSIGHTS:</h4>
                      <ul className="text-xs text-white/80 space-y-2 font-mono uppercase pl-1">
                        <li className="flex items-start gap-1.5">
                          <span className="text-spotify-green font-bold">//</span>
                          <span><strong>Total Unique Tracks:</strong> There are <span className="text-spotify-green font-bold">150 tracks</span> in total across 2 categories (100 All-Time classics + 50 Top 2025 Global songs).</span>
                        </li>
                        <li className="flex items-start gap-1.5">
                          <span className="text-spotify-green font-bold">//</span>
                          <span><strong>Total Records Count:</strong> Combined with artists, your dataset has exactly <span className="text-white font-bold">200 rows (records)</span>.</span>
                        </li>
                        <li className="flex items-start gap-1.5">
                          <span className="text-[#00FF00] font-bold">//</span>
                          <span><strong>Feature Diversity:</strong> A total of <span className="text-[#00FF00] font-bold">26 custom attributes</span> map dimensions of genres, tempos, stream volumes, and audio metrics.</span>
                        </li>
                      </ul>
                    </div>
                  </div>

                  <div className="bg-[#0A0A0A] border border-white/10 rounded-none p-3.5 flex items-center gap-3 mt-4">
                    <CheckCircle2 className="w-4 h-4 text-spotify-green shrink-0 animate-pulse" />
                    <span className="text-[11px] font-mono uppercase text-[#00FF00] tracking-wider">SYSTEM_STABLE // READY_FOR_VISUALIZATION</span>
                  </div>
                </div>

              </div>

              {/* Q3: İlk 5 Satır Tablosu */}
              <div className="bg-black border border-white/20 rounded-none p-6 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-white/20">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-400 text-black font-black font-mono text-xs rounded-none">
                      03
                    </div>
                    <div>
                      <span className="text-xs font-bold text-purple-400 uppercase tracking-[0.2em] font-mono">QUESTION 3</span>
                      <h3 className="text-xl font-black text-white uppercase tracking-tight">First 5 Rows of the Loaded Dataset</h3>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setActiveTab("alltime");
                    }}
                    className="text-xs text-white bg-black border border-white/25 hover:border-[#00FF00] hover:text-[#00FF00] font-mono uppercase tracking-wider px-4 py-2 rounded-none transition-all flex items-center gap-2"
                  >
                    VIEW ALL ROWS (TABLE MODE) <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="overflow-x-auto rounded-none border border-white/10">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-[#111] font-mono font-bold text-white/50 border-b-2 border-white/20 uppercase text-[10px]">
                        <th className="px-4 py-3">id</th>
                        <th className="px-4 py-3">TRACK NAME</th>
                        <th className="px-4 py-3">ARTIST</th>
                        <th className="px-4 py-3 text-right">STREAMS</th>
                        <th className="px-4 py-3">GENRE</th>
                        <th className="px-4 py-3 text-right">TEMPO / BPM</th>
                        <th className="px-4 py-3 text-center">YEAR</th>
                        <th className="px-4 py-3">COUNTRY</th>
                        <th className="px-4 py-3 text-center">EXPLICIT</th>
                        <th className="px-4 py-3 text-right">DANCE</th>
                        <th className="px-4 py-3 text-right">ENERGY</th>
                        <th className="px-4 py-3 text-right">VALENCE</th>
                        <th className="px-4 py-3 text-right">ACOUSTIC</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 text-white/70 font-mono text-xs">
                      {allTimeSongsData.slice(0, 5).map((row) => (
                        <tr key={row.alltime_rank} className="hover:bg-white/5 transition-colors">
                          <td className="px-4 py-3.5 text-center font-bold text-white/40 bg-white/5">
                            {row.alltime_rank}
                          </td>
                          <td className="px-4 py-3.5 font-bold text-white uppercase">
                            {row.song_title}
                          </td>
                          <td className="px-4 py-3.5 text-white/90">{row.artist}</td>
                          <td className="px-4 py-3.5 text-right font-bold text-[#00FF00]">
                            {row.total_streams_billions}B
                          </td>
                          <td className="px-4 py-3.5 uppercase">{row.primary_genre}</td>
                          <td className="px-4 py-3.5 text-right">{row.bpm}.0</td>
                          <td className="px-4 py-3.5 text-center">{row.release_year}</td>
                          <td className="px-4 py-3.5 uppercase">{row.artist_country}</td>
                          <td className="px-4 py-3.5 text-center">
                            <span className={`px-2 py-0.5 text-[9px] font-bold ${row.explicit ? "border border-red-500 text-red-500" : "border border-white/20 text-white/45"}`}>
                              {row.explicit ? "EXPLICIT" : "CLEAN"}
                            </span>
                          </td>
                          <td className="px-4 py-3.5 text-right">{row.danceability.toFixed(2)}</td>
                          <td className="px-4 py-3.5 text-right text-[#00FF00]">{row.energy.toFixed(2)}</td>
                          <td className="px-4 py-3.5 text-right text-purple-400">{row.valence.toFixed(2)}</td>
                          <td className="px-4 py-3.5 text-right">{row.acousticness.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Q4: En İlginç 3 Sayısal Sütun + Canlı Grafik Panel */}
              <div id="data-art-section" className="bg-black border border-white/20 rounded-none p-6 space-y-6">
                <div className="flex items-center gap-3 pb-3 border-b border-white/20">
                  <div className="p-2 bg-[#00FF00] text-black font-black font-mono text-xs rounded-none">
                    04
                  </div>
                  <div>
                    <span className="text-xs font-bold text-spotify-green uppercase tracking-[0.2em] font-mono">QUESTION 4</span>
                    <h3 className="text-xl font-black text-white uppercase tracking-tight">The 3 Most Fascinating Numerical Audio Attributes</h3>
                  </div>
                </div>

                <p className="text-sm font-sans text-white/80 leading-relaxed max-w-4xl">
                  From the twin perspectives of music psychology and data art science, the most zesty and expressive quantitative variables for modeling listener habits and sonic footprints are shown below:
                </p>

                {/* Top 3 properties showcase list styled EXACTLY as brutalist columns */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Card 1: Energy - Stylized White Block */}
                  <div
                    className={`p-6 flex flex-col justify-between cursor-pointer transition-all border ${
                      chartXAttr === "energy" 
                        ? "bg-white text-black border-white shadow-[6px_6px_0px_0px_#00FF00]" 
                        : "bg-white/95 text-black border-transparent hover:scale-[1.01]"
                    }`}
                    onClick={() => setChartXAttr("energy")}
                  >
                    <div>
                      <h4 className="text-3xl font-black uppercase leading-none font-sans">ENERGY</h4>
                      <p className="text-[11px] mt-3 uppercase tracking-tight text-black/80 font-mono">
                        Scale: 0.0 - 1.0. Measures intensity and physical activity. Highlights fast tempos, high loudness levels, and heavy instrumental rhythm arrangements.
                      </p>
                    </div>
                    <div className="mt-6 border-t border-black/20 pt-4 flex justify-between items-center text-xs font-mono font-bold">
                      <span>SET AS X AXIS</span>
                      <div className="w-12 h-1 bg-black"></div>
                    </div>
                  </div>

                  {/* Card 2: Danceability - Stylized Neon Green Block */}
                  <div
                    className={`p-6 flex flex-col justify-between cursor-pointer transition-all border ${
                      chartXAttr === "danceability" 
                        ? "bg-[#00FF00] text-black border-[#00FF00] shadow-[6px_6px_0px_0px_white]" 
                        : "bg-[#00FF00]/85 text-black border-transparent hover:scale-[1.01]"
                    }`}
                    onClick={() => setChartXAttr("danceability")}
                  >
                    <div>
                      <h4 className="text-3xl font-black uppercase leading-none font-sans">DANCEABILITY</h4>
                      <p className="text-[11px] mt-3 uppercase tracking-tight text-black/80 font-mono">
                        Scale: 0.0 - 1.0. Evaluates speed, rhythmic stability, beat strength, and overall acoustic regularity to determine suitability for dance venues.
                      </p>
                    </div>
                    <div className="mt-6 border-t border-black/20 pt-4 flex justify-between items-center text-xs font-mono font-bold">
                      <span>SET AS X AXIS</span>
                      <div className="w-12 h-1 bg-black"></div>
                    </div>
                  </div>

                  {/* Card 3: Valence - Outline Block */}
                  <div
                    className={`p-6 flex flex-col justify-between cursor-pointer transition-all border ${
                      chartXAttr === "valence" 
                        ? "border-2 border-[#00FF00] bg-black text-[#00FF00] shadow-[6px_6px_0px_0px_rgba(255,255,255,0.2)]" 
                        : "border border-white/30 bg-transparent text-white/80 hover:border-white/60 hover:scale-[1.01]"
                    }`}
                    onClick={() => setChartXAttr("valence")}
                  >
                    <div>
                      <h4 className="text-3xl font-black uppercase leading-none font-sans">VALENCE</h4>
                      <p className="text-[11px] mt-3 uppercase tracking-tight text-white/60 font-mono">
                        Scale: 0.0 - 1.0. Gauges structural musical positivity. High scores evoke optimism, brightness, and cheer; low ratings convey gloom and moodiness.
                      </p>
                    </div>
                    <div className="mt-6 border-t border-white/20 pt-4 flex justify-between items-center text-xs font-mono font-bold">
                      <span>SET AS X AXIS</span>
                      <div className="w-12 h-1 bg-[#00FF00]"></div>
                    </div>
                  </div>
                </div>

                {/* Live Interactive Recharts Box demonstrating these 3 key features */}
                <div className="bg-black rounded-none border border-white/20 p-6 space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 bg-spotify-green animate-pulse"></span>
                        <h4 className="text-base font-black uppercase tracking-wider font-mono text-white">
                          INTERACTIVE GLOW SCATTER PLOT (DATA ART MODE)
                        </h4>
                      </div>
                      <p className="text-xs font-mono text-white/50 uppercase tracking-tight mt-1">
                        Particle size maps to streams. Neon hue maps to Valence positivity (Cold Cyan for low, Warm Neon Green/Yellow for high valence values).
                      </p>
                    </div>

                    {/* Chart Axes Selectors */}
                    <div className="flex flex-wrap items-center gap-4 text-xs font-mono">
                      <div className="flex items-center gap-2">
                        <span className="text-white/50 uppercase">X_AXIS:</span>
                        <select
                          value={chartXAttr}
                          onChange={(e) => setChartXAttr(e.target.value as any)}
                          className="bg-black border border-white/30 px-3 py-1.5 text-xs text-white uppercase focus:border-spotify-green focus:outline-none rounded-none"
                        >
                          <option value="danceability">Danceability</option>
                          <option value="energy">Energy</option>
                          <option value="valence">Valence</option>
                          <option value="bpm">Tempo / BPM</option>
                        </select>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-white/50 uppercase">Y_AXIS:</span>
                        <select
                          value={chartYAttr}
                          onChange={(e) => setChartYAttr(e.target.value as any)}
                          className="bg-black border border-white/30 px-3 py-1.5 text-xs text-white uppercase focus:border-spotify-green focus:outline-none rounded-none"
                        >
                          <option value="energy">Energy</option>
                          <option value="danceability">Danceability</option>
                          <option value="valence">Valence</option>
                          <option value="bpm">Tempo / BPM</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Real-time telemetry observer display panel requested in prompt */}
                  <div className="transition-all duration-300">
                    {hoveredParticle ? (
                      <div className="border border-[#00dfff] bg-black/95 p-4 rounded-none flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-[0_0_15px_rgba(0,223,255,0.2)] animate-pulse">
                        <div>
                          <span className="text-[9px] text-[#00dfff] font-mono tracking-widest block font-bold uppercase">// REAL-TIME SONIC PARTICLE TELEMETRY OBSERVED</span>
                          <h4 className="text-sm font-black text-white uppercase mt-1">{hoveredParticle.name}</h4>
                          <p className="text-xs text-white/60">BY {hoveredParticle.artist.toUpperCase()}</p>
                        </div>
                        <div className="flex gap-6 font-mono text-[11px] text-right self-start sm:self-center">
                          <div>
                            <span className="text-white/40 block uppercase">STREAMS</span>
                            <span className="text-spotify-green font-bold text-xs">{hoveredParticle.streams} BILLIONS</span>
                          </div>
                          <div>
                            <span className="text-white/40 block uppercase">VALENCE</span>
                            <span className="text-[#00ff00] font-bold text-xs">{hoveredParticle.z}% COLOR SPEC</span>
                          </div>
                          <div>
                            <span className="text-white/40 block uppercase">COORDINATES</span>
                            <span className="text-white font-bold text-xs">X: {hoveredParticle.x} / Y: {hoveredParticle.y}</span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="border border-white/10 bg-black/40 p-4 rounded-none text-center font-mono text-[10px] text-white/45 uppercase tracking-wider">
                        [ Hover cursor over any neon glowing particle below to target and observe metadata telemetry dynamically ]
                      </div>
                    )}
                  </div>

                  {/* Chart Container - Pure Black Artboard */}
                  <div className="h-[420px] w-full bg-[#000000] border border-white/10 p-4 relative shadow-inner">
                    <ResponsiveContainer width="100%" height="100%">
                      <ScatterChart margin={{ top: 20, right: 30, bottom: 20, left: 10 }}>
                        <CartesianGrid strokeDasharray="2 2" stroke="rgba(255,255,255,0.03)" />
                        <XAxis
                          type="number"
                          dataKey="x"
                          name={chartXAttr.toUpperCase()}
                          stroke="rgba(255,255,255,0.4)"
                          fontSize={10}
                          fontFamily="JetBrains Mono"
                          domain={[0, chartXAttr === "bpm" ? 220 : 1]}
                          tickLine={false}
                        />
                        <YAxis
                          type="number"
                          dataKey="y"
                          name={chartYAttr.toUpperCase()}
                          stroke="rgba(255,255,255,0.4)"
                          fontSize={10}
                          fontFamily="JetBrains Mono"
                          domain={[0, chartYAttr === "bpm" ? 220 : 1]}
                          tickLine={false}
                        />
                        <ZAxis type="number" dataKey="z" range={[5, 20]} />
                        <Tooltip
                          cursor={{ stroke: "rgba(255, 255, 255, 0.08)", strokeWidth: 1 }}
                          content={({ active, payload }) => {
                            if (active && payload && payload.length) {
                              const data = payload[0].payload;
                              // Match hover state dynamically
                              if (!hoveredParticle || hoveredParticle.name !== data.name) {
                                setTimeout(() => setHoveredParticle(data), 0);
                              }
                              return (
                                <div className="bg-black border border-white/30 p-4 rounded-none text-left font-mono text-xs leading-normal max-w-xs space-y-2">
                                  <span className="text-[9px] text-[#00dfff] uppercase font-bold tracking-widest block">// {data.type} TELEMETRY</span>
                                  <h4 className="text-xs font-black text-white uppercase">{data.name}</h4>
                                  <p className="text-[10px] text-white/55">BY {data.artist.toUpperCase()}</p>
                                  <div className="pt-2 text-[10px] border-t border-white/10 space-y-1 text-white/80 font-mono uppercase">
                                    <div className="flex justify-between gap-4">
                                      <span>{chartXAttr}:</span>
                                      <span className="text-white font-bold">{data.x}</span>
                                    </div>
                                    <div className="flex justify-between gap-4">
                                      <span>{chartYAttr}:</span>
                                      <span className="text-[#00FF00] font-bold">{data.y}</span>
                                    </div>
                                    <div className="flex justify-between gap-4">
                                      <span>Valence POS:</span>
                                      <span className="text-[#00dfff] font-bold">{data.z}%</span>
                                    </div>
                                    <div className="flex justify-between gap-4">
                                      <span>Streams:</span>
                                      <span className="text-spotify-green font-bold">{data.streams} Billions</span>
                                    </div>
                                  </div>
                                </div>
                              );
                            }
                            return null;
                          }}
                        />
                        <Legend verticalAlign="top" height={36} wrapperStyle={{ color: "#fff", fontSize: 10, fontFamily: "JetBrains Mono" }} />
                        <Scatter 
                          name="ALL-TIME BIGGEST HITS" 
                          data={scatterChartData.filter(d => d.type === "All-Time")} 
                          shape={renderGlowParticle} 
                          onMouseLeave={() => setHoveredParticle(null)}
                        />
                        <Scatter 
                          name="2025 SPECIAL SELECTION" 
                          data={scatterChartData.filter(d => d.type === "2025 Wrapped")} 
                          shape={renderGlowParticle} 
                          onMouseLeave={() => setHoveredParticle(null)}
                        />
                      </ScatterChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
          {activeTab === "alltime" && (
            <motion.div
              key="alltime-panel"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.2 }}
              className="space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-4">
                <div>
                  <h3 className="text-xl font-black text-white uppercase tracking-tight flex flex-wrap items-center gap-3">
                    ALL-TIME MOST STREAMED TOP 100
                    <span className="text-[10px] font-mono bg-white text-black font-black uppercase tracking-widest px-2.5 py-1 rounded-none border border-white">
                      {filteredAllTime.length} TRACKS / FOUND
                    </span>
                  </h3>
                  <p className="text-xs text-white/60 font-mono uppercase mt-1">
                    THE 100 MOST STREAMED HISTORIC CLASSICS AND GIGA HITS GLOBALLY. CLICK ON HEADERS TO SORT DYNAMICALLY.
                  </p>
                </div>
              </div>

              {/* Table rendering AllTimeSongs */}
              <div className="overflow-x-auto rounded-none border border-white/20 bg-black">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-[#111] text-white/80 font-mono font-bold border-b-2 border-white/20 uppercase text-[10px]">
                      <th onClick={() => handleSort("alltime_rank")} className="px-4 py-3.5 cursor-pointer hover:bg-white/5 transition-colors">
                        <div className="flex items-center gap-1.5">ID <ArrowUpDown className="w-3 h-3 text-spotify-green" /></div>
                      </th>
                      <th onClick={() => handleSort("song_title")} className="px-4 py-3.5 cursor-pointer hover:bg-white/5 transition-colors">
                        <div className="flex items-center gap-1.5">TRACK NAME <ArrowUpDown className="w-3 h-3 text-spotify-green" /></div>
                      </th>
                      <th onClick={() => handleSort("artist")} className="px-4 py-3.5 cursor-pointer hover:bg-white/5 transition-colors">
                        <div className="flex items-center gap-1.5">ARTIST <ArrowUpDown className="w-3 h-3 text-spotify-green" /></div>
                      </th>
                      <th onClick={() => handleSort("total_streams_billions")} className="px-4 py-3.5 cursor-pointer hover:bg-white/5 transition-colors text-right">
                        <div className="flex items-center justify-end gap-1.5">STREAMS (BILLION) <ArrowUpDown className="w-3 h-3 text-spotify-green" /></div>
                      </th>
                      <th onClick={() => handleSort("primary_genre")} className="px-4 py-3.5 cursor-pointer hover:bg-white/5 transition-colors">
                        <div className="flex items-center gap-1.5">GENRE <ArrowUpDown className="w-3 h-3 text-spotify-green" /></div>
                      </th>
                      <th onClick={() => handleSort("bpm")} className="px-4 py-3.5 cursor-pointer hover:bg-white/5 transition-colors text-right">
                        <div className="flex items-center justify-end gap-1.5">BPM <ArrowUpDown className="w-3 h-3 text-spotify-green" /></div>
                      </th>
                      <th onClick={() => handleSort("release_year")} className="px-4 py-3.5 cursor-pointer hover:bg-white/5 transition-colors text-center">
                        <div className="flex items-center justify-center gap-1.5">YEAR <ArrowUpDown className="w-3 h-3 text-spotify-green" /></div>
                      </th>
                      <th onClick={() => handleSort("danceability")} className="px-4 py-3.5 cursor-pointer hover:bg-white/5 text-right font-mono text-[10px]">
                        <div className="flex items-center justify-end gap-1.5">DANCE <ArrowUpDown className="w-3 h-3 text-spotify-green" /></div>
                      </th>
                      <th onClick={() => handleSort("energy")} className="px-4 py-3.5 cursor-pointer hover:bg-white/5 text-right font-mono text-[10px]">
                        <div className="flex items-center justify-end gap-1.5">ENERGY <ArrowUpDown className="w-3 h-3 text-spotify-green" /></div>
                      </th>
                      <th onClick={() => handleSort("valence")} className="px-4 py-3.5 cursor-pointer hover:bg-white/5 text-right font-mono text-[10px]">
                        <div className="flex items-center justify-end gap-1.5">VALENCE <ArrowUpDown className="w-3 h-3 text-spotify-green" /></div>
                      </th>
                      <th className="px-4 py-3.5 text-center">CONTENT</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 font-mono text-xs text-white/70">
                    {filteredAllTime.map((s) => (
                      <tr key={s.alltime_rank} className="hover:bg-white/5 transition-colors">
                        <td className="px-4 py-3 text-center font-bold text-white/50 bg-white/5">
                          {s.alltime_rank}
                        </td>
                        <td className="px-4 py-3 font-bold text-white uppercase">
                          {s.song_title}
                        </td>
                        <td className="px-4 py-3 text-white/80">{s.artist}</td>
                        <td className="px-4 py-3 text-right font-bold text-[#00FF00]">
                          {s.total_streams_billions}B
                        </td>
                        <td className="px-4 py-3 uppercase">
                          <span className="bg-[#111] px-2.5 py-1 border border-white/10 text-[10px] uppercase text-white/80 rounded-none">
                            {s.primary_genre}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right text-white/80">{s.bpm}</td>
                        <td className="px-4 py-3 text-center text-white/80">{s.release_year}</td>
                        <td className="px-4 py-3 text-right text-white/80">{s.danceability.toFixed(2)}</td>
                        <td className="px-4 py-3 text-right text-[#00FF00]">{s.energy.toFixed(2)}</td>
                        <td className="px-4 py-3 text-right text-purple-400">{s.valence.toFixed(2)}</td>
                        <td className="px-4 py-3 text-center">
                          <span className={`px-2 py-0.5 text-[9px] font-bold ${s.explicit ? "border border-red-500 text-red-500" : "border border-white/20 text-white/40"}`}>
                            {s.explicit ? "EXP" : "CLN"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}0 border border-          {/* Tab 3: Artists View */}
          {activeTab === "artists" && (
            <motion.div
              key="artists-panel"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.2 }}
              className="space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-4">
                <div>
                  <h3 className="text-xl font-black text-white uppercase tracking-tight flex flex-wrap items-center gap-3">
                    WRAPPED 2025 TOP 50 ARTISTS
                    <span className="text-[10px] font-mono bg-[#00FF00] text-black font-black uppercase tracking-widest px-2.5 py-1 rounded-none border border-[#00FF00]">
                      {filteredArtists.length} ARTISTS / ACTIVE
                    </span>
                  </h3>
                  <p className="text-xs text-white/60 font-mono uppercase mt-1">
                    TOP 50 GLOBAL ARTISTS RANKED BY BOTH AUDIENCE SIZE AND MONTHLY LISTENERS AS OF MARCH 2026.
                  </p>
                </div>
              </div>

              {/* Table rendering Artists */}
              <div className="overflow-x-auto rounded-none border border-white/20 bg-black">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-[#111] text-white/80 font-mono font-bold border-b-2 border-white/20 uppercase text-[10px]">
                      <th onClick={() => handleSort("wrapped_2025_rank")} className="px-4 py-3.5 cursor-pointer hover:bg-white/5 transition-colors">
                        <div className="flex items-center gap-1.5">RANK <ArrowUpDown className="w-3 h-3 text-[#00FF00]" /></div>
                      </th>
                      <th onClick={() => handleSort("artist_name")} className="px-4 py-3.5 cursor-pointer hover:bg-white/5 transition-colors">
                        <div className="flex items-center gap-1.5">ARTIST NAME <ArrowUpDown className="w-3 h-3 text-[#00FF00]" /></div>
                      </th>
                      <th onClick={() => handleSort("monthly_listeners_millions_mar2026")} className="px-4 py-3.5 cursor-pointer hover:bg-white/5 transition-colors text-right">
                        <div className="flex items-center justify-end gap-1.5">MONTHLY LISTENERS <ArrowUpDown className="w-3 h-3 text-[#00FF00]" /></div>
                      </th>
                      <th onClick={() => handleSort("followers_millions")} className="px-4 py-3.5 cursor-pointer hover:bg-white/5 transition-colors text-right">
                        <div className="flex items-center justify-end gap-1.5">FOLLOWERS <ArrowUpDown className="w-3 h-3 text-[#00FF00]" /></div>
                      </th>
                      <th onClick={() => handleSort("primary_genre")} className="px-4 py-3.5 cursor-pointer hover:bg-white/5 transition-colors">
                        <div className="flex items-center gap-1.5">GENRE <ArrowUpDown className="w-3 h-3 text-[#00FF00]" /></div>
                      </th>
                      <th onClick={() => handleSort("country")} className="px-4 py-3.5 cursor-pointer hover:bg-white/5 transition-colors">
                        <div className="flex items-center gap-1.5">ORIGIN / COUNTRY <ArrowUpDown className="w-3 h-3 text-[#00FF00]" /></div>
                      </th>
                      <th onClick={() => handleSort("grammy_wins")} className="px-4 py-3.5 cursor-pointer hover:bg-white/5 transition-colors text-center">
                        <div className="flex items-center justify-center gap-1.5">GRAMMYS <ArrowUpDown className="w-3 h-3 text-[#00FF00]" /></div>
                      </th>
                      <th onClick={() => handleSort("debut_year")} className="px-4 py-3.5 cursor-pointer hover:bg-white/5 transition-colors text-center">
                        <div className="flex items-center justify-center gap-1.5">DEBUT <ArrowUpDown className="w-3 h-3 text-[#00FF00]" /></div>
                      </th>
                      <th className="px-4 py-3.5 uppercase text-white/50">TOP WRAPPED SONG</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 font-mono text-xs text-white/70">
                    {filteredArtists.map((a) => (
                      <tr key={a.wrapped_2025_rank} className="hover:bg-white/5 transition-colors">
                        <td className="px-4 py-3 text-center font-bold text-[#00FF00]/90 bg-[#00FF00]/5">
                          #{a.wrapped_2025_rank}
                        </td>
                        <td className="px-4 py-3 font-bold text-white uppercase">
                          {a.artist_name}
                        </td>
                        <td className="px-4 py-3 text-right font-bold text-[#00FF00]">
                          {a.monthly_listeners_millions_mar2026}M
                        </td>
                        <td className="px-4 py-3 text-right text-white/80">
                          {a.followers_millions}M
                        </td>
                        <td className="px-4 py-3 uppercase">
                          <span className="bg-[#111] px-2.5 py-1 border border-white/10 text-[10px] text-white/85 rounded-none">
                            {a.primary_genre}
                          </span>
                        </td>
                        <td className="px-4 py-3 uppercase text-white/80">{a.country}</td>
                        <td className="px-4 py-3 text-center">
                          {a.grammy_wins > 0 ? (
                            <span className="bg-white text-black font-black px-2.5 py-0.5 rounded-none border border-white text-[10px] inline-block">
                              WIN: {a.grammy_wins}
                            </span>
                          ) : (
                            <span className="text-white/40">-</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-center text-white/80">{a.debut_year}</td>
                        <td className="px-4 py-3 text-white italic uppercase">{a.top_2025_song}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}

          {/* Tab 4: Songs 2025 View */}
          {activeTab === "songs25" && (
            <motion.div
              key="songs25-panel"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.2 }}
              className="space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-4">
                <div>
                  <h3 className="text-xl font-black text-white uppercase tracking-tight flex flex-wrap items-center gap-3">
                    WRAPPED 2025 TOP 50 GLOBAL SONGS
                    <span className="text-[10px] font-mono bg-[#00FF00] text-black font-black uppercase tracking-widest px-2.5 py-1 rounded-none border border-[#00FF00]">
                      {filteredSongs25.length} SONGS / LOADED
                    </span>
                  </h3>
                  <p className="text-xs text-white/60 font-mono uppercase mt-1">
                    THE 50 BIGGEST TRACKS MEASURED SOLELY BY THEIR RECORD-BREAKING 2025 STREAMS.
                  </p>
                </div>
              </div>

              {/* Table rendering Songs 2025 */}
              <div className="overflow-x-auto rounded-none border border-white/20 bg-black">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-[#111] text-white/80 border-b-2 border-white/20 font-mono font-bold uppercase text-[10px]">
                      <th onClick={() => handleSort("wrapped_2025_rank")} className="px-4 py-3.5 cursor-pointer hover:bg-white/5 transition-colors">
                        <div className="flex items-center gap-1.5">RANK <ArrowUpDown className="w-3 h-3 text-spotify-green" /></div>
                      </th>
                      <th onClick={() => handleSort("song_title")} className="px-4 py-3.5 cursor-pointer hover:bg-white/5 transition-colors">
                        <div className="flex items-center gap-1.5">TRACK NAME <ArrowUpDown className="w-3 h-3 text-spotify-green" /></div>
                      </th>
                      <th onClick={() => handleSort("artist")} className="px-4 py-3.5 cursor-pointer hover:bg-white/5 transition-colors">
                        <div className="flex items-center gap-1.5">ARTIST <ArrowUpDown className="w-3 h-3 text-spotify-green" /></div>
                      </th>
                      <th onClick={() => handleSort("streams_2025_billions")} className="px-4 py-3.5 cursor-pointer hover:bg-white/5 transition-colors text-right">
                        <div className="flex items-center justify-end gap-1.5">25_STREAMS (B) <ArrowUpDown className="w-3 h-3 text-spotify-green" /></div>
                      </th>
                      <th onClick={() => handleSort("primary_genre")} className="px-4 py-3.5 cursor-pointer hover:bg-white/5 transition-colors">
                        <div className="flex items-center gap-1.5">GENRE <ArrowUpDown className="w-3 h-3 text-spotify-green" /></div>
                      </th>
                      <th onClick={() => handleSort("bpm")} className="px-4 py-3.5 cursor-pointer hover:bg-white/5 text-right">
                        <div className="flex items-center justify-end gap-1.5">BPM <ArrowUpDown className="w-3 h-3 text-spotify-green" /></div>
                      </th>
                      <th onClick={() => handleSort("duration_seconds")} className="px-4 py-3.5 cursor-pointer hover:bg-white/5 text-right">
                        <div className="flex items-center justify-end gap-1.5">DURATION <ArrowUpDown className="w-3 h-3 text-spotify-green" /></div>
                      </th>
                      <th onClick={() => handleSort("danceability")} className="px-4 py-3.5 cursor-pointer hover:bg-white/5 text-right font-mono text-[10px]">
                        <div className="flex items-center justify-end gap-1.5">DANCE <ArrowUpDown className="w-3 h-3 text-spotify-green" /></div>
                      </th>
                      <th onClick={() => handleSort("energy")} className="px-4 py-3.5 cursor-pointer hover:bg-white/5 text-right font-mono text-[10px]">
                        <div className="flex items-center justify-end gap-1.5">ENERGY <ArrowUpDown className="w-3 h-3 text-spotify-green" /></div>
                      </th>
                      <th onClick={() => handleSort("valence")} className="px-4 py-3.5 cursor-pointer hover:bg-white/5 text-right font-mono text-[10px]">
                        <div className="flex items-center justify-end gap-1.5">VALENCE <ArrowUpDown className="w-3 h-3 text-spotify-green" /></div>
                      </th>
                      <th className="px-4 py-3.5 text-center">PEAK</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 font-mono text-xs text-white/70">
                    {filteredSongs25.map((s) => (
                      <tr key={s.wrapped_2025_rank} className="hover:bg-white/5 transition-colors">
                        <td className="px-4 py-3.5 text-center font-bold text-white/50 bg-white/5">
                          #{s.wrapped_2025_rank}
                        </td>
                        <td className="px-4 py-3.5 font-bold text-white uppercase">
                          {s.song_title}
                        </td>
                        <td className="px-4 py-3.5 text-white/85">{s.artist}</td>
                        <td className="px-4 py-3.5 text-right font-bold text-[#00FF00]">
                          {s.streams_2025_billions}B
                        </td>
                        <td className="px-4 py-3.5 uppercase">
                          <span className="bg-[#111] px-2.5 py-1 border border-white/10 text-[10px] text-white/80 rounded-none">
                            {s.primary_genre}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-right text-white/80">{s.bpm}</td>
                        <td className="px-4 py-3.5 text-right text-white/80">
                          {Math.floor(s.duration_seconds / 60)}:{(s.duration_seconds % 60).toString().padStart(2, '0')}
                        </td>
                        <td className="px-4 py-3.5 text-right text-white/80">{s.danceability.toFixed(2)}</td>
                        <td className="px-4 py-3.5 text-right text-[#00FF00]">{s.energy.toFixed(2)}</td>
                        <td className="px-4 py-3.5 text-right text-purple-400">{s.valence.toFixed(2)}</td>
                        <td className="px-4 py-3.5 text-center">
                          <span className="border border-white text-white font-black px-2 py-0.5 rounded-none text-[9px]">
                            {s.peak_global_chart_position === 1 ? "TOP_1" : `#${s.peak_global_chart_position}`}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="bg-black border-t border-white/10 px-6 py-10 mt-16 text-xs text-white/40 font-mono uppercase tracking-widest">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <p>
            SPOTIFY DATASET EXPLORER &copy; 2026. WORKSPACE // COMPREHENSIVE_ANALYSIS
          </p>
          <div className="flex gap-6 text-white/30 text-[10px]">
            <span>REACT 19 + RECHARTS</span>
            <span>TAILWIND CSS V4</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
