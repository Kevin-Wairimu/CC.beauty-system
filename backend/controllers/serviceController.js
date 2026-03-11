import Service from '../models/Service.js';

// @desc    Get all services
export const getServices = async (req, res) => {
  try {
    const services = await Service.find({});
    res.json(services);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a service
export const createService = async (req, res) => {
  try {
    const { name, category, price, description } = req.body;
    const service = new Service({ name, category, price, description });
    const createdService = await service.save();
    res.status(201).json(createdService);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Update a service
export const updateService = async (req, res) => {
  try {
    const { name, category, price, description } = req.body;
    const service = await Service.findById(req.params.id);

    if (service) {
      service.name = name || service.name;
      service.category = category || service.category;
      service.price = price || service.price;
      service.description = description || service.description;

      const updatedService = await service.save();
      res.json(updatedService);
    } else {
      res.status(404).json({ message: 'Service not found' });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Delete a service
export const deleteService = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);
    if (service) {
      await service.deleteOne();
      res.json({ message: 'Service removed' });
    } else {
      res.status(404).json({ message: 'Service not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
