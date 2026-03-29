import Link from 'next/link';
import Image from 'next/image';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4">
      {/* Background effects */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute top-[-30%] left-[-20%] w-[700px] h-[700px] bg-fab-accent/[0.04] rounded-full blur-[150px]" />
        <div className="absolute bottom-[-20%] right-[-15%] w-[500px] h-[500px] bg-orange-500/[0.03] rounded-full blur-[120px]" />
      </div>

      <Link href="/" className="flex flex-col items-center gap-4 mb-8">
        <Image
          src="/logo.png"
          alt="Ideactory.ai"
          width={180}
          height={180}
          className="drop-shadow-2xl"
          priority
        />
        <span className="fab-badge-module text-xs px-3 py-1">v6.2</span>
      </Link>
      <div className="w-full max-w-md">{children}</div>

      <p className="mt-8 text-fab-muted/40 text-xs">
        McKinsey × Y Combinator × Sequoia
      </p>
    </div>
  );
}
