// src/App.jsx
import React, { useEffect, useMemo, useState, useCallback, useRef } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import axios from "axios";

import Navbar from "./components/Navbar";
import MusicPlayer from "./components/MusicPlayer";
import Playlist from "./components/Playlist";

import Home from "./pages/Home";
import Artist from "./pages/Artist";
import SearchResults from "./pages/SearchResults";
import AllSongs from "./pages/AllSongs";
import MyPlaylist from "./pages/MyPlaylist";

import "./App.css";
import BottomNav from "./components/BottomNav";
import FullPlayer from "./components/FullPlayer";
import MyPlaylistHome from "./pages/MyPlaylistHome";
import MyPlaylistDetail from "./pages/MyPlaylistDetail";
import PlaylistPicker from "./components/PlaylistPicker";
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/7.0.1/css/all.min.css" integrity="sha512-2SwdPD6INVrV/lHTZbO2nodKhrnDdJK9/kg2XD1r9uGqPo1cUbujc+IYdlYdEErWNu69gVcYgdxlmVmzTWnetw==" crossorigin="anonymous" referrerpolicy="no-referrer" />

// auto import songs
function importAll(r) {
  return r.keys().map((fileName, index) => {
    const url = r(fileName);
    const name = fileName.replace("./", "").replace(/\.[^/.]+$/, "");
    const parts = name.split(" - ");
    return {
      id: String(index + 1),
      title: parts[0] || name,
      artist: parts[1] || "Unknown Artist",
      url,
    };
  });
}
const TRACKS = importAll(require.context("./Nitesh", false, /\.mp3$/));
console.log("process.env:", process.env);

// ✅ Use Render backend URL from .env
const BACKEND_URL = process.env.REACT_APP_API_BASE;

