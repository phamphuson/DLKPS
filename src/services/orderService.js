const prisma = require('../config/prisma');

const getAllOrders = async (requestingUser) => {
  const where = requestingUser.role === 'ADMIN' ? {} : { userId: requestingUser.userId };
  
  return await prisma.order.findMany({
    where,
    include: {
      user: {
        select: {
          fullName: true,
          email: true
        }
      },
      orderItems: {
        include: {
          product: {
            select: {
              name: true
            }
          }
        }
      },
      payment: true
    }
  });
};

const getOrderById = async (id, requestingUser) => {
  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      user: {
        select: {
          fullName: true,
          email: true
        }
      },
      orderItems: {
        include: {
          product: {
            select: {
              name: true
            }
          }
        }
      },
      payment: true
    }
  });

  if (!order) return null;

  // Ownership check
  if (requestingUser.role !== 'ADMIN' && order.userId !== requestingUser.userId) {
    throw new Error('Access denied: You can only view your own orders');
  }

  return order;
};

const cartService = require('./cartService');

const createOrder = async (orderData, requestingUser) => {
  // Force the userId to be the logged in user if not admin
  const userId = requestingUser.role === 'ADMIN' ? (orderData.userId || requestingUser.userId) : requestingUser.userId;
  const { totalAmount, orderItems, paymentMethod = 'COD' } = orderData;
  
  // Create order, orderItems, and Payment together in a transaction
  return await prisma.$transaction(async (tx) => {
    // 1. Check stock for each product
    for (const item of orderItems) {
      const product = await tx.product.findUnique({
        where: { id: item.productId },
        select: { stock: true, name: true }
      });

      if (!product) {
        throw new Error(`Product not found: ${item.productId}`);
      }

      if (product.stock < item.quantity) {
        throw new Error(`Insufficient stock for product: ${product.name}`);
      }
    }

    // 2. Create the order
    const order = await tx.order.create({
      data: {
        userId,
        totalAmount,
        status: 'PENDING',
        orderItems: {
          create: orderItems.map(item => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.price
          }))
        }
      },
      include: {
        orderItems: true
      }
    });

    // 3. Create the payment record
    await tx.payment.create({
      data: {
        orderId: order.id,
        amount: totalAmount,
        method: paymentMethod,
        status: 'PENDING'
      }
    });
    
    // 4. Update stock for each product
    for (const item of orderItems) {
      await tx.product.update({
        where: { id: item.productId },
        data: {
          stock: {
            decrement: item.quantity
          }
        }
      });
      
      // Also update inventory if it exists
      await tx.inventory.update({
        where: { productId: item.productId },
        data: {
          quantity: {
            decrement: item.quantity
          }
        }
      }).catch(() => {});
    }

    // 5. Clear the user's cart after successful order
    // Since we are in a transaction AND we need to deleteMany across another model,
    // we use the tx object directly for cart clearing too
    const userCart = await tx.cart.findUnique({ where: { userId } });
    if (userCart) {
      await tx.cartItem.deleteMany({
        where: { cartId: userCart.id }
      });
    }
    
    return order;
  });
};

const updateOrderStatus = async (id, status) => {
  return await prisma.order.update({
    where: { id },
    data: { status }
  });
};

const deleteOrder = async (id, requestingUser) => {
  const order = await prisma.order.findUnique({ where: { id } });
  if (!order) throw new Error('Order not found');

  // Ownership check
  if (requestingUser.role !== 'ADMIN' && order.userId !== requestingUser.userId) {
    throw new Error('Access denied: You can only delete your own orders');
  }

  await prisma.orderItem.deleteMany({
    where: { orderId: id }
  });
  
  return await prisma.order.delete({
    where: { id }
  });
};

module.exports = {
  getAllOrders,
  getOrderById,
  createOrder,
  updateOrderStatus,
  deleteOrder
};
