'use client'
import { useEffect, useRef } from "react";
import AudioPlayer from "react-h5-audio-player";
import "react-h5-audio-player/lib/styles.css";
import MediaControlCard from "./media.card";
import { useHasMounted } from "@/utils/customHook";
import { useTrackContext } from "@/lib/track.wrapper";
export default function AppFooter() {
    const hasMounted = useHasMounted();
    const playerRef = useRef(null)
    const { currentTrack, setCurrentTrack } = useTrackContext() as ITrackContext;
    useEffect(() => {
        if (currentTrack?.isPlaying === true) {
            //@ts-ignore
            playerRef?.current?.audio?.current.play()
        } else {
            //@ts-ignore
            playerRef?.current?.audio?.current.pause()
        }
    }, [currentTrack])

    if (!hasMounted) return (<></>);
    console.log(currentTrack?.isPlaying);
    return (
        <>
            {
                currentTrack._id !== null && currentTrack?.isPlaying && (
                    <div className="fixed bottom-0 w-full bg-black py-4 shadow-md">
                        <div className="mx-[10px] flex gap-10 items-center">
                            <div className="flex flex-col items-start justify-center w-[120px] h-[120px] bg-black">
                                <MediaControlCard track={currentTrack} />
                            </div>
                            <AudioPlayer
                                ref={playerRef}
                                layout="stacked-reverse"
                                src={currentTrack?._id ? `/api?audio=${currentTrack?._id}` : ""}
                                onPlay={() => setCurrentTrack({ ...currentTrack, isPlaying: true })}
                                onPause={() => setCurrentTrack({ ...currentTrack, isPlaying: false })}
                                className="!bg-transparent shadow-none w-full"
                            />
                        </div>
                    </div>
                )
            }
        </>
    );
}
