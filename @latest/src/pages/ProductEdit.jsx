import React, { useState, useEffect, useContext } from "react";
import { UserContext } from "../context/UserContext";
import { useNavigate } from "react-router-dom";
import '../css/ProductEdit.css';

const ProductEdit = () => {
  const { user } = useContext(UserContext);
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
  const [selectedOption, setSelectedOption] = useState("listProducts");
  const [newProduct, setNewProduct] = useState({
    name: "",
    price: "",
    stockQuantity: "",
    description: "",
    categoryId: "",
  });
  const [image, setImage] = useState(null);
  const [editingProduct, setEditingProduct] = useState(null);
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    if (!user || user.userCreate.role !== "ADMIN") {
      navigate("/profile");
    } else {
      fetchProducts();
      fetchCategories();
    }
  }, [user, navigate]);

  const handlePageChange = (newPage) => {
    if (newPage >= 0 && newPage < totalPages) {
      fetchProducts(newPage); // Yeni sayfa verilerini çek
      setCurrentPage(newPage);
    }
  };

 const fetchProducts = async (page = 0, size = 10) => {
  try {
    const response = await fetch(`http://localhost:9090/api/product?page=${page}&size=${size}`);
    const data = await response.json();
    setProducts(data.content || []);
    setCurrentPage(data.number || 0);
    setTotalPages(data.totalPages || 0);
  } catch (error) {
    console.error("Ürünleri alırken bir hata oluştu:", error);
  }
};
const handleSummaryFetch = async () => {
  try {
    const response = await fetch("http://localhost:9090/api/product/view/summary");
    if (!response.ok) {
      throw new Error("Özet verisi alınırken bir hata oluştu.");
    }
    const data = await response.json();
    console.log("API Yanıtı:", data);

    // Verinin formatını kontrol et
    if (Array.isArray(data)) {
      // Eğer dizi ise, doğrudan kullanabilirsin
      setSummary(data);
    } else if (data && Array.isArray(data.summary)) {
      // Eğer verinin içinde 'summary' dizisi varsa, o diziyi kullan
      setSummary(data.summary);
    } else {
      throw new Error("Özet verisi doğru formatta gelmedi.");
    }

    setSelectedOption("viewSummary");
  } catch (error) {
    console.error("Özet verisi alım hatası:", error);
    alert("Özet verisi alınırken bir hata oluştu.");
  }
};




  const fetchCategories = async () => {
    try {
      const response = await fetch("http://localhost:9090/api/categories");
      const data = await response.json();
      setCategories(data || []);
    } catch (error) {
      console.error("Kategorileri alırken bir hata oluştu:", error);
    }
  };
  const handleDeleteProduct = async (productId) => {
    const confirmDelete = window.confirm("Bu ürünü silmek istediğinize emin misiniz?");
    if (!confirmDelete) return;
  
    try {
      const response = await fetch(`http://localhost:9090/api/product/${productId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });
  
      if (response.ok) {
        alert("Ürün başarıyla silindi.");
        fetchProducts(); // Ürün listesini güncelle
      } else {
        alert("Ürün şuan bir siparişin içinde olduğu için silinemiyor.");
      }
    } catch (error) {
      console.error("Ürün silme hatası:", error);
      alert("Ürün silinirken bir hata oluştu.");
    }
  };
  

  const handleProductSubmit = async (event) => {
    event.preventDefault();
    const method = editingProduct ? "PUT" : "POST";
    const url = editingProduct
      ? `http://localhost:9090/api/product/${editingProduct.id}`
      : "http://localhost:9090/api/product";

    try {
      const productResponse = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newProduct.name,
          price: newProduct.price,
          stockQuantity: newProduct.stockQuantity,
          description: newProduct.description,
          category: { id: newProduct.categoryId },
        }),
      });

      if (!productResponse.ok) {
        alert("Ürün işlemi sırasında bir hata oluştu.");
        return;
      }

      const productData = await productResponse.json();
      const productId = editingProduct ? editingProduct.id : productData.id;

      if (image) {
        const formData = new FormData();
        formData.append("image", image);

        const { prefix, token } = user.token;
        const imageResponse = await fetch(
          `http://localhost:9090/api/product/${productId}/upload-image`,
          {
            method: "POST",
            headers: {
              Authorization: `${prefix} ${token}`,
            },
            body: formData,
          }
        );

        if (imageResponse.ok) {
          alert("Ürün ve resmi başarıyla " + (editingProduct ? "güncellendi" : "eklendi") + "!");
        } else {
          alert("Ürün eklendi/güncellendi ancak resim yüklenirken bir hata oluştu.");
        }
      } else {
        alert("Ürün başarıyla " + (editingProduct ? "güncellendi" : "eklendi") + "!");
      }

      resetForm();
      fetchProducts();
    } catch (error) {
      console.error("Ürün işlemi hatası:", error);
      alert("Ürün işlemi sırasında bir hata oluştu.");
    }
  };

  const handleSelectProductForEditing = (product) => {
    setEditingProduct(product);
    setNewProduct({
      name: product.name,
      price: product.price,
      stockQuantity: product.stockQuantity,
      description: product.description,
      categoryId: product.category?.id || "",
    });
    setSelectedOption("editProduct");
  };

  const handleAddNewProduct = () => {
    resetForm();
    setSelectedOption("addProduct");
  };

  const resetForm = () => {
    setEditingProduct(null);
    setNewProduct({
      name: "",
      price: "",
      stockQuantity: "",
      description: "",
      categoryId: "",
    });
    setImage(null);
    setSummary(null);
  };

  return (
    <div className="product-edit-container">
      <h1>Ürün Yönetimi</h1>

      <div className="options">
        <button onClick={() => setSelectedOption("listProducts")}>Ürünleri Listele</button>
        <button onClick={handleAddNewProduct}>Yeni Ürün Ekle</button>
        <button onClick={handleSummaryFetch}>Özet Göster</button>
      </div>

      {selectedOption === "listProducts" && (
  <div>
    <h2>Ürün Listesi</h2>
    <ul>
      {products.map((product) => (
        <li key={product.id}>
          <span>{product.name} - {product.price} TL</span>
          <div className="button-container">
            <button onClick={() => handleSelectProductForEditing(product)}>Düzenle</button>
            <button onClick={() => handleDeleteProduct(product.id)}>Sil</button>
          </div>
        </li>
      ))}
    </ul>

    <div className="pagination">
      <button
        disabled={currentPage === 0}
        onClick={() => handlePageChange(currentPage - 1)}
      >
        Önceki
      </button>
      <span>Sayfa {currentPage + 1} / {totalPages}</span>
      <button
        disabled={currentPage === totalPages - 1}
        onClick={() => handlePageChange(currentPage + 1)}
      >
        Sonraki
      </button>
    </div>
  </div>
)}

{selectedOption === "viewSummary" && summary && (
  <div>
    <h2>Ürün Özeti</h2>
    <table>
      <thead>
        <tr>
          <th>Ürün Adı</th>
          <th>Stok Miktarı</th>
          <th>Fiyat</th>
          <th>Ürün ID</th>
          <th>Oluşturulma Zamanı</th>
        </tr>
      </thead>
      <tbody>
        {summary.map(item => (
          <tr key={item.productId}>
            <td>{item.productName}</td>
            <td>{item.stockQuantity}</td>
            <td>{item.price} TL</td>
            <td>{item.productId}</td>
            <td>{item.createTime}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
)}






      {selectedOption === "editProduct" || selectedOption === "addProduct" ? (
        <div>
          <h2>{selectedOption === "editProduct" ? "Ürünü Düzenle" : "Yeni Ürün Ekle"}</h2>
          <form onSubmit={handleProductSubmit}>
            <div>
              <label>Ürün Adı:</label>
              <input
                type="text"
                value={newProduct.name}
                onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
              />
            </div>

            <div>
              <label>Fiyat:</label>
              <input
                type="number"
                value={newProduct.price}
                onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
              />
            </div>

            <div>
              <label>Stok Miktarı:</label>
              <input
                type="number"
                value={newProduct.stockQuantity}
                onChange={(e) => setNewProduct({ ...newProduct, stockQuantity: e.target.value })}
              />
            </div>

            <div>
              <label>Açıklama:</label>
              <textarea
                value={newProduct.description}
                onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
              />
            </div>

            <div>
              <label>Kategori:</label>
              <select
                value={newProduct.categoryId}
                onChange={(e) => setNewProduct({ ...newProduct, categoryId: e.target.value })}
              >
                <option value="">Kategori Seç</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label>Ürün Görseli:</label>
              <input type="file" onChange={(e) => setImage(e.target.files[0])} />
            </div>

            <button type="submit">
              {selectedOption === "editProduct" ? "Güncelle" : "Ekle"}
            </button>
            <button type="button" onClick={resetForm}>İptal</button>
          </form>
        </div>
      ) : null}
    </div>
  );
};

export default ProductEdit;
