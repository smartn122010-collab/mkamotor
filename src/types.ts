/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Product {
  id?: string;
  name: string;
  image: string;
  price: number;
  rating: number;
  description: string;
  category: string;
  stockStatus: 'available' | 'unavailable';
  createdAt?: string;
}

export interface Offer {
  id?: string;
  code: string;
  description: string;
  discount: number; // percentage or flat
  expiryDate: string;
  createdAt?: string;
}

export interface Order {
  id?: string;
  customerName: string;
  customerContact: string;
  customerAddress: string;
  customerAge: number;
  productDetails: {
    productId: string;
    productName: string;
    price: number;
    category: string;
  };
  customerUid: string;
  status: 'pending' | 'confirmed' | 'sent';
  createdAt: string;
}

export interface Stats {
  totalStock: number;
  totalService: number;
  todaySale: number;
  monthSale: number;
  yearSale: number;
  updatedAt: string;
}

export interface AdminConfig {
  pinHash: string; // PIN hash or plain pin for simple comparison
  updatedAt: string;
}
