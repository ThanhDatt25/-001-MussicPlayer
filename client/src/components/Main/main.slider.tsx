'use client'

import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { convertSlugUrl } from "@/utils/api";

interface IProps {
    tracks: ITrack[];
    title: string;
}

const MainSlider = (props: IProps) => {
    const sliderRef = useRef<HTMLDivElement>(null);
    const { tracks, title } = props;

    const scrollLeft = () => {
        if (sliderRef.current) {
            sliderRef.current.scrollBy({ left: -300, behavior: "smooth" });
        }
    };

    const scrollRight = () => {
        if (sliderRef.current) {
            sliderRef.current.scrollBy({ left: 300, behavior: "smooth" });
        }
    };

    return (
        <div className="px-6 py-6 w-full bg-[#121212] rounded-[6px]">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-white hover:underline hover:cursor-pointer">{title}</h2>
                <div className="flex gap-2">
                    <Button variant="ghost" size="icon" onClick={scrollLeft}>
                        <ChevronLeft className="w-6 h-6" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={scrollRight}>
                        <ChevronRight className="w-6 h-6" />
                    </Button>
                </div>
            </div>
            <div className="relative overflow-hidden">
                <div
                    ref={sliderRef}
                    className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth"
                >
                    {Array.isArray(tracks) && tracks.map(track => {
                        return (
                            <div className="lex-shrink-0 w-full group" key={track._id}>
                                <Link
                                    href={`/track/${convertSlugUrl(track?.title)}-${track?._id}.html`}
                                    style={{ textDecoration: 'none', color: 'inherit' }}>
                                    <div className="flex flex-col items-center hover:bg-[#1f1f1f] pt-[20px] !px-[2px] h-[300px] rounded-[6px] transition-all">
                                        <img className="w-[200px] rounded-[6px]" src={`${process.env.NEXT_PUBLIC_BACKEND_PUBLIC}${track?.photo}`} alt="track" />
                                        <div className="flex items-start flex-col pl-[20px]">
                                            <h4 className="text-white mt-[10px] hover:underline transition-all">{track.title}</h4>
                                        </div>
                                    </div>
                                </Link>
                            </div>
                        )
                    })
                    }
                </div>
            </div>
        </div>
    );
};

export default MainSlider;
