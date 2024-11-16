/* eslint-disable @next/next/no-img-element */
"use client"
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { HeartPulse } from "lucide-react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useState } from "react";

export function SignUpMain() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [username, setUsername] = useState("");
    const [age, setAge] = useState(0);
    const [gender, setGender] = useState("");

    const handleSubmit = async () => {
        console.log(email, password, username, age, gender);

        const result = await signIn("credentials", {
            email,
            password,
            username,
            age,
            gender,
            redirect: true,
            callbackUrl: "/",
        });

        if (!result?.ok) {
            console.error("Error signing up:", result?.error);
        }
    };


    return (
        <div className="flex md:flex-row flex-col h-screen mx-auto min-w-screen">
            {/* Left Side - Image */}
            <div className="items-center justify-center w-1/2 h-full hidden md:flex">
                <img
                    src="https://ai.google.dev/static/edge/mediapipe/images/solutions/examples/pose_detector.png"
                    alt="Pose Detector"
                    className="h-full w-auto object-cover"
                />
            </div>

            {/* Right Side - Sign In Card */}
            <div className="flex flex-col justify-center md:w-1/2 w-full h-full px-10">
                <div className="flex flex-col items-center text-center mx-auto my-6">
                    <div className="flex flex-row gap-3">
                        <HeartPulse className="w-10 h-10" />
                        <h1 className="text-5xl font-bold">FitTrack AI</h1>
                    </div>
                    <p className="mx-auto text-base mt-2 text-primary/50 font-medium text-center">
                        Get real-time feedback and track your progress like never before.
                    </p>
                </div>

                <Card className="lg:w-[500px] w-full mx-auto border-0 shadow-none">
                    <CardContent className="my-6">
                        <form>
                            <div className="grid w-full gap-4">
                                <div className="flex flex-col space-y-1.5">
                                    <Label htmlFor="email">Email</Label>
                                    <Input id="email" type="email" placeholder="Enter your email" onChange={
                                        (e) => setEmail(e.target.value)
                                    } />
                                </div>
                                <div className="flex flex-col space-y-1.5">
                                    <Label htmlFor="password">Password</Label>
                                    <Input id="password" type="password" placeholder="Enter your password" onChange={
                                        (e) => setPassword(e.target.value)
                                    } />
                                </div>
                                <div className="flex md:flex-row flex-col gap-4">
                                    <div className="flex flex-col space-y-1.5 w-full">
                                        <Label htmlFor="username">Username</Label>
                                        <Input id="username" type="text" placeholder="Enter your username" onChange={
                                            (e) => setUsername(e.target.value)
                                        } />
                                    </div>
                                    <div className="flex flex-col space-y-1.5 w-full">
                                        <Label htmlFor="age">Age</Label>
                                        <Input id="age" type="number" placeholder="Enter your age" onChange={
                                            (e) => setAge(parseInt(e.target.value))
                                        } />
                                    </div>
                                </div>

                                <div className="flex flex-row space-y-1.5 w-full justify-center">
                                    <Select onValueChange={
                                        (value) => setGender(value)
                                    }>
                                        <SelectTrigger className="w-full md:w-[180px]">
                                            <SelectValue placeholder="Select Gender" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectGroup>
                                                <SelectLabel>Gender</SelectLabel>
                                                <SelectItem value="male">Male</SelectItem>
                                                <SelectItem value="female">Female</SelectItem>
                                                <SelectItem value="no">Prefer not to say</SelectItem>
                                            </SelectGroup>
                                        </SelectContent>
                                    </Select>
                                </div>

                            </div>
                        </form>
                    </CardContent>
                    <CardFooter className="flex justify-center flex-col">
                        <Button onClick={handleSubmit}>Sign Up</Button>
                        <p className="mx-auto text-base mt-2 text-primary/50 font-medium text-center">
                            {"Don't have an account? "}
                            <Link className="font-bold underline" href={"/signup"}>Sign In</Link>
                        </p>
                    </CardFooter>
                </Card>
            </div>
        </div>
    );
}
