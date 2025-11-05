export interface ICatData {
    brands: Array<unknown>;
    createdAt: Date | string,
    createdBy: unknown,
    image: string, 
    inMenu: boolean,
    isFeatured: boolean,
    name: string,
    parentId: ICatData | null,
    slug: string,
    updatedAt: Date | null,
    updatedBy: null,
    _id: string 
}
export interface ICategory {
    _id: string;
    name: string;
    slug: string;
    image?: string;
    isFeatured?: boolean;
}
export interface IProductImage {
    imageUrl: string;
    thumbUrl: string;
}
export interface IProduct {
    _id: string;
    name: string;
    slug: string;
    category: Array<{
        _id: string;
        name: string;
        slug: string;
        image: string;
    }>;
    brand: {
        _id: string;
        name: string;
        slug: string;
        logo: string;
    };
    price: number;
    discount: number;
    afterDiscount: number;
    description: string;
    images: IProductImage[];
    isFeatured?: boolean;
    status: string;
    stock: number;
    sku: string;
    createdAt: Date | string;
    updatedAt: Date | string | null;
}
class CategoryService {
     getCategoryDetail = async (slug: string) => {
    try {
       const response = await fetch('http://localhost:9005/api/v1/category/' + slug, {
        method: "GET"
    })
    const result = await response.json(); 
    return result.data;
    }catch (exception){
        throw exception
    }
}

    getAllCatList = async() => {
        try {
            const response = await fetch('http://localhost:9005/api/v1/category/front', {
                method: "GET"
            })
            const result = await response.json();
            return result.data;
        }catch (exception) {
            throw exception;
        }
    }
     getProductsByCategory = async (slug: string) => {
        try {
            const response = await fetch(`http://localhost:9005/api/v1/product/front`, {
                method: "GET"
            });
            const result = await response.json();
            return result.data;
        } catch (exception) {
            throw exception;
        }
    }

    // Get single product detail (based on your Postman endpoint)
    getProductDetail = async (slug: string) => {
        try {
            const response = await fetch(`http://localhost:9005/api/v1/product/${slug}/detail`, {
                method: "GET"
            });
            const result = await response.json();
            return result.data;
        } catch (exception) {
            throw exception;
        }
    }
    searchProducts = async (query: string) => {
    try {
        const response = await fetch(`http://localhost:9005/api/v1/product/front`);
        const result = await response.json();
        return result.data;
    } catch (exception) {
        throw exception;
    }
    }
    getFeaturedProducts = async (limit: number = 6) => {
    try {
        const response = await fetch('http://localhost:9005/api/v1/product/front', {
            method: "GET"
        });
        const result = await response.json();
        
        // Filter featured products and limit results
        const featuredProducts = result.data
            .filter((product: IProduct) => product.isFeatured)
            .sort((a: IProduct, b: IProduct) => 
                new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            )
            .slice(0, limit);
            
        return featuredProducts;
    } catch (exception) {
        throw exception;
    }
}
}
const catSvc = new CategoryService();
export default catSvc; 