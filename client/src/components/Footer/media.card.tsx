import { Card } from "@/components/ui/card";
import Image from "next/image";

interface IProp {
    track: ITrack;
}

function constructPhotoUrl(track: ITrack): string {
    if (track.photo.startsWith("/")) {
        return `${process.env.NEXT_PUBLIC_BACKEND_PUBLIC}${track.photo}`;
    } else {
        return `${process.env.NEXT_PUBLIC_BACKEND_PUBLIC}${track.photo}`;
    }
}

export default function MediaControlCard(props: IProp) {
    const { track } = props;
    return (
        track._id !== null && (
            <>
                <div className="flex items-center mr-2">
                    {track?.photo && (
                        <img
                            style={{ alignSelf: 'center' }}
                            src={constructPhotoUrl(track)}
                            alt=""
                            width={1000}
                            height={1000}
                            className="rounded-[22px]"
                        />
                    )}
                </div>
                <div className="flex-1 text-sm">
                    {/* <p className="text-black font-medium truncate">{track.title}</p> */}
                    {/* <p className="text-gray-600 truncate text-xs">{track?.user?.name}</p> */}
                </div>
            </>
        )
    );
}
