import React, { useState, useEffect, useContext } from "react";
import { UserContext } from "../context/UserContext";
import { useNavigate } from "react-router-dom";
import '../css/UserEdit.css'; 

const UserEdit = () => {
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
  const [userStats, setUserStats] = useState(null); // Kullanıcı istatistiklerini tutan state

  useEffect(() => {
    if (!user || user.userCreate.role !== "ADMIN") {
      navigate("/home");
    } else {
      fetchUsers();
    }
  }, [user, navigate]);

  const handlePageChange = (newPage) => {
    if (newPage >= 0 && newPage < totalPages) {
      fetchUsers(newPage);
    }
  };

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

  // Kullanıcı istatistiklerini getirme
  const handleShowStatistics = async (userId) => {
    try {
      // UserContext'ten token'ı alıyoruz
      const { prefix, token } = user.token;
  
      // Fetch isteğini Basic token ile yapıyoruz
      const response = await fetch(`http://localhost:9090/api/orders/user-statistics/${userId}`, {
        headers: {
          "Authorization": `${prefix} ${token}`, // Authorization header'ına token'ı ekliyoruz
        }
      });
      
      const data = await response.json();
      console.log(data);
      setUserStats(data); // İstatistik verisini state'e kaydediyoruz
      console.log(userStats);
      alert(
        `Toplam Harcama: ${data.totalSpent} TL\nToplam Sipariş: ${data.totalOrders}`
      );
    } catch (error) {
      console.error("Kullanıcı istatistikleri alınırken bir hata oluştu:", error);
    }
  };
  

  return (
    <div className="user-edit-container">
      <h1>Kullanıcı Yönetimi</h1>
      <table className="user-table">
        <thead>
          <tr>
            <th>Ad</th>
            <th>Email</th>
            <th>Rol</th>
            <th>İşlem</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id}>
              <td>{user.name}</td>
              <td>{user.email}</td>
              <td>{user.role}</td>
              <td>
                <button onClick={() => handleDeleteUser(user.id)}>Sil</button>
                <button onClick={() => handleShowStatistics(user.id)}>İstatistikleri Göster</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="pagination">
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 0}
        >
          Önceki
        </button>
        <span>
          Sayfa {currentPage + 1} / {totalPages}
        </span>
        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages - 1}
        >
          Sonraki
        </button>
      </div>
    </div>
  );
}

export default UserEdit;
