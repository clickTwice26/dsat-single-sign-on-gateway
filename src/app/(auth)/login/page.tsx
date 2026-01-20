"use client";

import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGoogle, faDiscord } from "@fortawesome/free-brands-svg-icons";

export default function LoginPage() {
    return (
        <div className="flex h-screen w-full items-center justify-center bg-muted/40 p-4">
            <Card className="w-full max-w-md">
                <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl font-bold tracking-tight text-center">
                        Welcome back
                    </CardTitle>
                    <CardDescription className="text-center">
                        Enter your credentials to sign in to your account
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {/* Error Alert */}
                    {(() => {
                        const params = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
                        const error = params?.get("error");
                        if (error) {
                            return (
                                <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-md border border-destructive/20 text-center">
                                    {error === "oauth_error" ? "Google Login failed. Please try again." :
                                        error === "no_user_info" ? "Could not retrieve user info." :
                                            "Authentication failed."}
                                </div>
                            );
                        }
                        return null;
                    })()}

                    <div className="grid grid-cols-2 gap-4">

                        <Button
                            variant="outline"
                            className="w-full gap-2"
                            onClick={() => {
                                const params = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
                                const returnTo = params?.get("return_to");
                                let url = `${process.env.NEXT_PUBLIC_API_URL}/api/v1/login/google`;
                                if (returnTo) {
                                    url += `?return_to=${encodeURIComponent(returnTo)}`;
                                }
                                window.location.href = url;
                            }}
                        >
                            <FontAwesomeIcon icon={faGoogle} className="h-4 w-4" />
                            Google
                        </Button>
                        <Button variant="outline" className="w-full gap-2">
                            <FontAwesomeIcon icon={faDiscord} className="h-4 w-4" />
                            Discord
                        </Button>
                    </div>

                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-card px-2 text-muted-foreground">
                                Or continue with
                            </span>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" type="email" placeholder="m@example.com" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="password">Password</Label>
                        <Input id="password" type="password" />
                    </div>
                    <Button className="w-full font-bold">Sign In</Button>
                </CardContent>
                <CardFooter className="flex flex-col gap-2">
                    <div className="text-center text-sm text-muted-foreground">
                        <Link
                            href="/forgot-password"
                            className="hover:text-primary underline underline-offset-4"
                        >
                            Forgot your password?
                        </Link>
                    </div>
                    <div className="text-center text-sm text-muted-foreground">
                        Don&apos;t have an account?{" "}
                        <Link
                            href="/register"
                            className="hover:text-primary underline underline-offset-4"
                        >
                            Sign up
                        </Link>
                    </div>
                </CardFooter>
            </Card>
        </div>
    );
}
