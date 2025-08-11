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
}
const catSvc = new CategoryService();
export default catSvc; 