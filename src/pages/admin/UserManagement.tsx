
import { useState, useEffect } from "react";
import { supabase, syncUsersToProfiles } from "@/integrations/supabase/client";
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
import { Search, User, UserCheck, Store, RefreshCw } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/context/AuthContext";

interface UserData {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  is_admin: boolean;
  is_vendor: boolean;
}

const UserManagement = () => {
  const [users, setUsers] = useState<UserData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();
  const { user: currentUser } = useAuth();

  // Fetch users and their roles
  const fetchUsers = async () => {
    setIsLoading(true);
    console.log("Starting to fetch users...");
    try {
      // Now we can fetch directly from the users table which has all the data we need
      const { data: users, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching users:', error);
        throw error;
      }
      
      console.log("Users fetched:", users?.length || 0, "users", users);
      
      if (!users) {
        console.log("No users found. Check if users are being created when users sign up.");
        setUsers([]);
        setIsLoading(false);
        return;
      }
      
      setUsers(users);
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

  // Sync users from auth.users to our custom tables
  const handleSyncUsers = async () => {
    setIsSyncing(true);
    try {
      console.log("Syncing users...");
      await syncUsersToProfiles();
      
      toast({
        title: "Users synced successfully",
        description: "User data has been synchronized from auth users",
      });
      
      // Refresh the user list
      await fetchUsers();
    } catch (error) {
      console.error("Error syncing users:", error);
      toast({
        title: "Error syncing users",
        description: "There was a problem syncing users",
        variant: "destructive"
      });
    } finally {
      setIsSyncing(false);
    }
  };

  // Toggle user role
  const toggleUserRole = async (userId: string, role: 'admin' | 'vendor', isCurrentlyActive: boolean) => {
    // Prevent toggling your own role
    if (userId === currentUser?.id) {
      toast({
        title: "Action not allowed",
        description: "You cannot change your own role",
        variant: "destructive"
      });
      return;
    }
    
    try {
      if (isCurrentlyActive) {
        // Remove role
        const { error } = await supabase
          .from('user_roles')
          .delete()
          .eq('user_id', userId)
          .eq('role', role);
        
        if (error) throw error;
        
        // Update local state
        setUsers(users.map(user => 
          user.id === userId ? { ...user, [role === 'admin' ? 'is_admin' : 'is_vendor']: false } : user
        ));
        
        toast({
          title: `${role.charAt(0).toUpperCase() + role.slice(1)} role removed`,
          description: `User no longer has ${role} privileges`
        });
      } else {
        // Add role
        const { error } = await supabase
          .from('user_roles')
          .insert({ user_id: userId, role });
        
        if (error) throw error;
        
        // Update local state
        setUsers(users.map(user => 
          user.id === userId ? { ...user, [role === 'admin' ? 'is_admin' : 'is_vendor']: true } : user
        ));
        
        toast({
          title: `${role.charAt(0).toUpperCase() + role.slice(1)} role assigned`,
          description: `User now has ${role} privileges`
        });
      }
    } catch (error) {
      console.error(`Error toggling ${role} role:`, error);
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
    const email = (user.email || '').toLowerCase();
    const query = searchQuery.toLowerCase();
    
    return fullName.includes(query) || email.includes(query);
  });

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-6">User Management</h2>
      
      <div className="flex justify-between items-center mb-6">
        <div className="relative flex-1 mr-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
          <Input 
            placeholder="Search users by name or email..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Button 
          onClick={handleSyncUsers} 
          disabled={isSyncing || isLoading}
          className="whitespace-nowrap"
        >
          {isSyncing ? (
            <>
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              Syncing...
            </>
          ) : (
            <>
              <RefreshCw className="mr-2 h-4 w-4" />
              Sync Users
            </>
          )}
        </Button>
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
                <TableHead className="text-center">Admin Role</TableHead>
                <TableHead className="text-center">Vendor Role</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8">
                    {searchQuery 
                      ? "No users match your search" 
                      : "No users found. Click 'Sync Users' to sync user data."}
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
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-2">
                        {user.is_admin && <UserCheck className="h-4 w-4 text-green-500" />}
                        <Switch 
                          checked={user.is_admin}
                          onCheckedChange={(checked) => toggleUserRole(user.id, 'admin', user.is_admin)}
                          disabled={user.id === currentUser?.id}
                        />
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-2">
                        {user.is_vendor && <Store className="h-4 w-4 text-blue-500" />}
                        <Switch 
                          checked={user.is_vendor}
                          onCheckedChange={(checked) => toggleUserRole(user.id, 'vendor', user.is_vendor)}
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
