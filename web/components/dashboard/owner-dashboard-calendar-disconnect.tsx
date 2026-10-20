"use client"

import axios from "axios"
import { useState } from "react"
import { LoaderCircle, Unplug } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

interface OwnerDashboardCalendarDisconnectProps {
    onDisconnected: () => void
    onError: (message: string) => void
}

export function OwnerDashboardCalendarDisconnect({
    onDisconnected,
    onError,
}: OwnerDashboardCalendarDisconnectProps) {
    const [open, setOpen] = useState(false)
    const [disconnecting, setDisconnecting] = useState(false)
    const [error, setError] = useState("")

    async function handleDisconnect() {
        if (disconnecting) return

        setDisconnecting(true)
        setError("")
        onError("")

        try {
            await axios.delete("/api/auth/calendar/disconnect", {
                withCredentials: true,
            })

            setOpen(false)
            onDisconnected()
        } catch (reason) {
            const message = axios.isAxiosError(reason)
                ? reason.response?.data?.message ??
                reason.response?.data?.error ??
                "Could not disconnect Google Calendar."
                : "Could not disconnect Google Calendar."

            setError(message)
            onError(message)
        } finally {
            setDisconnecting(false)
        }
    }

    return (
        <>
            <AlertDialog
                open={open}
                onOpenChange={(nextOpen) => {
                    if (disconnecting) return
                    setOpen(nextOpen)
                    if (nextOpen) setError("")
                }}
            >
                <AlertDialogTrigger asChild>
                    <button
                        type="button"
                        title="Disconnect Google Calendar"
                        className="mt-2.5 inline-flex items-center gap-1.5 text-sm text-[#8A8A8A] transition-colors hover:text-[#FF6B5E]"
                    >
                        <Unplug size={14} />
                        Disconnect Calendar
                    </button>
                </AlertDialogTrigger>

                <AlertDialogContent className="border-[#2B2B2B] bg-black text-white">
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            Disconnect Google Calendar?
                        </AlertDialogTitle>

                        <AlertDialogDescription className="text-[#A0A0A0]">
                            MCP clients will no longer be able to use your connected Google
                            Calendar through this account. You can reconnect it later.
                        </AlertDialogDescription>
                    </AlertDialogHeader>

                    {error && (
                        <p role="alert" className="text-sm text-[#FF6B5E]">
                            {error}
                        </p>
                    )}

                    <AlertDialogFooter>
                        <AlertDialogCancel
                            size="default"
                            variant="outline"
                            disabled={disconnecting}
                            className="rounded-sm border-[#3A3A3A] bg-transparent text-sm text-white hover:bg-[#222] hover:text-white"
                        >
                            Cancel
                        </AlertDialogCancel>

                        <AlertDialogAction
                            size="default"
                            variant="destructive"
                            disabled={disconnecting}
                            onClick={(event) => {
                                event.preventDefault()
                                void handleDisconnect()
                            }}
                            className="rounded-sm bg-[#FF6B5E] text-sm font-semibold text-black hover:bg-[#FF8176]"
                        >
                            {disconnecting ? (
                                <>
                                    <LoaderCircle size={16} className="mr-2 animate-spin" />
                                    Disconnecting...
                                </>
                            ) : (
                                "Disconnect Calendar"
                            )}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    )
}