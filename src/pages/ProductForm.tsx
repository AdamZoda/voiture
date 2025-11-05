import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { z } from 'zod';

const productSchema = z.object({
  name: z.string().trim().min(1, { message: 'Name is required' }),
  model_name: z.string().optional(), // Rendu optionnel et sans validation
  description: z.string().max(1000).optional(),
  price: z.number().positive(),
  image_url: z.string().url().optional().or(z.literal('')),
  youtube_url: z.string().url().optional().or(z.literal('')),
});

interface Product {
  name: string;
  model_name?: string;
  description?: string;
  price: number;
  image_url?: string;
  youtube_url?: string;
  category?: string;
  featured: boolean;
}

const ProductForm = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditing = !!id;

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    model_name: '',
    description: '',
    price: 0,
    image_url: '',
    youtube_url: '',
    category: '',
    featured: false,
  });
  const [categories, setCategories] = useState<string[]>([]);

  useEffect(() => {
    fetchCategories();
    if (isEditing && id) {
      fetchProduct(id);
    }
  }, [id, isEditing]);

  const fetchCategories = async () => {
    // Modifier pour utiliser la table categories au lieu de products
    const { data, error } = await supabase
      .from('categories')
      .select('name')
      .order('name');
    
    if (!error && data) {
      const uniqueCats = data.map((cat: { name: string }) => cat.name);
      setCategories(uniqueCats);
    }
  };

  const fetchProduct = async (productId: string) => {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', productId)
      .maybeSingle();

    if (error || !data) {
      toast.error('Product not found');
      navigate('/admin');
    } else {
      setFormData({
        name: data.name,
        model_name: data.model_name || '',
        description: data.description || '',
        price: data.price.toString(),
        image_url: data.image_url || '',
        youtube_url: data.youtube_url || '',
        category: data.category || '',
        featured: data.featured || false,
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validation = productSchema.safeParse({
      name: formData.name,
      description: formData.description,
      price: parseFloat(formData.price),
      image_url: formData.image_url,
    });

    if (!validation.success) {
      toast.error(validation.error.errors[0].message);
      return;
    }

    setLoading(true);

    const productData = {
      name: formData.name.trim(),
      model_name: formData.model_name.trim(),
      description: formData.description.trim() || null,
      price: parseFloat(formData.price),
      image_url: formData.image_url.trim() || null,
      youtube_url: formData.youtube_url.trim() || null,
      category: formData.category || null,
      featured: formData.featured, // Ajouter featured aux données à sauvegarder
    };

    if (isEditing && id) {
      const { error } = await supabase
        .from('products')
        .update(productData)
        .eq('id', id);

      if (error) {
        toast.error('Failed to update product');
      } else {
        toast.success('Product updated successfully');
        navigate('/admin');
      }
    } else {
      const { error } = await supabase
        .from('products')
        .insert([productData]);

      if (error) {
        toast.error('Failed to create product');
      } else {
        toast.success('Product created successfully');
        navigate('/admin');
      }
    }

    setLoading(false);
  };

  const handleCreateCategory = async () => {
    if (!formData.newCategory.trim()) return;

    try {
      const newCat = formData.newCategory.trim();
      
      // 1. Créer la nouvelle catégorie
      const { error: categoryError } = await supabase
        .from('categories')
        .insert([{ name: newCat }]);

      if (categoryError) {
        if (categoryError.code === '23505') { // Code pour duplicate
          toast.error('Cette catégorie existe déjà');
        } else {
          throw categoryError;
        }
        return;
      }

      // 2. Rafraîchir la liste des catégories
      await fetchCategories();

      // 3. Sélectionner la nouvelle catégorie
      setFormData(prev => ({
        ...prev,
        category: newCat,
        newCategory: ''
      }));

      toast.success('Catégorie créée avec succès');
    } catch (error) {
      toast.error("Erreur lors de la création de la catégorie");
      console.error(error);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <Link to="/admin">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Button>
          </Link>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="text-2xl">
              {isEditing ? 'Edit Product' : 'Add New Product'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">Product Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter product name"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="model_name">
                  <span className="flex items-center gap-2">
                    Model Name * 
                    <span className="text-red-500 text-sm">(Supports any characters: &$#@!%, special names, etc.)</span>
                  </span>
                </Label>
                <Input
                  id="model_name"
                  value={formData.model_name}
                  onChange={(e) => setFormData({ ...formData, model_name: e.target.value })}
                  placeholder="Enter any model name or identifier"
                  required
                  className="border-red-500 focus:ring-red-500"
                  type="text"
                  spellCheck="false"
                  autoComplete="off"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Enter product description"
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="price">Price ($) *</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  placeholder="0.00"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="image_url" className="flex items-center justify-between">
                  <span>Image URL</span>
                  <a 
                    href="https://postimages.org/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-xs font-semibold text-red-500 hover:text-red-400 transition-colors duration-300"
                  >
                    Get URL
                  </a>
                </Label>
                <Input
                  id="image_url"
                  type="url"
                  value={formData.image_url}
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                  placeholder="https://example.com/image.jpg"
                />
                {formData.image_url && (
                  <div className="mt-2 rounded-lg overflow-hidden border">
                    <img
                      src={formData.image_url}
                      alt="Preview"
                      className="w-full h-48 object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="youtube_url" className="flex items-center justify-between">
                  <span>YouTube Demo Video URL</span>
                  <a 
                    href="https://www.youtube.com/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-xs font-semibold text-red-500 hover:text-red-400 transition-colors duration-300"
                  >
                    Get URL
                  </a>
                </Label>
                <Input
                  id="youtube_url"
                  type="url"
                  value={formData.youtube_url}
                  onChange={(e) => setFormData({ ...formData, youtube_url: e.target.value })}
                  placeholder="https://www.youtube.com/watch?v=..."
                />
                {formData.youtube_url && (
                  <div className="mt-2 rounded-lg overflow-hidden border">
                    <iframe
                      width="100%"
                      height="315"
                      src={formData.youtube_url.replace('watch?v=', 'embed/')}
                      title="YouTube video player"
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    ></iframe>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Catégorie</Label>
                <div className="flex gap-2 items-center">
                  <select
                    id="category"
                    value={formData.category}
                    onChange={e => setFormData({ ...formData, category: e.target.value, newCategory: '' })}
                    className="flex-1 px-4 py-2 rounded-lg bg-zinc-900 text-white border border-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  >
                    <option value="">Choisir une catégorie</option>
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                  <div className="flex items-center gap-2">
                    <Input
                      type="text"
                      value={formData.newCategory}
                      onChange={e => setFormData({ ...formData, newCategory: e.target.value, category: '' })}
                      placeholder="Nouvelle catégorie"
                      className="w-40"
                    />
                    <Button
                      type="button"
                      onClick={handleCreateCategory}
                      className="bg-gradient-to-r from-red-600 to-red-800 hover:from-red-700 hover:to-red-900 px-3"
                    >
                      +
                    </Button>
                  </div>
                </div>
                {formData.category && (
                  <p className="text-sm text-green-500 mt-1">
                    Catégorie sélectionnée : {formData.category}
                  </p>
                )}
              </div>

              <div className="flex items-center space-x-2 bg-zinc-900 p-4 rounded-lg border border-red-600">
                <input
                  type="checkbox"
                  id="featured"
                  checked={formData.featured}
                  onChange={(e) => setFormData(prev => ({ ...prev, featured: e.target.checked }))}
                  className="w-4 h-4 text-red-600 border-red-600 rounded focus:ring-red-500"
                />
                <Label htmlFor="featured" className="text-white cursor-pointer select-none">
                  Afficher en suggestion (première ligne)
                </Label>
              </div>

              <div className="flex gap-4">
                <Button type="submit" disabled={loading} className="flex-1">
                  {loading ? 'Saving...' : isEditing ? 'Update Product' : 'Create Product'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/admin')}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProductForm;