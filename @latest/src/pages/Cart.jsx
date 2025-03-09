import React, { useEffect, useState, useContext } from "react";
import { UserContext } from "../context/UserContext";
import '../css/Cart.css';  // CSS dosyasını import ettik.

const Cart = () => {
  const [cartItems, setCartItems] = useState([]);
  const [totalPrice, setTotalPrice] = useState(0);
  const { user } = useContext(UserContext);

  useEffect(() => {
    const fetchCartItems = async () => {
      if (!user || !user.token) {
        console.error("User or token is not available.");
        return;
      }

      const { prefix, token } = user.token;

      try {
        const response = await fetch("http://localhost:9090/api/cart", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `${prefix} ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        setCartItems(data.items);
        setTotalPrice(data.totalCartPrice);
      } catch (error) {
        console.error("Error fetching cart items:", error);
      }
    };

    fetchCartItems();
  }, [user]);

  const handleRemove = async (productId) => {
    if (!user || !user.token) {
      console.error("User or token is not available.");
      return;
    }

    const { prefix, token } = user.token;

    try {
      const response = await fetch(`http://localhost:9090/api/cart/remove?productId=${productId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `${prefix} ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Error removing product. status: ${response.status}`);
      }

      const updatedCart = await response.json();
      setCartItems(updatedCart.items);
      setTotalPrice(updatedCart.totalCartPrice);
    } catch (error) {
      console.error("Error removing product:", error);
      alert("Error removing product. Please try again.");
    }
  };

  const handleUpdate = async (productId, quantity) => {
    if (!user || !user.token) {
      console.error("User or token is not available.");
      return;
    }

    const { prefix, token } = user.token;

    try {
      const response = await fetch(`http://localhost:9090/api/cart/update?productId=${productId}&quantity=${quantity}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `${prefix} ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Error updating product. status: ${response.status}`);
      }

      const updatedCart = await response.json();
      setCartItems(updatedCart.items);
      setTotalPrice(updatedCart.totalCartPrice);
    } catch (error) {
      console.error("Error updating product:", error);
      alert("Error updating product. Please try again.");
    }
  };

  const handleIncrement = (productId, quantity) => {
    handleUpdate(productId, quantity + 1);
  };

  const handleDecrement = (productId, quantity) => {
    if (quantity > 1) {
      handleUpdate(productId, quantity - 1);
    }
  };

  const handleQuantityChange = (productId, quantity) => {
    if (quantity > 0) {
      handleUpdate(productId, quantity);
    }
  };

  const handleCheckout = async () => {
    if (!user || !user.token) {
      console.error("User or token is not available.");
      return;
    }

    const { prefix, token } = user.token;

    try {
      const response = await fetch("http://localhost:9090/api/cart/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `${prefix} ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Checkout failed! status: ${response.status}`);
      }

      const result = await response.text();
      alert(result);
      setCartItems([]);
      setTotalPrice(0);
    } catch (error) {
      console.error("Error during checkout:", error);
      alert("Checkout failed. Please try again.");
    }
  };

  return (
    <div className="cart-container">
      <h2 className="cart-title">Sepetiniz</h2>
      <div className="cart-list">
        {cartItems.length > 0 ? (
          cartItems.map((item) => (
            <div key={item.productId} className="cart-item">
              <img
                src={`http://localhost:9090/api/product/${item.productId}/image`}
                alt={item.productName}
              />
              <div className="item-details">
                <h3>{item.productName}</h3>
                <p>Fiyat: {item.unitPrice.toFixed(2)} TL</p>
                <p>Aratoplam: {item.totalPrice.toFixed(2)} TL</p>
                <div className="quantity-control">
                  <button
                    className="quantity-button"
                    onClick={() => handleDecrement(item.productId, item.quantity)}
                  >
                    -
                  </button>
                  <input
                    type="number"
                    value={item.quantity}
                    min="1"
                    className="quantity-input"
                    onChange={(e) => handleQuantityChange(item.productId, parseInt(e.target.value))}
                  />
                  <button
                    className="quantity-button"
                    onClick={() => handleIncrement(item.productId, item.quantity)}
                  >
                    +
                  </button>
                </div>
              </div>
              <div className="actions">
                <button
                  className="remove-button"
                  onClick={() => handleRemove(item.productId)}
                >
                  Kaldır
                </button>
              </div>
            </div>
          ))
        ) : (
          <p className="empty-cart">Sepetiniz boş.</p>
        )}
      </div>
      <div className="total">
        <h3>Toplam:{totalPrice.toFixed(2)} TL</h3>
      </div>
      {cartItems.length > 0 && (
        <button className="checkout-button" onClick={handleCheckout}>
          Sepeti Onayla
        </button>
      )}
    </div>
  );
};

export default Cart;
