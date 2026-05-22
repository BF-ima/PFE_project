const router = require('express').Router();
const ctrl   = require('../controllers/deliverableDeadlineController');

router.get('/my-teams',     ctrl.getMyTeamsDeadlines);
router.get('/for-student',  ctrl.getDeadlinesForStudent);
router.post('/',            ctrl.setDeadline);
router.delete('/:id',       ctrl.deleteDeadline);

module.exports = router;