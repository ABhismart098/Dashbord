const Employee = require('../models/singup');
const cloudinary = require('../config/cloudinaryconnection'); // Cloudinary configuration
const { v4: uuidv4 } = require('uuid');

// Create Employee with optional image upload
exports.createEmployee = async (req, res) => {
  try {
    const { name, email, mobile, designation, gender, course } = req.body;

    // Upload image to Cloudinary if provided
    let imageUrl = '';
    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: 'employees', // Optional folder name
      });
      imageUrl = result.secure_url;
    }

    // Create a new employee
    const newEmployee = new Employee({
      
      employeeId: uuidv4(),
      profileImage: imageUrl,
      name,
      email,
      mobile,
      designation,
      gender,
      course
    });

    await newEmployee.save();
    res.status(201).json({ message: 'Employee created successfully', employee: newEmployee });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Get Employee List with Search and Filters
exports.getEmployees = async (req, res) => {
  try {
    const { search } = req.query;
    const query = search
      ? {
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
        ],
      }
      : {};

    const employees = await Employee.find(query);
    res.status(200).json(employees);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update Employee with optional image upload
exports.updateEmployee = async (req, res) => {
  try {
    const { id } = req.params;

    // Handle optional image upload
    let imageUrl = req.body.image; // Keep existing image if no new image uploaded
    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: 'employees',
      });
      imageUrl = result.secure_url;
    }

    const updatedEmployee = await Employee.findByIdAndUpdate(
      id,
      { ...req.body, image: imageUrl },
      { new: true, runValidators: true } // Return updated document and validate fields
    );

    if (!updatedEmployee) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    res.status(200).json({ message: 'Employee updated successfully', employee: updatedEmployee });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Delete Employee
exports.deleteEmployee = async (req, res) => {
  try {
    const { id } = req.params;

    const employee = await Employee.findByIdAndDelete(id);
    if (!employee) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    res.status(200).json({ message: 'Employee deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};