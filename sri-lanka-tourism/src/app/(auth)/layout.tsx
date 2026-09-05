import Link from "next/link";
import React from "react";

export default function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-gradient-to-br from-emerald-950 via-slate-900 to-teal-950">
            {/* Brand logo */}
            <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
                <Link href="/" className="inline-flex items-center gap-2 text-2xl font-extrabold text-white tracking-tight">
                    🌴 Sri Lanka Tourism
                </Link>
            </div>

            {/* Card container */}
            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
                <div className="bg-white py-8 px-6 shadow-2xl rounded-3xl sm:px-10 border border-gray-100">
                    {children}
                </div>
            </div>
        </div>
    );
}
