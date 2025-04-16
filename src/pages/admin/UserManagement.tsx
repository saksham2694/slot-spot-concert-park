
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Search, User, UserCheck } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/context/AuthContext";

interface UserProfile {
  id: string;
  email: string | null;
  first_name: string | null;
  last_name: string | null;
  is_admin: boolean;
}

const UserManagement = () => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();
  const { user: currentUser } = useAuth();

  // Fetch users and their admin status
  const fetchUsers = async () => {
    setIsLoading(true);
    console.log("Starting to fetch users...");
    try {
      // Get user data from auth
      console.log("Fetching auth user data...");
      const { data: { users: authUsers }, error: authError } = await supabase.auth.admin.listUsers();
      
      if (authError) {
        console.error('Error fetching auth users:', authError);
        // Fallback: just fetch profiles
        console.log("Falling back to profiles-only approach");
        const { data: profiles, error: profilesError } = await supabase
          .from('profiles')
          .select('*');
        
        if (profilesError) {
          console.error('Error fetching profiles:', profilesError);
          throw profilesError;
        }
        
        // Get all admin roles
        const { data: adminRoles, error: rolesError } = await supabase
          .from('user_roles')
          .select('*')
          .eq('role', 'admin');
        
        if (rolesError) {
          console.error('Error fetching admin roles:', rolesError);
          throw rolesError;
        }
        
        // Create a set of admin user IDs for faster lookup
        const adminUserIds = new Set((adminRoles || []).map(role => role.user_id));
        
        // Map profiles to user objects
        const mappedUsers = (profiles || []).map(profile => ({
          id: profile.id,
          email: null, // We don't have this data with profiles-only approach
          first_name: profile.first_name,
          last_name: profile.last_name,
          is_admin: adminUserIds.has(profile.id)
        }));
        
        console.log("Final users from profiles-only approach:", mappedUsers);
        setUsers(mappedUsers);
        setIsLoading(false);
        return;
      }
      
      console.log("Auth users fetched:", authUsers?.length || 0, "users");
      
      // Get all profiles
      console.log("Fetching profiles...");
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*');
      
      if (profilesError) {
        console.error('Error fetching profiles:', profilesError);
        throw profilesError;
      }
      
      // Create a map of profiles for faster lookup
      const profileMap = new Map();
      (profiles || []).forEach(profile => {
        profileMap.set(profile.id, profile);
      });
      
      // Get all admin roles
      console.log("Fetching admin roles...");
      const { data: adminRoles, error: rolesError } = await supabase
        .from('user_roles')
        .select('*')
        .eq('role', 'admin');
      
      if (rolesError) {
        console.error('Error fetching admin roles:', rolesError);
        throw rolesError;
      }
      
      // Create a set of admin user IDs for faster lookup
      const adminUserIds = new Set((adminRoles || []).map(role => role.user_id));
      
      // Map users with profiles and admin status
      const processedUsers = authUsers.map(authUser => {
        const profile = profileMap.get(authUser.id);
        
        return {
          id: authUser.id,
          email: authUser.email,
          first_name: profile?.first_name || authUser.user_metadata?.first_name || null,
          last_name: profile?.last_name || authUser.user_metadata?.last_name || null,
          is_admin: adminUserIds.has(authUser.id)
        };
      });
      
      console.log("Final processed users:", processedUsers);
      setUsers(processedUsers);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        title: "Error fetching users",
        description: "There was a problem loading the user list",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    console.log("UserManagement component mounted, fetching users...");
    fetchUsers();
  }, []);

  // Toggle admin role for a user
  const toggleAdminRole = async (userId: string, isCurrentlyAdmin: boolean) => {
    // Prevent toggling your own admin status
    if (userId === currentUser?.id) {
      toast({
        title: "Action not allowed",
        description: "You cannot change your own admin status",
        variant: "destructive"
      });
      return;
    }
    
    try {
      if (isCurrentlyAdmin) {
        // Remove admin role
        const { error } = await supabase
          .from('user_roles')
          .delete()
          .eq('user_id', userId)
          .eq('role', 'admin');
        
        if (error) throw error;
        
        setUsers(users.map(user => 
          user.id === userId ? { ...user, is_admin: false } : user
        ));
        
        toast({
          title: "Admin role removed",
          description: "User no longer has admin privileges"
        });
      } else {
        // Add admin role
        const { error } = await supabase
          .from('user_roles')
          .insert({ user_id: userId, role: 'admin' });
        
        if (error) throw error;
        
        setUsers(users.map(user => 
          user.id === userId ? { ...user, is_admin: true } : user
        ));
        
        toast({
          title: "Admin role assigned",
          description: "User now has admin privileges"
        });
      }
    } catch (error) {
      console.error('Error toggling admin role:', error);
      toast({
        title: "Failed to update role",
        description: "There was a problem updating the user's role",
        variant: "destructive"
      });
    }
  };

  // Create or update profile for users without one
  const createProfileIfNeeded = async (userId: string, userData: any) => {
    try {
      // Check if profile exists
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', userId)
        .single();
      
      if (!existingProfile) {
        // Create new profile if doesn't exist
        await supabase
          .from('profiles')
          .insert({
            id: userId,
            first_name: userData.first_name || userData.user_metadata?.first_name,
            last_name: userData.last_name || userData.user_metadata?.last_name
          });
      }
    } catch (error) {
      console.error('Error creating/updating profile:', error);
    }
  };

  // Filter users based on search query
  const filteredUsers = users.filter(user => {
    const fullName = `${user.first_name || ''} ${user.last_name || ''}`.toLowerCase();
    const email = (user.email || '').toLowerCase();
    const query = searchQuery.toLowerCase();
    
    return fullName.includes(query) || email.includes(query);
  });

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-6">User Management</h2>
      
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
        <Input 
          placeholder="Search users by name or email..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>
      
      {isLoading ? (
        <div className="flex justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : (
        <>
          <p className="mb-4 text-sm text-muted-foreground">
            Found {filteredUsers.length} user{filteredUsers.length !== 1 ? 's' : ''}
            {searchQuery && ` matching "${searchQuery}"`}
          </p>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Email</TableHead>
                <TableHead className="text-right">Admin Role</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-center py-8">
                    {searchQuery ? "No users match your search" : "No users found"}
                  </TableCell>
                </TableRow>
              ) : (
                filteredUsers.map(user => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="bg-muted rounded-full p-1">
                          <User className="h-4 w-4" />
                        </div>
                        <span>
                          {user.first_name || user.last_name 
                            ? `${user.first_name || ''} ${user.last_name || ''}`
                            : 'Unnamed User'}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>{user.email || 'No email available'}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        {user.is_admin && <UserCheck className="h-4 w-4 text-green-500" />}
                        <Switch 
                          checked={user.is_admin}
                          onCheckedChange={(checked) => toggleAdminRole(user.id, user.is_admin)}
                          disabled={user.id === currentUser?.id}
                        />
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </>
      )}
    </div>
  );
};

export default UserManagement;
