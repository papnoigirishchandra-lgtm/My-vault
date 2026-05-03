import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { 
  User, 
  Lock, 
  Shield, 
  Database, 
  Palette, 
  Bell, 
  ChevronRight,
  Loader2,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function Settings() {
  const { user, isAdmin } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [newPassword, setNewPassword] = useState("");

  const handleUpdatePassword = async () => {
    if (!newPassword) return;
    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      toast({ title: "Password updated", description: "Your account is now more secure." });
      setNewPassword("");
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleExportData = () => {
    const data = localStorage.getItem("vault-dashboard-data");
    if (!data) {
      toast({ title: "No data found", description: "There is nothing to export yet." });
      return;
    }
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `vault-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast({ title: "Backup successful", description: "Your vault metadata has been exported." });
  };

  const handleClearData = () => {
    if (confirm("Are you sure? This will delete all your local notes, links, and file references. The actual files in Supabase will NOT be deleted.")) {
      localStorage.removeItem("vault-dashboard-data");
      window.location.reload();
    }
  };

  const sections = [
    {
      id: "account",
      title: "Account Profile",
      icon: User,
      description: "Manage your personal information and identity.",
      content: (
        <div className="space-y-6">
          <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100">
            <div className="h-16 w-16 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-xl font-black text-white shadow-lg shadow-indigo-200">
              {user?.email?.[0]?.toUpperCase() || "G"}
            </div>
            <div>
              <p className="text-sm font-black text-slate-900">{user?.email || "Guest Account"}</p>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                {isAdmin ? "Vault Administrator" : "Public Viewer"}
              </p>
            </div>
          </div>
        </div>
      )
    },
    {
      id: "security",
      title: "Security & Privacy",
      icon: Shield,
      description: "Protect your vault with advanced security settings.",
      content: (
        <div className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Change Password</label>
              <div className="flex gap-2">
                <Input 
                  type="password" 
                  placeholder="Enter new secure password" 
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="rounded-xl border-slate-200 bg-slate-50/50"
                />
                <Button 
                  onClick={handleUpdatePassword} 
                  disabled={loading || !newPassword}
                  className="rounded-xl gradient-button font-bold text-xs px-6"
                >
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Update"}
                </Button>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-2xl border border-indigo-100 bg-indigo-50/30 flex items-start gap-3">
            <CheckCircle2 className="h-5 w-5 text-indigo-500 mt-0.5" />
            <div>
              <p className="text-sm font-bold text-indigo-900">System Integrity</p>
              <p className="text-xs text-indigo-600/70 mt-1">Your vault is protected by Supabase Row-Level Security. Only verified administrators can perform write operations.</p>
            </div>
          </div>
        </div>
      )
    },
    {
      id: "vault",
      title: "Data Management",
      icon: Database,
      description: "Backup and manage your dashboard metadata.",
      content: (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button 
              onClick={handleExportData}
              className="flex items-center gap-4 p-5 rounded-2xl border border-slate-100 bg-white hover:border-indigo-200 hover:bg-indigo-50/30 transition-all text-left group"
            >
              <div className="h-10 w-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-white group-hover:text-indigo-600 shadow-sm transition-all">
                <Bell className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900">Export Metadata</p>
                <p className="text-[10px] font-medium text-slate-400 uppercase tracking-tighter">Download as JSON</p>
              </div>
            </button>

            <button 
              onClick={() => window.open('https://supabase.com/dashboard', '_blank')}
              className="flex items-center gap-4 p-5 rounded-2xl border border-slate-100 bg-white hover:border-indigo-200 hover:bg-indigo-50/30 transition-all text-left group"
            >
              <div className="h-10 w-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-white group-hover:text-indigo-600 shadow-sm transition-all">
                <Database className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900">Cloud Storage</p>
                <p className="text-[10px] font-medium text-slate-400 uppercase tracking-tighter">Go to Supabase</p>
              </div>
            </button>
          </div>

          <div className="p-6 rounded-[24px] bg-red-50 border border-red-100">
            <div className="flex items-center gap-3 text-red-600 mb-4">
              <AlertCircle className="h-5 w-5" />
              <h3 className="font-black text-sm uppercase tracking-widest">Danger Zone</h3>
            </div>
            <p className="text-xs text-red-600/70 mb-6 font-medium leading-relaxed">
              Clearing local data will reset your dashboard and remove all locally stored items. This action cannot be undone. 
              Files stored in the cloud will remain safe.
            </p>
            <Button 
              onClick={handleClearData}
              variant="destructive"
              className="w-full rounded-xl font-bold h-12 shadow-lg shadow-red-200 hover:shadow-red-300"
            >
              Reset All Local Data
            </Button>
          </div>
        </div>
      )
    }
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-12 pb-20">
      <header>
        <h1 className="text-4xl font-black text-slate-900 tracking-tight">Settings</h1>
        <p className="text-slate-500 font-medium mt-2">Manage your private vault configuration and account.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
        {/* Navigation Sidebar */}
        <div className="space-y-1">
          <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4 ml-4">Preferences</div>
          {sections.map((section) => (
            <button
              key={section.id}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-left transition-all hover:bg-slate-50 group"
            >
              <div className="h-10 w-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-slate-400 group-hover:text-indigo-600 group-hover:border-indigo-100 transition-all shadow-sm">
                <section.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-700 group-hover:text-slate-900 transition-colors">{section.title}</p>
                <p className="text-[10px] text-slate-400 font-medium truncate w-40">{section.description}</p>
              </div>
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="md:col-span-2 space-y-8">
          {sections.map((section) => (
            <motion.section 
              key={section.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white border border-slate-200 rounded-[32px] p-8 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-center gap-3 mb-8">
                <div className="h-8 w-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <section.icon className="h-4 w-4" />
                </div>
                <h2 className="text-xl font-black text-slate-900">{section.title}</h2>
              </div>
              
              {section.content}
            </motion.section>
          ))}
        </div>
      </div>
    </div>
  );
}
