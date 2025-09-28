import React, { useRef, useState, useLayoutEffect, useCallback } from "react";

/* ============ Spotify-style MarqueeText ============ */
/**
 * Props:
 * - text: string
 * - speed: px/sec (default 40)
 * - gap: px between copies (default 48)
 * - className: optional extra classes for the viewport
 */
export default function MarqueeText({ text, speed = 20, gap = 48, className = "" }) {
    const viewportRef = useRef(null);
    const trackRef = useRef(null);
    const singleRef = useRef(null);
    const [overflow, setOverflow] = useState(false);
    const [duration, setDuration] = useState(10);

    const measure = useCallback(() => {
        const viewport = viewportRef.current;
        const single = singleRef.current;
        if (!viewport || !single) return;

        const textW = Math.ceil(single.scrollWidth);
        const viewportW = Math.ceil(viewport.clientWidth);

        const willOverflow = textW > viewportW + 1;
        setOverflow(willOverflow);

        const dist = textW + gap;
        const dur = Math.max(8, dist / Math.max(10, speed));
        setDuration(dur);

        if (trackRef.current) {
            trackRef.current.style.setProperty("--marquee-distance", `${dist}px`);
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

        rAFMeasure();
        if (document.fonts && document.fonts.ready) {
            document.fonts.ready.then(rAFMeasure).catch(() => { });
        }

        if (typeof ResizeObserver !== "undefined") {
            roViewport = new ResizeObserver(rAFMeasure);
            roSingle = new ResizeObserver(rAFMeasure);
            if (viewportRef.current) roViewport.observe(viewportRef.current);
            if (singleRef.current) roSingle.observe(singleRef.current);
        } else {
            window.addEventListener("resize", rAFMeasure);
        }

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
                style={{ animationDuration: `${duration}s` }}
            >
                <span ref={singleRef} className="marquee-item">{text}</span>
                {overflow && (
                    <>
                        <span className="marquee-gap" aria-hidden="true" />
                        <span className="marquee-item" aria-hidden="true">{text}</span>
                    </>
                )}
            </div>
        </div>
    );
}
