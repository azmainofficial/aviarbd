"use client";
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { apiUrl } from "@/lib/api";


interface Customer {
  id: number;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  city?: string;
  country?: string;
}

interface AuthContextType {
  customer: Customer | null;
  token: string | null;
  login: (token: string, customer: Customer) => void;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  customer: null,
  token: null,
  login: () => { },
  logout: () => { },
  loading: true,
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem("customer_token");
    if (storedToken) {
      setToken(storedToken);
      fetch(apiUrl("/customers/me"), {
        headers: { Authorization: `Bearer ${storedToken}` },
      })

        .then((res) => {
          if (res.ok) return res.json();
          throw new Error("Invalid token");
        })
        .then((data) => setCustomer(data))
        .catch(() => {
          localStorage.removeItem("customer_token");
          setToken(null);
          setCustomer(null);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = (newToken: string, newCustomer: Customer) => {
    localStorage.setItem("customer_token", newToken);
    setToken(newToken);
    setCustomer(newCustomer);
  };

  const logout = () => {
    if (token) {
      fetch(apiUrl("/customers/logout"), {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      }).catch(() => { });

    }
    localStorage.removeItem("customer_token");
    setToken(null);
    setCustomer(null);
  };

  return (
    <AuthContext.Provider value={{ customer, token, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
