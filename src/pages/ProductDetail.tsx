import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { ArrowLeft, MessageCircle } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  image_url: string | null;
  youtube_url: string | null;
  category: string | null;
}

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  // Replace with your WhatsApp number (include country code without +)
  const WHATSAPP_NUMBER = '1234567890';

  useEffect(() => {
    if (id) {
      fetchProduct(id);
    }
  }, [id]);

  const fetchProduct = async (productId: string) => {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', productId)
      .maybeSingle();

    if (error) {
      console.error('Error fetching product:', error);
      navigate('/');
    } else if (data) {
      setProduct(data);
    } else {
      navigate('/');
    }
    setLoading(false);
  };

  const handleWhatsAppOrder = () => {
    if (!product) return;

    const message = `Hello, I'm interested in the product: ${product.name} - $${Number(product.price).toFixed(2)}`;
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodedMessage}`;
    
    window.open(whatsappUrl, '_blank');
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!product) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <Link to="/">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Products
            </Button>
          </Link>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-2 gap-12 max-w-6xl mx-auto">
          {/* Product Image */}
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-red-600 to-red-900 rounded-xl blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-pulse"></div>
            <div className="relative w-full h-[400px] rounded-xl overflow-hidden bg-black">
              {product.image_url ? (
                <img
                  src={product.image_url}
                  alt={product.name}
                  className="w-full h-full object-contain transform group-hover:scale-105 transition-transform duration-500"
                />
              ) : (
                <div className="h-full w-full flex items-center justify-center">
                  <span className="text-muted-foreground text-lg">No image available</span>
                </div>
              )}
            </div>
          </div>

          {/* Product Info */}
          <div className="flex flex-col justify-center space-y-8 p-6 bg-black/50 rounded-xl backdrop-blur-sm">
            <div>
              <h1 className="text-5xl font-black mb-4 bg-gradient-to-r from-red-500 to-red-700 text-transparent bg-clip-text transform hover:scale-105 transition-transform cursor-default">
                {product.name}
              </h1>
              {product.category && (
                <div className="mb-4">
                  <span className="px-3 py-1 bg-red-500/20 border border-red-500 rounded-full text-red-400 text-sm font-semibold">
                    {product.category}
                  </span>
                </div>
              )}
              <p className="text-4xl font-bold text-red-500 mb-6 animate-pulse">
                ${Number(product.price).toFixed(2)}
              </p>
              {product.description && (
                <p className="text-xl text-gray-300 leading-relaxed border-l-4 border-red-500 pl-4">
                  {product.description}
                </p>
              )}
            </div>

            <div className="space-y-4">
              {product.youtube_url && (
                <Button 
                  size="lg"
                  variant="outline"
                  className="w-full text-xl h-16 border-2 border-red-500 bg-black hover:bg-red-950 text-red-500 hover:text-white transform hover:scale-105 transition-all group mb-4"
                  onClick={() => window.open(product.youtube_url, '_blank')}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mr-3 group-hover:animate-pulse" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/>
                  </svg>
                  Watch Demo on YouTube
                </Button>
              )}
              <Button 
                size="lg" 
                className="w-full text-xl h-16 bg-gradient-to-r from-red-600 to-red-800 hover:from-red-700 hover:to-red-900 shadow-lg shadow-red-500/50 transform hover:scale-105 transition-all"
                onClick={handleWhatsAppOrder}
              >
                <MessageCircle className="mr-3 h-6 w-6" />
                Order on WhatsApp
              </Button>
              <p className="text-sm text-red-400 text-center font-medium">
                Click to start a conversation with us on WhatsApp
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;