"use client";

import clsx from "clsx";
import React, { useEffect, useState } from "react";
import Chart from "./Chart";
import Image from "next/image";

type Category = { id: number; name: string; organizationId?: number };
export type InvDto = {
  id: number;
  organizationId: number;
  productId: number;
  productName: string;
  description: string;
  quantity: number;
  unitPrice: number;
  basePrice: number;
  updatedAt: string;
};

const money = (n: number) =>
  new Intl.NumberFormat("et-EE", {
    style: "currency",
    currency: "EUR",
  }).format(n);

const sponsors = [
  { name: "Red Bull", logo: "/redbull.svg" },
  { name: "itük", logo: "/ituk_long_nottu_red.svg" },
  { name: "alecoq", logo: "/alecoq.svg" },
  { name: "insük", logo: "/insyk.png" },
  { name: "anora", logo: "/anora-group-logo-white-CMYK.png" },
];

export default function ClientProductsByCategory() {
  const [cats, setCats] = useState<Category[]>([]);
  const [groups, setGroups] = useState<Record<string, InvDto[]>>({});
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;

    const load = async () => {
      setLoading(true);
      try {
        const organizationId = 2;

        const cRes = await fetch(`/api/backend/categories?organizationId=${organizationId}`, {
          cache: "no-store",
          credentials: "include",
        });
        if (!cRes.ok) throw new Error(`Categories HTTP ${cRes.status}`);
        const cJson = await cRes.json();
        const categoryList: Category[] = Array.isArray(cJson)
          ? cJson
          : (cJson?.items ?? cJson?.content ?? []);

        if (!alive) return;
        setCats(categoryList);

        const fetches = categoryList.map(async c => {
          const res = await fetch(
            `/api/backend/inventory?categoryId=${c.id}&organizationId=${organizationId}`,
            {
              cache: "no-store",
              credentials: "include",
            },
          );
          if (!res.ok) throw new Error(`Inventory HTTP ${res.status} (cat ${c.id})`);
          const j = await res.json();
          const arr: InvDto[] = Array.isArray(j) ? j : (j?.items ?? j?.content ?? []);
          return [c.name, arr] as const;
        });

        const results = await Promise.all(fetches);
        if (!alive) return;

        const grouped = Object.fromEntries(results.filter(([, arr]) => arr.length > 0));
        setGroups(grouped);
        setErr(null);
      } catch (e) {
        if (!alive) return;
        setErr((e as any)?.message || "Failed to load products");
      } finally {
        setLoading(false);
      }
    };

    load();
    const refreshInterval = setInterval(load, 1000 * 15);
    return () => {
      clearInterval(refreshInterval);
      alive = false;
    };
  }, []);

  const totalItems = Object.values(groups).reduce((sum, arr) => sum + arr.length, 0);

  return (
    <div className="flex w-full flex-col items-stretch justify-center gap-4 bg-[#141224] px-4 py-4 text-white">
      <div className="flex flex-row gap-4">
        {err && (
          <div className="rounded-xl border border-red-700 bg-red-950/60 px-4 py-3 text-sm text-red-200">
            {err}
          </div>
        )}

        <section className="flex basis-2/3 flex-col rounded-2xl border border-[#2a2640] bg-[#1b1830] p-4">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-semibold tracking-wide md:text-xl">Products by Category</h2>
          </div>

          <div
            className="columns-1 gap-4 min-[1800px]:max-h-[90vh] min-[1800px]:!columns-2"
            style={{ columnFill: "auto" }}
          >
            {loading && !totalItems && (
              <div className="col-span-full flex h-40 items-center justify-center text-lg text-[#a7a3c7]">
                Loading…
              </div>
            )}

            {cats
              .filter(c => groups[c.name]?.length)
              .map(c => {
                const items = groups[c.name];
                return (
                  <div
                    key={c.id}
                    className="w-full rounded-2xl border border-[#2a2640] bg-[#201c31] p-3 [&:not(:first-child)]:mt-4"
                  >
                    <div className="mb-2 flex break-inside-avoid items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="h-6 w-1.5 rounded-full bg-gradient-to-b from-purple-400 to-fuchsia-400" />
                        <h3 className="text-xs font-semibold tracking-[0.18em] text-[#e9e6ff] uppercase lg:text-sm">
                          {c.name}
                        </h3>
                      </div>
                      <span className="text-xs text-[#8b88a9]">{items.length} items</span>
                    </div>

                    <table className="w-full border-separate border-spacing-y-1 break-before-avoid text-xs lg:text-sm">
                      <thead className="break-after-avoid">
                        <tr className="text-[9px] tracking-[0.16em] text-[#7a7690] uppercase lg:text-[10px] xl:text-[12px]">
                          <th className="px-2 py-1 text-left">Product</th>
                          <th className="px-2 py-1 text-right">Price</th>
                          <th className="px-2 py-1 text-right">Δ%</th>
                          <th className="px-2 py-1 text-right">Base</th>
                        </tr>
                      </thead>
                      <tbody>
                        {items
                          .slice()
                          .sort((a, b) => a.productName.localeCompare(b.productName))
                          .map(p => {
                            const diff = p.unitPrice - p.basePrice;
                            const diffPct = p.basePrice !== 0 ? (diff / p.basePrice) * 100 : 0;

                            const isUp = diff > 0;
                            const isDown = diff < 0;

                            return (
                              <tr
                                key={p.productId}
                                className="break-inside-avoid bg-[#251f3a] transition-colors hover:bg-[#2b2446]"
                              >
                                <td className="px-2 py-1">
                                  <span className="block truncate text-[16px] font-medium">
                                    {p.productName}
                                  </span>
                                  <p>{p.description}</p>
                                </td>
                                <td className="px-2 py-1 text-right tabular-nums">
                                  {money(p.unitPrice)}
                                </td>
                                <td
                                  className={clsx(
                                    "px-2 py-1 text-right font-semibold whitespace-nowrap tabular-nums",
                                    isUp && "text-emerald-400",
                                    isDown && "text-red-400",
                                    !isUp && !isDown && "text-[#8b88a9]",
                                  )}
                                >
                                  {diff === 0 ? (
                                    "—"
                                  ) : (
                                    <>
                                      {diff > 0 ? "▲" : "▼"} {Math.abs(diffPct).toFixed(1)}%
                                    </>
                                  )}
                                </td>
                                <td className="px-2 py-1 text-right text-[#c2bedc] tabular-nums">
                                  {money(p.basePrice)}
                                </td>
                              </tr>
                            );
                          })}
                      </tbody>
                    </table>
                  </div>
                );
              })}

            {!totalItems && !loading && (
              <div className="col-span-full flex h-40 items-center justify-center text-lg text-[#a7a3c7]">
                No products to display
              </div>
            )}
          </div>
        </section>

        {/* PAREM – graafik samas boardis */}
        <section className="flex flex-col gap-4 rounded-2xl border border-[#2a2640] bg-[#1b1830] p-4">
          <header className="flex flex-col justify-between gap-2 pb-4 text-center">
            <div className="flex max-h-[130px] w-full justify-center">
              <Image
                src="/tudengibaarlogo.png"
                alt="Tudengibaar"
                className="h-full object-contain"
                width={700}
                height={400}
              />
            </div>
          </header>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-semibold tracking-wide md:text-xl">Price History</h2>
          </div>
          <Chart groups={groups} />
          <div className="mx-3 my-2 inline-flex items-center gap-5 rounded-full border border-[#2a2640] bg-[#191530] px-6 py-4">
            <span className="text-[10px] tracking-[0.18em] text-[#8b88a9] uppercase md:text-[11px]">
              Sponsored by
            </span>
            {sponsors.map(s => (
              <div key={s.name} className="flex h-10 w-30 items-center justify-center md:w-32">
                <Image
                  src={s.logo}
                  alt={s.name}
                  width={120}
                  height={40}
                  className="max-h-10 max-w-full object-contain opacity-90 transition-opacity hover:opacity-100"
                />
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* FOOTER – sponsorid, aga ikka sama kaardi sees */}
      <footer className="mt-10 flex hidden justify-center"></footer>
    </div>
  );
}
