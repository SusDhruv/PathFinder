import React from 'react'
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar"
import { Calendar, Home, Inbox, Layers, Search, Settings, UserCircle, Wallet, LogOut } from "lucide-react"
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { SignOutButton } from "@clerk/nextjs"

const items = [
    {
        title: "Workspace",
        url: "/dashboard",
        icon: Layers,
    },
    {
        title: "AI Tools",
        url: "/dashboard#tools-section",
        icon: Inbox,
    },
    {
        title: "Billing",
        url: "/billing",
        icon: Wallet,
    },
    {
        title: "Profile",
        url: "/profile",
        icon: UserCircle,
    },
]

export function AppSidebar() {
    const path = usePathname();
    return (
        <Sidebar className="fixed left-0 top-0 h-screen w-64 bg-white/70 backdrop-blur-xl shadow-2xl border-r-0 z-30 flex flex-col justify-between">
            {/* Accent bar */}
            <div className="absolute left-0 top-0 h-full w-2 bg-gradient-to-b from-purple-500 via-blue-400 to-pink-400 rounded-tr-2xl rounded-br-2xl z-10" />
            <SidebarHeader>
                <div className='flex flex-col items-center justify-center py-8 px-4 mb-2'>
                    <Image src={'/logo.svg'} alt='logo' width={100} height={100} className='w-full h-full mb-2' />
                </div>
            </SidebarHeader>
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupContent>
                        <SidebarMenu className='mt-4'>
                            {items.map((item, index) => {
                                const isActive = path.includes(item.url) && item.url !== "#";
                                return (
                                    <a
                                        href={item.url}
                                        key={index}
                                        className={`relative p-3 text-base flex gap-3 items-center rounded-xl font-semibold transition-all duration-200 mb-1
                                            ${isActive ? 'bg-gradient-to-r from-purple-100 to-blue-100 text-purple-700 shadow-md' : 'hover:bg-blue-50 hover:text-blue-700 text-gray-700'}
                                        `}
                                        style={{ zIndex: 20 }}
                                    >
                                        <item.icon className={`h-5 w-5 transition-colors ${isActive ? 'text-purple-600' : 'text-gray-400 group-hover:text-blue-600'}`} />
                                        <span className="tracking-tight">{item.title}</span>
                                        {isActive && <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-7 bg-gradient-to-b from-purple-500 to-blue-400 rounded-r-full" />}
                                    </a>
                                )
                            })}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
            <SidebarFooter>
                <div className="border-t border-blue-100 my-2" />
                <SignOutButton redirectUrl="/">
                  <button className="w-full flex items-center gap-3 p-3 rounded-xl font-semibold text-base text-red-600 hover:bg-red-50 transition-all duration-200 mb-2">
                    <LogOut className="h-5 w-5" />
                    <span>Logout</span>
                  </button>
                </SignOutButton>
                <h2 className='p-2 text-gray-400 text-xs text-center font-medium'>Copyright © PathFinder</h2>
            </SidebarFooter>
        </Sidebar>
    )
}