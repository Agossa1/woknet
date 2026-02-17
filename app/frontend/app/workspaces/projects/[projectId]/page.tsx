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
    MoreVertical,
    Calendar,
    User as UserIcon,
    MessageSquare,
    Tag,
    Filter,
    Search,
    ArrowLeft,
    X,
    Clock,
    CheckCircle2
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
    const [tagColor, setTagColor] = useState("#6366f1");
    const [showTagForm, setShowTagForm] = useState(false);
    const [catName, setCatName] = useState("");
    const [catColor, setCatColor] = useState("#3b82f6");
    const [showCatForm, setShowCatForm] = useState(false);

    // Filters & Search
    const [searchQuery, setSearchQuery] = useState("");
    const [filterPriority, setFilterPriority] = useState<string | null>(null);
    const [filterAssignee, setFilterAssignee] = useState<string | null>(null);

    // Pour éviter les erreurs d'hydratation avec dnd
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

        // Update optimiste
        dispatch(moveTaskOptimistically({ taskId: draggableId, statusId: newStatusId }));

        // Appel API
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
            // 1. Upload to Cloudinary
            const uploadRes = await dispatch(uploadTaskAttachmentThunk(file)).unwrap();

            // 2. Save metadata to DB
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
            <div className="flex justify-center items-center h-[80vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
            </div>
        );
    }

    return (
        <div className="h-[90vh] flex flex-col overflow-hidden">
            {/* Header du Board */}
            <div className="px-6 py-4 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between shadow-sm z-10">
                <div className="flex items-center gap-4">
                    <Link href={`/workspaces/${board?.statuses[0]?.project_id ? '..' : '..'}`} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors border border-gray-100 dark:border-gray-700">
                        <ArrowLeft size={18} />
                    </Link>
                    <div>
                        <h1 className="text-xl font-bold text-gray-900 dark:text-white leading-tight">Tableau Kanban</h1>
                        <div className="flex items-center gap-2 text-xs text-gray-400">
                            <span className="bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 px-1.5 py-0.5 rounded font-mono">#{projectId?.toString().slice(0, 6)}</span>
                            <span>•</span>
                            <span className="font-semibold">{board?.tasks.length || 0} Tâches actives</span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <div className="relative hidden md:block group">
                        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
                        <input
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Rechercher une tâche ou #ID..."
                            className="pl-9 pr-4 py-1.5 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl text-xs w-64 focus:ring-2 focus:ring-indigo-500 focus:bg-white dark:focus:bg-gray-900 transition-all outline-none"
                        />
                    </div>

                    {/* Select Priority Filter */}
                    <select
                        value={filterPriority || ""}
                        onChange={(e) => setFilterPriority(e.target.value || null)}
                        className="px-3 py-1.5 text-xs font-semibold text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                    >
                        <option value="">Priorité (Toutes)</option>
                        <option value="low">Faible</option>
                        <option value="medium">Moyenne</option>
                        <option value="high">Haute</option>
                        <option value="blocker">Bloquant</option>
                    </select>

                    <select
                        value={filterAssignee || ""}
                        onChange={(e) => setFilterAssignee(e.target.value || null)}
                        className="px-3 py-1.5 text-xs font-semibold text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                    >
                        <option value="">Assigné (Tous)</option>
                        {members.map(m => (
                            <option key={m.user_id} value={m.user_id}>{m.display_name}</option>
                        ))}
                    </select>

                    {(searchQuery || filterPriority || filterAssignee) && (
                        <button
                            onClick={() => { setSearchQuery(""); setFilterPriority(null); setFilterAssignee(null); }}
                            className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
                            title="Effacer les filtres"
                        >
                            <X size={16} />
                        </button>
                    )}
                </div>
            </div>

            {/* Kanban Horizontal Scroll Container */}
            <DragDropContext onDragEnd={onDragEnd}>
                <div className="flex-1 overflow-x-auto p-6 bg-[#f8fafc] dark:bg-[#0f172a]/40">
                    <div className="flex gap-6 h-full min-w-max pb-4">
                        {board?.statuses.map((status: WPStatus) => (
                            <Droppable key={status.id} droppableId={status.id}>
                                {(provided, snapshot) => (
                                    <div
                                        {...provided.droppableProps}
                                        ref={provided.innerRef}
                                        className={`w-80 flex flex-col h-full rounded-2xl transition-colors duration-200 ${snapshot.isDraggingOver ? 'bg-indigo-50/50 dark:bg-indigo-900/10' : ''}`}
                                    >
                                        {/* Column Header */}
                                        <div className="flex items-center justify-between mb-4 px-2 shrink-0">
                                            <div className="flex items-center gap-2.5">
                                                <div className="w-2.5 h-2.5 rounded-full shadow-sm" style={{ backgroundColor: status.color }} />
                                                <h3 className="font-bold text-gray-800 dark:text-gray-100 uppercase tracking-wider text-[11px]">
                                                    {status.label}
                                                </h3>
                                                <span className="bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 text-[10px] font-bold px-2 py-0.5 rounded-full border border-gray-100 dark:border-gray-700">
                                                    {tasksByStatus[status.id]?.length || 0}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-0.5">
                                                <button
                                                    onClick={() => openCreateModal(status.id)}
                                                    className="p-1.5 hover:bg-white dark:hover:bg-gray-800 rounded-lg text-gray-400 hover:text-indigo-600 transition-all"
                                                >
                                                    <Plus size={16} />
                                                </button>
                                            </div>
                                        </div>

                                        {/* Column Tasks Container */}
                                        <div className="flex-1 space-y-3 overflow-y-auto pr-2 scrollbar-hide">
                                            {tasksByStatus[status.id]?.map((task: WPTask, index: number) => (
                                                <Draggable key={task.id} draggableId={task.id} index={index}>
                                                    {(provided, snapshot) => (
                                                        <div
                                                            ref={provided.innerRef}
                                                            {...provided.draggableProps}
                                                            {...provided.dragHandleProps}
                                                            onClick={() => openDetailDrawer(task)}
                                                            style={{
                                                                ...provided.draggableProps.style,
                                                                transform: snapshot.isDragging ? provided.draggableProps.style?.transform : 'none'
                                                            }}
                                                            className={`bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all active:ring-2 active:ring-indigo-500/20 group relative overflow-hidden cursor-pointer ${snapshot.isDragging ? 'shadow-2xl ring-2 ring-indigo-500 z-50 scale-[1.02]' : ''}`}
                                                        >

                                                            <div className="flex items-start justify-between mb-2">
                                                                <div className="flex items-center gap-1.5">
                                                                    <div className={`w-2 h-2 rounded-full ${task.priority === 'blocker' || task.priority === 'high' ? 'bg-red-500' :
                                                                        task.priority === 'medium' ? 'bg-amber-500' : 'bg-emerald-500'
                                                                        }`} />
                                                                    <span className="text-[10px] font-semibold text-gray-500 dark:text-gray-400 capitalize">
                                                                        {task.priority}
                                                                    </span>
                                                                    {task.category_name && (
                                                                        <>
                                                                            <span className="text-gray-300 dark:text-gray-600 px-1">•</span>
                                                                            <span className="text-[10px] font-semibold" style={{ color: task.category_color || undefined }}>
                                                                                {task.category_name}
                                                                            </span>
                                                                        </>
                                                                    )}
                                                                </div>
                                                                <span className="text-[10px] text-gray-400 font-mono">
                                                                    #{task.task_number}
                                                                </span>
                                                            </div>

                                                            {task.tags && task.tags.length > 0 && (
                                                                <div className="flex flex-wrap gap-1 mb-2.5">
                                                                    {task.tags.map(tag => (
                                                                        <span key={tag.id} className="text-[10px] font-medium px-1.5 py-0.5 rounded-md border border-gray-100 dark:border-gray-800 text-gray-500 bg-gray-50/50 dark:bg-gray-900/50">
                                                                            {tag.name}
                                                                        </span>
                                                                    ))}
                                                                </div>
                                                            )}

                                                            <h4 className="font-semibold text-gray-900 dark:text-white text-sm mb-1.5 line-clamp-2 leading-snug transition-colors">
                                                                {task.title}
                                                            </h4>

                                                            {task.description && (
                                                                <p className="text-[12px] text-gray-400 dark:text-gray-500 mb-4 line-clamp-2 leading-relaxed">
                                                                    {task.description}
                                                                </p>
                                                            )}

                                                            <div className="flex items-center justify-between pt-3 border-t border-gray-50 dark:border-gray-800/50">
                                                                <div className="flex -space-x-1 items-center">
                                                                    {(() => {
                                                                        const profile = getAssigneeProfile(task.assignee_id);
                                                                        return profile ? (
                                                                            <div title={profile.display_name} className="w-5 h-5 rounded-full ring-2 ring-white dark:ring-gray-800 bg-gray-100 dark:bg-gray-800 flex items-center justify-center overflow-hidden border border-gray-100 dark:border-gray-700">
                                                                                {profile.avatar_url ? (
                                                                                    <img src={profile.avatar_url} alt={profile.display_name} className="w-full h-full object-cover" />
                                                                                ) : (
                                                                                    <span className="text-gray-600 dark:text-gray-400 text-[8px] font-bold uppercase">{profile.display_name.slice(0, 2)}</span>
                                                                                )}
                                                                            </div>
                                                                        ) : (
                                                                            <div className="w-5 h-5 rounded-full ring-2 ring-white dark:ring-gray-800 bg-gray-50 dark:bg-gray-900/50 flex items-center justify-center text-gray-300 text-[8px] border border-gray-100 dark:border-gray-800">
                                                                                <UserIcon size={10} />
                                                                            </div>
                                                                        );
                                                                    })()}
                                                                    {task.due_date && (
                                                                        <div className="ml-2 flex items-center gap-1 text-[10px] text-gray-400 font-medium">
                                                                            <Calendar size={10} className={(() => {
                                                                                const today = new Date();
                                                                                today.setHours(0, 0, 0, 0);
                                                                                return new Date(task.due_date) < today ? 'text-red-400' : 'text-gray-300';
                                                                            })()} />
                                                                            <span className={(() => {
                                                                                const today = new Date();
                                                                                today.setHours(0, 0, 0, 0);
                                                                                return new Date(task.due_date) < today ? 'text-red-500' : '';
                                                                            })()}>
                                                                                {new Date(task.due_date).toLocaleDateString([], { day: 'numeric', month: 'short' })}
                                                                            </span>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                                <div className="flex items-center gap-3 text-gray-400/80">
                                                                    {task.checklist_total && task.checklist_total > 0 ? (
                                                                        <div className="flex items-center gap-1 text-[10px]">
                                                                            <CheckCircle2 size={12} className={task.checklist_completed === task.checklist_total ? 'text-emerald-400' : ''} />
                                                                            <span>{task.checklist_completed}/{task.checklist_total}</span>
                                                                        </div>
                                                                    ) : null}
                                                                    <div className="flex items-center gap-1 text-[10px]">
                                                                        <MessageSquare size={12} />
                                                                        <span>{task.comment_count || 0}</span>
                                                                    </div>
                                                                    {task.story_points && (
                                                                        <div className="text-[10px] font-mono text-gray-400">
                                                                            {task.story_points}pt
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}
                                                </Draggable>
                                            ))}
                                            {provided.placeholder}

                                            {/* Add Task Quick Access */}
                                            <button
                                                onClick={() => openCreateModal(status.id)}
                                                className="w-full py-4 rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-800 flex items-center justify-center gap-2 text-[12px] font-bold text-gray-400 hover:border-indigo-300 hover:bg-white dark:hover:bg-gray-800 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all group mt-2"
                                            >
                                                <Plus size={16} className="group-hover:rotate-90 transition-transform duration-300" />
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

            {/* Modal Création Tâche */}
            {isTaskModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-300">
                    <div className="bg-white dark:bg-gray-900 rounded-3xl w-full max-w-lg p-8 shadow-2xl animate-in zoom-in-95 duration-300 border border-gray-200 dark:border-gray-800">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tight">Nouvelle tâche</h2>
                            <div className="w-10 h-10 bg-indigo-50 dark:bg-indigo-900/30 rounded-full flex items-center justify-center text-indigo-600">
                                <Plus size={24} />
                            </div>
                        </div>

                        <form onSubmit={handleCreateTask} className="space-y-6">
                            <div className="space-y-1.5">
                                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Titre de la tâche</label>
                                <input
                                    autoFocus
                                    type="text"
                                    value={taskTitle}
                                    onChange={(e) => setTaskTitle(e.target.value)}
                                    placeholder="Qu'est-ce qu'on fait ?"
                                    className="w-full px-5 py-3.5 rounded-2xl border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 text-gray-900 dark:text-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all placeholder:text-gray-400 font-bold"
                                    required
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Description</label>
                                <textarea
                                    value={taskDesc}
                                    onChange={(e) => setTaskDesc(e.target.value)}
                                    rows={4}
                                    placeholder="Ajoutez des détails, des notes ou des instructions..."
                                    className="w-full px-5 py-3.5 rounded-2xl border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 text-gray-900 dark:text-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none resize-none transition-all text-sm font-medium"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-5">
                                <div className="space-y-1.5">
                                    <label className="block text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Priorité</label>
                                    <select
                                        value={taskPriority}
                                        onChange={(e) => setTaskPriority(e.target.value)}
                                        className="w-full px-5 py-3.5 rounded-2xl border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 text-gray-900 dark:text-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none appearance-none font-bold"
                                    >
                                        <option value="low">Faible</option>
                                        <option value="medium">Moyenne</option>
                                        <option value="high">Haute</option>
                                        <option value="blocker">Bloquant</option>
                                    </select>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="block text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Échéance</label>
                                    <div className="relative group">
                                        <Calendar size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
                                        <input type="text" placeholder="Bientôt..." className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 text-gray-400 font-bold outline-none cursor-not-allowed" disabled />
                                    </div>
                                </div>
                                <div className="col-span-2 space-y-1.5">
                                    <label className="block text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Assigner à</label>
                                    <select
                                        value={taskAssignee}
                                        onChange={(e) => setTaskAssignee(e.target.value)}
                                        className="w-full px-5 py-3.5 rounded-2xl border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 text-gray-900 dark:text-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none appearance-none font-bold"
                                    >
                                        <option value="">Non assigné</option>
                                        {members.map(m => (
                                            <option key={m.user_id} value={m.user_id}>{m.display_name} (@{m.username})</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="flex gap-4 pt-6 border-t border-gray-100 dark:border-gray-800/50">
                                <button type="button" onClick={() => setIsTaskModalOpen(false)} className="flex-1 px-4 py-4 rounded-2xl font-black text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all uppercase tracking-widest text-xs">Fermer</button>
                                <button type="submit" className="flex-2 px-8 py-4 rounded-2xl font-black text-white bg-indigo-600 hover:bg-indigo-700 shadow-xl shadow-indigo-200 dark:shadow-none transition-all active:scale-[0.98] uppercase tracking-widest text-xs">Créer la tâche</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            {/* Drawer Détail Tâche */}
            {isDetailDrawerOpen && editingTask && (
                <div className="fixed inset-0 z-[150] flex justify-end animate-in fade-in duration-300">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsDetailDrawerOpen(false)} />
                    <div className="relative w-full max-w-2xl bg-white dark:bg-gray-950 h-full shadow-2xl animate-in slide-in-from-right duration-300 border-l border-gray-200 dark:border-gray-800 flex flex-col">

                        {/* Drawer Header */}
                        <div className="flex items-center justify-between px-8 py-6 border-b border-gray-100 dark:border-gray-800/50">
                            <div className="flex items-center gap-3">
                                <span className="bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 px-2 py-1 rounded-lg font-mono text-xs font-bold">
                                    ID-{editingTask.task_number}
                                </span>
                                <div className="h-4 w-px bg-gray-200 dark:bg-gray-800" />
                                <span className="text-xs text-gray-400 font-medium italic">Créé par Vous</span>
                            </div>
                            <button onClick={() => setIsDetailDrawerOpen(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-all text-gray-400 hover:text-gray-900 dark:hover:text-white">
                                <X size={20} />
                            </button>
                        </div>

                        {/* Drawer Content */}
                        <div className="flex-1 overflow-y-auto p-8 space-y-8">
                            {/* Title Section */}
                            <div className="space-y-2">
                                <input
                                    value={editTitle}
                                    onChange={(e) => setEditTitle(e.target.value)}
                                    className="w-full text-3xl font-black bg-transparent border-none focus:ring-0 text-gray-900 dark:text-white placeholder:text-gray-300 p-0"
                                    placeholder="Titre de la tâche..."
                                />
                            </div>

                            {/* Property Grid */}
                            <div className="grid grid-cols-2 gap-x-12 gap-y-6 bg-gray-50/50 dark:bg-gray-900/40 p-6 rounded-2xl border border-gray-100 dark:border-gray-800/50">
                                <div className="space-y-1.5 font-bold">
                                    <label className="flex items-center gap-2 text-[10px] text-gray-400 uppercase tracking-widest leading-none">
                                        <Clock size={12} /> Statut
                                    </label>
                                    <select
                                        value={editStatus}
                                        onChange={(e) => setEditStatus(e.target.value)}
                                        className="w-full text-sm bg-transparent border-none focus:ring-0 p-0 text-gray-700 dark:text-gray-300 font-bold appearance-none cursor-pointer"
                                    >
                                        {board?.statuses.map(s => (
                                            <option key={s.id} value={s.id}>{s.label}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="space-y-1.5 font-bold">
                                    <label className="flex items-center gap-2 text-[10px] text-gray-400 uppercase tracking-widest leading-none">
                                        <Tag size={12} /> Priorité
                                    </label>
                                    <select
                                        value={editPriority}
                                        onChange={(e) => setEditPriority(e.target.value)}
                                        className="w-full text-sm bg-transparent border-none focus:ring-0 p-0 text-gray-700 dark:text-gray-300 font-bold appearance-none cursor-pointer"
                                    >
                                        <option value="low">Faible</option>
                                        <option value="medium">Moyenne</option>
                                        <option value="high">Haute</option>
                                        <option value="blocker">Bloquant</option>
                                    </select>
                                </div>

                                <div className="space-y-1.5 font-bold">
                                    <label className="flex items-center gap-2 text-[10px] text-gray-400 uppercase tracking-widest leading-none">
                                        <UserIcon size={12} /> Assigné à
                                    </label>
                                    <select
                                        value={editAssignee}
                                        onChange={(e) => setEditAssignee(e.target.value)}
                                        className="w-full text-sm bg-transparent border-none focus:ring-0 p-0 text-gray-700 dark:text-gray-300 font-bold appearance-none cursor-pointer"
                                    >
                                        <option value="">Non assigné</option>
                                        {members.map(m => (
                                            <option key={m.user_id} value={m.user_id}>{m.display_name}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="space-y-1.5 font-bold">
                                    <label className="flex items-center gap-2 text-[10px] text-gray-400 uppercase tracking-widest leading-none">
                                        <Calendar size={12} /> Échéance
                                    </label>
                                    <input
                                        type="date"
                                        value={editDueDate || ""}
                                        onChange={(e) => setEditDueDate(e.target.value || null)}
                                        className="w-full text-sm bg-transparent border-none focus:ring-0 p-0 text-gray-700 dark:text-gray-300 font-bold appearance-none cursor-pointer"
                                    />
                                </div>

                                <div className="col-span-2 space-y-3 pt-4 border-t border-gray-100 dark:border-gray-800/30">
                                    <div className="flex items-center justify-between">
                                        <label className="flex items-center gap-2 text-[10px] text-gray-400 uppercase tracking-widest leading-none font-bold">
                                            <Tag size={12} /> Étiquettes
                                        </label>
                                    </div>

                                    <div className="flex flex-wrap gap-1.5">
                                        {projectTags.map(tag => {
                                            const isSelected = editingTask.tags?.some(t => t.id === tag.id);
                                            return (
                                                <button
                                                    key={tag.id}
                                                    onClick={() => toggleTag(tag.id)}
                                                    className={`px-2 py-1 rounded-lg text-[11px] font-medium transition-colors border ${isSelected
                                                        ? 'bg-gray-100 dark:bg-gray-800'
                                                        : 'bg-transparent border-gray-100 dark:border-gray-800 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200'
                                                        }`}
                                                    style={{
                                                        color: isSelected ? tag.color : undefined,
                                                        borderColor: isSelected ? `${tag.color}40` : undefined
                                                    }}
                                                >
                                                    {tag.name}
                                                </button>
                                            );
                                        })}

                                        {!showTagForm ? (
                                            <button
                                                onClick={() => setShowTagForm(true)}
                                                className="px-2 py-1 rounded-lg text-[11px] font-bold text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors border border-dashed border-indigo-200 dark:border-indigo-800/50"
                                            >
                                                +
                                            </button>
                                        ) : (
                                            <form onSubmit={handleCreateTag} className="flex items-center gap-2">
                                                <input
                                                    type="text"
                                                    value={tagName}
                                                    onChange={(e) => setTagName(e.target.value)}
                                                    placeholder="Nouvelle..."
                                                    className="text-[11px] bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-2 py-1 outline-none w-24"
                                                    autoFocus
                                                    onBlur={() => !tagName && setShowTagForm(false)}
                                                />
                                                <input
                                                    type="color"
                                                    value={tagColor}
                                                    onChange={(e) => setTagColor(e.target.value)}
                                                    className="w-4 h-4 rounded-full border-none p-0 cursor-pointer overflow-hidden bg-transparent"
                                                />
                                                <button type="submit" className="hidden" />
                                            </form>
                                        )}
                                        {projectTags.length === 0 && !showTagForm && (
                                            <span className="text-[11px] text-gray-400 italic">Aucune étiquette</span>
                                        )}
                                    </div>
                                </div>

                                {/* Categories Section */}
                                <div className="col-span-2 space-y-3 pt-4 border-t border-gray-100 dark:border-gray-800/30">
                                    <div className="flex items-center justify-between">
                                        <label className="flex items-center gap-2 text-[10px] text-gray-400 uppercase tracking-widest leading-none font-bold">
                                            <MoreVertical size={12} /> Catégorie
                                        </label>
                                    </div>

                                    <div className="flex flex-wrap gap-1.5">
                                        <button
                                            onClick={() => setEditCategory("")}
                                            className={`px-2 py-1 rounded-lg text-[11px] font-medium transition-colors border ${!editCategory
                                                ? 'bg-gray-100 dark:bg-gray-800 border-gray-300 text-gray-700 dark:text-gray-300'
                                                : 'bg-transparent border-gray-100 dark:border-gray-800 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200'
                                                }`}
                                        >
                                            Aucune
                                        </button>
                                        {categories.map(cat => (
                                            <button
                                                key={cat.id}
                                                onClick={() => setEditCategory(cat.id)}
                                                className={`px-2 py-1 rounded-lg text-[11px] font-medium transition-colors border ${editCategory === cat.id
                                                    ? 'bg-gray-100 dark:bg-gray-800'
                                                    : 'bg-transparent border-gray-100 dark:border-gray-800 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200'
                                                    }`}
                                                style={{
                                                    color: editCategory === cat.id ? cat.color : undefined,
                                                    borderColor: editCategory === cat.id ? `${cat.color}40` : undefined
                                                }}
                                            >
                                                {cat.name}
                                            </button>
                                        ))}

                                        {!showCatForm ? (
                                            <button
                                                onClick={() => setShowCatForm(true)}
                                                className="px-2 py-1 rounded-lg text-[11px] font-bold text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors border border-dashed border-indigo-200 dark:border-indigo-800/50"
                                            >
                                                +
                                            </button>
                                        ) : (
                                            <form onSubmit={handleCreateCategory} className="flex items-center gap-2">
                                                <input
                                                    type="text"
                                                    value={catName}
                                                    onChange={(e) => setCatName(e.target.value)}
                                                    placeholder="Nouvelle..."
                                                    className="text-[11px] bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-2 py-1 outline-none w-24"
                                                    autoFocus
                                                    onBlur={() => !catName && setShowCatForm(false)}
                                                />
                                                <input
                                                    type="color"
                                                    value={catColor}
                                                    onChange={(e) => setCatColor(e.target.value)}
                                                    className="w-4 h-4 rounded-full border-none p-0 cursor-pointer overflow-hidden bg-transparent"
                                                />
                                                <button type="submit" className="hidden" />
                                            </form>
                                        )}
                                    </div>
                                </div>

                                {/* Checklist Section */}
                                <div className="col-span-2 space-y-4 pt-4 border-t border-gray-100 dark:border-gray-800/30">
                                    <div className="flex items-center justify-between">
                                        <label className="flex items-center gap-2 text-[10px] text-gray-400 uppercase tracking-widest leading-none font-bold">
                                            <CheckCircle2 size={12} /> Checklist ({checklist.filter(i => i.is_completed).length}/{checklist.length})
                                        </label>
                                    </div>
                                    <div className="space-y-2">
                                        {checklist.map(item => (
                                            <div key={item.id} className="flex items-center gap-3 group/item">
                                                <input
                                                    type="checkbox"
                                                    checked={item.is_completed}
                                                    onChange={() => toggleChecklistItem(item.id, item.is_completed)}
                                                    className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                                />
                                                <span className={`flex-1 text-sm ${item.is_completed ? 'text-gray-400 line-through' : 'text-gray-700 dark:text-gray-300'}`}>
                                                    {item.title}
                                                </span>
                                                <button onClick={() => handleDeleteChecklistItem(item.id)} className="opacity-0 group-hover/item:opacity-100 p-1 text-gray-400 hover:text-red-500 transition-all">
                                                    <X size={12} />
                                                </button>
                                            </div>
                                        ))}
                                        <form onSubmit={handleAddChecklistItem} className="flex items-center gap-2 pt-2">
                                            <input
                                                value={newChecklistItem}
                                                onChange={(e) => setNewChecklistItem(e.target.value)}
                                                placeholder="Ajouter un élément..."
                                                className="flex-1 text-sm bg-transparent border-none focus:ring-0 p-0 text-indigo-600 placeholder:text-gray-400 italic"
                                            />
                                            {newChecklistItem && (
                                                <button type="submit" disabled={isChecklisting} className="text-[10px] font-black uppercase text-indigo-600">Ajouter</button>
                                            )}
                                        </form>
                                    </div>
                                </div>

                                {/* Estimation Grid */}
                                <div className="col-span-2 grid grid-cols-3 gap-6 pt-4 border-t border-gray-100 dark:border-gray-800/30">
                                    <div className="space-y-1.5 font-bold">
                                        <label className="text-[10px] text-gray-400 uppercase tracking-widest">Story Pts</label>
                                        <input
                                            type="number"
                                            value={editStoryPoints}
                                            onChange={(e) => setEditStoryPoints(e.target.value ? Number(e.target.value) : "")}
                                            className="w-full text-sm bg-transparent border-none focus:ring-0 p-0 text-gray-700 dark:text-gray-300 font-bold"
                                            placeholder="0"
                                        />
                                    </div>
                                    <div className="space-y-1.5 font-bold">
                                        <label className="text-[10px] text-gray-400 uppercase tracking-widest">Estimé (h)</label>
                                        <input
                                            type="number"
                                            value={editTimeEstimate}
                                            onChange={(e) => setEditTimeEstimate(e.target.value ? Number(e.target.value) : "")}
                                            className="w-full text-sm bg-transparent border-none focus:ring-0 p-0 text-gray-700 dark:text-gray-300 font-bold"
                                            placeholder="0h"
                                        />
                                    </div>
                                    <div className="space-y-1.5 font-bold">
                                        <label className="text-[10px] text-gray-400 uppercase tracking-widest">Réel (h)</label>
                                        <input
                                            type="number"
                                            value={editTimeSpent}
                                            onChange={(e) => setEditTimeSpent(e.target.value ? Number(e.target.value) : "")}
                                            className="w-full text-sm bg-transparent border-none focus:ring-0 p-0 text-gray-700 dark:text-gray-300 font-bold"
                                            placeholder="0h"
                                        />
                                    </div>
                                </div>

                                {/* Attachments Section */}
                                <div className="col-span-2 space-y-4 pt-4 border-t border-gray-100 dark:border-gray-800/30">
                                    <div className="flex items-center justify-between">
                                        <label className="flex items-center gap-2 text-[10px] text-gray-400 uppercase tracking-widest leading-none font-bold">
                                            <Plus size={12} /> Pièces Jointes ({attachments.length})
                                        </label>
                                        <label className="cursor-pointer text-[10px] font-black uppercase text-indigo-600 hover:text-indigo-700 transition-colors">
                                            {isUploading ? "Envoi..." : "Télécharger"}
                                            <input type="file" className="hidden" onChange={handleFileUpload} disabled={isUploading} />
                                        </label>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        {attachments.map((att: any) => (
                                            <a
                                                key={att.id}
                                                href={att.file_url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50 hover:border-indigo-500/30 transition-all group"
                                            >
                                                <div className="w-8 h-8 rounded-lg bg-white dark:bg-gray-800 flex items-center justify-center text-indigo-500 shadow-sm border border-gray-100 dark:border-gray-700">
                                                    <Tag size={16} />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-xs font-bold text-gray-700 dark:text-gray-300 truncate">{att.file_name}</p>
                                                    <p className="text-[10px] text-gray-400">{(att.file_size / 1024).toFixed(1)} KB</p>
                                                </div>
                                            </a>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Description Section */}
                            <div className="space-y-4">
                                <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Description</label>
                                <textarea
                                    value={editDesc}
                                    onChange={(e) => setEditDesc(e.target.value)}
                                    rows={10}
                                    placeholder="Décrivez cette tâche en détail..."
                                    className="w-full text-[15px] leading-relaxed bg-transparent border-none focus:ring-0 text-gray-600 dark:text-gray-400 resize-none p-0 min-h-[200px]"
                                />
                            </div>

                            {/* Comment Section */}
                            <div className="space-y-6 pt-8 border-t border-gray-100 dark:border-gray-800/50">
                                <label className="flex items-center gap-2 text-xs font-black text-gray-400 uppercase tracking-widest">
                                    <MessageSquare size={14} /> Commentaires ({comments.length})
                                </label>

                                {/* Comment List */}
                                <div className="space-y-6">
                                    {comments.map((comment: any) => (
                                        <div key={comment.id} className="flex gap-4 group">
                                            <div className="w-8 h-8 rounded-full bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center shrink-0 border border-indigo-100 dark:border-indigo-800 overflow-hidden">
                                                {comment.avatar_url ? (
                                                    <img src={comment.avatar_url} alt={comment.display_name} className="w-full h-full object-cover" />
                                                ) : (
                                                    <span className="text-indigo-600 dark:text-indigo-400 text-xs font-black uppercase">{comment.display_name?.slice(0, 2)}</span>
                                                )}
                                            </div>
                                            <div className="flex-1 space-y-1">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-xs font-black text-gray-900 dark:text-white uppercase tracking-tight">{comment.display_name}</span>
                                                    <span className="text-[10px] text-gray-400 italic">{new Date(comment.created_at).toLocaleDateString()}</span>
                                                </div>
                                                <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed bg-gray-50 dark:bg-gray-900/40 p-3 rounded-2xl border border-gray-100 dark:border-gray-800/50">
                                                    {comment.content}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Add Comment Form */}
                                <form onSubmit={handleCommentSubmit} className="relative group">
                                    <textarea
                                        value={newComment}
                                        onChange={(e) => setNewComment(e.target.value)}
                                        placeholder="Écrivez un commentaire..."
                                        className="w-full px-5 py-4 rounded-2xl border border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50 text-sm text-gray-900 dark:text-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none resize-none transition-all pr-32"
                                        rows={2}
                                    />
                                    <button
                                        type="submit"
                                        disabled={isCommenting || !newComment.trim()}
                                        className="absolute right-3 bottom-3 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-black uppercase tracking-widest transition-all disabled:opacity-50 disabled:grayscale"
                                    >
                                        {isCommenting ? "Envoi..." : "Envoyer"}
                                    </button>
                                </form>
                            </div>
                        </div>

                        {/* Drawer Footer */}
                        <div className="px-8 py-6 border-t border-gray-100 dark:border-gray-800/50 flex items-center justify-between">
                            <div className="text-[10px] text-gray-400 italic font-medium">
                                Mis à jour {new Date(editingTask.updated_at).toLocaleDateString()}
                            </div>
                            <div className="flex items-center gap-4">
                                <button
                                    onClick={() => setIsDetailDrawerOpen(false)}
                                    className="px-6 py-2.5 rounded-xl text-xs font-black text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all uppercase tracking-widest"
                                >
                                    Annuler
                                </button>
                                <button
                                    onClick={handleUpdateTask}
                                    disabled={isSaving}
                                    className="flex items-center gap-2 px-8 py-2.5 rounded-xl text-xs font-black text-white bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-200 dark:shadow-none transition-all active:scale-[0.98] uppercase tracking-widest disabled:opacity-50"
                                >
                                    {isSaving ? "Enregistrement..." : (
                                        <>
                                            <CheckCircle2 size={14} />
                                            Enregistrer
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
