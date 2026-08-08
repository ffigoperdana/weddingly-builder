interface FloatingDecorationsProps {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
}

export function FloatingDecorations({
  primaryColor,
  secondaryColor,
  accentColor,
}: FloatingDecorationsProps) {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {/* Top Left Decoration */}
      <div
        className="absolute -top-20 -left-20 w-64 h-64 rounded-full opacity-10 blur-3xl"
        style={{ backgroundColor: primaryColor }}
      />

      {/* Top Right Decoration */}
      <div
        className="absolute -top-32 -right-32 w-96 h-96 rounded-full opacity-10 blur-3xl"
        style={{ backgroundColor: secondaryColor }}
      />

      {/* Middle Left Decoration */}
      <div
        className="absolute top-1/3 -left-40 w-80 h-80 rounded-full opacity-10 blur-3xl"
        style={{ backgroundColor: accentColor }}
      />

      {/* Middle Right Decoration */}
      <div
        className="absolute top-1/2 -right-40 w-72 h-72 rounded-full opacity-10 blur-3xl"
        style={{ backgroundColor: primaryColor }}
      />

      {/* Bottom Left Decoration */}
      <div
        className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full opacity-10 blur-3xl"
        style={{ backgroundColor: secondaryColor }}
      />

      {/* Bottom Right Decoration */}
      <div
        className="absolute -bottom-32 -right-32 w-80 h-80 rounded-full opacity-10 blur-3xl"
        style={{ backgroundColor: accentColor }}
      />

      {/* Small floating hearts/circles */}
      {[...Array(6)].map((_, i) => (
        <div
          key={i}
          className="absolute w-3 h-3 rounded-full opacity-20"
          style={{
            backgroundColor:
              i % 3 === 0
                ? primaryColor
                : i % 3 === 1
                ? secondaryColor
                : accentColor,
            left: `${15 + i * 15}%`,
            top: `${20 + i * 10}%`,
          }}
        />
      ))}
    </div>
  );
}
