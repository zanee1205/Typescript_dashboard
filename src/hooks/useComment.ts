import { useQuery } from "@tanstack/react-query";
import { fetchComment } from "../api/commentApi";
import { commentKeys } from "../QueryKeys/CommentKeys";

export const useComment = () => {
    return useQuery({
        queryKey: commentKeys.all,
        queryFn: fetchComment,
        staleTime: 1000 *60 * 2,
    });
};