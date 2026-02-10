import { useSelector } from "react-redux";

export const useToken = () => {
  const userSelect = useSelector((state: any) => state?.user);

  const isAuthenticated = userSelect?.token;
  return {
    userSession: userSelect,
    user: userSelect?.user,
    isAuthenticated,
  };
};