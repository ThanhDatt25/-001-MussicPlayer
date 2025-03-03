'use client'

import { useTrackContext } from '@/lib/track.wrapper';
import Link from "next/link";
import { convertSlugUrl } from '@/utils/api';
import { Button } from '../ui/button';
import { Pause, Play } from 'lucide-react';

interface IProps {
    data: ITrack
}

const ProfileTracks = (props: IProps) => {
    const { data } = props;
    const { currentTrack, setCurrentTrack } = useTrackContext() as ITrackContext;

    return (
        <div className="flex items-center justify-between p-4 rounded-lg border shadow-md bg-white">
            <div className="flex flex-col max-w-[70%]">
                <div className="mb-2">
                    <Link
                        href={`/track/${convertSlugUrl(data?.title)}-${data?._id}.html`}
                        className="text-lg font-semibold text-black truncate block hover:underline"
                    >
                        {data?.title}
                    </Link>
                    <p className="text-sm text-gray-500 truncate">{data?.description}</p>
                </div>

                <div className="flex items-center space-x-3">
                    <Button variant="ghost" size="icon">
                        {/* <SkipBack className="w-6 h-6" /> */}
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                            if (data._id !== currentTrack._id && currentTrack.isPlaying) {
                                setCurrentTrack({ ...data, isPlaying: currentTrack.isPlaying });
                            } else {
                                setCurrentTrack({ ...data, isPlaying: !currentTrack.isPlaying });
                            }
                        }}
                    >
                        {currentTrack.isPlaying && data._id === currentTrack._id ? (
                            <Pause className="w-6 h-6" />
                        ) : (
                            <Play className="w-6 h-6" />
                        )}
                    </Button>
                    <Button variant="ghost" size="icon">
                        {/* <SkipForward className="w-6 h-6" /> */}
                    </Button>
                </div>
            </div>

            <img
                className="w-24 h-24 rounded-md object-cover"
                src={`${process.env.NEXT_PUBLIC_BACKEND_PUBLIC}${data.photo}`}
                alt="Track Cover"
            />
        </div>
    );
}

export default ProfileTracks;
