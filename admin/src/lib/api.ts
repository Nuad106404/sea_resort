const API_URL = import.meta.env.VITE_BACKEND_URL;

// Helper to get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('adminToken');
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

// Booking API
export const bookingAPI = {
  // Get all bookings
  getAll: async () => {
    const response = await fetch(`${API_URL}/api/bookings`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch bookings');
    }
    return response.json();
  },

  // Get booking by ID
  getById: async (id: string) => {
    const response = await fetch(`${API_URL}/api/bookings/${id}`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch booking');
    }
    return response.json();
  },

  // Update booking status
  updateStatus: async (id: string, status: string) => {
    const response = await fetch(`${API_URL}/api/bookings/${id}/status`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ status }),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to update booking status');
    }
    return response.json();
  },

  // Cancel booking
  cancel: async (id: string) => {
    const response = await fetch(`${API_URL}/api/bookings/${id}/cancel`, {
      method: 'PUT',
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to cancel booking');
    }
    return response.json();
  },

  // Update booking details
  update: async (id: string, data: any) => {
    const response = await fetch(`${API_URL}/api/bookings/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to update booking');
    }
    return response.json();
  },

  // Delete booking
  delete: async (id: string) => {
    const response = await fetch(`${API_URL}/api/bookings/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to delete booking');
    }
    return response.json();
  },
};

// Room API
export const roomAPI = {
  // Get all rooms
  getAll: async () => {
    const response = await fetch(`${API_URL}/api/rooms`);
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch rooms');
    }
    return response.json();
  },

  // Get room by ID
  getById: async (id: string) => {
    const response = await fetch(`${API_URL}/api/rooms/${id}`);
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch room');
    }
    return response.json();
  },

  // Create room with file upload
  create: async (formData: FormData) => {
    const token = localStorage.getItem('adminToken');
    const response = await fetch(`${API_URL}/api/rooms`, {
      method: 'POST',
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: formData,
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create room');
    }
    return response.json();
  },

  // Update room with file upload
  update: async (id: string, formData: FormData) => {
    const token = localStorage.getItem('adminToken');
    const response = await fetch(`${API_URL}/api/rooms/${id}`, {
      method: 'PUT',
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: formData,
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to update room');
    }
    return response.json();
  },

  // Delete room
  delete: async (id: string) => {
    const response = await fetch(`${API_URL}/api/rooms/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to delete room');
    }
    return response.json();
  },

  // Toggle availability
  toggleAvailability: async (id: string) => {
    const response = await fetch(`${API_URL}/api/rooms/${id}/toggle`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to toggle room availability');
    }
    return response.json();
  },
};
