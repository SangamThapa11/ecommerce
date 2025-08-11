export interface IProductData {
    _id: string;
    name: string;
    slug: string;
    price: number;
    afterDiscount: number;
    images: Array<{
        imageUrl: string;
        publicId?: string;
        thumbUrl?: string;
        _id?: string;
    }>;
}

class ProductService {
    private baseUrl = 'http://localhost:9005/api/v1/product';

    async getProductsByCategory(categoryId: string): Promise<IProductData[]> {
        try {
            const response = await fetch(`${this.baseUrl}/category/${categoryId}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json"
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            return result.data;
        } catch (exception) {
            console.error("Error fetching products by category:", exception);
            throw exception;
        }
    }
}

const productSvc = new ProductService();
export default productSvc;