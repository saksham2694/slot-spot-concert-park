
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { UserPlus, Camera } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const ProfilePage = () => {
  const { user, profile, updateProfile } = useAuth();
  const navigate = useNavigate();

  const [firstName, setFirstName] = useState(profile?.first_name || '');
  const [lastName, setLastName] = useState(profile?.last_name || '');
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url || '');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateProfile({
      first_name: firstName,
      last_name: lastName,
      avatar_url: avatarUrl
    });
  };

  if (!user) {
    navigate('/');
    return null;
  }

  const userInitials = user.email ? user.email.substring(0, 2).toUpperCase() : 'U';

  return (
    <div className="container mx-auto px-4 py-8 max-w-md">
      <h1 className="text-3xl font-bold mb-6">My Profile</h1>
      
      <div className="flex flex-col items-center mb-6">
        <div className="relative mb-4">
          <Avatar className="h-24 w-24">
            {avatarUrl ? (
              <AvatarImage src={avatarUrl} alt="Profile avatar" />
            ) : (
              <AvatarFallback className="text-2xl">{userInitials}</AvatarFallback>
            )}
          </Avatar>
          <Button 
            variant="outline" 
            size="icon" 
            className="absolute bottom-0 right-0 rounded-full"
            onClick={() => {/* TODO: Implement avatar upload */}}
          >
            <Camera className="h-4 w-4" />
          </Button>
        </div>
        <p className="text-xl font-semibold">{user.email}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="firstName">First Name</Label>
          <Input 
            id="firstName"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            placeholder="Enter your first name"
          />
        </div>
        
        <div>
          <Label htmlFor="lastName">Last Name</Label>
          <Input 
            id="lastName"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            placeholder="Enter your last name"
          />
        </div>

        <Button type="submit" className="w-full">
          <UserPlus className="mr-2 h-4 w-4" />
          Update Profile
        </Button>
      </form>
    </div>
  );
};

export default ProfilePage;
