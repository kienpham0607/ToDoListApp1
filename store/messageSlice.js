import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getMessagesByProject, sendMessage, deleteMessage } from '@/services/messageApi';

const initialState = {
    messages: [],
    loading: false,
    error: null,
    totalElements: 0,
    lastProjectId: null, // Lưu project ID cuối cùng để track khi fetch
};

// Async thunk to fetch messages by project
export const fetchProjectMessages = createAsyncThunk(
    'message/fetchProjectMessages',
    async ({ token, projectId, offset = 0, limit = 20, silent = false }, { rejectWithValue }) => {
        try {
            console.log('Redux: Fetching messages for project:', projectId, silent ? '(silent)' : '');
            const response = await getMessagesByProject(token, projectId, offset, limit);
            console.log('Redux: Messages fetched successfully:', response);
            return { projectId, data: response, silent };
        } catch (error) {
            console.error('Redux: Fetch messages error:', error);
            const errorMessage = error.message || 'Không thể tải tin nhắn';
            return rejectWithValue({ message: errorMessage });
        }
    }
);

// Async thunk to send a message
export const sendNewMessage = createAsyncThunk(
    'message/sendMessage',
    async ({ token, messageData }, { rejectWithValue }) => {
        try {
            console.log('Redux: Sending message:', messageData);
            const response = await sendMessage(token, messageData);
            console.log('Redux: Message sent successfully:', response);
            return response;
        } catch (error) {
            console.error('Redux: Send message error:', error);
            const errorMessage = error.message || 'Không thể gửi tin nhắn';
            return rejectWithValue({ message: errorMessage });
        }
    }
);

// Async thunk to delete a message
export const deleteMessageById = createAsyncThunk(
    'message/deleteMessage',
    async ({ token, messageId }, { rejectWithValue }) => {
        try {
            console.log('Redux: Deleting message:', messageId);
            await deleteMessage(token, messageId);
            console.log('Redux: Message deleted successfully');
            return messageId;
        } catch (error) {
            console.error('Redux: Delete message error:', error);
            const errorMessage = error.message || 'Không thể xóa tin nhắn';
            return rejectWithValue({ message: errorMessage });
        }
    }
);

const messageSlice = createSlice({
    name: 'message',
    initialState,
    reducers: {
        clearMessages: (state) => {
            state.messages = [];
            state.totalElements = 0;
            state.lastProjectId = null;
        },
        addMessage: (state, action) => {
            state.messages.push(action.payload);
        }
    },
    extraReducers: (builder) => {
        // Fetch messages
        builder
            .addCase(fetchProjectMessages.pending, (state, action) => {
                // Chỉ set loading nếu không phải silent update
                if (!action.meta.arg?.silent) {
                    state.loading = true;
                }
                state.error = null;
            })
            .addCase(fetchProjectMessages.fulfilled, (state, action) => {
                const { projectId, data, silent } = action.payload;
                const newMessages = data.content || [];
                
                // Chỉ set loading = false nếu không phải silent update
                if (!silent) {
                    state.loading = false;
                }
                
                // Kiểm tra xem có đang fetch cùng project không
                const isSameProject = state.lastProjectId === projectId;
                
                // Nếu đã có messages và cùng project, merge thông minh để tránh re-render không cần thiết
                if (isSameProject && state.messages.length > 0) {
                    // Lưu lại các tin nhắn đã thu hồi (isDeleted = true) từ state cũ
                    const deletedMessages = state.messages.filter(m => m.isDeleted);
                    const deletedMessageIds = new Set(deletedMessages.map(m => m.id));
                    
                    // Tạo map của tin nhắn mới từ server
                    const newMessageIds = new Set(newMessages.map(m => m.id));
                    
                    // Merge: giữ lại tin nhắn đã thu hồi và cập nhật/thêm tin nhắn mới
                    const mergedMessages = [];
                    
                    // Thêm tất cả tin nhắn mới từ server
                    newMessages.forEach(newMsg => {
                        // Nếu tin nhắn này đã bị đánh dấu deleted trong state cũ, giữ nguyên trạng thái deleted
                        if (deletedMessageIds.has(newMsg.id)) {
                            mergedMessages.push({
                                ...newMsg,
                                isDeleted: true,
                                content: 'Đã thu hồi'
                            });
                        } else {
                            mergedMessages.push(newMsg);
                        }
                    });
                    
                    // Tìm các tin nhắn từ state cũ không còn trong response mới (có thể đã bị xóa)
                    state.messages.forEach(oldMsg => {
                        // Nếu tin nhắn này không có trong response mới và chưa được đánh dấu deleted
                        if (!newMessageIds.has(oldMsg.id) && !oldMsg.isDeleted) {
                            // Đánh dấu là đã thu hồi (người khác đã xóa)
                            mergedMessages.push({
                                ...oldMsg,
                                isDeleted: true,
                                content: 'Đã thu hồi'
                            });
                        } else if (oldMsg.isDeleted && !newMessageIds.has(oldMsg.id)) {
                            // Tin nhắn đã thu hồi và không có trong response mới, giữ lại
                            mergedMessages.push(oldMsg);
                        }
                    });
                    
                    // Sort theo timestamp
                    mergedMessages.sort((a, b) => {
                        const timeA = a.timestamp ? new Date(a.timestamp).getTime() : 0;
                        const timeB = b.timestamp ? new Date(b.timestamp).getTime() : 0;
                        return timeA - timeB;
                    });
                    
                    state.messages = mergedMessages;
                } else {
                    // Lần đầu load hoặc project khác, set trực tiếp
                    state.messages = newMessages;
                    state.lastProjectId = projectId;
                }
                
                state.totalElements = data.totalElements || 0;
                state.error = null;
            })
            .addCase(fetchProjectMessages.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || { message: 'Không thể tải tin nhắn' };
            });

        // Send message
        builder
            .addCase(sendNewMessage.pending, (state) => {
                // state.loading = true; // Optional: don't block UI for sending
                state.error = null;
            })
            .addCase(sendNewMessage.fulfilled, (state, action) => {
                state.loading = false;
                state.messages.push(action.payload);
                state.error = null;
            })
            .addCase(sendNewMessage.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || { message: 'Không thể gửi tin nhắn' };
            });

        // Delete message
        builder
            .addCase(deleteMessageById.pending, (state) => {
                state.error = null;
            })
            .addCase(deleteMessageById.fulfilled, (state, action) => {
                // Đánh dấu tin nhắn là đã thu hồi thay vì xóa khỏi danh sách
                const messageIndex = state.messages.findIndex(msg => msg.id === action.payload);
                if (messageIndex !== -1) {
                    state.messages[messageIndex] = {
                        ...state.messages[messageIndex],
                        isDeleted: true,
                        content: 'Đã thu hồi'
                    };
                }
                state.error = null;
            })
            .addCase(deleteMessageById.rejected, (state, action) => {
                state.error = action.payload || { message: 'Không thể xóa tin nhắn' };
            });
    },
});

export const { clearMessages, addMessage } = messageSlice.actions;

export const selectMessages = (state) => state.message.messages;
export const selectMessageLoading = (state) => state.message.loading;
export const selectMessageError = (state) => state.message.error;

export default messageSlice.reducer;
