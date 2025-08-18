// src/App.jsx
import React, { useEffect, useMemo, useState, useCallback } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";

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
  const [playlist, setPlaylist] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("playlist_v1") || "[]");
    } catch {
      return [];
    }
  });

  const navigate = useNavigate();

  useEffect(() => {
    localStorage.setItem("playlist_v1", JSON.stringify(playlist));
  }, [playlist]);

  const currentTrack = useMemo(
    () => (currentIndex != null ? TRACKS[currentIndex] : null),
    [currentIndex]
  );

  // playback
  const playById = useCallback((id, autoplay = false) => {
    const idx = TRACKS.findIndex((t) => t.id === id);
    if (idx !== -1) {
      if (autoplay) {
        window._autoplayFlag = true; // 👈 turant set karo
      }
      setCurrentIndex((prev) => {
        // agar same track dobara click hua, reload karne ke liye null set karo
        if (prev === idx) {
          return null;
        }
        return idx;
      });
      // fir turant next tick me actual idx set
      setTimeout(() => {
        setCurrentIndex(idx);
      }, 0);
    }
  }, []);

  const playNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % TRACKS.length);
  }, []);

  const playPrev = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + TRACKS.length) % TRACKS.length);
  }, []);

  // playlist
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

  return (
    <div className="app">
      app.js
      <Navbar
        onSearch={(q) => navigate(`/search?q=${encodeURIComponent(q)}`)}
      />
      <main className="layout">
        <section className="main">
          <Routes>
            <Route
              path="/"
              element={
                <Home
                  tracks={TRACKS}
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
                  tracks={TRACKS}
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
                  tracks={TRACKS}
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
                  tracks={TRACKS}
                  currentId={currentTrack?.id}
                  onPlay={playById}
                  onAddToPlaylist={addToPlaylist}
                  onRemoveFromPlaylist={removeFromPlaylist}
                  playlist={playlist}
                />
              }
            />
            <Route
              path="/my-playlist"
              element={
                <MyPlaylist
                  playlist={playlist}
                  onPlay={(t) => playById(t.id, true)} // ✅ autoplay flag pass karo
                  onRemove={(i) => removeFromPlaylist(i)}
                />
              }
            />
          </Routes>
        </section>

        <aside className="sidebar">
          <div className="card">
            <h3>Now Playing</h3>
            <MusicPlayer
              track={currentTrack}
              onNext={playNext}
              onPrev={playPrev}
              onEnded={playNext}
            />
          </div>

          <div className="card">
            <div className="row between">
              <h3>Your Playlist</h3>
              <button className="btn ghost" onClick={() => setPlaylist([])}>
                Clear
              </button>
            </div>
            <Playlist
              playlist={playlist}
              onPlay={(t) => playById(t.id, true)}   // 👈 autoplay true kariyu
              onRemove={removeFromPlaylist}
            />
          </div>
        </aside>
      </main>

      <footer className="footer">
        Just drop any <code>.mp3</code> files into <code>src/Nitesh</code> — they’ll be auto-detected.
      </footer>
    </div>
  );
}
