const guestService = require('../services/guest.service');
const response = require('../utils/response');

exports.createGuest = async (req, res, next) => {
  try {
    const guest = await guestService.createGuest(req.body);
    response.created(res, guest, 'Guest created successfully');
  } catch (error) {
    next(error);
  }
};

exports.getGuests = async (req, res, next) => {
  try {
    const guests = await guestService.getGuests(req.query);
    response.ok(res, guests);
  } catch (error) {
    next(error);
  }
};

exports.updateGuest = async (req, res, next) => {
  try {
    const guest = await guestService.updateGuest(req.params.id, req.body);
    response.ok(res, guest, 'Guest updated successfully');
  } catch (error) {
    next(error);
  }
};

exports.deleteGuest = async (req, res, next) => {
  try {
    await guestService.deleteGuest(req.params.id);
    response.noContent(res);
  } catch (error) {
    next(error);
  }
};
