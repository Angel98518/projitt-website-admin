"use client";

import { JSX, useState } from "react";
import { Search, Filter, Upload, Eye, MoreVertical, Plus, Edit, Trash2 } from "lucide-react";
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
export default function Blog(): JSX.Element {
    const [searchQuery, setSearchQuery] = useState("");

    // Sample data - replace with actual data fetching
    const blogPosts: BlogPost[] = [
        {
            id: "#B001",
            category: "Category A",
            title: "AI in Recruitment",
            content: "Writing Job Descriptions That Attract the Right Talent",
            image: "/images/logo.png",
        },
        {
            id: "#B002",
            category: "Category A",
            title: "From Offer Letter to First Day",
            content: "Automating Employee Onboarding",
            image: "/images/logo.png",
        },
        {
            id: "#B003",
            category: "Category A",
            title: "Why Personalized Learning Paths Improve Retention Rates",
            content: "Learn how customized development programs can boost employee engagement and reduce turnover in your organization.",
            image: "/images/logo.png",
        },
        {
            id: "#B004",
            category: "Category A",
            title: "The Rise of 360° Feedback",
            content: "Empowering Employees Through Peer Reviews",
            image: "/images/logo.png",
        },
        {
            id: "#B005",
            category: "Category A",
            title: "Succession Planning in the Age of Workforce Mobility",
            content: "Build resilient leadership pipelines that adapt to changing workforce dynamics and ensure business continuity.",
            image: "/images/logo.png",
        },
    ];

    const handleViewDetails = (post: BlogPost) => {
        // Handle view details action
        console.log("View details for:", post);
    };

    const handleCreate = () => {
        // Handle create new blog post
        console.log("Create new blog post");
    };

    const handleEdit = (post: BlogPost) => {
        // Handle edit blog post
        console.log("Edit blog post:", post);
    };

    const handleDelete = (post: BlogPost) => {
        // Handle delete blog post
        console.log("Delete blog post:", post);
    };

    return (
        <div className="flex flex-col">
            {/* Page Title */}
            <h1 className="text-[24px]/[30px] text-[#1C1C1C] font-semibold mb-6">
                Blog
            </h1>

            {/* Search and Action Bar */}
            <div className="flex items-center gap-4 mb-6">
                {/* Search Bar */}
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-[#8F8F8F]" />
                    <Input
                        type="text"
                        placeholder="Search"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9 h-8.5"
                    />
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-3">
                    <Button variant="outline" size="md" className="gap-2">
                        <Filter className="size-4" />
                        Filter
                    </Button>
                    <Button variant="outline" size="md" className="gap-2">
                        <Upload className="size-4" />
                        Export
                    </Button>
                    <Button variant="primary" size="md" className="gap-2" onClick={handleCreate}>
                        <Plus className="size-4" />
                        Create
                    </Button>
                </div>
            </div>

            {/* Table */}
            <Card className="border border-[#e9e9e9]">
                <CardContent className="p-0 overflow-visible">
                    <div className="overflow-x-auto">
                        <Table>
                            {/* Table Header */}
                            <TableHeader className="bg-[#eef3f2]">
                                <TableRow className="border-b border-[#e9e9e9]">
                                    <TableHead className="px-4 py-4 text-left text-sm font-medium text-[#353535] border-b border-[#e9e9e9]">
                                        <div className="flex items-center gap-2">
                                            ID

                                        </div>
                                    </TableHead>
                                    <TableHead className="px-4 py-4 text-left text-sm font-medium text-[#353535] border-b border-[#e9e9e9]">
                                        <div className="flex items-center gap-2">
                                            Category

                                        </div>
                                    </TableHead>
                                    <TableHead className="px-4 py-4 text-left text-sm font-medium text-[#353535] border-b border-[#e9e9e9]">
                                        <div className="flex items-center gap-2">
                                            Title

                                        </div>
                                    </TableHead>
                                    <TableHead className="px-4 py-4 text-left text-sm font-medium text-[#353535] border-b border-[#e9e9e9]">
                                        <div className="flex items-center gap-2">
                                            Content

                                        </div>
                                    </TableHead>
                                    <TableHead className="px-4 py-4 text-left text-sm font-medium text-[#353535] border-b border-[#e9e9e9]">
                                        <div className="flex items-center gap-2">
                                            Image

                                        </div>
                                    </TableHead>
                                    <TableHead className="px-4 py-4 text-right text-sm font-medium text-[#353535] border-b border-[#e9e9e9]">
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
                                        <TableCell className="px-4 py-4 text-sm text-[#353535]">
                                            <div className="flex items-center gap-2">
                                                <span>{post.id}</span>
                                            </div>
                                        </TableCell>

                                        {/* Category Column */}
                                        <TableCell className="px-4 py-4 text-sm text-[#353535]">
                                            <div className="flex items-center gap-2">
                                                <span>{post.category}</span>
                                            </div>
                                        </TableCell>

                                        {/* Title Column */}
                                        <TableCell className="px-4 py-4 text-sm text-[#353535]">
                                            <div className="flex items-center gap-2">
                                                <span className="font-medium">{post.title}</span>
                                            </div>
                                        </TableCell>

                                        {/* Content Column */}
                                        <TableCell className="px-4 py-4 text-sm text-[#353535]">
                                            <div className="flex items-center gap-2">
                                                <span className="max-w-md truncate">{post.content}</span>
                                            </div>
                                        </TableCell>

                                        {/* Image Column */}
                                        <TableCell className="px-4 py-4 text-sm text-[#353535]">
                                            <div className="flex items-center gap-2">
                                                <img
                                                    src={post.image}
                                                    alt={post.title}
                                                    className="size-10 rounded-md object-cover"
                                                />
                                            </div>
                                        </TableCell>

                                        {/* Actions Column */}
                                        <TableCell className="px-4 py-4">
                                            <div className="flex items-center justify-end gap-2">
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
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
