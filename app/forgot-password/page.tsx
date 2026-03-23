"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Mail, Loader2, CheckCircle2 } from "lucide-react";
import { screenToPath, type Screen } from "@/types/navigation";
import { resetPassword } from "@/lib/auth";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const navigate = (screen: Screen) => router.push(screenToPath(screen));

  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorText, setErrorText] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setErrorText("Silakan masukkan email Anda.");
      return;
    }

    setIsLoading(true);
    setErrorText("");

    try {
      await resetPassword(email);
      setIsSuccess(true);
    } catch (error: any) {
      console.error("Reset password error:", error);
      if (error.code === "auth/invalid-email") {
        setErrorText("Format email tidak valid.");
      } else if (error.code === "auth/user-not-found") {
        setErrorText("Akun dengan email ini tidak ditemukan.");
      } else {
        setErrorText("Gagal mengirim email reset password. Silakan coba lagi.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md w-full p-6 sm:p-8 bg-card rounded-2xl shadow-sm border border-border">
        <button
          onClick={() => navigate("login")}
          className="flex items-center text-sm font-medium text-muted-foreground hover:text-foreground mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Kembali ke Login
        </button>

        <h1 className="text-2xl font-bold text-foreground mb-2">
          Lupa Password?
        </h1>
        <p className="text-sm text-muted-foreground mb-6">
          Masukkan email yang terdaftar. Kami akan mengirimkan tautan untuk
          mengatur ulang password Anda.
        </p>

        {isSuccess ? (
          <div className="bg-green-50 text-green-700 border border-green-200 rounded-xl p-4 flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5" />
            <div>
              <p className="font-semibold text-sm">Email Terkirim</p>
              <p className="text-sm mt-1">
                Silakan periksa kotak masuk (atau folder spam) untuk {email} dan
                ikuti instruksi untuk mereset password Anda.
              </p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="nama@email.com"
                  className="pl-10"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  required
                />
              </div>
              {errorText && (
                <p className="text-sm text-red-500 font-medium">{errorText}</p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full rounded-xl"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Mengirim...
                </>
              ) : (
                "Kirim Link Reset"
              )}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
