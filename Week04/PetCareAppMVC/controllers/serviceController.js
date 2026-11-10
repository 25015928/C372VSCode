const petModel = require('../models/petModel');
const serviceModel = require('../models/serviceModel');
const serviceBookingModel = require('../models/serviceBookingModel');

function getLocalDateString(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function parsePositiveInteger(value) {
  if (value === undefined || value === null || value === '') return null;
  const numericValue = Number(value);
  return Number.isInteger(numericValue) && numericValue > 0 ? numericValue : null;
}

function isValidBookingDate(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  const [year, month, day] = value.split('-').map(Number);
  const candidateDate = new Date(`${value}T00:00:00`);

  if (Number.isNaN(candidateDate.getTime())) {
    return false;
  }

  if (
    candidateDate.getFullYear() !== year ||
    candidateDate.getMonth() + 1 !== month ||
    candidateDate.getDate() !== day
  ) {
    return false;
  }

  return value >= getLocalDateString(new Date());
}

function listServices(req, res) {
  const userId = req.session.user.id;
  const requestedPetId = req.query.petId;

  petModel.getPetsByOwner(userId, (petErr, pets) => {
    if (petErr) {
      console.error('Error loading pets:', petErr);
      return res.status(500).send('Unable to load pets.');
    }

    const petList = pets || [];
    const validPetId = petList.some((pet) => String(pet.id) === String(requestedPetId))
      ? String(requestedPetId)
      : '';

    serviceModel.getActiveServices((serviceErr, services) => {
      if (serviceErr) {
        console.error('Error loading services:', serviceErr);
        return res.status(500).send('Unable to load services.');
      }

      return res.render('services', {
        pets: pets || [],
        services: services || [],
        selectedPetId: validPetId,
        today: getLocalDateString(new Date()),
        messages: req.flash('success'),
        errors: req.flash('error'),
        session: req.session
      });
    });
  });
}

function createBooking(req, res) {
  const userId = req.session.user.id;
  const petId = parsePositiveInteger(req.body.petId);
  const serviceId = parsePositiveInteger(req.body.serviceId);
  const bookingDate = req.body.bookingDate;

  if (petId === null || serviceId === null || !isValidBookingDate(bookingDate)) {
    req.flash('error', 'Choose a pet, service, and valid booking date.');
    return res.redirect('/services');
  }

  serviceBookingModel.createPendingBooking(userId, petId, serviceId, bookingDate, (err, createdBooking) => {
    if (err) {
      console.error('Error creating booking:', err);
      req.flash('error', 'Unable to create the booking. Please try again.');
      const redirectPath = petId ? `/services?petId=${petId}` : '/services';
      return res.redirect(redirectPath);
    }

    if (!createdBooking) {
      req.flash('error', 'That pet or service is unavailable for booking.');
      return res.redirect('/services');
    }

    req.flash('success', 'Booking created. Payment is pending; no payment has been processed.');
    return res.redirect('/bookings');
  });
}

function listBookings(req, res) {
  const userId = req.session.user.id;

  serviceBookingModel.getBookingsByOwner(userId, (err, bookings) => {
    if (err) {
      console.error('Error loading booking history:', err);
      return res.status(500).send('Unable to load booking history.');
    }

    return res.render('bookings', {
      bookings: bookings || [],
      messages: req.flash('success'),
      errors: req.flash('error'),
      session: req.session
    });
  });
}

module.exports = {
  listServices,
  createBooking,
  listBookings,
  getLocalDateString,
  parsePositiveInteger,
  isValidBookingDate
};
