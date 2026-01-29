import { ReactNode } from "react";

// Protected layout wraps pages that require auth.
// Authentication and onboarding flow are handled by middleware.
export default function ProtectedLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
