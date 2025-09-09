
"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogOut, Settings, User } from "lucide-react";
import { Link } from '@/navigation';
import { logOut } from "@/lib/auth-utils"; 
import { useToast } from "@/hooks/use-toast"; 
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

interface UserAvatarProps {
  name?: string | null;
  email?: string | null;
  imageUrl?: string | null;
}

export function UserAvatar({ name, email, imageUrl }: UserAvatarProps) {
  const t = useTranslations('AppHeader');
  const { toast } = useToast();
  const router = useRouter();

  const getInitials = (name?: string | null) => {
    if (!name) return "??";
    const names = name.split(" ");
    if (names.length === 1) return names[0].substring(0, 2).toUpperCase();
    return (names[0][0] + names[names.length - 1][0]).toUpperCase();
  };

  const handleLogout = async () => {
    try {
      await logOut();
      toast({
        title: t('toast.logOut.title'),
        description: t('toast.logOut.description'),
      });
      // Redirect to home page after logout to refresh state
      router.push('/');
      router.refresh();
    } catch (error) {
      toast({
        variant: "destructive",
        title: t('toast.logOut.failTitle'),
        description: t('toast.logOut.failDescription'),
      });
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center rounded-full p-1 hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
          <Avatar className="h-9 w-9">
            {imageUrl && <AvatarImage src={imageUrl} alt={name ?? "User"} data-ai-hint="profile person" />}
            <AvatarFallback>{getInitials(name)}</AvatarFallback>
          </Avatar>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        {name && email && (
          <>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{name}</p>
                <p className="text-xs leading-none text-muted-foreground">
                  {email}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
          </>
        )}
        <DropdownMenuItem asChild>
          <Link href="/profiles/me" className="flex items-center gap-2 cursor-pointer">
            <User className="h-4 w-4" />
            <span>{t('myProfile')}</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/settings" className="flex items-center gap-2 cursor-pointer">
            <Settings className="h-4 w-4" />
            <span>{t('settings')}</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout} className="cursor-pointer"> 
          <LogOut className="h-4 w-4 mr-2" />
          <span>{t('logOut')}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
