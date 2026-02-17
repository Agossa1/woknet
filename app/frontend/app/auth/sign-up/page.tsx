"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/src/features/auth/hooks/useAuth";
import { z } from "zod";

// Validation schemas
const emailSchema = z.object({
  full_name: z.string().min(3, "Le nom complet doit contenir au moins 3 caractères"),
  email: z.string().email("L'email doit être valide"),
  password: z.string().min(6, "Le mot de passe doit contenir au moins 6 caractères"),
  acceptTerms: z.boolean().refine((value) => value, "Vous devez accepter les conditions d'utilisation")
});

const phoneSchema = z.object({
  full_name: z.string().min(3, "Le nom complet doit contenir au moins 3 caractères"),
  phone_number: z.string().min(10, "Le numéro de téléphone doit contenir au moins 10 chiffres"),
  password: z.string().min(6, "Le mot de passe doit contenir au moins 6 caractères"),
  acceptTerms: z.boolean().refine((value) => value, "Vous devez accepter les conditions d'utilisation")
});

export default function SignUpPage() {
  const router = useRouter();
  const { register, isLoading, error, successMessage, clearAuthMessages } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [authMethod, setAuthMethod] = useState<'email' | 'phone'>('email');
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    phone_number: "",
    password: "",
    acceptTerms: false
  });
  const [localError, setLocalError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearAuthMessages();
    setLocalError(null);

    // Validation based on auth method
    const schema = authMethod === 'email' ? emailSchema : phoneSchema;
    const dataToValidate = authMethod === 'email'
      ? { full_name: formData.full_name, email: formData.email, password: formData.password, acceptTerms: formData.acceptTerms }
      : { full_name: formData.full_name, phone_number: formData.phone_number, password: formData.password, acceptTerms: formData.acceptTerms };

    const result = schema.safeParse(dataToValidate);
    if (!result.success) {
      setLocalError(result.error.issues[0].message);
      return;
    }

    try {
      const payload: any = {
        full_name: formData.full_name,
        password: formData.password
      };

      if (authMethod === 'email') {
        payload.email = formData.email;
      } else {
        payload.phone_number = formData.phone_number;
      }

      await register(payload);

      // Redirect to verify account page
      const identifier = authMethod === 'email' ? formData.email : formData.phone_number;
      router.push(`/auth/verify-account?identifier=${encodeURIComponent(identifier)}`);
    } catch (err: any) {
      setLocalError(err.message || "Une erreur s'est produite lors de l'inscription");
    }
  };


  return (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-900 px-4 py-12">
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-lg mb-4">
            <span className="text-white font-bold text-2xl">W</span>
          </div>
          <h1 className="text-3xl font-normal text-gray-900 dark:text-white mb-2">
            Tirez le meilleur parti de votre vie professionnelle
          </h1>
        </div>

        {/* Form */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <form onSubmit={handleSubmit} method="POST" className="space-y-4">

            {/* Error Message */}
            {(error || localError) && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded p-3">
                <p className="text-sm text-red-800 dark:text-red-300">
                  {localError || error}
                </p>
              </div>
            )}

            {/* Success Message */}
            {successMessage && (
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded p-3">
                <p className="text-sm text-green-800 dark:text-green-300">
                  {successMessage}
                </p>
              </div>
            )}

            {/* Full Name Field */}
            <div>
              <label htmlFor="full_name" className="block text-sm font-normal text-gray-700 dark:text-gray-300 mb-1">
                Nom complet
              </label>
              <input
                id="full_name"
                name="full_name"
                type="text"
                required
                className="w-full px-3 py-2 border border-gray-400 dark:border-gray-600 rounded text-gray-900 dark:text-white text-base bg-white dark:bg-gray-900 focus:outline-none focus:border-gray-900 dark:focus:border-gray-400"
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
              />
            </div>
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-normal text-gray-700 dark:text-gray-300 mb-1">
                E-mail
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="w-full px-3 py-2 border border-gray-400 dark:border-gray-600 rounded text-gray-900 dark:text-white text-base bg-white dark:bg-gray-900 focus:outline-none focus:border-gray-900 dark:focus:border-gray-400"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-normal text-gray-700 dark:text-gray-300 mb-1">
                Mot de passe (6 caractères ou plus)
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  minLength={6}
                  className="w-full px-3 py-2 pr-20 border border-gray-400 dark:border-gray-600 rounded text-gray-900 dark:text-white text-base bg-white dark:bg-gray-900 focus:outline-none focus:border-gray-900 dark:focus:border-gray-400"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400"
                >
                  {showPassword ? "Masquer" : "Afficher"}
                </button>
              </div>
            </div>

            {/* Terms and Conditions */}
            <div className="pt-2 space-y-3">
              <label className="flex items-start gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  required
                  className="mt-1 w-4 h-4 text-blue-600 border-gray-400 rounded focus:ring-blue-500"
                  checked={formData.acceptTerms}
                  onChange={(e) => setFormData({ ...formData, acceptTerms: e.target.checked })}
                />
                <span className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                  J'accepte les{' '}
                  <Link href="/terms" className="text-blue-600 hover:underline dark:text-blue-400 font-semibold">
                    Conditions d'utilisation
                  </Link>
                  , la{' '}
                  <Link href="/privacy" className="text-blue-600 hover:underline dark:text-blue-400 font-semibold">
                    Politique de confidentialité
                  </Link>
                  {' '}et la{' '}
                  <Link href="/cookies" className="text-blue-600 hover:underline dark:text-blue-400 font-semibold">
                    Politique relative aux cookies
                  </Link>
                  {' '}de WorkNet.
                </span>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-full text-base transition-colors"
            >
              {isLoading ? "Inscription en cours..." : "Accepter et s'inscrire"}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white dark:bg-gray-800 text-gray-500">ou</span>
            </div>
          </div>

          {/* Google Sign Up */}
          <button
            type="button"
            className="w-full flex items-center justify-center gap-3 border border-gray-400 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-semibold py-2.5 px-4 rounded-full text-base transition-colors"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z" fill="#4285F4" />
              <path d="M9.003 18c2.43 0 4.467-.806 5.956-2.18L12.05 13.56c-.806.54-1.836.86-3.047.86-2.344 0-4.328-1.584-5.036-3.711H.96v2.332C2.44 15.983 5.485 18 9.003 18z" fill="#34A853" />
              <path d="M3.964 10.712c-.18-.54-.282-1.117-.282-1.71 0-.593.102-1.17.282-1.71V4.96H.957C.347 6.175 0 7.55 0 9.002c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05" />
              <path d="M9.003 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.464.891 11.426 0 9.003 0 5.485 0 2.44 2.017.96 4.958L3.967 7.29c.708-2.127 2.692-3.71 5.036-3.71z" fill="#EA4335" />
            </svg>
            Continuer avec Google
          </button>

          {/* Sign In Link */}
          <div className="text-center mt-6">
            <p className="text-sm text-gray-700 dark:text-gray-300">
              Déjà inscrit(e) ?{' '}
              <Link href="/auth/sign-in" className="font-semibold text-blue-600 hover:underline dark:text-blue-400">
                S'identifier
              </Link>
            </p>
          </div>
        </div>

        {/* Business Account Link */}
        <div className="text-center mt-6">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Vous cherchez à créer une page pour une entreprise ?{' '}
            <Link href="/help" className="font-semibold text-blue-600 hover:underline dark:text-blue-400">
              Obtenir de l'aide
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}