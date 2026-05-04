const router = require('express').Router();

const roomController = require('../controllers/room.controller');
const auth = require('../middlewares/auth.middleware');
const rbac = require('../middlewares/rbac.middleware');

router.get('/', auth, roomController.getRooms);
router.get('/:id', auth, roomController.getRoomById);
router.post('/', auth, rbac('r1'), roomController.createRoom);
router.patch('/:id', auth, rbac('r1'), roomController.updateRoom);
router.delete('/:id', auth, rbac('r1'), roomController.deleteRoom);

module.exports = router;
