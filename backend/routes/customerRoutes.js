const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/customerController');

router.get('/', ctrl.getAllCustomers);
router.post('/', ctrl.createCustomer);
router.get('/:id', ctrl.getCustomerById);
router.put('/:id', ctrl.updateCustomer);
router.delete('/:id', ctrl.deleteCustomer);

module.exports = router;
