import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Paju CMS',
  description: 'Content Management System for Paju Restaurant',
};

export default function CMSLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}