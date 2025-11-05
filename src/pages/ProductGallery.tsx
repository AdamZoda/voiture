import { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import heroImage from '@/assets/hero-bg.jpg';
import { Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  image_url: string | null;
  category: string | null;
  featured: boolean;
}

const ProductGallery = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdmin, setShowAdmin] = useState(false);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [newCategory, setNewCategory] = useState("");
  const { user } = useAuth();

  const showAdminTimer = useRef<number | null>(null);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Make key check case-insensitive and avoid blocking default browser shortcuts
      if (event.ctrlKey && event.key.toLowerCase() === 'y') {
        // Don't call event.preventDefault() here — avoid interfering with other behavior
        setShowAdmin(true);
        // Clear any previous timer so we reliably hide after the latest keypress
        if (showAdminTimer.current) {
          window.clearTimeout(showAdminTimer.current);
        }
        showAdminTimer.current = window.setTimeout(() => {
          setShowAdmin(false);
          showAdminTimer.current = null;
        }, 2000) as unknown as number;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      if (showAdminTimer.current) {
        window.clearTimeout(showAdminTimer.current);
        showAdminTimer.current = null;
      }
    };
  }, []);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    const { data, error } = await supabase
      .from('products')
      .select('id, name, description, price, image_url, category, created_at, featured')
      .order('created_at', { ascending: false });

    if (!error && data) {
      // Ajoute la propriété category si elle n'existe pas
      setProducts(data.map(product => ({
        ...product,
        category: typeof product.category === 'string' ? product.category : null
      })));
    }
    setLoading(false);
  };

  const handleDeleteCategory = async (categoryName: string) => {
    try {
      // Vérifier si la catégorie est utilisée
      const { data: products } = await supabase
        .from('products')
        .select('id')
        .eq('category', categoryName);

      if (products && products.length > 0) {
        toast.error("Impossible de supprimer une catégorie utilisée par des produits");
        return;
      }

      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('name', categoryName);

      if (error) throw error;

      // Rafraîchir la liste des catégories
      await fetchCategories();
      if (category === categoryName) {
        setCategory('');
      }
      toast.success('Catégorie supprimée avec succès');
    } catch (error) {
      toast.error("Erreur lors de la suppression de la catégorie");
      console.error(error);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  // Extraction des catégories uniques
  const categories = Array.from(new Set(products.map(p => p.category).filter(Boolean)));

  // Filtrage des produits selon la recherche et la catégorie
  const filteredProducts = products.filter(product => {
    const query = search.trim().toLowerCase();
    const matchSearch =
      !query ||
      product.name.toLowerCase().includes(query) ||
      (product.description ? product.description.toLowerCase().includes(query) : false);
    const matchCategory = !category || product.category === category;
    return matchSearch && matchCategory;
  });

  // Séparer les produits filtrés en deux groupes
  const featuredProducts = filteredProducts.filter(p => p.featured);
  const regularProducts = filteredProducts.filter(p => !p.featured);

  // Ajout d'une nouvelle catégorie (admin seulement)
  const handleAddCategory = () => {
    const cat = newCategory.trim();
    if (cat && !categories.includes(cat)) {
      categories.push(cat);
      setCategory(cat);
      setNewCategory("");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative h-96 overflow-hidden">
        <img 
          src={heroImage} 
          alt="Hero" 
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background/80 to-background/40 flex items-center">
          <div className="container mx-auto px-4">
            <div style={{ 
    display: 'flex', 
    flexDirection: 'column', 
    alignItems: 'center', 
    justifyContent: 'center', 
    textAlign: 'center', 
    paddingTop: '50px', 
    width: '100%' 
}}>
    
    <h1 
        className="text-5xl font-bold mb-4" 
        style={{ 
            fontSize: '65px', 
            color: '#FFFFFF', // Blanc pur pour NUPSIA SHOP
            fontFamily: 'Impact, "Arial Black", sans-serif', 
            letterSpacing: '3px', 
            // Ombre forte rouge qui se marie avec le fond
            textShadow: '4px 4px 8px #FF0000, -2px -2px 4px rgba(0,0,0,0.7)' 
        }}
    >
        NUPSIA SHOP™ 
    </h1>
    
    <p 
        className="text-xl max-w-2xl relative z-10 animate-fadeIn"
        style={{
            fontSize: '28px',
            background: 'linear-gradient(45deg, #ff3d3d, #ff0000, #cc0000)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            fontFamily: '"Orbitron", "Rajdhani", sans-serif',
            fontWeight: '700',
            letterSpacing: '2px',
            textTransform: 'uppercase',
            textShadow: '0 0 10px rgba(255, 0, 0, 0.5)',
            animation: 'glow 2s ease-in-out infinite alternate',
            padding: '10px 20px',
            borderLeft: '4px solid #ff0000',
            borderRight: '4px solid #ff0000',
            transform: 'skew(-5deg)',
        }}
    >
        Unlock Los Santos Exclusives: Your Next VIP  Awaits
    </p>
    
    <style>{`
        @keyframes glow {
            from {
                text-shadow: 0 0 10px rgba(255, 0, 0, 0.5),
                             0 0 20px rgba(255, 0, 0, 0.3),
                             0 0 30px rgba(255, 0, 0, 0.2);
            }
            to {
                text-shadow: 0 0 20px rgba(255, 0, 0, 0.6),
                             0 0 30px rgba(255, 0, 0, 0.4),
                             0 0 40px rgba(255, 0, 0, 0.3);
            }
        }
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(-20px) skew(-5deg); }
            to { opacity: 1; transform: translateY(0) skew(-5deg); }
        }
        .animate-fadeIn {
            animation: fadeIn 1s ease-out forwards;
        }
    `}</style>

</div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex flex-row items-center gap-6">
          <Link to="/" className="text-xl font-black mr-4">
            <span className="text-red-500 hover:text-red-400 transition-colors duration-300" style={{
              textShadow: '0 0 10px rgba(255, 0, 0, 0.5)',
              letterSpacing: '2px',
              fontSize: '24px'
            }}>
              Store
            </span>
          </Link>
          
          {/* Barre de recherche */}
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Rechercher un produit..."
            className="w-full max-w-lg px-5 py-2 rounded-lg bg-zinc-900 text-white border border-red-600 placeholder:text-red-300 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 shadow"
            style={{marginRight: '1rem'}}
          />
          
          {/* Section Catégories simplifiée */}
          <div className="flex items-center gap-2">
            <select
              value={category}
              onChange={e => setCategory(e.target.value)}
              className="px-4 py-2 rounded-lg bg-zinc-900 text-white border border-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
              style={{minWidth: '200px'}}
            >
              <option value="">Toutes les catégories</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Admin Dashboard uniquement */}
          <div className="flex gap-4 ml-auto">
            <Link to="/admin" className={`transition-opacity duration-300 ${showAdmin ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
              <Button className="bg-gradient-to-r from-red-600 to-red-800 hover:from-red-700 hover:to-red-900 shadow-lg shadow-red-500/50">
                Admin Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Products Grid */}
      <div className="container mx-auto px-4 pb-12 mt-12">
        {filteredProducts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">Aucun produit trouvé.</p>
            {user && (
              <Link to="/admin">
                <Button className="mt-4">Ajouter un produit</Button>
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-12">
            {/* Suggestions */}
            {featuredProducts.length > 0 && (
              <div className="space-y-4">
                <h2 className="text-2xl font-bold text-red-500">Suggestions</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {featuredProducts.slice(0, 4).map((product) => (
                    <Link key={product.id} to={`/product/${product.id}`}>
                      <Card className="overflow-hidden transition-all hover:shadow-lg hover:-translate-y-1">
                        <div className="aspect-square overflow-hidden bg-muted">
                          {product.image_url ? (
                            <img
                              src={product.image_url}
                              alt={product.name}
                              className="h-full w-full object-cover transition-transform hover:scale-105"
                            />
                          ) : (
                            <div className="h-full w-full flex items-center justify-center">
                              <span className="text-muted-foreground">No image</span>
                            </div>
                          )}
                        </div>
                        <CardContent className="p-4">
                          <h3 className="font-semibold text-lg mb-2 line-clamp-1">{product.name}</h3>
                          {product.description && (
                            <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                              {product.description}
                            </p>
                          )}
                        </CardContent>
                        <CardFooter className="p-4 pt-0 flex justify-between items-center">
                          <span className="text-2xl font-bold text-primary">
                            ${Number(product.price).toFixed(2)}
                          </span>
                        </CardFooter>
                      </Card>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Autres produits */}
            <div className="space-y-4">
              {featuredProducts.length > 0 && (
                <h2 className="text-2xl font-bold text-red-500">Autres produits</h2>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {regularProducts.map((product) => (
                  <Link key={product.id} to={`/product/${product.id}`}>
                    <Card className="overflow-hidden transition-all hover:shadow-lg hover:-translate-y-1">
                      <div className="aspect-square overflow-hidden bg-muted">
                        {product.image_url ? (
                          <img
                            src={product.image_url}
                            alt={product.name}
                            className="h-full w-full object-cover transition-transform hover:scale-105"
                          />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center">
                            <span className="text-muted-foreground">No image</span>
                          </div>
                        )}
                      </div>
                      <CardContent className="p-4">
                        <h3 className="font-semibold text-lg mb-2 line-clamp-1">{product.name}</h3>
                        {product.description && (
                          <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                            {product.description}
                          </p>
                        )}
                      </CardContent>
                      <CardFooter className="p-4 pt-0 flex justify-between items-center">
                        <span className="text-2xl font-bold text-primary">
                          ${Number(product.price).toFixed(2)}
                        </span>
                      </CardFooter>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductGallery;