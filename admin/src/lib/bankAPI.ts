const API_URL = import.meta.env.VITE_BACKEND_URL;

// Helper to get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('adminToken');
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

export const bankAPI = {
  // Get all bank accounts
  getAll: async () => {
    const response = await fetch(`${API_URL}/api/banks`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch bank accounts');
    }
    return response.json();
  },

  // Get bank account by ID
  getById: async (id: string) => {
    const response = await fetch(`${API_URL}/api/banks/${id}`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch bank account');
    }
    return response.json();
  },

  // Create bank account (JSON)
  create: async (data: any) => {
    const response = await fetch(`${API_URL}/api/banks`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create bank account');
    }
    return response.json();
  },

  // Create bank account with file
  createWithFile: async (formData: FormData) => {
    const token = localStorage.getItem('adminToken');
    const response = await fetch(`${API_URL}/api/banks`, {
      method: 'POST',
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: formData,
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create bank account');
    }
    return response.json();
  },

  // Update bank account with file
  updateWithFile: async (id: string, formData: FormData) => {
    const token = localStorage.getItem('adminToken');
    const response = await fetch(`${API_URL}/api/banks/${id}`, {
      method: 'PUT',
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: formData,
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to update bank account');
    }
    return response.json();
  },

  // Delete bank account
  delete: async (id: string) => {
    const response = await fetch(`${API_URL}/api/banks/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to delete bank account');
    }
    return response.json();
  },

  // Toggle active status
  toggleStatus: async (id: string) => {
    const response = await fetch(`${API_URL}/api/banks/${id}/toggle`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to toggle bank account status');
    }
    return response.json();
  },
};
