"use client";

import { useEffect, useState, useCallback } from "react";
import { Input } from "@/components/ui/input";

export const dynamic = "force-dynamic"; // still opt-out of caching

interface CurrentUser {
  id: number | string;
  email: string;
  name?: string;
  organizationId?: number;
  needsOnboarding?: boolean;
  role?: string;
}

interface UserSalesStats {
  userId: string;
  userName: string;
  userEmail: string;
  salesCount: number;
  totalRevenue: number;
  barStationId: number | null;
  barStationName: string | null;
}

interface StationSalesStats {
  barStationId: number;
  barStationName: string | null;
  salesCount: number;
  totalRevenue: number;
}

export default function Dashboard() {
  const [me, setMe] = useState<CurrentUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [orgName, setOrgName] = useState("-");
  const [salesStats, setSalesStats] = useState<UserSalesStats[]>([]);
  const [stationStats, setStationStats] = useState<StationSalesStats[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [orgDetails, setOrgDetails] = useState<{
    name: string;
    priceIncreaseStep?: number;
    priceDecreaseStep?: number;
  } | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch current user via frontend proxy (keeps cookies)
      const userRes = await fetch("/api/backend/account", {
        cache: "no-store",
      });
      if (userRes.status === 401) {
        setMe(null);
        setLoading(false);
        return;
      }
      if (!userRes.ok) throw new Error(`Failed user fetch: ${userRes.status}`);
      const userJson: CurrentUser = await userRes.json();
      setMe(userJson);

      // Parallel fetches that depend on user
      if (userJson.organizationId) {
        // Fetch organization via Next.js proxy to avoid CORS and forward cookies
        try {
          const orgRes = await fetch(`/api/backend/organizations/${userJson.organizationId}`, {
            cache: "no-store",
          });
          if (orgRes.ok) {
            const org = await orgRes.json();
            setOrgName(org?.name || "Unknown Organization");
            setOrgDetails({
              name: org?.name || "Unknown Organization",
              priceIncreaseStep: org?.priceIncreaseStep
                ? parseFloat(org.priceIncreaseStep)
                : undefined,
              priceDecreaseStep: org?.priceDecreaseStep
                ? parseFloat(org.priceDecreaseStep)
                : undefined,
            });
          } else setOrgName("Unknown Organization");
        } catch {
          setOrgName("Unknown Organization");
        }

        try {
          const statsRes = await fetch(`/api/backend/inventory/sales-stats`, {
            cache: "no-store",
          });
          if (statsRes.ok) {
            const statsJson = await statsRes.json();
            if (Array.isArray(statsJson)) setSalesStats(statsJson);
          }
        } catch {
          // ignore stats errors silently
        }

        try {
          const stationStatsRes = await fetch(`/api/backend/inventory/station-sales-stats`, {
            cache: "no-store",
          });
          if (stationStatsRes.ok) {
            const stationStatsJson = await stationStatsRes.json();
            if (Array.isArray(stationStatsJson)) setStationStats(stationStatsJson);
          }
        } catch {
          // ignore stats errors silently
        }
      } else {
        setOrgName("No organization");
      }
    } catch (e: unknown) {
      function hasMessage(x: unknown): x is { message: string } {
        return (
          !!x &&
          typeof x === "object" &&
          "message" in x &&
          typeof (x as { message?: unknown }).message === "string"
        );
      }
      if (hasMessage(e)) setError(e.message);
      else setError("Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  async function handleOrgUpdate(e: React.FormEvent<HTMLFormElement>): Promise<void> {
    e.preventDefault();
    if (!me?.organizationId || !orgDetails) return;
    setSaving(true);
    setSaveError(null);
    setSaveSuccess(null);
    try {
      const res = await fetch(`/api/backend/organizations/${me.organizationId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: orgDetails.name,
          priceIncreaseStep: orgDetails.priceIncreaseStep,
          priceDecreaseStep: orgDetails.priceDecreaseStep,
        }),
      });
      if (!res.ok) throw new Error(`Update failed: ${res.status}`);
      const updated = await res.json();
      setOrgDetails({
        name: updated.name,
        priceIncreaseStep: updated.priceIncreaseStep
          ? parseFloat(updated.priceIncreaseStep)
          : undefined,
        priceDecreaseStep: updated.priceDecreaseStep
          ? parseFloat(updated.priceDecreaseStep)
          : undefined,
      });
      setSaveSuccess("Organization updated successfully");
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Failed to update organization");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="bg-background flex min-h-screen w-full items-center justify-center p-4">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!me) {
    return <p className="p-4">Not authenticated.</p>;
  }

  return (
    <div className="bg-background min-h-screen p-4">
      <div className="bg-card border-[color-mix(in oklab, var(--ring) 50%, transparent)] rounded-lg border-1 p-6 shadow">
        {error && (
          <div className="border-destructive/50 bg-destructive/10 text-destructive mb-4 rounded border px-4 py-2 text-sm">
            {error}
          </div>
        )}
        <h1 className="text-card-foreground mb-4 text-3xl font-bold">
          Welcome, {me.name || me.email}!
        </h1>
        <div className="text-muted-foreground mb-6 space-y-2">
          <p>
            <span className="text-card-foreground font-medium">Email:</span> {me.email}
          </p>
          <p>
            <span className="text-card-foreground font-medium">Organization:</span> {orgName}
          </p>
          <p>
            <span className="text-card-foreground font-medium">Role:</span>{" "}
            {me.role || "No role assigned"}
          </p>
        </div>

        {stationStats.length > 0 && (
          <div className="bg-card mb-6 rounded-lg p-6 shadow">
            <h2 className="text-card-foreground mb-4 text-xl font-semibold">Station Leaderboard</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-border border-b">
                    <th className="text-muted-foreground py-2 text-left font-medium">Station</th>
                    <th className="text-muted-foreground py-2 text-left font-medium">
                      Sales Count
                    </th>
                    <th className="text-muted-foreground py-2 text-left font-medium">
                      Total Revenue
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {stationStats.map(stat => (
                    <tr key={stat.barStationId} className="border-border border-b last:border-0">
                      <td className="py-3">
                        <div className="text-card-foreground font-medium">
                          {stat.barStationName || `Station ${stat.barStationId}`}
                        </div>
                      </td>
                      <td className="text-card-foreground py-3 font-medium">{stat.salesCount}</td>
                      <td className="text-card-foreground py-3 font-medium">
                        €{stat.totalRevenue.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {salesStats.length > 0 && (
          <div className="bg-card rounded-lg p-6 shadow">
            <h2 className="text-card-foreground mb-4 text-xl font-semibold">
              Sales Performance by User
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-border border-b">
                    <th className="text-muted-foreground py-2 text-left font-medium">User</th>
                    <th className="text-muted-foreground py-2 text-left font-medium">Station</th>
                    <th className="text-muted-foreground py-2 text-left font-medium">
                      Sales Count
                    </th>
                    <th className="text-muted-foreground py-2 text-left font-medium">
                      Total Revenue
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {salesStats.map((stat, index) => (
                    <tr
                      key={`${stat.userId}-${stat.barStationId || "null"}-${index}`}
                      className="border-border border-b last:border-0"
                    >
                      <td className="py-3">
                        <div>
                          <div className="text-card-foreground font-medium">
                            {stat.userName || "Unknown User"}
                          </div>
                          <div className="text-muted-foreground text-xs">{stat.userEmail}</div>
                        </div>
                      </td>
                      <td className="text-card-foreground py-3">
                        {stat.barStationName ||
                          (stat.barStationId ? `Station ${stat.barStationId}` : "N/A")}
                      </td>
                      <td className="text-card-foreground py-3 font-medium">{stat.salesCount}</td>
                      <td className="text-card-foreground py-3 font-medium">
                        €{stat.totalRevenue.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {me.role === "ADMIN" && orgDetails && (
          <div>
            <h2 className="text-card-foreground mb-4 text-xl font-semibold">
              Organization Settings
            </h2>
            <form onSubmit={handleOrgUpdate} className="space-y-4">
              <div>
                <label className="text-card-foreground mb-1 block text-sm font-medium">Name</label>
                <Input
                  type="text"
                  className="w-full rounded-lg border border-gray-700 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                  value={orgDetails.name}
                  onChange={e => setOrgDetails(d => (d ? { ...d, name: e.target.value } : d))}
                  required
                />
              </div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="text-card-foreground mb-1 block text-sm font-medium">
                    Price Increase Step (€)
                  </label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    className="w-full rounded-lg border border-gray-700 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                    value={orgDetails.priceIncreaseStep ?? ""}
                    onChange={e =>
                      setOrgDetails(d =>
                        d
                          ? {
                              ...d,
                              priceIncreaseStep:
                                e.target.value === "" ? undefined : parseFloat(e.target.value),
                            }
                          : d,
                      )
                    }
                  />
                </div>
                <div>
                  <label className="text-card-foreground mb-1 block text-sm font-medium">
                    Price Decrease Step (€)
                  </label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    className="w-full rounded-lg border border-gray-700 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                    value={orgDetails.priceDecreaseStep ?? ""}
                    onChange={e =>
                      setOrgDetails(d =>
                        d
                          ? {
                              ...d,
                              priceDecreaseStep:
                                e.target.value === "" ? undefined : parseFloat(e.target.value),
                            }
                          : d,
                      )
                    }
                  />
                </div>
              </div>
              {saveError && <p className="text-destructive text-sm">{saveError}</p>}
              {saveSuccess && <p className="text-sm text-green-600">{saveSuccess}</p>}
              <button
                type="submit"
                className="inline-flex items-center rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                disabled={saving}
              >
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
