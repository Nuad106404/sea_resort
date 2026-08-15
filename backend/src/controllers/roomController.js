import Room from '../models/Room.js';

// Get all rooms
export const getAllRooms = async (req, res) => {
  try {
    // If admin is authenticated, return all rooms; otherwise only available ones
    const filter = req.admin ? {} : { available: true };
    const rooms = await Room.find(filter).sort({ weekday_price: 1 });
    res.json(rooms);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get room by ID
export const getRoomById = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);
    
    if (!room) {
      return res.status(404).json({ error: 'Room not found' });
    }
    
    res.json(room);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get featured rooms (limit 3)
export const getFeaturedRooms = async (req, res) => {
  try {
    const rooms = await Room.find({ available: true })
      .sort({ weekday_price: 1 })
      .limit(3);
    res.json(rooms);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create new room (admin only)
export const createRoom = async (req, res) => {
  try {
    const roomData = {
      ...req.body,
      features: req.body.features ? JSON.parse(req.body.features) : [],
    };

    // Add main image URL if file was uploaded
    if (req.files && req.files.image && req.files.image[0]) {
      roomData.image_url = `/uploads/rooms/${req.files.image[0].filename}`;
    }

    // Add gallery images if files were uploaded
    if (req.files && req.files.images) {
      roomData.images = req.files.images.map(file => `/uploads/rooms/${file.filename}`);
    }

    const room = new Room(roomData);
    await room.save();
    res.status(201).json(room);
  } catch (error) {
    console.error('Room creation error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Update room (admin only)
export const updateRoom = async (req, res) => {
  try {
    const updateData = {
      ...req.body,
      features: req.body.features ? JSON.parse(req.body.features) : undefined,
    };

    // Add main image URL if new file was uploaded
    if (req.files && req.files.image && req.files.image[0]) {
      updateData.image_url = `/uploads/rooms/${req.files.image[0].filename}`;
    }

    // Add gallery images if new files were uploaded
    if (req.files && req.files.images) {
      const newImages = req.files.images.map(file => `/uploads/rooms/${file.filename}`);
      
      // If existing images are sent, merge them with new ones
      if (req.body.existingImages) {
        const existingImages = JSON.parse(req.body.existingImages);
        updateData.images = [...existingImages, ...newImages];
      } else {
        updateData.images = newImages;
      }
    } else if (req.body.existingImages) {
      // Keep existing images if no new images uploaded
      updateData.images = JSON.parse(req.body.existingImages);
    }

    const room = await Room.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );
    
    if (!room) {
      return res.status(404).json({ error: 'Room not found' });
    }
    
    res.json(room);
  } catch (error) {
    console.error('Room update error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Delete room (admin only)
export const deleteRoom = async (req, res) => {
  try {
    const room = await Room.findByIdAndDelete(req.params.id);
    
    if (!room) {
      return res.status(404).json({ error: 'Room not found' });
    }
    
    res.json({ message: 'Room deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Toggle room availability (admin only)
export const toggleRoomAvailability = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);
    
    if (!room) {
      return res.status(404).json({ error: 'Room not found' });
    }
    
    room.available = !room.available;
    await room.save();
    
    res.json(room);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
