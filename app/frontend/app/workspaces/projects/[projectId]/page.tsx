"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useAppDispatch, useAppSelector } from "@/src/store/hooks";
import { useParams } from "next/navigation";
import {
    getProjectBoardThunk,
    getWorkspaceMembersThunk,
    createTaskThunk,
    updateTaskStatusThunk,
    updateTaskThunk,
    getCommentsThunk,
    addCommentThunk,
    getProjectTagsThunk,
    addTagToTaskThunk,
    removeTagFromTaskThunk,
    getChecklistThunk,
    addChecklistItemThunk,
    updateChecklistItemThunk,
    deleteChecklistItemThunk,
    getAttachmentsThunk,
    addAttachmentThunk,
    uploadTaskAttachmentThunk,
    createTagThunk,
    getCategoriesThunk,
    createCategoryThunk
} from "@/src/features/workspaces/services/workspaces-thunks";
import {
    selectProjectBoard,
    selectWorkspaceMembers,
    selectTaskComments,
    selectProjectTags,
    selectTaskChecklist,
    selectTaskAttachments,
    selectProjectCategories,
    selectWorkspacesLoading
} from "@/src/features/workspaces/services/workspaces-selectors";
import { moveTaskOptimistically } from "@/src/features/workspaces/services/workspaces-slice";
import { WPStatus, WPTask, WorkspaceMemberProfile } from "@/src/features/workspaces/services/workspaces-types";
import {
    Plus,
    Calendar,
    User as UserIcon,
    MessageSquare,
    Filter,
    Search,
    ArrowLeft,
    X,
    Clock,
    CheckCircle2,
    Send
} from "lucide-react";
import Link from "next/link";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";

