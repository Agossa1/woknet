'use client';

import {
    Play, Pause, Volume2, VolumeX, Settings,
    Maximize, Minimize, RotateCcw, FastForward
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface VideoPlayerProps {
    src: string;
    className?: string;
    autoPlayOnMount?: boolean;
    enableClickToPlay?: boolean;
}

export const VideoPlayer = ({
    src,
    className,
    autoPlayOnMount = false,
    enableClickToPlay = true,
}: VideoPlayerProps) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    const [isPlaying, setIsPlaying] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const [progress, setProgress] = useState(0);
    const [duration, setDuration] = useState(0);
    const [currentTime, setCurrentTime] = useState(0);
    const [showControls, setShowControls] = useState(true);
    const [playbackRate, setPlaybackRate] = useState(1);
    const [quality, setQuality] = useState('auto');
    const [showSettings, setShowSettings] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);

    // Timer for hiding controls
    const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const togglePlay = () => {
        if (!videoRef.current) return;
        if (isPlaying) {
            videoRef.current.pause();
        } else {
            videoRef.current.play();
        }
        setIsPlaying(!isPlaying);
    };

    const toggleMute = () => {
        if (!videoRef.current) return;
        videoRef.current.muted = !isMuted;
        setIsMuted(!isMuted);
    };

    const handleProgress = () => {
        if (!videoRef.current || !videoRef.current.duration) return;
        const currentProgress = (videoRef.current.currentTime / videoRef.current.duration) * 100;
        setProgress(isNaN(currentProgress) ? 0 : currentProgress);
        setCurrentTime(videoRef.current.currentTime);
    };

    const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!videoRef.current) return;
        const seekTime = (Number(e.target.value) / 100) * videoRef.current.duration;
        videoRef.current.currentTime = seekTime;
        setProgress(Number(e.target.value));
    };

    const changePlaybackRate = (rate: number) => {
        if (!videoRef.current) return;
        videoRef.current.playbackRate = rate;
        setPlaybackRate(rate);
        setShowSettings(false);
    };

    const toggleFullscreen = () => {
        if (!containerRef.current) return;
        if (!document.fullscreenElement) {
            containerRef.current.requestFullscreen();
            setIsFullscreen(true);
        } else {
            document.exitFullscreen();
            setIsFullscreen(false);
        }
    };

    const formatTime = (time: number) => {
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    };

    // Auto-hide controls
    const handleMouseMove = () => {
        setShowControls(true);
        if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
        controlsTimeoutRef.current = setTimeout(() => {
            if (isPlaying) setShowControls(false);
        }, 3000);
    };

    // Auto-play when requested (e.g. in post detail)
    useEffect(() => {
        if (!autoPlayOnMount || !videoRef.current) return;

        const video = videoRef.current;

        const playPromise = video.play();
        if (playPromise !== undefined) {
            playPromise
                .then(() => {
                    setIsPlaying(true);
                })
                .catch(() => {
                    // Autoplay blocked by browser, fail silently
                    setIsPlaying(false);
                });
        } else {
            setIsPlaying(true);
        }
    }, [autoPlayOnMount, src]);

    // Quality transformation (Simple logic for Cloudinary)
    const getTransformedUrl = (originalUrl: string, selectedQuality: string) => {
        if (!originalUrl.includes('cloudinary.com')) return originalUrl;

        let transformation = '';
        if (selectedQuality === '720p') transformation = 'w_1280,h_720,c_limit,q_auto:good/';
        else if (selectedQuality === '480p') transformation = 'w_854,h_480,c_limit,q_auto:eco/';
        else return originalUrl;

        return originalUrl.replace('/upload/', `/upload/${transformation}`);
    };

    const videoSrc = getTransformedUrl(src, quality);

    return (
        <div
            ref={containerRef}
            className={`relative group bg-black overflow-hidden shadow-2xl ${className}`}
            onMouseMove={handleMouseMove}
            onMouseLeave={() => isPlaying && setShowControls(false)}
        >
            <video
                ref={videoRef}
                src={videoSrc}
                className="w-full h-full cursor-pointer object-contain bg-black"
                onTimeUpdate={handleProgress}
                onLoadedMetadata={() => setDuration(videoRef.current?.duration || 0)}
                onClick={enableClickToPlay ? togglePlay : undefined}
                onContextMenu={(e) => e.preventDefault()}
                playsInline
                disablePictureInPicture
            />

            {/* Glassmorphism Controls Overlay */}
            <div className={`absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40 transition-opacity duration-500 flex flex-col justify-between p-4 ${showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>

                {/* Header info (Optional) */}
                <div className="flex justify-end pt-2">
                    <button className="text-white/70 hover:text-white transition-colors">
                        {/* More options could go here */}
                    </button>
                </div>

                <div className="flex flex-col gap-4">
                    {/* Progress Bar */}
                    <div className="flex items-center gap-3 group/progress">
                        <span className="text-[10px] font-bold text-white/80 tabular-nums w-8">
                            {formatTime(currentTime)}
                        </span>
                        <input
                            type="range"
                            min="0"
                            max="100"
                            value={progress}
                            onChange={handleSeek}
                            className="flex-1 h-1 bg-white/20 rounded-full appearance-none cursor-pointer accent-blue-500 hover:h-1.5 transition-all"
                        />
                        <span className="text-[10px] font-bold text-white/80 tabular-nums w-8">
                            {formatTime(duration)}
                        </span>
                    </div>

                    {/* Bottom Controls */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-6">
                            <button onClick={togglePlay} className="text-white hover:scale-110 transition-transform active:scale-95">
                                {isPlaying ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" />}
                            </button>

                            <div className="flex items-center gap-2 group/volume">
                                <button onClick={toggleMute} className="text-white hover:text-blue-400 transition-colors">
                                    {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
                                </button>
                                {/* Mini volume slider on hover could be nice */}
                            </div>
                        </div>

                        <div className="flex items-center gap-6 relative">
                            {/* Settings / Quality / Speed */}
                            <button
                                onClick={() => setShowSettings(!showSettings)}
                                className={`text-white transition-all hover:rotate-45 ${showSettings ? 'text-blue-400 rotate-45' : ''}`}
                            >
                                <Settings size={20} />
                            </button>

                            {/* Settings Menu */}
                            {showSettings && (
                                <div className="absolute bottom-12 right-0 bg-black/90 backdrop-blur-xl border border-white/10 p-3 rounded-2xl w-48 shadow-2xl animate-in slide-in-from-bottom-2 duration-200 z-50">
                                    <div className="space-y-4">
                                        <div>
                                            <p className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-2 px-1">Vitesse</p>
                                            <div className="grid grid-cols-4 gap-1">
                                                {[0.5, 1, 1.5, 2].map(rate => (
                                                    <button
                                                        key={rate}
                                                        onClick={() => changePlaybackRate(rate)}
                                                        className={`text-[10px] font-bold py-1 rounded-md transition ${playbackRate === rate ? 'bg-blue-600 text-white' : 'text-white/60 hover:bg-white/10'}`}
                                                    >
                                                        {rate}x
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="border-t border-white/5 pt-3">
                                            <p className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-2 px-1">Qualité</p>
                                            <div className="flex flex-col gap-1">
                                                {['auto', '720p', '480p'].map(q => (
                                                    <button
                                                        key={q}
                                                        onClick={() => { setQuality(q); setShowSettings(false); }}
                                                        className={`text-left text-[11px] font-bold py-1.5 px-2 rounded-md transition flex justify-between items-center ${quality === q ? 'bg-blue-600/20 text-blue-400' : 'text-white/60 hover:bg-white/10'}`}
                                                    >
                                                        <span className="capitalize">{q}</span>
                                                        {quality === q && <div className="w-1.5 h-1.5 rounded-full bg-blue-400" />}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <button onClick={toggleFullscreen} className="text-white hover:scale-110 transition-transform">
                                {isFullscreen ? <Minimize size={20} /> : <Maximize size={20} />}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Play Overlay (Big button when paused) */}
            {!isPlaying && enableClickToPlay && (
                <div
                    onClick={togglePlay}
                    className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/40 transition-colors cursor-pointer"
                >
                    <div className="w-16 h-16 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center border border-white/20 scale-90 group-hover:scale-100 transition-transform">
                        <Play size={32} className="text-white ml-1 fill-current" />
                    </div>
                </div>
            )}
        </div>
    );
};
