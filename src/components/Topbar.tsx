"use client"

import {  HeartPulse, LogIn } from "lucide-react";
import Link from "next/link";
import { Button } from "./ui/button";
import { useRouter } from "next/navigation";
import { signOut, useSession } from "next-auth/react";

export default function TopBar() {
  const router = useRouter();
  const { data } = useSession();
  return (
    <header className="w-full">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/">
          <div className="flex items-center space-x-2">
            <HeartPulse className="w-8 h-8" />
            <h1 className="text-xl font-bold">FitTrack</h1>
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
            {/* <Link
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
            </Link> */}
            {
              data ? (
                <Button variant={'outline'} className="flex flex-row gap-2" onClick={() => signOut()}>
                  <div className="my-auto">
                    SignOut
                  </div>
                  <LogIn className="w-5 h-5 my-auto hidden md:flex" />
                </Button>
              ) : (
                <Button variant={'outline'} className="flex flex-row gap-2" onClick={() => router.push('/login')}>
                  <div className="my-auto">
                    SignIn
                  </div>
                  <LogIn className="w-5 h-5 my-auto hidden md:flex" />
                </Button>
              )
            }
          </nav>

        </div>
      </div>
    </header>
  )
}