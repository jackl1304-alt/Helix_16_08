import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface CustomerData {
  companyId: string;
  username: string;
  companyName: string;
  permissions: string[];
  theme: string;
  subscription: string;
}

interface CustomerTheme {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  text: string;
}

const themes: Record<string, CustomerTheme> = {
  blue: {
    primary: "bg-blue-600",
    secondary: "bg-blue-100", 
    accent: "text-blue-700",
    background: "bg-blue-50",
    text: "text-blue-900"
  },
  purple: {
    primary: "bg-purple-600",
    secondary: "bg-purple-100",
    accent: "text-purple-700", 
    background: "bg-purple-50",
    text: "text-purple-900"
  },
  green: {
    primary: "bg-green-600",
    secondary: "bg-green-100",
    accent: "text-green-700",
    background: "bg-green-50", 
    text: "text-green-900"
  }
};

interface CustomerContextType {
  customer: CustomerData | null;
  isAuthenticated: boolean;
  theme: CustomerTheme;
  login: (customerData: CustomerData) => void;
  logout: () => void;
  updateTheme: (themeName: string) => void;
  updateProfile: (updates: Partial<CustomerData>) => void;
  hasPermission: (permission: string) => boolean;
}

const CustomerContext = createContext<CustomerContextType | undefined>(undefined);

export function CustomerProvider({ children }: { children: ReactNode }) {
  const [customer, setCustomer] = useState<CustomerData | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const storedAuth = localStorage.getItem("customerAuthenticated");
    const storedCustomer = localStorage.getItem("customerData");
    
    if (storedAuth === "true" && storedCustomer) {
      try {
        const customerData = JSON.parse(storedCustomer);
        setCustomer(customerData);
        setIsAuthenticated(true);
      } catch (error) {
        console.error("Error parsing customer data:", error);
        logout();
      }
    }
  }, []);

  const login = (customerData: CustomerData) => {
    setCustomer(customerData);
    setIsAuthenticated(true);
  };

  const logout = () => {
    localStorage.removeItem("customerAuthenticated");
    localStorage.removeItem("customerData");
    localStorage.removeItem("customerLoginTime");
    setCustomer(null);
    setIsAuthenticated(false);
  };

  const updateTheme = (themeName: string) => {
    if (customer) {
      const updatedCustomer = { ...customer, theme: themeName };
      setCustomer(updatedCustomer);
      localStorage.setItem("customerData", JSON.stringify(updatedCustomer));
    }
  };

  const updateProfile = (updates: Partial<CustomerData>) => {
    if (customer) {
      const updatedCustomer = { ...customer, ...updates };
      setCustomer(updatedCustomer);
      localStorage.setItem("customerData", JSON.stringify(updatedCustomer));
    }
  };

  const hasPermission = (permission: string): boolean => {
    return customer?.permissions.includes(permission) || false;
  };

  const theme = customer ? themes[customer.theme] || themes.blue : themes.blue;

  return (
    <CustomerContext.Provider value={{
      customer,
      isAuthenticated,
      theme,
      login,
      logout,
      updateTheme,
      updateProfile,
      hasPermission
    }}>
      {children}
    </CustomerContext.Provider>
  );
}

export function useCustomer() {
  const context = useContext(CustomerContext);
  if (context === undefined) {
    throw new Error("useCustomer must be used within a CustomerProvider");
  }
  return context;
}