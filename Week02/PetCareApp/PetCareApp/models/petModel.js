const connection = require('../config/db');

function createPet(ownerId, petName, species, breed, age, petImage, callback) {
  const sql = 'INSERT INTO pets (owner_id, name, species, breed, age, image) VALUES (?, ?, ?, ?, ?, ?)';
  connection.query(sql, [ownerId, petName, species, breed, age, petImage], callback);
}

function getPetsByOwnerId(userId, callback) {
  const sql = 'SELECT * FROM pets WHERE owner_id = ?';
  connection.query(sql, [userId], callback);
}

function getPetById(petId, callback) {
  const sql = 'SELECT * FROM pets WHERE id = ?';
  connection.query(sql, [petId], callback);
}

module.exports = {
  createPet,
  getPetsByOwnerId,
  getPetById
};
