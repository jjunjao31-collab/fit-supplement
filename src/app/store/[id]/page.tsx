import type { Metadata } from 'next';
import { products } from '@/data/products';
import ProductDetailClient from '@/components/store/ProductDetailClient';

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateStaticParams() {
  return products.map((p) => ({ id: p.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const product = products.find((p) => p.id === id);
  if (!product) {
    return { title: 'รายละเอียดสินค้า' };
  }
  return {
    title: product.name,
    description: `${product.nameTH} — อย. ${product.fdaNumber} | ${product.suitableFor}`,
  };
}

export default async function StoreProductDetailPage({ params }: Props) {
  const { id } = await params;
  const initialProduct = products.find((p) => p.id === id) || null;
  return <ProductDetailClient productId={id} initialProduct={initialProduct} />;
}
