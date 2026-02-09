// src/App.jsx
import React, { useEffect, useMemo, useState, useCallback, useRef } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import axios from "axios";
import { Howl } from "howler";

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


export default function App() {
  const [pickerTrack, setPickerTrack] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const seekRef = useRef(0);
  const playQueueRef = useRef([]);
  const [upcomingQueue, setUpcomingQueue] = useState([]);
  const howlerRef = useRef(null);
  const [isPlayerExpanded, setIsPlayerExpanded] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [activeQueue, setActiveQueue] = useState("all");
  const [volume, setVolume] = useState(0.9);
  const [playbackRate, setPlaybackRate] = useState(1);


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


  const play = useCallback(() => {
    const audio = window._howlerRef?.();
    if (!audio) return;

    window._autoplayFlag = true;

    if (!audio.playing()) {
      audio.play();
    }
  }, []);


  const pause = useCallback(() => {
    const audio = window._howlerRef?.();
    if (!audio) return;

    audio.pause();
  }, []);


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

        if (autoplay) {
          window._autoplayFlag = true;
        }

        setCurrentIndex(idx);
        seekRef.current = resumeTime || 0;
      }
    },
    [playlist]
  );


  const buildNormalQueue = useCallback((startIndex) => {
    if (!currentQueue.length) return [];

    return currentQueue.slice(startIndex + 1);
  }, [currentQueue]);


  const playNext = useCallback(() => {
    if (!currentQueue.length) return;
    window._autoplayFlag = true;

    if (mode === "shuffle") {
      // 🟡 1. agar queue empty ho gayi → rebuild
      if (playQueueRef.current.length === 0) {
        const rebuilt = Array.from(
          { length: currentQueue.length },
          (_, i) => i
        )

        // shuffle
        for (let i = rebuilt.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [rebuilt[i], rebuilt[j]] = [rebuilt[j], rebuilt[i]];
        }

        playQueueRef.current = rebuilt;
        setUpcomingQueue(rebuilt.map(i => currentQueue[i]));
      }

      const nextIndex = playQueueRef.current.shift();
      if (nextIndex !== undefined) {
        setCurrentIndex(nextIndex);

        // update UI queue
        setUpcomingQueue(
          playQueueRef.current.map(i => currentQueue[i])
        );
      }
    } else {
      setCurrentIndex(prev => {
        const next = (prev + 1) % currentQueue.length;

        // ✅ NORMAL MODE QUEUE UPDATE
        setUpcomingQueue(buildNormalQueue(next));
        return next;
      });
    }

    seekRef.current = 0;
  }, [mode, currentQueue, buildNormalQueue]);


  const playFromUpcomingQueue = useCallback((clickedIndex) => {
    if (!upcomingQueue.length) return;

    window._autoplayFlag = true;

    const nextGlobalIndex = playQueueRef.current[clickedIndex];
    if (nextGlobalIndex == null) return;

    // 🔹 play clicked song
    setCurrentIndex(nextGlobalIndex);
    seekRef.current = 0;

    // 🔹 ONLY remove clicked song from queue
    playQueueRef.current = playQueueRef.current.filter(
      (_, i) => i !== clickedIndex
    );

    // 🔹 update UI queue
    setUpcomingQueue(
      playQueueRef.current.map(i => currentQueue[i])
    );

  }, [upcomingQueue, currentQueue]);


  const playPrev = useCallback(() => {
    if (!currentQueue.length) return;
    window._autoplayFlag = true;

    setCurrentIndex(prev =>
      (prev - 1 + currentQueue.length) % currentQueue.length
    );

    seekRef.current = 0;
  }, [currentQueue.length]);


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


  const handleAddToPlaylist = (track, playlistName) => {
    if (playlistName) {
      // ✅ Direct add (no picker)
      addToPlaylist(track, playlistName);
    } else {
      // ❓ Ask user
      setPickerTrack(track);
    }
  };


  const removeFromPlaylist = useCallback((trackId, playlistName = activePlaylist) => {
    setPlaylists(prev => ({
      ...prev,
      [playlistName]: prev[playlistName].filter(t => t.id !== trackId)
    }));
  }, [activePlaylist]);




  useEffect(() => {
    if (!currentTrack) return;

    // destroy old
    if (howlerRef.current) {
      howlerRef.current.unload();
    }

    const h = new Howl({
      src: [currentTrack.url],
      html5: true,
      volume: volume,
      rate: playbackRate, // 🔥 SPEED

      onplay: () => {
        setIsPlaying(true);
      },

      onpause: () => {
        setIsPlaying(false);
      },

      onstop: () => {
        setIsPlaying(false);
      },

      onend: () => {
        window._autoplayFlag = true;

        if (mode === "repeat-one") {
          howlerRef.current.seek(0);
          howlerRef.current.play();
          return;
        }

        handleEnded();
      }


    });


    howlerRef.current = h;
    window._howlerRef = () => h;

    if (seekRef.current > 0) {
      h.seek(seekRef.current);
    }

    h.once("load", () => {
      if (window._autoplayFlag) {
        h.play();
        window._autoplayFlag = false;
      }
    });



  }, [currentTrack?.id]);


  useEffect(() => {
    if (mode === "shuffle") return;
    if (currentIndex == null) return;

    setUpcomingQueue(buildNormalQueue(currentIndex));
  }, [currentIndex, mode, buildNormalQueue]);


  useEffect(() => {
    if (howlerRef.current) {
      howlerRef.current.rate(playbackRate);
    }
  }, [playbackRate]);



  useEffect(() => {
    if (mode !== "shuffle") return;
    if (!currentQueue.length) return;

    // 🔹 rebuild shuffle queue ONLY from currentQueue
    const rebuilt = Array.from(
      { length: currentQueue.length },
      (_, i) => i
    ).filter(i => i !== currentIndex);

    for (let i = rebuilt.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [rebuilt[i], rebuilt[j]] = [rebuilt[j], rebuilt[i]];
    }

    playQueueRef.current = rebuilt;
    setUpcomingQueue(rebuilt.map(i => currentQueue[i]));

  }, [currentQueue, mode]);


  useEffect(() => {
    if (isPlayerExpanded) {
      document.body.classList.add("fp-open");
    } else {
      document.body.classList.remove("fp-open");
    }
  }, [isPlayerExpanded]);


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


  useEffect(() => {
    console.log("👀 UPCOMING UI QUEUE:", upcomingQueue.map(s => s.title));
  }, [upcomingQueue]);


  useEffect(() => {
    if (!("mediaSession" in navigator)) return;

    navigator.mediaSession.setActionHandler("nexttrack", () => {
      playNext();
    });

    navigator.mediaSession.setActionHandler("previoustrack", () => {
      playPrev();
    });

    navigator.mediaSession.setActionHandler("play", () => {
      play();
    });

    navigator.mediaSession.setActionHandler("pause", () => {
      pause();
    });

  }, [playNext, playPrev, play, pause]);




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
                  onAddToPlaylist={handleAddToPlaylist}
                  onRemoveFromPlaylist={removeFromPlaylist}
                  playlist={playlist}
                  setActivePlaylist={setActivePlaylist}
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
              nextTrack={upcomingQueue[0]}
              playbackRate={playbackRate}
              setPlaybackRate={setPlaybackRate}
              queue={currentQueue}
              upcomingQueue={upcomingQueue}
              onPlayFromQueue={playFromUpcomingQueue}
              isPlaying={isPlaying}
              onPlay={play}
              onPause={pause}
              onNext={playNext}
              onPrev={playPrev}
              playlist={playlist}
              onAddToPlaylist={(track) => addToPlaylist(track, "Liked Songs")}
              onRemoveFromPlaylist={(id) => removeFromPlaylist(id, "Liked Songs")}
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

        {!isPlayerExpanded && (
          <aside className="sidebar">
            <div className="card-top">
              <h3>Now Playing</h3>
              <MusicPlayer
                track={currentTrack}
                isPlaying={isPlaying}
                volume={volume}
                setVolume={setVolume}
                onPlay={play}
                onPause={pause}
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
                <h3>
                  {activeQueue === "playlist"
                    ? `Playing: ${activePlaylist}`
                    : "Your Playlist"}
                </h3>

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
        )}
      </main>
    </div>
  );
}