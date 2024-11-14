"use client"

import { useEffect, useRef, useState } from "react"
import { FilesetResolver, PoseLandmarker } from "@mediapipe/tasks-vision"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CheckCircle2, XCircle, Activity, Dumbbell } from 'lucide-react'
import { Button } from "@/components/ui/button"

const MODEL_PATH = "/models/pose_landmarker_full.task"

const POSE_CONNECTIONS = [
  [0, 1], [1, 2], [2, 3], [3, 7], [0, 4], [4, 5], [5, 6], [6, 8], [9, 10],
  [11, 12], [11, 13], [13, 15], [15, 17], [15, 19], [15, 21], [17, 19],
  [12, 14], [14, 16], [16, 18], [16, 20], [16, 22], [18, 20], [11, 23],
  [12, 24], [23, 24], [23, 25], [24, 26], [25, 27], [26, 28], [27, 29],
  [28, 30], [29, 31], [30, 32], [27, 31], [28, 32],
]

const EXERCISES = {
  bicepCurl: {
    name: "Bicep Curl",
    landmarks: [12, 14, 16],
    targetAngle: { min: 30, max: 45 }, // Standard for bicep curl contraction
    range: { min: 0, max: 180 },
  },
  squat: {
    name: "Squat",
    landmarks: [24, 26, 28],
    targetAngle: { min: 70, max: 100 }, // Squat angle for proper depth
    range: { min: 0, max: 180 },
  },
  deadlift: {
    name: "Deadlift",
    landmarks: [12, 24, 26],
    targetAngle: { min: 10, max: 30 }, // Small angle for hip hinge in deadlift
    range: { min: 0, max: 180 },
  },
  benchPress: {
    name: "Bench Press",
    landmarks: [12, 14, 16],
    targetAngle: { min: 75, max: 100 }, // Approximate arm angle in bench press
    range: { min: 0, max: 180 },
  },
  lunge: {
    name: "Lunge",
    landmarks: [24, 26, 28],
    targetAngle: { min: 80, max: 100 }, // Angle for knee position in lunge
    range: { min: 0, max: 180 },
  },
  pullUp: {
    name: "Pull-up",
    landmarks: [12, 14, 16],
    targetAngle: { min: 70, max: 90 }, // Upper arm angle in pull-up
    range: { min: 0, max: 180 },
  },
}

