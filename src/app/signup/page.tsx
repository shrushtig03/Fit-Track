
import { SignUpMain } from "@/components/SignUpMain";


export default function Home() {
  return (
    <>
      <div className="flex flex-col min-h-screen w-full mx-auto">
        <div className="flex-grow">
          <SignUpMain />
        </div>
      </div>
    </>
  )
}