import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import Slider from "react-slick";
import '../css/Home.css';
import { UserContext } from "../context/UserContext";
import image1 from "/images/emin1.jpg";
import image2 from "/images/emin2.jpg";
import image3 from "/images/emin3.jpg";
import image4 from "/images/emin4.jpg";


// Slider settings
const sliderSettings = {
  dots: true,
  infinite: true,
  speed: 500,
  slidesToShow: 1,
  slidesToScroll: 1,
  autoplay: true,
  autoplaySpeed: 3000,
  arrows: true,
};

// Slider images (Placeholders for now)
const sliderImages = [
  { src: image1, productId: 21 },
  { src: image2, productId: 22 },
  { src: image3, productId: 23 },
  { src: image4, productId: 24 },
];

const Home = () => {
  const navigate = useNavigate();
  const { user } = useContext(UserContext); // User context for authentication
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [message, setMessage] = useState("");
  const [showNotification, setShowNotification] = useState(false);

  // Fetch products from API
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await fetch(`http://localhost:9090/api/product?page=${page}&size=10`);
        const data = await response.json();
        if (data && data.content) {
          setProducts(data.content);
          setTotalPages(data.totalPages);
        } else {
          console.error("API'den beklenen formatta veri alınamadı");
        }
      } catch (err) {
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [page]);

  // Add product to cart
  const addToCart = async (productId) => {
    const { prefix, token } = user.token;
    const url = `http://localhost:9090/api/cart/add?productId=${productId}&quantity=1`;

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          "Content-Type": "application/json",
          Authorization: `${prefix} ${token}`,
        },
      });

      if (response.ok) {
        setMessage('Ürün sepetinize başarıyla eklendi.');
        setShowNotification(true);
        setTimeout(() => setShowNotification(false), 3000); // Hide after 3 seconds
      } else {
        setMessage('Failed to add product to cart.');
        setShowNotification(true);
        setTimeout(() => setShowNotification(false), 3000);
      }
    } catch (error) {
      console.error('Error:', error);
      setMessage('Error occurred while adding product.');
      setShowNotification(true);
      setTimeout(() => setShowNotification(false), 3000);
    }
  };

  // Handle pagination
  const goToPreviousPage = () => {
    if (page > 0) setPage(page - 1);
  };

  const goToNextPage = () => {
    if (page < totalPages - 1) setPage(page + 1);
  };

  // Loading state
  if (loading) {
    return <div className="loading">Yükleniyor...</div>;
  }

  return (
    <div className="container">
      <div>
        <h2 className="title">Kırtasiyemize Hoşgeldiniz</h2>
        <Slider {...sliderSettings}>
          {sliderImages.map((image, index) => (
            <div key={index} className="slick-slide">
              <img
                src={image.src}
                alt={`Slide ${index + 1}`}
                className="slick-image"
                onClick={() => navigate(`/product/${image.productId}`)} // Navigate to product page
              />
            </div>
          ))}
        </Slider>
      </div>

      {/* Notification for product add to cart */}
      {showNotification && (
        <div className="notification">
          {message}
        </div>
      )}

      {/* Products Section */}
      <div className="productsContainer">
        <h3 className="subtitle">Ürünlerimiz</h3>
        <div className="products">
          {products.length > 0 ? (
            products.map((product) => (
              <div
                key={product.id}
                className="productCard"
                onClick={() => navigate(`/product/${product.id}`)}
              >
                <div className="productImageWrapper">
                  <img
                    src={`http://localhost:9090/api/product/${product.id}/image`}
                    alt={product.name}
                    className="productImage"
                  />
                  <button
                    className="addToCartButton"
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent triggering onClick of the product card
                      addToCart(product.id); // Add product to cart
                    }}
                  >
                    Sepete Ekle
                  </button>
                </div>
                <h4 className="productName">{product.name}</h4>
                <p className="productPrice">{product.price} TL</p>
              </div>
            ))
          ) : (
            <p>Ürün bulunamadı.</p>
          )}
        </div>
      </div>

      {/* Pagination Controls */}
      <div className="pagination">
        <button onClick={goToPreviousPage} disabled={page === 0}>
          Previous
        </button>
        <span>
          Page {page + 1} of {totalPages}
        </span>
        <button onClick={goToNextPage} disabled={page === totalPages - 1}>
          Next
        </button>
      </div>
    </div>
  );
};

export default Home;