export default function ProjectBoardPage() {
    const { projectId } = useParams();
    const dispatch = useAppDispatch();
    const board = useAppSelector(selectProjectBoard);
    const members = useAppSelector(selectWorkspaceMembers);
    const comments = useAppSelector(selectTaskComments);
    const projectTags = useAppSelector(selectProjectTags);
    const categories = useAppSelector(selectProjectCategories);
    const checklist = useAppSelector(selectTaskChecklist);
    const attachments = useAppSelector(selectTaskAttachments);
    const loading = useAppSelector(selectWorkspacesLoading);

    const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
    const [selectedStatusId, setSelectedStatusId] = useState("");
    const [taskTitle, setTaskTitle] = useState("");
    const [taskDesc, setTaskDesc] = useState("");
    const [taskPriority, setTaskPriority] = useState<any>("medium");
    const [taskAssignee, setTaskAssignee] = useState("");

    // Task Detail Drawer State
    const [isDetailDrawerOpen, setIsDetailDrawerOpen] = useState(false);
    const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
    const editingTask = useMemo(() => {
        if (!editingTaskId || !board) return null;
        return board.tasks.find(t => t.id === editingTaskId) || null;
    }, [editingTaskId, board]);

    const [editTitle, setEditTitle] = useState("");
    const [editDesc, setEditDesc] = useState("");
    const [editPriority, setEditPriority] = useState<any>("medium");
    const [editStatus, setEditStatus] = useState("");
    const [editAssignee, setEditAssignee] = useState("");
    const [editDueDate, setEditDueDate] = useState<string | null>(null);
    const [editStoryPoints, setEditStoryPoints] = useState<number | "">("");
    const [editTimeEstimate, setEditTimeEstimate] = useState<number | "">("");
    const [editTimeSpent, setEditTimeSpent] = useState<number | "">("");
    const [editCategory, setEditCategory] = useState("");
    const [newComment, setNewComment] = useState("");
    const [newChecklistItem, setNewChecklistItem] = useState("");
    const [isSaving, setIsSaving] = useState(false);
    const [isCommenting, setIsCommenting] = useState(false);
    const [isChecklisting, setIsChecklisting] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [tagName, setTagName] = useState("");
    const [tagColor, setTagColor] = useState("#000000");
    const [showTagForm, setShowTagForm] = useState(false);
    const [catName, setCatName] = useState("");
    const [catColor, setCatColor] = useState("#000000");
    const [showCatForm, setShowCatForm] = useState(false);

    // Filters & Search
    const [searchQuery, setSearchQuery] = useState("");
    const [filterPriority, setFilterPriority] = useState<string | null>(null);
    const [filterAssignee, setFilterAssignee] = useState<string | null>(null);

    // Hydration check for dnd
    const [enabled, setEnabled] = useState(false);

    useEffect(() => {
        if (projectId) {
            dispatch(getProjectBoardThunk(projectId as string));
            dispatch(getProjectTagsThunk(projectId as string));
            dispatch(getCategoriesThunk(projectId as string));
        }
        setEnabled(true);
    }, [projectId, dispatch]);

    useEffect(() => {
        if (board?.project.workspace_id) {
            dispatch(getWorkspaceMembersThunk(board.project.workspace_id));
        }
    }, [board?.project.workspace_id, dispatch]);

    const handleCreateTask = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!taskTitle.trim() || !selectedStatusId) return;

        await dispatch(createTaskThunk({
            projectId: projectId as string,
            dto: {
                title: taskTitle.trim(),
                description: taskDesc.trim() || null,
                status_id: selectedStatusId,
                priority: taskPriority,
                assignee_id: taskAssignee || null
            }
        }));

        setIsTaskModalOpen(false);
        setTaskTitle("");
        setTaskDesc("");
        setTaskAssignee("");
    };

    const onDragEnd = (result: DropResult) => {
        const { destination, source, draggableId } = result;

        if (!destination) return;
        if (destination.droppableId === source.droppableId && destination.index === source.index) return;

        const newStatusId = destination.droppableId;

        // Optimistic update
        dispatch(moveTaskOptimistically({ taskId: draggableId, statusId: newStatusId }));

        // API call
        dispatch(updateTaskStatusThunk({ taskId: draggableId, statusId: newStatusId }));
    };

    const openCreateModal = (statusId: string) => {
        setSelectedStatusId(statusId);
        setIsTaskModalOpen(true);
    };

    const openDetailDrawer = (task: WPTask) => {
        setEditingTaskId(task.id);
        setEditTitle(task.title);
        setEditDesc(task.description || "");
        setEditPriority(task.priority);
        setEditStatus(task.status_id);
        setEditAssignee(task.assignee_id || "");
        setEditDueDate(task.due_date ? new Date(task.due_date).toISOString().split('T')[0] : null);
        setEditStoryPoints(task.story_points ?? "");
        setEditTimeEstimate(task.time_estimate ?? "");
        setEditTimeSpent(task.time_spent ?? "");
        setEditCategory(task.category_id || "");
        setIsDetailDrawerOpen(true);
        dispatch(getCommentsThunk(task.id));
        dispatch(getChecklistThunk(task.id));
        dispatch(getAttachmentsThunk(task.id));
    };

    const handleUpdateTask = async () => {
        if (!editingTask || !editTitle.trim()) return;
        setIsSaving(true);
        try {
            await dispatch(updateTaskThunk({
                taskId: editingTask.id,
                dto: {
                    title: editTitle.trim(),
                    description: editDesc.trim() || null,
                    priority: editPriority,
                    status_id: editStatus,
                    assignee_id: editAssignee || null,
                    due_date: editDueDate || null,
                    story_points: editStoryPoints === "" ? null : Number(editStoryPoints),
                    time_estimate: editTimeEstimate === "" ? null : Number(editTimeEstimate),
                    time_spent: editTimeSpent === "" ? 0 : Number(editTimeSpent),
                    category_id: editCategory || null
                }
            })).unwrap();
            setIsDetailDrawerOpen(false);
        } catch (err) {
            console.error("Failed to update task:", err);
        } finally {
            setIsSaving(false);
        }
    };

    const handleCommentSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingTask || !newComment.trim()) return;
        setIsCommenting(true);
        try {
            await dispatch(addCommentThunk({
                taskId: editingTask.id,
                content: newComment.trim()
            })).unwrap();
            setNewComment("");
        } catch (err) {
            console.error("Failed to add comment:", err);
        } finally {
            setIsCommenting(false);
        }
    };

    const toggleTag = async (tagId: string) => {
        if (!editingTask) return;
        const hasTag = editingTask.tags?.some(t => t.id === tagId);
        if (hasTag) {
            await dispatch(removeTagFromTaskThunk({ taskId: editingTask.id, tagId }));
        } else {
            await dispatch(addTagToTaskThunk({ taskId: editingTask.id, tagId }));
        }
    };

    const handleCreateTag = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!tagName.trim() || !projectId) return;
        try {
            await dispatch(createTagThunk({
                projectId: projectId as string,
                name: tagName.trim(),
                color: tagColor
            })).unwrap();
            setTagName("");
            setShowTagForm(false);
        } catch (err) {
            console.error(err);
        }
    };

    const handleCreateCategory = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!catName.trim() || !projectId) return;
        try {
            await dispatch(createCategoryThunk({
                projectId: projectId as string,
                name: catName.trim(),
                color: catColor
            })).unwrap();
            setCatName("");
            setShowCatForm(false);
        } catch (err) {
            console.error(err);
        }
    };

    const handleAddChecklistItem = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingTask || !newChecklistItem.trim()) return;
        setIsChecklisting(true);
        try {
            await dispatch(addChecklistItemThunk({
                taskId: editingTask.id,
                title: newChecklistItem.trim()
            })).unwrap();
            setNewChecklistItem("");
        } catch (err) {
            console.error(err);
        } finally {
            setIsChecklisting(false);
        }
    };

    const toggleChecklistItem = async (itemId: string, isCompleted: boolean) => {
        await dispatch(updateChecklistItemThunk({
            itemId,
            dto: { is_completed: !isCompleted }
        }));
    };

    const handleDeleteChecklistItem = async (itemId: string) => {
        await dispatch(deleteChecklistItemThunk(itemId));
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !editingTask) return;

        setIsUploading(true);
        try {
            const uploadRes = await dispatch(uploadTaskAttachmentThunk(file)).unwrap();
            await dispatch(addAttachmentThunk({
                taskId: editingTask.id,
                fileData: {
                    name: file.name,
                    url: uploadRes.url,
                    type: file.type,
                    size: file.size
                }
            })).unwrap();
        } catch (err) {
            console.error("Upload failed:", err);
        } finally {
            setIsUploading(false);
        }
    };

    const getAssigneeProfile = (assigneeId: string | null | undefined) => {
        if (!assigneeId) return null;
        return members.find(m => m.user_id === assigneeId);
    };

    const tasksByStatus = useMemo(() => {
        if (!board) return {};
        const groups: Record<string, WPTask[]> = {};
        board.statuses.forEach((s: WPStatus) => groups[s.id] = []);

        const filteredTasks = board.tasks.filter(t => {
            const matchesSearch = t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                t.task_number.toString().includes(searchQuery);
            const matchesPriority = !filterPriority || t.priority === filterPriority;
            const matchesAssignee = !filterAssignee || t.assignee_id === filterAssignee;
            return matchesSearch && matchesPriority && matchesAssignee;
        });

        filteredTasks.forEach((t: WPTask) => {
            if (groups[t.status_id]) groups[t.status_id].push(t);
        });
        return groups;
    }, [board, searchQuery, filterPriority, filterAssignee]);

    if (!enabled) return null;

    if (loading && !board) {
        return (
            <div className="flex justify-center items-center h-[80vh] bg-[#F4F2EE] dark:bg-black">
                <div className="w-5 h-5 border border-neutral-300 border-t-[#0A66C2] rounded-full animate-spin" />
            </div>
        );
    }

    const iconStroke = 1.25;

    return (
        <div className="min-h-screen flex flex-col overflow-hidden bg-[#F4F2EE] dark:bg-black font-sans antialiased text-neutral-800">
            {/* Board Header */}
            <div className="px-4 md:px-6 py-4 md:py-5 bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between shrink-0 shadow-sm">
                <div className="flex items-center gap-6">
                    <Link
                        href={`/workspaces/${board?.project.workspace_id || ''}`}
                        className="flex items-center gap-2 px-3 py-1.5 text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-all text-xs font-bold uppercase tracking-tight group"
                    >
                        <ArrowLeft size={16} strokeWidth={iconStroke} className="group-hover:-translate-x-1 transition-transform" />
                        <span>Retour</span>
                    </Link>
                    <div className="h-4 w-px bg-neutral-100 dark:bg-neutral-800" />
                    <div>
                        <div className="flex items-center gap-2 mb-0.5">
                            <span className="text-[11px] font-semibold text-neutral-500 dark:text-neutral-400">Workspace /</span>
                            <span className="text-[11px] font-semibold text-neutral-900 dark:text-white">Tableau kanban</span>
                        </div>
                        <h1 className="text-lg font-semibold text-neutral-900 dark:text-white tracking-tight font-inter">
                            Tableau de bord opérationnel
                        </h1>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div className="relative hidden lg:block">
                        <Search size={14} strokeWidth={iconStroke} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
                        <input
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Rechercher..."
                            className="pl-10 pr-4 py-2 border border-neutral-200 dark:border-neutral-700 rounded-lg bg-transparent text-sm font-medium text-neutral-900 dark:text-white placeholder:text-neutral-400 w-64 outline-none focus:border-[#0A66C2] focus:ring-1 focus:ring-[#0A66C2] transition-all"
                        />
                    </div>

                    <div className="flex items-center gap-2">
                        <select
                            value={filterPriority || ""}
                            onChange={(e) => setFilterPriority(e.target.value || null)}
                            className="px-3 py-2 text-[13px] font-semibold text-neutral-600 dark:text-neutral-400 bg-transparent border border-neutral-200 dark:border-neutral-700 rounded-lg outline-none cursor-pointer focus:border-[#0A66C2] transition-all"
                        >
                            <option value="">Priorité</option>
                            <option value="low">Faible</option>
                            <option value="medium">Moyenne</option>
                            <option value="high">Haute</option>
                            <option value="blocker">Bloquant</option>
                        </select>
                    </div>

                    {(searchQuery || filterPriority || filterAssignee) && (
                        <button
                            onClick={() => { setSearchQuery(""); setFilterPriority(null); setFilterAssignee(null); }}
                            className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-lg transition-colors"
                        >
                            <X size={16} strokeWidth={iconStroke} />
                        </button>
                    )}
                </div>
            </div>

            {/* Kanban Board */}
            <DragDropContext onDragEnd={onDragEnd}>
                <div className="flex-1 overflow-x-auto p-6 md:p-8">
                    <div className="flex gap-6 md:gap-8 h-full min-w-max">
                        {board?.statuses.map((status: WPStatus) => (
                            <Droppable key={status.id} droppableId={status.id}>
                                {(provided, snapshot) => (
                                    <div
                                        {...provided.droppableProps}
                                        ref={provided.innerRef}
                                        className={`w-72 md:w-80 flex flex-col h-full rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-sm transition-colors ${snapshot.isDraggingOver ? 'bg-neutral-50 dark:bg-neutral-800' : ''}`}
                                    >
                                        <div className="flex items-center justify-between mb-4 px-3 pt-3 shrink-0">
                                            <div className="flex items-center gap-3">
                                                <div className="w-2 h-2 rounded-sm" style={{ backgroundColor: status.color }} />
                                                <h3 className="font-semibold text-neutral-900 dark:text-white text-[13px] font-inter">
                                                    {status.label}
                                                </h3>
                                                <span className="text-[11px] font-medium text-neutral-500 dark:text-neutral-400">
                                                    {tasksByStatus[status.id]?.length || 0}
                                                </span>
                                            </div>
                                            <button
                                                onClick={() => openCreateModal(status.id)}
                                                className="p-1.5 rounded-full border border-neutral-200 dark:border-neutral-700 text-neutral-400 hover:text-[#0A66C2] hover:border-[#0A66C2]/50 bg-white/60 dark:bg-neutral-900/60 transition-colors"
                                            >
                                                <Plus size={14} strokeWidth={2.5} />
                                            </button>
                                        </div>

                                        <div className="flex-1 space-y-3 overflow-y-auto px-3 pb-4 pt-3 scrollbar-hide">
                                            {tasksByStatus[status.id]?.map((task: WPTask, index: number) => (
                                                <Draggable key={task.id} draggableId={task.id} index={index}>
                                                    {(provided, snapshot) => (
                                                        <div
                                                            ref={provided.innerRef}
                                                            {...provided.draggableProps}
                                                            {...provided.dragHandleProps}
                                                            onClick={() => openDetailDrawer(task)}
                                                            className={`bg-white dark:bg-neutral-900 p-4 rounded-lg border border-neutral-200 dark:border-neutral-800 cursor-pointer transition-colors ${snapshot.isDragging ? 'border-[#0A66C2] shadow-md z-50' : 'hover:border-[#0A66C2]/70'}`}
                                                        >
                                                            <div className="flex items-start justify-between mb-3">
                                                                <div className="flex items-center gap-2">
                                                                    <div className={`w-1.5 h-1.5 rounded-sm ${task.priority === 'blocker' || task.priority === 'high' ? 'bg-red-600' :
                                                                        task.priority === 'medium' ? 'bg-amber-500' : 'bg-neutral-300'
                                                                        }`} />
                                                                    <span className="text-[11px] font-medium text-neutral-500 dark:text-neutral-400 capitalize">
                                                                        {task.priority || 'medium'}
                                                                    </span>
                                                                </div>
                                                                <span className="text-[11px] font-medium text-neutral-400 dark:text-neutral-500">
                                                                    #{task.task_number}
                                                                </span>
                                                            </div>

                                                            <h4 className="font-semibold text-neutral-900 dark:text-white text-[13px] mb-2 leading-snug tracking-tight font-inter">
                                                                {task.title}
                                                            </h4>

                                                            <div className="flex items-center justify-between pt-4 border-t border-neutral-50 dark:border-neutral-950/50 mt-auto">
                                                                <div className="flex items-center gap-3">
                                                                    {(() => {
                                                                        const profile = getAssigneeProfile(task.assignee_id);
                                                                        return profile ? (
                                                                            <div className="w-6 h-6 rounded-full border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 flex items-center justify-center overflow-hidden">
                                                                                {profile.avatar_url ? (
                                                                                    <img src={profile.avatar_url} alt={profile.display_name} className="w-full h-full object-cover" />
                                                                                ) : (
                                                                                    <span className="text-neutral-500 dark:text-neutral-400 text-[9px] font-semibold uppercase">{profile.display_name?.slice(0, 2) || '?'}</span>
                                                                                )}
                                                                            </div>
                                                                        ) : (
                                                                            <div className="w-6 h-6 rounded-full border border-dashed border-neutral-200 dark:border-neutral-700 flex items-center justify-center text-neutral-400 dark:text-neutral-500">
                                                                                <UserIcon size={12} strokeWidth={iconStroke} />
                                                                            </div>
                                                                        );
                                                                    })()}
                                                                </div>

                                                                <div className="flex items-center gap-3 text-neutral-500 dark:text-neutral-400">
                                                                    {(task.checklist_total || 0) > 0 && (
                                                                        <div className="flex items-center gap-1 text-[11px] font-semibold">
                                                                            <CheckCircle2 size={12} strokeWidth={iconStroke} />
                                                                            <span>{task.checklist_completed}/{task.checklist_total}</span>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}
                                                </Draggable>
                                            ))}
                                            {provided.placeholder}

                                            <button
                                                onClick={() => openCreateModal(status.id)}
                                                className="w-full py-3 border border-dashed border-neutral-200 dark:border-neutral-700 rounded-lg flex items-center justify-center gap-2 text-[13px] font-semibold text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:border-[#0A66C2]/50 bg-neutral-50/40 dark:bg-neutral-900/20 transition-colors mt-2"
                                            >
                                                <Plus size={14} strokeWidth={2} />
                                                Ajouter une tâche
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </Droppable>
                        ))}
                    </div>
                </div>
            </DragDropContext>

            {/* Create Task Modal */}
            {isTaskModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white dark:bg-neutral-900 w-full max-w-lg p-8 rounded-xl border border-neutral-200 dark:border-neutral-800 shadow-xl">
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h2 className="text-xl font-semibold text-neutral-900 dark:text-white tracking-tight font-inter">Nouvelle tâche</h2>
                                <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 font-medium">Configuration opérationnelle</p>
                            </div>
                            <button onClick={() => setIsTaskModalOpen(false)} className="p-2 text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-full transition-colors">
                                <X size={20} strokeWidth={iconStroke} />
                            </button>
                        </div>

                        <form onSubmit={handleCreateTask} className="space-y-5">
                            <div className="space-y-2">
                                <label className="text-[13px] font-semibold text-neutral-600 dark:text-neutral-400 block">Intitulé *</label>
                                <input
                                    autoFocus
                                    type="text"
                                    value={taskTitle}
                                    onChange={(e) => setTaskTitle(e.target.value)}
                                    placeholder="Titre de la tâche..."
                                    className="w-full px-4 py-2.5 bg-transparent border border-neutral-300 dark:border-neutral-700 rounded outline-none focus:border-[#0A66C2] focus:ring-1 focus:ring-[#0A66C2] text-sm font-medium text-neutral-900 dark:text-white transition-all"
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-5">
                                <div className="space-y-2">
                                    <label className="text-[13px] font-semibold text-neutral-600 dark:text-neutral-400 block">Priorité</label>
                                    <select
                                        value={taskPriority}
                                        onChange={(e) => setTaskPriority(e.target.value)}
                                        className="w-full px-4 py-2.5 bg-transparent border border-neutral-300 dark:border-neutral-700 rounded outline-none focus:border-[#0A66C2] focus:ring-1 focus:ring-[#0A66C2] text-sm font-medium text-neutral-900 dark:text-white cursor-pointer transition-all"
                                    >
                                        <option value="low">Faible</option>
                                        <option value="medium">Moyenne</option>
                                        <option value="high">Haute</option>
                                        <option value="blocker">Bloquant</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[13px] font-semibold text-neutral-600 dark:text-neutral-400 block">Assigné à</label>
                                    <select
                                        value={taskAssignee}
                                        onChange={(e) => setTaskAssignee(e.target.value)}
                                        className="w-full px-4 py-2.5 bg-transparent border border-neutral-300 dark:border-neutral-700 rounded outline-none focus:border-[#0A66C2] focus:ring-1 focus:ring-[#0A66C2] text-sm font-medium text-neutral-900 dark:text-white cursor-pointer transition-all"
                                    >
                                        <option value="">Non assigné</option>
                                        {members.map(m => (
                                            <option key={m.user_id} value={m.user_id}>{m.display_name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button type="button" onClick={() => setIsTaskModalOpen(false)} className="flex-1 px-4 py-2.5 text-sm font-semibold text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800 rounded transition-colors">Annuler</button>
                                <button type="submit" className="flex-1 px-4 py-2.5 bg-[#0A66C2] hover:bg-[#004182] text-white text-sm font-semibold rounded shadow-sm transition-colors">Confirmer</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Task Detail Drawer */}
            {isDetailDrawerOpen && editingTask && (
                <div className="fixed inset-0 z-[150] flex justify-end">
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsDetailDrawerOpen(false)} />
                    <div className="relative w-full max-w-2xl bg-white dark:bg-neutral-900 h-full border-l border-neutral-200 dark:border-neutral-800 flex flex-col shadow-xl">

                        <div className="flex items-center justify-between px-8 py-6 border-b border-neutral-200 dark:border-neutral-800 shrink-0 bg-white dark:bg-neutral-900">
                            <div className="flex items-center gap-4">
                                <span className="text-[11px] font-semibold bg-[#0A66C2] text-white px-2.5 py-1 rounded">
                                    #{editingTask.task_number}
                                </span>
                                <span className="text-[12px] font-medium text-neutral-500 dark:text-neutral-400">Détails de la tâche</span>
                            </div>
                            <button onClick={() => setIsDetailDrawerOpen(false)} className="p-2 text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-full transition-colors">
                                <X size={20} strokeWidth={iconStroke} />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-8 space-y-8 pb-24 scrollbar-hide bg-white dark:bg-neutral-900">
                            <div className="space-y-2">
                                <label className="text-[13px] font-semibold text-neutral-600 dark:text-neutral-400 block">Titre</label>
                                <input
                                    value={editTitle}
                                    onChange={(e) => setEditTitle(e.target.value)}
                                    className="w-full text-xl font-semibold bg-transparent border-none focus:ring-0 text-neutral-900 dark:text-white p-0 tracking-tight font-inter outline-none"
                                    placeholder="Titre..."
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <DrawerProp label="Statut" icon={<Clock size={12} strokeWidth={iconStroke} />}>
                                    <select value={editStatus} onChange={(e) => setEditStatus(e.target.value)} className="w-full px-4 py-2.5 bg-transparent border border-neutral-300 dark:border-neutral-700 rounded-lg text-[13px] font-medium text-neutral-900 dark:text-white outline-none cursor-pointer focus:border-[#0A66C2] focus:ring-1 focus:ring-[#0A66C2] transition-all">
                                        {board?.statuses.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
                                    </select>
                                </DrawerProp>

                                <DrawerProp label="Priorité" icon={<Filter size={12} strokeWidth={iconStroke} />}>
                                    <select value={editPriority} onChange={(e) => setEditPriority(e.target.value)} className="w-full px-4 py-2.5 bg-transparent border border-neutral-300 dark:border-neutral-700 rounded-lg text-[13px] font-medium text-neutral-900 dark:text-white outline-none cursor-pointer focus:border-[#0A66C2] focus:ring-1 focus:ring-[#0A66C2] transition-all">
                                        <option value="low">Faible</option>
                                        <option value="medium">Moyenne</option>
                                        <option value="high">Haute</option>
                                        <option value="blocker">Bloquant</option>
                                    </select>
                                </DrawerProp>

                                <DrawerProp label="Assigné à" icon={<UserIcon size={12} strokeWidth={iconStroke} />}>
                                    <select value={editAssignee} onChange={(e) => setEditAssignee(e.target.value)} className="w-full px-4 py-2.5 bg-transparent border border-neutral-300 dark:border-neutral-700 rounded-lg text-[13px] font-medium text-neutral-900 dark:text-white outline-none cursor-pointer focus:border-[#0A66C2] focus:ring-1 focus:ring-[#0A66C2] transition-all">
                                        <option value="">Non assigné</option>
                                        {members.map(m => <option key={m.user_id} value={m.user_id}>{m.display_name}</option>)}
                                    </select>
                                </DrawerProp>

                                <DrawerProp label="Date de fin" icon={<Calendar size={12} strokeWidth={iconStroke} />}>
                                    <input type="date" value={editDueDate || ""} onChange={(e) => setEditDueDate(e.target.value || null)} className="w-full px-4 py-2.5 bg-transparent border border-neutral-300 dark:border-neutral-700 rounded-lg text-[13px] font-medium text-neutral-900 dark:text-white outline-none cursor-pointer focus:border-[#0A66C2] focus:ring-1 focus:ring-[#0A66C2] transition-all" />
                                </DrawerProp>

                                <div className="col-span-2 space-y-4 pt-6 border-t border-neutral-200 dark:border-neutral-800">
                                    <div className="flex items-center justify-between">
                                        <label className="text-[13px] font-semibold text-neutral-600 dark:text-neutral-400 block">Checklist</label>
                                        <span className="text-[11px] font-medium text-neutral-500 dark:text-neutral-400">{checklist.filter(i => i.is_completed).length}/{checklist.length}</span>
                                    </div>
                                    <div className="space-y-3">
                                        {checklist.map(item => (
                                            <div key={item.id} className="flex items-center gap-3 group">
                                                <input type="checkbox" checked={item.is_completed} onChange={() => toggleChecklistItem(item.id, item.is_completed)} className="w-4 h-4 rounded border-neutral-300 text-[#0A66C2] focus:ring-[#0A66C2]" />
                                                <span className={`flex-1 text-[13px] font-medium ${item.is_completed ? 'text-neutral-400 line-through' : 'text-neutral-700 dark:text-neutral-300'}`}>{item.title}</span>
                                                <button onClick={() => handleDeleteChecklistItem(item.id)} className="text-neutral-400 hover:text-red-500 transition-colors"><X size={14} strokeWidth={iconStroke} /></button>
                                            </div>
                                        ))}
                                        <form onSubmit={handleAddChecklistItem} className="pt-2">
                                            <input value={newChecklistItem} onChange={(e) => setNewChecklistItem(e.target.value)} placeholder="Ajouter un élément..." className="w-full px-4 py-2.5 border border-neutral-300 dark:border-neutral-700 rounded-lg text-[13px] font-medium text-neutral-900 dark:text-white placeholder:text-neutral-400 outline-none focus:border-[#0A66C2] focus:ring-1 focus:ring-[#0A66C2] transition-all" />
                                        </form>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2 pt-6 border-t border-neutral-200 dark:border-neutral-800">
                                <label className="text-[13px] font-semibold text-neutral-600 dark:text-neutral-400 block">Description</label>
                                <textarea
                                    value={editDesc}
                                    onChange={(e) => setEditDesc(e.target.value)}
                                    rows={6}
                                    placeholder="Spécifications techniques..."
                                    className="w-full text-sm leading-relaxed bg-transparent border border-neutral-200 dark:border-neutral-700 rounded-lg px-4 py-2.5 text-neutral-600 dark:text-neutral-400 font-medium resize-none outline-none focus:border-[#0A66C2] focus:ring-1 focus:ring-[#0A66C2] transition-all"
                                />
                            </div>

                            <div className="space-y-4 pt-6 border-t border-neutral-200 dark:border-neutral-800">
                                <label className="text-[13px] font-semibold text-neutral-600 dark:text-neutral-400 block">Commentaires</label>
                                <div className="space-y-4">
                                    {comments.map((comment: any) => (
                                        <div key={comment.id} className="flex gap-3">
                                            <div className="w-8 h-8 flex items-center justify-center shrink-0 text-neutral-500 dark:text-neutral-400 border border-neutral-200 dark:border-neutral-700 rounded-full font-semibold text-[11px]">
                                                {comment.display_name?.slice(0, 2)}
                                            </div>
                                            <div className="flex-1 space-y-1">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-[12px] font-semibold text-neutral-900 dark:text-white">{comment.display_name}</span>
                                                    <span className="text-[11px] font-medium text-neutral-500 dark:text-neutral-400">{new Date(comment.created_at).toLocaleDateString()}</span>
                                                </div>
                                                <div className="p-3 rounded-lg border border-neutral-200 dark:border-neutral-700 text-sm text-neutral-600 dark:text-neutral-400 font-medium">
                                                    {comment.content}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <form onSubmit={handleCommentSubmit} className="relative pt-2">
                                    <textarea
                                        value={newComment}
                                        onChange={(e) => setNewComment(e.target.value)}
                                        placeholder="Note de suivi..."
                                        className="w-full px-4 py-3 bg-transparent border border-neutral-200 dark:border-neutral-700 rounded-lg text-sm font-medium outline-none focus:border-[#0A66C2] focus:ring-1 focus:ring-[#0A66C2] pb-12 transition-all"
                                        rows={3}
                                    />
                                    <button
                                        type="submit"
                                        disabled={isCommenting || !newComment.trim()}
                                        className="absolute right-3 bottom-3 bg-[#0A66C2] hover:bg-[#004182] text-white px-4 py-2 text-[12px] font-semibold rounded disabled:opacity-50 transition-colors"
                                    >
                                        Envoyer
                                    </button>
                                </form>
                            </div>
                        </div>

                        <div className="px-8 py-6 border-t border-neutral-200 dark:border-neutral-800 flex items-center justify-between shrink-0 bg-white dark:bg-neutral-900">
                            <span className="text-[11px] font-medium text-neutral-500 dark:text-neutral-400">Dernière mise à jour : {new Date(editingTask.updated_at).toLocaleDateString()}</span>
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => setIsDetailDrawerOpen(false)}
                                    className="px-5 py-2.5 text-[13px] font-semibold text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800 rounded transition-colors"
                                >
                                    Fermer
                                </button>
                                <button
                                    onClick={handleUpdateTask}
                                    disabled={isSaving}
                                    className="px-6 py-2.5 bg-[#0A66C2] hover:bg-[#004182] text-white text-[13px] font-semibold rounded shadow-sm disabled:opacity-50 transition-colors"
                                >
                                    {isSaving ? "Synchronisation..." : "Mettre à jour"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function DrawerProp({ label, icon, children }: { label: string, icon: React.ReactNode, children: React.ReactNode }) {
    return (
        <div className="space-y-2 pb-4 border-b border-neutral-200 dark:border-neutral-800">
            <label className="flex items-center gap-2 text-[13px] font-semibold text-neutral-600 dark:text-neutral-400 font-inter">
                {icon} {label}
            </label>
            <div>
                {children}
            </div>
        </div>
    );
}
