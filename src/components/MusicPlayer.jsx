// src/components/MusicPlayer.jsx
import React, {
    useEffect,
    useRef,
    useState,
} from "react";
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
import MarqueeText from "./MarqueeText";

/* ============ Small utilities ============ */
function fmt(sec) {
    if (!sec && sec !== 0) return "0:00";
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
}

/* ============ MusicPlayer ============ */
export default function MusicPlayer({
    track,
    isPlaying,
    volume,
    setVolume,
    onPlay,
    onPause,
    onExpand,
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
    const modeRef = useRef(mode);
    const [pos, setPos] = useState(0);
    const [dur, setDur] = useState(0);


    // keep modeRef updated
    useEffect(() => {
        modeRef.current = mode;
        bindOnEnd();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [mode]);

    const bindOnEnd = () => {
        const h = window._howlerRef?.();
        if (!h) return;

        h.off("end");
        h.on("end", () => {
            const currentMode = modeRef.current;

            if (currentMode === "repeat-one") {
                h.seek(0);
                h.play();
                return;
            }

            if (currentMode === "repeat-all" || currentMode === "shuffle") {
                window._autoplayFlag = true;
            }

            onEnded?.();
        });
    };


    useEffect(() => {
        const h = window._howlerRef?.();
        if (h) h.volume(volume);

    }, [volume]);

    useEffect(() => {
        const h = window._howlerRef?.();
        if (!h) return;


        if (!isPlaying && h.playing()) {
            h.pause();
        }


    }, [isPlaying]);

    useEffect(() => {
        const interval = setInterval(() => {
            const h = window._howlerRef?.();
            if (!h || !h.playing()) return;

            const p = h.seek();
            if (typeof p === "number") {
                setPos(p);
                setDur(h.duration() || 0);
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

            navigator.mediaSession.setActionHandler("play", () => onPlay?.());
            navigator.mediaSession.setActionHandler("pause", () => onPause?.());
            navigator.mediaSession.setActionHandler("nexttrack", () => onNext?.());
            navigator.mediaSession.setActionHandler("previoustrack", () => onPrev?.());
        }
    }, [track, onNext, onPrev]);

    if (!track) return <div className="muted">No track selected.</div>;
    const progress = dur > 0 ? (pos / dur) * 100 : 0;

    const cycleTo = () => {
        const cycleOrder = ["normal", "repeat-one", "shuffle", "repeat-all"];
        const next = cycleOrder[(cycleOrder.indexOf(mode) + 1) % cycleOrder.length];
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

    const isFavorite = playlist?.some((t) => t.id === track.id);
    const handleFavoriteClick = () => {
        if (!track) return;
        if (isFavorite) onRemoveFromPlaylist?.(track.id);
        else onAddToPlaylist?.(track);
    };

    return (
        <div className="player">
            <div
                className="nowplaying"
                onClick={(e) => {
                    if (window.innerWidth >= 961) return; // only mobile
                    // If the click is NOT on a button
                    if (!e.target.closest("button")) {
                        onExpand?.();
                    }
                }}
            >

                <div className="cover-wrapper">
                    {track.cover ? (
                        <img src={track.cover} alt={track.title} className="cover-img" />
                    ) : (
                        <div className="cover-fallback">
                            {track.title?.[0]?.toUpperCase() || "?"}
                        </div>
                    )}

                </div>

                <div className="track-info">
                    <MarqueeText text={track?.title || ""} speed={20} gap={48} />
                    <MarqueeText className="artist-text" text={track?.artist || ""} speed={20} gap={48} />
                </div>

                {/* Right side actions (only mobile visible) */}
                <div className="nowplaying-actions">
                    <button
                        className={`btn like-btn ${isFavorite ? "playlist-remove" : ""}`}
                        title={isFavorite ? "Remove from Playlist" : "Add to Playlist"}
                        onClick={(e) => {
                            e.stopPropagation(); // 🔹 prevent parent click
                            handleFavoriteClick();
                        }}
                    >
                        <FaHeart color={isFavorite ? "red" : "white"} />
                    </button>

                    <button
                        className="btn play-pause-btn"
                        onClick={(e) => {
                            e.stopPropagation();
                            isPlaying ? onPause?.() : onPlay?.();
                        }}
                    >
                        {isPlaying ? <FaPause /> : <FaPlay />}
                    </button>

                </div>
            </div>


            {/* Time bar */}
            <div className="fp-time-slider">
                <div className="fp-time-bar-mini" onClick={onSeek}>
                    <div
                        className="fp-time-fill"
                        style={{ width: `${progress}%` }}
                    />
                </div>
            </div>


            {/* Controls */}
            <div className="mp-controls">
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

                <button className="mp-next" onClick={onPrev}>
                    <FaStepBackward size={25} />
                </button>
                <button className="mp-play" onClick={isPlaying ? onPause : onPlay}>
                    {isPlaying ? <FaPause size={18} /> : <FaPlay size={18} />}
                </button>
                <button className="mp-next" onClick={onNext}>
                    <FaStepForward size={25} />
                </button>

                <button
                    className={`btn like-btn ${isFavorite ? "playlist-remove" : ""}`}
                    title={isFavorite ? "Remove from Playlist" : "Add to Playlist"}
                    onClick={handleFavoriteClick}
                >
                    <FaHeart color={isFavorite ? "red" : "white"} />
                </button>
            </div>

            {/* Time bar */}
            <div className="fp-time-slider">
                <div className="fp-time-bar" onClick={onSeek}>
                    <div
                        className="fp-time-fill"
                        style={{ width: `${(pos / dur) * 100}%` }}
                    />
                </div>
            </div>
            <div className="fp-time mini">
                <span>{fmt(pos)}</span>
                <span>{fmt(dur)}</span>
            </div>

            {/* Volume */}
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
