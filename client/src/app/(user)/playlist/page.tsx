import { sendRequest } from "@/utils/api";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { Fragment } from 'react';
import type { Metadata } from 'next'
import { extractNumberFromString } from "@/utils/utils";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import CurrentTrack from "@/components/Playlist/current.track";
import NewPlaylist from "@/components/Playlist/new.playlist";
import AddPlaylistTrack from "@/components/Playlist/add.playlist.track";

export const metadata: Metadata = {
    title: 'Playlist bạn đã tạo',
    description: 'Mô tả',
}
// { params }: { params: { slug: string } },
const PlaylistPage = async ({ searchParams, }: { searchParams: { [key: string]: string | string[] | undefined }; }) => {
    const page = searchParams["page"] ?? "1";
    const session = await getServerSession(authOptions);

    const resPlaylist = await sendRequest<IBackendRes<IModelPaginate<IPlaylist[]>>>({
        url: `${process.env.NEXT_PUBLIC_BACKEND_URL}playlists`,
        method: "GET",
        headers: {
            Authorization: `Bearer ${session?.access_token}`,
        },
        queryParams: { current: page },
        nextOption: {
            next: { tags: ['playlist-by-user'] }
        }
    })

    const resAllTrack = await sendRequest<IBackendRes<IModelPaginate<ITrack[]>>>({
        url: `${process.env.NEXT_PUBLIC_BACKEND_URL}tracks`,
        method: "GET",
        queryParams: { current: page, pageSize: 5 },
        headers: {
            Authorization: `Bearer ${session?.access_token}`,
        }
    })

    const playlists = resPlaylist?.data?.results ?? [];
    return (
        <div className="p-6 bg-gray-100 rounded-md">
            {/* Header Section */}
            <div className="flex justify-between items-center">
                <h3 className="text-xl font-semibold">Danh sách phát</h3>
                <div className="flex gap-5">
                    <NewPlaylist />
                    <AddPlaylistTrack
                        playlists={playlists}
                        tracks={resAllTrack?.data?.results ?? []} />
                </div>
            </div>

            <hr className="border-gray-300 my-3" />

            <div className="mt-3">
                {playlists.map((playlist) => (
                    <Accordion key={playlist._id} type="single" collapsible>
                        <AccordionItem value={playlist._id}>
                            <AccordionTrigger>
                                <div className="flex flex-col text-left">
                                    <p className="text-lg font-semibold text-black">{playlist.title}</p>
                                    <p className="text-sm text-gray-500">{playlist.description}</p>
                                </div>
                            </AccordionTrigger>
                            <AccordionContent>
                                {playlist?.track?.map((track: ITrack, index: number) => (
                                    <Fragment key={track._id}>
                                        {index === 0 && <hr className="border-gray-300 my-2" />}
                                        <CurrentTrack track={track} />
                                        <hr className="border-gray-300 my-2" />
                                    </Fragment>
                                ))}
                                {playlist?.track?.length === 0 && <span className="text-gray-500">No data.</span>}
                            </AccordionContent>
                        </AccordionItem>
                    </Accordion>
                ))}
            </div>
        </div>
    )
}

export default PlaylistPage;
