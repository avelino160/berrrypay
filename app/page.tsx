import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, CreditCard, Zap, Shield, BarChart3 } from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <span className="font-bold text-primary-foreground">B</span>
            </div>
            <span className="text-xl font-semibold">BerryPay</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="ghost">Sign in</Button>
            </Link>
            <Link href="/register">
              <Button>Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="container mx-auto px-4 py-24 text-center">
        <h1 className="mx-auto max-w-3xl text-balance text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
          Accept payments with PIX in minutes
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
          Create beautiful checkout pages, manage products, and receive payments instantly with BerryPay. No coding required.
        </p>
        <div className="mt-10 flex items-center justify-center gap-4">
          <Link href="/register">
            <Button size="lg">
              Start for free
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
          <Link href="/login">
            <Button size="lg" variant="outline">
              Sign in
            </Button>
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="border-t bg-muted/30 py-24">
        <div className="container mx-auto px-4">
          <h2 className="text-center text-3xl font-bold">Everything you need to sell online</h2>
          <p className="mx-auto mt-4 max-w-2xl text-center text-muted-foreground">
            Simple tools to create checkouts, manage products, and track your sales
          </p>
          <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-lg border bg-card p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <CreditCard className="h-6 w-6 text-primary" />
              </div>
              <h3 className="mt-4 font-semibold">Payment Links</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Create custom checkout pages in seconds. Share a link and start receiving payments.
              </p>
            </div>
            <div className="rounded-lg border bg-card p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <Zap className="h-6 w-6 text-primary" />
              </div>
              <h3 className="mt-4 font-semibold">Instant PIX</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Receive payments instantly via PIX. No waiting for card settlements.
              </p>
            </div>
            <div className="rounded-lg border bg-card p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <h3 className="mt-4 font-semibold">Secure</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Your data is encrypted and secure. We never store sensitive payment information.
              </p>
            </div>
            <div className="rounded-lg border bg-card p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <BarChart3 className="h-6 w-6 text-primary" />
              </div>
              <h3 className="mt-4 font-semibold">Analytics</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Track your sales and revenue with a simple dashboard. Know your numbers.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="container mx-auto px-4 py-24 text-center">
        <h2 className="text-3xl font-bold">Ready to start selling?</h2>
        <p className="mt-4 text-muted-foreground">
          Create your free account and start accepting payments today.
        </p>
        <Link href="/register" className="mt-8 inline-block">
          <Button size="lg">
            Create free account
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>
      </section>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} BerryPay. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
