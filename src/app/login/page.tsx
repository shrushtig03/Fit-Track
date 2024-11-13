
import { LoginMain } from "@/components/LoginMain";


export default function Home() {
  return (
    <>
      <div className="flex flex-col min-h-screen w-full mx-auto">
        <div className="flex-grow">
          <LoginMain />
        </div>
      </div>
    </>
  )
}