"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase";
import type { TastingSummary } from "@/lib/database.types";

export default function ProductsPage() {
  const [summaries, setSummaries] = useState<TastingSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data } = await supabase
        .from("tasting_summary")
        .select("*")
        .order("filling_date", { ascending: false });
      if (data) setSummaries(data);
      setLoading(false);
    }
    load();
  }, []);

  if (loading) {
    return <div className="p-4 text-center text-muted-foreground">読み込み中...</div>;
  }

  return (
    <div className="p-4">
      <h1 className="mb-4 text-xl font-bold">充填一覧</h1>

      {summaries.length === 0 ? (
        <p className="text-center text-muted-foreground">データがありません</p>
      ) : (
        <div className="space-y-2">
          {summaries.map((s) => (
            <Link
              key={s.filling_schedule_id}
              href={`/results?schedule=${s.filling_schedule_id}`}
              className="block rounded-lg border border-border p-3 transition-colors hover:bg-accent"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">
                    {s.beer_name ?? s.cellar_lot_name ?? "—"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {s.container}
                    {s.filling_date && ` / ${s.filling_date}`}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-primary">
                    {s.avg_overall ?? "-"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {s.tasting_count}件
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
