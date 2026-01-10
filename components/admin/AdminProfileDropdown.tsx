'use client';

import { useState, useRef, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Users, LogOut, Settings, ChevronDown } from 'lucide-react';

interface AdminProfileDropdownProps {
  onSettingsClick?: () => void;
}

export default function AdminProfileDropdown({ onSettingsClick }: AdminProfileDropdownProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await signOut({ redirect: false });
    router.push('/');
  };

  const handleSettings = () => {
    onSettingsClick?.();
    setIsOpen(false);
  };

  return (
    <div ref={dropdownRef} className="relative">
      {/* Profile Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 hover:bg-gray-100 rounded-full p-2 transition-colors"
        title="Admin Profile"
      >
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#C47456] to-[#A64535] flex items-center justify-center text-white font-semibold">
          {session?.user?.name?.[0]?.toUpperCase() || <Users className="w-5 h-5" />}
        </div>
        <ChevronDown className="w-4 h-4 text-gray-600" />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl border border-gray-200 z-50 overflow-hidden">
          {/* User Info */}
          <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
            <p className="font-semibold text-sm text-gray-900">
              {session?.user?.name || 'Admin User'}
            </p>
            <p className="text-xs text-gray-500 truncate">
              {session?.user?.email || 'admin@furnivo.com'}
            </p>
          </div>

          {/* Menu Items */}
          <div className="py-1">
            {/* Settings Option */}
            <button
              onClick={handleSettings}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
            >
              <Settings className="w-4 h-4" />
              <span>Settings</span>
            </button>

            {/* Logout Option */}
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors border-t border-gray-100"
            >
              <LogOut className="w-4 h-4" />
              <span>Exit Admin & Logout</span>
            </button>
          </div>

          {/* Footer Info */}
          <div className="px-4 py-2 border-t border-gray-100 bg-gray-50 text-xs text-gray-500">
            Admin Panel v1.0
          </div>
        </div>
      )}
    </div>
  );
}