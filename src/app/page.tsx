import { Footer } from "@/components/Footer";
import { Main } from "@/components/Main";
import TopBar from "@/components/Topbar";

export default function Home() {
  return (
    <>
     <div className="flex flex-col min-h-screen w-full mx-auto">
      <TopBar />
      <div className="flex-grow mt-9">
        <Main />
      </div>
      <Footer />
    </div>
    </>
  )
}