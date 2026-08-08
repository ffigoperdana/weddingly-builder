interface SectionDividerProps {
  primaryColor: string;
  accentColor: string;
}

export function SectionDivider({
  primaryColor,
  accentColor,
}: SectionDividerProps) {
  return (
    <div className="relative py-8 sm:py-12">
      <div className="absolute inset-0 flex items-center">
        <div
          className="w-full border-t-2 opacity-10"
          style={{ borderColor: primaryColor }}
        />
      </div>
      <div className="relative flex justify-center">
        <div className="flex items-center gap-2">
          <div
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: accentColor }}
          />
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: primaryColor }}
          />
          <div
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: accentColor }}
          />
        </div>
      </div>
    </div>
  );
}
