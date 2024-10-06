"use client";

import { useEffect, useRef, useState } from "react";
import { FilesetResolver, PoseLandmarker } from "@mediapipe/tasks-vision";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

const MODEL_PATH = "/models/pose_landmarker_full.task";

const POSE_CONNECTIONS = [
  [0, 1],
  [1, 2],
  [2, 3],
  [3, 7],
  [0, 4],
  [4, 5],
  [5, 6],
  [6, 8],
  [9, 10],
  [11, 12],
  [11, 13],
  [13, 15],
  [15, 17],
  [15, 19],
  [15, 21],
  [17, 19],
  [12, 14],
  [14, 16],
  [16, 18],
  [16, 20],
  [16, 22],
  [18, 20],
  [11, 23],
  [12, 24],
  [23, 24],
  [23, 25],
  [24, 26],
  [25, 27],
  [26, 28],
  [27, 29],
  [28, 30],
  [29, 31],
  [30, 32],
  [27, 31],
  [28, 32],
];

type LandmarkPoint = {
  x: number;
  y: number;
};

export default function PoseDetection() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [poseLandmarker, setPoseLandmarker] = useState<PoseLandmarker | null>(
    null
  );
  const [isVideoReady, setIsVideoReady] = useState(false);
  const [angle, setAngle] = useState(30);

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
              aspectRatio: 4 / 3,
            },
          });
          videoRef.current.srcObject = stream;
        } catch (error) {
          console.error("Error accessing the camera:", error);
        }
      }
    };

    initializePoseLandmarker();

    return () => {
      const video = videoRef.current;
      if (video && video.srcObject) {
        const tracks = (video.srcObject as MediaStream).getTracks();
        tracks.forEach((track) => track.stop());
      }
    };
  }, []);

  const calculateAngle = (
    pointA: LandmarkPoint,
    pointB: LandmarkPoint,
    pointC: LandmarkPoint
  ): number => {
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

  useEffect(() => {
    const frameHandler = async () => {
      if (
        poseLandmarker &&
        videoRef.current &&
        canvasRef.current &&
        isVideoReady
      ) {
        // Handle video frame processing
      }
      requestAnimationFrame(frameHandler);
    };

    if (isVideoReady && poseLandmarker) {
      requestAnimationFrame(frameHandler);
    }
  }, [isVideoReady, poseLandmarker]);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-6 text-center">Pose Detection</h1>
      <div className="flex flex-col items-center">
        <Card className="w-full max-w-[640px]">
          <CardHeader>
            <CardTitle>Video Feed</CardTitle>
          </CardHeader>
          <CardContent>
            
            <div className="relative" style={{ aspectRatio: "4/3" }}>
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
            <Progress value={angle - 30} max={90} className="w-full h-4" />
            <p className="mt-2 text-sm text-muted-foreground text-center">
              Range: 30° (arm extended) to 120° (fully curled)
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
