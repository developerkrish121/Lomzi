import { categoryRepository } from '@/repositories/categoryRepository.js';

export const categoryService = {
  list() {
    return categoryRepository.findAll();
  },
};
