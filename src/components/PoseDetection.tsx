"use client"

import { useEffect, useRef, useState } from "react"
import { FilesetResolver, PoseLandmarker } from "@mediapipe/tasks-vision"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CheckCircle2, XCircle, Activity, Dumbbell, Clock, RotateCcw } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"

const MODEL_PATH = "/models/pose_landmarker_full.task"

interface point{
  x: number;
  y: number;
  z: number;
  visibility: number; 
}

const POSE_CONNECTIONS = [
  [11, 12], [11, 13], [13, 15], [15, 17], [15, 19], [15, 21], [17, 19],
  [12, 14], [14, 16], [16, 18], [16, 20], [16, 22], [18, 20], [11, 23],
  [12, 24], [23, 24], [23, 25], [24, 26], [25, 27], [26, 28], [27, 29],
  [28, 30], [29, 31], [30, 32], [27, 31], [28, 32],
]

const EXERCISES = {
  bicepCurl: {
    name: "Bicep Curl",
    landmarks: { left: [11, 13, 15], right: [12, 14, 16] },
    targetAngle: { min: 30, max: 50 },
    range: { min: 0, max: 180 },
  },
  squat: {
    name: "Squat",
    landmarks: { left: [23, 25, 27], right: [24, 26, 28] },
    targetAngle: { min: 70, max: 100 },
    range: { min: 0, max: 180 },
  },
  deadlift: {
    name: "Deadlift",
    landmarks: { left: [11, 23, 25], right: [12, 24, 26] },
    targetAngle: { min: 10, max: 45 },
    range: { min: 0, max: 180 },
  },
  benchPress: {
    name: "Bench Press",
    landmarks: { left: [11, 13, 15], right: [12, 14, 16] },
    targetAngle: { min: 75, max: 100 },
    range: { min: 0, max: 180 },
  },
  lunge: {
    name: "Lunge",
    landmarks: { left: [23, 25, 27], right: [24, 26, 28] },
    targetAngle: { min: 80, max: 100 },
    range: { min: 0, max: 180 },
  },
  pullUp: {
    name: "Pull-up",
    landmarks: { left: [11, 13, 15], right: [12, 14, 16] },
    targetAngle: { min: 70, max: 90 },
    range: { min: 0, max: 180 },
  },
}

