type LogoProps = {
  width?: number | string;
  className?: string;
};

export function Logo({ width = 48, className }: LogoProps) {
  return (
    <img
      src="Logo.jpg"
      alt="Logo"
      className={className}
      style={{
        width,
        height: "auto",
        display: "block",
      }}
    />
  );
}
