"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function WorkspacesProjectsPage() {
    const router = useRouter();

    useEffect(() => {
        router.replace("/workspaces");
    }, [router]);

    return (
        <div className="flex items-center justify-center h-[60vh]">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
    );
}
