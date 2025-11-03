"use client";

import { JSX, useState, useMemo, useCallback } from "react";
import { Search, Filter, Upload, Eye, MoreVertical, Plus, Edit, Trash2, ListFilter, Upload as UploadIcon } from "lucide-react";
import { useDropzone } from "react-dropzone";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Checkbox } from "@/components/ui/checkbox";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    Alertdiv as AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface BlogPost {
    id: string;
    category: string;
    title: string;
    content: string;
    image: string;
}

/**
 * Blog component displays a table of blog posts with search, filter, and export functionality.
 *
 * @returns JSX.Element - The blog admin page UI with table.
 */
interface FilterToolProps {
    selectedCategories: string[];
    setSelectedCategories: (categories: string[] | ((prev: string[]) => string[])) => void;
    categories: string[];
}

function FilterTool({ selectedCategories, setSelectedCategories, categories }: FilterToolProps) {
    const handleCategoryToggle = (category: string) => {
        setSelectedCategories(prev =>
            prev.includes(category)
                ? prev.filter(c => c !== category)
                : [...prev, category]
        );
    };

    const handleClearFilters = () => {
        setSelectedCategories([]);
    };

    return (
        <div className="flex items-center gap-2 mb-6">
            <Popover>
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        className="h-8 text-[#353535] font-medium text-sm px-4 flex items-center gap-2 bg-white border border-[#E9E9E9] hover:bg-[#fafafa]"
                    >
                        Use Case{selectedCategories.length > 0 ? `: ${selectedCategories.length} selected` : ""}
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-56 p-2" align="start">
                    <div className="space-y-2">
                        {categories.map((category) => (
                            <div
                                key={category}
                                className="flex items-center space-x-2 cursor-pointer py-1.5 px-2 rounded hover:bg-[#fafafa]"
                                onClick={() => handleCategoryToggle(category)}
                            >
                                <Checkbox
                                    id={category}
                                    checked={selectedCategories.includes(category)}
                                    onCheckedChange={() => handleCategoryToggle(category)}
                                />
                                <label
                                    htmlFor={category}
                                    className="text-sm text-[#353535] cursor-pointer flex-1"
                                >
                                    {category}
                                </label>
                            </div>
                        ))}
                    </div>
                </PopoverContent>
            </Popover>

            {selectedCategories.length > 0 && (
                <button
                    onClick={handleClearFilters}
                    className="flex items-center gap-1 text-sm text-[#353535] hover:text-[#0D978B]"
                >
                    <X className="w-4 h-4" />
                    Clear All
                </button>
            )}
        </div>
    );
}

