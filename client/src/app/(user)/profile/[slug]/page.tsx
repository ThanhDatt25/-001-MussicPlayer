import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import ProfileTracks from "@/components/Header/profile.tracks";
import { sendRequest } from "@/utils/api";
import { Metadata } from "next";
import { getServerSession } from "next-auth";

export const metadata: Metadata = {
    title: 'Thông tin của bạn',
    description: 'Mô tả',
}

const ProfilePage = async ({ params }: { params: { slug: string } }) => {
    const session = await getServerSession(authOptions)

    const res = await sendRequest<IBackendRes<IModelPaginate<ITrack[]>>>({
        url: `${process.env.NEXT_PUBLIC_BACKEND_URL}tracks/user-track`,
        method: "get",
        headers: {
            Authorization: `Bearer ${session?.access_token}`,
        },
        nextOption: {
            next: { tags: ['track-by-profile'] }
        }
    })

    const data = res?.data?.results ?? []
    console.log(session?.access_token)

    return (
        <div className="mx-auto my-5 p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="text-white">Hello world</div>
                {data.map((item: any, index: number) => (
                    <div key={index} className="p-4 border border-gray-200 rounded-lg shadow-md bg-white">
                        <ProfileTracks data={item} />
                    </div>
                ))}
            </div>
        </div>
    )
}

export default ProfilePage;