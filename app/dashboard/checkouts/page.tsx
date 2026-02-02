"use client";

import { useState } from "react";
import useSWR from "swr";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Pencil, Trash2, ShoppingCart, Link as LinkIcon, Loader2, Copy, ExternalLink } from "lucide-react";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

interface Product {
  id: number;
  name: string;
  price: string;
}

interface Checkout {
  id: number;
  name: string;
  description: string | null;
  slug: string;
  productIds: number[];
  totalAmount: string;
  customAmount: string | null;
  allowCustomAmount: boolean;
  collectEmail: boolean;
  collectPhone: boolean;
  collectAddress: boolean;
  successUrl: string | null;
  cancelUrl: string | null;
  isActive: boolean;
  createdAt: string;
}

export default function CheckoutsPage() {
  const { data: checkouts, isLoading, mutate } = useSWR<Checkout[]>("/api/checkouts", fetcher);
  const { data: products } = useSWR<Product[]>("/api/products", fetcher);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCheckout, setEditingCheckout] = useState<Checkout | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    productIds: [] as number[],
    customAmount: "",
    allowCustomAmount: false,
    collectEmail: true,
    collectPhone: false,
    collectAddress: false,
    successUrl: "",
    cancelUrl: "",
    isActive: true,
  });

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      productIds: [],
      customAmount: "",
      allowCustomAmount: false,
      collectEmail: true,
      collectPhone: false,
      collectAddress: false,
      successUrl: "",
      cancelUrl: "",
      isActive: true,
    });
    setEditingCheckout(null);
  };

  const openEditDialog = (checkout: Checkout) => {
    setEditingCheckout(checkout);
    setFormData({
      name: checkout.name,
      description: checkout.description || "",
      productIds: checkout.productIds || [],
      customAmount: checkout.customAmount || "",
      allowCustomAmount: checkout.allowCustomAmount,
      collectEmail: checkout.collectEmail,
      collectPhone: checkout.collectPhone,
      collectAddress: checkout.collectAddress,
      successUrl: checkout.successUrl || "",
      cancelUrl: checkout.cancelUrl || "",
      isActive: checkout.isActive,
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const url = editingCheckout ? `/api/checkouts/${editingCheckout.id}` : "/api/checkouts";
      const method = editingCheckout ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description || null,
          productIds: formData.productIds,
          customAmount: formData.customAmount ? parseFloat(formData.customAmount) : null,
          allowCustomAmount: formData.allowCustomAmount,
          collectEmail: formData.collectEmail,
          collectPhone: formData.collectPhone,
          collectAddress: formData.collectAddress,
          successUrl: formData.successUrl || null,
          cancelUrl: formData.cancelUrl || null,
          isActive: formData.isActive,
        }),
      });

      if (res.ok) {
        await mutate();
        setIsDialogOpen(false);
        resetForm();
      }
    } catch (error) {
      console.error("Error saving checkout:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this checkout?")) return;

    try {
      const res = await fetch(`/api/checkouts/${id}`, { method: "DELETE" });
      if (res.ok) {
        await mutate();
      }
    } catch (error) {
      console.error("Error deleting checkout:", error);
    }
  };

  const copyLink = (slug: string) => {
    const url = `${window.location.origin}/pay/${slug}`;
    navigator.clipboard.writeText(url);
  };

  const formatCurrency = (value: string) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(parseFloat(value));
  };

  const toggleProduct = (productId: number) => {
    setFormData((prev) => ({
      ...prev,
      productIds: prev.productIds.includes(productId)
        ? prev.productIds.filter((id) => id !== productId)
        : [...prev.productIds, productId],
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Checkouts</h1>
          <p className="text-muted-foreground">Create and manage payment links</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Checkout
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>{editingCheckout ? "Edit Checkout" : "Create Checkout"}</DialogTitle>
                <DialogDescription>
                  {editingCheckout ? "Update checkout settings" : "Create a new payment link"}
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Checkout name"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Checkout description"
                  />
                </div>

                {products && products.length > 0 && (
                  <div className="space-y-2">
                    <Label>Products</Label>
                    <div className="max-h-40 overflow-y-auto rounded border p-3 space-y-2">
                      {products.map((product) => (
                        <div key={product.id} className="flex items-center gap-2">
                          <Checkbox
                            id={`product-${product.id}`}
                            checked={formData.productIds.includes(product.id)}
                            onCheckedChange={() => toggleProduct(product.id)}
                          />
                          <Label htmlFor={`product-${product.id}`} className="flex-1 cursor-pointer">
                            {product.name} - {formatCurrency(product.price)}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="customAmount">Custom Amount (BRL)</Label>
                  <Input
                    id="customAmount"
                    type="number"
                    step="0.01"
                    value={formData.customAmount}
                    onChange={(e) => setFormData({ ...formData, customAmount: e.target.value })}
                    placeholder="Leave empty to use product prices"
                  />
                </div>

                <div className="space-y-4">
                  <Label>Collection Options</Label>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-2">
                      <Switch
                        id="collectEmail"
                        checked={formData.collectEmail}
                        onCheckedChange={(checked) => setFormData({ ...formData, collectEmail: checked })}
                      />
                      <Label htmlFor="collectEmail">Collect Email</Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch
                        id="collectPhone"
                        checked={formData.collectPhone}
                        onCheckedChange={(checked) => setFormData({ ...formData, collectPhone: checked })}
                      />
                      <Label htmlFor="collectPhone">Collect Phone</Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch
                        id="collectAddress"
                        checked={formData.collectAddress}
                        onCheckedChange={(checked) => setFormData({ ...formData, collectAddress: checked })}
                      />
                      <Label htmlFor="collectAddress">Collect Address</Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch
                        id="allowCustomAmount"
                        checked={formData.allowCustomAmount}
                        onCheckedChange={(checked) => setFormData({ ...formData, allowCustomAmount: checked })}
                      />
                      <Label htmlFor="allowCustomAmount">Allow Custom Amount</Label>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Switch
                    id="isActive"
                    checked={formData.isActive}
                    onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                  />
                  <Label htmlFor="isActive">Active</Label>
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSaving}>
                  {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {editingCheckout ? "Update" : "Create"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Checkouts</CardTitle>
          <CardDescription>Manage your payment links</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : checkouts && checkouts.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {checkouts.map((checkout) => (
                  <TableRow key={checkout.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{checkout.name}</p>
                        <p className="text-xs text-muted-foreground">/pay/{checkout.slug}</p>
                      </div>
                    </TableCell>
                    <TableCell>{formatCurrency(checkout.totalAmount)}</TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                          checkout.isActive
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {checkout.isActive ? "Active" : "Inactive"}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => copyLink(checkout.slug)}
                          title="Copy link"
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          asChild
                        >
                          <a href={`/pay/${checkout.slug}`} target="_blank" rel="noopener noreferrer" title="Open checkout">
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEditDialog(checkout)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(checkout.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <ShoppingCart className="h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">No checkouts yet</h3>
              <p className="text-muted-foreground">Create your first checkout to start accepting payments</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
