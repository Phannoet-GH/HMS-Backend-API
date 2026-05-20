import guestService from '../services/guest.service.js';
import response from '../utils/response.js';

export const createGuest = async (req, res, next) => {
  try {
    const guest = await guestService.createGuest(req.body);
    response.created(res, guest, 'Guest created successfully');
  } catch (error) {
    next(error);
  }
};

export const getGuests = async (req, res, next) => {
  try {
    const guests = await guestService.getGuests(req.query);
    response.ok(res, guests);
  } catch (error) {
    next(error);
  }
};

export const getGuestById = async (req, res, next) => {
  try {
    const guest = await guestService.getGuestById(req.params.id);
    response.ok(res, guest);
  } catch (error) {
    next(error);
  }
};

export const updateGuest = async (req, res, next) => {
  try {
    const guest = await guestService.updateGuest(req.params.id, req.body);
    response.ok(res, guest, 'Guest updated successfully');
  } catch (error) {
    next(error);
  }
};

export const deleteGuest = async (req, res, next) => {
  try {
    await guestService.deleteGuest(req.params.id);
    response.noContent(res);
  } catch (error) {
    next(error);
  }
};
