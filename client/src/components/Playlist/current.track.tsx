'use client'

import { useTrackContext } from "@/lib/track.wrapper";
import { convertSlugUrl } from "@/utils/api";
import Link from "next/link";
import { Pause, Play } from "lucide-react";

interface IProps {
    track: ITrack;
}
const CurrentTrack = (props: IProps) => {
    const { track } = props;
    const { currentTrack, setCurrentTrack } = useTrackContext() as ITrackContext;

    return (
        <div className="flex justify-between w-full">
            <p className="py-2 text-lg">
                <Link
                    href={`/track/${convertSlugUrl(track.title)}-${track._id}.html?audio=${track.url}`}
                    className="text-black hover:underline"
                >
                    {track.title}
                </Link>
            </p>

            <div className="flex items-center">
                {track._id !== currentTrack._id || (track._id === currentTrack._id && !currentTrack.isPlaying) ? (
                    <button
                        aria-label="Play"
                        onClick={() => setCurrentTrack({ ...track, isPlaying: true })}
                        className="rounded-full p-2 hover:bg-gray-200"
                    >
                        <Play className="h-6 w-6" />
                    </button>
                ) : (
                    <button
                        aria-label="Pause"
                        onClick={() => setCurrentTrack({ ...track, isPlaying: false })}
                        className="rounded-full p-2 hover:bg-gray-200"
                    >
                        <Pause className="h-6 w-6" />
                    </button>
                )}
            </div>
        </div>
    )
}

export default CurrentTrack;