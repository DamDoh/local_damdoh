
"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { SignUpForm } from "./SignUpForm";
import Link from 'next/link';
import { Logo } from "../Logo";
import { useTranslations } from "next-intl";

interface SignUpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SignUpModal({ isOpen, onClose }: SignUpModalProps) {
  const t = useTranslations('Auth');

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center">
          <Logo iconSize={32} textSize="text-3xl" className="text-primary justify-center mb-4" />
          <DialogTitle className="text-2xl">{t('signUpTitle')}</DialogTitle>
          <DialogDescription>
            {t('alreadyHaveAccountPrompt')}{" "}
            <Link href="/auth/signin" className="font-medium text-primary hover:underline" onClick={onClose}>
              {t('signInLink')}
            </Link>
          </DialogDescription>
        </DialogHeader>
        <div className="p-6 pt-0">
          <SignUpForm onSuccess={onClose} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
