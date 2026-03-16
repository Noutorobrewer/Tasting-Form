"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase";
import type { TastingSummary } from "@/lib/database.types";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { FadeIn } from "@/components/motion/fade-in";

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
    return (
      <div className="p-4 space-y-2">
        <Skeleton className="h-7 w-32 mb-4" />
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  return (
    <FadeIn>
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
              >
                <Card className="transition-colors hover:bg-accent cursor-pointer">
                  <CardContent className="p-3">
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
                      <div className="text-right flex flex-col items-end gap-1">
                        <Badge variant="default" className="text-base font-bold px-2 py-0.5">
                          {s.avg_overall ?? "-"}
                        </Badge>
                        <p className="text-xs text-muted-foreground">
                          {s.tasting_count}件
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </FadeIn>
  );
}
