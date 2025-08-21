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
  const [seekPos, setSeekPos] = useState(0); // ✅ save seek position
  const [playlist, setPlaylist] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("playlist_v1") || "[]");
    } catch {
      return [];
    }
  });

  // normal | repeat-one | shuffle | repeat-all
  const [mode, setMode] = useState(() => {
    return localStorage.getItem("last_mode") || "normal"; // ✅ load saved or default
  });


  const navigate = useNavigate();

  // ✅ save playlist to localStorage
  useEffect(() => {
    localStorage.setItem("playlist_v1", JSON.stringify(playlist));
  }, [playlist]);

  const currentTrack = useMemo(
    () => (currentIndex != null ? TRACKS[currentIndex] : null),
    [currentIndex]
  );

  // playback
  const playById = useCallback((id, autoplay = false, resumeTime = 0) => {
    const idx = TRACKS.findIndex((t) => t.id === id);
    if (idx !== -1) {
      if (autoplay) window._autoplayFlag = true;
      setCurrentIndex((prev) => (prev === idx ? null : idx));
      setTimeout(() => setCurrentIndex(idx), 0);
      setSeekPos(resumeTime || 0);

      // ✅ save last played in localStorage
      localStorage.setItem(
        "last_played",
        JSON.stringify({ id, isPlaying: autoplay, seek: resumeTime || 0 })
      );
    }
  }, []);

  const playNext = useCallback(() => {
    window._autoplayFlag = true;
    if (mode === "shuffle") {
      const random = Math.floor(Math.random() * TRACKS.length);
      setCurrentIndex(random);
      localStorage.setItem(
        "last_played",
        JSON.stringify({ id: TRACKS[random].id, isPlaying: true, seek: 0 })
      );
    } else {
      setCurrentIndex((prev) => {
        const next = (prev + 1) % TRACKS.length;
        localStorage.setItem(
          "last_played",
          JSON.stringify({ id: TRACKS[next].id, isPlaying: true, seek: 0 })
        );
        return next;
      });
    }
    setSeekPos(0);
  }, [mode]);

  const playPrev = useCallback(() => {
    window._autoplayFlag = true;
    if (mode === "shuffle") {
      const random = Math.floor(Math.random() * TRACKS.length);
      setCurrentIndex(random);
      localStorage.setItem(
        "last_played",
        JSON.stringify({ id: TRACKS[random].id, isPlaying: true, seek: 0 })
      );
    } else {
      setCurrentIndex((prev) => {
        const prevIndex = (prev - 1 + TRACKS.length) % TRACKS.length;
        localStorage.setItem(
          "last_played",
          JSON.stringify({ id: TRACKS[prevIndex].id, isPlaying: true, seek: 0 })
        );
        return prevIndex;
      });
    }
    setSeekPos(0);
  }, [mode]);

  // on track end
  const handleEnded = useCallback(() => {
    if (mode === "repeat-all" || mode === "shuffle") {
      playNext();
    }
  }, [mode, playNext]);

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

  // ✅ auto-load last played track + seek position
  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("last_played") || "null");
    if (saved?.id) {
      playById(saved.id, saved.isPlaying, saved.seek || 0);
    }
  }, [playById]);

  // ✅ keep updating seek position in localStorage
  useEffect(() => {
    const interval = setInterval(() => {
      if (!currentTrack) return;
      const audio = window._howlerRef?.(); // custom global accessor
      if (audio && typeof audio.seek === "function") {
        const pos = audio.seek() || 0;
        setSeekPos(pos);
        localStorage.setItem(
          "last_played",
          JSON.stringify({ id: currentTrack.id, isPlaying: true, seek: pos })
        );
      }
    }, 2000); // update every 2s
    return () => clearInterval(interval);
  }, [currentTrack]);

  return (
    <div className="app">
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
              resumeSeek={seekPos} // ✅ pass saved seek
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
              currentId={currentTrack?.id}
              onPlay={(t) => playById(t.id, true)}
              onRemove={(id) => removeFromPlaylist(id)} // remove by id
            />
          </div>
        </aside>
      </main>
    </div>
  );
}
