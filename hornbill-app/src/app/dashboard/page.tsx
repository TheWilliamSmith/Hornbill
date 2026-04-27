import { cookies } from "next/headers";
import HabitsWidget from "@/components/dashboard/HabitsWidget";
import TasksWidget from "@/components/dashboard/TasksWidget";
import CryptoWidget from "@/components/dashboard/CryptoWidget";
import WeightWidget from "@/components/dashboard/WeightWidget";
import NotificationsWidget from "@/components/dashboard/NotificationsWidget";
import QuickActions from "@/components/dashboard/QuickActions";

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Bonjour";
  if (hour < 18) return "Bon après-midi";
  return "Bonsoir";
}

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const API_URL = process.env.API_URL || "http://localhost:3000";
  const accessToken = cookieStore.get("accessToken")?.value;

  let firstName = "";
  if (accessToken) {
    try {
      const res = await fetch(`${API_URL}/users/me`, {
        headers: { Authorization: `Bearer ${accessToken}` },
        cache: "no-store",
      });
      if (res.ok) {
        const user = await res.json();
        firstName = user.firstName ?? user.username ?? "";
      }
    } catch {
      // ignore
    }
  }

  const today = new Date().toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">
          {getGreeting()}{firstName ? `, ${firstName}` : ""} 👋
        </h1>
        <p className="text-sm text-zinc-400 mt-1 capitalize">{today}</p>
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        <HabitsWidget />
        <TasksWidget />
        <QuickActions />
        <CryptoWidget />
        <WeightWidget />
        <NotificationsWidget />
      </div>
    </div>
  );
}
