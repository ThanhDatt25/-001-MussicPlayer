'use client'
import { useState } from 'react';
import { sendRequest } from '@/utils/api';
import { useRouter } from 'next/navigation';
import { useSession } from "next-auth/react";

interface IProps {
    playlists: IPlaylist[];
    tracks: ITrack[];
}

const AddPlaylistTrack = (props: IProps) => {
    const { playlists, tracks } = props;

    const [open, setOpen] = useState(false);
    const router = useRouter();
    const { data: session } = useSession();

    const [playlistId, setPlaylistId] = useState('');
    const [tracksId, setTracksId] = useState<string[]>([]);


    const handleClose = (event: any, reason: any) => {
        // if (reason && reason == "backdropClick")
        //     return;
        setOpen(false);
        setPlaylistId('');
        setTracksId([]);
    };

    // const getStyles = (name: string, tracksId: readonly string[], theme: Theme) => {
    //     return {
    //         fontWeight:
    //             tracksId.indexOf(name) === -1
    //                 ? theme.typography.fontWeightRegular
    //                 : theme.typography.fontWeightMedium,
    //     };
    // }

    const handleSubmit = async () => {
        if (!playlistId) {
            // toast.error("Vui lòng chọn playlist!")
            return;
        }
        if (!tracksId.length) {
            // toast.error("Vui lòng chọn tracks!")
            return;
        }


        const chosenPlaylist = playlists.find(i => i._id === playlistId);
        let tracks = tracksId?.map(item => item?.split("###")?.[1]);

        //remove null/undefined/empty
        tracks = tracks?.filter((item) => item);
        if (chosenPlaylist) {
            const res = await sendRequest<IBackendRes<any>>({
                url: `${process.env.NEXT_PUBLIC_BACKEND_URL}playlists/${chosenPlaylist?._id}`,
                method: "PATCH",
                body: {
                    "track": tracks
                },
                headers: {
                    Authorization: `Bearer ${session?.access_token}`,
                }
            })

            if (res?.data) {
                // toast.success("Thêm track vào playlist thành công!");
                await sendRequest<IBackendRes<any>>({
                    url: `/api/revalidate`,
                    method: "POST",
                    queryParams: {
                        tag: "playlist-by-user",
                    }
                })
                handleClose("", "");
                router.refresh();
            } else {
                // toast.error(res.message)
            }
        }
    }

    return (
        <>
            <button
                onClick={() => setOpen(true)}
                className="px-4 py-2 text-sm font-semibold text-blue-500 border border-blue-500 rounded-md hover:bg-blue-100"
            >
                <span className="mr-2">
                    +
               </span>
                Tracks
            </button>

            {open && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white w-full max-w-sm rounded-md p-6">
                        <h2 className="text-xl font-semibold text-gray-800 mb-4">Thêm track vào playlist:</h2>

                        <div className="mb-5">
                            <label className="block text-sm font-medium text-gray-700">Chọn playlist</label>
                            <select
                                value={playlistId}
                                onChange={(e) => setPlaylistId(e.target.value)}
                                className="mt-1 block w-full px-3 py-2 text-gray-700 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                            >
                                <option value="" disabled>Chọn playlist</option>
                                {playlists.map(item => (
                                    <option key={item._id} value={item._id}>{item.title}</option>
                                ))}
                            </select>
                        </div>

                        <div className="mb-5">
                            <label className="block text-sm font-medium text-gray-700">Track</label>
                            <select
                                multiple
                                value={tracksId}
                                onChange={(e) => setTracksId(Array.from(e.target.selectedOptions, option => option.value))}
                                className="mt-1 block w-full h-32 px-3 py-2 text-gray-700 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                            >
                                {tracks.map((track) => (
                                    <option
                                        key={track._id}
                                        value={`${track.title}###${track._id}`}
                                        className="text-sm"
                                    >
                                        {track.title}
                                    </option>
                                ))}
                            </select>
                            <div className="mt-2">
                                <span className="text-sm font-medium text-gray-600">Selected Tracks:</span>
                                <div className="flex flex-wrap gap-2 mt-2">
                                    {tracksId.map((value) => (
                                        <span key={value} className="bg-blue-500 text-white px-2 py-1 rounded-full text-xs">
                                            {value.split("###")[0]}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end gap-4">
                            <button
                                onClick={() => handleClose("", "")}
                                className="px-4 py-2 text-sm font-semibold text-gray-700 border border-gray-300 rounded-md hover:bg-gray-100"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => handleSubmit()}
                                className="px-4 py-2 text-sm font-semibold text-white bg-blue-500 rounded-md hover:bg-blue-600"
                            >
                                Save
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

export default AddPlaylistTrack;
