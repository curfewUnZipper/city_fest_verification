"use client";

import React from "react";
import { useRouter } from "next/navigation";

const Page = () => {
  const router = useRouter();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-zinc-900 to-zinc-800 text-white px-6">
      <div className="max-w-xl text-center space-y-6">
        <span className="inline-block rounded-full bg-white/10 px-4 py-1 text-sm tracking-wide text-zinc-300">
          Developer Preview
        </span>

        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">
          City Fest
        </h1>

        <p className="text-zinc-400 text-lg">
          Welcome to the City Fest — where experiences and culture come together.
        </p>

      </div>
    </div>
  );
};

export default Page;
