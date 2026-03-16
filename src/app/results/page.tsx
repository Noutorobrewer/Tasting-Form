"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase";
import type { ProductTasting, Profile } from "@/lib/database.types";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { FadeIn } from "@/components/motion/fade-in";

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
    return (
      <div className="p-4 space-y-3">
        <Skeleton className="h-7 w-48 mb-4" />
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-36 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  return (
    <FadeIn>
      <div className="p-4">
        <h1 className="mb-4 text-xl font-bold">テイスティング結果</h1>

        {tastings.length === 0 ? (
          <p className="text-center text-muted-foreground">結果がありません</p>
        ) : (
          <div className="space-y-3">
            {tastings.map((t) => (
              <Card key={t.id}>
                <CardContent className="p-3">
                  <div className="mb-2 flex items-center justify-between">
                    <div>
                      <p className="font-medium">
                        {t.filling_schedules?.cellar_lots?.name ?? "—"}
                        {t.filling_schedules?.filling_products
                          ? ` / ${t.filling_schedules.filling_products.name}`
                          : ""}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {t.profiles?.display_name} /{" "}
                        {new Date(t.created_at).toLocaleDateString("ja-JP")}
                      </p>
                    </div>
                    <div className="text-right flex flex-col items-end gap-1">
                      <span className="text-2xl font-bold text-primary">
                        {t.overall ?? "-"}
                      </span>
                      <p className="text-xs text-muted-foreground">Overall</p>
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
                        <Badge key={f} variant="destructive" className="bg-destructive/10 text-destructive hover:bg-destructive/20 border-0 text-xs font-normal">
                          {f}
                        </Badge>
                      ))}
                      {t.technical_defects?.map((d) => (
                        <Badge key={d} className="bg-[oklch(0.72_0.12_85/0.15)] text-[oklch(0.55_0.12_85)] hover:bg-[oklch(0.72_0.12_85/0.25)] border-0 text-xs font-normal">
                          {d}
                        </Badge>
                      ))}
                    </div>
                  )}

                  {t.overall_comments && (
                    <p className="mt-2 text-xs text-muted-foreground">{t.overall_comments}</p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </FadeIn>
  );
}

function ScoreCell({ label, value }: { label: string; value: number | null }) {
  return (
    <div className="rounded bg-muted p-1">
      <p className="text-[10px] text-muted-foreground">{label}</p>
      <p className="font-medium">{value ?? "-"}</p>
    </div>
  );
}

ScoreCell.displayName = "ScoreCell";

export default function ResultsPage() {
  return (
    <Suspense fallback={
      <div className="p-4 space-y-3">
        <Skeleton className="h-7 w-48 mb-4" />
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-36 w-full rounded-lg" />
        ))}
      </div>
    }>
      <ResultsContent />
    </Suspense>
  );
}
