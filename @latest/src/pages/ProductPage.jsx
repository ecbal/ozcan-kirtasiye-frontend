import React, { useState, useEffect, useContext } from "react";
import { useParams } from "react-router-dom";
import { UserContext } from "../context/UserContext";
import '../css/ProductPage.css'; // CSS dosyasını import ettik

const ProductPage = () => {
  const { productId } = useParams(); // URL'den ürün id'sini al
  const { user } = useContext(UserContext); // UserContext'ten giriş yapmış kullanıcı bilgilerini al
  const [product, setProduct] = useState(null); // Ürün bilgisi için state
  const [loading, setLoading] = useState(true); // Yükleniyor durumu
  const [error, setError] = useState(null); // Hata durumu
  const [quantity, setQuantity] = useState(1); // Adet durumu
  const [message, setMessage] = useState(""); // Sepet mesajı
  const [comments, setComments] = useState([]); // Yorumlar için state
  const [commentLoading, setCommentLoading] = useState(true); // Yorumlar yükleniyor durumu
  const [commentError, setCommentError] = useState(null); // Yorumlar hata durumu
  const [newComment, setNewComment] = useState(""); // Yeni yorum için state
  const [commentSubmissionMessage, setCommentSubmissionMessage] = useState(""); // Yorum gönderme mesajı

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const response = await fetch(`http://localhost:9090/api/product/${productId}`);

        if (!response.ok) {
          throw new Error("Ürün bilgisi alınamadı.");
        }
        const data = await response.json();
        setProduct(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    const fetchComments = async () => {
      try {
        setCommentLoading(true);
        const response = await fetch(`http://localhost:9090/api/comments/product/${productId}`);

        if (!response.ok) {
          throw new Error("Yorumlar alınamadı.");
        }
        const data = await response.json();
        setComments(data);
      } catch (err) {
        setCommentError(err.message);
      } finally {
        setCommentLoading(false);
      }
    };

    fetchProduct();
    fetchComments();
  }, [productId]);

  const handleAddToCart = async () => {
    if (!user) {
      setMessage("Giriş yapmalısınız.");
      return;
    }

    const { prefix, token } = user.token;
    try {
      const response = await fetch(`http://localhost:9090/api/cart/add?productId=${productId}&quantity=${quantity}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `${prefix} ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Sepete eklenirken bir hata oluştu.");
      }

      setMessage("Ürün sepete başarıyla eklendi.");
    } catch (err) {
      setMessage(`Hata: ${err.message}`);
    }
  };

  const handleCommentSubmit = async () => {
    if (!user) {
      setCommentSubmissionMessage("Yorum yapabilmek için giriş yapmalısınız.");
      return;
    }

    if (!newComment.trim()) {
      setCommentSubmissionMessage("Yorum boş olamaz.");
      return;
    }

    const { prefix, token } = user.token;

    try {
      const response = await fetch(`http://localhost:9090/api/comments?productId=${productId}&text=${newComment}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `${prefix} ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Yorum gönderilemedi.");
      }

      const data = await response.json();
      const commentWithUsername = {
        ...data,
        username: user.userCreate.username,
      };

      setComments((prevComments) => [...prevComments, commentWithUsername]);
      setNewComment("");
      setCommentSubmissionMessage("Yorum başarıyla gönderildi.");
    } catch (err) {
      setCommentSubmissionMessage(`Hata: ${err.message}`);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!user) {
      setCommentSubmissionMessage("Yorum silmek için giriş yapmalısınız.");
      return;
    }

    const { prefix, token } = user.token;
    const isAdmin = user.userCreate.role === "ADMIN";

    const endpoint = isAdmin
      ? `http://localhost:9090/api/comments/admin/${commentId}`
      : `http://localhost:9090/api/comments/${commentId}`;

    try {
      const response = await fetch(endpoint, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `${prefix} ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Yorum silinemedi.");
      }

      setComments(comments.filter((comment) => comment.id !== commentId));
      setCommentSubmissionMessage("Yorum başarıyla silindi.");
    } catch (err) {
      setCommentSubmissionMessage(`Hata: ${err.message}`);
    }
  };

  if (loading) {
    return <div>Yükleniyor...</div>;
  }

  if (error) {
    return <div>Hata: {error}</div>;
  }

  if (!product) {
    return <div>Ürün bulunamadı.</div>;
  }

  return (
    <div className="product-page">
  <div className="product-details">
    {/* Ürün Resmi */}
    <div className="product-image">
      <img
        src={`http://localhost:9090/api/product/${productId}/image`}
        alt={product.name}
        className="product-image-img"
      />
    </div>

    {/* Ürün Bilgileri */}
    <div className="product-info">
      <h1 className="product-name">{product.name}</h1>
      <p className="product-description">{product.description}</p>
      <h3 className="product-price">Fiyat: {product.price.toFixed(2)} TL</h3>
      <p className="product-stock">
        Stok Durumu: {product.stockQuantity > 0 ? `${product.stockQuantity} adet` : "Stokta yok"}
      </p>
      {product.category && <p className="product-category">Kategori: {product.category.name}</p>}

      {/* Adet Seçimi */}
      <div className="quantity-container">
        <label>Adet: </label>
        <input
          type="number"
          value={quantity}
          onChange={(e) => setQuantity(Number(e.target.value))}
          min="1"
          max={product.stockQuantity}
          className="quantity-input"
        />
      </div>

      {/* Sepete Ekle Butonu */}
      <button onClick={handleAddToCart} className="add-to-cart-button">
        Sepete Ekle
      </button>
      {message && <div className="message">{message}</div>}
    </div>
  </div>

  {/* Yorumlar Bölümü */}
  <div className="comments-container">
    <h3>Yorumlar</h3>
    {commentLoading ? (
      <div>Yorumlar yükleniyor...</div>
    ) : commentError ? (
      <div>Hata: {commentError}</div>
    ) : comments.length === 0 ? (
      <div>Henüz yorum yapılmamış.</div>
    ) : (
      <ul className="comments-list">
        {comments.map((comment) => (
          <li key={comment.id} className="comment-item">
            <p className="comment-user">{comment.username}</p>
            <p>{comment.commentText}</p>
            <p className="comment-date">
              {new Date(comment.createdAt).toLocaleString()}
            </p>

            {/* Yorum silme butonu */}
            {user && (comment.userId === user.userCreate.id || user.userCreate.role === "ADMIN") && (
              <button onClick={() => handleDeleteComment(comment.id)} className="comment-button">
                Yorum Sil
              </button>
            )}
          </li>
        ))}
      </ul>
    )}

    {/* Yorum Yapma Alanı */}
    {user ? (
      <div className="comment-submit-container">
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Yorumunuzu buraya yazın..."
          rows="4"
          className="comment-input"
        />
        <button onClick={handleCommentSubmit} className="comment-submit-button">
          Yorum Gönder
        </button>
        {commentSubmissionMessage && <div>{commentSubmissionMessage}</div>}
      </div>
    ) : (
      <div>Yorum yapabilmek için giriş yapmalısınız.</div>
    )}
  </div>
</div>

  );
};

export default ProductPage;
