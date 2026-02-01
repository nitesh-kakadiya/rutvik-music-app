import React, { useRef, useState, useEffect } from "react";
import {
    FaArrowLeft,
    FaStepBackward,
    FaStepForward,
    FaPlay,
    FaPause,
    FaHeart,
    FaRedo,
    FaRandom,
    FaStop,
    FaSync,
    FaList
} from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import MarqueeText from "../components/MarqueeText";
import { FaTimes } from "react-icons/fa";



function fmt(sec) {
    if (!sec && sec !== 0) return "0:00";
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
}

export default function FullPlayer({
    isOpen,
    nextTrack,
    onCollapse,
    track,
    onPlayFromQueue,
    upcomingQueue = [],
    isPlaying,
    onPlay,
    onPause,
    onNext,
    onPrev,
    playlist = [],
    onAddToPlaylist,
    onRemoveFromPlaylist,
    mode,
    setMode,
}) {

    const [pos, setPos] = useState(0);
    const [dur, setDur] = useState(0);
    const [showQueue, setShowQueue] = useState(false);



    /* ============ Sync Howler Instance ============ */
    useEffect(() => {
        const interval = setInterval(() => {
            if (window._howlerRef && typeof window._howlerRef === "function") {
                const h = window._howlerRef();
                window._howlerRef?.()

                if (h) {
                    setDur(h.duration() || 0);
                    const p = h.seek() || 0;
                    setPos(typeof p === "number" ? p : 0);
                }
            }
        }, 300);

        return () => clearInterval(interval);
    }, []);

    /* ============ Seek Handling ============ */
    const onSeek = (e) => {
        const h = window._howlerRef?.();
        if (!h || !dur) return;

        const rect = e.currentTarget.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const percent = clickX / rect.width;

        const newTime = Math.max(0, Math.min(1, percent)) * dur;

        h.seek(newTime);
        setPos(newTime);
    };


    /* ============ Loop / Shuffle Cycle ============ */
    const cycleTo = () => {
        const order = ["normal", "repeat-one", "shuffle", "repeat-all"];
        const next = order[(order.indexOf(mode) + 1) % order.length];
        setMode(next);
        localStorage.setItem("last_mode", next);
    };

    const modeTitle =
        mode === "normal"
            ? "Normal"
            : mode === "repeat-one"
                ? "Repeat One"
                : mode === "shuffle"
                    ? "Shuffle"
                    : "Repeat All";

    /* ============ Favorites ============ */
    const isFavorite = playlist.some((t) => t.id === track.id);

    if (!track) return <div className="fullplayer">No track playing</div>;



    return (
        <motion.div
            className="fullplayer"
            initial={{ y: "100%" }}
            animate={{ y: isOpen ? 0 : "100%" }}
            transition={{ type: "spring", damping: 30 }}
            style={{ pointerEvents: isOpen ? "auto" : "none" }}
        >
            {/* Back Button */}
            <button className="fp-back" onClick={onCollapse}>
                <FaArrowLeft size={24} />
            </button>

            {/* Big Cover */}
            <div className="fp-cover">
                {track.cover ? (
                    <img src={track.cover} alt={track.title} />
                ) : (
                    <div className="fp-fallback">{track.title[0]}</div>
                )}
            </div>
            <div className="fp-title-row">
                {/* Title & Artist */}
                <div className="fp-info">
                    <MarqueeText text={track.title} speed={20} gap={48} />
                    <MarqueeText text={track.artist} speed={20} gap={48} />
                </div>
                <div>
                    <button
                        className="fp-fav"
                        onClick={() =>
                            isFavorite
                                ? onRemoveFromPlaylist(track.id)
                                : onAddToPlaylist(track)
                        }
                    >
                        <FaHeart size={25} color={isFavorite ? "red" : "white"} />
                    </button>
                </div>
            </div>

            {/* ========= Spotify-Style Time Slider ========= */}
            <div className="fp-time-slider">
                <div style={{ height: "4px", marginTop: "7px" }} className="fp-time-bar-mini" onClick={onSeek}>
                    <div
                        className="fp-time-fill"
                        style={{ width: `${(pos / dur) * 100}%` }}
                    />
                </div>
            </div>
            <div className="fp-time">
                <span>{fmt(pos)}</span>
                <span>{fmt(dur)}</span>
            </div>

            {/* Controls */}
            <div className="fp-controls">
                {/* mode toggle */}
                <button
                    className={`btn ghost mode-${mode}`}
                    onClick={cycleTo}
                    title={modeTitle}
                >
                    {mode === "normal" && <FaStop />}
                    {mode === "repeat-one" && (
                        <>
                            <FaRedo /> <span style={{ fontSize: 12 }}>1</span>
                        </>
                    )}
                    {mode === "shuffle" && <FaRandom />}
                    {mode === "repeat-all" && <FaSync />}
                </button>

                <button className="fp-next" onClick={onPrev}>
                    <FaStepBackward size={35} />
                </button>

                <button className="fp-play" onClick={isPlaying ? onPause : onPlay}>
                    {isPlaying ? <FaPause size={22} /> : <FaPlay size={22} />}
                </button>

                <button className="fp-next" onClick={onNext}>
                    <FaStepForward size={35} />
                </button>

                <button
                    className="fp-queue-btn"
                    onClick={() => setShowQueue(v => !v)}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24"><path fill="none" stroke="white" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 0 1 0 3.75H5.625a1.875 1.875 0 0 1 0-3.75" /></svg>
                </button>
            </div>

            <div className="fp-preview">
                {/* 🎶 NEXT IN QUEUE (Display only) */}
                {nextTrack && (
                    <div className="fp-next-preview">
                        <div className="next-label">Next</div>
                        <div className="next-title">{nextTrack.title}</div>
                        <div className="next-artist">{nextTrack.artist}</div>
                    </div>
                )}
            </div>

            <AnimatePresence>
                {showQueue && (
                    <>
                        {/* overlay */}
                        <motion.div
                            className="fp-queue-overlay"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowQueue(false)}
                        />

                        {/* queue panel */}
                        <motion.div
                            className="fp-queue-panel"
                            initial={{ y: 60, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: 60, opacity: 0 }}
                            transition={{ duration: 0.25 }}
                        >
                            <div className="fp-queue-header">
                                <div className="fp-queue-title">Next in Queue</div>

                                <button
                                    className="fp-queue-close"
                                    onClick={() => setShowQueue(false)}
                                >
                                    <FaTimes size={18} />
                                </button>
                            </div>


                            {upcomingQueue.length === 0 && (
                                <div className="fp-queue-empty">No upcoming songs</div>
                            )}

                            {upcomingQueue.map((song, i) => (
                                <div key={song.id} className="fp-queue-item" onClick={() => onPlayFromQueue(i)} >
                                    <div className="fp-queue-index">{i + 1}</div>
                                    <div className="fp-queue-info">
                                        <div className="fp-queue-name">{song.title}</div>
                                        <div className="fp-queue-artist">{song.artist}</div>
                                    </div>
                                </div>
                            ))}

                        </motion.div>
                    </>
                )}
            </AnimatePresence>

        </motion.div>
    );
}
