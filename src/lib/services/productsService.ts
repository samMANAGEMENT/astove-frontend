import api from '../axios';

export interface Product {
  id: string;
  code: string;
  name: string;
  description: string;
  price: number;
  image_url: string;
  min_quantity: number;
  multiple: number;
  category: string;
  brand: string;
  unit: string;
  weight: number;
  dimensions: string;
  sku: string;
  barcode: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface CreateProductData {
  code: string;
  name: string;
  description: string;
  price: number;
  min_quantity: number;
  multiple: number;
  category: string;
  brand: string;
  unit: string;
  weight: number;
  dimensions: string;
  sku: string;
  barcode: string;
  status: string;
  image?: File;
}

export interface UpdateProductData extends CreateProductData {}

const getAll = async (): Promise<Product[]> => {
  const response = await api.get('/products');
  return response.data;
};

const create = async (productData: CreateProductData): Promise<Product> => {
  const formData = new FormData();
  
  // Agregar todos los campos como form data
  Object.entries(productData).forEach(([key, value]) => {
    if (key === 'image' && value instanceof File) {
      formData.append(key, value);
    } else if (value !== undefined && value !== null) {
      formData.append(key, String(value));
    }
  });

  const response = await api.post('/products', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

const update = async (productId: string, productData: UpdateProductData): Promise<Product> => {
  const formData = new FormData();
  
  // Agregar todos los campos como form data
  Object.entries(productData).forEach(([key, value]) => {
    if (key === 'image' && value instanceof File) {
      formData.append(key, value);
    } else if (value !== undefined && value !== null) {
      formData.append(key, String(value));
    }
  });

  const response = await api.patch(`/products/${productId}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

const remove = async (productId: string): Promise<void> => {
  await api.delete(`/products/${productId}`);
};

export const productService = {
  getAll,
  create,
  update,
  delete: remove,
};

export default productService;
