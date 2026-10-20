"use client"

import axios from "axios"
import { useState } from "react"
import { LoaderCircle, Trash2 } from "lucide-react"
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

interface OwnerDashboardDeleteAccountProps {
    onDeleted: () => void
}

export function OwnerDashboardDeleteAccount({
    onDeleted,
}: OwnerDashboardDeleteAccountProps) {
    const [open, setOpen] = useState(false)
    const [deleting, setDeleting] = useState(false)
    const [error, setError] = useState("")

    async function handleDelete() {
        if (deleting) return

        setDeleting(true)
        setError("")

        try {
            await axios.delete("/api/auth/me", {
                withCredentials: true,
            })

            setOpen(false)
            onDeleted()
        } catch (err) {
            setError(
                axios.isAxiosError(err)
                    ? err.response?.data?.message ||
                    "Unable to delete your account. Please try again."
                    : "Unable to delete your account. Please try again."
            )
        } finally {
            setDeleting(false)
        }
    }

    return (
        <div className="border-t border-[#2B2B2B] px-5 py-4">
            <AlertDialog
                open={open}
                onOpenChange={(nextOpen) => {
                    if (deleting) return

                    setOpen(nextOpen)
                    if (nextOpen) setError("")
                }}
            >
                <AlertDialogTrigger asChild>
                    <Button
                        type="button"
                        variant="outline"
                        className="gap-2 border-[#FF6B5E]/50 bg-transparent text-[#FF6B5E] hover:bg-[#FF6B5E]/10 hover:text-[#FF6B5E] rounded-sm text-xs"
                    >
                        <Trash2 />
                        Delete account
                    </Button>
                </AlertDialogTrigger>

                <AlertDialogContent className="border-[#2B2B2B] bg-black text-white">
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            Permanently delete your account?
                        </AlertDialogTitle>

                        <AlertDialogDescription className="text-[#A0A0A0]">
                            This action cannot be undone. Your account and associated data
                            will be permanently deleted, and you will lose access to your
                            connected services.
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
                            disabled={deleting}
                            className="border-[#3A3A3A] bg-transparent text-white hover:bg-[#222] hover:text-white text-sm rounded-sm"
                        >
                            Cancel
                        </AlertDialogCancel>

                        <AlertDialogAction
                            size="default"
                            variant="destructive"
                            disabled={deleting}
                            onClick={(event) => {
                                event.preventDefault()
                                void handleDelete()
                            }}
                            className="bg-[#FF6B5E] font-semibold text-black hover:bg-[#FF8176] text-sm rounded-sm"
                        >
                            {deleting ? (
                                <>
                                    <LoaderCircle size={16} className="mr-2 animate-spin" />
                                    Deleting...
                                </>
                            ) : (
                                "Permanently delete"
                            )}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}