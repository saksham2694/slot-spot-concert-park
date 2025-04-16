
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

interface UserProfile {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  is_admin: boolean;
}

const UserManagement = () => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();

  // Fetch users and their admin status
  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      // Get all users from profiles table
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*');
      
      if (profilesError) {
        throw profilesError;
      }

      // Get all admin roles
      const { data: adminRoles, error: rolesError } = await supabase
        .from('user_roles')
        .select('*')
        .eq('role', 'admin');
      
      if (rolesError) {
        throw rolesError;
      }

      // Create a set of admin user IDs for faster lookup
      const adminUserIds = new Set((adminRoles || []).map(role => role.user_id));
      
      // Get user emails from auth.users via admin API
      const usersWithAuth = await Promise.all(
        (profiles || []).map(async (profile) => {
          const { data: userData } = await supabase.auth.admin.getUserById(profile.id);
          
          return {
            id: profile.id,
            email: userData?.user?.email || 'Unknown email',
            first_name: profile.first_name,
            last_name: profile.last_name,
            is_admin: adminUserIds.has(profile.id)
          };
        })
      );
      
      console.log("Fetched users:", usersWithAuth);
      setUsers(usersWithAuth);
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
    fetchUsers();
  }, []);

  // Toggle admin role for a user
  const toggleAdminRole = async (userId: string, isCurrentlyAdmin: boolean) => {
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

  // Filter users based on search query
  const filteredUsers = users.filter(user => {
    const fullName = `${user.first_name || ''} ${user.last_name || ''}`.toLowerCase();
    const email = user.email.toLowerCase();
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
                  <TableCell>{user.email}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      {user.is_admin && <UserCheck className="h-4 w-4 text-green-500" />}
                      <Switch 
                        checked={user.is_admin}
                        onCheckedChange={(checked) => toggleAdminRole(user.id, user.is_admin)}
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      )}
    </div>
  );
};

export default UserManagement;
