import React from 'react';
import { Input } from './ui/Input';
import { Search } from 'lucide-react';
interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
}
export function SearchBar({
  value,
  onChange
}: SearchBarProps) {
  return <div className="w-full max-w-md">
      <Input type="text" placeholder="Search services, systems, or owners..." value={value} onChange={e => onChange(e.target.value)} icon={<Search className="h-4 w-4" />} className="w-full shadow-sm" />
    </div>;
}