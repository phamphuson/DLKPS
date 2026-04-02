const prisma = require('../config/prisma');

const getAllProducts = async () => {
  return await prisma.product.findMany({
    include: {
      category: {
        select: {
          name: true,
          description: true
        }
      }
    }
  });
};

const getProductById = async (id) => {
  return await prisma.product.findUnique({
    where: { id },
    include: {
      category: {
        select: {
          name: true,
          description: true
        }
      },
      inventory: true,
      reviews: {
        include: {
          user: {
            select: {
              fullName: true
            }
          }
        }
      }
    }
  });
};

const createProduct = async (productData) => {
  if (productData.price <= 0) {
    throw new Error('Price must be greater than zero');
  }

  return await prisma.$transaction(async (tx) => {
    const product = await tx.product.create({
      data: productData
    });

    // Automatically create inventory record
    await tx.inventory.create({
      data: {
        productId: product.id,
        quantity: product.stock,
        location: 'Default Warehouse'
      }
    });

    return product;
  });
};

const updateProduct = async (id, productData) => {
  return await prisma.product.update({
    where: { id },
    data: productData
  });
};

const deleteProduct = async (id) => {
  return await prisma.product.delete({
    where: { id }
  });
};

module.exports = {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct
};
