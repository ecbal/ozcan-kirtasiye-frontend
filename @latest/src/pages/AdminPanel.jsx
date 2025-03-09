
import React, { useState, useEffect, useContext } from "react";
import { UserContext } from "../context/UserContext";
import { useNavigate } from "react-router-dom";
import '../css/AdminPanel.css'; 

const AdminPanel = () => {
  const { user } = useContext(UserContext);
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [users, setUsers] = useState([]);
  const [categories, setCategories] = useState([]);
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
  const [newCategory, setNewCategory] = useState("");
  const [editingCategory, setEditingCategory] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  

  // Admin olup olmadığını kontrol et
  useEffect(() => {
    if (!user || user.userCreate.role !== "ADMIN") {
      navigate("/home");
    } else {
      fetchProducts();
      fetchUsers();
      fetchCategories();
    }
  }, [user, navigate]);

  // Ürünleri API'den getir
  const fetchProducts = async () => {
    try {
      const response = await fetch("http://localhost:9090/api/product");
      const data = await response.json();
      setProducts(data.content || data || []);
    } catch (error) {
      console.error("Ürünleri alırken bir hata oluştu:", error);
    }
  };

  // Kullanıcıları API'den getir
  const fetchUsers = async (page = 0) => {
    try {
      const response = await fetch(`http://localhost:9090/api/user?page=${page}`);
      const data = await response.json();
      setUsers(data.content || []);
      setCurrentPage(data.pageable.pageNumber);
      setTotalPages(data.totalPages);
    } catch (error) {
      console.error("Kullanıcıları alırken bir hata oluştu:", error);
    }
  };
  useEffect(() => {
    fetchUsers();
  }, []);

  const handlePageChange = (newPage) => {
    if (newPage >= 0 && newPage < totalPages) {
      fetchUsers(newPage);
    }
  };

  // Kategorileri API'den getir
  const fetchCategories = async () => {
    try {
      const response = await fetch("http://localhost:9090/api/categories");
      const data = await response.json();
      setCategories(data || []);
    } catch (error) {
      console.error("Kategorileri alırken bir hata oluştu:", error);
    }
  };

  // Kullanıcı silme işlemi
  const handleDeleteUser = async (userId) => {
    const confirmDelete = window.confirm("Bu kullanıcıyı silmek istediğinize emin misiniz?");
    if (!confirmDelete) return;

    try {
      const { prefix, token } = user.token;
      const response = await fetch(`http://localhost:9090/api/user/adminDelete/${userId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `${prefix} ${token}`,
        },
      });
      if (response.ok) {
        alert("Kullanıcı başarıyla silindi.");
        fetchUsers();
      } else {
        alert("Kullanıcı silinirken bir hata oluştu.");
      }
    } catch (error) {
      console.error("Kullanıcı silme hatası:", error);
    }
  };

  // Ürün ekleme veya güncelleme işlemi
  const handleProductSubmit = async (event) => {
        event.preventDefault();
        const method = editingProduct ? "PUT" : "POST";
        const url = editingProduct
          ? `http://localhost:9090/api/product/${editingProduct.id}`
          : "http://localhost:9090/api/product";
    
        try {
          console.log(newProduct);
          const productResponse = await fetch(url, {
            method,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              name: newProduct.name,
              price: newProduct.price,
              stockQuantity: newProduct.stockQuantity,
              description: newProduct.description,
              category: { id: newProduct.categoryId }, // Seçilen kategori ID'sini gönderiyoruz
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
            console.log(user);
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
          categoryId: product.categoryId,
        });
        setSelectedOption("editProduct");
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
                fetchProducts();
              } else {
                alert("Ürün şuan bir siparişin içinde olduğu için silinemiyor.");
              }
            } catch (error) {
              console.error("Ürün silme hatası:", error);
            }
          };

  // Kategori ekleme işlemi
  async function handleAddCategory() {
      try {
        const response = await fetch("http://localhost:9090/api/categories", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: newCategory }),
        });

        if (response.ok) {
          alert("Kategori başarıyla eklendi.");
          setNewCategory("");
          fetchCategories();
        } else {
          alert("Kategori eklenirken bir hata oluştu.");
        }
      } catch (error) {
        console.error("Kategori eklerken hata oluştu:", error);
        alert("Kategori eklenirken bir hata oluştu.");
      }
    }

  // Kategori düzenleme işlemi
  const handleEditCategory = async () => {
    if (!editingCategory) return;

    try {
      const response = await fetch(`http://localhost:9090/api/categories/${editingCategory.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: editingCategory.name }),
      });

      if (response.ok) {
        alert("Kategori başarıyla güncellendi.");
        setEditingCategory(null);
        fetchCategories();
      } else {
        alert("Kategori güncellenirken bir hata oluştu.");
      }
    } catch (error) {
      console.error("Kategori güncellenirken hata oluştu:", error);
      alert("Kategori güncellenirken bir hata oluştu.");
    }
  };

  // Kategori silme işlemi
  const handleDeleteCategory = async (categoryId) => {
    const confirmDelete = window.confirm("Bu kategoriyi silmek istediğinize emin misiniz?");
    if (!confirmDelete) return;

    try {
      const response = await fetch(`http://localhost:9090/api/categories/${categoryId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      });

      if (response.ok) {
        alert("Kategori başarıyla silindi.");
        fetchCategories();
      } else {
        alert("Kategori silinirken bir hata oluştu.");
      }
    } catch (error) {
      console.error("Kategori silme hatası:", error);
      alert("Kategori silinirken bir hata oluştu.");
    }
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
  };
  

  return (
    <div className="container">
      <h1>Admin Panel</h1>

      {/* Menü */}
      <div className="menu">
        <button
          onClick={() => setSelectedOption("listProducts")}
          className="menuButton"
        >
          Ürünleri Listele
        </button>
        <button
          onClick={() => {
            setSelectedOption("addProduct");
            resetForm();
          }}
          className="menuButton"
        >
          Ürün Ekle
        </button>
        <button
          onClick={() => setSelectedOption("listUsers")}
          className="menuButton"
        >
          Kullanıcıları Listele
        </button>
        <button
          onClick={() => setSelectedOption("manageCategories")}
          className="menuButton"
        >
          Kategorileri Yönet
        </button>
      </div>

      {/* Seçime Göre İçerik */}
      {selectedOption === "listProducts" && (
        <div>
          <h2>Ürün Listesi</h2>
          <ul className="list">
            {products.map((product) => (
              <li key={product.id} className="listItem">
                <div>
                  <strong>{product.name}</strong> - {product.price} TL - Stok:{" "}
                  {product.stockQuantity}
                </div>
                <div>
                  <button
                    className="editButton"
                    onClick={() => handleSelectProductForEditing(product)}
                  >
                    Düzenle
                  </button>
                  <button
                    className="deleteButton"
                    onClick={() => handleDeleteProduct(product.id)}
                  >
                    Sil
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {(selectedOption === "addProduct" || selectedOption === "editProduct") && (
        <form onSubmit={handleProductSubmit} className="form">
          <h3>{editingProduct ? "Ürün Güncelle" : "Ürün Ekle"}</h3>
          <input
            className="input"
            type="text"
            placeholder="Ürün Adı"
            value={newProduct.name}
            onChange={(e) =>
              setNewProduct({ ...newProduct, name: e.target.value })
            }
            required
          />
          <input
            className="input"
            type="number"
            placeholder="Fiyat"
            value={newProduct.price}
            onChange={(e) =>
              setNewProduct({ ...newProduct, price: e.target.value })
            }
            required
          />
          <input
            className="input"
            type="number"
            placeholder="Stok"
            value={newProduct.stockQuantity}
            onChange={(e) =>
              setNewProduct({ ...newProduct, stockQuantity: e.target.value })
            }
            required
          />
          <textarea
            className="input"
            placeholder="Açıklama"
            value={newProduct.description}
            onChange={(e) =>
              setNewProduct({ ...newProduct, description: e.target.value })
            }
            required
          />
          <select
            className="input"
            value={newProduct.categoryId}
            onChange={(e) =>
              setNewProduct({ ...newProduct, categoryId: e.target.value })
            }
            required
          >
            <option value="">Kategori Seçin</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
          <input
            className="input"
            type="file"
            onChange={(e) => setImage(e.target.files[0])}
          />
          <div className="buttonGroup">
            <button type="submit" className="button">
              {editingProduct ? "Ürünü Güncelle" : "Ürün Ekle"}
            </button>
            <button type="button" className="cancelButton" onClick={resetForm}>
              İptal
            </button>
          </div>
        </form>
      )}

      {selectedOption === "listUsers" && (
        <div>
          <h2>Kullanıcı Listesi</h2>
          <ul className="list">
            {users.map((user) => (
              <li key={user.id} className="listItem">
                <strong>{user.name}</strong> - {user.email} - Rol: {user.role}
                <button
                  className="deleteButton"
                  onClick={() => handleDeleteUser(user.id)}
                >
                  Sil
                </button>
              </li>
            ))}
          </ul>
          <div className="pagination">
            <button
              className="paginationButton"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 0}
            >
              Önceki
            </button>
            <span className="pageInfo">
              Sayfa {currentPage + 1} / {totalPages}
            </span>
            <button
              className="paginationButton"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage + 1 === totalPages}
            >
              Sonraki
            </button>
          </div>
        </div>
      )}

      {selectedOption === "manageCategories" && (
        <div>
          <h2>Kategori Yönetimi</h2>
          <div>
            <input
              className="input"
              type="text"
              placeholder="Yeni Kategori Adı"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
            />
            <button className="button" onClick={handleAddCategory}>
              Kategori Ekle
            </button>
          </div>
          <ul className="list">
            {categories.map((category) => (
              <li key={category.id} className="listItem">
                <div>
                  <strong>{category.name}</strong>
                </div>
                <div>
                  <button
                    className="editButton"
                    onClick={() => setEditingCategory(category)}
                  >
                    Düzenle
                  </button>
                  <button
                    className="deleteButton"
                    onClick={() => handleDeleteCategory(category.id)}
                  >
                    Sil
                  </button>
                </div>
              </li>
            ))}
          </ul>
          {editingCategory && (
            <div>
              <h3>Kategoriyi Düzenle</h3>
              <input
                className="input"
                type="text"
                value={editingCategory.name}
                onChange={(e) =>
                  setEditingCategory({ ...editingCategory, name: e.target.value })
                }
              />
              <button className="button" onClick={handleEditCategory}>
                Güncelle
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminPanel;