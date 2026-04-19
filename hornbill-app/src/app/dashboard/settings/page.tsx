"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Settings,
  User,
  Puzzle,
  AlertTriangle,
  Loader2,
  Check,
} from "lucide-react";
import {
  userService,
  type UserProfile,
  type UpdateProfileData,
} from "@/services/user.service";
import { removeAccessToken, removeRefreshToken } from "@/utils/cookie.utils";
import DiscordSettings from "@/components/crypto/DiscordSettings";

type Tab = "profile" | "integrations" | "danger";

const tabs: { key: Tab; label: string; icon: typeof User; danger?: boolean }[] =
  [
    { key: "profile", label: "Profil", icon: User },
    { key: "integrations", label: "Intégrations", icon: Puzzle },
    { key: "danger", label: "Zone de danger", icon: AlertTriangle, danger: true },
  ];

export default function SettingsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>("profile");
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Profile form
  const [username, setUsername] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);

  // Delete account
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  useEffect(() => {
    userService
      .getMe()
      .then((u) => {
        setUser(u);
        setUsername(u.username);
        setFirstName(u.firstName);
        setLastName(u.lastName);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleSaveProfile = async () => {
    setProfileSaving(true);
    setProfileError(null);
    setProfileSuccess(false);

    try {
      const data: UpdateProfileData = {};
      if (username !== user?.username) data.username = username;
      if (firstName !== user?.firstName) data.firstName = firstName;
      if (lastName !== user?.lastName) data.lastName = lastName;

      if (Object.keys(data).length === 0) {
        setProfileSaving(false);
        return;
      }

      const updated = await userService.updateMe(data);
      setUser(updated);
      setProfileSuccess(true);
      setTimeout(() => setProfileSuccess(false), 3000);
    } catch (err: unknown) {
      if (err && typeof err === "object" && "response" in err) {
        try {
          const body = await (err as { response: Response }).response.json();
          setProfileError(body.message || "Erreur lors de la mise à jour");
        } catch {
          setProfileError("Erreur lors de la mise à jour");
        }
      } else {
        setProfileError("Erreur lors de la mise à jour");
      }
    } finally {
      setProfileSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!deletePassword) return;
    setDeleting(true);
    setDeleteError(null);

    try {
      await userService.deleteAccount(deletePassword);
      removeAccessToken();
      removeRefreshToken();
      document.cookie =
        "accessToken=; path=/; Secure; SameSite=Strict; Max-Age=0";
      document.cookie =
        "refreshToken=; path=/; Secure; SameSite=Strict; Max-Age=0";
      document.cookie =
        "refreshTokenClient=; path=/; Secure; SameSite=Strict; Max-Age=0";
      router.push("/auth/login");
    } catch (err: unknown) {
      if (err && typeof err === "object" && "response" in err) {
        try {
          const body = await (err as { response: Response }).response.json();
          setDeleteError(body.message || "Mot de passe incorrect");
        } catch {
          setDeleteError("Mot de passe incorrect");
        }
      } else {
        setDeleteError("Erreur lors de la suppression");
      }
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 size={24} className="animate-spin text-black/20" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-2.5 mb-6">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-zinc-700 to-zinc-900 flex items-center justify-center shadow-lg shadow-zinc-500/20">
          <Settings size={17} className="text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-black">
            Paramètres
          </h1>
          <p className="text-sm text-black/40">
            Gérer votre profil et vos préférences
          </p>
        </div>
      </div>

      {/* Layout: tabs left + content right */}
      <div className="flex gap-6">
        {/* ─── Tab Navigation ─────────────────────────── */}
        <nav className="w-52 shrink-0 space-y-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                  isActive
                    ? tab.danger
                      ? "bg-red-50 text-red-600 border border-red-200"
                      : "bg-black/[0.05] text-black border border-black/[0.08]"
                    : tab.danger
                      ? "text-red-400 hover:bg-red-50/50 hover:text-red-500"
                      : "text-black/40 hover:bg-black/[0.03] hover:text-black/60"
                }`}
              >
                <Icon size={15} />
                {tab.label}
              </button>
            );
          })}
        </nav>

        {/* ─── Content Area ───────────────────────────── */}
        <div className="flex-1 min-w-0">
          {/* ── Profile Tab ──────────────────────────── */}
          {activeTab === "profile" && (
            <div className="bg-white rounded-2xl border border-black/[0.06] shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-6">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-8 h-8 rounded-lg bg-black/[0.04] flex items-center justify-center">
                  <User size={15} className="text-black/60" />
                </div>
                <div>
                  <h2 className="text-sm font-semibold text-black tracking-tight">
                    Profil
                  </h2>
                  <p className="text-xs text-black/40">
                    Modifier vos informations personnelles
                  </p>
                </div>
              </div>

              {profileError && (
                <div className="mb-4 px-3 py-2 bg-red-50 border border-red-100 rounded-xl">
                  <p className="text-xs text-red-600">{profileError}</p>
                </div>
              )}

              {profileSuccess && (
                <div className="mb-4 px-3 py-2 bg-emerald-50 border border-emerald-100 rounded-xl flex items-center gap-2">
                  <Check size={12} className="text-emerald-600" />
                  <p className="text-xs text-emerald-600">
                    Profil mis à jour avec succès
                  </p>
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="text-[11px] font-medium text-black/40 uppercase tracking-wide">
                    Nom d&apos;utilisateur
                  </label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="mt-1 w-full px-3 py-2.5 text-sm bg-black/[0.02] border border-black/[0.08] rounded-xl focus:outline-none focus:ring-2 focus:ring-black/10"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[11px] font-medium text-black/40 uppercase tracking-wide">
                      Prénom
                    </label>
                    <input
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="mt-1 w-full px-3 py-2.5 text-sm bg-black/[0.02] border border-black/[0.08] rounded-xl focus:outline-none focus:ring-2 focus:ring-black/10"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-medium text-black/40 uppercase tracking-wide">
                      Nom
                    </label>
                    <input
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className="mt-1 w-full px-3 py-2.5 text-sm bg-black/[0.02] border border-black/[0.08] rounded-xl focus:outline-none focus:ring-2 focus:ring-black/10"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-medium text-black/40 uppercase tracking-wide">
                    Email
                  </label>
                  <input
                    type="email"
                    value={user?.email ?? ""}
                    disabled
                    className="mt-1 w-full px-3 py-2.5 text-sm bg-black/[0.02] border border-black/[0.08] rounded-xl text-black/40 cursor-not-allowed"
                  />
                  <p className="mt-1 text-[10px] text-black/30">
                    L&apos;email ne peut pas être modifié
                  </p>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    onClick={handleSaveProfile}
                    disabled={profileSaving}
                    className="flex items-center gap-2 px-5 py-2.5 bg-black text-white text-sm font-medium rounded-xl hover:bg-black/90 active:scale-[0.97] transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {profileSaving ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : (
                      "Sauvegarder"
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ── Integrations Tab ─────────────────────── */}
          {activeTab === "integrations" && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 px-1 mb-2">
                <div className="w-8 h-8 rounded-lg bg-black/[0.04] flex items-center justify-center">
                  <Puzzle size={15} className="text-black/60" />
                </div>
                <div>
                  <h2 className="text-sm font-semibold text-black tracking-tight">
                    Intégrations
                  </h2>
                  <p className="text-xs text-black/40">
                    Connectez des services externes pour recevoir vos alertes
                  </p>
                </div>
              </div>

              <DiscordSettings />
            </div>
          )}

          {/* ── Danger Zone Tab ──────────────────────── */}
          {activeTab === "danger" && (
            <div className="bg-white rounded-2xl border border-red-200 shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center">
                  <AlertTriangle size={15} className="text-red-500" />
                </div>
                <div>
                  <h2 className="text-sm font-semibold text-red-600 tracking-tight">
                    Zone de danger
                  </h2>
                  <p className="text-xs text-black/40">
                    Actions irréversibles sur votre compte
                  </p>
                </div>
              </div>

              {!showDeleteConfirm ? (
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="px-4 py-2.5 bg-red-50 text-red-600 text-sm font-medium rounded-xl border border-red-200 hover:bg-red-100 transition-colors cursor-pointer"
                >
                  Supprimer mon compte
                </button>
              ) : (
                <div className="space-y-3 p-4 bg-red-50/50 rounded-xl border border-red-100">
                  <p className="text-sm text-red-700 font-medium">
                    Êtes-vous sûr ? Cette action est irréversible.
                  </p>
                  <p className="text-xs text-red-600/70">
                    Toutes vos données seront définitivement supprimées :
                    positions, notifications, historique.
                  </p>

                  {deleteError && (
                    <div className="px-3 py-2 bg-red-100 border border-red-200 rounded-lg">
                      <p className="text-xs text-red-700">{deleteError}</p>
                    </div>
                  )}

                  <div>
                    <label className="text-[11px] font-medium text-red-500 uppercase tracking-wide">
                      Confirmez votre mot de passe
                    </label>
                    <input
                      type="password"
                      value={deletePassword}
                      onChange={(e) => setDeletePassword(e.target.value)}
                      placeholder="Votre mot de passe"
                      className="mt-1 w-full px-3 py-2.5 text-sm bg-white border border-red-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-200 placeholder:text-red-300"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleDeleteAccount}
                      disabled={deleting || !deletePassword}
                      className="flex items-center gap-2 px-4 py-2.5 bg-red-600 text-white text-sm font-medium rounded-xl hover:bg-red-700 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {deleting ? (
                        <Loader2 size={14} className="animate-spin" />
                      ) : (
                        "Supprimer définitivement"
                      )}
                    </button>
                    <button
                      onClick={() => {
                        setShowDeleteConfirm(false);
                        setDeletePassword("");
                        setDeleteError(null);
                      }}
                      className="px-4 py-2.5 text-sm font-medium text-black/50 border border-black/10 rounded-xl hover:bg-black/[0.02] transition-colors cursor-pointer"
                    >
                      Annuler
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
