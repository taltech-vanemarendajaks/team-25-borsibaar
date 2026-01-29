import { ReactNode } from "react";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import { redirect } from "next/navigation";

export default async function PublicLayout({ children }: { children: ReactNode }) {
  const { user } = await getCurrentUser();
  if (user) {
    if (user.needsOnboarding) redirect("/onboarding");
    redirect("/dashboard");
  }
  return <>{children}</>;
}
