// src/components/MusicPlayer.jsx
import React, { useEffect, useRef, useState, useCallback } from "react";
import { Howl } from "howler";
import {
    FaStepBackward,
    FaStepForward,
    FaPlay,
    FaPause,
    FaVolumeUp,
    FaRedo,
    FaRandom,
    FaStop,
    FaSync,
    FaHeart,
} from "react-icons/fa";

function fmt(sec) {
    if (!sec && sec !== 0) return "0:00";
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
}

export default function MusicPlayer({
    track,
    onNext,
    onPrev,
    onEnded,
    mode,
    setMode,
    onAddToPlaylist,
    onRemoveFromPlaylist,
    playlist,
    resumeSeek = 0,
}) {
    const howlRef = useRef(null);
    const modeRef = useRef(mode);
    const [isPlaying, setIsPlaying] = useState(false);
    const [pos, setPos] = useState(0);
    const [dur, setDur] = useState(0);
    const [volume, setVolume] = useState(0.9);

    // keep modeRef updated
    useEffect(() => {
        modeRef.current = mode;
        bindOnEnd();
    }, [mode]);

    // Load new track
    useEffect(() => {
        if (howlRef.current) {
            howlRef.current.unload();
            howlRef.current = null;
        }
        setIsPlaying(false);
        setPos(0);
        setDur(0);

        if (!track) return;

        const h = new Howl({
            src: [track.url],
            html5: true,
            volume,
            onload: () => setDur(h.duration() || 0),
        });

        howlRef.current = h;
        bindOnEnd();
        window._howlerRef = () => h; // expose globally for App.jsx

        const saved = JSON.parse(localStorage.getItem("last_played") || "null");
        h.once("load", () => {
            let startPos = 0;
            let shouldPlay = false;

            if (saved && saved.id === track.id) {
                if (typeof saved.seek === "number" && saved.seek < h.duration()) {
                    startPos = saved.seek;
                }
                shouldPlay = saved.isPlaying; // ✅ respect paused state
            } else if (resumeSeek > 0 && resumeSeek < h.duration()) {
                startPos = resumeSeek;
                shouldPlay = true;
            }

            if (startPos > 0) {
                h.seek(startPos);
                setPos(startPos);
            }
            if (shouldPlay || window._autoplayFlag) {
                h.play();
                setIsPlaying(true);
                window._autoplayFlag = false;
            } else {
                setIsPlaying(false); // paused resume
            }
        });

        const timer = setInterval(() => {
            if (!h) return;
            const p = h.seek() || 0;
            setPos(typeof p === "number" ? p : 0);
            if (!dur) setDur(h.duration() || 0);

            localStorage.setItem(
                "last_played",
                JSON.stringify({
                    id: track.id,
                    seek: p,
                    isPlaying: h.playing(),
                })
            );
        }, 1000);

        return () => {
            clearInterval(timer);
            if (howlRef.current) {
                howlRef.current.unload();
                howlRef.current = null;
            }
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [track?.id]);

    const bindOnEnd = () => {
        const h = howlRef.current;
        if (!h) return;
        h.off("end");
        h.on("end", () => {
            const currentMode = modeRef.current;
            if (currentMode === "repeat-one") {
                h.seek(0);
                h.play();
                setIsPlaying(true);
                return;
            }
            setIsPlaying(false);
            if (currentMode === "repeat-all" || currentMode === "shuffle") {
                window._autoplayFlag = true;
            }
            onEnded?.();
        });
    };

    useEffect(() => {
        if (howlRef.current) howlRef.current.volume(volume);
    }, [volume]);

    const toggle = useCallback(() => {
        const h = howlRef.current;
        if (!h) return;
        if (h.playing()) {
            h.pause();
            setIsPlaying(false);
        } else {
            h.play();
            setIsPlaying(true);
        }
    }, []);

    const seekTo = useCallback(
        (fraction) => {
            const h = howlRef.current;
            if (!h || !dur) return;
            const t = Math.max(0, Math.min(1, fraction)) * dur;
            h.seek(t);
            setPos(t);
        },
        [dur]
    );

    // 🎧 Media Session API
    useEffect(() => {
        if ("mediaSession" in navigator && track) {
            navigator.mediaSession.metadata = new window.MediaMetadata({
                title: track.title,
                artist: track.artist,
                album: "My Music App",
                artwork: [
                    { src: "/logo192.png", sizes: "192x192", type: "image/png" },
                    { src: "/logo512.png", sizes: "512x512", type: "image/png" },
                ],
            });

            navigator.mediaSession.setActionHandler("play", () => toggle());
            navigator.mediaSession.setActionHandler("pause", () => toggle());
            navigator.mediaSession.setActionHandler("nexttrack", () => onNext?.());
            navigator.mediaSession.setActionHandler("previoustrack", () => onPrev?.());
        }
    }, [track, toggle, onNext, onPrev]);

    if (!track) return <div className="muted">No track selected.</div>;
    const progress = dur ? pos / dur : 0;

    const cycleTo = () => {
        const cycleOrder = ["normal", "repeat-one", "shuffle", "repeat-all"];
        const next = cycleOrder[(cycleOrder.indexOf(mode) + 1) % cycleOrder.length];
        setMode(next);
        // ✅ Save in localStorage
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

    const isFavorite = playlist?.some((t) => t.id === track.id);
    const handleFavoriteClick = () => {
        if (!track) return;
        if (isFavorite) {
            onRemoveFromPlaylist?.(track.id);
        } else {
            onAddToPlaylist?.(track);
        }
    };

    return (
        <div className="player">
            <div className="row between">
                <div>
                    <div className="title">{track.title}</div>
                    <div className="artist muted">{track.artist}</div>
                </div>
                <div className="controls">
                    <button className="btn" onClick={onPrev}><FaStepBackward /></button>
                    <button className="btn primary" onClick={toggle}>
                        {isPlaying ? <FaPause /> : <FaPlay />}
                    </button>
                    <button className="btn" onClick={onNext}><FaStepForward /></button>

                    {/* Mode button with dynamic class */}
                    <button
                        className={`btn ghost mode-${mode}`}
                        onClick={cycleTo}
                        title={modeTitle}
                    >
                        {mode === "normal" && <FaStop />}
                        {mode === "repeat-one" && (
                            <>
                                <FaRedo /> <span style={{ fontSize: 12, marginLeft: 4 }}>1</span>
                            </>
                        )}
                        {mode === "shuffle" && <FaRandom />}
                        {mode === "repeat-all" && <FaSync />}
                    </button>

                    {/* Playlist (heart) button */}
                    <button
                        className={`btn ghost ${isFavorite ? "playlist-remove" : ""}`}
                        title={isFavorite ? "Remove from Playlist" : "Add to Playlist"}
                        onClick={handleFavoriteClick}
                    >
                        <FaHeart />
                    </button>
                </div>
            </div>

            <div className="time">
                <span>{fmt(pos)}</span>
                <div
                    className="bar"
                    onClick={(e) => {
                        const r = e.currentTarget.getBoundingClientRect();
                        seekTo((e.clientX - r.left) / r.width);
                    }}
                >
                    <div className="bar-fill" style={{ width: `${progress * 100}%` }} />
                </div>
                <span>{fmt(dur)}</span>
            </div>

            <div className="volume">
                <FaVolumeUp style={{ marginRight: "8px" }} />
                <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={volume}
                    onChange={(e) => setVolume(parseFloat(e.target.value))}
                />
            </div>
        </div>
    );
}
