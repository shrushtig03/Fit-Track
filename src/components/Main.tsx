import { ArrowRight } from "lucide-react";
import { Button } from "./ui/button";

export function Main() {
    return <>
        <div className="flex flex-col container mt-3 mx-auto my-9">
            <div className="flex flex-col justify-between md:m-7">

                <div className="flex md:p-5 my-auto flex-col w-full gap-3">
                    <div className="flex justify-center">
                        <span className="text-md flex flex-row justify-between gap-2 rounded-full bg-primary text-white px-4 py-1">
                            <p className="w-auto my-auto text-sm">
                                {"Perfect Your Form with"}
                            </p>
                            <ArrowRight className="w-4 h-4 my-auto" />
                        </span>
                    </div>

                    <div className="md:text-6xl lg:text-7xl sm:text-5xl text-4xl text-center font-bold mx-auto flex flex-col">
                        Ever Tried Perfecting
                        <span>Every Rep?</span>
                    </div>

                    <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl text-center">
                        FitTrack uses advanced pose detection to help you achieve the perfect form in your workouts. Get real-time feedback and track your progress like never before.
                    </p>

                    <div className="flex flex-row justify-center gap-7 mt-6">
                        <Button>Explore Features</Button>
                        <Button variant={"outline"} size={"lg"}>{"Get Started"}
                            <ArrowRight className="w-5 h-5" />
                        </Button>
                    </div>
                </div>

                <div className="flex p-5 my-auto w-full mx-auto">
                    <img src="https://ai.google.dev/static/edge/mediapipe/images/solutions/examples/pose_detector.png" alt="" className="rounded-3xl mx-auto" />
                </div>

            </div>
        </div>
    </>
}
