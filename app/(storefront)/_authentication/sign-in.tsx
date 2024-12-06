"use client";
import { UserAuthForm } from "./_components/user-auth-form";
import Image from "next/image";

export default function SignIn() {
  return (
    <>
      <div className="container px-6 relative grid h-svh flex-col items-center justify-center lg:max-w-none lg:grid-cols-2 lg:px-0">
        <div className="relative hidden h-full flex-col bg-muted text-white dark:border-r lg:flex">
          <div className="relative inset-0 bg-zinc-900" />
          <div className="absolute z-20 flex items-center text-lg font-medium p-4">
            <h2 className="text-4xl font-extrabold tracking-widest">
              <span className="text-[#027DFD]">Tracker</span>
              <span className="text-[#99CBFE]">Nest</span>
            </h2>
          </div>

          <Image
            src="https://res.cloudinary.com/de6w2afj5/image/upload/v1733239303/track-nest_atn9ca.jpg"
            className="relative m-auto h-full w-full object-cover"
            width={1000}
            height={1000}
            alt="Nexit"
          />
        </div>
        <div className="lg:p-8">
          <div className="mx-auto flex w-full flex-col justify-center space-y-2 sm:w-[350px]">
            <div className="flex flex-col space-y-2 text-left">
              <h1 className="text-2xl font-semibold tracking-tight">Login</h1>
              <p className="text-sm text-muted-foreground">
                Enter your email and password below <br />
                to log into your account
              </p>
            </div>
            <UserAuthForm />
            <p className="px-8 text-center text-sm text-muted-foreground">
              This project was built by{" "}
              <a
                href="https://cervantesklc.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary font-bold"
              >
                Aya Lage
              </a>
              , a talented developer with a passion for creating innovative
              solutions.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
