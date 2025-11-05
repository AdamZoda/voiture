import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Plus, Edit, Trash2, LogOut, UserPlus, MailIcon } from 'lucide-react';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  image_url: string | null;
}

interface Category {
  id: string;
  name: string;
}

interface User {
  id: string;
  email: string;
  created_at: string;
}

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [newCategory, setNewCategory] = useState('');
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [users, setUsers] = useState<User[]>([]);
  const [showNewUserForm, setShowNewUserForm] = useState(false);
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');

  useEffect(() => {
    fetchProducts();
    fetchCategories();
    fetchUsers();
  }, []);

  const fetchProducts = async () => {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setProducts(data);
    }
    setLoading(false);
  };

  const fetchCategories = async () => {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('name');

    if (!error && data) {
      setCategories(data);
    }
    setLoadingCategories(false);
  };

  const fetchUsers = async () => {
    const { data: { users }, error } = await supabase.auth.admin.listUsers();
    if (!error && users) {
      setUsers(users);
    }
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);

    if (error) {
      toast.error('Failed to delete product');
    } else {
      toast.success('Product deleted successfully');
      fetchProducts();
    }
    setDeleteId(null);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategory.trim()) return;

    const { error } = await supabase
      .from('categories')
      .insert([{ name: newCategory.trim() }]);

    if (error) {
      toast.error('Failed to create category');
    } else {
      toast.success('Category created successfully');
      fetchCategories();
      setNewCategory('');
    }
  };

  const handleDeleteCategory = async (categoryName: string) => {
    const { data: products } = await supabase
      .from('products')
      .select('id')
      .eq('category', categoryName);

    if (products && products.length > 0) {
      toast.error("Cannot delete category that has products");
      return;
    }

    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('name', categoryName);

    if (error) {
      toast.error('Failed to delete category');
    } else {
      toast.success('Category deleted successfully');
      fetchCategories();
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserEmail || !newUserPassword) return;

    const { error } = await supabase.auth.signUp({
      email: newUserEmail,
      password: newUserPassword,
    });

    if (error) {
      toast.error('Erreur lors de la création de l\'utilisateur');
    } else {
      toast.success('Utilisateur créé avec succès');
      fetchUsers();
      setNewUserEmail('');
      setNewUserPassword('');
      setShowNewUserForm(false);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', userId);

    if (error) {
      toast.error('Erreur lors de la suppression de l\'utilisateur');
    } else {
      toast.success('Utilisateur supprimé avec succès');
      fetchUsers();
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-6">
            <Link to="/" className="text-xl font-bold text-red-500 hover:text-red-400">
              Store Admin
            </Link>
            <Link to="/">
              <Button variant="ghost">View Store</Button>
            </Link>
          </div>
          <Button variant="outline" onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-12 gap-6">
          {/* User Management - Left Column */}
          <div className="col-span-3">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl text-red-500">Utilisateurs</CardTitle>
                  <Button 
                    onClick={() => setShowNewUserForm(true)}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    <UserPlus className="h-4 w-4 mr-2" />
                    Nouveau
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {showNewUserForm && (
                  <form onSubmit={handleCreateUser} className="mb-6 space-y-4">
                    <div>
                      <Label>Email</Label>
                      <Input
                        type="email"
                        value={newUserEmail}
                        onChange={(e) => setNewUserEmail(e.target.value)}
                        className="bg-zinc-900 border-red-600/20"
                        required
                      />
                    </div>
                    <div>
                      <Label>Mot de passe</Label>
                      <Input
                        type="password"
                        value={newUserPassword}
                        onChange={(e) => setNewUserPassword(e.target.value)}
                        className="bg-zinc-900 border-red-600/20"
                        required
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button type="submit" className="bg-red-600 hover:bg-red-700">
                        Créer
                      </Button>
                      <Button 
                        type="button" 
                        variant="outline"
                        onClick={() => setShowNewUserForm(false)}
                      >
                        Annuler
                      </Button>
                    </div>
                  </form>
                )}

                <div className="space-y-2">
                  {users.map((user) => (
                    <div 
                      key={user.id}
                      className="flex items-center justify-between p-3 bg-zinc-900 rounded-lg border border-red-600/20"
                    >
                      <div className="flex items-center gap-2">
                        <MailIcon className="h-4 w-4 text-red-500" />
                        <span className="text-sm">{user.email}</span>
                      </div>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteUser(user.id)}
                        className="h-8 w-8 p-0"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Products Section - Center */}
          <div className="col-span-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-2xl">Products</CardTitle>
                <Link to="/admin/new">
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Product
                  </Button>
                </Link>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex justify-center py-8">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                  </div>
                ) : products.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground mb-4">No products yet</p>
                    <Link to="/admin/new">
                      <Button>Add Your First Product</Button>
                    </Link>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Image</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {products.map((product) => (
                        <TableRow key={product.id}>
                          <TableCell>
                            <div className="h-12 w-12 rounded bg-muted overflow-hidden">
                              {product.image_url ? (
                                <img
                                  src={product.image_url}
                                  alt={product.name}
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <div className="h-full w-full flex items-center justify-center text-xs text-muted-foreground">
                                  No img
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="font-medium">{product.name}</TableCell>
                          <TableCell className="max-w-xs truncate">
                            {product.description || '-'}
                          </TableCell>
                          <TableCell>${Number(product.price).toFixed(2)}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Link to={`/admin/edit/${product.id}`}>
                                <Button variant="outline" size="sm">
                                  <Edit className="h-4 w-4" />
                                </Button>
                              </Link>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => setDeleteId(product.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Categories Section - Right */}
          <div className="col-span-3">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Categories</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <form onSubmit={handleAddCategory} className="flex flex-col gap-2">
                  <Input
                    type="text"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    placeholder="New category name"
                    className="w-full"
                  />
                  <Button type="submit" className="w-full">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Category
                  </Button>
                </form>

                {loadingCategories ? (
                  <div className="flex justify-center py-4">
                    <div className="h-6 w-6 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                  </div>
                ) : (
                  <div className="space-y-2">
                    {categories.map((category) => (
                      <div 
                        key={category.id}
                        className="flex items-center justify-between p-2 bg-zinc-900 rounded-lg"
                      >
                        <span className="text-sm font-medium">{category.name}</span>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteCategory(category.name)}
                          className="h-7 w-7 p-0"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the product.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => deleteId && handleDelete(deleteId)}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminDashboard;