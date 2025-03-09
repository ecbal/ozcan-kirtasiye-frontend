import React, { useEffect, useState, useContext } from 'react';
import { UserContext } from '../context/UserContext';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const { user } = useContext(UserContext);

  const fetchOrders = async (page) => {
    console.log(user);
    const { prefix, token } = user.token;
    setLoading(true);

    try {
      const response = await fetch(`http://localhost:9090/api/orders/get-all-orders?page=${page}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `${prefix} ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Siparişler alınamadı');
      }

      const data = await response.json();
      setOrders(data.content);
      setTotalPages(data.totalPages);
    } catch (error) {
      console.error('Siparişler alınamadı:', error);
    } finally {
      setLoading(false);
    }
  };

  const cancelOrder = async (orderId) => {
    try {
      const response = await fetch(`http://localhost:9090/api/orders/cancelByAdmin?orderId=${orderId}`, {
        method: 'PUT',
        headers: {
          "Content-Type": "application/json",
          Authorization: `${user.token.prefix} ${user.token.token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Sipariş iptal edilemedi');
      }

      alert(`Sipariş ${orderId} başarıyla iptal edildi.`);
      fetchOrders(page);
    } catch (error) {
      console.error('Sipariş iptal edilemedi:', error);
      alert('Sipariş iptal edilemedi. Lütfen tekrar deneyin.');
    }
  };

  useEffect(() => {
    if (user) {
      fetchOrders(page);
    }
  }, [page, user]);

  return (
    <div style={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
      <div style={{ width: '90%', maxWidth: '1200px' }}> {/* Tablo genişliğini sınırladık */}
        <h1 style={{ textAlign: 'center' }}>Siparişler</h1>
        {loading ? (
          <p style={{ textAlign: 'center' }}>Yükleniyor...</p>
        ) : (
          <div>
            <table style={{ width: '100%', borderCollapse: 'collapse' }} border="1">
              <thead>
                <tr>
                  <th>Sipariş ID</th>
                  <th>Müşteri</th>
                  <th>Tarih</th>
                  <th>Durum</th>
                  <th>İşlemler</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id}>
                    <td>{order.id}</td>
                    <td>{order.user.name}</td>
                    <td>{order.orderDate}</td>
                    <td>{order.status}</td>
                    <td>
                      <button
                        onClick={() => cancelOrder(order.id)}
                        disabled={order.status === 'Cancelled'}
                      >
                        İptal Et
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div style={{ textAlign: 'center', marginTop: '20px' }}>
              <button
                disabled={page === 0}
                onClick={() => setPage((prev) => prev - 1)}
                style={{ marginRight: '10px' }}
              >
                Önceki
              </button>
              <span>
                Sayfa {page + 1} / {totalPages}
              </span>
              <button
                disabled={page === totalPages - 1}
                onClick={() => setPage((prev) => prev + 1)}
                style={{ marginLeft: '10px' }}
              >
                Sonraki
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Orders;
