// src/App.jsx
import React, { useEffect, useMemo, useState, useCallback } from "react";
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

export default function App() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [seekPos, setSeekPos] = useState(0);
  const [playlist, setPlaylist] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("playlist_v1") || "[]");
    } catch {
      return [];
    }
  });
  const [mode, setMode] = useState(() => {
    return localStorage.getItem("last_mode") || "normal";
  });

  const navigate = useNavigate();

  useEffect(() => {
    localStorage.setItem("playlist_v1", JSON.stringify(playlist));
  }, [playlist]);

  const currentTrack = useMemo(
    () => (currentIndex != null ? TRACKS[currentIndex] : null),
    [currentIndex]
  );

  const playById = useCallback((id, autoplay = false, resumeTime = 0) => {
    const idx = TRACKS.findIndex((t) => t.id === id);
    if (idx !== -1) {
      if (autoplay) window._autoplayFlag = true;
      setCurrentIndex((prev) => (prev === idx ? null : idx));
      setTimeout(() => setCurrentIndex(idx), 0);
      setSeekPos(resumeTime || 0);
    }
  }, []);

  const playNext = useCallback(() => {
    window._autoplayFlag = true;
    if (mode === "shuffle") {
      const random = Math.floor(Math.random() * TRACKS.length);
      setCurrentIndex(random);
    } else {
      setCurrentIndex((prev) => (prev + 1) % TRACKS.length);
    }
    setSeekPos(0);
  }, [mode]);

  const playPrev = useCallback(() => {
    window._autoplayFlag = true;
    if (mode === "shuffle") {
      const random = Math.floor(Math.random() * TRACKS.length);
      setCurrentIndex(random);
    } else {
      setCurrentIndex((prev) => (prev - 1 + TRACKS.length) % TRACKS.length);
    }
    setSeekPos(0);
  }, [mode]);

  const handleEnded = useCallback(() => {
    if (mode === "repeat-all" || mode === "shuffle") {
      playNext();
    }
  }, [mode, playNext]);

  const addToPlaylist = useCallback((track) => {
    setPlaylist((prev) => {
      if (prev.some((t) => t.id === track.id)) return prev;
      return [...prev, track];
    });
  }, []);

  const removeFromPlaylist = useCallback((idOrIndex) => {
    setPlaylist((prev) =>
      typeof idOrIndex === "number"
        ? prev.filter((_, i) => i !== idOrIndex)
        : prev.filter((t) => t.id !== idOrIndex)
    );
  }, []);

  // 🔹 load last track from backend
  useEffect(() => {
    axios.get("http://localhost:3000/api/track")
      .then(res => {
        const saved = res.data;
        if (saved?.id) {
          playById(saved.id, saved.isPlaying, saved.seek || 0);
        }
      })
      .catch(err => console.log("Failed to load last track:", err));
  }, [playById]);

  // 🔹 save last track to backend every 2s
  useEffect(() => {
    const interval = setInterval(() => {
      if (!currentTrack) return;
      const audio = window._howlerRef?.();
      if (audio && typeof audio.seek === "function") {
        const pos = audio.seek() || 0;
        setSeekPos(pos);

        axios.post("http://localhost:3000/api/track", {
          id: currentTrack.id,
          seek: pos,
          isPlaying: audio.playing(),
        }).catch(err => console.log("Failed to save last track:", err));
      }
    }, 2000);
    return () => clearInterval(interval);
  }, [currentTrack]);

  return (
    <div className="app">
      <Navbar onSearch={(q) => navigate(`/search?q=${encodeURIComponent(q)}`)} />
      <main className="layout">
        <section className="main">
          <Routes>
            <Route path="/" element={
              <Home
                tracks={TRACKS}
                currentId={currentTrack?.id}
                onPlay={playById}
                onAddToPlaylist={addToPlaylist}
                onRemoveFromPlaylist={removeFromPlaylist}
                playlist={playlist}
              />
            } />
            <Route path="/artist/:name" element={
              <Artist
                tracks={TRACKS}
                currentId={currentTrack?.id}
                onPlay={playById}
                onAddToPlaylist={addToPlaylist}
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
                onAddToPlaylist={addToPlaylist}
                onRemoveFromPlaylist={removeFromPlaylist}
                playlist={playlist}
              />
            } />
            <Route path="/myplaylist" element={
              <MyPlaylist
                playlist={playlist}
                currentId={currentTrack?.id}
                onPlay={(t) => playById(t.id, true)}
                onRemove={(i) => removeFromPlaylist(i)}
              />
            } />
          </Routes>
        </section>

        <aside className="sidebar">
          <div className="card">
            <h3>Now Playing</h3>
            <MusicPlayer
              track={currentTrack}
              onNext={playNext}
              onPrev={playPrev}
              onEnded={handleEnded}
              mode={mode}
              setMode={setMode}
              onAddToPlaylist={addToPlaylist}
              onRemoveFromPlaylist={removeFromPlaylist}
              playlist={playlist}
              resumeSeek={seekPos}
            />
          </div>

          <div className="card">
            <div className="row between">
              <h3>Your Playlist</h3>
              <button className="btn ghost" onClick={() => setPlaylist([])}>Clear</button>
            </div>
            <Playlist
              playlist={playlist}
              currentId={currentTrack?.id}
              onPlay={(t) => playById(t.id, true)}
              onRemove={(id) => removeFromPlaylist(id)}
            />
          </div>
        </aside>
      </main>
    </div>
  );
}
