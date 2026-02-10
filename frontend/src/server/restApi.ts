import axios from "axios";

const send = async ({ method, url, token = "", data = {}, server }) => {
  try {
    const reqUrl = `${server}${url}`;
    const headers: any = {
      "Content-Type": "application/json",
    };

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
    console.log(reqUrl);
    // Make the HTTP request using Axios
    const response = await axios({
      method: method.toUpperCase(),
      url: reqUrl,
      headers,
      withCredentials: true,
      data: method.toUpperCase() !== "GET" ? data : undefined,
    });

    return response?.data;
  } catch (error: any) {
    if (error.response) {
      // Return an object for consistent structure
      return {
        message: error.response.data.message || "Request failed",
        success: false, // Indicate failure
      };
    } else if (error.request) {
      console.error("Error Request:", error.request);
      return {
        message: "No response from server. Please try again later.",
        success: false,
      };
    } else {
      console.error("Error Message:", error.message);
      return {
        message: "An unexpected error occurred. Please try again.",
        success: false,
      };
    }
  }
};

export const API_SERVICE = {
  get: ({ server, url, token = "" }) => {
    return send({ method: "GET", url, token, server });
  },
  post: ({ server, url, token = "", data = {} }) => {
    return send({
      method: "POST",
      url,
      token,
      data,
      server,
    });
  },
  delete: ({ server, url, token = "", data = {} }) => {
    return send({
      method: "DELETE",
      url,
      token,
      data,
      server,
    });
  },
  put: ({ server, url, token = "", data = {} }) => {
    return send({
      method: "PUT",
      url,
      token,
      data,
      server,
    });
  },
};