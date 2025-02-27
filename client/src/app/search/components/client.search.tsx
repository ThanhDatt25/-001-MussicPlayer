'use client'

import { convertSlugUrl, sendRequest } from '@/utils/api';
import { useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';

const ClientSearch = () => {
    const searchParams = useSearchParams();
    const query = searchParams.get('q');
    const [tracks, setTracks] = useState<ITrack[]>([]);

    const fetchData = async (query: string) => {
        const res = await sendRequest<IBackendRes<ITrack[]>>({
            url: `${process.env.NEXT_PUBLIC_BACKEND_URL}tracks/search`,
            method: "POST",
            body: {
                keyword: query
            }
        })
        if (res.data) {
            setTracks(res.data)
        }
    }

    useEffect(() => {
        //update document title by query
        document.title = `"${query}" trên Sportify`;

        //fetch data
        if (query)
            fetchData(query);

    }, [query])

    return (
        <div>
            {(!query || !tracks.length)
                ?
                <div>Không tồn tại kết quả tìm kiếm</div>
                :
                <div className="p-4">
                    <div className="text-lg font-bold">
                        Kết quả tìm kiếm cho từ khóa: <b>{query}</b>
                    </div>
                    <div className="my-4 border-t border-gray-300"></div> {/* Divider */}
                    <div className="flex flex-col gap-5">
                        {tracks.map((track) => {
                            return (
                                <div key={track._id} className="flex items-center gap-5">
                                    <img
                                        className="rounded-sm"
                                        alt="avatar track"
                                        src={`${process.env.NEXT_PUBLIC_BACKEND_PUBLIC}${track?.photo}`}
                                        height={50}
                                        width={50}
                                    />
                                    <div className="py-2">
                                        <Link
                                            className="text-blue-500 hover:underline"
                                            href={`/track/${convertSlugUrl(track.title)}-${track._id}.html?audio=${track.title}`}
                                        >
                                            {track.title}
                                        </Link>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            }
        </div>
    )
}

export default ClientSearch;
