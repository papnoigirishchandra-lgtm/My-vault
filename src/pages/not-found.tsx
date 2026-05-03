import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle, ArrowLeft } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#f8fafc] font-sans">
      <Card className="w-full max-w-md mx-4 rounded-xl border-slate-200 bg-white shadow-xl shadow-slate-200/50">
        <CardContent className="p-8">
          <div className="flex flex-col items-center text-center">
            <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-lg bg-slate-50 text-[#1e293b] border border-slate-100">
              <AlertCircle className="h-8 w-8" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-[#1e293b]">Page Not Found</h1>
            <p className="mt-4 text-sm font-medium text-slate-500 leading-relaxed">
              The resource you are looking for might have been moved, deleted, or does not exist.
            </p>
            <Button asChild variant="ghost" className="mt-8 text-xs font-bold text-slate-500 hover:text-[#1e293b] group">
              <Link href="/">
                <ArrowLeft className="mr-2 h-3.5 w-3.5 transition-transform group-hover:-translate-x-1" />
                Return to Safety
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
