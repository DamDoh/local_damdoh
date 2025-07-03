
"use client";

import React from 'react';
import { STAKEHOLDER_ICONS } from '@/lib/constants';
import { Briefcase, type LucideProps } from 'lucide-react';

interface StakeholderIconProps extends LucideProps {
  role: string;
}

/**
 * A reusable component to display the correct icon for a given stakeholder role.
 * Falls back to a generic 'Briefcase' icon if the role is not found.
 */
export const StakeholderIcon: React.FC<StakeholderIconProps> = ({ role, ...props }) => {
  const Icon = STAKEHOLDER_ICONS[role] || Briefcase;
  return <Icon {...props} />;
};
