const prisma = require('../config/prisma');

const getAllCategories = async () => {
  return await prisma.category.findMany({
    include: {
      products: {
        select: {
          name: true,
          price: true,
          stock: true
        }
      }
    }
  });
};

const getCategoryById = async (id) => {
  return await prisma.category.findUnique({
    where: { id },
    include: {
      products: {
        select: {
          id: true,
          name: true,
          price: true,
          stock: true
        }
      }
    }
  });
};

const createCategory = async (categoryData) => {
  const existingCategory = await prisma.category.findUnique({
    where: { name: categoryData.name }
  });

  if (existingCategory) {
    throw new Error('Category name already exists');
  }

  return await prisma.category.create({
    data: categoryData
  });
};

const updateCategory = async (id, categoryData) => {
  return await prisma.category.update({
    where: { id },
    data: categoryData
  });
};

const deleteCategory = async (id) => {
  const productCount = await prisma.product.count({
    where: { categoryId: id }
  });

  if (productCount > 0) {
    throw new Error('Cannot delete category with existing products');
  }

  return await prisma.category.delete({
    where: { id }
  });
};

module.exports = {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory
};