export default function PoseDetection() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [poseLandmarker, setPoseLandmarker] = useState<PoseLandmarker | null>(null)
  const [isVideoReady, setIsVideoReady] = useState(false)
  const [angle, setAngle] = useState(180)
  const [selectedExercise, setSelectedExercise] = useState("bicepCurl")
  const [repCount, setRepCount] = useState(0)
  const [isInTargetPosition, setIsInTargetPosition] = useState(false)
  const [feedback, setFeedback] = useState("")
  const [isDetecting, setIsDetecting] = useState(false)

  useEffect(() => {
    const initializePoseLandmarker = async () => {
      const vision = await FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
      )
      const landmarker = await PoseLandmarker.createFromOptions(vision, {
        baseOptions: { modelAssetPath: MODEL_PATH },
        runningMode: "VIDEO",
        numPoses: 1,
        minPoseDetectionConfidence: 0.5,
        minPosePresenceConfidence: 0.5,
        minTrackingConfidence: 0.5,
      })

      setPoseLandmarker(landmarker)

      if (videoRef.current) {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ 
            video: { 
              width: { ideal: 640 },
              height: { ideal: 480 },
              aspectRatio: 4/3 
            } 
          })
          videoRef.current.srcObject = stream
        } catch (error) {
          console.error("Error accessing the camera:", error)
        }
      }
    }

    initializePoseLandmarker()

    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const tracks = (videoRef.current.srcObject as MediaStream).getTracks()
        tracks.forEach((track) => track.stop())
      }
    }
  }, [])

  const calculateAngle = (pointA: any, pointB: any, pointC: any) => {
    const ABx = pointA.x - pointB.x
    const ABy = pointA.y - pointB.y
    const BCx = pointC.x - pointB.x
    const BCy = pointC.y - pointB.y

    const dotProduct = ABx * BCx + ABy * BCy
    const magnitudeAB = Math.sqrt(ABx * ABx + ABy * ABy)
    const magnitudeBC = Math.sqrt(BCx * BCx + BCy * BCy)

    const angleRad = Math.acos(dotProduct / (magnitudeAB * magnitudeBC))
    return (angleRad * 180) / Math.PI
  }

  const handleVideoFrame = async () => {
    if (poseLandmarker && videoRef.current && canvasRef.current && isVideoReady && isDetecting) {
      const video = videoRef.current
      const canvas = canvasRef.current
      const canvasCtx = canvas.getContext("2d")

      if (canvasCtx) {
        canvas.width = video.videoWidth
        canvas.height = video.videoHeight

        canvasCtx.clearRect(0, 0, canvas.width, canvas.height)
        canvasCtx.drawImage(video, 0, 0, canvas.width, canvas.height)

        const poseResults = await poseLandmarker.detectForVideo(video, performance.now())

        if (poseResults.landmarks) {
          poseResults.landmarks.forEach((pose) => {
            const exercise = EXERCISES[selectedExercise as keyof typeof EXERCISES]
            const [pointA, pointB, pointC] = exercise.landmarks.map(index => pose[index])

            const calculatedAngle = calculateAngle(pointA, pointB, pointC)
            setAngle(Math.round(Math.max(0, Math.min(180, calculatedAngle))))

            const inTargetPosition = calculatedAngle >= exercise.targetAngle.min && calculatedAngle <= exercise.targetAngle.max
            if (inTargetPosition && !isInTargetPosition) {
              setRepCount(prev => prev + 1)
              setFeedback("Great job! Keep going!")
            } else if (!inTargetPosition) {
              setFeedback("Adjust your form to reach the target position.")
            }
            setIsInTargetPosition(inTargetPosition)

            pose.forEach((landmark, index) => {
              canvasCtx.fillStyle = "red"
              canvasCtx.beginPath()
              canvasCtx.arc(landmark.x * canvas.width, landmark.y * canvas.height, 5, 0, 2 * Math.PI)
              canvasCtx.fill()

              canvasCtx.fillStyle = "yellow"
              canvasCtx.font = "12px Arial"
              canvasCtx.fillText(`${index}`, landmark.x * canvas.width + 6, landmark.y * canvas.height - 6)
            })

            const drawExerciseLine = (start: number, end: number, color: string) => {
              const startLandmark = pose[start]
              const endLandmark = pose[end]
              if (startLandmark && endLandmark) {
                canvasCtx.strokeStyle = color
                canvasCtx.lineWidth = 4
                canvasCtx.beginPath()
                canvasCtx.moveTo(startLandmark.x * canvas.width, startLandmark.y * canvas.height)
                canvasCtx.lineTo(endLandmark.x * canvas.width, endLandmark.y * canvas.height)
                canvasCtx.stroke()
              }
            }

            const getLineColor = (angle: number) => {
              if (angle < exercise.targetAngle.min || angle > exercise.targetAngle.max) return "blue"
              return "green"
            }

            drawExerciseLine(exercise.landmarks[0], exercise.landmarks[1], getLineColor(calculatedAngle))
            drawExerciseLine(exercise.landmarks[1], exercise.landmarks[2], getLineColor(calculatedAngle))

            POSE_CONNECTIONS.forEach(([start, end]) => {
              if (!exercise.landmarks.includes(start) || !exercise.landmarks.includes(end)) {
                const startLandmark = pose[start]
                const endLandmark = pose[end]
                if (startLandmark && endLandmark) {
                  canvasCtx.strokeStyle = "white"
                  canvasCtx.lineWidth = 2
                  canvasCtx.beginPath()
                  canvasCtx.moveTo(startLandmark.x * canvas.width, startLandmark.y * canvas.height)
                  canvasCtx.lineTo(endLandmark.x * canvas.width, endLandmark.y * canvas.height)
                  canvasCtx.stroke()
                }
              }
            })
          })
        }
      }
    }

    requestAnimationFrame(handleVideoFrame)
  }

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.onloadedmetadata = () => {
        setIsVideoReady(true)
      }
    }
  }, [])

  useEffect(() => {
    if (isVideoReady && poseLandmarker) {
      requestAnimationFrame(handleVideoFrame)
    }
  }, [isVideoReady, poseLandmarker, selectedExercise, isDetecting])

  const getProgressColor = () => {
    const exercise = EXERCISES[selectedExercise as keyof typeof EXERCISES]
    if (angle < exercise.targetAngle.min) return "bg-blue-500"
    if (angle > exercise.targetAngle.max) return "bg-yellow-500"
    return "bg-green-500"
  }

  return (
    <div className="mx-auto px-4 py-8 bg-gray-100 min-h-screen">
      <h1 className="text-4xl font-bold mb-6 text-center text-primary">Multi-Exercise Pose Detection</h1>
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="w-full lg:w-1/2">
          <Card className="w-full shadow-lg">
            <CardHeader className="bg-primary text-primary-foreground">
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-6 h-6" />
                Video Feed
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="relative aspect-video">
                <video
                  ref={videoRef}
                  className="w-full h-full object-cover"
                  autoPlay
                  playsInline
                  muted
                />
                <canvas
                  ref={canvasRef}
                  className="absolute top-0 left-0 w-full h-full"
                />
              </div>
            </CardContent>
          </Card>
        </div>
        <div className="w-full lg:w-1/2 space-y-6">
          <Card className="shadow-lg">
            <CardHeader className="bg-secondary text-secondary-foreground">
              <CardTitle className="flex items-center gap-2">
                <Dumbbell className="w-6 h-6" />
                Exercise Selection
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <Select onValueChange={setSelectedExercise} defaultValue={selectedExercise}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select an exercise" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(EXERCISES).map(([key, exercise]) => (
                    <SelectItem key={key} value={key}>{exercise.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>
          <Card className="shadow-lg">
            <CardHeader className="bg-accent text-accent-foreground">
              <CardTitle>{EXERCISES[selectedExercise as keyof typeof EXERCISES].name} Analysis</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="font-medium">Current Angle:</span>
                  <span className="font-bold text-lg">{angle}°</span>
                </div>
                <Progress
                  value={(angle / 180) * 100}
                  className={`h-3 ${getProgressColor()}`}
                />
              </div>
              <div className="flex justify-between items-center bg-muted p-3 rounded-md">
                <span className="font-semibold">Target Range:</span>
                <span className="text-primary font-medium">
                  {EXERCISES[selectedExercise as keyof typeof EXERCISES].targetAngle.min}° - {EXERCISES[selectedExercise as keyof typeof EXERCISES].targetAngle.max}°
                </span>
              </div>
              <div className="flex justify-between items-center bg-muted p-3 rounded-md">
                <span className="font-semibold">Repetition Count:</span>
                <span className="text-2xl font-bold text-primary">{repCount}</span>
              </div>
              <Alert variant={isInTargetPosition ? "default" : "destructive"} className="mt-4">
                <AlertTitle className="flex items-center gap-2">
                  {isInTargetPosition ? (
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-500" />
                  )}
                  <span>{isInTargetPosition ? "Good Form" : "Adjust Form"}</span>
                </AlertTitle>
                <AlertDescription>{feedback}</AlertDescription>
              </Alert>
              <Button 
                className={`w-full ${isDetecting ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'}`}
                onClick={() => setIsDetecting(!isDetecting)}
              >
                {isDetecting ? 'Stop Detection' : 'Start Detection'}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}