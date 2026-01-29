"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Receipt, Calendar, CreditCard, CheckCircle2, XCircle, Clock, AlertCircle } from "lucide-react";
import { Separator } from "@/components/ui/separator";

interface Transaction {
    order_id: number;
    amount: number;
    payment_status: string;
    product_key: string;
    product_name: string;
    product_category: string;
    purchase_date: string;
    transaction_id: string;
    coupon_code?: string;
    coupon_discount?: number;
    subscription_details?: {
        is_active: boolean;
        remaining_days: number;
        status: string;
        subscription_end_date: string;
        subscription_period_days: number;
    };
}

interface BillingResponse {
    success: boolean;
    data: {
        orders: Transaction[];
        billing_summary: {
            total_orders: number;
            successful_orders: number;
            failed_orders: number;
            pending_orders: number;
            cancelled_orders: number;
            total_amount_spent: number;
            average_order_value: number;
        };
        currency: string;
        customer_email: string;
        pagination: {
            total_count: number;
            limit: number;
            offset: number;
            current_page: number;
            total_pages: number;
            has_next: boolean;
            has_previous: boolean;
        };
    };
}

export default function BillingPage() {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchBillingHistory();
    }, []);

    const fetchBillingHistory = async () => {
        const token = localStorage.getItem("accessToken");

        if (!token) {
            setLoading(false);
            return;
        }

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/lms/billing-history`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    limit: 50,
                    offset: 0,
                }),
            });

            if (response.ok) {
                const data: BillingResponse = await response.json();
                // Filter to only show success and failed transactions
                const filteredTransactions = (data.data?.orders || []).filter(
                    (transaction) =>
                        transaction.payment_status === 'success' ||
                        transaction.payment_status === 'failed'
                );
                setTransactions(filteredTransactions);
            } else {
                setError("Failed to load billing history");
            }
        } catch (error) {
            console.error("Error fetching billing history:", error);
            setError("Unable to load billing history");
        } finally {
            setLoading(false);
        }
    };

    const getStatusBadge = (status: string) => {
        const statusConfig: Record<string, { variant: "default" | "secondary" | "destructive" | "outline", icon: React.ReactNode }> = {
            success: {
                variant: "default",
                icon: <CheckCircle2 className="h-3 w-3" />,
            },
            failed: {
                variant: "destructive",
                icon: <XCircle className="h-3 w-3" />,
            },
            pending: {
                variant: "secondary",
                icon: <Clock className="h-3 w-3" />,
            },
            cancelled: {
                variant: "outline",
                icon: <XCircle className="h-3 w-3" />,
            },
            initiated: {
                variant: "outline",
                icon: <AlertCircle className="h-3 w-3" />,
            },
        };

        const config = statusConfig[status.toLowerCase()] || statusConfig.initiated;

        return (
            <Badge variant={config.variant} className="flex items-center gap-1 w-fit">
                {config.icon}
                <span className="capitalize">{status}</span>
            </Badge>
        );
    };

    const TransactionSkeleton = () => (
        <Card>
            <CardHeader>
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2 mt-2" />
            </CardHeader>
            <CardContent>
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3 mt-2" />
            </CardContent>
        </Card>
    );

    return (
        <div className="space-y-8">
            {/* Page Header */}
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Billing History</h1>
                <p className="text-muted-foreground mt-2">
                    View your payment transactions and billing records
                </p>
            </div>

            {/* Billing History Section */}
            <div className="space-y-4">
                {loading ? (
                    <div className="space-y-4">
                        {[1, 2, 3].map((i) => (
                            <TransactionSkeleton key={i} />
                        ))}
                    </div>
                ) : error ? (
                    <Card className="border-destructive">
                        <CardContent className="pt-6">
                            <p className="text-destructive">{error}</p>
                        </CardContent>
                    </Card>
                ) : transactions.length === 0 ? (
                    <Card>
                        <CardContent className="pt-6">
                            <div className="text-center py-8">
                                <Receipt className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                                <p className="text-muted-foreground">
                                    No billing history found. Your transactions will appear here once you make a purchase.
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="space-y-4">
                        {transactions.map((transaction) => (
                            <Card key={transaction.order_id}>
                                <CardHeader>
                                    <div className="flex items-start justify-between">
                                        <div className="space-y-1 flex-1">
                                            <CardTitle className="text-lg">{transaction.product_name}</CardTitle>
                                            <CardDescription className="flex items-center gap-2">
                                                <span className="text-xs text-muted-foreground">
                                                    {transaction.product_category}
                                                </span>
                                                {transaction.coupon_code && (
                                                    <Badge variant="outline" className="text-xs">
                                                        Coupon: {transaction.coupon_code}
                                                    </Badge>
                                                )}
                                            </CardDescription>
                                        </div>
                                        <div className="text-right space-y-2">
                                            <div className="text-2xl font-bold">
                                                ৳{transaction.amount.toFixed(2)}
                                            </div>
                                            {getStatusBadge(transaction.payment_status)}
                                        </div>
                                    </div>
                                </CardHeader>
                                <Separator />
                                <CardContent className="pt-6">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                                        <div className="flex items-center gap-2">
                                            <Calendar className="h-4 w-4 text-muted-foreground" />
                                            <div>
                                                <p className="text-xs text-muted-foreground">Purchase Date</p>
                                                <p className="font-medium">
                                                    {new Date(transaction.purchase_date).toLocaleDateString("en-US", {
                                                        year: "numeric",
                                                        month: "long",
                                                        day: "numeric",
                                                    })}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Receipt className="h-4 w-4 text-muted-foreground" />
                                            <div>
                                                <p className="text-xs text-muted-foreground">Transaction ID</p>
                                                <p className="font-medium font-mono text-xs">{transaction.transaction_id}</p>
                                            </div>
                                        </div>
                                        {transaction.subscription_details && (
                                            <div className="flex items-center gap-2">
                                                <CreditCard className="h-4 w-4 text-muted-foreground" />
                                                <div>
                                                    <p className="text-xs text-muted-foreground">Subscription</p>
                                                    <p className="font-medium">
                                                        {transaction.subscription_details.status}
                                                        {transaction.subscription_details.is_active &&
                                                            ` (${transaction.subscription_details.remaining_days} days left)`
                                                        }
                                                    </p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                    {transaction.coupon_discount && transaction.coupon_discount > 0 && (
                                        <div className="mt-4 p-3 bg-muted rounded-lg">
                                            <p className="text-sm text-muted-foreground">
                                                Discount Applied: <span className="font-semibold text-green-600">৳{transaction.coupon_discount.toFixed(2)}</span>
                                            </p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
