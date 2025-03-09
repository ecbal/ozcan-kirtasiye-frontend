import React, { useEffect, useState, useContext } from "react";
import { UserContext } from "../context/UserContext";
import { useNavigate } from "react-router-dom";
import "../css/Profile.css";

const Profile = () => {
  const [userData, setUserData] = useState(null);
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user, setUser } = useContext(UserContext);
  const navigate = useNavigate();

  // Kullanıcı verilerini al
  useEffect(() => {
    const fetchUserData = async () => {
      if (!user || !user.userCreate || !user.userCreate.id) {
        setError("Henüz giriş yapmadınız.");
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(
          `http://localhost:9090/api/user/${user.userCreate.id}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `${user.token.prefix} ${user.token.token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error("Kullanıcı verileri alınırken bir hata oluştu.");
        }

        const data = await response.json();
        setUserData(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (user && user.userCreate && user.userCreate.id) {
      fetchUserData();
    }
  }, [user]);

  // Siparişleri al
  useEffect(() => {
    const fetchOrders = async () => {
      if (!user || !user.token) return;

      const { prefix, token } = user.token;
      try {
        const response = await fetch("http://localhost:9090/api/orders/get", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `${prefix} ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Sipariş verileri alınırken bir hata oluştu.");
        }

        const data = await response.json();
        setOrders(data);
      } catch (err) {
        setError(err.message);
      }
    };

    if (user && user.token) {
      fetchOrders();
    }
  }, [user]);

  const handleOrderClick = (order) => {
    setSelectedOrder(order);
  };

  const handleLogout = () => {
    setUser(null);
    navigate("/home");
    alert("Başarıyla silindi!");
  };

  const handleDeleteAccount = async () => {
    const confirmDelete = window.confirm(
      "Hesabınızı silmek istediğinize emin misiniz? Bu işlem geri alınamaz."
    );

    if (!confirmDelete) return;

    try {
      const response = await fetch(
        `http://localhost:9090/api/user/delete/${user.userCreate.id}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `${user.token.prefix} ${user.token.token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Hesap silinirken bir hata oluştu.");
      }
      handleLogout;

      window.location.reload();

      setTimeout(() => {
        setUser(null);
        navigate("/home");
      }, 500);
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) {
    return <div className="loading">Yükleniyor...</div>;
  }

  if (error) {
    return <div className="error">Hata: {error}</div>;
  }

  return (
    <div className="container">
      <h2 className="title">Profil Bilgileri</h2>
      {userData && (
        <div className="userInfo">
          <p>
            <strong>ID:</strong> {userData.id}
          </p>
          <p>
            <strong>İsim:</strong> {userData.name}
          </p>
          <p>
            <strong>Email:</strong> {userData.email}
          </p>
          <p>
            <strong>Rol:</strong> {userData.role}
          </p>
        </div>
      )}

      <div className="content">
        <div className="orderListContainer">
          <h3>Siparişlerim</h3>
          {orders.length === 0 ? (
            <p>Henüz bir siparişiniz bulunmamaktadır.</p>
          ) : (
            <ul className="orderList">
              {orders.map((order) => (
                <li
                  key={order.id}
                  className={`orderItem ${selectedOrder?.id === order.id ? "selectedOrder" : ""}`}
                  onClick={() => handleOrderClick(order)}
                >
                  <strong>Sipariş ID:</strong> {order.id} <br />
                  <strong>Tarih:</strong>{" "}
                  {new Date(order.orderDate).toLocaleDateString()}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="orderDetailContainer">
          {selectedOrder ? (
            <div className="orderDetail">
              <h4>Sipariş Detayı</h4>
              <p>
                <strong>Sipariş ID:</strong> {selectedOrder.id}
              </p>
              <p>
                <strong>Tarih:</strong>{" "}
                {new Date(selectedOrder.orderDate).toLocaleDateString()}
              </p>
              <p>
                <strong>Toplam Tutar:</strong> {selectedOrder.totalPrice} TL
              </p>
              <p>
                <strong>Ürünler:</strong>
              </p>
              <ul>
                {selectedOrder.orderItems.map((item, index) => (
                  <li key={index}>
                    {item.productName} - {item.quantity} x {item.unitPrice} TL
                    (Toplam: {item.totalPrice} TL)
                  </li>
                ))}
              </ul>
              <button className="backButton" onClick={() => setSelectedOrder(null)}>
                Geri Dön
              </button>
            </div>
          ) : (
            <div className="noSelection">Bir sipariş seçin.</div>
          )}
        </div>
      </div>

      <button className="deleteButton" onClick={handleDeleteAccount}>
        HESABIMI SİL
      </button>
    </div>
  );
};

export default Profile;
