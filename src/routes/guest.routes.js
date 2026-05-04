const router = require('express').Router();

const guestController = require('../controllers/guest.controller');
const auth = require('../middlewares/auth.middleware');
const rbac = require('../middlewares/rbac.middleware');

router.get('/', auth, rbac('r1', 'r2'), guestController.getGuests);
router.post('/', auth, rbac('r1', 'r2'), guestController.createGuest);
router.patch('/:id', auth, rbac('r1', 'r2'), guestController.updateGuest);
router.delete('/:id', auth, rbac('r1'), guestController.deleteGuest);

module.exports = router;
