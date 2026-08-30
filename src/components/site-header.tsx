import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { MobileNavigation } from "@/components/mobile-navigation";
import { Button } from "@/components/ui/button";

const navigation = [
  { href: "/", label: "Overview" },
  { href: "/catalog", label: "Catalog" },
  { href: "/advisor", label: "Compatibility advisor" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/80 bg-background/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-3" aria-label="TankFit AI home">
          <Image
            src="/images/logos/tankroy-systems.svg"
            alt=""
            width={34}
            height={34}
            priority
          />
          <div className="leading-none">
            <span className="block text-sm font-semibold tracking-tight">TankFit AI</span>
            <span className="mt-1 block font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
              by Tankroy Systems
            </span>
          </div>
        </Link>

        <nav className="hidden items-center gap-7 md:flex" aria-label="Primary navigation">
          {navigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden md:block">
          <Button asChild size="sm">
            <Link href="/advisor">
              Test the rules <ArrowUpRight data-icon="inline-end" />
            </Link>
          </Button>
        </div>
        <MobileNavigation navigation={navigation} />
      </div>
    </header>
  );
}