export default function Component() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [poseLandmarker, setPoseLandmarker] = useState<PoseLandmarker | null>(null)
  const [isVideoReady, setIsVideoReady] = useState(false)
  const [angle, setAngle] = useState(180)
  const [selectedExercise, setSelectedExercise] = useState("bicepCurl")
  const [selectedSide, setSelectedSide] = useState("right")
  const [repCount, setRepCount] = useState(0)
  const [isInTargetPosition, setIsInTargetPosition] = useState(false)
  const [feedback, setFeedback] = useState("")
  const [isDetecting, setIsDetecting] = useState(false)
  const [hasLeftTargetPosition, setHasLeftTargetPosition] = useState(true)
  const [startTime, setStartTime] = useState<number | null>(null)
  const [elapsedTime, setElapsedTime] = useState(0)
  const [showReport, setShowReport] = useState(false)
  const [report, setReport] = useState<{
    exercise: string;
    side: string;
    reps: number;
    duration: string;
    averageAngle: number;
  } | null>(null)
  let isInRange = false;
  let angleSum = 0;
  let angleCount = 0;

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
              aspectRatio: 4 / 3
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

  const calculateAngle = (pointA: point, pointB: point, pointC: point) => {
    if(pointA.visibility < 0.5 || pointB.visibility < 0.5 || pointC.visibility < 0.5) {
      setFeedback("Not all points are visible")
      return 0;
    };
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
            const [pointA, pointB, pointC] = exercise.landmarks[selectedSide].map(index => pose[index])

            const calculatedAngle = calculateAngle(pointA, pointB, pointC)
            setAngle(Math.round(Math.max(0, Math.min(180, calculatedAngle))))

            // Update angle sum and count for average calculation
            angleSum += calculatedAngle
            angleCount++

            if (calculatedAngle >= exercise.targetAngle.min && calculatedAngle <= exercise.targetAngle.max) {
              if (!isInRange) {
                isInRange = true
                console.log("In range")
                setRepCount(prev => prev + 1)
              }
            } else {
              if (isInRange) {
                isInRange = false
                console.log("Out of range")
              }
            }

            const inTargetPosition = calculatedAngle >= exercise.targetAngle.min && calculatedAngle <= exercise.targetAngle.max

            if (inTargetPosition && hasLeftTargetPosition) {
              setFeedback("Great job! Keep going!")
              setHasLeftTargetPosition(false)
            } else if (!inTargetPosition) {
              setHasLeftTargetPosition(true)
              setFeedback("Adjust your form to reach the target position.")
            }

            setIsInTargetPosition(inTargetPosition)

            pose.forEach((landmark, index) => {
              // no need to draw landmarks for index 0 to 10
              if (index < 11) return;
              canvasCtx.fillStyle = "darkgoldenrod"
              canvasCtx.beginPath()
              canvasCtx.arc(landmark.x * canvas.width , landmark.y * canvas.height, 8, 0, 2 * Math.PI)
              canvasCtx.fill()
            })

            // Draw angle at the middle point (pointB)
            const middlePointIndex = exercise.landmarks[selectedSide][1]
            const middlePoint = pose[middlePointIndex]
            canvasCtx.fillStyle = "white"
            canvasCtx.font = "bold 16px Arial"
            canvasCtx.fillText(
              `${Math.round(calculatedAngle)}°`,
              middlePoint.x * canvas.width,
              middlePoint.y * canvas.height - 20
            )

            const drawExerciseLine = (start: number, end: number, color: string) => {
              const startLandmark = pose[start]
              const endLandmark = pose[end]
              if (startLandmark && endLandmark) {
                canvasCtx.strokeStyle = color
                canvasCtx.lineWidth = 8 // Increased line width for bolder lines
                canvasCtx.beginPath()
                canvasCtx.moveTo(startLandmark.x * canvas.width, startLandmark.y * canvas.height)
                canvasCtx.lineTo(endLandmark.x * canvas.width, endLandmark.y * canvas.height)
                canvasCtx.stroke()
              }
            }

            const getLineColor = (angle: number) => {
              if (angle < exercise.targetAngle.min || angle > exercise.targetAngle.max) return "darkgoldenrod"
              return "lightgreen";
            }

            const exerciseLandmarks = exercise.landmarks[selectedSide]
            drawExerciseLine(exerciseLandmarks[0], exerciseLandmarks[1], getLineColor(calculatedAngle))
            drawExerciseLine(exerciseLandmarks[1], exerciseLandmarks[2], getLineColor(calculatedAngle))

            POSE_CONNECTIONS.forEach(([start, end]) => {
              if (!exerciseLandmarks.includes(start) || !exerciseLandmarks.includes(end)) {
                const startLandmark = pose[start]
                const endLandmark = pose[end]
                if (startLandmark && endLandmark) {
                  canvasCtx.strokeStyle = "rgba(255, 255, 255, 0.5)" // Semi-transparent white for other connections
                  canvasCtx.lineWidth = 6 // Thinner lines for non-exercise connections
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
  }, [isVideoReady, poseLandmarker, selectedExercise, selectedSide, isDetecting])

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isDetecting && startTime) {
      interval = setInterval(() => {
        setElapsedTime(Math.floor((Date.now() - startTime) / 1000))
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [isDetecting, startTime])

  const getProgressColor = () => {
    const exercise = EXERCISES[selectedExercise as keyof typeof EXERCISES]
    if (angle < exercise.targetAngle.min) return "bg-blue-500"
    if (angle > exercise.targetAngle.max) return "bg-yellow-500"
    return "bg-green-500"
  }

  const handleDetectionToggle = () => {
    if (!isDetecting) {
      setStartTime(Date.now())
      setElapsedTime(0)
      setRepCount(0)
      angleSum = 0
      angleCount = 0
      setIsDetecting(true)
    } else {
      setIsDetecting(false)
      const averageAngle = angleCount > 0 ? angleSum / angleCount : 0
      setReport({
        exercise: EXERCISES[selectedExercise as keyof typeof EXERCISES].name,
        side: selectedSide,
        reps: repCount,
        duration: formatTime(elapsedTime),
        averageAngle: Math.round(averageAngle),
      })
      setShowReport(true)
    }
  }

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  const resetSession = () => {
    setRepCount(0)
    setElapsedTime(0)
    setStartTime(null)
    setReport(null)
    setShowReport(false)
  }

  return (
    <div className="mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-6 text-center text-primary">Multi-Exercise Pose Bhanda</h1>
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
              <div className="relative aspect-auto">
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
            <CardContent className="pt-6 space-y-4">
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
              <div className="space-y-2">
                <Label>Side</Label>
                <RadioGroup defaultValue={selectedSide} onValueChange={setSelectedSide} className="flex space-x-4">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="left" id="left" />
                    <Label htmlFor="left">Left</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="right" id="right" />
                    <Label htmlFor="right">Right</Label>
                  </div>
                </RadioGroup>
              </div>
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
              <div className="flex justify-between items-center bg-muted p-3 rounded-md">
                <span className="font-semibold">Elapsed Time:</span>
                <span className="text-2xl font-bold text-primary">{formatTime(elapsedTime)}</span>
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
              <div className="flex gap-4">
                <Button
                  className={`flex-1 ${isDetecting ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'}`}
                  onClick={handleDetectionToggle}
                >
                  {isDetecting ? 'Stop Detection' : 'Start Detection'}
                </Button>
                <Button
                  className="flex-1 bg-gray-500 hover:bg-gray-600"
                  onClick={resetSession}
                  disabled={isDetecting}
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Reset
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      <Dialog open={showReport} onOpenChange={setShowReport}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Exercise Report</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="font-semibold">Exercise:</span>
                <span>{report?.exercise}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold">Side:</span>
                <span>{report?.side}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold">Total Repetitions:</span>
                <span>{report?.reps}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold">Duration:</span>
                <span>{report?.duration}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold">Average Angle:</span>
                <span>{report?.averageAngle}°</span>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => setShowReport(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}