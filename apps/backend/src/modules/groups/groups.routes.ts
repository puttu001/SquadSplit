import { Router } from 'express';
import multer from 'multer';
import { groupsController } from './groups.controller';
import { authenticate } from '../../shared/middleware/auth.middleware';
import { validate } from '../../shared/middleware/validate.middleware';
import { createGroupSchema, updateGroupSchema, addMemberSchema } from './groups.validation';

const upload = multer({
  storage: multer.memoryStorage(),
  limits:  { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('Only image files are allowed'));
  },
});

const router = Router();

router.use(authenticate);

router.get('/',                          groupsController.list);
router.post('/',   validate(createGroupSchema), groupsController.create);
router.get('/:id',                       groupsController.getOne);
router.patch('/:id',        validate(updateGroupSchema), groupsController.update);
router.post('/:id/image',  upload.single('image'),      groupsController.uploadImage);
router.delete('/:id/archive',            groupsController.archive);

router.post('/:id/members',   validate(addMemberSchema), groupsController.addMember);
router.delete('/:id/members/:userId',    groupsController.removeMember);
router.delete('/:id/leave',              groupsController.leave);
router.patch('/:id/members/:userId/admin', groupsController.assignAdmin);

router.patch('/:id/settle',              groupsController.toggleSettle);
router.post('/join/:code',               groupsController.joinByInvite);

export default router;
