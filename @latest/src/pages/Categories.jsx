import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import '../css/Categories.css'; // CSS dosyasını import ettik.

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [categoryProducts, setCategoryProducts] = useState({});

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch("http://localhost:9090/api/categories");
        if (response.ok) {
          const data = await response.json();
          setCategories(data);
          data.forEach((category) => {
            fetchProducts(category.id);
          });
        } else {
          console.error("Kategorileri çekerken hata oluştu.");
        }
      } catch (error) {
        console.error("API isteği sırasında hata:", error);
      }
    };

    fetchCategories();
  }, []);

  const fetchProducts = async (categoryId) => {
    try {
      const response = await fetch(
        `http://localhost:9090/api/categories/${categoryId}/products`
      );
      if (response.ok) {
        const data = await response.json();
        setCategoryProducts((prev) => ({
          ...prev,
          [categoryId]: data,
        }));
      } else {
        console.error("Ürünleri çekerken hata oluştu.");
      }
    } catch (error) {
      console.error("API isteği sırasında hata:", error);
    }
  };

  return (
    <div className="categories-container">
      <h2 className="categories-title">Kategoriler</h2>
      <div className="category-list">
        {categories.length > 0 ? (
          categories.map((category) => (
            <div key={category.id} className="category-item">
              <h3 className="category-name">{category.name}</h3>
              <div className="product-info">
                {categoryProducts[category.id] && categoryProducts[category.id].length > 0 ? (
                  <p className="product-count">
                    {categoryProducts[category.id].length} ürün
                  </p>
                ) : (
                  <p className="no-products">Ürün bulunmuyor.</p>
                )}
              </div>
              <Link to={`/category/${category.id}`} className="view-products-link">
                Ürünleri Görüntüle
              </Link>
            </div>
          ))
        ) : (
          <p className="no-categories">Henüz kategori bulunmamaktadır.</p>
        )}
      </div>
    </div>
  );
};

export default Categories;
