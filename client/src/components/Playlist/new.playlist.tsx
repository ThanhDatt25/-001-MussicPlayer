'use client'
import { useState } from 'react';

import { sendRequest } from '@/utils/api';
import { useRouter } from 'next/navigation';
import { useSession } from "next-auth/react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { Plus } from "lucide-react";
import { Input } from "../ui/input";
import { Button } from '../ui/button';
import { Switch } from '../ui/switch';

const NewPlaylist = (props: any) => {
    const [open, setOpen] = useState(false);

    const [isPublic, setIsPublic] = useState<boolean>(true);
    const [title, setTitle] = useState<string>("");
    const [description, setDescription] = useState<string>("");
    const router = useRouter();
    const { data: session } = useSession();

    const handleClose = (event: any, reason: any) => {
        if (reason && reason == "backdropClick")
            return;
        setOpen(false);
    };

    const handleSubmit = async () => {
        if (!title) {
            // toast.error("Tiêu đề không được để trống!")
            return;
        }
        const res = await sendRequest<IBackendRes<IPlaylist>>({
            url: `${process.env.NEXT_PUBLIC_BACKEND_URL}playlists`,
            method: "POST",
            body: {
                title: title,
                status: isPublic,
                description: description,
                track: []
            },
            headers: {
                Authorization: `Bearer ${session?.access_token}`,
            }
        })

        if (res?.data) {
            // toast.success("Tạo mới playlist thành công!");
            setIsPublic(true);
            setTitle("");

            setOpen(false);

            await sendRequest<IBackendRes<any>>({
                url: `/api/revalidate`,
                method: "POST",
                queryParams: {
                    tag: "playlist-by-user",
                }
            })
            router.refresh();
        } else {
            // toast.error(res.message)
        }
    }

    return (
        <div>
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                    <Button variant="outline">
                        <Plus className="mr-2 h-4 w-4" />
                        Playlist
                    </Button>
                </DialogTrigger>
                <DialogContent className="max-w-sm">
                    <DialogHeader>
                        <DialogTitle>Thêm mới playlist</DialogTitle>
                    </DialogHeader>
                    <div className="flex flex-col gap-4 w-full">
                        <div>
                            <p>Tiêu đề</p>
                            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Nhập tiêu đề" />
                        </div>
                        <div>
                            <p>Mô tả</p>
                            <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Nhập mô tả" />
                        </div>
                        <div className="flex items-center gap-2">
                            <Switch checked={isPublic} onCheckedChange={setIsPublic} />
                            <span>{isPublic ? "Public" : "Private"}</span>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                        <Button onClick={handleSubmit}>Save</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}

export default NewPlaylist;