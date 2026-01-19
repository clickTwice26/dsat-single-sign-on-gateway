import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faShieldHalved,
  faUserCheck,
  faBolt,
} from "@fortawesome/free-solid-svg-icons";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2 text-xl font-bold tracking-tight">
          <FontAwesomeIcon icon={faShieldHalved} className="h-6 w-6" />
          <span>DSAT Auth</span>
        </div>
        <nav className="flex items-center gap-4">
          <Link href="/login">
            <Button variant="ghost">Sign In</Button>
          </Link>
          <Link href="/register">
            <Button>Get Started</Button>
          </Link>
        </nav>
      </header>
      <main className="flex-1">
        <section className="container mx-auto flex flex-col items-center justify-center gap-6 px-4 py-24 text-center sm:px-6 lg:px-8 lg:py-32">
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
            Secure Single Sign-On <br className="hidden sm:inline" />
            for <span className="text-primary">DSAT School</span>
          </h1>
          <p className="max-w-[42rem] text-muted-foreground sm:text-xl sm:leading-8">
            One account for all your learning resources. Secure, fast, and
            reliable authentication for the next generation of students.
          </p>
          <div className="flex items-center gap-4">
            <Link href="/register">
              <Button size="lg" className="px-8">
                Create Account
              </Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="outline" className="px-8">
                Sign In
              </Button>
            </Link>
          </div>
        </section>

        <section className="container mx-auto grid gap-8 px-4 py-16 sm:grid-cols-3 sm:px-6 lg:px-8">
          <FeatureCard
            icon={<FontAwesomeIcon icon={faShieldHalved} className="h-10 w-10 text-primary" />}
            title="Secure by Design"
            description="Industry standard encryption and security practices to keep your data safe."
          />
          <FeatureCard
            icon={<FontAwesomeIcon icon={faBolt} className="h-10 w-10 text-primary" />}
            title="Lightning Fast"
            description="Optimized performance ensures you spend less time logging in and more time learning."
          />
          <FeatureCard
            icon={<FontAwesomeIcon icon={faUserCheck} className="h-10 w-10 text-primary" />}
            title="Single Identity"
            description="Access all DSAT School services with a single, unified profile."
          />
        </section>
      </main>
      <footer className="border-t bg-muted/20 py-6">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground sm:px-6 lg:px-8">
          © {new Date().getFullYear()} DSAT School. All rights reserved.
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <Card className="border-none bg-muted/30 shadow-none transition-colors hover:bg-muted/50">
      <CardHeader>
        <div className="mb-4">{icon}</div>
        <CardTitle className="text-xl">{title}</CardTitle>
        <CardDescription className="text-base">{description}</CardDescription>
      </CardHeader>
    </Card>
  );
}