export default function App() {
  const [pickerTrack, setPickerTrack] = useState(null);
  const seekRef = useRef(0);
  const shufflePoolRef = useRef([]);
  const [isPlayerExpanded, setIsPlayerExpanded] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [activeQueue, setActiveQueue] = useState("all");

  const [mode, setMode] = useState(() => {
    return localStorage.getItem("last_mode") || "normal";
  });

  const [playlists, setPlaylists] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("playlists_v1")) || {
        "Liked Songs": []
      };
    } catch {
      return { "Liked Songs": [] };
    }
  });

  const [activePlaylist, setActivePlaylist] = useState("Liked Songs");

  const playlist = playlists[activePlaylist] || [];

  const createPlaylist = (name) => {
    if (!name || playlists[name]) return;

    setPlaylists(prev => ({
      ...prev,
      [name]: []
    }));
  };


  const deletePlaylist = (name) => {
    if (name === "Liked Songs") return; // ❌ protect default playlist

    setPlaylists(prev => {
      const copy = { ...prev };
      delete copy[name];

      return copy;
    });

    // agar wahi playlist active thi to reset
    if (activePlaylist === name) {
      setActivePlaylist("Liked Songs");
      setActiveQueue("all");
    }
  };






  const navigate = useNavigate();

  useEffect(() => {
    localStorage.setItem("playlists_v1", JSON.stringify(playlists));
  }, [playlists]);


  const currentQueue = useMemo(() => {
    return activeQueue === "playlist" ? playlist : TRACKS;
  }, [activeQueue, playlist]);





  const currentTrack = useMemo(
    () => (currentIndex != null ? currentQueue[currentIndex] : null),
    [currentIndex, currentQueue]
  );

  const playById = useCallback(
    (id, autoplay = false, resumeTime = 0, queue = "all") => {
      const list = queue === "playlist" ? playlist : TRACKS;
      const idx = list.findIndex((t) => t.id === id);

      if (idx !== -1) {
        setActiveQueue(queue);
        if (autoplay) window._autoplayFlag = true;
        setCurrentIndex(idx);
        seekRef.current = resumeTime || 0;

      }
    },
    [playlist]
  );

  const buildShufflePool = (length, current) => {
    if (length <= 1) return [];
    return Array.from({ length }, (_, i) => i).filter(i => i !== current);
  };

  const getNextShuffleIndex = (length, current) => {
    let pool = shufflePoolRef.current;

    if (pool.length === 0) {
      pool = Array.from({ length }, (_, i) => i).filter(i => i !== current);
    }

    const randomPos = Math.floor(Math.random() * pool.length);
    const nextIndex = pool[randomPos];

    shufflePoolRef.current = pool.filter((_, i) => i !== randomPos);

    console.log("▶️ PLAY:", nextIndex, "REMAINING:", shufflePoolRef.current);

    return nextIndex;
  };






  const playNext = useCallback(() => {
    if (!currentQueue.length) return;
    window._autoplayFlag = true;

    if (mode === "shuffle") {
      const next = getNextShuffleIndex(
        currentQueue.length,
        currentIndex
      );
      setCurrentIndex(next);
    } else {
      setCurrentIndex(
        (prev) => (prev + 1) % currentQueue.length
      );
    }

    seekRef.current = 0;

  }, [mode, currentQueue.length, currentIndex]);




  const playPrev = useCallback(() => {
    if (!currentQueue.length) return;
    window._autoplayFlag = true;

    if (mode === "shuffle") {
      const prev = getNextShuffleIndex(
        currentQueue.length,
        currentIndex
      );
      setCurrentIndex(prev);
    } else {
      setCurrentIndex(
        (prev) =>
          (prev - 1 + currentQueue.length) % currentQueue.length
      );
    }

    seekRef.current = 0;
  }, [mode, currentQueue.length, currentIndex]);





  const handleEnded = useCallback(() => {
    if (mode === "repeat-all" || mode === "shuffle") {
      playNext();
    }
  }, [mode, playNext]);

  const addToPlaylist = useCallback((track, playlistName = activePlaylist) => {
    setPlaylists(prev => {
      if (prev[playlistName]?.some(t => t.id === track.id)) return prev;

      return {
        ...prev,
        [playlistName]: [...(prev[playlistName] || []), track]
      };
    });
  }, [activePlaylist]);



  const removeFromPlaylist = useCallback((trackId, playlistName = activePlaylist) => {
    setPlaylists(prev => ({
      ...prev,
      [playlistName]: prev[playlistName].filter(t => t.id !== trackId)
    }));
  }, [activePlaylist]);



  useEffect(() => {
    if (mode === "shuffle") {
      shufflePoolRef.current = Array.from(
        { length: currentQueue.length },
        (_, i) => i
      ).filter(i => i !== currentIndex);

      console.log("🔁 SHUFFLE INIT:", shufflePoolRef.current);
    } else {
      shufflePoolRef.current = [];
    }
  }, [mode, activeQueue, currentQueue.length]);

  useEffect(() => {
    if (!isPlayerExpanded) return;

    // Push a dummy state when FullPlayer opens
    window.history.pushState({ fullPlayer: true }, "");

    const handleBack = (e) => {
      if (isPlayerExpanded) {
        e.preventDefault();
        setIsPlayerExpanded(false); // 👈 collapse FullPlayer
      }
    };

    window.addEventListener("popstate", handleBack);

    return () => {
      window.removeEventListener("popstate", handleBack);
    };
  }, [isPlayerExpanded]);


  // 🔹 load last track from Render backend
  useEffect(() => {
    // console.log("BACKEND_URL:", BACKEND_URL);

    if (!BACKEND_URL) return;
    axios.get(`${BACKEND_URL}/api/track`)
      .then(res => {
        console.log("Loaded from backend:", res.data);
        const saved = res.data;
        if (saved?.id) {
          playById(saved.id, saved.isPlaying, saved.seek || 0);
        }
      })
      .catch(err => console.log("Failed to load last track:", err));
  }, [playById]);

  // 🔹 save last track to backend every 2s
  useEffect(() => {
    if (!BACKEND_URL) return;
    const interval = setInterval(() => {
      if (!currentTrack) return;
      const audio = window._howlerRef?.();
      if (audio && typeof audio.seek === "function") {
        const pos = audio.seek() || 0;
        seekRef.current = pos;

        axios.post(`${BACKEND_URL}/api/track`, {
          id: currentTrack.id,
          seek: pos,
          isPlaying: audio.playing(),
        }).catch(err => console.log("Failed to save last track:", err));
      }
    }, 2000);
    return () => clearInterval(interval);
  });

  return (
    <div className="app">
      <Navbar onSearch={(q) => navigate(`/search?q=${encodeURIComponent(q)}`)} />
      <BottomNav />
      <main className="layout">
        <section className="main">
          <section className="main-content">
            <Routes>
              <Route path="/" element={
                <Home
                  tracks={TRACKS}
                  currentId={currentTrack?.id}
                  onPlay={playById}
                  onAddToPlaylist={(track) => setPickerTrack(track)}
                  onRemoveFromPlaylist={removeFromPlaylist}
                  playlist={playlist}
                />
              } />
              <Route path="/artist/:name" element={
                <Artist
                  tracks={TRACKS}
                  currentId={currentTrack?.id}
                  onPlay={playById}
                  onAddToPlaylist={(track) => setPickerTrack(track)}
                  onRemoveFromPlaylist={removeFromPlaylist}
                  playlist={playlist}
                />
              } />
              <Route path="/search" element={
                <SearchResults
                  tracks={TRACKS}
                  currentId={currentTrack?.id}
                  onPlay={playById}
                  onAddToPlaylist={addToPlaylist}
                  onRemoveFromPlaylist={removeFromPlaylist}
                  playlist={playlist}
                />
              } />
              <Route path="/all-songs" element={
                <AllSongs
                  tracks={TRACKS}
                  currentId={currentTrack?.id}
                  onPlay={playById}
                  onAddToPlaylist={(track) => setPickerTrack(track)}
                  onRemoveFromPlaylist={removeFromPlaylist}
                  playlist={playlist}
                />
              } />
              <Route path="/myplaylist" element={
                <MyPlaylistHome
                  playlists={playlists}
                  onCreate={createPlaylist}
                  onDelete={deletePlaylist}
                  currentId={currentTrack?.id}
                  onPlay={(t) => playById(t.id, true, 0, "playlist")}
                  onRemove={(i) => removeFromPlaylist(i)}
                />
              } />

              <Route
                path="/myplaylist/:name"
                element={
                  <MyPlaylistDetail
                    playlists={playlists}
                    currentId={currentTrack?.id}
                    onPlay={(t) => playById(t.id, true, 0, "playlist")}
                    onRemove={removeFromPlaylist}
                    setActivePlaylist={setActivePlaylist}
                    allSongs={TRACKS}
                    onAddToPlaylist={addToPlaylist}
                  />
                }
              />
            </Routes>

          </section>
          {currentTrack && (
            <FullPlayer
              track={currentTrack}
              onNext={playNext}
              onPrev={playPrev}
              onPlay={() => playById(currentTrack.id, true)}
              playlist={playlist}
              onAddToPlaylist={(track) => setPickerTrack(track)}
              onRemoveFromPlaylist={removeFromPlaylist}
              mode={mode}
              setMode={setMode}
              isOpen={isPlayerExpanded}
              onCollapse={() => setIsPlayerExpanded(false)}
            />
          )}


          {pickerTrack && (
            <PlaylistPicker
              playlists={playlists}
              onSelect={(playlistName) =>
                addToPlaylist(pickerTrack, playlistName)
              }
              onClose={() => setPickerTrack(null)}
            />
          )}


        </section>

        <aside className="sidebar">
          <div className="card-top">
            <h3>Now Playing</h3>
            <MusicPlayer
              track={currentTrack}
              onNext={playNext}
              onPrev={playPrev}
              onEnded={handleEnded}
              mode={mode}
              setMode={setMode}
              onAddToPlaylist={(track) => setPickerTrack(track)}
              onRemoveFromPlaylist={removeFromPlaylist}
              playlist={playlist}
              resumeSeek={seekRef.current}
              onExpand={() => setIsPlayerExpanded(true)}
            />
          </div>

          <div className="card-bottem">
            <div className="row between">
              <h3>Your Playlist</h3>
              <button
                className="btn ghost"
                onClick={() =>
                  setPlaylists((prev) => ({
                    ...prev,
                    [activePlaylist]: [],
                  }))
                }
              >
                Clear
              </button>

            </div>
            <div className="playlist-scroll">
              <Playlist
                playlist={playlist}
                currentId={currentTrack?.id}
                onPlay={(t) => playById(t.id, true, 0, "playlist")}
                onRemove={(id) => removeFromPlaylist(id)}
              />
            </div>
          </div>
        </aside>
      </main>
    </div>
  );
}