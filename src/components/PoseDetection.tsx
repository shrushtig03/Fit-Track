"use client";

import { useEffect, useRef, useState } from "react";
import { FilesetResolver, PoseLandmarker } from "@mediapipe/tasks-vision";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import clsx from 'clsx';

const MODEL_PATH = "/models/pose_landmarker_full.task";

const POSE_CONNECTIONS = [
  [0, 1], [1, 2], [2, 3], [3, 7], [0, 4], [4, 5], [5, 6], [6, 8], [9, 10],
  [11, 12], [11, 13], [13, 15], [15, 17], [15, 19], [15, 21], [17, 19],
  [12, 14], [14, 16], [16, 18], [16, 20], [16, 22], [18, 20], [11, 23],
  [12, 24], [23, 24], [23, 25], [24, 26], [25, 27], [26, 28], [27, 29],
  [28, 30], [29, 31], [30, 32], [27, 31], [28, 32],
];

const TOTAL_BLOCKS = 18; // One block per 10 degrees

export default function PoseDetection() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [poseLandmarker, setPoseLandmarker] = useState<PoseLandmarker | null>(null);
  const [isVideoReady, setIsVideoReady] = useState(false);
  const [angle, setAngle] = useState(180);

  useEffect(() => {
    const initializePoseLandmarker = async () => {
      const vision = await FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
      );
      const landmarker = await PoseLandmarker.createFromOptions(vision, {
        baseOptions: { modelAssetPath: MODEL_PATH },
        runningMode: "VIDEO",
        numPoses: 1,
        minPoseDetectionConfidence: 0.5,
        minPosePresenceConfidence: 0.5,
        minTrackingConfidence: 0.5,
      });

      setPoseLandmarker(landmarker);

      if (videoRef.current) {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ 
            video: { 
              width: { ideal: 640 },
              height: { ideal: 480 },
              aspectRatio: 4/3 
            } 
          });
          videoRef.current.srcObject = stream;
        } catch (error) {
          console.error("Error accessing the camera:", error);
        }
      }
    };

    initializePoseLandmarker();

    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
        tracks.forEach((track) => track.stop());
      }
    };
  }, []);

  const calculateAngle = (pointA: any, pointB: any, pointC: any) => {
    const ABx = pointA.x - pointB.x;
    const ABy = pointA.y - pointB.y;
    const BCx = pointC.x - pointB.x;
    const BCy = pointC.y - pointB.y;

    const dotProduct = ABx * BCx + ABy * BCy;
    const magnitudeAB = Math.sqrt(ABx * ABx + ABy * ABy);
    const magnitudeBC = Math.sqrt(BCx * BCx + BCy * BCy);

    const angleRad = Math.acos(dotProduct / (magnitudeAB * magnitudeBC));
    return (angleRad * 180) / Math.PI;
  };

  const handleVideoFrame = async () => {
    if (poseLandmarker && videoRef.current && canvasRef.current && isVideoReady) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const canvasCtx = canvas.getContext("2d");

      if (canvasCtx) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        canvasCtx.clearRect(0, 0, canvas.width, canvas.height);
        canvasCtx.drawImage(video, 0, 0, canvas.width, canvas.height);

        const poseResults = await poseLandmarker.detectForVideo(video, performance.now());

        if (poseResults.landmarks) {
          poseResults.landmarks.forEach((pose) => {
            const shoulder = pose[12]; // Right shoulder
            const elbow = pose[14]; // Right elbow
            const wrist = pose[16]; // Right wrist

            const angle = calculateAngle(shoulder, elbow, wrist);
            setAngle(Math.round(Math.max(0, Math.min(180, angle))));

            // Draw landmarks with numbers
            pose.forEach((landmark, index) => {
              canvasCtx.fillStyle = "red";
              canvasCtx.beginPath();
              canvasCtx.arc(landmark.x * canvas.width, landmark.y * canvas.height, 5, 0, 2 * Math.PI);
              canvasCtx.fill();

              canvasCtx.fillStyle = "yellow";
              canvasCtx.font = "12px Arial";
              canvasCtx.fillText(`${index}`, landmark.x * canvas.width + 6, landmark.y * canvas.height - 6);
            });

            // Draw arm lines according to progress bar colors
            const drawArmLine = (start: number, end: number, color: string) => {
              const startLandmark = pose[start];
              const endLandmark = pose[end];
              if (startLandmark && endLandmark) {
                canvasCtx.strokeStyle = color;
                canvasCtx.lineWidth = 4;
                canvasCtx.beginPath();
                canvasCtx.moveTo(startLandmark.x * canvas.width, startLandmark.y * canvas.height);
                canvasCtx.lineTo(endLandmark.x * canvas.width, endLandmark.y * canvas.height);
                canvasCtx.stroke();
              }
            };

            const getLineColor = (angle: number) => {
              if (angle > 120 || angle < 45) return "blue";
              if (angle >= 60 && angle <= 120) return "yellow";
              return "green";
            };

            drawArmLine(12, 14, getLineColor(angle)); // Shoulder to elbow
            drawArmLine(14, 16, getLineColor(angle)); // Elbow to wrist

            // Draw other connections
            POSE_CONNECTIONS.forEach(([start, end]) => {
              if (
                (start !== 12 || end !== 14) && // Not shoulder to elbow
                (start !== 14 || end !== 16) // Not elbow to wrist
              ) {
                const startLandmark = pose[start];
                const endLandmark = pose[end];
                if (startLandmark && endLandmark) {
                  canvasCtx.strokeStyle = "white";
                  canvasCtx.lineWidth = 6;
                  canvasCtx.beginPath();
                  canvasCtx.moveTo(startLandmark.x * canvas.width, startLandmark.y * canvas.height);
                  canvasCtx.lineTo(endLandmark.x * canvas.width, endLandmark.y * canvas.height);
                  canvasCtx.stroke();
                }
              }
            });
          });
        }
      }
    }

    requestAnimationFrame(handleVideoFrame);
  };

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.onloadedmetadata = () => {
        setIsVideoReady(true);
      };
    }
  }, []);

  useEffect(() => {
    if (isVideoReady && poseLandmarker) {
      requestAnimationFrame(handleVideoFrame);
    }
  }, [isVideoReady, poseLandmarker]);

  const getBlockColor = (blockIndex: number) => {
    const blockAngle = (blockIndex + 1) * 10;
    if (blockAngle > 120 || blockAngle <= 45) return "bg-blue-500";
    if (blockAngle > 60 && blockAngle <= 120) return "bg-yellow-500";
    return "bg-green-500";
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-6 text-center">Pose Detection</h1>
      <div className="flex flex-col items-center">
        <Card className="w-full max-w-[640px]">
          <CardHeader>
            <CardTitle>Video Feed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative" style={{ aspectRatio: '4/3' }}>
              <video
                ref={videoRef}
                className="w-full h-full object-cover rounded-lg"
                autoPlay
                playsInline
                muted
              />
              <canvas
                ref={canvasRef}
                className="absolute top-0 left-0 w-full h-full rounded-lg"
              />
            </div>
          </CardContent>
        </Card>
        <Card className="w-full max-w-[640px] mt-4">
          <CardHeader>
            <CardTitle>Biceps Curl Angle</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold mb-2 text-center">{angle}°</div>
            <div className="flex justify-between w-full h-8 bg-secondary rounded-full overflow-hidden">
              {Array.from({ length: TOTAL_BLOCKS }).map((_, index) => (
                <div
                  key={index}
                  className={clsx(
                    "w-full h-full transition-all duration-300 ease-in-out border-r border-secondary last:border-r-0",
                    index < Math.floor(angle / 10) ? getBlockColor(index) : "bg-secondary"
                  )}
                />
              ))}
            </div>
            <p className="mt-2 text-sm text-muted-foreground text-center">
              Range: 0° (fully curled) to 180° (arm extended)
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}