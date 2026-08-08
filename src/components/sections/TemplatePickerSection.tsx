import { useEffect, useState } from 'react';
import { Check, Flower2, Heart, Leaf } from 'lucide-react';
import { Controller, type Control } from 'react-hook-form';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../ui/card';
import {
  WEDDING_TEMPLATES,
} from '../../lib/templates';
import type { WeddingSiteFormData } from '../../lib/validations';

interface TemplatePickerSectionProps {
  control: Control<WeddingSiteFormData>;
}

function TemplatePreview({
  templateId,
}: {
  templateId: string;
}) {
  if (templateId === 'flory') {
    return (
      <div className="relative h-36 overflow-hidden rounded-lg bg-[#fff8df] p-4 shadow-inner">
        <div className="absolute -left-5 bottom-0 h-24 w-20 rounded-t-[100%] bg-[#d7984a]/45 blur-sm" />
        <div className="absolute -right-5 top-0 h-24 w-24 rounded-b-[100%] bg-[#f0bd58]/45 blur-sm" />
        <div className="absolute left-1/2 top-2 h-24 w-20 -translate-x-1/2 rounded-t-[3rem] border-4 border-[#f5e7bd] bg-white/80 shadow-sm" />
        <div className="absolute left-5 top-3 text-xl text-[#b55d3e]">✿</div>
        <div className="absolute bottom-2 right-5 text-2xl text-[#b55d3e]">✿</div>
        <div className="relative flex h-full flex-col items-center justify-between pb-1 pt-3 text-center">
          <div className="relative z-10 flex flex-col items-center gap-1">
            <Flower2 className="h-4 w-4 text-[#9a3517]" />
            <span className="font-serif text-lg italic text-[#6f2c18]">A &amp; B</span>
          </div>
          <span className="relative z-10 rounded-full bg-[#fff8df]/90 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#a44b2a]">
            Flory garden
          </span>
        </div>
      </div>
    );
  }

  if (templateId === 'autumn') {
    return (
      <div className="relative h-36 overflow-hidden rounded-lg bg-[#32180f] p-4 text-[#fff9e8] shadow-inner">
        <div className="absolute -left-3 top-3 text-3xl opacity-80">🍂</div>
        <div className="absolute right-2 top-1 text-2xl opacity-70">🍁</div>
        <div className="absolute bottom-2 left-4 text-2xl opacity-70">🍂</div>
        <div className="absolute bottom-3 right-4 text-3xl opacity-80">🍁</div>
        <div className="relative flex h-full flex-col items-center justify-center rounded-[2rem] border border-[#f1cb7e]/40 bg-gradient-to-b from-[#a84824] to-[#5c2d1f] text-center">
          <Leaf className="mb-1 h-5 w-5 text-[#f4cd78]" />
          <span className="font-serif text-xl italic">A & B</span>
          <span className="mt-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#f9e2aa]">
            Autumn invitation
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-36 overflow-hidden rounded-lg bg-gradient-to-br from-rose-100 via-pink-50 to-amber-50 p-4 shadow-inner">
      <div className="absolute -left-6 -top-8 h-24 w-24 rounded-full bg-rose-200/70 blur-xl" />
      <div className="absolute -bottom-8 -right-4 h-28 w-28 rounded-full bg-amber-200/60 blur-xl" />
      <div className="relative flex h-full flex-col items-center justify-center rounded-lg border border-white/80 bg-white/70 text-center shadow-sm">
        <Heart className="mb-2 h-5 w-5 fill-rose-400 text-rose-400" />
        <span className="font-serif text-xl text-rose-900">A & B</span>
        <span className="mt-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-rose-500">
          Classic romance
        </span>
      </div>
    </div>
  );
}

export function TemplatePickerSection({
  control,
}: TemplatePickerSectionProps) {
  const [templates, setTemplates] = useState([...WEDDING_TEMPLATES]);

  useEffect(() => {
    fetch('/api/templates')
      .then((response) => (response.ok ? response.json() : null))
      .then((result) => {
        if (result?.templates?.length) setTemplates(result.templates);
      })
      .catch(() => {
        // Keep the built-in fallback when the catalog endpoint is unavailable.
      });
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pilih Template</CardTitle>
        <CardDescription>
          Template mengatur tampilan halaman undangan. Semua data yang
          sudah diisi tetap digunakan saat kamu berganti template.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Controller
          name="templateId"
          control={control}
          render={({ field }) => (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {templates.map((template) => {
                const isSelected = field.value === template.id;

                return (
                  <label
                    key={template.id}
                    className={
                      'relative cursor-pointer rounded-xl border p-3 transition-all ' +
                      (isSelected
                        ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
                        : 'border-border bg-card hover:border-primary/50 hover:bg-muted/40')
                    }
                  >
                    <input
                      type="radio"
                      name={field.name}
                      value={template.id}
                      checked={isSelected}
                      onChange={() => field.onChange(template.id)}
                      onBlur={field.onBlur}
                      className="sr-only"
                    />
                    <TemplatePreview templateId={template.id} />
                    <div className="mt-3 pr-7">
                      <p className="font-semibold">{template.name}</p>
                      <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                        {template.description}
                      </p>
                    </div>
                    {isSelected && (
                      <span className="absolute right-3 top-3 inline-flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground">
                        <Check className="h-4 w-4" />
                      </span>
                    )}
                  </label>
                );
              })}
            </div>
          )}
        />
      </CardContent>
    </Card>
  );
}
