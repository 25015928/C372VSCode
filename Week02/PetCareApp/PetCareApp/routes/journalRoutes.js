const express = require('express');
const router = express.Router();
const journalController = require('../controllers/journalController');
const { isLoggedIn } = require('../middleware/auth');

router.get('/', isLoggedIn, journalController.listJournals);
router.get('/new', isLoggedIn, journalController.newJournalForm);
router.post('/new', isLoggedIn, journalController.createJournal);
router.get('/edit/:id', isLoggedIn, journalController.editJournalForm);
router.post('/edit/:id', isLoggedIn, journalController.updateJournal);
router.get('/delete/:id', isLoggedIn, journalController.deleteJournal);
router.get('/search', isLoggedIn, journalController.searchJournals);

module.exports = router;
