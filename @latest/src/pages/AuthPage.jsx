import React, { useState, useContext } from "react";
import { UserContext } from "../context/UserContext";
import { useNavigate } from "react-router-dom";
import '../css/AuthPage.css'; 

const AuthPage = () => {
  const { setUser, user } = useContext(UserContext);
  const navigate = useNavigate();

  const [registerFormData, setRegisterFormData] = useState({
    name: "",
    email: "",
    password: "",
    address : "",
  });

  const [loginFormData, setLoginFormData] = useState({
    email: "",
    password: "",
  });

  const [isRegistering, setIsRegistering] = useState(false); // Separate loading state for registration
  const [isLoggingIn, setIsLoggingIn] = useState(false); // Separate loading state for login

  const handleRegisterChange = (e) => {
    setRegisterFormData({
      ...registerFormData,
      [e.target.name]: e.target.value,
    });
  };

  const handleLoginChange = (e) => {
    setLoginFormData({
      ...loginFormData,
      [e.target.name]: e.target.value,
    });
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setIsRegistering(true); // Set registering state to true
    try {
      const response = await fetch("http://localhost:9090/api/user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(registerFormData),
      });

      if (response.ok) {
        alert("User registered successfully!");
        setRegisterFormData({
          name: "",
          email: "",
          password: "",
          address: "",
        });
      } else {
        alert("Failed to register user. Please check your input.");
      }
    } catch (error) {
      console.error("Error registering user:", error);
      alert("An error occurred. Please try again later.");
    } finally {
      setIsRegistering(false); // Reset registering state
    }
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setIsLoggingIn(true); // Set logging in state to true

    try {
      const response = await fetch("http://localhost:9090/api/auth", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(loginFormData),
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data);
        alert("Giriş başarılı!");
        navigate("/home");
      } else {
        const errorData = await response.json();
        alert(errorData.message || "Giriş başarısız. Lütfen bilgilerinizi kontrol edin.");
      }
    } catch (error) {
      console.error("Error during login:", error);
      alert("Bir hata oluştu. Lütfen daha sonra tekrar deneyin.");
    } finally {
      setIsLoggingIn(false); // Reset logging in state
    }
  };

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem("token"); // Token'ı localStorage'dan alabilirsiniz.
      const response = await fetch("http://localhost:9090/api/auth/logout", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`, // Token'ı Authorization header olarak gönderin.
        },
      });

      if (response.ok) {
        setUser(null); // Kullanıcıyı çıkart
        alert("Başarıyla çıkış yapıldı.");
        navigate("/login"); // Giriş sayfasına yönlendirme yapabilirsiniz.
      } else {
        alert("Çıkış sırasında bir hata oluştu.");
      }
    } catch (error) {
      console.error("Error during logout:", error);
      alert("Bir hata oluştu. Lütfen daha sonra tekrar deneyin.");
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.authCard}>
        {/* Register Form */}
        {!user ? (
          <div style={styles.formContainer}>
            <h2 style={styles.title}>Kayıt Ol</h2>
            <form style={styles.form} onSubmit={handleRegisterSubmit}>
              <div style={styles.inputGroup}>
                <label style={styles.label}>İsim:</label>
                <input
                  style={styles.input}
                  type="text"
                  name="name"
                  value={registerFormData.name}
                  onChange={handleRegisterChange}
                  required
                />
              </div>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Email:</label>
                <input
                  style={styles.input}
                  type="email"
                  name="email"
                  value={registerFormData.email}
                  onChange={handleRegisterChange}
                  required
                />
              </div>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Şifre:</label>
                <input
                  style={styles.input}
                  type="password"
                  name="password"
                  value={registerFormData.password}
                  onChange={handleRegisterChange}
                  required
                />
              </div>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Adres:</label>
                <input
                  style={styles.input}
                  type="address"
                  name="address"
                  value={registerFormData.address}
                  onChange={handleRegisterChange}
                  required
                />
              </div>
              <button style={styles.button} type="submit" disabled={isRegistering}>
                {isRegistering ? "Kayıt Ediliyor" : "Kayıt Ol"}
              </button>
            </form>
          </div>
        ) : (
          <div style={styles.loggedIn}>
            <h2>Welcome, {user.name}!</h2>
            <button onClick={handleLogout} style={styles.button}>
              Logout
            </button>
          </div>
        )}

        {/* Divider */}
        <div style={styles.divider}>
          <span style={styles.dividerText}>VEYA</span>
        </div>

        {/* Login Form */}
        {!user && (
          <div style={styles.formContainer}>
            <h2 style={styles.title}>Giriş Yap</h2>
            <form style={styles.form} onSubmit={handleLoginSubmit}>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Email:</label>
                <input
                  style={styles.input}
                  type="email"
                  name="email"
                  value={loginFormData.email}
                  onChange={handleLoginChange}
                  required
                />
              </div>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Şifre:</label>
                <input
                  style={styles.input}
                  type="password"
                  name="password"
                  value={loginFormData.password}
                  onChange={handleLoginChange}
                  required
                />
              </div>
              <button style={styles.button} type="submit" disabled={isLoggingIn}>
                {isLoggingIn ? "Giriş Yapılyor" : "Giriş Yap"}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    minHeight: "100vh",
    // Soft background color
    padding: "1rem",
  },
  authCard: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF", // White card background
    borderRadius: "8px",
    boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)",
    width: "100%",
    maxWidth: "800px",
    overflow: "hidden",
  },
  formContainer: {
    flex: 1,
    padding: "2rem",
  },
  loggedIn: {
    flex: 1,
    padding: "2rem",
    textAlign: "center",
    color: "#2C698D", // Blue text color for welcome message
  },
  title: {
    textAlign: "center",
    marginBottom: "1.5rem",
    color: "#272643", // Dark color for titles
    fontSize: "1.8rem",
    fontWeight: "bold",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "1rem",
  },
  inputGroup: {
    display: "flex",  
    flexDirection: "column",
  },
  label: {
    marginBottom: "0.5rem",
    fontSize: "1rem",
    color: "#272643", // Dark color for labels
  },
  input: {
    padding: "0.8rem",
    fontSize: "1rem",
    border: "1px solid #BAE8E8", // Light teal border for inputs
    borderRadius: "4px",
    outline: "none",
    transition: "border 0.3s",
     // Soft background for inputs
  },
  button: {
    padding: "0.8rem",
    fontSize: "1rem",
    fontWeight: "bold",
    color: "#FFFFFF", // White text color
    backgroundColor: "#2C698D", // Blue background for buttons
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    transition: "background-color 0.3s",
  },
  buttonDisabled: {
    padding: "0.8rem",
    fontSize: "1rem",
    fontWeight: "bold",
    color: "#FFFFFF",
    backgroundColor: "#BAE8E8", // Lighter color when button is disabled
    border: "none",
    borderRadius: "4px",
    cursor: "not-allowed",
  },
  divider: {
    width: "1px",
    backgroundColor: "#BAE8E8", // Light teal divider color
    height: "100%",
    position: "relative",
  },
  dividerText: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    backgroundColor: "#FFFFFF",
    padding: "0 0.5rem",
    color: "#272643", // Dark color for divider text
    fontWeight: "bold",
  },
};


export default AuthPage;
