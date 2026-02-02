"use client";

import { useState, useEffect, use } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, ShoppingBag, Copy, Check, AlertCircle } from "lucide-react";

interface Product {
  id: number;
  name: string;
  description: string | null;
  price: string;
  imageUrl: string | null;
}

interface Checkout {
  id: number;
  name: string;
  description: string | null;
  totalAmount: string;
  allowCustomAmount: boolean;
  collectEmail: boolean;
  collectPhone: boolean;
  collectAddress: boolean;
}

interface CheckoutData {
  checkout: Checkout;
  products: Product[];
  settings: {
    businessName: string | null;
    logoUrl: string | null;
    primaryColor: string;
    pixKey: string | null;
    pixKeyType: string | null;
  } | null;
}

interface PaymentResult {
  sale: { id: number };
  pixKey: string | null;
  pixKeyType: string | null;
}

export default function PublicCheckoutPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = use(params);
  const [checkoutData, setCheckoutData] = useState<CheckoutData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentResult, setPaymentResult] = useState<PaymentResult | null>(null);
  const [copied, setCopied] = useState(false);
  const [formData, setFormData] = useState({
    customerName: "",
    customerEmail: "",
    customerPhone: "",
    customAmount: "",
  });

  useEffect(() => {
    const fetchCheckout = async () => {
      try {
        const res = await fetch(`/api/public/checkout/${resolvedParams.slug}`);
        if (!res.ok) {
          if (res.status === 404) {
            setError("Checkout not found");
          } else {
            setError("Failed to load checkout");
          }
          return;
        }
        const data = await res.json();
        setCheckoutData(data);
      } catch {
        setError("Failed to load checkout");
      } finally {
        setIsLoading(false);
      }
    };

    fetchCheckout();
  }, [resolvedParams.slug]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!checkoutData) return;

    setIsProcessing(true);

    try {
      const amount = formData.customAmount
        ? parseFloat(formData.customAmount)
        : parseFloat(checkoutData.checkout.totalAmount);

      const res = await fetch(`/api/public/checkout/${resolvedParams.slug}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: formData.customerName || null,
          customerEmail: formData.customerEmail || null,
          customerPhone: formData.customerPhone || null,
          amount,
        }),
      });

      if (res.ok) {
        const result = await res.json();
        setPaymentResult(result);
      }
    } catch (error) {
      console.error("Payment error:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const copyPixKey = () => {
    if (paymentResult?.pixKey) {
      navigator.clipboard.writeText(paymentResult.pixKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const formatCurrency = (value: string | number) => {
    const num = typeof value === "string" ? parseFloat(value) : value;
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(num);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !checkoutData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
        <Card className="w-full max-w-md text-center">
          <CardContent className="pt-6">
            <AlertCircle className="mx-auto h-12 w-12 text-destructive" />
            <h2 className="mt-4 text-lg font-semibold">{error || "Checkout not found"}</h2>
            <p className="text-muted-foreground">This checkout link may be invalid or expired.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { checkout, products, settings } = checkoutData;
  const primaryColor = settings?.primaryColor || "#8B5CF6";

  if (paymentResult) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div
              className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full"
              style={{ backgroundColor: primaryColor }}
            >
              <Check className="h-8 w-8 text-white" />
            </div>
            <CardTitle>Payment Created</CardTitle>
            <CardDescription>Complete your payment using PIX</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg border bg-muted/50 p-4 text-center">
              <p className="text-sm text-muted-foreground mb-2">Amount to pay</p>
              <p className="text-3xl font-bold">
                {formatCurrency(
                  formData.customAmount || checkout.totalAmount
                )}
              </p>
            </div>

            {paymentResult.pixKey ? (
              <div className="space-y-2">
                <Label>PIX Key ({paymentResult.pixKeyType})</Label>
                <div className="flex gap-2">
                  <Input value={paymentResult.pixKey} readOnly />
                  <Button variant="outline" size="icon" onClick={copyPixKey}>
                    {copied ? (
                      <Check className="h-4 w-4 text-green-600" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Copy this key and paste in your bank app to complete the payment
                </p>
              </div>
            ) : (
              <p className="text-center text-muted-foreground">
                Contact the seller for payment instructions
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <div className="flex items-center gap-3 mb-2">
            {settings?.logoUrl ? (
              <img
                src={settings.logoUrl}
                alt={settings.businessName || "Business"}
                className="h-10 w-10 rounded-lg object-cover"
              />
            ) : (
              <div
                className="flex h-10 w-10 items-center justify-center rounded-lg"
                style={{ backgroundColor: primaryColor }}
              >
                <ShoppingBag className="h-5 w-5 text-white" />
              </div>
            )}
            <div>
              <p className="text-sm text-muted-foreground">
                {settings?.businessName || "Payment"}
              </p>
              <CardTitle>{checkout.name}</CardTitle>
            </div>
          </div>
          {checkout.description && (
            <CardDescription>{checkout.description}</CardDescription>
          )}
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {products.length > 0 && (
              <div className="space-y-2">
                <Label>Items</Label>
                <div className="rounded-lg border divide-y">
                  {products.map((product) => (
                    <div key={product.id} className="flex items-center justify-between p-3">
                      <div>
                        <p className="font-medium">{product.name}</p>
                        {product.description && (
                          <p className="text-xs text-muted-foreground">{product.description}</p>
                        )}
                      </div>
                      <p className="font-semibold">{formatCurrency(product.price)}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="rounded-lg border bg-muted/50 p-4">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Total</span>
                <span className="text-2xl font-bold">
                  {formatCurrency(checkout.totalAmount)}
                </span>
              </div>
            </div>

            {checkout.allowCustomAmount && (
              <div className="space-y-2">
                <Label htmlFor="customAmount">Custom Amount (optional)</Label>
                <Input
                  id="customAmount"
                  type="number"
                  step="0.01"
                  value={formData.customAmount}
                  onChange={(e) => setFormData({ ...formData, customAmount: e.target.value })}
                  placeholder="Enter custom amount"
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="customerName">Name</Label>
              <Input
                id="customerName"
                value={formData.customerName}
                onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                placeholder="Your name"
              />
            </div>

            {checkout.collectEmail && (
              <div className="space-y-2">
                <Label htmlFor="customerEmail">Email</Label>
                <Input
                  id="customerEmail"
                  type="email"
                  value={formData.customerEmail}
                  onChange={(e) => setFormData({ ...formData, customerEmail: e.target.value })}
                  placeholder="your@email.com"
                  required
                />
              </div>
            )}

            {checkout.collectPhone && (
              <div className="space-y-2">
                <Label htmlFor="customerPhone">Phone</Label>
                <Input
                  id="customerPhone"
                  type="tel"
                  value={formData.customerPhone}
                  onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
                  placeholder="(00) 00000-0000"
                  required
                />
              </div>
            )}
          </CardContent>

          <CardFooter>
            <Button
              type="submit"
              className="w-full"
              style={{ backgroundColor: primaryColor }}
              disabled={isProcessing}
            >
              {isProcessing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Pay {formatCurrency(formData.customAmount || checkout.totalAmount)}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
