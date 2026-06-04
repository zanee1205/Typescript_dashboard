export interface Recipe {
    id: number;
    name: string;
    ingredients: string[];
    instructions: string[];
    tags: string[];
    cuisine: string;
    mealType: string[];
    image: string;
}