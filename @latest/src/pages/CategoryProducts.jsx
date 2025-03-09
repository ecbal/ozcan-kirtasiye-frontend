import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import '../css/CategoryProducts.css';


const CategoryProducts = () => {
  const { categoryId } = useParams(); // URL'den kategori ID'sini al
  const [products, setProducts] = useState([]);
  const [categoryName, setCategoryName] = useState("");

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch(
          `http://localhost:9090/api/categories/${categoryId}/products`
        );
        if (response.ok) {
          const data = await response.json();
          setProducts(data);
          setCategoryName(data[0]?.category?.name || "Kategori"); // Kategori ismini ayarla
        } else {
          console.error("Ürünleri çekerken hata oluştu.");
        }
      } catch (error) {
        console.error("API isteği sırasında hata:", error);
      }
    };

    fetchProducts();
  }, [categoryId]);

  return (
    <div className="category-products-container">
      <h2 className="category-products-title">{categoryName} - Ürünler</h2>
      <div className="product-list">
        {products.length > 0 ? (
          products.map((product) => (
            <div key={product.id} className="product-item">
              <Link to={`/product/${product.id}`} className="product-link">
                <div className="product-image-container">
                  <ProductImage productId={product.id} />
                </div>
                <div className="product-details">
                  <h4 className="product-name">{product.name}</h4>
                  <p className="product-description">{product.description}</p>
                  <p className="product-price">${product.price}</p>
                  <p className="product-stock">Stok: {product.stockQuantity}</p>
                </div>
              </Link>
            </div>
          ))
        ) : (
          <p className="no-products">Ürün bulunmuyor.</p>
        )}
      </div>
      <Link to="/categories" className="back-link">
        Kategorilere Geri Dön
      </Link>
    </div>
  );
};

const ProductImage = ({ productId }) => {
  const [image, setImage] = useState(null);

  useEffect(() => {
    const loadImage = async () => {
      const fetchedImage = await fetchProductImage(productId);
      if (fetchedImage) {
        const imageUrl = URL.createObjectURL(fetchedImage);
        setImage(imageUrl);
      }
    };

    loadImage();
  }, [productId]);

  if (!image) return <p>Resim yükleniyor...</p>;

  return <img src={image} alt="Product" className="product-image" />;
};

const fetchProductImage = async (productId) => {
  try {
    const imageResponse = await fetch(
      `http://localhost:9090/api/product/${productId}/image`
    );
    if (imageResponse.ok) {
      return await imageResponse.blob();
    }
    return null;
  } catch (error) {
    console.error("Resim yüklenirken hata oluştu:", error);
    return null;
  }
};

export default CategoryProducts;
