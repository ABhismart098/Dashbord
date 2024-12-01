const express = require('express');
const multer = require('multer');
const {
  createEmployee,
  getEmployees,
  updateEmployee,
  deleteEmployee,
} = require('../controller/employee');
const signupControllerRoutes = express.Router();
const upload = multer({ dest: 'uploads/' });

signupControllerRoutes.post('/employees', upload.single('profileImage'), createEmployee);
signupControllerRoutes.get('/employees', getEmployees);
signupControllerRoutes.put('/employees/:id', upload.single('profileImage'), updateEmployee);
signupControllerRoutes.delete('/employees/:id', deleteEmployee);

module.exports = signupControllerRoutes;