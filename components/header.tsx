"use client";

import { usePathname } from 'next/navigation';
import { Navbar } from './navbar';
import { User } from '@supabase/supabase-js';

export function Header({ user }: { user: User | null }) {
  const pathname = usePathname();
  const noNavRoutes = ['/login', '/signup'];

  // If the current route is a login or signup page, render nothing.
  if (noNavRoutes.includes(pathname)) {
    return null;
  }

  // Otherwise, render the Navbar and pass the user prop to it.
  return <Navbar user={user} />;
}
