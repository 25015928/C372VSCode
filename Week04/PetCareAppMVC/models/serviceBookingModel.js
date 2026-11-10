const connection = require('../config/db');

function finalizeTransaction(callback, err, value, finalize) {
  if (finalize) {
    finalize(err, value);
    return;
  }

  callback(err, value);
}

function createPendingBooking(ownerId, petId, serviceId, bookingDate, callback) {
  let transactionCompleted = false;

  function finish(err, result) {
    if (transactionCompleted) return;
    transactionCompleted = true;
    callback(err, result);
  }

  connection.beginTransaction((beginErr) => {
    if (beginErr) {
      return finish(beginErr);
    }

    connection.query(
      'SELECT id FROM pets WHERE id = ? AND owner_id = ?',
      [petId, ownerId],
      (petErr, petRows) => {
        if (petErr) {
          return connection.rollback(() => finish(petErr));
        }

        if (!petRows || petRows.length === 0) {
          return connection.rollback(() => finish(null, null));
        }

        connection.query(
          'SELECT id, price FROM services WHERE id = ? AND is_active = 1',
          [serviceId],
          (serviceErr, serviceRows) => {
            if (serviceErr) {
              return connection.rollback(() => finish(serviceErr));
            }

            if (!serviceRows || serviceRows.length === 0) {
              return connection.rollback(() => finish(null, null));
            }

            const bookedPrice = serviceRows[0].price;
            const bookingSql = `
              INSERT INTO service_bookings (pet_id, service_id, booking_status, booked_price, booking_date)
              VALUES (?, ?, 'pending', ?, ?)
            `;

            connection.query(bookingSql, [petId, serviceId, bookedPrice, bookingDate], (insertErr, bookingResult) => {
              if (insertErr) {
                return connection.rollback(() => finish(insertErr));
              }

              const bookingId = bookingResult && bookingResult.insertId;
              if (!bookingId) {
                return connection.rollback(() => finish(new Error('Booking insert did not return an id.')));
              }

              const paymentSql = `
                INSERT INTO payments (booking_id, amount, payment_status, payment_reference)
                VALUES (?, ?, 'pending', NULL)
              `;

              connection.query(paymentSql, [bookingId, bookedPrice], (paymentErr, paymentResult) => {
                if (paymentErr) {
                  return connection.rollback(() => finish(paymentErr));
                }

                if (!paymentResult || !paymentResult.insertId) {
                  return connection.rollback(() => finish(new Error('Payment insert did not return an id.')));
                }

                connection.commit((commitErr) => {
                  if (commitErr) {
                    return connection.rollback(() => finish(commitErr));
                  }

                  finish(null, { bookingId, paymentId: paymentResult.insertId });
                });
              });
            });
          }
        );
      }
    );
  });
}

function getBookingsByOwner(ownerId, callback) {
  const sql = `
    SELECT
      sb.id AS booking_id,
      DATE(sb.booking_date) AS booking_date,
      pets.name AS pet_name,
      services.name AS service_name,
      sb.booked_price,
      sb.booking_status,
      payments.payment_status
    FROM service_bookings AS sb
    JOIN pets ON pets.id = sb.pet_id
    JOIN services ON services.id = sb.service_id
    LEFT JOIN payments ON payments.booking_id = sb.id
    WHERE pets.owner_id = ?
    ORDER BY sb.created_at DESC, sb.id DESC
  `;

  connection.query(sql, [ownerId], callback);
}

module.exports = {
  createPendingBooking,
  getBookingsByOwner
};
