/* eslint-disable @next/next/no-img-element */
"use client";

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { HeartPulse } from "lucide-react"
import { signIn } from "next-auth/react";
import Link from "next/link"
import { useRouter } from "next/navigation";
import { useState } from "react";

export function LoginMain() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null | undefined>(null);
    const router = useRouter();

    const handleLogin = async (e: React.FormEvent) => {
        setError(null);
        e.preventDefault();

        const result = await signIn("credentials", {
            email,
            password,
            redirect: false,
            callbackUrl: "/",
        });

        if (!result?.ok) {
            setError(result?.error);
            return;
        } else {
            console.log("Logged in successfully");
            router.push("/");
        }
        setEmail("");
        setPassword("");
    }

    return (
        <div className="flex md:flex-row flex-col h-screen mx-auto min-w-screen">
            {/* Left Side - Image */}
            <div className="items-center justify-center w-1/2 h-full hidden md:flex">
                <img
                    src="https://ideogram.ai/assets/progressive-image/balanced/response/-JryY0P6S7yXv5Q6cWB00Q"
                    alt="Pose Detector"
                    className="h-full w-auto object-cover"
                />
            </div>

            {/* Right Side - Sign In Card */}
            <div className="flex flex-col justify-center md:w-1/2 w-full h-full px-10">
                <div className="flex flex-col items-center space-x-2 text-center mx-auto my-6">
                    <div className="flex flex-row gap-3">
                        <HeartPulse className="w-10 h-10" />
                        <h1 className="text-5xl font-bold">FitTrack</h1>
                    </div>
                    <p className="mx-auto text-base mt-2 text-primary/50 font-medium text-center">
                        Get real-time feedback and track your progress like never before.
                    </p>
                </div>

                <Card className="lg:w-[500px] w-full mx-auto border-0 shadow-none">
                    <CardContent className="my-6">
                        <form>
                            <div className="grid w-full items-center gap-4">
                                <div className="flex flex-col space-y-1.5">
                                    <Label htmlFor="email">Email</Label>
                                    <Input id="email" type="email" placeholder="Enter your email" required={true} onChange={
                                        (e) => setEmail(e.currentTarget.value)
                                    } />
                                </div>
                                <div className="flex flex-col space-y-1.5">
                                    <Label htmlFor="password">Password</Label>
                                    <Input id="password" type="password" placeholder="Enter your password" required={true} onChange={
                                        (e) => setPassword(e.currentTarget.value)
                                    } />
                                </div>
                            </div>
                        </form>
                    </CardContent>
                    <CardFooter className="flex justify-center flex-col">
                        <Button onClick={handleLogin}>Sign In</Button>
                        {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
                        <p className="mx-auto text-base mt-2 text-primary/50 font-medium text-center flex flex-row gap-2">
                            Dont have an account? {" "}
                            <Link className="font-bold underline" href={"/signup"}>Sign Up</Link>
                        </p>
                    </CardFooter>
                </Card>
            </div>
        </div>
    )
}