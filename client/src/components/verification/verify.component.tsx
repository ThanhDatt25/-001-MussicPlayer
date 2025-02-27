'use client';

import { createRef, useEffect, useRef, useState } from 'react';
import { useRouter } from "next/navigation";
import { useUserContext } from '@/lib/user.wrapper';
import { useSession } from 'next-auth/react';
import { sendRequest } from '@/utils/api';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { toast } from "sonner"

const VerifyCodeComponent = () => {
    const [code, setCode] = useState(['', '', '', '', '', '']);
    const router = useRouter();
    const { currentUser, setCurrentUser } = useUserContext() as IUserContext;
    const inputRefs = useRef([...Array(6)].map(() => createRef<HTMLInputElement>()));
    const [timeLeft, setTimeLeft] = useState(300);
    const { data: session } = useSession();
    const [resendTimer, setResendTimer] = useState(0);

    useEffect(() => {
        if (!session?.user) {
            router.push('/');
        }
    }, [])

    useEffect(() => {
        inputRefs.current[0]?.current?.focus();
    }, []);

    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft((prevTime) => {
                if (prevTime <= 1) {
                    clearInterval(timer);
                    return 0;
                }
                return prevTime - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    const formatTime = (seconds: number) => {
        const minutes = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
    };


    const handleCodeChange = (index: number) => (event: React.ChangeEvent<HTMLInputElement> & { nativeEvent: InputEvent }) => {
        const value = event.target.value;
        const newCode = [...code];

        if (value === '') {
            newCode[index] = '';
            setCode(newCode);

            if (index > 0) {
                inputRefs.current[index - 1]?.current?.focus();
            }
        } else if (/^\d$/.test(value)) {
            newCode[index] = value;
            setCode(newCode);

            if (index < 5) {
                inputRefs.current[index + 1]?.current?.focus();
            }
        }
    };

    const handleKeyDown = (index: number) => (event: React.KeyboardEvent) => {
        if (event.key === 'Backspace' && code[index] === '' && index > 0) {
            inputRefs.current[index - 1]?.current?.focus();
        }
    };


    const handleSubmit = async () => {
        const codeValue = code.join('');
        const resVerify = await sendRequest<IBackendRes<IVerify>>({
            url: `${process.env.NEXT_PUBLIC_BACKEND_URL}auth/verify/code`,
            method: "POST",
            body: { code: codeValue },
            headers: {
                Authorization: `Bearer ${session?.access_token}`,
            },
        });
        if (resVerify?.data?.isVerify) {
            setCurrentUser({ ...currentUser, isVerify: resVerify?.data?.isVerify })
            router.push('/');
        } else {
            toast.error("Something went wrong @@", {
                description: "Verify failed",
                position: "top-right",
                richColors: true,
            })
        }
    };

    const handleResendCode = async () => {
        setResendTimer(60);
        setTimeLeft(300);
        const resVerify = await sendRequest<IBackendRes<IVerify>>({
            url: `${process.env.NEXT_PUBLIC_BACKEND_URL}auth/resend`,
            method: "GET",
            headers: {
                Authorization: `Bearer ${session?.access_token}`,
            },
        });
        if (!resVerify?.error) {
            toast.success('Gửi lại mã xác minh thành công');
            setTimeLeft(300);
        } else {
            toast.error("Something went wrong @@", {
                description: "Send OTP failed",
                position: "top-right",
                richColors: true,
            })
        }

    };

    useEffect(() => {
        if (resendTimer > 0) {
            const timer = setTimeout(() => {
                setResendTimer(resendTimer - 1);
            }, 1000);
            return () => clearTimeout(timer);
        }
    }, [resendTimer]);


    return (
        <div className="flex justify-center items-center min-h-screen bg-gray-900 text-white">
            <Card className="w-full max-w-md p-6">
                <CardContent className="flex flex-col items-center">
                    <h2 className="text-2xl font-bold">Xác minh mã</h2>
                    <p className="text-sm text-gray-400">Mã xác minh đã được gửi tới email: {session?.user?.email}.</p>
                    <p className="text-lg text-red-500 mt-2">Thời gian còn lại: {formatTime(timeLeft)}</p>
                    <div className="flex space-x-2 my-4">
                        {code.map((digit, index) => (
                            <Input
                                key={index}
                                value={digit}
                                onChange={handleCodeChange(index)}
                                onKeyDown={handleKeyDown(index)}
                                ref={inputRefs.current[index]}
                                className="w-12 h-12 text-center text-lg border border-gray-500 bg-gray-800 rounded-md focus:ring-2 focus:ring-blue-500"
                                maxLength={1}
                            />
                        ))}
                    </div>
                    <Button onClick={handleSubmit} className="w-full mt-2 bg-blue-600 hover:bg-blue-700">
                        Xác minh
                    </Button>
                    <div className="mt-4">
                        {resendTimer > 0 ? (
                            <p className="text-sm text-gray-400">Bạn có thể gửi lại mã sau: {resendTimer} giây</p>
                        ) : (
                            <button onClick={handleResendCode} className="text-blue-400 hover:underline">
                                Bạn không nhận được mã? Nhấn vào đây để gửi lại mã
                            </button>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default VerifyCodeComponent;
