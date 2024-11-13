import {  HeartPulse, LogIn } from "lucide-react";
import Link from "next/link";
import { Button } from "./ui/button";
import { ThemeToggle } from "./ThemeChangerButton";

export default function TopBar() {
  return (
    <header className="w-full">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/">
          <div className="flex items-center space-x-2">
            <HeartPulse className="w-8 h-8" />
            <h1 className="text-xl font-bold">FitTrack AI</h1>
          </div>
        </Link>

        <div className="flex items-center gap-8">
          <nav className="flex items-center space-x-4">
            <Link
              className="hidden md:flex text-sm font-medium hover:underline underline-offset-4"
              href="/dashboard"
            >
              Dashboard
            </Link>
            <Link
              className="hidden md:flex text-sm font-medium hover:underline underline-offset-4"
              href="/#features"
            >
              Features
            </Link>
            <Link
              className="hidden md:flex text-sm font-medium hover:underline underline-offset-4"
              href="/contact"
            >
              Contact
            </Link>
            <Button variant={'outline'} className="flex flex-row gap-2">
              <div className="my-auto">
                SignIn
              </div>
              <LogIn className="w-5 h-5 my-auto hidden md:flex" />
            </Button>
            <ThemeToggle/>
          </nav>

        </div>
      </div>
    </header>
  )
}