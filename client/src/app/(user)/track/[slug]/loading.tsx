import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
    return (
        <div className="mt-3 container mx-auto">
            <div className="h-[300px] w-full bg-gray-100 p-5 rounded-md flex gap-12">
                <div className="w-full">
                    <div className="flex items-center gap-3 mb-12">
                        <Skeleton className="w-12 h-12 rounded-full" />
                        <div className="flex flex-col w-full">
                            <Skeleton className="h-4 w-1/5 mb-1" />
                            <Skeleton className="h-4 w-1/2" />
                        </div>
                    </div>
                    <Skeleton className="w-full h-[150px]" />
                </div>
                <div className="w-[300px] flex items-center">
                    <Skeleton className="w-[250px] h-[250px]" />
                </div>
            </div>
            <div className="mt-3">
                <div className="flex justify-between items-center">
                    <Skeleton className="w-20 h-9" />
                    <div className="flex gap-4">
                        <Skeleton className="w-12 h-4" />
                        <Skeleton className="w-12 h-4" />
                    </div>
                </div>
                <Skeleton className="mt-2 w-full h-9" />
            </div>
            <div className="mt-3">
                <div className="flex items-center gap-12">
                    <div className="w-[150px]">
                        <Skeleton className="w-[150px] h-[150px] rounded-full" />
                    </div>
                    <div className="flex gap-5 w-full flex-col">
                        {[...Array(3)].map((_, index) => (
                            <div key={index} className="flex gap-2">
                                <Skeleton className="w-12 h-12 rounded-full" />
                                <Skeleton className="w-full h-12" />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}