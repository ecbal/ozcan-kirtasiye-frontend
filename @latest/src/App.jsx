import React from "react";
import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Categories from "./pages/Categories";
import Cart from "./pages/Cart";
import CategoryProducts from "./pages/CategoryProducts";
import Home from "./pages/Home";
import AuthPage from "./pages/AuthPage";
import ProductPage from "./pages/ProductPage";
import AdminPanel from "./pages/AdminPanel";
import UserProvider from "./context/UserContext"; 
import Profile from './pages/Profile';
import ProductEdit from './pages/ProductEdit';
import UserEdit from './pages/UserEdit';
import CategoryEdit from "./pages/CategoryEdit"; 
import Orders from "./pages/Orders"; 

import { fetchUsers,createUser,deleteUser } from "./services/userService"; // Import context provider

const App = () => {
  return (
    <UserProvider>
      <Navbar />
      <Routes>
        <Route path="/home" element={<Home />} />
        <Route path="/categories" element={<Categories />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/category/:categoryId" element={<CategoryProducts />} />
        <Route path="/authpage" element={<AuthPage />} />
        <Route path="/product/:productId" element={<ProductPage />} />
        <Route path="/admin" element={<AdminPanel />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/productEdit" element={<ProductEdit />} />
        <Route path="/userEdit" element={<UserEdit />} />
        <Route path="/categoryEdit" element={<CategoryEdit />} />
        <Route path="/orders" element={<Orders />} />
        
      </Routes>
    </UserProvider>
  );
};

export default App;
