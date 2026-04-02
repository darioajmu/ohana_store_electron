export interface ProductEntity {
  id: number;
  name: string;
  price: number;
  price_members: number;
  price_tikis: number;
  photo_url: string | undefined;
  stockable: boolean;
}
