import Link from "next/link";
import { ThemeToggle } from "./ThemeChangerButton";


export function Footer() {
    return (
        <>
            <footer className="flex  gap-2 lex-row py-3 w-full shrink-0 justify-between px-4 md:px-6 border-t">
                <p className="text-xs text-gray-500 dark:text-gray-400 my-auto">
                    © {new Date().getFullYear()} FitTrack
                </p>
                <div className="sm:ml-auto flex md:gap-4 gap-2">
                    <ThemeToggle />
                    <Link className="text-xs hover:underline underline-offset-4 my-auto" href="/privacy">
                        Privacy Policy
                    </Link>
                </div>
            </footer>
        </>
    );
}