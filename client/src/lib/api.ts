const API_URL = import.meta.env.VITE_BACKEND_URL;

// Room API
export const roomAPI = {
  // Get all rooms
  getAll: async () => {
    const response = await fetch(`${API_URL}/api/rooms?_=${Date.now()}`);
    if (!response.ok) throw new Error('Failed to fetch rooms');
    return response.json();
  },

  // Get featured rooms
  getFeatured: async () => {
    const response = await fetch(`${API_URL}/api/rooms/featured?_=${Date.now()}`);
    if (!response.ok) throw new Error('Failed to fetch featured rooms');
    return response.json();
  },

  // Get room by ID
  getById: async (id: string) => {
    const response = await fetch(`${API_URL}/api/rooms/${id}?_=${Date.now()}`);
    if (!response.ok) throw new Error('Failed to fetch room');
    return response.json();
  },
};

// Booking API
export const bookingAPI = {
  // Create new booking
  create: async (bookingData: any) => {
    const response = await fetch(`${API_URL}/api/bookings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(bookingData),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create booking');
    }
    
    return response.json();
  },

  // Get booking by reference
  getByReference: async (reference: string) => {
    const response = await fetch(`${API_URL}/api/bookings/reference/${reference}`);
    if (!response.ok) throw new Error('Failed to fetch booking');
    return response.json();
  },

  // Get bookings by email
  getByEmail: async (email: string) => {
    const response = await fetch(`${API_URL}/api/bookings/email/${email}`);
    if (!response.ok) throw new Error('Failed to fetch bookings');
    return response.json();
  },

  // Check room availability
  checkAvailability: async (roomId: string, checkIn: string, checkOut: string) => {
    const response = await fetch(
      `${API_URL}/api/bookings/availability?room_id=${roomId}&check_in=${checkIn}&check_out=${checkOut}`
    );
    if (!response.ok) throw new Error('Failed to check availability');
    return response.json();
  },

  // Update booking
  update: async (id: string, data: any) => {
    const response = await fetch(`${API_URL}/api/bookings/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to update booking');
    }
    return response.json();
  },

  // Cancel booking
  cancel: async (id: string) => {
    const response = await fetch(`${API_URL}/api/bookings/${id}/cancel`, {
      method: 'PUT',
    });
    if (!response.ok) throw new Error('Failed to cancel booking');
    return response.json();
  },
};

// Bank Account API
export const bankAPI = {
  // Get active bank accounts (public)
  getActive: async () => {
    const response = await fetch(`${API_URL}/api/banks/active`);
    if (!response.ok) throw new Error('Failed to fetch bank accounts');
    return response.json();
  },
};
