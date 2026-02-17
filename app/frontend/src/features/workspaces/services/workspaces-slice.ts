import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import {
    WorkspaceState,
    Workspace,
    WPProject,
    WPTask,
    WPStatus
} from "./workspaces-types";
import {
    getMyWorkspacesThunk,
    createWorkspaceThunk,
    getProjectsThunk,
    getWorkspaceMembersThunk,
    createProjectThunk,
    getProjectBoardThunk,
    createTaskThunk,
    updateTaskStatusThunk,
    updateTaskThunk,
    getCommentsThunk,
    addCommentThunk,
    getProjectTagsThunk,
    addTagToTaskThunk,
    removeTagFromTaskThunk,
    createTagThunk,
    getCategoriesThunk,
    createCategoryThunk,
    getChecklistThunk,
    addChecklistItemThunk,
    updateChecklistItemThunk,
    deleteChecklistItemThunk,
    getAttachmentsThunk,
    addAttachmentThunk
} from "./workspaces-thunks";

const initialState: WorkspaceState = {
    workspaces: [],
    currentWorkspace: null,
    projects: [],
    currentProject: null,
    members: [],
    taskComments: [],
    projectTags: [],
    taskTags: [],
    taskChecklist: [],
    taskAttachments: [],
    projectCategories: [],
    board: null,
    loading: false,
    error: null,
};

const workspacesSlice = createSlice({
    name: "workspaces",
    initialState,
    reducers: {
        setCurrentWorkspace: (state, action: PayloadAction<Workspace | null>) => {
            state.currentWorkspace = action.payload;
        },
        setCurrentProject: (state, action: PayloadAction<WPProject | null>) => {
            state.currentProject = action.payload;
        },
        clearWorkspaceError: (state) => {
            state.error = null;
        },
        moveTaskOptimistically: (state, action: PayloadAction<{ taskId: string, statusId: string }>) => {
            if (state.board) {
                const task = state.board.tasks.find(t => t.id === action.payload.taskId);
                if (task) {
                    task.status_id = action.payload.statusId;
                }
            }
        }
    },
    extraReducers: (builder) => {
        builder
            // Get My Workspaces
            .addCase(getMyWorkspacesThunk.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getMyWorkspacesThunk.fulfilled, (state, action) => {
                state.loading = false;
                state.workspaces = action.payload;
            })
            .addCase(getMyWorkspacesThunk.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            // Create Workspace
            .addCase(createWorkspaceThunk.fulfilled, (state, action) => {
                state.workspaces.unshift(action.payload);
            })
            // Get Projects
            .addCase(getProjectsThunk.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getProjectsThunk.fulfilled, (state, action) => {
                state.loading = false;
                state.projects = action.payload;
            })
            .addCase(getProjectsThunk.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            // Create Project
            .addCase(createProjectThunk.fulfilled, (state, action) => {
                state.projects.unshift(action.payload);
            })
            // Get Workspace Members
            .addCase(getWorkspaceMembersThunk.fulfilled, (state, action) => {
                state.members = action.payload;
            })
            // Get Project Board
            .addCase(getProjectBoardThunk.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getProjectBoardThunk.fulfilled, (state, action) => {
                state.loading = false;
                state.board = action.payload;
            })
            .addCase(getProjectBoardThunk.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            // Create Task
            .addCase(createTaskThunk.fulfilled, (state, action) => {
                if (state.board) {
                    state.board.tasks.unshift(action.payload);
                }
            })
            // Update Task
            .addCase(updateTaskThunk.fulfilled, (state, action) => {
                if (state.board) {
                    const index = state.board.tasks.findIndex(t => t.id === action.payload.id);
                    if (index !== -1) {
                        state.board.tasks[index] = action.payload;
                    }
                }
            })
            // Get Comments
            .addCase(getCommentsThunk.fulfilled, (state, action) => {
                state.taskComments = action.payload;
            })
            // Add Comment
            .addCase(addCommentThunk.fulfilled, (state, action) => {
                state.taskComments.push(action.payload);
            })
            // Get Project Tags
            .addCase(getProjectTagsThunk.fulfilled, (state, action) => {
                state.projectTags = action.payload;
            })
            // Create Tag
            .addCase(createTagThunk.fulfilled, (state, action) => {
                state.projectTags.push(action.payload);
            })
            // Get Categories
            .addCase(getCategoriesThunk.fulfilled, (state, action) => {
                state.projectCategories = action.payload;
            })
            // Create Category
            .addCase(createCategoryThunk.fulfilled, (state, action) => {
                state.projectCategories.push(action.payload);
            })
            // Add Tag to Task
            .addCase(addTagToTaskThunk.fulfilled, (state, action) => {
                if (state.board) {
                    const taskIndex = state.board.tasks.findIndex(t => t.id === action.payload.taskId);
                    if (taskIndex !== -1) {
                        const tag = state.projectTags.find(t => t.id === action.payload.tagId);
                        if (tag) {
                            if (!state.board.tasks[taskIndex].tags) state.board.tasks[taskIndex].tags = [];
                            const exists = state.board.tasks[taskIndex].tags?.some(t => t.id === tag.id);
                            if (!exists) {
                                state.board.tasks[taskIndex].tags?.push(tag);
                            }
                        }
                    }
                }
            })
            // Remove Tag from Task
            .addCase(removeTagFromTaskThunk.fulfilled, (state, action) => {
                if (state.board) {
                    const taskIndex = state.board.tasks.findIndex(t => t.id === action.payload.taskId);
                    if (taskIndex !== -1 && state.board.tasks[taskIndex].tags) {
                        state.board.tasks[taskIndex].tags = state.board.tasks[taskIndex].tags?.filter(t => t.id !== action.payload.tagId);
                    }
                }
            })
            // Get Checklist
            .addCase(getChecklistThunk.fulfilled, (state, action) => {
                state.taskChecklist = action.payload;
            })
            // Add Checklist Item
            .addCase(addChecklistItemThunk.fulfilled, (state, action) => {
                state.taskChecklist.push(action.payload);
            })
            // Update Checklist Item
            .addCase(updateChecklistItemThunk.fulfilled, (state, action) => {
                const index = state.taskChecklist.findIndex(i => i.id === action.payload.id);
                if (index !== -1) {
                    state.taskChecklist[index] = action.payload;
                }
            })
            // Delete Checklist Item
            .addCase(deleteChecklistItemThunk.fulfilled, (state, action) => {
                state.taskChecklist = state.taskChecklist.filter(i => i.id !== action.payload);
            })
            // Get Attachments
            .addCase(getAttachmentsThunk.fulfilled, (state, action) => {
                state.taskAttachments = action.payload;
            })
            // Add Attachment
            .addCase(addAttachmentThunk.fulfilled, (state, action) => {
                state.taskAttachments.unshift(action.payload);
            });
    },
});

export const { setCurrentWorkspace, setCurrentProject, clearWorkspaceError, moveTaskOptimistically } = workspacesSlice.actions;
export default workspacesSlice.reducer;
