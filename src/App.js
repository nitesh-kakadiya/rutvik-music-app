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

const BACKEND_URL = process.env.REACT_APP_API_BASE;

export default function App() {
  const [tracks, setTracks] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [seekPos, setSeekPos] = useState(0);
  const [playlist, setPlaylist] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("playlist_v1") || "[]");
    } catch {
      return [];
    }
  });
  const [mode, setMode] = useState(() => localStorage.getItem("last_mode") || "normal");

  const navigate = useNavigate();

  // ✅ Fetch songs
  useEffect(() => {
    if (!BACKEND_URL) return;
    axios
      .get(`${BACKEND_URL}/google/songs`)
      .then((res) => setTracks(res.data || []))
      .catch((err) => console.error("Failed to fetch songs:", err));
  }, []);

  // Save playlist in localStorage
  useEffect(() => {
    localStorage.setItem("playlist_v1", JSON.stringify(playlist));
  }, [playlist]);

  const currentTrack = useMemo(
    () => (currentIndex != null ? tracks[currentIndex] : null),
    [currentIndex, tracks]
  );

  const playById = useCallback(
    (id, autoplay = false, resumeTime = 0) => {
      const idx = tracks.findIndex((t) => t.id === id);
      if (idx !== -1) {
        if (autoplay) window._autoplayFlag = true;
        setCurrentIndex((prev) => (prev === idx ? null : idx));
        setTimeout(() => setCurrentIndex(idx), 0);
        setSeekPos(resumeTime || 0);
      }
    },
    [tracks]
  );

  const playNext = useCallback(() => {
    window._autoplayFlag = true;
    if (mode === "shuffle") {
      const random = Math.floor(Math.random() * tracks.length);
      setCurrentIndex(random);
    } else {
      setCurrentIndex((prev) => (prev + 1) % tracks.length);
    }
    setSeekPos(0);
  }, [mode, tracks]);

  const playPrev = useCallback(() => {
    window._autoplayFlag = true;
    if (mode === "shuffle") {
      const random = Math.floor(Math.random() * tracks.length);
      setCurrentIndex(random);
    } else {
      setCurrentIndex((prev) => (prev - 1 + tracks.length) % tracks.length);
    }
    setSeekPos(0);
  }, [mode, tracks]);

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

  // 🔹 Load last track from backend
  useEffect(() => {
    if (!BACKEND_URL) return;
    axios
      .get(`${BACKEND_URL}/google/lastTrack`)
      .then((res) => {
        const saved = res.data;
        if (saved?.id) {
          playById(saved.id, saved.isPlaying, saved.seek || 0);
        }
      })
      .catch((err) => console.log("Failed to load last track:", err));
  }, [playById]);

  // 🔹 Save last track to backend every 2s
  useEffect(() => {
    if (!BACKEND_URL) return;
    const interval = setInterval(() => {
      if (!currentTrack) return;
      const audio = window._howlerRef?.();
      if (audio && typeof audio.seek === "function") {
        const pos = audio.seek() || 0;
        setSeekPos(pos);

        axios
          .post(`${BACKEND_URL}/google/lastTrack`, {
            id: currentTrack.id,
            seek: pos,
            isPlaying: audio.playing(),
          })
          .catch((err) => console.log("Failed to save last track:", err));
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
            <Route
              path="/"
              element={
                <Home
                  tracks={tracks}
                  currentId={currentTrack?.id}
                  onPlay={playById}
                  onAddToPlaylist={addToPlaylist}
                  onRemoveFromPlaylist={removeFromPlaylist}
                  playlist={playlist}
                />
              }
            />
            <Route
              path="/artist/:name"
              element={
                <Artist
                  tracks={tracks}
                  currentId={currentTrack?.id}
                  onPlay={playById}
                  onAddToPlaylist={addToPlaylist}
                  onRemoveFromPlaylist={removeFromPlaylist}
                  playlist={playlist}
                />
              }
            />
            <Route
              path="/search"
              element={
                <SearchResults
                  tracks={tracks}
                  currentId={currentTrack?.id}
                  onPlay={playById}
                  onAddToPlaylist={addToPlaylist}
                  onRemoveFromPlaylist={removeFromPlaylist}
                  playlist={playlist}
                />
              }
            />
            <Route
              path="/all-songs"
              element={
                <AllSongs
                  tracks={tracks}
                  currentId={currentTrack?.id}
                  onPlay={playById}
                  onAddToPlaylist={addToPlaylist}
                  onRemoveFromPlaylist={removeFromPlaylist}
                  playlist={playlist}
                />
              }
            />
            <Route
              path="/myplaylist"
              element={
                <MyPlaylist
                  playlist={playlist}
                  currentId={currentTrack?.id}
                  onPlay={(t) => playById(t.id, true)}
                  onRemove={(i) => removeFromPlaylist(i)}
                />
              }
            />
          </Routes>
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
              onAddToPlaylist={addToPlaylist}
              onRemoveFromPlaylist={removeFromPlaylist}
              playlist={playlist}
              resumeSeek={seekPos}
            />
          </div>

          <div className="card-bottem">
            <div className="row between">
              <h3>Your Playlist</h3>
              <button className="btn ghost" onClick={() => setPlaylist([])}>
                Clear
              </button>
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
