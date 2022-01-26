import { createSlice } from "@reduxjs/toolkit";
import commentService from "../services/comment.service";
import { nanoid } from "nanoid";

const commentsSlice = createSlice({
    name: "comments",
    initialState: {
        entities: null,
        isLoading: true,
        error: null
    },
    reducers: {
        commentsRequested: (state) => {
            state.isLoading = true;
        },
        commentsReceived: (state, action) => {
            state.entities = action.payload;
            state.isLoading = false;
        },
        commentsRequestFailed: (state, action) => {
            state.error = action.payload;
            state.isLoading = false;
        },
        commentCreatedSucessfully: (state, action) => {
            state.entities.push(action.payload);
        },
        commentCreationFailed: (state, action) => {
            state.error = action.payload;
            state.isLoading = false;
        },
        commentDeletedSuccessfully: (state, action) => {
            state.entities = state.entities.filter(
                (c) => c._id !== action.payload
            );
        },
        commentDeletionFailed: (state, action) => {
            state.error = action.payload;
            state.isLoading = false;
        }
    }
});

const { reducer: commentsReducer, actions } = commentsSlice;
const {
    commentsRequested,
    commentsReceived,
    commentsRequestFailed,
    commentCreatedSucessfully,
    commentCreationFailed,
    commentDeletedSuccessfully,
    commentDeletionFailed
} = actions;

export const loadCommentsList = (userId) => async (dispatch) => {
    dispatch(commentsRequested());
    try {
        const { content } = await commentService.getComments(userId);
        dispatch(commentsReceived(content));
    } catch (error) {
        dispatch(commentsRequestFailed(error.message));
    }
};

export const createComment =
    ({ payload, pageId, currentUserId }) =>
    async (dispatch) => {
        const comment = {
            ...payload,
            _id: nanoid(),
            pageId: pageId,
            created_at: Date.now(),
            userId: currentUserId
        };
        try {
            const { content } = await commentService.createComment(comment);
            dispatch(commentCreatedSucessfully(content));
        } catch (error) {
            dispatch(commentCreationFailed(error.message));
        }
    };

export const removeComment =
    ({ id }) =>
    async (dispatch) => {
        try {
            const { content } = await commentService.removeComment(id);
            if (content === null) {
                dispatch(commentDeletedSuccessfully(id));
            }
        } catch (error) {
            dispatch(commentDeletionFailed(error.message));
        }
    };

export const getComments = () => (state) => {
    return state.comments.entities;
};
export const getCommentsLoadingStatus = () => (state) =>
    state.comments.isLoading;

export default commentsReducer;
