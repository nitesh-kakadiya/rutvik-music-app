import React, { useCallback, useRef, useState, useEffect } from "react";
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
    FaSync
} from "react-icons/fa";
import { motion } from "framer-motion";
import MarqueeText from "../components/MarqueeText";
import { useNavigate } from "react-router-dom";

function fmt(sec) {
    if (!sec && sec !== 0) return "0:00";
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
}

export default function FullPlayer({
    track,
    onNext,
    onPrev,
    onPlay,
    playlist = [],
    onAddToPlaylist,
    onRemoveFromPlaylist,
    mode,
    setMode,
}) {
    const howlRef = useRef(null);
    const navigate = useNavigate();

    const [isPlaying, setIsPlaying] = useState(false);
    const [pos, setPos] = useState(0);
    const [dur, setDur] = useState(0);

    /* ============ Sync Howler Instance ============ */
    useEffect(() => {
        const interval = setInterval(() => {
            if (window._howlerRef && typeof window._howlerRef === "function") {
                const h = window._howlerRef();
                howlRef.current = h;

                if (h) {
                    setIsPlaying(h.playing());
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
        const h = howlRef.current;
        if (!h || !dur) return;

        const rect = e.target.getBoundingClientRect();
        const percent = (e.clientX - rect.left) / rect.width;
        const newTime = Math.max(0, Math.min(1, percent)) * dur;

        h.seek(newTime);
        setPos(newTime);
    };

    /* ============ Play / Pause ============ */
    const handlePlayClick = () => {
        const h = howlRef.current;

        if (!h) {
            onPlay(track.id, true);
            return;
        }

        if (h.playing()) {
            h.pause();
            setIsPlaying(false);
        } else {
            h.play();
            setIsPlaying(true);
        }
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
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
        >
            {/* Back Button */}
            <button className="fp-back" onClick={() => navigate(-1)}>
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

            {/* Title & Artist */}
            <div className="fp-info">
                <MarqueeText text={track.title} speed={20} gap={48} />
                <MarqueeText text={track.artist} speed={20} gap={48} />
            </div>

            {/* ========= Spotify-Style Time Slider ========= */}
            <div className="fp-time-slider">
                <div className="fp-time-bar" onClick={onSeek}>
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

                <button className="fp-play" onClick={handlePlayClick}>
                    {isPlaying ? <FaPause size={22} /> : <FaPlay size={22} />}
                </button>

                <button className="fp-next" onClick={onNext}>
                    <FaStepForward size={35} />
                </button>

                {/* Favorite */}
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
        </motion.div>
    );
}
