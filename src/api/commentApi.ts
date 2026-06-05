// đây là chỗ Typescript infer cho toàn bộ data, sử dụng TanStack query

import type { Comment } from "../types/comment";

export const fetchComment = async (): Promise<Comment[]> => {
    const res = await fetch("https://jsonplaceholder.typicode.com/comments");

    if (!res.ok) {
        throw new Error("Failed to fetch comments");
    } else {
        return res.json();
    }
};