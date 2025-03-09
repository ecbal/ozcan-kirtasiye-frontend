import React, { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { UserContext } from "../context/UserContext";
import "../css/Navbar.css"; // CSS dosyasını ekliyoruz

const Navbar = () => {
  const { user, setUser } = useContext(UserContext);
  const [isAdminMenuOpen, setIsAdminMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false); // Kullanıcı menüsü durumu
  const navigate = useNavigate();

  const handleLogout = () => {
    setUser(null);
    navigate("/home");
    alert("Başarıyla çıkış yapıldı!");
  };

  return (
    <nav className="navbar">
      <div className="logo-container">
        <h1 className="logo">Özcan Kırtasiye</h1>
      </div>
      <ul className="nav-links">
        <li>
          <Link to="/home" className="link">Anasayfa</Link>
        </li>
        {/* Sadece kullanıcı giriş yaptıysa Cart ve Profile görünür */}
        {user && (
          <>
            <li>
              <Link to="/cart" className="link">Sepet</Link>
            </li>
            
          </>
        )}
        <li>
          <Link to="/categories" className="link">Kategoriler</Link>
        </li>
        {user && user.userCreate.role === "ADMIN" && (
          <li
            className="admin-menu"
            onMouseEnter={() => setIsAdminMenuOpen(true)}
            onMouseLeave={() => setIsAdminMenuOpen(false)}
          >
            <span className="link">Admin Panel</span>
            {isAdminMenuOpen && (
              <ul className="dropdown-menu">
                <li>
                  <Link to="/productEdit" className="link">Ürün İşlemleri</Link>
                </li>
                <li>
                  <Link to="/userEdit" className="link">Kullanıcı İşlemleri</Link>
                </li>
                <li>
                  <Link to="/categoryEdit" className="link">Kategori İşlemleri</Link>
                </li>
                <li>
                  <Link to="/orders" className="link">Siparişlerim</Link>
                </li>
              </ul>
            )}
          </li>
        )}
        {user ? (
          <li
            className="user-menu"
            onMouseEnter={() => setIsUserMenuOpen(true)}
            onMouseLeave={() => setIsUserMenuOpen(false)}
          >
            <span className="username">{user.userCreate.name}</span>
            {isUserMenuOpen && (
              <ul className="dropdown-menu">
                <li>
                  <Link to="/profile" className="link">Profil</Link>
                </li>
                <li>
                  <span onClick={handleLogout} className="logout-link">Çıkış</span>
                </li>
              </ul>
            )}
          </li>
        ) : (
          <li>
            <Link to="/authpage" className="link">Giriş Yap</Link>
          </li>
        )}
      </ul>
    </nav>
  );
};

export default Navbar;
