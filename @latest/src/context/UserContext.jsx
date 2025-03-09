import React, { createContext, useState, useEffect, useContext } from "react";

const UserContext = createContext(); // Context oluştur

const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null); // Kullanıcı bilgisi

  useEffect(() => {
    // Sayfa yenilendiğinde localStorage'dan kullanıcı bilgisini al
    const storedUser = JSON.parse(localStorage.getItem('user'));
    if (storedUser) {
      setUser(storedUser);
    }
  }, []);

  useEffect(() => {
    // Kullanıcı bilgisi değiştiğinde localStorage'a kaydet
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    }
  }, [user]);

  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
};

export { UserContext };
export default UserProvider; // Default export
