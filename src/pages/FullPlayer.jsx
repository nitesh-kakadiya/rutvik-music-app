import React, { useCallback, useRef, useState, useEffect } from "react";
import {
    FaArrowLeft,
    FaStepBackward,
    FaStepForward,
    FaPlay,
    FaPause,
    FaHeart
} from "react-icons/fa";
import { motion } from "framer-motion";
import MarqueeText from "../components/MarqueeText";
import { useNavigate } from "react-router-dom";

export default function FullPlayer({
    track,
    onNext,
    onPrev,
    onPlay,
    playlist = [],
    onAddToPlaylist,
    onRemoveFromPlaylist,
    seek,
}) {
    const howlRef = useRef(null);
    const navigate = useNavigate();
    const [isPlaying, setIsPlaying] = useState(false);

    // Initialize Howler reference and isPlaying state
    useEffect(() => {
        const interval = setInterval(() => {
            if (window._howlerRef && typeof window._howlerRef === "function") {
                const h = window._howlerRef();
                howlRef.current = h;
                setIsPlaying(h?.playing() || false);
            }
        }, 200);

        return () => clearInterval(interval);
    }, []);


    // Play/pause toggle
    const togglePlay = useCallback(() => {
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

    // Click handler for play button
    const handlePlayClick = () => {
        const h = howlRef.current;

        if (!h) {
            // No howler instance → play fresh
            onPlay(track.id, true, seek);
            return;
        }

        if (h.playing()) {
            // already playing → just pause
            h.pause();
            setIsPlaying(false);
        } else {
            // paused → resume WITHOUT restarting
            h.play();
            setIsPlaying(true);
        }
    };



    if (!track) return <div className="fullplayer">No track playing</div>;

    const isFav = playlist.some(t => t.id === track.id);

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

            {/* Controls */}
            <div className="fp-controls">
                <button onClick={onPrev}>
                    <FaStepBackward size={30} />
                </button>

                <button className="fp-play" onClick={handlePlayClick}>
                    {isPlaying ? <FaPause size={32} /> : <FaPlay size={32} />}
                </button>

                <button onClick={onNext}>
                    <FaStepForward size={30} />
                </button>
            </div>

            {/* Favorite */}
            <button
                className="fp-fav"
                onClick={() => {
                    isFav
                        ? onRemoveFromPlaylist(track.id)
                        : onAddToPlaylist(track);
                }}
            >
                <FaHeart size={26} color={isFav ? "red" : "white"} />
            </button>
        </motion.div>
    );
}
