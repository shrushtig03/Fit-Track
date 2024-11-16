import { Footer } from "@/components/Footer";
import TopBar from "@/components/Topbar";
import { DashboardMain } from "../DashboardMain";

export default function Page() {
  return (
    <>
     <div className="flex flex-col min-h-screen w-full mx-auto">
      <TopBar />
      <div className="flex-grow mt-9">
        <DashboardMain />
      </div>
      <Footer />
    </div>
    </>
  )
}