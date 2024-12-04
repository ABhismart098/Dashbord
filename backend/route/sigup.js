const express = require('express');
const {
  createEmployee,
  getEmployees,
  updateEmployee,
  deleteEmployee,
} = require('../controller/employee'); // Import employee controller functions
const { upload, handleUploadErrors } = require('../middleware/multer'); // Import multer middleware for file uploads

const router = express.Router(); // Initialize the router

/**
 * @route   POST /employees
 * @desc    Create a new employee with optional profile image upload
 * @access  Public
 */
router.post(
  '/employees',
  upload.single('profileImage'), // Handle single file upload
  handleUploadErrors, // Error handling middleware for uploads
  createEmployee // Controller function to handle employee creation
);

/**
 * @route   GET /employees
 * @desc    Retrieve the list of employees with optional search/filter
 * @access  Public
 */
router.get('/employees', getEmployees);

/**
 * @route   PUT /employees/:id
 * @desc    Update an employee's information, including profile image
 * @access  Public
 */
router.put(
  '/employees/:id',
  upload.single('profileImage'), // Handle single file upload
  handleUploadErrors, // Error handling middleware for uploads
  updateEmployee // Controller function to handle employee update
);

/**
 * @route   DELETE /employees/:id
 * @desc    Delete an employee by ID
 * @access  Public
 */
router.delete('/employees/:id', deleteEmployee);

module.exports = router; // Export the router