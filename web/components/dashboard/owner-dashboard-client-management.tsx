"use client"

import axios from "axios"
import { useState } from "react"
import { LoaderCircle, ShieldCheck } from "lucide-react"
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
} from "@/components/ui/alert-dialog"
import type { ClientAccess } from "@/types/client-access"

interface OwnerDashboardClientManagementProps {
    clients: ClientAccess[]
    onClientsChanged: (clients: ClientAccess[]) => void
    onError: (message: string) => void
}

export function OwnerDashboardClientManagement({
    clients,
    onClientsChanged,
    onError,
}: OwnerDashboardClientManagementProps) {
    const [selectedClient, setSelectedClient] = useState<ClientAccess | null>(null)
    const [busyClient, setBusyClient] = useState<string | null>(null)
    const [error, setError] = useState("")

    async function updateClientAccess(client: ClientAccess, restore: boolean) {
        if (busyClient) return

        setBusyClient(client.client_id)
        setError("")
        onError("")

        try {
            if (restore) {
                await axios.post(
                    "/api/auth/clients",
                    { client_id: client.client_id },
                    { withCredentials: true }
                )
            } else {
                await axios.delete("/api/auth/clients", {
                    data: { client_id: client.client_id },
                    withCredentials: true,
                })
            }

            onClientsChanged(
                clients.map((item) =>
                    item.client_id === client.client_id
                        ? {
                            ...item,
                            revoked_at: restore ? null : new Date().toISOString(),
                        }
                        : item
                )
            )

            setSelectedClient(null)
        } catch (reason) {
            const message = axios.isAxiosError(reason)
                ? reason.response?.data?.message ??
                reason.response?.data?.error ??
                "Could not update client access."
                : "Could not update client access."

            setError(message)
            onError(message)
        } finally {
            setBusyClient(null)
        }
    }

    return (
        <li className="flex items-start gap-4 px-5 py-4">
            <ShieldCheck
                size={20}
                strokeWidth={2.2}
                className="mt-0.5 shrink-0 text-[#F5C518]"
            />

            <div className="min-w-0 flex-1">
                <p className="font-semibold">MCP access</p>

                <p className="mt-1 text-sm text-[#8A8A8A]">
                    Manage which clients can use this Google Calendar. Each user has
                    a separate access list.
                </p>

                {clients.length ? (
                    <ul className="mt-3 divide-y divide-[#2B2B2B] border-y border-[#2B2B2B]">
                        {clients.map((client) => (
                            <li
                                key={client.client_id}
                                className="flex flex-wrap items-center justify-between gap-3 py-3"
                            >
                                <div className="min-w-0">
                                    <p className="truncate text-sm font-medium text-white">
                                        {client.client_name || "MCP client"}
                                    </p>

                                    <p className="mt-0.5 text-xs text-[#6B6B6B]">
                                        {client.revoked_at
                                            ? `Access removed ${new Date(client.revoked_at).toLocaleDateString()}`
                                            : `Connected ${new Date(client.granted_at).toLocaleDateString()}`}
                                    </p>
                                </div>

                                {client.revoked_at ? (
                                    <Button
                                        type="button"
                                        size="default"
                                        variant="outline"
                                        disabled={busyClient !== null}
                                        onClick={() => void updateClientAccess(client, true)}
                                        className="min-h-9 rounded border-[#F5C518] px-3 text-xs font-semibold text-[#F5C518] hover:bg-[#F5C518] hover:text-black"
                                    >
                                        {busyClient === client.client_id && (
                                            <LoaderCircle size={13} className="mr-1 animate-spin" />
                                        )}
                                        Restore access
                                    </Button>
                                ) : (
                                    <Button
                                        type="button"
                                        size="default"
                                        variant="outline"
                                        disabled={busyClient !== null}
                                        onClick={() => {
                                            setError("")
                                            setSelectedClient(client)
                                        }}
                                        className="min-h-9 rounded border-[#454545] px-3 text-xs font-semibold text-[#EDEDED] hover:border-[#FF6B5E] hover:text-[#FF6B5E]"
                                    >
                                        Remove access
                                    </Button>
                                )}
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="mt-3 text-sm text-[#6B6B6B]">
                        No MCP clients have connected yet.
                    </p>
                )}

                <p className="mt-2 text-xs text-[#6B6B6B]">
                    Remove access to block current tokens and future renewals. Restore
                    access here to reconnect the same client.
                </p>

                {error && (
                    <p role="alert" className="mt-3 text-sm text-[#FF6B5E]">
                        {error}
                    </p>
                )}
            </div>

            <AlertDialog
                open={selectedClient !== null}
                onOpenChange={(open) => {
                    if (busyClient) return
                    if (!open) setSelectedClient(null)
                }}
            >
                <AlertDialogContent className="border-[#2B2B2B] bg-black text-white">
                    <AlertDialogHeader>
                        <AlertDialogTitle>Remove client access?</AlertDialogTitle>

                        <AlertDialogDescription className="text-[#A0A0A0]">
                            Remove access for{" "}
                            <span className="font-semibold text-white">
                                {selectedClient?.client_name || "this MCP client"}
                            </span>
                            ? The client will no longer be authorized to access your
                            connected calendar.
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
                            disabled={busyClient !== null}
                            className="rounded-sm border-[#3A3A3A] bg-transparent text-sm text-white hover:bg-[#222] hover:text-white"
                        >
                            Cancel
                        </AlertDialogCancel>

                        <AlertDialogAction
                            size="default"
                            variant="destructive"
                            disabled={busyClient !== null}
                            onClick={(event) => {
                                event.preventDefault()
                                if (selectedClient) {
                                    void updateClientAccess(selectedClient, false)
                                }
                            }}
                            className="rounded-sm bg-[#FF6B5E] text-sm font-semibold text-black hover:bg-[#FF8176]"
                        >
                            {busyClient ? (
                                <>
                                    <LoaderCircle size={16} className="mr-2 animate-spin" />
                                    Removing...
                                </>
                            ) : (
                                "Remove access"
                            )}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </li>
    )
}