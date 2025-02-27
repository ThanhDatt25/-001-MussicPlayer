import MainSlider from "@/components/Main/main.slider";
import VerifyComponent from "@/components/Verify/check.verify.component";
import { sendRequest } from "@/utils/api";

const HomePage = async () => {

    const resPop = await sendRequest<IBackendRes<ITrack[]>>({
        url: `${process.env.NEXT_PUBLIC_BACKEND_URL}tracks/top?limit=6`,
        method: "POST",
        body: { genre: "POP" }
    });

    const resElec = await sendRequest<IBackendRes<ITrack[]>>({
        url: `${process.env.NEXT_PUBLIC_BACKEND_URL}tracks/top?limit=6`,
        method: "POST",
        body: { genre: "Electronic" }
    });

    const resBallad = await sendRequest<IBackendRes<ITrack[]>>({
        url: `${process.env.NEXT_PUBLIC_BACKEND_URL}tracks/top?limit=6`,
        method: "POST",
        body: { genre: "Electronic" }
    });

    return (
        <div className="">
            <VerifyComponent />
            <div className="border-[20px] border-black">
                <MainSlider tracks={resPop?.data ?? []}
                    title="Popular Sportify's POP Track" />
                {/* <div className="h-[20px]"></div> */}
                <MainSlider tracks={resElec?.data ?? []}
                    title="Popular Sportify's Electric Track" />
                {(resBallad?.data?.length ?? 0 > 4) ? <MainSlider
                    tracks={resBallad?.data ?? []}
                    title="Top Ballad Tracks"
                /> : <></>}
            </div>
        </div>
    )
}

export default HomePage;