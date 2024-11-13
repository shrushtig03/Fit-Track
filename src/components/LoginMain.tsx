import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { HeartPulse } from "lucide-react"
import Link from "next/link"

export function LoginMain() {
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
                <div className="flex flex-col items-center space-x-2 text-center mx-auto my-6">
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
                            <div className="grid w-full items-center gap-4">
                                <div className="flex flex-col space-y-1.5">
                                    <Label htmlFor="email">Email</Label>
                                    <Input id="email" type="email" placeholder="Enter your email" />
                                </div>
                                <div className="flex flex-col space-y-1.5">
                                    <Label htmlFor="password">Password</Label>
                                    <Input id="password" type="password" placeholder="Enter your password" />
                                </div>
                            </div>
                        </form>
                    </CardContent>
                    <CardFooter className="flex justify-center flex-col">
                        <Button>Sign In</Button>
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