export default function Blog(): JSX.Element {
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
    const [showFilters, setShowFilters] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [postToDelete, setPostToDelete] = useState<BlogPost | null>(null);
    const [createDialogOpen, setCreateDialogOpen] = useState(false);
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [postToEdit, setPostToEdit] = useState<BlogPost | null>(null);
    const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [newBlogPost, setNewBlogPost] = useState<Partial<BlogPost>>({
        category: "",
        title: "",
        content: "",
        image: "/assets/blog1.jpg",
    });

    // Sample data - replace with actual data fetching
    const [allBlogPosts, setAllBlogPosts] = useState<BlogPost[]>([
        {
            id: "#B001",
            category: "Category A",
            title: "AI in Recruitment",
            content: "Writing Job Descriptions That Attract the Right Talent",
            image: "/assets/blog1.jpg",
        },
        {
            id: "#B002",
            category: "Category A",
            title: "From Offer Letter to First Day",
            content: "Automating Employee Onboarding",
            image: "/assets/blog2.jpg",
        },
        {
            id: "#B003",
            category: "Category B",
            title: "Why Personalized Learning Paths Improve Retention Rates",
            content: "Learn how customized development programs can boost employee engagement and reduce turnover in your organization.",
            image: "/assets/blog3.jpg",
        },
        {
            id: "#B004",
            category: "Category B",
            title: "The Rise of 360° Feedback",
            content: "Empowering Employees Through Peer Reviews",
            image: "/assets/blog4.jpg",
        },
        {
            id: "#B005",
            category: "Category C",
            title: "Succession Planning in the Age of Workforce Mobility",
            content: "Build resilient leadership pipelines that adapt to changing workforce dynamics and ensure business continuity.",
            image: "/assets/blog5.jpg",
        },
    ]);

    // Get unique categories from all blog posts
    const categories = useMemo(() => {
        const uniqueCategories = Array.from(new Set(allBlogPosts.map(post => post.category)));
        return uniqueCategories;
    }, [allBlogPosts]);

    // Filter blog posts based on selected categories and search query
    const blogPosts = useMemo(() => {
        return allBlogPosts.filter(post => {
            const matchesCategory = selectedCategories.length === 0 || selectedCategories.includes(post.category);
            const matchesSearch = searchQuery === "" ||
                post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
                post.category.toLowerCase().includes(searchQuery.toLowerCase());
            return matchesCategory && matchesSearch;
        });
    }, [allBlogPosts, selectedCategories, searchQuery]);

    const handleViewDetails = (post: BlogPost) => {
        // Handle view details action
        console.log("View details for:", post);
    };

    const onDrop = useCallback((acceptedFiles: File[]) => {
        if (acceptedFiles && acceptedFiles.length > 0) {
            const file = acceptedFiles[0];
            setSelectedImageFile(file);

            // Create preview URL
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
                setNewBlogPost(prev => ({ ...prev, image: reader.result as string }));
            };
            reader.readAsDataURL(file);
        }
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp']
        },
        multiple: false,
    });

    const handleCreate = () => {
        setCreateDialogOpen(true);
        // Reset form
        setNewBlogPost({
            category: "",
            title: "",
            content: "",
            image: "/assets/blog1.jpg",
        });
        setSelectedImageFile(null);
        setImagePreview(null);
    };

    const handleCreateSubmit = () => {
        if (newBlogPost.category && newBlogPost.title && newBlogPost.content) {
            // Generate new ID based on current count
            const newId = `#B${String(allBlogPosts.length + 1).padStart(3, "0")}`;

            // Use image preview if file was uploaded, otherwise use the image URL
            const imageUrl = imagePreview || newBlogPost.image || "/assets/blog1.jpg";

            const blogPost: BlogPost = {
                id: newId,
                category: newBlogPost.category,
                title: newBlogPost.title,
                content: newBlogPost.content,
                image: imageUrl,
            };

            setAllBlogPosts(prev => [...prev, blogPost]);
            setCreateDialogOpen(false);
            // Reset form
            setNewBlogPost({
                category: "",
                title: "",
                content: "",
                image: "/assets/blog1.jpg",
            });
            setSelectedImageFile(null);
            setImagePreview(null);
        }
    };

    const handleEdit = (post: BlogPost) => {
        setPostToEdit(post);
        setEditDialogOpen(true);
        // Pre-fill form with existing data
        setNewBlogPost({
            category: post.category,
            title: post.title,
            content: post.content,
            image: post.image,
        });
        // If image is already a data URL, show preview; otherwise show the URL path
        if (post.image.startsWith('data:')) {
            setImagePreview(post.image);
        } else {
            // For URL paths, we'll show them in the preview too
            setImagePreview(post.image);
        }
        setSelectedImageFile(null);
    };

    const handleEditSubmit = () => {
        if (postToEdit && newBlogPost.category && newBlogPost.title && newBlogPost.content) {
            // Use image preview if file was uploaded, otherwise use the image URL
            const imageUrl = imagePreview || newBlogPost.image || "/assets/blog1.jpg";

            setAllBlogPosts(prev => prev.map(post =>
                post.id === postToEdit.id
                    ? {
                        ...post,
                        category: newBlogPost.category!,
                        title: newBlogPost.title!,
                        content: newBlogPost.content!,
                        image: imageUrl,
                    }
                    : post
            ));
            setEditDialogOpen(false);
            setPostToEdit(null);
            // Reset form
            setNewBlogPost({
                category: "",
                title: "",
                content: "",
                image: "/assets/blog1.jpg",
            });
            setSelectedImageFile(null);
            setImagePreview(null);
        }
    };

    const handleDelete = (post: BlogPost) => {
        setPostToDelete(post);
        setDeleteDialogOpen(true);
    };

    const confirmDelete = () => {
        if (postToDelete) {
            setAllBlogPosts(prev => prev.filter(p => p.id !== postToDelete.id));
            setDeleteDialogOpen(false);
            setPostToDelete(null);
        }
    };

    return (
        <div className="flex flex-col">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4 sm:mb-6">
                {/* Page Title */}
                <h1 className="text-[20px] sm:text-[24px]/[30px] text-[#1C1C1C] font-semibold">
                    Blog
                </h1>
                <Button variant="primary" size="md" className="gap-2 bg-[#0D978B] hover:bg-[#0D978B]/90 text-white h-10 px-4 rounded-md w-full sm:w-28" onClick={handleCreate}>
                    <Plus className="size-4" />
                    Create
                </Button>
            </div>
            {/* Search and Action Bar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 mb-4 sm:mb-6 sm:justify-between">
                {/* Search Bar */}
                <div className="relative flex-1 w-full sm:max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 bg-transparent size-4 text-[#8F8F8F]" />
                    <Input
                        type="text"
                        placeholder="Search"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9 h-8.5 bg-transparent border border-[#E9E9E9] rounded-md w-full"
                    />
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-3">
                    <Button
                        variant="outline"
                        className="h-8 text-[#053834] font-semibold text-[14px]/[20px] px-3 sm:px-4 flex items-center gap-2 bg-transparent border border-gray-300 w-full sm:w-auto"
                        onClick={() => setShowFilters(!showFilters)}
                    >
                        <ListFilter
                            className={cn(
                                "w-4 h-4 text-[#053834] transition-transform duration-300",
                                showFilters && "rotate-180"
                            )}
                        />
                        <span className="hidden sm:inline">Filter</span>
                    </Button>
                </div>
            </div>

            {/* Filter Tool - Show/Hide based on showFilters state */}
            {showFilters && (
                <div className="flex flex-wrap items-center gap-2 mb-4 sm:mb-6">
                    <FilterTool
                        selectedCategories={selectedCategories}
                        setSelectedCategories={setSelectedCategories}
                        categories={categories}
                    />
                </div>
            )}

            {/* Mobile Card View */}
            <div className="block md:hidden space-y-3">
                {blogPosts.map((post) => (
                    <Card key={post.id} className="border border-[#e9e9e9]">
                        <CardContent className="p-4">
                            <div className="flex items-start justify-between gap-3 mb-3">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-xs font-medium text-[#8F8F8F]">{post.id}</span>
                                        <span className="text-xs text-[#8F8F8F]">•</span>
                                        <span className="text-xs text-[#8F8F8F]">{post.category}</span>
                                    </div>
                                    <h3 className="text-sm font-medium text-[#353535] mb-2">{post.title}</h3>
                                    <p className="text-xs text-[#8F8F8F] line-clamp-2">{post.content}</p>
                                </div>
                                <img
                                    src={post.image}
                                    alt={post.title}
                                    className="size-16 sm:size-20 rounded-md object-cover flex-shrink-0"
                                />
                            </div>
                            <div className="flex items-center justify-end pt-3 border-t border-[#e9e9e9]">
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <button
                                            type="button"
                                            className="text-[#8F8F8F] hover:text-[#0D978B] cursor-pointer p-1 rounded hover:bg-[#f0f0f0] transition-colors outline-none"
                                            title="More options"
                                        >
                                            <MoreVertical className="size-5" />
                                        </button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent
                                        align="end"
                                        side="bottom"
                                        className="w-40 z-50"
                                    >
                                        <DropdownMenuItem
                                            onClick={() => handleEdit(post)}
                                            className="cursor-pointer"
                                        >
                                            <Edit className="size-4 mr-2" />
                                            Edit
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                            onClick={() => handleDelete(post)}
                                            variant="destructive"
                                            className="cursor-pointer"
                                        >
                                            <Trash2 className="size-4 mr-2" />
                                            Delete
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Table - Desktop View */}
            <Card className=" hidden md:block">
                <CardContent className="p-0 overflow-hidden">
                    <div className="overflow-x-auto !rounded-lg border border-gray-300">
                        <Table>
                            {/* Table Header */}
                            <TableHeader className="bg-[#eef3f2]">
                                <TableRow className="border-b border-[#e9e9e9]">
                                    <TableHead className="px-2 sm:px-4 py-3 sm:py-4 text-left text-xs sm:text-sm font-medium text-[#353535] border-b border-[#e9e9e9] min-w-[80px]">
                                        <div className="flex items-center gap-2">
                                            ID
                                        </div>
                                    </TableHead>
                                    <TableHead className="px-2 sm:px-4 py-3 sm:py-4 text-left text-xs sm:text-sm font-medium text-[#353535] border-b border-[#e9e9e9] hidden md:table-cell min-w-[120px]">
                                        <div className="flex items-center gap-2">
                                            Category
                                        </div>
                                    </TableHead>
                                    <TableHead className="px-2 sm:px-4 py-3 sm:py-4 text-left text-xs sm:text-sm font-medium text-[#353535] border-b border-[#e9e9e9] min-w-[150px]">
                                        <div className="flex items-center gap-2">
                                            Title
                                        </div>
                                    </TableHead>
                                    <TableHead className="px-2 sm:px-4 py-3 sm:py-4 text-left text-xs sm:text-sm font-medium text-[#353535] border-b border-[#e9e9e9] hidden lg:table-cell min-w-[200px]">
                                        <div className="flex items-center gap-2">
                                            Content
                                        </div>
                                    </TableHead>
                                    <TableHead className="px-2 sm:px-4 py-3 sm:py-4 text-left text-xs sm:text-sm font-medium text-[#353535] border-b border-[#e9e9e9] hidden sm:table-cell min-w-[80px]">
                                        <div className="flex items-center gap-2">
                                            Image
                                        </div>
                                    </TableHead>
                                    <TableHead className="px-2 sm:px-4 py-3 sm:py-4 text-right text-xs sm:text-sm font-medium text-[#353535] border-b border-[#e9e9e9] min-w-[80px]">
                                        Actions
                                    </TableHead>
                                </TableRow>
                            </TableHeader>

                            {/* Table Body */}
                            <TableBody className="bg-white">
                                {blogPosts.map((post, index) => (
                                    <TableRow
                                        key={post.id}
                                        className={cn(
                                            "border-b border-[#e9e9e9] hover:bg-[#fafafa] transition-colors",
                                            index === blogPosts.length - 1 && "border-b-0"
                                        )}
                                    >
                                        {/* ID Column */}
                                        <TableCell className="px-2 sm:px-4 py-3 sm:py-4 text-xs sm:text-sm text-[#353535]">
                                            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-1 sm:gap-2">
                                                <span className="font-medium">{post.id}</span>
                                                {/* Show category on mobile */}
                                                <span className="md:hidden text-xs text-[#8F8F8F]">{post.category}</span>
                                            </div>
                                        </TableCell>

                                        {/* Category Column */}
                                        <TableCell className="px-2 sm:px-4 py-3 sm:py-4 text-xs sm:text-sm text-[#353535] hidden md:table-cell">
                                            <div className="flex items-center gap-2">
                                                <span>{post.category}</span>
                                            </div>
                                        </TableCell>

                                        {/* Title Column */}
                                        <TableCell className="px-2 sm:px-4 py-3 sm:py-4 text-xs sm:text-sm text-[#353535]">
                                            <div className="flex flex-col gap-1">
                                                <span className="font-medium">{post.title}</span>
                                                {/* Show content preview on mobile/tablet */}
                                                <span className="lg:hidden text-xs text-[#8F8F8F] line-clamp-2">{post.content}</span>
                                            </div>
                                        </TableCell>

                                        {/* Content Column */}
                                        <TableCell className="px-2 sm:px-4 py-3 sm:py-4 text-xs sm:text-sm text-[#353535] hidden lg:table-cell">
                                            <div className="flex items-center gap-2">
                                                <span className="max-w-md truncate">{post.content}</span>
                                            </div>
                                        </TableCell>

                                        {/* Image Column */}
                                        <TableCell className="px-2 sm:px-4 py-3 sm:py-4 text-xs sm:text-sm text-[#353535] hidden sm:table-cell">
                                            <div className="flex items-center gap-2">
                                                <img
                                                    src={post.image}
                                                    alt={post.title}
                                                    className="size-8 sm:size-10 rounded-md object-cover"
                                                />
                                            </div>
                                        </TableCell>

                                        {/* Actions Column */}
                                        <TableCell className="px-2 sm:px-4 py-3 sm:py-4">
                                            <div className="flex items-center justify-end gap-2">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <button
                                                            type="button"
                                                            className="text-[#8F8F8F] hover:text-[#0D978B] cursor-pointer p-1 rounded hover:bg-[#f0f0f0] transition-colors outline-none"
                                                            title="More options"
                                                        >
                                                            <MoreVertical className="size-4 sm:size-5" />
                                                        </button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent
                                                        align="end"
                                                        side="bottom"
                                                        className="w-40 z-50"
                                                    >
                                                        <DropdownMenuItem
                                                            onClick={() => handleEdit(post)}
                                                            className="cursor-pointer"
                                                        >
                                                            <Edit className="size-4 mr-2" />
                                                            Edit
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem
                                                            onClick={() => handleDelete(post)}
                                                            variant="destructive"
                                                            className="cursor-pointer"
                                                        >
                                                            <Trash2 className="size-4 mr-2" />
                                                            Delete
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>

            {/* Create Blog Post Dialog */}
            <Dialog open={createDialogOpen} onOpenChange={(open) => {
                setCreateDialogOpen(open);
                if (!open) {
                    // Reset form when dialog closes
                    setNewBlogPost({
                        category: "",
                        title: "",
                        content: "",
                        image: "/assets/blog1.jpg",
                    });
                    setSelectedImageFile(null);
                    setImagePreview(null);
                }
            }}>
                <DialogContent className="max-w-2xl w-[calc(100vw-2rem)] sm:w-full max-h-[90vh] overflow-y-auto">
                    <DialogHeader className="pb-2 sm:pb-4">
                        <DialogTitle className="text-base sm:text-lg md:text-xl">Create New Blog Post</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-3 sm:space-y-4 py-2 sm:py-4">
                        {/* Category Select */}
                        <div className="space-y-2">
                            <Label htmlFor="category" className="text-sm sm:text-base">Category</Label>
                            <Select
                                value={newBlogPost.category}
                                onValueChange={(value) => setNewBlogPost(prev => ({ ...prev, category: value }))}
                            >
                                <SelectTrigger id="category" className="w-full">
                                    <SelectValue placeholder="Select a category" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Category A">Category A</SelectItem>
                                    <SelectItem value="Category B">Category B</SelectItem>
                                    <SelectItem value="Category C">Category C</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Title Input */}
                        <div className="space-y-2">
                            <Label htmlFor="title" className="text-sm sm:text-base">Title</Label>
                            <Input
                                id="title"
                                value={newBlogPost.title}
                                onChange={(e) => setNewBlogPost(prev => ({ ...prev, title: e.target.value }))}
                                placeholder="Enter blog post title"
                            />
                        </div>

                        {/* Content Textarea */}
                        <div className="space-y-2">
                            <Label htmlFor="content" className="text-sm sm:text-base">Content</Label>
                            <Textarea
                                id="content"
                                value={newBlogPost.content}
                                onChange={(e) => setNewBlogPost(prev => ({ ...prev, content: e.target.value }))}
                                placeholder="Enter blog post content"
                                rows={6}
                                className="resize-none"
                            />
                        </div>

                        {/* Image Upload */}
                        <div className="space-y-2">
                            <Label className="text-sm sm:text-base">Image</Label>
                            <div
                                {...getRootProps()}
                                className={cn(
                                    "border-2 border-dashed rounded-md p-4 sm:p-6 md:p-8 text-center cursor-pointer transition-colors",
                                    isDragActive
                                        ? "border-[#0D978B] bg-[#0D978B]/5"
                                        : "border-gray-300 hover:border-[#0D978B] hover:bg-[#0D978B]/5"
                                )}
                            >
                                <input {...getInputProps()} />
                                {imagePreview ? (
                                    <div className="flex flex-col items-center gap-4">
                                        <img
                                            src={imagePreview}
                                            alt="Preview"
                                            className="max-h-32 sm:max-h-40 md:max-h-48 max-w-full rounded-md object-cover"
                                        />
                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setSelectedImageFile(null);
                                                setImagePreview(null);
                                                setNewBlogPost(prev => ({ ...prev, image: "/assets/blog1.jpg" }));
                                            }}
                                            className="text-sm text-red-600 hover:text-red-700"
                                        >
                                            Remove image
                                        </button>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center gap-2 sm:gap-3">
                                        <UploadIcon className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 text-[#0D978B]" />
                                        <div className="text-xs sm:text-sm">
                                            <span className="text-gray-500">Drop file or </span>
                                            <span className="text-[#0D978B] underline">click to upload</span>
                                        </div>
                                        <p className="text-[10px] sm:text-xs text-gray-400">PNG, JPG, GIF up to 10MB</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                    <DialogFooter className="flex-col sm:flex-row gap-2 sm:gap-0 pt-2 sm:pt-0">
                        <Button
                            variant="outline"
                            onClick={() => {
                                setCreateDialogOpen(false);
                                setNewBlogPost({
                                    category: "",
                                    title: "",
                                    content: "",
                                    image: "/assets/blog1.jpg",
                                });
                                setSelectedImageFile(null);
                                setImagePreview(null);
                            }}
                            className="w-full sm:w-auto order-2 sm:order-1"
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="primary"
                            onClick={handleCreateSubmit}
                            disabled={!newBlogPost.category || !newBlogPost.title || !newBlogPost.content || !imagePreview}
                            className="w-full sm:w-auto order-1 sm:order-2"
                        >
                            Create
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Edit Blog Post Dialog */}
            <Dialog open={editDialogOpen} onOpenChange={(open) => {
                setEditDialogOpen(open);
                if (!open) {
                    // Reset form when dialog closes
                    setPostToEdit(null);
                    setNewBlogPost({
                        category: "",
                        title: "",
                        content: "",
                        image: "/assets/blog1.jpg",
                    });
                    setSelectedImageFile(null);
                    setImagePreview(null);
                }
            }}>
                <DialogContent className="max-w-2xl w-[calc(100vw-2rem)] sm:w-full max-h-[90vh] overflow-y-auto">
                    <DialogHeader className="pb-2 sm:pb-4">
                        <DialogTitle className="text-base sm:text-lg md:text-xl">Edit Blog Post</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-3 sm:space-y-4 py-2 sm:py-4">
                        {/* Category Select */}
                        <div className="space-y-2">
                            <Label htmlFor="edit-category" className="text-sm sm:text-base">Category</Label>
                            <Select
                                value={newBlogPost.category}
                                onValueChange={(value) => setNewBlogPost(prev => ({ ...prev, category: value }))}
                            >
                                <SelectTrigger id="edit-category" className="w-full">
                                    <SelectValue placeholder="Select a category" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Category A">Category A</SelectItem>
                                    <SelectItem value="Category B">Category B</SelectItem>
                                    <SelectItem value="Category C">Category C</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Title Input */}
                        <div className="space-y-2">
                            <Label htmlFor="edit-title" className="text-sm sm:text-base">Title</Label>
                            <Input
                                id="edit-title"
                                value={newBlogPost.title}
                                onChange={(e) => setNewBlogPost(prev => ({ ...prev, title: e.target.value }))}
                                placeholder="Enter blog post title"
                            />
                        </div>

                        {/* Content Textarea */}
                        <div className="space-y-2">
                            <Label htmlFor="edit-content" className="text-sm sm:text-base">Content</Label>
                            <Textarea
                                id="edit-content"
                                value={newBlogPost.content}
                                onChange={(e) => setNewBlogPost(prev => ({ ...prev, content: e.target.value }))}
                                placeholder="Enter blog post content"
                                rows={6}
                                className="resize-none"
                            />
                        </div>

                        {/* Image Upload */}
                        <div className="space-y-2">
                            <Label className="text-sm sm:text-base">Image</Label>
                            <div
                                {...getRootProps()}
                                className={cn(
                                    "border-2 border-dashed rounded-md p-4 sm:p-6 md:p-8 text-center cursor-pointer transition-colors",
                                    isDragActive
                                        ? "border-[#0D978B] bg-[#0D978B]/5"
                                        : "border-gray-300 hover:border-[#0D978B] hover:bg-[#0D978B]/5"
                                )}
                            >
                                <input {...getInputProps()} />
                                {imagePreview ? (
                                    <div className="flex flex-col items-center gap-4">
                                        <img
                                            src={imagePreview}
                                            alt="Preview"
                                            className="max-h-32 sm:max-h-40 md:max-h-48 max-w-full rounded-md object-cover"
                                        />
                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setSelectedImageFile(null);
                                                setImagePreview(null);
                                                setNewBlogPost(prev => ({ ...prev, image: "/assets/blog1.jpg" }));
                                            }}
                                            className="text-sm text-red-600 hover:text-red-700"
                                        >
                                            Remove image
                                        </button>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center gap-2 sm:gap-3">
                                        <UploadIcon className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 text-[#0D978B]" />
                                        <div className="text-xs sm:text-sm">
                                            <span className="text-gray-500">Drop file or </span>
                                            <span className="text-[#0D978B] underline">click to upload</span>
                                        </div>
                                        <p className="text-[10px] sm:text-xs text-gray-400">PNG, JPG, GIF up to 10MB</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                    <DialogFooter className="flex-col sm:flex-row gap-2 sm:gap-0 pt-2 sm:pt-0">
                        <Button
                            variant="outline"
                            onClick={() => {
                                setEditDialogOpen(false);
                                setPostToEdit(null);
                                setNewBlogPost({
                                    category: "",
                                    title: "",
                                    content: "",
                                    image: "/assets/blog1.jpg",
                                });
                                setSelectedImageFile(null);
                                setImagePreview(null);
                            }}
                            className="w-full sm:w-auto order-2 sm:order-1"
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="primary"
                            onClick={handleEditSubmit}
                            disabled={!newBlogPost.category || !newBlogPost.title || !newBlogPost.content || !imagePreview}
                            className="w-full sm:w-auto order-1 sm:order-2"
                        >
                            Save
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent className="w-[calc(100vw-2rem)] sm:w-full max-w-md">
                    <AlertDialogHeader className="pb-2 sm:pb-4">
                        <AlertDialogTitle className="text-base sm:text-lg">Delete Blog Post</AlertDialogTitle>
                        <AlertDialogDescription className="text-sm sm:text-base pt-1 sm:pt-2">
                            Are you sure you want to delete "{postToDelete?.title}"? This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="flex-col sm:flex-row gap-2 sm:gap-0 pt-2 sm:pt-0">
                        <AlertDialogCancel
                            onClick={() => {
                                setDeleteDialogOpen(false);
                                setPostToDelete(null);
                            }}
                            className="w-full sm:w-auto order-2 sm:order-1 mt-0 sm:mt-0"
                        >
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={confirmDelete}
                            className="bg-red-600 hover:bg-red-700 text-white w-full sm:w-auto order-1 sm:order-2"
                        >
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
