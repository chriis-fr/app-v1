import { Router } from 'express';
import { hasModuleAccess, hasRole } from '../auth';
import { POS, Customer, Transaction, Product } from '../mongodb/pos-models';
import { startSession } from 'mongoose';
import mongoose from 'mongoose';

// Define interfaces for populated documents
interface PopulatedCustomer {
  _id: mongoose.Types.ObjectId;
  name: string;
  email?: string;
  phone?: string;
}

interface PopulatedEmployee {
  _id: mongoose.Types.ObjectId;
  firstName: string;
  lastName: string;
}

interface PopulatedProduct {
  _id: mongoose.Types.ObjectId;
  name: string;
  price: number;
}

const router = Router();

// Get all products
router.get('/products',
  hasModuleAccess('pos'),
  async (req, res) => {
    try {
      if (!req.user?.organizationId) {
        return res.status(401).json({ message: 'Unauthorized access' });
      }
      const products = await Product.find({
        organizationId: req.user.organizationId,
        status: 'available'
      }).sort({ name: 1 });
      res.json(products);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching products' });
    }
});

// Get all POS orders
router.get('/orders',
  hasModuleAccess('order_management'),
  async (req, res) => {
    try {
      if (!req.user?.organizationId) {
        return res.status(401).json({ message: 'Unauthorized access' });
      }
      const orders = await POS.find({
        organizationId: req.user.organizationId
      })
      .populate('customerId', 'name email')
      .populate('employeeId', 'firstName lastName')
      .populate('items.productId')
      .sort({ createdAt: -1 });
      res.json(orders);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching orders' });
    }
});

// 1. Start POS Transaction (Create a New Sale)
router.post('/sale/start',
  hasModuleAccess('pos'),
  async (req, res) => {
    try {
      if (!req.user?.organizationId) {
        return res.status(401).json({ message: 'Unauthorized access' });
      }

      // Create initial sale with empty items
      const saleId = `POS-${Date.now()}`;
      const newSale = new POS({
        orderId: saleId,
        items: [],
        subtotal: 0,
        tax: 0,
        discount: 0,
        total: 0,
        employeeId: req.user.id,
        organizationId: req.user.organizationId,
        status: 'draft',
        paymentStatus: 'pending',
        counterId: req.body.counterId || 'default'
      });

      await newSale.save();
      res.status(201).json({ 
        saleId: newSale._id, 
        orderId: saleId,
        message: 'Sale session started successfully' 
      });
    } catch (error) {
      console.error('Error starting sale:', error);
      res.status(500).json({ message: 'Error starting sale session' });
    }
});

// 2. Add Items to Cart
router.post('/sale/:saleId/items',
  hasModuleAccess('pos'),
  async (req, res) => {
    try {
      if (!req.user?.organizationId) {
        return res.status(401).json({ message: 'Unauthorized access' });
      }

      const { productId, quantity } = req.body;
      
      // Validate input
      if (!productId || !quantity || quantity <= 0) {
        return res.status(400).json({ message: 'Invalid product or quantity' });
      }

      // Find the product
      const product = await Product.findById(productId);
      if (!product) {
        return res.status(404).json({ message: 'Product not found' });
      }

      // Check if product belongs to user's organization
      if (product.organizationId.toString() !== req.user.organizationId.toString()) {
        return res.status(403).json({ message: 'Unauthorized access to product' });
      }

      // Check stock availability
      if (product.stock_quantity < quantity) {
        return res.status(400).json({ message: 'Insufficient stock' });
      }

      // Find the sale
      const sale = await POS.findById(req.params.saleId);
      if (!sale) {
        return res.status(404).json({ message: 'Sale not found' });
      }

      // Check if sale belongs to user's organization
      if (sale.organizationId.toString() !== req.user.organizationId.toString()) {
        return res.status(403).json({ message: 'Unauthorized access to sale' });
      }

      // Check if product already exists in cart
      const existingItemIndex = sale.items.findIndex(item => 
        item.productId.toString() === productId
      );

      if (existingItemIndex > -1) {
        // Update existing item
        sale.items[existingItemIndex].quantity += quantity;
        sale.items[existingItemIndex].total = 
          sale.items[existingItemIndex].quantity * 
          sale.items[existingItemIndex].unitPrice;
      } else {
        // Add new item
        const taxRate = 0.16; // Default tax rate, can be retrieved from product or settings
        const newItem = {
          productId,
          quantity,
          unitPrice: product.price,
          taxRate,
          discount: 0,
          total: quantity * product.price
        };
        sale.items.push(newItem);
      }

      // Recalculate totals
      sale.subtotal = sale.items.reduce((sum, item) => sum + item.total, 0);
      sale.tax = sale.items.reduce((sum, item) => sum + (item.total * item.taxRate), 0);
      sale.total = sale.subtotal + sale.tax - sale.discount;

      await sale.save();

      // Populate product details
      const updatedSale = await POS.findById(sale._id)
        .populate('items.productId')
        .populate('customerId', 'name email');

      res.json(updatedSale);
    } catch (error) {
      console.error('Error adding item to cart:', error);
      res.status(500).json({ message: 'Error adding item to cart' });
    }
});

