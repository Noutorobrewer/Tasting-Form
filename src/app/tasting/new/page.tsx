"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase";
import type { BeerColor, FillingScheduleWithRelations } from "@/lib/database.types";
import {
  BEER_COLORS,
  INAPPROPRIATE_APPEARANCE_OPTIONS,
  INAPPROPRIATE_AROMA_OPTIONS,
  OFF_FLAVOR_OPTIONS,
  TECHNICAL_DEFECT_OPTIONS,
} from "@/lib/database.types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { FadeIn } from "@/components/motion/fade-in";

export default function NewTastingPage() {
  const router = useRouter();
  const [schedules, setSchedules] = useState<FillingScheduleWithRelations[]>([]);
  const [fillingScheduleId, setFillingScheduleId] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [step, setStep] = useState(0);

  const [form, setForm] = useState({
    head_color: null as number | null,
    foam_volume: null as number | null,
    head_retention: null as number | null,
    beer_color: null as BeerColor | null,
    clarity: null as number | null,
    inappropriate_appearance: [] as string[],
    appearance_comments: "",
    malt_aroma: null as number | null,
    hop_aroma: null as number | null,
    fermentation_aroma: null as number | null,
    inappropriate_aroma: [] as string[],
    aroma_comments: "",
    sweetness: null as number | null,
    bitterness: null as number | null,
    sourness: null as number | null,
    malt_flavor: null as number | null,
    hop_flavor: null as number | null,
    fermentation_flavor: null as number | null,
    balance: null as number | null,
    flavor_comments: "",
    alcohol: null as number | null,
    carbonation: null as number | null,
    body: null as number | null,
    astringency: null as number | null,
    off_flavor: [] as string[],
    off_flavor_other: "",
    technical_defects: [] as string[],
    overall: null as number | null,
    overall_comments: "",
  });

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data } = await supabase
        .from("filling_schedules")
        .select("*, cellar_lots(name), filling_products(name)")
        .order("filling_date", { ascending: false })
        .limit(100);
      if (data) setSchedules(data as unknown as FillingScheduleWithRelations[]);
    }
    load();
  }, []);

  const setField = <K extends keyof typeof form>(
    key: K,
    value: (typeof form)[K]
  ) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const toggleArray = (
    key: "inappropriate_appearance" | "inappropriate_aroma" | "off_flavor" | "technical_defects",
    value: string
  ) => {
    setForm((prev) => {
      const arr = prev[key] as string[];
      return {
        ...prev,
        [key]: arr.includes(value)
          ? arr.filter((v) => v !== value)
          : [...arr, value],
      };
    });
  };

  const handleSubmit = async () => {
    if (!fillingScheduleId) {
      toast.error("充填記録を選択してください");
      return;
    }
    if (form.overall === null) {
      toast.error("Overall スコアを入力してください");
      return;
    }

    setSubmitting(true);
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      toast.error("ログインが必要です");
      setSubmitting(false);
      return;
    }

    const offFlavors = [...form.off_flavor];
    if (form.off_flavor_other.trim()) {
      offFlavors.push(form.off_flavor_other.trim());
    }

    const { error } = await supabase.from("product_tastings").insert({
      taster_id: user.id,
      filling_schedule_id: fillingScheduleId,
      head_color: form.head_color,
      foam_volume: form.foam_volume,
      head_retention: form.head_retention,
      beer_color: form.beer_color,
      clarity: form.clarity,
      inappropriate_appearance: form.inappropriate_appearance,
      appearance_comments: form.appearance_comments || null,
      malt_aroma: form.malt_aroma,
      hop_aroma: form.hop_aroma,
      fermentation_aroma: form.fermentation_aroma,
      inappropriate_aroma: form.inappropriate_aroma,
      aroma_comments: form.aroma_comments || null,
      sweetness: form.sweetness,
      bitterness: form.bitterness,
      sourness: form.sourness,
      malt_flavor: form.malt_flavor,
      hop_flavor: form.hop_flavor,
      fermentation_flavor: form.fermentation_flavor,
      balance: form.balance,
      flavor_comments: form.flavor_comments || null,
      alcohol: form.alcohol,
      carbonation: form.carbonation,
      body: form.body,
      astringency: form.astringency,
      off_flavor: offFlavors,
      technical_defects: form.technical_defects,
      overall: form.overall,
      overall_comments: form.overall_comments || null,
    });

    if (error) {
      toast.error("保存に失敗しました: " + error.message);
      setSubmitting(false);
      return;
    }

    toast.success("テイスティングを記録しました");
    router.push("/results");
  };

  const steps = [
    "製品選択",
    "Appearance",
    "Aroma",
    "Flavor",
    "Mouthfeel",
    "Defects",
    "Overall",
  ];

  return (
    <FadeIn>
      <div className="p-4">
        {/* Step indicator */}
        <div className="mb-4 flex gap-1">
          {steps.map((s, i) => (
            <Button
              key={s}
              onClick={() => setStep(i)}
              variant={i === step ? "default" : i < step ? "secondary" : "outline"}
              className="flex-1 py-1 text-[10px] h-auto px-0.5"
              size="sm"
            >
              {s}
            </Button>
          ))}
        </div>

        {/* Step 0: Filling Schedule Selection */}
        {step === 0 && (
          <Card>
            <CardContent className="pt-5 space-y-4">
              <h2 className="text-lg font-bold">製品選択</h2>
              <div>
                <Label htmlFor="schedule-select">充填記録</Label>
                <select
                  id="schedule-select"
                  value={fillingScheduleId}
                  onChange={(e) => setFillingScheduleId(e.target.value)}
                  className="mt-1 flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                >
                  <option value="">-- 選択 --</option>
                  {schedules.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.cellar_lots?.name ?? "—"}
                      {s.filling_products ? ` / ${s.filling_products.name}` : ""}
                      {` (${s.filling_date})`}
                    </option>
                  ))}
                </select>
              </div>
              <NavButtons />
            </CardContent>
          </Card>
        )}

        {/* Step 1: Appearance */}
        {step === 1 && (
          <Card>
            <CardContent className="pt-5 space-y-4">
              <h2 className="text-lg font-bold">Appearance</h2>
              <SliderField
                label="Head Color"
                min={1} max={5}
                labels={["White", "", "", "", "Coffee"]}
                value={form.head_color}
                onChange={(v) => setField("head_color", v)}
              />
              <SliderField
                label="Foam Volume"
                min={0} max={4}
                labels={["None", "", "", "", "Large"]}
                value={form.foam_volume}
                onChange={(v) => setField("foam_volume", v)}
              />
              <SliderField
                label="Head Retention"
                min={1} max={5}
                labels={["Short", "", "", "", "Long"]}
                value={form.head_retention}
                onChange={(v) => setField("head_retention", v)}
              />
              <div>
                <Label className="mb-2 block">Beer Color</Label>
                <div className="grid grid-cols-3 gap-1">
                  {BEER_COLORS.map((c) => (
                    <Button
                      key={c}
                      type="button"
                      onClick={() => setField("beer_color", c)}
                      variant={form.beer_color === c ? "default" : "outline"}
                      size="sm"
                      className="text-xs"
                    >
                      {c}
                    </Button>
                  ))}
                </div>
              </div>
              <SliderField
                label="Clarity"
                min={1} max={5}
                labels={["Brilliant", "", "", "", "Opaque"]}
                value={form.clarity}
                onChange={(v) => setField("clarity", v)}
              />
              <CheckboxGroup
                label="Inappropriate"
                options={INAPPROPRIATE_APPEARANCE_OPTIONS}
                selected={form.inappropriate_appearance}
                onToggle={(v) => toggleArray("inappropriate_appearance", v)}
              />
              <TextAreaField
                label="Comments"
                value={form.appearance_comments}
                onChange={(v) => setField("appearance_comments", v)}
              />
              <NavButtons />
            </CardContent>
          </Card>
        )}

        {/* Step 2: Aroma */}
        {step === 2 && (
          <Card>
            <CardContent className="pt-5 space-y-4">
              <h2 className="text-lg font-bold">Aroma</h2>
              <SliderField label="Malt Aroma" min={0} max={3}
                labels={["None", "Low", "Mid", "High"]}
                value={form.malt_aroma} onChange={(v) => setField("malt_aroma", v)} />
              <SliderField label="Hop Aroma" min={0} max={3}
                labels={["None", "Low", "Mid", "High"]}
                value={form.hop_aroma} onChange={(v) => setField("hop_aroma", v)} />
              <SliderField label="Fermentation Aroma" min={0} max={3}
                labels={["None", "Low", "Mid", "High"]}
                value={form.fermentation_aroma} onChange={(v) => setField("fermentation_aroma", v)} />
              <CheckboxGroup
                label="Inappropriate"
                options={INAPPROPRIATE_AROMA_OPTIONS}
                selected={form.inappropriate_aroma}
                onToggle={(v) => toggleArray("inappropriate_aroma", v)}
              />
              <TextAreaField label="Comments" value={form.aroma_comments}
                onChange={(v) => setField("aroma_comments", v)} />
              <NavButtons />
            </CardContent>
          </Card>
        )}

        {/* Step 3: Flavor */}
        {step === 3 && (
          <Card>
            <CardContent className="pt-5 space-y-4">
              <h2 className="text-lg font-bold">Flavor & Taste</h2>
              <SliderField label="Sweetness" min={1} max={5}
                labels={["Low", "", "", "", "High"]}
                value={form.sweetness} onChange={(v) => setField("sweetness", v)} />
              <SliderField label="Bitterness" min={1} max={5}
                labels={["Low", "", "", "", "High"]}
                value={form.bitterness} onChange={(v) => setField("bitterness", v)} />
              <SliderField label="Sourness" min={1} max={5}
                labels={["Low", "", "", "", "High"]}
                value={form.sourness} onChange={(v) => setField("sourness", v)} />
              <SliderField label="Malt Flavor" min={1} max={5}
                labels={["Low", "", "", "", "High"]}
                value={form.malt_flavor} onChange={(v) => setField("malt_flavor", v)} />
              <SliderField label="Hop Flavor" min={1} max={5}
                labels={["Low", "", "", "", "High"]}
                value={form.hop_flavor} onChange={(v) => setField("hop_flavor", v)} />
              <SliderField label="Fermentation Flavor" min={1} max={5}
                labels={["Low", "", "", "", "High"]}
                value={form.fermentation_flavor} onChange={(v) => setField("fermentation_flavor", v)} />
              <SliderField label="Balance" min={1} max={5}
                labels={["Hop driven", "", "", "", "Malt driven"]}
                value={form.balance} onChange={(v) => setField("balance", v)} />
              <TextAreaField label="Comments" value={form.flavor_comments}
                onChange={(v) => setField("flavor_comments", v)} />
              <NavButtons />
            </CardContent>
          </Card>
        )}

        {/* Step 4: Mouthfeel */}
        {step === 4 && (
          <Card>
            <CardContent className="pt-5 space-y-4">
              <h2 className="text-lg font-bold">Mouthfeel</h2>
              <SliderField label="Alcohol" min={1} max={5}
                labels={["Low", "", "", "", "High"]}
                value={form.alcohol} onChange={(v) => setField("alcohol", v)} />
              <SliderField label="Carbonation" min={1} max={5}
                labels={["Low", "", "", "", "High"]}
                value={form.carbonation} onChange={(v) => setField("carbonation", v)} />
              <SliderField label="Body" min={1} max={5}
                labels={["Low", "", "", "", "High"]}
                value={form.body} onChange={(v) => setField("body", v)} />
              <SliderField label="Astringency" min={1} max={5}
                labels={["Dry", "", "", "", "Cloying"]}
                value={form.astringency} onChange={(v) => setField("astringency", v)} />
              <NavButtons />
            </CardContent>
          </Card>
        )}

        {/* Step 5: Defects */}
        {step === 5 && (
          <Card>
            <CardContent className="pt-5 space-y-4">
              <h2 className="text-lg font-bold">Defects</h2>
              <CheckboxGroup label="Off Flavor" options={OFF_FLAVOR_OPTIONS}
                selected={form.off_flavor} onToggle={(v) => toggleArray("off_flavor", v)} />
              <div>
                <Label className="mb-1 block text-xs text-muted-foreground">Other off flavor</Label>
                <Input
                  value={form.off_flavor_other}
                  onChange={(e) => setField("off_flavor_other", e.target.value)}
                  placeholder="自由入力"
                />
              </div>
              <CheckboxGroup label="Technical Defects" options={TECHNICAL_DEFECT_OPTIONS}
                selected={form.technical_defects} onToggle={(v) => toggleArray("technical_defects", v)} />
              <NavButtons />
            </CardContent>
          </Card>
        )}

        {/* Step 6: Overall */}
        {step === 6 && (
          <Card>
            <CardContent className="pt-5 space-y-4">
              <h2 className="text-lg font-bold">Overall</h2>
              <SliderField label="Overall Score" min={1} max={10}
                labels={["Needs Improvement", "", "", "", "", "", "", "", "", "Excellent"]}
                value={form.overall} onChange={(v) => setField("overall", v)} />
              <TextAreaField label="Comments" value={form.overall_comments}
                onChange={(v) => setField("overall_comments", v)} />
              <Button
                onClick={handleSubmit}
                disabled={submitting}
                className="w-full"
                size="lg"
              >
                {submitting ? "送信中..." : "送信"}
              </Button>
              <Button
                onClick={() => setStep(step - 1)}
                variant="outline"
                className="w-full"
              >
                戻る
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </FadeIn>
  );

  function NavButtons() {
    return (
      <div className="flex gap-2 pt-2">
        {step > 0 && (
          <Button
            onClick={() => setStep(step - 1)}
            variant="outline"
            className="flex-1"
          >
            戻る
          </Button>
        )}
        <Button
          onClick={() => setStep(step + 1)}
          className="flex-1"
        >
          次へ
        </Button>
      </div>
    );
  }
}

