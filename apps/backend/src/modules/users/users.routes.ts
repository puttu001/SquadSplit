import { Router } from 'express';
import multer from 'multer';
import { usersController } from './users.controller';
import { authenticate } from '../../shared/middleware/auth.middleware';
import { validate } from '../../shared/middleware/validate.middleware';
import { updateProfileSchema, sendFriendRequestSchema, respondFriendRequestSchema } from './users.validation';

const upload = multer({
  storage: multer.memoryStorage(),
  limits:  { fileSize: 5 * 1024 * 1024 }, // 5 MB
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('Only image files are allowed'));
  },
});

const router = Router();

router.use(authenticate);

// Profile
router.get('/me',              usersController.getMe);
router.patch('/me',            validate(updateProfileSchema), usersController.updateProfile);
router.post('/me/avatar',      upload.single('avatar'), usersController.uploadAvatar);

// Search
router.get('/search', usersController.searchUsers);

// Push notifications
router.post('/me/fcm-token', usersController.registerFcmToken);

// Friends
router.get('/friends',                            usersController.getFriends);
router.get('/friends/requests',                   usersController.getPendingRequests);
router.delete('/friends/:friendId',               usersController.removeFriend);
router.post('/friends/request',                   validate(sendFriendRequestSchema), usersController.sendFriendRequest);
router.patch('/friends/request/:requestId',       validate(respondFriendRequestSchema), usersController.respondFriendRequest);

export default router;
