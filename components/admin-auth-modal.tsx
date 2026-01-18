'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Lock } from 'lucide-react';
import { toast } from 'sonner';

interface AdminAuthModalProps {
  onAuthenticated: () => void;
}

const ADMIN_AUTH_KEY = 'admin_authenticated';
const ADMIN_AUTH_EXPIRY = 3 * 24 * 60 * 60 * 1000; // 3 days in milliseconds

export default function AdminAuthModal({ onAuthenticated }: AdminAuthModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    checkAuthentication();
  }, []);

  const checkAuthentication = () => {
    const authData = localStorage.getItem(ADMIN_AUTH_KEY);
    
    if (authData) {
      try {
        const { timestamp } = JSON.parse(authData);
        const now = Date.now();
        
        // Check if 3 days have passed
        if (now - timestamp < ADMIN_AUTH_EXPIRY) {
          onAuthenticated();
          return;
        } else {
          // Auth expired, remove it
          localStorage.removeItem(ADMIN_AUTH_KEY);
        }
      } catch (error) {
        localStorage.removeItem(ADMIN_AUTH_KEY);
      }
    }
    
    // Show modal if not authenticated or expired
    setIsOpen(true);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      if (response.ok) {
        // Store authentication with timestamp
        localStorage.setItem(
          ADMIN_AUTH_KEY,
          JSON.stringify({ timestamp: Date.now() })
        );
        
        toast.success('Authentication successful');
        setIsOpen(false);
        onAuthenticated();
      } else {
        const error = await response.json();
        toast.error(error.message || 'Invalid credentials');
      }
    } catch (error) {
      toast.error('Authentication failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-md" onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <div className="flex items-center justify-center w-12 h-12 rounded-full bg-[#C47456]/10 mx-auto mb-4">
            <Lock className="w-6 h-6 text-[#C47456]" />
          </div>
          <DialogTitle className="text-center text-2xl">Admin Access Required</DialogTitle>
          <DialogDescription className="text-center">
            Please enter your admin credentials to continue
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleLogin} className="space-y-4 mt-4">
          <div>
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter admin username"
              required
              className="mt-1"
            />
          </div>
          
          <div>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter admin password"
              required
              className="mt-1"
            />
          </div>
          
          <Button 
            type="submit" 
            className="w-full bg-[#2C2C2C] hover:bg-[#C47456]"
            disabled={isLoading}
          >
            {isLoading ? 'Authenticating...' : 'Access Admin Panel'}
          </Button>
        </form>
        
        <p className="text-xs text-gray-500 text-center mt-4">
          Your session will remain active for 3 days
        </p>
      </DialogContent>
    </Dialog>
  );
}