// src/components/MusicPlayer.jsx
import React, {
    useEffect,
    useLayoutEffect,
    useRef,
    useState,
    useCallback,
} from "react";
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

/* ============ Small utilities ============ */
function fmt(sec) {
    if (!sec && sec !== 0) return "0:00";
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
}

/* ============ Spotify-style MarqueeText ============ */
/**
 * Props:
 * - text: string
 * - speed: px/sec (default 40)
 * - gap: px between copies (default 48)
 * - className: optional extra classes for the viewport
 */
function MarqueeText({ text, speed = 40, gap = 48, className = "" }) {
    const viewportRef = useRef(null);   // visible window
    const trackRef = useRef(null);      // moving track
    const singleRef = useRef(null);     // single text (for measuring)
    const [overflow, setOverflow] = useState(false);
    const [duration, setDuration] = useState(10); // seconds
    const [distance, setDistance] = useState(0);  // px

    const measure = useCallback(() => {
        const viewport = viewportRef.current;
        const single = singleRef.current;
        if (!viewport || !single) return;

        // measure the natural width of a single copy of the text
        const textW = Math.ceil(single.scrollWidth);
        const viewportW = Math.ceil(viewport.clientWidth);

        const willOverflow = textW > viewportW + 1; // +1 to avoid float jitter
        setOverflow(willOverflow);

        // distance to shift in one loop = text width + gap
        const dist = textW + gap;
        setDistance(dist);

        // animation duration based on speed
        const dur = Math.max(8, dist / Math.max(10, speed)); // clamp min duration a bit
        setDuration(dur);

        // push CSS vars for the track
        if (trackRef.current) {
            trackRef.current.style.setProperty("--marquee-distance", `${dist}px`);
            trackRef.current.style.setProperty("--marquee-gap", `${gap}px`);
            trackRef.current.style.setProperty("--marquee-duration", `${dur}s`);
        }
    }, [gap, speed]);

    useLayoutEffect(() => {
        let roViewport, roSingle;
        let raf;
        const rAFMeasure = () => {
            cancelAnimationFrame(raf);
            raf = requestAnimationFrame(measure);
        };

        // first measure after layout
        rAFMeasure();

        // fonts can change width → re-measure after fonts load
        if (document.fonts && document.fonts.ready) {
            document.fonts.ready.then(rAFMeasure).catch(() => { });
        }

        // resize observers (viewport + text)
        if (typeof ResizeObserver !== "undefined") {
            roViewport = new ResizeObserver(rAFMeasure);
            roSingle = new ResizeObserver(rAFMeasure);
            if (viewportRef.current) roViewport.observe(viewportRef.current);
            if (singleRef.current) roSingle.observe(singleRef.current);
        } else {
            // window resize fallback
            window.addEventListener("resize", rAFMeasure);
        }

        // small timeout to catch late layout shifts
        const t1 = setTimeout(rAFMeasure, 0);
        const t2 = setTimeout(rAFMeasure, 300);

        return () => {
            cancelAnimationFrame(raf);
            clearTimeout(t1);
            clearTimeout(t2);
            if (roViewport) roViewport.disconnect();
            if (roSingle) roSingle.disconnect();
            window.removeEventListener("resize", rAFMeasure);
        };
    }, [text, measure]);

    return (
        <div className={`marquee-viewport ${className}`} ref={viewportRef}>
            <div
                ref={trackRef}
                className={`marquee-track ${overflow ? "is-animating" : ""}`}
                style={{
                    // safety: keep values even if CSS vars not supported
                    animationDuration: `${duration}s`,
                }}
            >
                {/* Single copy for measurement and display */}
                <span ref={singleRef} className="marquee-item">
                    {text}
                </span>

                {/* Only render the duplicate when overflowing */}
                {overflow && (
                    <>
                        <span className="marquee-gap" aria-hidden="true" />
                        <span className="marquee-item" aria-hidden="true">
                            {text}
                        </span>
                    </>
                )}
            </div>
        </div>
    );
}

/* ============ MusicPlayer ============ */
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
        // eslint-disable-next-line react-hooks/exhaustive-deps
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
        window._howlerRef = () => h;

        h.once("load", () => {
            let startPos = 0;
            let shouldPlay = false;

            if (resumeSeek > 0 && resumeSeek < h.duration()) {
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
                setIsPlaying(false);
            }
        });

        const timer = setInterval(() => {
            if (!h) return;
            const p = h.seek() || 0;
            setPos(typeof p === "number" ? p : 0);
            if (!dur) setDur(h.duration() || 0);
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
            {/* Title */}
            <MarqueeText text={track?.title || ""} speed={40} gap={48} />

            {/* Artist */}
            <MarqueeText text={track?.artist || ""} speed={38} gap={36} />

            {/* Controls */}
            <div className="controls">
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

                <button className="btn" onClick={onPrev}>
                    <FaStepBackward />
                </button>
                <button className="btn primary" onClick={toggle}>
                    {isPlaying ? <FaPause /> : <FaPlay />}
                </button>
                <button className="btn" onClick={onNext}>
                    <FaStepForward />
                </button>

                <button
                    className={`btn ghost ${isFavorite ? "playlist-remove" : ""}`}
                    title={isFavorite ? "Remove from Playlist" : "Add to Playlist"}
                    onClick={handleFavoriteClick}
                >
                    <FaHeart />
                </button>
            </div>

            {/* Time bar */}
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
