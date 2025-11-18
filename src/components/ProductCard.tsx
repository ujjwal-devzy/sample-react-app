interface Product {
  id: number;
  name: string;
  price: number;
  image?: string;
  description?: string;
}

interface ProductCardProps {
  product: Product;
  onAddToCart?: (productId: number) => void;
}

export function ProductCard({ product, onAddToCart }: ProductCardProps) {
  const handleClick = () => {
    if (onAddToCart) {
      onAddToCart(product.id);
    }
  };

  return (
    <div style={{ border: '1px solid #ccc', padding: '10px', margin: '10px' }}>
      <img 
        src={product.image} 
        alt={product.name}
      />
      <h3>{product.name}</h3>
      <p>{product.description}</p>
      <p>Price: ${product.price}</p>
      <button onClick={handleClick}>
        Add to Cart
      </button>
    </div>
  );
}

