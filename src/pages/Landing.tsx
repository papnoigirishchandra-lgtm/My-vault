import {
  ArrowRight,
  CheckCircle2,
  FileText,
  FolderKanban,
  Link as LinkIcon,
  LockKeyhole,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
} from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";

const features = [
  {
    icon: Search,
    title: "Unified Search",
    description: "Access your documentation through a high-speed, indexed search engine.",
  },
  {
    icon: FolderKanban,
    title: "Directory Structure",
    description: "Organize assets within a logical hierarchy of folders and collections.",
  },
  {
    icon: ShieldCheck,
    title: "Data Sovereignty",
    description: "A private, secure workspace built for individual performance and clarity.",
  },
];

const metrics = [
  { value: "4", label: "Format Types" },
  { value: "1", label: "Unified Hub" },
  { value: "0", label: "Latency" },
];

function ProductPreview() {
  return (
    <div className="pointer-events-none absolute inset-x-4 bottom-[-5rem] mx-auto max-w-5xl rounded-lg border border-slate-200 bg-white shadow-2xl sm:bottom-[-7rem] lg:inset-x-auto lg:right-12 lg:top-32 lg:bottom-auto lg:w-[50rem]">
      <div className="flex h-8 items-center gap-1.5 border-b border-slate-100 bg-slate-50/50 px-3">
        <span className="h-2 w-2 rounded-full bg-slate-200" />
        <span className="h-2 w-2 rounded-full bg-slate-200" />
        <span className="h-2 w-2 rounded-full bg-slate-200" />
      </div>

      <div className="grid min-h-[24rem] grid-cols-[3.5rem_1fr] sm:grid-cols-[10rem_1fr]">
        <aside className="border-r border-slate-100 bg-slate-50/20 p-3">
          <div className="mb-6 flex items-center gap-2">
            <div className="h-6 w-6 rounded bg-[#334155]" />
            <div className="h-3 w-12 rounded bg-slate-200" />
          </div>
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="mb-1 h-7 rounded bg-slate-100/50" />
          ))}
        </aside>

        <main className="p-5">
          <div className="mb-4 h-6 w-32 rounded bg-slate-100" />
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="rounded border border-slate-100 bg-white p-3 shadow-sm">
                <div className="mb-2 h-6 w-6 rounded bg-slate-50 border border-slate-100" />
                <div className="h-3 w-10 rounded bg-[#1e293b]" />
              </div>
            ))}
          </div>
          <div className="mt-4 rounded border border-slate-100 bg-slate-50/30 p-4">
            <div className="space-y-2">
              <div className="h-2 w-full rounded bg-slate-100" />
              <div className="h-2 w-3/4 rounded bg-slate-100" />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default function Landing() {
  return (
    <div className="min-h-screen bg-white text-slate-600 font-sans selection:bg-indigo-600 selection:text-white">
      <header className="fixed inset-x-0 top-0 z-50 border-b border-slate-100 bg-white/90 backdrop-blur-sm">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-8 sm:px-12">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg gradient-button font-bold text-white shadow-md">
              V
            </div>
            <span className="text-base font-bold tracking-tight text-indigo-900">Vault</span>
          </Link>
          <nav className="hidden items-center gap-10 text-[13px] font-bold text-slate-500 md:flex">
            <a href="#features" className="hover:text-indigo-600 transition-colors">Features</a>
            <a href="#workflow" className="hover:text-indigo-600 transition-colors">Workflow</a>
            <a href="#security" className="hover:text-indigo-600 transition-colors">Security</a>
          </nav>
          <div className="flex items-center gap-4">
            <Button asChild className="h-9 rounded-lg gradient-button px-5 text-xs font-bold transition-all active:scale-95 shadow-md">
              <Link href="/dashboard">Access Dashboard</Link>
            </Button>
          </div>
        </div>
      </header>

      <main>
        <section className="relative min-h-[650px] overflow-hidden pt-32 sm:min-h-[750px] lg:min-h-[700px] bg-[#f8fafc]">
          <div className="absolute inset-0 bg-grid-slate-200 [mask-image:linear-gradient(0deg,#fff,rgba(255,255,255,0.6))]" />
          <div className="absolute inset-x-0 top-0 h-[500px] bg-gradient-to-b from-indigo-50/50 to-transparent" />
          
          <div className="relative z-10 mx-auto max-w-7xl px-8 sm:px-12">
            <div className="max-w-3xl pt-10 sm:pt-16">
              <h1 className="text-5xl font-black leading-[1.1] tracking-tight sm:text-7xl">
                <span className="gradient-text">The structured hub</span> <br />
                for your digital assets.
              </h1>
              <p className="mt-8 max-w-xl text-lg leading-relaxed text-slate-500 font-medium">
                A clean, performance-driven workspace designed to organize your files, links, and notes with premium visual clarity.
              </p>
              <div className="mt-10 flex flex-col gap-4 sm:flex-row">
                <Button asChild className="h-12 rounded-xl gradient-button px-10 text-sm font-bold transition-all active:scale-95 shadow-xl shadow-indigo-500/20">
                  <Link href="/dashboard">
                    Get Started Free
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button variant="outline" className="h-12 rounded-xl border-slate-200 bg-white px-10 text-sm font-bold text-slate-600 hover:bg-slate-50 transition-all">
                  View Demo
                </Button>
              </div>
            </div>
          </div>
          <ProductPreview />
        </section>

        <section id="features" className="py-32 bg-white relative">
          <div className="mx-auto max-w-7xl px-8 sm:px-12">
            <div className="grid gap-16 md:grid-cols-3">
              {features.map((feature) => (
                <article key={feature.title} className="group">
                  <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100 transition-all group-hover:bg-indigo-600 group-hover:text-white group-hover:shadow-lg group-hover:shadow-indigo-500/20">
                    <feature.icon className="h-6 w-6" />
                  </div>
                  <h3 className="mb-3 text-lg font-bold text-indigo-950">{feature.title}</h3>
                  <p className="text-sm font-medium leading-relaxed text-slate-500">{feature.description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="workflow" className="py-32 bg-slate-50/50 border-y border-slate-100 overflow-hidden relative">
          <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-[600px] h-[600px] bg-indigo-100/30 blur-[120px] rounded-full" />
          <div className="mx-auto flex flex-col items-center text-center max-w-3xl px-8 sm:px-12 relative z-10">
            <h2 className="text-3xl font-black tracking-tight text-indigo-950 sm:text-4xl">Efficiency through simplicity.</h2>
            <p className="mt-6 text-lg text-slate-500 leading-relaxed font-medium">
              We've eliminated the unnecessary to give you a focused environment. Manage your personal vault with a structured hierarchy and instant retrieval.
            </p>
          </div>
        </section>

        <section id="security" className="py-32 bg-white relative overflow-hidden">
          <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-purple-100/20 blur-[120px] rounded-full" />
          <div className="mx-auto flex max-w-4xl flex-col items-center text-center gap-10 px-8 sm:px-12 relative z-10">
            <h2 className="text-4xl font-black tracking-tight text-indigo-950">Start organizing today.</h2>
            <Button asChild className="h-12 rounded-xl gradient-button px-12 text-sm font-bold transition-all active:scale-95 shadow-xl shadow-indigo-500/20">
              <Link href="/dashboard">
                Launch Workspace
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </section>
      </main>
      
      <footer className="border-t border-slate-100 py-16 bg-white">
        <div className="mx-auto max-w-7xl px-8 sm:px-12 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg gradient-button" />
            <span className="font-bold text-indigo-950 text-lg tracking-tight">Vault</span>
          </div>
          <p className="text-slate-400 text-xs font-bold uppercase tracking-[0.2em]">© 2026 Vault Dashboard</p>
          <div className="flex gap-10 text-xs font-bold text-slate-500 uppercase tracking-widest">
            <a href="#" className="hover:text-indigo-600 transition-colors">Privacy</a>
            <a href="#" className="hover:text-indigo-600 transition-colors">Terms</a>
            <a href="#" className="hover:text-indigo-600 transition-colors">Twitter</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
