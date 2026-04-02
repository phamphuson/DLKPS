const prisma = require('../config/prisma');

const getCart = async (userId) => {
  let cart = await prisma.cart.findUnique({
    where: { userId },
    include: {
      cartItems: {
        include: {
          product: {
            select: {
              id: true,
              name: true,
              price: true,
              stock: true
            }
          }
        }
      }
    }
  });

  // If cart doesn't exist, create it
  if (!cart) {
    cart = await prisma.cart.create({
      data: { userId },
      include: { cartItems: true }
    });
  }

  return cart;
};

const addToCart = async (userId, cartItemData) => {
  const { productId, quantity } = cartItemData;
  const cart = await getCart(userId);

  // Check if product exists and has stock
  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) throw new Error('Product not found');
  if (product.stock < quantity) throw new Error('Insufficient stock');

  // Check if item already exists in cart
  const existingItem = await prisma.cartItem.findFirst({
    where: { cartId: cart.id, productId }
  });

  if (existingItem) {
    return await prisma.cartItem.update({
      where: { id: existingItem.id },
      data: { quantity: existingItem.quantity + quantity }
    });
  }

  return await prisma.cartItem.create({
    data: {
      cartId: cart.id,
      productId,
      quantity
    }
  });
};

const updateCartItem = async (cartItemId, quantity, requestingUser) => {
  const cartItem = await prisma.cartItem.findUnique({ 
    where: { id: cartItemId },
    include: { cart: true }
  });

  if (!cartItem) throw new Error('Cart item not found');
  if (cartItem.cart.userId !== requestingUser.userId && requestingUser.role !== 'ADMIN') {
    throw new Error('Access denied');
  }

  return await prisma.cartItem.update({
    where: { id: cartItemId },
    data: { quantity }
  });
};

const removeFromCart = async (cartItemId, requestingUser) => {
  const cartItem = await prisma.cartItem.findUnique({ 
    where: { id: cartItemId },
    include: { cart: true }
  });

  if (!cartItem) throw new Error('Cart item not found');
  if (cartItem.cart.userId !== requestingUser.userId && requestingUser.role !== 'ADMIN') {
    throw new Error('Access denied');
  }

  return await prisma.cartItem.delete({
    where: { id: cartItemId }
  });
};

const clearCart = async (userId) => {
  const cart = await prisma.cart.findUnique({ where: { userId } });
  if (!cart) return;

  return await prisma.cartItem.deleteMany({
    where: { cartId: cart.id }
  });
};

module.exports = {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart
};
