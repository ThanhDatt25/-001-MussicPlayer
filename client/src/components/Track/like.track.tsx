'use client'

import { useEffect, useState } from 'react';
import { sendRequest } from '@/utils/api';
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Heart, Flame, Play } from 'lucide-react';
interface IProps {
    track: ITrack | null;
    isFollow: boolean;
}
const LikeTrack = (props: IProps) => {
    const { track, isFollow } = props;
    const { data: session } = useSession();
    const [like, setLike] = useState<boolean>(false);
    const router = useRouter();

    const fetchData = async () => {
        if (session?.access_token) {
            const res2 = await sendRequest<IBackendRes<ILike>>({
                url: `${process.env.NEXT_PUBLIC_BACKEND_URL}likes/check/${track?._id}`,
                method: "GET",
                headers: {
                    Authorization: `Bearer ${session?.access_token}`,
                },
            })
            if (res2?.data) {
                setLike(res2?.data?.like)
            }
        }
    }

    useEffect(() => {
        fetchData();
    }, [session])

    const handleLikeTrack = async () => {
        await sendRequest<IBackendRes<ITrack>>({
            url: `${process.env.NEXT_PUBLIC_BACKEND_URL}likes`,
            method: "POST",
            body: {
                track: track?._id,
                like: !like
            },
            headers: {
                Authorization: `Bearer ${session?.access_token}`,
            },
        })
        fetchData();
        await sendRequest<IBackendRes<any>>({
            url: `/api/revalidate`,
            method: "POST",
            queryParams: {
                tag: "liked-by-user",
            }
        })

        await sendRequest<IBackendRes<any>>({
            url: `/api/revalidate`,
            method: "POST",
            queryParams: {
                tag: "track-by-id",
            }
        })

        router.refresh()
    }

    const handleFollow = async () => {
        await sendRequest<IBackendRes<ITrack>>({
            url: `${process.env.NEXT_PUBLIC_BACKEND_URL}followers`,
            method: "POST",
            body: {
                author: track?.user?._id
            },
            headers: {
                Authorization: `Bearer ${session?.access_token}`,
            },
        })

        await sendRequest<IBackendRes<any>>({
            url: `/api/revalidate`,
            method: "POST",
            queryParams: {
                tag: "follow",
            }
        })
        router.refresh()
    }

    return (
        <div className='flex space-x-4'>
            <Heart
                onClick={() => handleLikeTrack()}
                className='text-white ml-10'
            />
            <div style={{ display: "flex", gap: "20px", color: "#999" }}>
                <Flame
                    onClick={() => handleFollow()}
                    className='text-white'
                />
                <span style={{ display: "flex", alignItems: "center" }}><Play /> {track?.view}</span>
                <span style={{ display: "flex", alignItems: "center" }}><Heart /> {track?.like}</span>
            </div>
        </div>
    )
}

export default LikeTrack;