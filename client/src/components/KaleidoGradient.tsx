export function KaleidoGradient() {
  return (
    <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-gradient-to-br from-[hsl(252,95%,62%)] via-[hsl(270,85%,65%)] to-transparent opacity-20 dark:opacity-10 blur-3xl" />
      <div className="absolute top-20 right-0 w-[600px] h-[600px] bg-gradient-to-l from-[hsl(270,85%,65%)] to-transparent opacity-15 dark:opacity-10 blur-3xl" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-gradient-to-tr from-[hsl(252,95%,62%)] to-transparent opacity-15 dark:opacity-10 blur-3xl" />
    </div>
  );
}