// ---- Shared form components ----

function SliderField({ label, min, max, labels, value, onChange }: {
  label: string; min: number; max: number; labels: string[];
  value: number | null; onChange: (v: number) => void;
}) {
  const count = max - min + 1;
  return (
    <div>
      <Label className="mb-2 block">{label}</Label>
      <div className="flex gap-1">
        {Array.from({ length: count }, (_, i) => {
          const v = min + i;
          return (
            <Button
              key={v}
              type="button"
              onClick={() => onChange(v)}
              variant={value === v ? "default" : "outline"}
              className="flex-1 py-2 text-sm h-auto px-0"
              size="sm"
            >
              {v}
            </Button>
          );
        })}
      </div>
      <div className="mt-0.5 flex justify-between text-[10px] text-muted-foreground">
        <span>{labels[0]}</span>
        <span>{labels[labels.length - 1]}</span>
      </div>
    </div>
  );
}

SliderField.displayName = "SliderField";

function CheckboxGroup({ label, options, selected, onToggle }: {
  label: string; options: readonly string[]; selected: string[];
  onToggle: (v: string) => void;
}) {
  return (
    <div>
      <Label className="mb-2 block">{label}</Label>
      <div className="flex flex-wrap gap-1">
        {options.map((opt) => (
          <Button
            key={opt}
            type="button"
            onClick={() => onToggle(opt)}
            variant={selected.includes(opt) ? "destructive" : "outline"}
            size="sm"
            className={`text-xs ${selected.includes(opt) ? "bg-destructive/10 text-destructive hover:bg-destructive/20 border-destructive" : ""}`}
          >
            {opt}
          </Button>
        ))}
      </div>
    </div>
  );
}

CheckboxGroup.displayName = "CheckboxGroup";

function TextAreaField({ label, value, onChange }: {
  label: string; value: string; onChange: (v: string) => void;
}) {
  return (
    <div>
      <Label className="mb-1 block">{label}</Label>
      <Textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={2}
      />
    </div>
  );
}

TextAreaField.displayName = "TextAreaField";
