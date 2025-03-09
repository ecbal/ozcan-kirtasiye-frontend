import React, { useState, useEffect, useContext } from "react";
import { UserContext } from "../context/UserContext";
import { useNavigate } from "react-router-dom";
import '../css/CategoryEdit.css'; 

const CategoryEdit = () => {
  const { user } = useContext(UserContext);
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState("");
  const [editingCategory, setEditingCategory] = useState(null);

  useEffect(() => {
    if (!user || user.userCreate.role !== "ADMIN") {
      navigate("/home");
    } else {
      fetchCategories();
    }
  }, [user, navigate]);

  const fetchCategories = async () => {
    try {
      const response = await fetch("http://localhost:9090/api/categories");
      const data = await response.json();
      setCategories(data || []);
    } catch (error) {
      console.error("Kategorileri alırken bir hata oluştu:", error);
    }
  };

  const handleAddCategory = async () => {
    if (!newCategory) return;
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
  };

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

  return (
    <div className="category-edit-container">
      <h1>Kategori Yönetimi</h1>

      {/* Kategori Ekleme */}
      <div className="add-category">
        <input
          type="text"
          placeholder="Yeni kategori adı"
          value={newCategory}
          onChange={(e) => setNewCategory(e.target.value)}
        />
        <button onClick={handleAddCategory}>Ekle</button>
      </div>

      {/* Kategoriler Listesi */}
      <div className="category-list">
        <ul>
          {categories.map((category) => (
            <li key={category.id}>
              {editingCategory?.id === category.id ? (
                <input
                  type="text"
                  value={editingCategory.name}
                  onChange={(e) => setEditingCategory({ ...editingCategory, name: e.target.value })}
                />
              ) : (
                <span>{category.name}</span>
              )}
              <div className="category-actions">
                <button onClick={() => handleDeleteCategory(category.id)}>Sil</button>
                {editingCategory?.id === category.id ? (
                  <button onClick={handleEditCategory}>Kaydet</button>
                ) : (
                  <button onClick={() => setEditingCategory({ ...category })}>Düzenle</button>
                )}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default CategoryEdit;
