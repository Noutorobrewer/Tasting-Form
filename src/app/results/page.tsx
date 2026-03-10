"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase";
import type { ProductTasting, Profile } from "@/lib/database.types";

interface TastingWithRelations extends ProductTasting {
  profiles: Pick<Profile, "display_name" | "photo_url">;
  filling_schedules: {
    filling_date: string;
    cellar_lots: { name: string } | null;
    filling_products: { name: string } | null;
  };
}

function ResultsContent() {
  const searchParams = useSearchParams();
  const scheduleId = searchParams.get("schedule");
  const [tastings, setTastings] = useState<TastingWithRelations[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      let query = supabase
        .from("product_tastings")
        .select(
          "*, profiles(display_name, photo_url), filling_schedules(filling_date, cellar_lots(name), filling_products(name))"
        )
        .order("created_at", { ascending: false });

      if (scheduleId) {
        query = query.eq("filling_schedule_id", scheduleId);
      }

      const { data } = await query.limit(50);
      if (data) setTastings(data as unknown as TastingWithRelations[]);
      setLoading(false);
    }
    load();
  }, [scheduleId]);

  if (loading) {
    return <div className="p-4 text-center text-gray-500">読み込み中...</div>;
  }

  return (
    <div className="p-4">
      <h1 className="mb-4 text-xl font-bold">テイスティング結果</h1>

      {tastings.length === 0 ? (
        <p className="text-center text-gray-500">結果がありません</p>
      ) : (
        <div className="space-y-3">
          {tastings.map((t) => (
            <div key={t.id} className="rounded-lg border border-gray-200 p-3">
              <div className="mb-2 flex items-center justify-between">
                <div>
                  <p className="font-medium">
                    {t.filling_schedules?.cellar_lots?.name ?? "—"}
                    {t.filling_schedules?.filling_products
                      ? ` / ${t.filling_schedules.filling_products.name}`
                      : ""}
                  </p>
                  <p className="text-xs text-gray-500">
                    {t.profiles?.display_name} /{" "}
                    {new Date(t.created_at).toLocaleDateString("ja-JP")}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-blue-600">
                    {t.overall ?? "-"}
                  </p>
                  <p className="text-xs text-gray-400">Overall</p>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-1 text-center text-xs">
                <ScoreCell label="Sweetness" value={t.sweetness} />
                <ScoreCell label="Bitterness" value={t.bitterness} />
                <ScoreCell label="Sourness" value={t.sourness} />
                <ScoreCell label="Balance" value={t.balance} />
                <ScoreCell label="Body" value={t.body} />
                <ScoreCell label="Carbonation" value={t.carbonation} />
                <ScoreCell label="Alcohol" value={t.alcohol} />
                <ScoreCell label="Clarity" value={t.clarity} />
              </div>

              {(t.off_flavor?.length > 0 || t.technical_defects?.length > 0) && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {t.off_flavor?.map((f) => (
                    <span key={f} className="rounded bg-red-50 px-1.5 py-0.5 text-xs text-red-700">
                      {f}
                    </span>
                  ))}
                  {t.technical_defects?.map((d) => (
                    <span key={d} className="rounded bg-orange-50 px-1.5 py-0.5 text-xs text-orange-700">
                      {d}
                    </span>
                  ))}
                </div>
              )}

              {t.overall_comments && (
                <p className="mt-2 text-xs text-gray-600">{t.overall_comments}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ScoreCell({ label, value }: { label: string; value: number | null }) {
  return (
    <div className="rounded bg-gray-50 p-1">
      <p className="text-[10px] text-gray-400">{label}</p>
      <p className="font-medium">{value ?? "-"}</p>
    </div>
  );
}

export default function ResultsPage() {
  return (
    <Suspense fallback={<div className="p-4 text-center text-gray-500">読み込み中...</div>}>
      <ResultsContent />
    </Suspense>
  );
}