// 3. View Cart
router.get('/sale/:saleId/cart',
  hasModuleAccess('pos'),
  async (req, res) => {
    try {
      if (!req.user?.organizationId) {
        return res.status(401).json({ message: 'Unauthorized access' });
      }

      const sale = await POS.findById(req.params.saleId)
        .populate('items.productId')
        .populate('customerId', 'name email');

      if (!sale) {
        return res.status(404).json({ message: 'Sale not found' });
      }

      // Check if sale belongs to user's organization
      if (sale.organizationId.toString() !== req.user.organizationId.toString()) {
        return res.status(403).json({ message: 'Unauthorized access to sale' });
      }

      res.json(sale);
    } catch (error) {
      console.error('Error fetching cart:', error);
      res.status(500).json({ message: 'Error fetching cart' });
    }
});

// 4. Remove Item from Cart
router.delete('/sale/:saleId/items/:itemId',
  hasModuleAccess('pos'),
  async (req, res) => {
    try {
      if (!req.user?.organizationId) {
        return res.status(401).json({ message: 'Unauthorized access' });
      }

      const sale = await POS.findById(req.params.saleId);
      if (!sale) {
        return res.status(404).json({ message: 'Sale not found' });
      }

      // Check if sale belongs to user's organization
      if (sale.organizationId.toString() !== req.user.organizationId.toString()) {
        return res.status(403).json({ message: 'Unauthorized access to sale' });
      }

      try {
        // Find the item and remove it directly - circumvent TypeScript issues
        const itemIdToRemove = new mongoose.Types.ObjectId(req.params.itemId);
        await POS.updateOne(
          { _id: sale._id },
          { $pull: { items: { _id: itemIdToRemove } } }
        );
        
        // Reload the sale to get the updated items array
        const updatedSale = await POS.findById(sale._id);
        if (!updatedSale) {
          return res.status(404).json({ message: 'Sale not found after update' });
        }
        
        // Recalculate totals on the updated document
        updatedSale.subtotal = updatedSale.items.reduce((sum, item) => sum + item.total, 0);
        updatedSale.tax = updatedSale.items.reduce((sum, item) => sum + (item.total * item.taxRate), 0);
        updatedSale.total = updatedSale.subtotal + updatedSale.tax - updatedSale.discount;
        
        await updatedSale.save();
        
        // Return the updated and populated sale
        const populatedSale = await POS.findById(updatedSale._id)
          .populate('items.productId')
          .populate('customerId', 'name email');
          
        res.json(populatedSale);
        return;
      } catch (err) {
        console.error('Error with MongoDB $pull operation:', err);
        // Fallback using a different approach if the $pull operation fails
        if (sale.items && Array.isArray(sale.items)) {
          // Filter items manually and reassign (this will trigger TypeScript errors but will work)
          const filteredItems = sale.items.filter(item => 
            item._id.toString() !== req.params.itemId
          );
          // @ts-ignore - We know this isn't type-safe but it's a fallback
          sale.items = filteredItems;
          
          // Recalculate totals
          sale.subtotal = sale.items.reduce((sum, item) => sum + item.total, 0);
          sale.tax = sale.items.reduce((sum, item) => sum + (item.total * item.taxRate), 0);
          sale.total = sale.subtotal + sale.tax - sale.discount;
          
          await sale.save();
          
          // Populate product details
          const updatedSale = await POS.findById(sale._id)
            .populate('items.productId')
            .populate('customerId', 'name email');
            
          res.json(updatedSale);
          return;
        }
        // If all else fails, return an error
        return res.status(500).json({ message: 'Could not remove item from cart' });
      }
    } catch (error) {
      console.error('Error removing item from cart:', error);
      res.status(500).json({ message: 'Error removing item from cart' });
    }
});

