import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeftIcon } from "lucide-react";
import Link from "next/link";

export default function UnauthorizedPage() {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-slate-950">
            <Card>
                <CardHeader>
                    <CardTitle
                        className="text-3xl font-bold text-center mt-6"
                    >Unauthorized</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                    <p
                        className="text-muted-foreground text-lg  -mt-2 mb-8"
                    >
                        You do not have permission to view this page.
                    </p>
                    <Button>
                        <Link
                            href="/"
                            className="flex">
                            <ArrowLeftIcon className="w-4 h-4 mr-2" />Go back to home
                        </Link>
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}