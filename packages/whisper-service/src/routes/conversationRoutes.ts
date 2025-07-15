import { Router, type IRouter } from 'express';
import { ConversationController } from '../controllers/ConversationController.js';
import { authenticateToken } from '../middleware/auth.js';

const router: IRouter = Router();
const conversationController = new ConversationController();

// 所有路由都需要认证
router.use(authenticateToken);

// 对话管理
router.get('/', conversationController.getConversations);
router.post('/', conversationController.createConversation);
router.get('/:id', conversationController.getConversation);
router.put('/:id', conversationController.updateConversation);
router.delete('/:id', conversationController.deleteConversation);

// 对话操作
router.post('/:id/pin', conversationController.togglePin);
router.post('/:id/star', conversationController.toggleStar);

// 消息管理
router.get('/:id/messages', conversationController.getConversationMessages);
router.post('/:id/messages', conversationController.sendMessage);

export default router;