// 5. Apply Discount
router.post('/sale/:saleId/discount',
  hasModuleAccess('pos'),
  async (req, res) => {
    try {
      if (!req.user?.organizationId) {
        return res.status(401).json({ message: 'Unauthorized access' });
      }

      const { discountAmount, discountType } = req.body;
      
      if (!discountAmount || discountAmount < 0) {
        return res.status(400).json({ message: 'Invalid discount amount' });
      }

      const sale = await POS.findById(req.params.saleId);
      if (!sale) {
        return res.status(404).json({ message: 'Sale not found' });
      }

      // Check if sale belongs to user's organization
      if (sale.organizationId.toString() !== req.user.organizationId.toString()) {
        return res.status(403).json({ message: 'Unauthorized access to sale' });
      }

      // Apply discount
      if (discountType === 'percentage') {
        // Percentage discount (e.g. 10%)
        const percentage = Math.min(discountAmount, 100) / 100; // Ensure max 100%
        sale.discount = sale.subtotal * percentage;
      } else {
        // Fixed amount discount
        sale.discount = Math.min(discountAmount, sale.subtotal); // Can't discount more than subtotal
      }

      // Recalculate total
      sale.total = sale.subtotal + sale.tax - sale.discount;

      await sale.save();
      res.json(sale);
    } catch (error) {
      console.error('Error applying discount:', error);
      res.status(500).json({ message: 'Error applying discount' });
    }
});

// 6. Apply Payment
router.post('/sale/:saleId/payment',
  hasModuleAccess('pos'),
  async (req, res) => {
    const session = await startSession();
    session.startTransaction();

    try {
      if (!req.user?.organizationId) {
        return res.status(401).json({ message: 'Unauthorized access' });
      }

      const { paymentMethod, amount, paymentDetails, customerId } = req.body;
      
      const sale = await POS.findById(req.params.saleId);
      if (!sale) {
        return res.status(404).json({ message: 'Sale not found' });
      }

      // Check if sale belongs to user's organization
      if (sale.organizationId.toString() !== req.user.organizationId.toString()) {
        return res.status(403).json({ message: 'Unauthorized access to sale' });
      }

      // Verify payment amount
      if (amount < sale.total) {
        return res.status(400).json({ message: 'Insufficient payment amount' });
      }

      // Update sale with payment info
      sale.paymentMethod = paymentMethod;
      sale.paymentStatus = 'paid';
      sale.status = 'completed';
      sale.customerId = customerId || null;
      sale.updated_at = new Date();

      await sale.save({ session });

      // Create transaction record
      const transaction = new Transaction({
        type: 'sale',
        amount: sale.total,
        description: `POS Sale ${sale.orderId}`,
        reference: sale.orderId,
        organizationId: req.user.organizationId,
        status: 'completed',
        paymentMethod,
        paymentDetails
      });

      await transaction.save({ session });

      // Update product stock levels
      for (const item of sale.items) {
        await Product.findByIdAndUpdate(
          item.productId,
          { $inc: { stock_quantity: -item.quantity } },
          { session }
        );
      }

      // Update customer's total purchases if customer exists
      if (customerId) {
        await Customer.findByIdAndUpdate(
          customerId,
          {
            $inc: { totalPurchases: sale.total },
            lastPurchaseDate: new Date()
          },
          { session }
        );
      }

      await session.commitTransaction();

      res.json({ 
        message: 'Payment processed successfully',
        transactionId: transaction._id,
        saleId: sale._id,
        orderId: sale.orderId,
        receiptUrl: `/pos/sale/${sale._id}/receipt`
      });
    } catch (error) {
      await session.abortTransaction();
      console.error('Error processing payment:', error);
      res.status(500).json({ message: 'Error processing payment' });
    } finally {
      session.endSession();
    }
});

