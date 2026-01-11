"use client";

import { useEffect } from "react";
import { useSocket } from "@/lib/socket-client";
import { useSession } from "next-auth/react";

export default function SocketRoomManager() {
  const { socket, isConnected } = useSocket();
  const { data: session } = useSession();

  useEffect(() => {
    if (!socket || !isConnected || !session?.user) return;

    const user = session.user;
    
    // ✅ STEP 1: Get Agency ID
    // (Yeh logic Owner, Salesman aur Delivery Boy sabke liye same hai)
    const agencyId = (user as any).agencyId;

    if (agencyId) {
       // Join Agency Room (For Stock updates, New Orders)
       socket.emit("join-room", `agency:${agencyId}`);
       console.log(`📦 [${user.role}] Joined Room: agency:${agencyId}`);
    } else {
       // Fallback: Agar session mein ID nahi mili to API se mangwao
       fetch('/api/auth/session')
         .then(res => res.json())
         .then(data => {
           if (data?.user?.agencyId) {
             socket.emit("join-room", `agency:${data.user.agencyId}`);
             console.log(`📦 [${user.role}] Joined Room via API`);
           }
         });
    }

    // ✅ STEP 2: Role Specific Rooms (Optional)
    
    // Delivery Boy ko personal notifications ke liye alag room
    if (user.role === "delivery_boy") {
        socket.emit("join-room", `delivery:${user.id}`);
    }

    // Agar future mein Salesman ko personal notification bhejna ho to ye uncomment kar dena:
   
    if (user.role === "salesman") {
        socket.emit("join-room", `salesman:${user.id}`);
    }
    if (user.role === "owner_admin") {
        socket.emit("join-room", `owner_admin:${user.id}`);
    }

  }, [socket, isConnected, session]);

  return null;
}