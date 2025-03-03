'use client'
import { sendRequest } from '@/utils/api';
import { useState, useTransition } from 'react';
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import dayjs from 'dayjs';
import WaveSurfer from "wavesurfer.js";

import relativeTime from 'dayjs/plugin/relativeTime';
import { useHasMounted } from '@/utils/customHook';
import { Textarea } from '../ui/textarea';
import { Button } from '../ui/button';
dayjs.extend(relativeTime)

interface IProps {
    comments: IComment[];
    track: ITrack | null;
    wavesurfer: WaveSurfer | null;
}

const CommentTrack = (props: IProps) => {
    const router = useRouter();

    const { comments, track, wavesurfer } = props;
    const [yourComment, setYourComment] = useState("");
    const { data: session } = useSession();
    const hasMounted = useHasMounted();


    const formatTime = (seconds: number) => {
        const minutes = Math.floor(seconds / 60)
        const secondsRemainder = Math.round(seconds) % 60
        const paddedSeconds = `0${secondsRemainder}`.slice(-2)
        return `${minutes}:${paddedSeconds}`
    }

    const handleSubmit = async () => {

        const res = await sendRequest<IBackendRes<IComment>>({
            url: `${process.env.NEXT_PUBLIC_BACKEND_URL}comments/`,
            method: "POST",
            body: {
                commentText: yourComment,
                moment: Math.round(wavesurfer?.getCurrentTime() ?? 0),
                track: track?._id,
                user: session?.user._id
            },

            headers: {
                Authorization: `Bearer ${session?.access_token}`,
            },

        })
        if (res?.data) {
            setYourComment("");
            router.refresh()
        }
    }

    const handleJumpTrack = (moment: number) => {
        if (wavesurfer) {
            const duration = wavesurfer.getDuration();
            wavesurfer.seekTo(moment / duration);
            wavesurfer.play();
        }
    }

    return (
        <div>
            <div className='mt-20 mx-20'>
                {session?.user &&
                    <div>
                        <Textarea
                            value={yourComment}
                            className='text-white'
                            onChange={(e) => setYourComment(e.target.value)}
                            placeholder='Have a comment ?'
                        />
                        <Button onClick={() => handleSubmit()}>Send</Button>
                    </div>
                }
            </div>
            <div className='mx-20 mt-5'>
                <div className='right' style={{ width: "calc(100% - 200px)" }}>
                    {comments?.map(comment => {
                        return (
                            <div className='mb-10'>
                                <div className='flex items-center space-x-4'>
                                    {
                                        comment?.user?.type === 'CREDENTIAL' ? <img
                                            className='h-[40px] w-[40px] rounded-[50%]'
                                            src={comment?.user?.avatar !== "" && comment?.user?.avatar !== null && comment?.user?.avatar !== undefined ?
                                                `${process.env.NEXT_PUBLIC_BACKEND_PUBLIC}${comment?.user?.avatar}` :
                                                "/avatars-000184820148-9xr49w-t240x240.jpg"}
                                        />
                                            :
                                            <img
                                                style={{
                                                    height: 40, width: 40, borderRadius: "50%"
                                                }}
                                                src={comment?.user?.avatar !== "" && comment?.user?.avatar !== null && comment?.user?.avatar !== undefined ?
                                                    `${comment?.user?.avatar}` :
                                                    "/avatars-000184820148-9xr49w-t240x240.jpg"}
                                            />
                                    }
                                    <div className='text-lg text-white'>{comment?.user?.name ?? comment?.user?.email} at
                                        <span className='hover:cursor-pointer'
                                            onClick={() => handleJumpTrack(comment.moment)}
                                        >
                                            &nbsp; {formatTime(comment.moment)}
                                        </span>
                                        <div className='text-white text-[12px]'>
                                            {hasMounted && dayjs(comment?.createdAt).fromNow()}
                                        </div>
                                    </div>
                                </div>

                                <div className='text-white ml-[55px] mt-2'>
                                    {comment.commentText}
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>
        </div >
    )
}

export default CommentTrack;