// 7. Generate Receipt
router.get('/sale/:saleId/receipt',
  hasModuleAccess('pos'),
  async (req, res) => {
    try {
      if (!req.user?.organizationId) {
        return res.status(401).json({ message: 'Unauthorized access' });
      }

      const sale = await POS.findById(req.params.saleId)
        .populate('items.productId')
        .populate('customerId', 'name email phone')
        .populate('employeeId', 'firstName lastName');

      if (!sale) {
        return res.status(404).json({ message: 'Sale not found' });
      }

      // Check if sale belongs to user's organization
      if (sale.organizationId.toString() !== req.user.organizationId.toString()) {
        return res.status(403).json({ message: 'Unauthorized access to sale' });
      }

      // Create receipt data object
      const receipt = {
        orderId: sale.orderId,
        date: sale.created_at,
        customer: sale.customerId ? (() => {
          // Cast populated document to access properties safely
          const populatedCustomer = sale.customerId as any;
          return {
            name: populatedCustomer.name || 'Unknown',
            email: populatedCustomer.email || '',
            phone: populatedCustomer.phone || ''
          };
        })() : null,
        cashier: sale.employeeId ? (() => {
          // Cast populated document to access properties safely
          const populatedEmployee = sale.employeeId as any;
          return `${populatedEmployee.firstName || ''} ${populatedEmployee.lastName || ''}`;
        })() : 'Unknown',
        items: sale.items.map(item => {
          // Cast populated document to access properties safely
          const populatedProduct = item.productId as any;
          return {
            product: populatedProduct.name || 'Product',
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            total: item.total
          };
        }),
        subtotal: sale.subtotal,
        tax: sale.tax,
        discount: sale.discount,
        total: sale.total,
        paymentMethod: sale.paymentMethod,
        blockchainReceipt: {
          enabled: false, // Placeholder for blockchain receipt functionality
          transactionHash: null
        }
      };

      res.json(receipt);
    } catch (error) {
      console.error('Error generating receipt:', error);
      res.status(500).json({ message: 'Error generating receipt' });
    }
});

// 8. Save Sale Data (Complete Transaction)
router.post('/sale/:saleId/complete',
  hasModuleAccess('pos'),
  async (req, res) => {
    try {
      if (!req.user?.organizationId) {
        return res.status(401).json({ message: 'Unauthorized access' });
      }

      const sale = await POS.findById(req.params.saleId);
      if (!sale) {
        return res.status(404).json({ message: 'Sale not found' });
      }

      // Check if sale belongs to user's organization
      if (sale.organizationId.toString() !== req.user.organizationId.toString()) {
        return res.status(403).json({ message: 'Unauthorized access to sale' });
      }

      // Only mark as completed if not already completed
      if (sale.status !== 'completed') {
        sale.status = 'completed';
        sale.updated_at = new Date();
        await sale.save();
      }

      res.json({ 
        message: 'Sale completed successfully',
        saleId: sale._id,
        orderId: sale.orderId
      });
    } catch (error) {
      console.error('Error completing sale:', error);
      res.status(500).json({ message: 'Error completing sale' });
    }
});

