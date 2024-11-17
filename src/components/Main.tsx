"use client"

import { Github, MoveRight } from "lucide-react";
import { Button } from "./ui/button";
import Link from "next/link";
import { useRouter } from "next/navigation";

export function Main() {
    const router = useRouter();
    return <>
        <div className="flex flex-col container mt-3 mx-auto my-9">
            <div className="flex flex-col justify-between md:m-7">

                <div className="flex md:p-5 my-auto flex-col w-full gap-3">
                    <div className="flex justify-center">
                        <Link href="https://github.com/tsahil01/pose-detection" target="_blank">
                            <Button className="text-md flex flex-row justify-between gap-2 rounded-full px-4 py-1">
                                <p className="w-auto my-auto text-sm">
                                    {"Star us on"}
                                </p>
                                <Github className="w-4 h-4 my-auto" />
                            </Button>
                        </Link>
                    </div>

                    <div className="md:text-6xl lg:text-7xl sm:text-5xl text-3xl text-center  font-semibold mx-auto flex flex-col">
                        Ever Tried Perfecting
                        <span>Every Rep?</span>
                    </div>

                    <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl text-center">
                        FitTrack uses advanced pose detection to help you achieve the perfect form in your workouts. Get real-time feedback and track your progress like never before.
                    </p>

                    <div className="flex md:flex-row flex-col justify-center md:gap-7 gap-4 mt-6">
                        {/* <Button size={'lg'}>Explore Features</Button> */}
                        <Button className="flex flex-row gap-3" size={"lg"}
                            onClick={() => {
                                router.push("/dashboard");
                            }}
                        >{"Get Started"}
                            <MoveRight className="w-5 h-5" />
                        </Button>
                    </div>
                </div>

                <div className="flex pt-5 mt-9 my-auto w-full mx-auto">
                    <img src="https://ai.google.dev/static/edge/mediapipe/images/solutions/examples/pose_detector.png" alt="" className="rounded-3xl mx-auto" />
                </div>

            </div>
        </div>
    </>
}
