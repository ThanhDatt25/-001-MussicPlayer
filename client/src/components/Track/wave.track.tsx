'use client'

import { RefObject, useCallback, useEffect, useMemo, useRef, useState } from "react";
import WaveSurfer, { WaveSurferOptions } from "wavesurfer.js";
import { createRoot } from 'react-dom/client'
import { useWavesurfer } from '@wavesurfer/react';
import './wave.scss'
import { calLeft } from "@/utils/utils";
import { useTrackContext } from "@/lib/track.wrapper";

import { useSession } from "next-auth/react";
import { sendRequest } from "@/utils/api";
import { useRouter } from "next/navigation";
import Image from 'next/image'
import LikeTrack from "./like.track";
import CommentTrack from "./comment.track";
import { Pause } from 'lucide-react';
import { Play } from 'lucide-react';
interface IProps {
    id: string;
    track: ITrack;
    comments: IComment[];
    isFollow: boolean;
}

const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const secondsRemainder = Math.round(seconds) % 60
    const paddedSeconds = `0${secondsRemainder}`.slice(-2)
    return `${minutes}:${paddedSeconds}`
}


const WaveTrack = (props: IProps) => {
    const router = useRouter();
    const { track, id, comments } = props;
    const containerRef = useRef<HTMLInputElement>(null);
    const timeRef = useRef<HTMLInputElement>(null);
    const durationRef = useRef<HTMLInputElement>(null);
    const hoverRef = useRef<HTMLInputElement>(null);
    const { currentTrack, setCurrentTrack } = useTrackContext() as ITrackContext;
    const [isPlaying, setIsPlaying] = useState<boolean>(false);
    const { data: session } = useSession();
    const [firstTimeOnPage, setFirstTimeOnPage] = useState<boolean>(true);
    const [durationTrack, setDurationTrack] = useState<number>(0);

    const options: Omit<WaveSurferOptions, 'container'> & { container: RefObject<HTMLDivElement> } = useMemo(() => {
        if (typeof document === 'undefined') {
            return {
                container: containerRef,
                height: 0,
                waveColor: "",
                progressColor: "",
                url: '',
                barWidth: 0,
            };
        }

        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d')!;

        // Define the waveform gradient
        const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height * 1.35);
        gradient.addColorStop(0, '#656666'); // Top color
        gradient.addColorStop((canvas.height * 0.7) / canvas.height, '#656666'); // Top color
        gradient.addColorStop((canvas.height * 0.7 + 1) / canvas.height, '#ffffff'); // White line
        gradient.addColorStop((canvas.height * 0.7 + 2) / canvas.height, '#ffffff'); // White line
        gradient.addColorStop((canvas.height * 0.7 + 3) / canvas.height, '#B1B1B1'); // Bottom color
        gradient.addColorStop(1, '#B1B1B1'); // Bottom color

        // Define the progress gradient
        const progressGradient = ctx.createLinearGradient(0, 0, 0, canvas.height * 1.35);
        progressGradient.addColorStop(0, '#EE772F'); // Top color
        progressGradient.addColorStop((canvas.height * 0.7) / canvas.height, '#EB4926'); // Top color
        progressGradient.addColorStop((canvas.height * 0.7 + 1) / canvas.height, '#ffffff'); // White line
        progressGradient.addColorStop((canvas.height * 0.7 + 2) / canvas.height, '#ffffff'); // White line
        progressGradient.addColorStop((canvas.height * 0.7 + 3) / canvas.height, '#F6B094'); // Bottom color
        progressGradient.addColorStop(1, '#F6B094'); // Bottom color

        return {
            container: containerRef,
            height: 100,
            waveColor: gradient,
            progressColor: progressGradient,
            url: `/api?audio=${id}`,
            barWidth: 3,
            renderFunction: (peaks: Array<Float32Array | number[]>, ctx: CanvasRenderingContext2D) => {
                const { width, height } = ctx.canvas;
                const barWidth = options.barWidth || 2;
                const barGap = options.barGap || 1;
                const barRadius = options.barRadius || 0;
                const separationLineHeight = 0.5; // Height of the separation line

                const barCount = Math.floor(width / (barWidth + barGap));
                const step = Math.floor(peaks[0].length / barCount);

                const topPartHeight = height * 0.7; // Define top part height
                const bottomPartHeight = height * 0.3; // Define bottom part height

                ctx.beginPath();

                for (let i = 0; i < barCount; i++) {
                    let sumTop = 0;
                    let sumBottom = 0;

                    for (let j = 0; j < step; j++) {
                        const index = i * step + j;
                        const topValue = Math.abs(peaks[0][index] || 0);
                        const bottomValue = Math.abs(peaks[1]?.[index] || 0);

                        sumTop += topValue;
                        sumBottom += bottomValue;
                    }

                    const avgTop = sumTop / step;
                    const avgBottom = sumBottom / step;

                    const barHeight = (avgTop + avgBottom) * 1.2;

                    // Vertical alignment
                    let yTop = topPartHeight - (barHeight * topPartHeight);
                    let yBottom = topPartHeight + (barHeight * bottomPartHeight);

                    if (options.barAlign === 'top') {
                        yTop = 0;
                        yBottom = bottomPartHeight;
                    } else if (options.barAlign === 'bottom') {
                        yTop = height - topPartHeight;
                        yBottom = height;
                    }

                    ctx.rect(i * (barWidth + barGap), yTop, barWidth, barHeight * topPartHeight);
                    ctx.rect(i * (barWidth + barGap), yBottom - (barHeight * bottomPartHeight), barWidth, barHeight * bottomPartHeight);
                }

                ctx.fill();
                ctx.closePath();
            },
        };
    }, []);

    const { wavesurfer, currentTime, isReady } = useWavesurfer(options)

    useEffect(() => {
        if (!wavesurfer) return;
        setIsPlaying(false);

        const hover = hoverRef.current!;
        const waveform = containerRef.current!;
        waveform.addEventListener('pointermove', (e) => (hover.style.width = `${e.offsetX}px`))

        const subscriptions = [
            wavesurfer.on('play', () => setIsPlaying(true)),
            wavesurfer.on('pause', () => setIsPlaying(false)),
            wavesurfer.once('interaction', () => {
                wavesurfer.play()
            })
        ]

        return () => {
            subscriptions.forEach((unsub) => unsub())
        }
    }, [wavesurfer])


    const onPlayClick = useCallback(() => {
        if (wavesurfer) {
            wavesurfer.isPlaying() ? wavesurfer.pause() : wavesurfer.play();
        }
    }, [wavesurfer]);


    if (typeof document !== 'undefined') {
        const timeEl = timeRef.current!;
        const durationEl = durationRef.current!;
        wavesurfer && wavesurfer.on('decode', (duration) => (durationEl.textContent = formatTime(duration)))
        wavesurfer && wavesurfer.on('timeupdate', (currentTime) => (timeEl.textContent = formatTime(currentTime)))
        wavesurfer && wavesurfer.on('decode', (duration) => (setDurationTrack(duration)))
    }

    useEffect(() => {
        if (wavesurfer && currentTrack.isPlaying) {
            wavesurfer.pause();
        }
    }, [currentTrack])

    useEffect(() => {
        if (track?._id && !currentTrack?._id) {
            setCurrentTrack({ ...track, isPlaying: false })
        }
    }, [track])

    const handleIncreaseView = async () => {
        if (session?.access_token && firstTimeOnPage) {
            const res = await sendRequest<IBackendRes<ITrack>>({
                url: `${process.env.NEXT_PUBLIC_BACKEND_URL}tracks/increase-view/`,
                method: "POST",
                body: {
                    trackId: track?._id,
                },
            })
            if (res?.data) {
                setFirstTimeOnPage(false);
                await sendRequest<IBackendRes<any>>({
                    url: `/api/revalidate`,
                    method: "POST",
                    queryParams: {
                        tag: "track-by-id",
                    }
                })
                router.refresh()
            }
        }
    }

    return (
        track !== undefined ? (
            <div style={{ marginTop: 20 }}>
                <div
                    style={{
                        display: "",
                        gap: 15,
                        padding: 20,
                        background: "#121212",
                        height: 500
                    }}
                >
                    <div className="right flex">
                        {track?.photo ? (
                            <img
                                src={`${process.env.NEXT_PUBLIC_BACKEND_PUBLIC}${track?.photo}`}
                                alt={"track"}
                                className="w-[250px] h-[250px]"
                            />
                        ) : (
                            <div style={{
                                background: "#ccc",
                                width: 250,
                                height: 250
                            }}>
                            </div>
                        )}
                        <div className="text-white ml-10 mt-[50px]">
                            Song
                            <div className="text-6xl font-bold my-5">{track.title}</div>
                            <div className="flex">
                                <img
                                    className={'w-[30px] rounded-full mr-2'}
                                    src={track?.user?.avatar !== '' && track?.user?.avatar !== null ?
                                        `${process.env.NEXT_PUBLIC_BACKEND_PUBLIC}${track?.user?.avatar}` :
                                        "avatars-000184820148-9xr49w-t240x240.jpg"}
                                    alt="sa"
                                />
                                <div className="items-center flex">{track?.user?.name}</div>
                            </div>
                        </div>
                    </div>
                    <div className="left">
                        <div className="info flex">
                            <div className="flex">
                                <div
                                    onClick={() => {
                                        onPlayClick();
                                        handleIncreaseView();
                                        if (track && wavesurfer) {
                                            setCurrentTrack({ ...currentTrack, isPlaying: false })
                                        }
                                    }}
                                    className="rounded-[50%] bg-[#1ed760] h-[50px] w-[50px] flex items-center justify-center hover:cursor-pointer mt-10 mb-5"
                                >
                                    {isPlaying === true ?
                                        <div className="text-black"><Pause /></div>
                                        :
                                        <div className="text-black"><Play /></div>
                                    }
                                </div>
                            </div>
                        </div>
                        <div ref={containerRef} className="wave-form">
                            <div className={`${isReady && 'time'}`} ref={timeRef}>{isReady && "0:00"}</div>
                            <div className={`${isReady && 'duration'}`} ref={durationRef}>{wavesurfer && ""}</div>
                            <div className={`${isReady && 'hover-wave'}`} ref={hoverRef}></div>
                            <div className={`${isReady && 'comments'}`}>
                                {
                                    isReady && comments.map((comment) => {
                                        return (
                                            <div key={`id=${comment._id}`} className="relative group">
                                                <img
                                                    className={`${isReady && 'img-comments'}`}
                                                    onPointerMove={(e) => {
                                                        const hover = hoverRef.current;
                                                        hover ? hover.style.width = calLeft(comment?.moment, durationTrack) : null;
                                                    }}
                                                    key={`id_img=${comment._id}`}
                                                    src={comment?.user?.avatar !== '' && comment?.user?.avatar !== null ?
                                                        `${process.env.NEXT_PUBLIC_BACKEND_PUBLIC}${comment?.user?.avatar}` :
                                                        "avatars-000184820148-9xr49w-t240x240.jpg"}
                                                    alt="sa"
                                                    style={{
                                                        left: calLeft(comment.moment, durationTrack)
                                                    }}
                                                />
                                                <div className="absolute left-0 mb-2 hidden group-hover:block w-max bg-gray-700 text-white text-sm p-2 rounded-md">
                                                    {comment?.commentText}
                                                </div>
                                            </div>
                                        )
                                    })
                                }
                            </div>
                            <div className={`${isReady && 'overlay-wave'}`}></div>
                        </div>
                    </div>
                </div>
                <LikeTrack track={track} isFollow={props?.isFollow} />
                <CommentTrack comments={comments} track={track} wavesurfer={wavesurfer} />
            </div >) :
            (<h1>Page not found</h1>)
    )
}

export default WaveTrack;