// Create new POS order - Keep this for backward compatibility
router.post('/orders',
  hasModuleAccess('order_management'),
  async (req, res) => {
    const session = await startSession();
    session.startTransaction();

    try {
      if (!req.user?.organizationId) {
        return res.status(401).json({ message: 'Unauthorized access' });
      }

      const { items, customerId, paymentMethod, notes } = req.body;

      // Calculate totals
      const subtotal = items.reduce((sum: number, item: any) => 
        sum + (item.quantity * item.unitPrice), 0);
      
      const tax = items.reduce((sum: number, item: any) => 
        sum + (item.quantity * item.unitPrice * item.taxRate), 0);
      
      const discount = items.reduce((sum: number, item: any) => 
        sum + item.discount, 0);
      
      const total = subtotal + tax - discount;

      // Create POS order
      const order = new POS({
        orderId: `POS-${Date.now()}`,
        items,
        subtotal,
        tax,
        discount,
        total,
        customerId,
        employeeId: req.user.id,
        paymentMethod,
        notes,
        organizationId: req.user.organizationId,
        status: 'pending',
        paymentStatus: 'pending'
      });

      await order.save({ session });

      // Update product stock levels
      for (const item of items) {
        await Product.findByIdAndUpdate(
          item.productId,
          { $inc: { stock_quantity: -item.quantity } },
          { session }
        );
      }

      // Create transaction record
      const transaction = new Transaction({
        type: 'sale',
        amount: total,
        description: `POS Order ${order.orderId}`,
        reference: order.orderId,
        organizationId: req.user.organizationId,
        status: 'completed'
      });

      await transaction.save({ session });

      // Update customer's total purchases if customer exists
      if (customerId) {
        await Customer.findByIdAndUpdate(
          customerId,
          {
            $inc: { totalPurchases: total },
            lastPurchaseDate: new Date()
          },
          { session }
        );
      }

      await session.commitTransaction();
      res.status(201).json(order);
    } catch (error) {
      await session.abortTransaction();
      res.status(500).json({ message: 'Error creating order' });
    } finally {
      session.endSession();
    }
});

// Update order status
router.patch('/orders/:id/status',
  hasModuleAccess('order_management'),
  hasRole(['admin', 'manager']),
  async (req, res) => {
    try {
      if (!req.user?.organizationId) {
        return res.status(401).json({ message: 'Unauthorized access' });
      }
      const order = await POS.findOneAndUpdate(
        {
          _id: req.params.id,
          organizationId: req.user.organizationId
        },
        {
          status: req.body.status,
          updated_at: new Date()
        },
        { new: true }
      );
      if (!order) {
        return res.status(404).json({ message: 'Order not found' });
      }
      res.json(order);
    } catch (error) {
      res.status(500).json({ message: 'Error updating order status' });
    }
});

// Get POS transactions for a business
router.get('/transactions',
  hasModuleAccess('pos'),
  async (req, res) => {
    try {
      if (!req.user?.organizationId) {
        return res.status(401).json({ message: 'Unauthorized access' });
      }
      
      const transactions = await Transaction.find({ 
        organizationId: req.user.organizationId 
      })
        .sort({ created_at: -1 })
        .limit(100);
        
      res.json(transactions);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching transactions' });
    }
});

// Create new POS transaction
router.post('/transaction',
  hasModuleAccess('pos'),
  async (req, res) => {
    try {
      if (!req.user?.organizationId) {
        return res.status(401).json({ message: 'Unauthorized access' });
      }
      
      const transactionData = {
        ...req.body,
        organizationId: req.user.organizationId
      };
      
      const transaction = await Transaction.create(transactionData);
      
      res.json(transaction);
    } catch (error) {
      res.status(500).json({ message: 'Error creating transaction' });
    }
});

export default router; 