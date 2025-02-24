import express from 'express';
import { SharedResource } from '../models/SharedResource';
import { checkPermission } from '../middleware/check-permission';

const router = express.Router();

router.get('/resources', async (req, res) => {
  const businessId = req.headers['x-business-id'];
  
  const resources = await SharedResource.find({
    'access.businessId': businessId
  });
  
  res.json(resources);
});

router.post('/resources/share', checkPermission('resources', 'share'), 
  async (req, res) => {
    const { resourceId, businessId, permissions } = req.body;
    
    await SharedResource.findByIdAndUpdate(resourceId, {
      $push: { access: { businessId, permissions } }
    });
    
    res.json({ success: true });
  }
);

export default router; 