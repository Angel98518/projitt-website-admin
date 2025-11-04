"use client";

import { JSX, useState, useMemo, useCallback, useEffect } from "react";
import { Search, MoreVertical, Plus, Edit, Trash2, ListFilter, Upload as UploadIcon, Save, Send, AlertCircle, CheckCircle2, XCircle, ChevronLeft, ChevronRight, Eye, Globe, FileText, Clock } from "lucide-react";
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
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import TagInput from "@/components/ui/tag-input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Pagination, PaginationContent, PaginationItem } from "@/components/ui/pagination";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import dynamic from "next/dynamic";
import { toast } from "sonner";

// Dynamically import ReactQuill to avoid SSR issues
const ReactQuill = dynamic(() => import("react-quill-new"), { ssr: false });

// Blog post status types
export type BlogPostStatus = "draft" | "pending_review" | "approved" | "published" | "rejected";

// User role types
export type UserRole = "author" | "editor" | "admin";

interface BlogPost {
    id: string;
    category: string;
    title: string;
    content: string;
    image: string;
    status: BlogPostStatus;
    tags: string[];
    slug: string;
    seoTitle?: string;
    seoDescription?: string;
    seoKeywords?: string[];
    authorId: string;
    authorName: string;
    createdAt: string;
    updatedAt: string;
    publishedAt?: string;
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

function FilterTool({ selectedCategories, setSelectedCategories, categories, onFilterChange }: FilterToolProps & { onFilterChange?: () => void }) {
    const handleCategoryToggle = (category: string) => {
        setSelectedCategories(prev =>
            prev.includes(category)
                ? prev.filter(c => c !== category)
                : [...prev, category]
        );
        onFilterChange?.();
    };

    const handleClearFilters = () => {
        setSelectedCategories([]);
        onFilterChange?.();
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
    // Mock user role - in real app, this would come from session/auth context
    // Change this to "author", "editor", or "admin" to test different roles
    const [currentUserRole] = useState<UserRole>("admin");
    const [currentUserId] = useState<string>("user-001");
    const [currentUserName] = useState<string>("John Doe");
    const [permissionDeniedDialog, setPermissionDeniedDialog] = useState(false);

    // Permission helper functions
    const canCreate = useMemo(() => {
        return currentUserRole === "author" || currentUserRole === "editor" || currentUserRole === "admin";
    }, [currentUserRole]);

    const canDelete = useMemo(() => {
        return currentUserRole === "admin";
    }, [currentUserRole]);

    // Review dashboard permissions
    const canPublish = useMemo(() => {
        return currentUserRole === "editor" || currentUserRole === "admin";
    }, [currentUserRole]);

    const canApprove = useMemo(() => {
        return currentUserRole === "editor" || currentUserRole === "admin";
    }, [currentUserRole]);

    const canReview = useMemo(() => {
        return currentUserRole === "editor" || currentUserRole === "admin";
    }, [currentUserRole]);

    // Review dashboard state
    const [activeTab, setActiveTab] = useState<"all" | "review">("all");
    const [reviewStatusFilter, setReviewStatusFilter] = useState<BlogPostStatus[]>(["pending_review"]);
    const [reviewAuthorFilter, setReviewAuthorFilter] = useState<string[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);

    // All Posts pagination state
    const [allPostsCurrentPage, setAllPostsCurrentPage] = useState(1);
    const [allPostsItemsPerPage] = useState(10);

    // Publishing flow state
    const [postToPublish, setPostToPublish] = useState<BlogPost | null>(null);
    const [previewDialogOpen, setPreviewDialogOpen] = useState(false);
    const [publishConfirmDialogOpen, setPublishConfirmDialogOpen] = useState(false);
    const [seoChecklist, setSeoChecklist] = useState({
        hasTitle: false,
        hasDescription: false,
        hasKeywords: false,
        hasSlug: false,
        hasImage: false,
    });
    const [rollbackNote, setRollbackNote] = useState("");
    const [isPublishing, setIsPublishing] = useState(false);

    // Guided editor sidebar state
    const [showGuidedSidebar, setShowGuidedSidebar] = useState(true);
    const [currentStep, setCurrentStep] = useState(1);

    // Steps for guided creation
    const creationSteps = [
        { id: 1, label: "Basic Info", fields: ["category", "title", "slug"] },
        { id: 2, label: "Content", fields: ["content", "image"] },
        { id: 3, label: "Tags & SEO", fields: ["tags", "seoTitle", "seoDescription", "seoKeywords"] },
    ];

    // Load filters and pagination from localStorage on mount
    useEffect(() => {
        const savedFilters = localStorage.getItem("blog-review-filters");
        const savedPage = localStorage.getItem("blog-review-page");
        const savedAllPostsPage = localStorage.getItem("blog-all-posts-page");
        if (savedFilters) {
            try {
                const filters = JSON.parse(savedFilters);
                setReviewStatusFilter(filters.status || ["pending_review"]);
                setReviewAuthorFilter(filters.author || []);
            } catch {
                // Ignore parse errors
            }
        }
        if (savedPage) {
            try {
                setCurrentPage(parseInt(savedPage, 10));
            } catch {
                // Ignore parse errors
            }
        }
        if (savedAllPostsPage) {
            try {
                setAllPostsCurrentPage(parseInt(savedAllPostsPage, 10));
            } catch {
                // Ignore parse errors
            }
        }
    }, []);

    // Save filters and pagination to localStorage
    useEffect(() => {
        if (activeTab === "review") {
            localStorage.setItem("blog-review-filters", JSON.stringify({
                status: reviewStatusFilter,
                author: reviewAuthorFilter,
            }));
            localStorage.setItem("blog-review-page", currentPage.toString());
        } else if (activeTab === "all") {
            localStorage.setItem("blog-all-posts-page", allPostsCurrentPage.toString());
        }
    }, [activeTab, reviewStatusFilter, reviewAuthorFilter, currentPage, allPostsCurrentPage]);

    // Check if user can edit their own post
    const canEditPost = useCallback((post: BlogPost) => {
        if (currentUserRole === "admin") return true;
        if (currentUserRole === "editor") return true;
        if (currentUserRole === "author" && post.authorId === currentUserId) return true;
        return false;
    }, [currentUserRole, currentUserId]);

    // Get role badge
    const getRoleBadge = (role: UserRole) => {
        const roleConfig = {
            author: { label: "Author", className: "bg-blue-100 text-blue-700" },
            editor: { label: "Editor", className: "bg-purple-100 text-purple-700" },
            admin: { label: "Admin", className: "bg-green-100 text-green-700" },
        };
        const config = roleConfig[role];
        return (
            <Badge variant="secondary" className={cn("text-xs font-medium", config.className)}>
                {config.label}
            </Badge>
        );
    };

    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
    const [showFilters, setShowFilters] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [postToDelete, setPostToDelete] = useState<BlogPost | null>(null);
    const [createDialogOpen, setCreateDialogOpen] = useState(false);
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [postToEdit, setPostToEdit] = useState<BlogPost | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);

    // Enhanced blog post form state
    const [newBlogPost, setNewBlogPost] = useState<Partial<BlogPost>>({
        category: "",
        title: "",
        content: "",
        image: "/assets/blog1.jpg",
        tags: [],
        slug: "",
        seoTitle: "",
        seoDescription: "",
        seoKeywords: [],
        status: "draft",
    });

    // Validation errors
    const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

    // Sample data - replace with actual data fetching
    const [allBlogPosts, setAllBlogPosts] = useState<BlogPost[]>([
        // Category A: Workforce & Talent Management (10 topics)
        {
            id: "#B001",
            category: "Category A",
            title: "AI in Recruitment",
            content: "<p>Writing Job Descriptions That Attract the Right Talent</p>",
            image: "/assets/blog1.jpg",
            status: "published",
            tags: ["AI", "Recruitment", "HR"],
            slug: "ai-in-recruitment",
            seoTitle: "AI in Recruitment: Writing Job Descriptions",
            seoDescription: "Learn how AI can help write better job descriptions",
            seoKeywords: ["AI", "recruitment", "job descriptions"],
            authorId: "user-001",
            authorName: "John Doe",
            createdAt: "2024-01-15T10:00:00Z",
            updatedAt: "2024-01-15T10:00:00Z",
            publishedAt: "2024-01-15T10:00:00Z",
        },
        {
            id: "#B002",
            category: "Category A",
            title: "From Offer Letter to First Day",
            content: "<p>Automating Employee Onboarding</p>",
            image: "/assets/blog2.jpg",
            status: "pending_review",
            tags: ["Onboarding", "Automation"],
            slug: "from-offer-letter-to-first-day",
            seoTitle: "Automating Employee Onboarding",
            seoDescription: "Streamline your onboarding process",
            seoKeywords: ["onboarding", "automation"],
            authorId: "user-002",
            authorName: "Jane Smith",
            createdAt: "2024-01-16T10:00:00Z",
            updatedAt: "2024-01-16T10:00:00Z",
        },
        {
            id: "#B003",
            category: "Category A",
            title: "Why Personalized Learning Paths Improve Retention Rates",
            content: "<p>Learn how customized development programs can boost employee engagement and reduce turnover in your organization.</p>",
            image: "/assets/blog3.jpg",
            status: "pending_review",
            tags: ["Learning", "Retention"],
            slug: "personalized-learning-paths-retention",
            seoTitle: "Personalized Learning Paths for Better Retention",
            seoDescription: "Customized development programs boost engagement",
            seoKeywords: ["learning", "retention", "engagement"],
            authorId: "user-001",
            authorName: "John Doe",
            createdAt: "2024-01-17T10:00:00Z",
            updatedAt: "2024-01-17T10:00:00Z",
        },
        {
            id: "#B004",
            category: "Category A",
            title: "The Rise of 360° Feedback",
            content: "<p>Empowering Employees Through Peer Reviews</p>",
            image: "/assets/blog4.jpg",
            status: "approved",
            tags: ["Feedback", "Performance"],
            slug: "rise-of-360-feedback",
            seoTitle: "The Rise of 360° Feedback in Organizations",
            seoDescription: "How peer reviews empower employees",
            seoKeywords: ["feedback", "performance", "reviews"],
            authorId: "user-003",
            authorName: "Bob Johnson",
            createdAt: "2024-01-18T10:00:00Z",
            updatedAt: "2024-01-18T10:00:00Z",
        },
        {
            id: "#B005",
            category: "Category A",
            title: "Succession Planning in the Age of Workforce Mobility",
            content: "<p>Build resilient leadership pipelines that adapt to changing workforce dynamics and ensure business continuity.</p>",
            image: "/assets/blog5.jpg",
            status: "rejected",
            tags: ["Succession", "Leadership"],
            slug: "succession-planning-workforce-mobility",
            seoTitle: "Succession Planning Strategies",
            seoDescription: "Build resilient leadership pipelines",
            seoKeywords: ["succession", "leadership", "planning"],
            authorId: "user-002",
            authorName: "Jane Smith",
            createdAt: "2024-01-19T10:00:00Z",
            updatedAt: "2024-01-19T10:00:00Z",
        },
        {
            id: "#B006",
            category: "Category A",
            title: "How Predictive Analytics Can Forecast Employee Attrition",
            content: "<p>Use data-driven insights to identify flight risks early and implement retention strategies before it's too late.</p>",
            image: "/assets/blog6.jpg",
            status: "published",
            tags: ["Analytics", "Attrition", "HR"],
            slug: "predictive-analytics-employee-attrition",
            seoTitle: "Predictive Analytics for Employee Retention",
            seoDescription: "Forecast attrition risks with AI insights",
            seoKeywords: ["analytics", "attrition", "retention"],
            authorId: "user-004",
            authorName: "Alice White",
            createdAt: "2024-01-20T10:00:00Z",
            updatedAt: "2024-01-20T10:00:00Z",
        },
        {
            id: "#B007",
            category: "Category A",
            title: "Building a Performance-Driven Culture with Transparent Metrics",
            content: "<p>Create accountability and excellence through clear performance indicators that align individual goals with company objectives.</p>",
            image: "/assets/blog7.jpg",
            status: "approved",
            tags: ["Performance", "Culture"],
            slug: "performance-driven-culture-transparent-metrics",
            seoTitle: "Building a Performance-Driven Culture",
            seoDescription: "Align goals with transparency and accountability",
            seoKeywords: ["performance", "culture", "metrics"],
            authorId: "user-005",
            authorName: "Sam Green",
            createdAt: "2024-01-21T10:00:00Z",
            updatedAt: "2024-01-21T10:00:00Z",
        },
        {
            id: "#B008",
            category: "Category A",
            title: "The Future of Hybrid Work",
            content: "<p>Tools for Engagement and Productivity</p>",
            image: "/assets/blog8.jpg",
            status: "draft",
            tags: ["Hybrid", "Work", "Productivity"],
            slug: "future-of-hybrid-work",
            seoTitle: "The Future of Hybrid Work",
            seoDescription: "Tools for engagement and productivity in hybrid environments",
            seoKeywords: ["hybrid", "productivity", "engagement"],
            authorId: "user-003",
            authorName: "Bob Johnson",
            createdAt: "2024-01-22T10:00:00Z",
            updatedAt: "2024-01-22T10:00:00Z",
        },
        {
            id: "#B009",
            category: "Category A",
            title: "Payroll and HR Integration",
            content: "<p>Eliminating Manual Errors and Delays</p>",
            image: "/assets/blog9.jpg",
            status: "published",
            tags: ["Payroll", "Integration", "HR"],
            slug: "payroll-hr-integration",
            seoTitle: "Payroll and HR Integration",
            seoDescription: "Eliminate manual errors and improve efficiency",
            seoKeywords: ["payroll", "integration", "hr"],
            authorId: "user-001",
            authorName: "John Doe",
            createdAt: "2024-01-23T10:00:00Z",
            updatedAt: "2024-01-23T10:00:00Z",
        },
        {
            id: "#B010",
            category: "Category A",
            title: "Using Talent Analytics to Identify Future Leaders",
            content: "<p>Leverage data science to spot high-potential employees and develop them into tomorrow's organizational leaders.</p>",
            image: "/assets/blog10.jpg",
            status: "rejected",
            tags: ["Talent", "Analytics", "Leadership"],
            slug: "talent-analytics-future-leaders",
            seoTitle: "Using Talent Analytics to Identify Future Leaders",
            seoDescription: "Leverage data to identify and develop top talent",
            seoKeywords: ["talent", "analytics", "leadership"],
            authorId: "user-002",
            authorName: "Jane Smith",
            createdAt: "2024-01-24T10:00:00Z",
            updatedAt: "2024-01-24T10:00:00Z",
        },

        // Category B: Operations & Vendor/Contractor Management (10 topics)
        {
            id: "#B011",
            category: "Category B",
            title: "Why Contractor Compliance is the Key to Risk-Free Operations",
            content: "<p>Protect your business from legal and financial risks with comprehensive contractor compliance management systems.</p>",
            image: "/assets/blog11.jpg",
            status: "published",
            tags: ["Compliance", "Contractor", "Risk"],
            slug: "contractor-compliance-risk-free-operations",
            seoTitle: "Contractor Compliance for Risk-Free Operations",
            seoDescription: "Avoid legal risks through better compliance management",
            seoKeywords: ["compliance", "contractor", "risk"],
            authorId: "user-003",
            authorName: "Bob Johnson",
            createdAt: "2024-01-25T10:00:00Z",
            updatedAt: "2024-01-25T10:00:00Z",
        },
        {
            id: "#B012",
            category: "Category B",
            title: "Vendor Performance Scorecards",
            content: "<p>Turning Data into Decisions</p>",
            image: "/assets/blog1.jpg",
            status: "approved",
            tags: ["Vendor", "Performance"],
            slug: "vendor-performance-scorecards",
            seoTitle: "Vendor Performance Scorecards",
            seoDescription: "Use data-driven scorecards to manage vendor performance",
            seoKeywords: ["vendor", "performance", "scorecards"],
            authorId: "user-004",
            authorName: "Alice White",
            createdAt: "2024-01-26T10:00:00Z",
            updatedAt: "2024-01-26T10:00:00Z",
        },
        {
            id: "#B013",
            category: "Category B",
            title: "How AI is Transforming Procurement and Supplier Selection",
            content: "<p>Revolutionize your procurement process with AI-powered tools that identify the best suppliers and optimize purchasing decisions.</p>",
            image: "/assets/blog2.jpg",
            status: "draft",
            tags: ["AI", "Procurement", "Suppliers"],
            slug: "ai-transforming-procurement-supplier-selection",
            seoTitle: "AI in Procurement and Supplier Selection",
            seoDescription: "Optimize purchasing with AI-powered supplier insights",
            seoKeywords: ["ai", "procurement", "suppliers"],
            authorId: "user-001",
            authorName: "John Doe",
            createdAt: "2024-01-27T10:00:00Z",
            updatedAt: "2024-01-27T10:00:00Z",
        },
        {
            id: "#B014",
            category: "Category B",
            title: "The Benefits of Centralizing Vendor Communication in One Platform",
            content: "<p>Streamline vendor management with unified communication channels that improve efficiency and reduce miscommunication.</p>",
            image: "/assets/blog3.jpg",
            status: "published",
            tags: ["Vendor", "Communication"],
            slug: "centralizing-vendor-communication",
            seoTitle: "Centralizing Vendor Communication",
            seoDescription: "Improve efficiency with unified vendor platforms",
            seoKeywords: ["vendor", "communication", "efficiency"],
            authorId: "user-002",
            authorName: "Jane Smith",
            createdAt: "2024-01-28T10:00:00Z",
            updatedAt: "2024-01-28T10:00:00Z",
        },
        {
            id: "#B015",
            category: "Category B",
            title: "From Manual Contracts to E-Signatures",
            content: "<p>Modernizing Vendor Management</p>",
            image: "/assets/blog4.jpg",
            status: "rejected",
            tags: ["Contracts", "E-signature"],
            slug: "manual-contracts-to-e-signatures",
            seoTitle: "From Manual Contracts to E-Signatures",
            seoDescription: "Modernize vendor management with digital contracts",
            seoKeywords: ["contracts", "e-signatures", "vendor"],
            authorId: "user-003",
            authorName: "Bob Johnson",
            createdAt: "2024-01-29T10:00:00Z",
            updatedAt: "2024-01-29T10:00:00Z",
        },
        {
            id: "#B016",
            category: "Category B",
            title: "Reducing Procurement Costs with Automated Workflows",
            content: "<p>Cut costs and improve efficiency by automating routine procurement tasks and approval processes.</p>",
            image: "/assets/blog5.jpg",
            status: "approved",
            tags: ["Procurement", "Automation"],
            slug: "reducing-procurement-costs-automated-workflows",
            seoTitle: "Reducing Procurement Costs",
            seoDescription: "Save costs with automated procurement workflows",
            seoKeywords: ["procurement", "automation", "workflows"],
            authorId: "user-004",
            authorName: "Alice White",
            createdAt: "2024-01-30T10:00:00Z",
            updatedAt: "2024-01-30T10:00:00Z",
        },
        {
            id: "#B017",
            category: "Category B",
            title: "How Cross-Industry Platforms Improve Collaboration with Vendors",
            content: "<p>Break down silos and enhance vendor partnerships with integrated platforms that facilitate seamless collaboration.</p>",
            image: "/assets/blog6.jpg",
            status: "draft",
            tags: ["Vendors", "Collaboration"],
            slug: "cross-industry-platforms-vendor-collaboration",
            seoTitle: "Improving Vendor Collaboration with Platforms",
            seoDescription: "Enhance partnerships using cross-industry tools",
            seoKeywords: ["vendors", "collaboration", "platforms"],
            authorId: "user-005",
            authorName: "Sam Green",
            createdAt: "2024-01-31T10:00:00Z",
            updatedAt: "2024-01-31T10:00:00Z",
        },
        {
            id: "#B018",
            category: "Category B",
            title: "Contractor Performance Tracking",
            content: "<p>Metrics That Really Matter</p>",
            image: "/assets/blog7.jpg",
            status: "published",
            tags: ["Contractor", "Performance"],
            slug: "contractor-performance-tracking",
            seoTitle: "Contractor Performance Tracking",
            seoDescription: "Measure performance using the right metrics",
            seoKeywords: ["contractor", "performance", "metrics"],
            authorId: "user-001",
            authorName: "John Doe",
            createdAt: "2024-02-01T10:00:00Z",
            updatedAt: "2024-02-01T10:00:00Z",
        },
        {
            id: "#B019",
            category: "Category B",
            title: "The Future of Supply Chain Transparency Through Smart Vendor Portals",
            content: "<p>Gain complete visibility into your supply chain with intelligent vendor portals that provide real-time insights and control.</p>",
            image: "/assets/blog8.jpg",
            status: "approved",
            tags: ["Supply Chain", "Vendors"],
            slug: "supply-chain-transparency-vendor-portals",
            seoTitle: "Supply Chain Transparency via Smart Vendor Portals",
            seoDescription: "Achieve real-time supply chain visibility",
            seoKeywords: ["supply chain", "vendor", "transparency"],
            authorId: "user-002",
            authorName: "Jane Smith",
            createdAt: "2024-02-02T10:00:00Z",
            updatedAt: "2024-02-02T10:00:00Z",
        },
        {
            id: "#B020",
            category: "Category B",
            title: "Vendor Offboarding Best Practices",
            content: "<p>Minimizing Disruption and Risk</p>",
            image: "/assets/blog9.jpg",
            status: "rejected",
            tags: ["Vendor", "Offboarding"],
            slug: "vendor-offboarding-best-practices",
            seoTitle: "Vendor Offboarding Best Practices",
            seoDescription: "Minimize disruption during vendor offboarding",
            seoKeywords: ["vendor", "offboarding", "risk"],
            authorId: "user-004",
            authorName: "Alice White",
            createdAt: "2024-02-03T10:00:00Z",
            updatedAt: "2024-02-03T10:00:00Z",
        },

        // Category C: Finance, Reporting & Analytics (10 topics)
        {
            id: "#B021",
            category: "Category C",
            title: "Predictive Analytics",
            content: "<p>Unlocking Operational Efficiency Before Bottlenecks Happen</p>",
            image: "/assets/blog10.jpg",
            status: "published",
            tags: ["Analytics", "Efficiency"],
            slug: "predictive-analytics-operational-efficiency",
            seoTitle: "Predictive Analytics for Efficiency",
            seoDescription: "Use predictive analytics to avoid bottlenecks",
            seoKeywords: ["analytics", "efficiency", "forecasting"],
            authorId: "user-001",
            authorName: "John Doe",
            createdAt: "2024-02-04T10:00:00Z",
            updatedAt: "2024-02-04T10:00:00Z",
        },
        {
            id: "#B022",
            category: "Category C",
            title: "Multi-Currency Payroll",
            content: "<p>Simplifying Global Workforce Payments</p>",
            image: "/assets/blog11.jpg",
            status: "draft",
            tags: ["Payroll", "Finance", "Global"],
            slug: "multi-currency-payroll",
            seoTitle: "Multi-Currency Payroll",
            seoDescription: "Simplify payments for a global workforce",
            seoKeywords: ["payroll", "global", "finance"],
            authorId: "user-002",
            authorName: "Jane Smith",
            createdAt: "2024-02-05T10:00:00Z",
            updatedAt: "2024-02-05T10:00:00Z",
        },
        {
            id: "#B023",
            category: "Category C",
            title: "How Real-Time Dashboards Revolutionize Decision-Making",
            content: "<p>Empower leadership with real-time data insights that accelerate decision-making and optimize performance.</p>",
            image: "/assets/blog1.jpg",
            status: "approved",
            tags: ["Dashboards", "Decision-Making"],
            slug: "real-time-dashboards-decision-making",
            seoTitle: "Real-Time Dashboards in Business Decisions",
            seoDescription: "Accelerate decision-making with real-time insights",
            seoKeywords: ["dashboards", "analytics", "decision-making"],
            authorId: "user-003",
            authorName: "Bob Johnson",
            createdAt: "2024-02-06T10:00:00Z",
            updatedAt: "2024-02-06T10:00:00Z",
        },
        {
            id: "#B024",
            category: "Category C",
            title: "Automated Financial Reporting",
            content: "<p>Saving Time, Reducing Errors</p>",
            image: "/assets/blog2.jpg",
            status: "rejected",
            tags: ["Finance", "Automation"],
            slug: "automated-financial-reporting",
            seoTitle: "Automated Financial Reporting",
            seoDescription: "Reduce reporting errors through automation",
            seoKeywords: ["finance", "automation", "reporting"],
            authorId: "user-004",
            authorName: "Alice White",
            createdAt: "2024-02-07T10:00:00Z",
            updatedAt: "2024-02-07T10:00:00Z",
        },
        {
            id: "#B025",
            category: "Category C",
            title: "Data-Driven Budget Forecasting in Dynamic Markets",
            content: "<p>Learn how real-time analytics help companies adjust financial strategies on the fly to match market conditions.</p>",
            image: "/assets/blog3.jpg",
            status: "published",
            tags: ["Forecasting", "Finance"],
            slug: "data-driven-budget-forecasting",
            seoTitle: "Data-Driven Budget Forecasting",
            seoDescription: "Adapt budgets to dynamic market changes",
            seoKeywords: ["forecasting", "budget", "finance"],
            authorId: "user-005",
            authorName: "Sam Green",
            createdAt: "2024-02-08T10:00:00Z",
            updatedAt: "2024-02-08T10:00:00Z",
        },
        {
            id: "#B026",
            category: "Category C",
            title: "Bringing Clarity to Expense Analytics",
            content: "<p>Uncovering Hidden Costs and Opportunities</p>",
            image: "/assets/blog4.jpg",
            status: "draft",
            tags: ["Expense", "Analytics"],
            slug: "clarity-expense-analytics",
            seoTitle: "Clarity in Expense Analytics",
            seoDescription: "Find hidden costs with expense insights",
            seoKeywords: ["expense", "analytics", "costs"],
            authorId: "user-001",
            authorName: "John Doe",
            createdAt: "2024-02-09T10:00:00Z",
            updatedAt: "2024-02-09T10:00:00Z",
        },
        {
            id: "#B027",
            category: "Category C",
            title: "Compliance Reporting in the Era of Automation",
            content: "<p>Ensure transparency and meet regulatory standards with automated compliance reporting tools.</p>",
            image: "/assets/blog5.jpg",
            status: "approved",
            tags: ["Compliance", "Automation"],
            slug: "compliance-reporting-automation",
            seoTitle: "Compliance Reporting Automation",
            seoDescription: "Stay compliant with automation tools",
            seoKeywords: ["compliance", "automation", "reporting"],
            authorId: "user-002",
            authorName: "Jane Smith",
            createdAt: "2024-02-10T10:00:00Z",
            updatedAt: "2024-02-10T10:00:00Z",
        },
        {
            id: "#B028",
            category: "Category C",
            title: "Integrating BI Tools into Financial Workflows",
            content: "<p>Bridge the gap between financial data and strategic decision-making with integrated business intelligence tools.</p>",
            image: "/assets/blog6.jpg",
            status: "rejected",
            tags: ["BI", "Finance"],
            slug: "integrating-bi-financial-workflows",
            seoTitle: "Integrating BI in Finance",
            seoDescription: "Use BI tools for smarter financial decisions",
            seoKeywords: ["bi", "finance", "integration"],
            authorId: "user-003",
            authorName: "Bob Johnson",
            createdAt: "2024-02-11T10:00:00Z",
            updatedAt: "2024-02-11T10:00:00Z",
        },
        {
            id: "#B029",
            category: "Category C",
            title: "The Role of AI in Fraud Detection",
            content: "<p>Strengthen financial systems by identifying anomalies and potential fraud using machine learning models.</p>",
            image: "/assets/blog7.jpg",
            status: "published",
            tags: ["AI", "Fraud", "Finance"],
            slug: "ai-fraud-detection",
            seoTitle: "AI for Fraud Detection",
            seoDescription: "Detect financial fraud with AI-based models",
            seoKeywords: ["ai", "fraud", "finance"],
            authorId: "user-004",
            authorName: "Alice White",
            createdAt: "2024-02-12T10:00:00Z",
            updatedAt: "2024-02-12T10:00:00Z",
        },
        {
            id: "#B030",
            category: "Category C",
            title: "Unified Data Systems for Real-Time Financial Accuracy",
            content: "<p>Eliminate silos and ensure consistent financial data across departments with integrated data systems.</p>",
            image: "/assets/blog8.jpg",
            status: "approved",
            tags: ["Data", "Finance"],
            slug: "unified-data-systems-financial-accuracy",
            seoTitle: "Unified Data Systems in Finance",
            seoDescription: "Achieve real-time accuracy with integrated data",
            seoKeywords: ["data", "finance", "integration"],
            authorId: "user-005",
            authorName: "Sam Green",
            createdAt: "2024-02-13T10:00:00Z",
            updatedAt: "2024-02-13T10:00:00Z",
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

    // Paginated blog posts for All Posts tab
    const paginatedBlogPosts = useMemo(() => {
        const startIndex = (allPostsCurrentPage - 1) * allPostsItemsPerPage;
        const endIndex = startIndex + allPostsItemsPerPage;
        return blogPosts.slice(startIndex, endIndex);
    }, [blogPosts, allPostsCurrentPage, allPostsItemsPerPage]);

    const allPostsTotalPages = useMemo(() => {
        return Math.ceil(blogPosts.length / allPostsItemsPerPage);
    }, [blogPosts.length, allPostsItemsPerPage]);

    // Filter posts for review dashboard
    const reviewPosts = useMemo(() => {
        return allBlogPosts.filter(post => {
            const matchesStatus = reviewStatusFilter.length === 0 || reviewStatusFilter.includes(post.status);
            const matchesAuthor = reviewAuthorFilter.length === 0 || reviewAuthorFilter.includes(post.authorId);
            const matchesSearch = searchQuery === "" ||
                post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                post.content.toLowerCase().includes(searchQuery.toLowerCase());
            return matchesStatus && matchesAuthor && matchesSearch;
        });
    }, [allBlogPosts, reviewStatusFilter, reviewAuthorFilter, searchQuery]);

    // Get unique authors for filter
    const uniqueAuthors = useMemo(() => {
        const authors = allBlogPosts.map(post => ({ id: post.authorId, name: post.authorName }));
        return Array.from(new Map(authors.map(a => [a.id, a])).values());
    }, [allBlogPosts]);

    // Pagination for review posts
    const paginatedReviewPosts = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        return reviewPosts.slice(startIndex, endIndex);
    }, [reviewPosts, currentPage, itemsPerPage]);

    const totalPages = useMemo(() => {
        return Math.ceil(reviewPosts.length / itemsPerPage);
    }, [reviewPosts.length, itemsPerPage]);

    // Generate slug from title
    const generateSlug = (title: string): string => {
        return title
            .toLowerCase()
            .trim()
            .replace(/[^\w\s-]/g, '')
            .replace(/[\s_-]+/g, '-')
            .replace(/^-+|-+$/g, '');
    };

    // Validate required fields
    const validateBlogPost = (post: Partial<BlogPost>): Record<string, string> => {
        const errors: Record<string, string> = {};

        if (!post.title || post.title.trim() === "") {
            errors.title = "Title is required";
        }

        if (!post.slug || post.slug.trim() === "") {
            errors.slug = "Slug is required";
        }

        if (!post.image || post.image === "/assets/blog1.jpg") {
            errors.image = "Featured image is required";
        }

        if (!post.content || post.content.trim() === "" || post.content === "<p><br></p>") {
            errors.content = "Content is required";
        }

        return errors;
    };

    // Get status badge color
    const getStatusBadge = (status: BlogPostStatus) => {
        const statusConfig = {
            draft: { label: "Draft", variant: "secondary" as const, className: "bg-gray-100 text-gray-700" },
            pending_review: { label: "Pending Review", variant: "secondary" as const, className: "bg-yellow-100 text-yellow-700" },
            approved: { label: "Approved", variant: "secondary" as const, className: "bg-blue-100 text-blue-700" },
            published: { label: "Published", variant: "secondary" as const, className: "bg-green-100 text-green-700" },
            rejected: { label: "Rejected", variant: "secondary" as const, className: "bg-red-100 text-red-700" },
        };

        const config = statusConfig[status];
        return (
            <Badge variant={config.variant} className={cn("text-xs whitespace-nowrap", config.className)}>
                {config.label}
            </Badge>
        );
    };


    const onDrop = useCallback((acceptedFiles: File[]) => {
        if (acceptedFiles && acceptedFiles.length > 0) {
            const file = acceptedFiles[0];

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

    // Auto-generate slug when title changes
    useEffect(() => {
        if (newBlogPost.title && (createDialogOpen || editDialogOpen)) {
            const slug = generateSlug(newBlogPost.title);
            setNewBlogPost(prev => ({ ...prev, slug }));
        }
    }, [newBlogPost.title, createDialogOpen, editDialogOpen]);

    const handleCreate = () => {
        if (!canCreate) {
            setPermissionDeniedDialog(true);
            return;
        }
        setCreateDialogOpen(true);
        setValidationErrors({});
        // Reset form
        setNewBlogPost({
            category: "",
            title: "",
            content: "",
            image: "/assets/blog1.jpg",
            tags: [],
            slug: "",
            seoTitle: "",
            seoDescription: "",
            seoKeywords: [],
            status: "pending_review",
        });
        setImagePreview(null);
    };

    const handleSaveAsDraft = () => {
        const errors = validateBlogPost(newBlogPost);
        if (Object.keys(errors).length > 0) {
            setValidationErrors(errors);
            toast.error("Please fix validation errors before saving");
            return;
        }

        if (postToEdit) {
            // Update existing post as draft
            const imageUrl = imagePreview || newBlogPost.image || postToEdit.image;
            setAllBlogPosts(prev => prev.map(post =>
                post.id === postToEdit.id
                    ? {
                        ...post,
                        category: newBlogPost.category || post.category,
                        title: newBlogPost.title || post.title,
                        content: newBlogPost.content || post.content, // ReactQuill HTML content with formatting (bold, italic, etc.)
                        image: imageUrl,
                        tags: newBlogPost.tags || post.tags,
                        slug: newBlogPost.slug || post.slug,
                        seoTitle: newBlogPost.seoTitle || post.seoTitle,
                        seoDescription: newBlogPost.seoDescription || post.seoDescription,
                        seoKeywords: newBlogPost.seoKeywords || post.seoKeywords,
                        status: "draft", // Save as draft
                        updatedAt: new Date().toISOString(),
                    }
                    : post
            ));
            setEditDialogOpen(false);
            setPostToEdit(null);
            setValidationErrors({});
            toast.success("Draft saved successfully");
            setImagePreview(null);
        } else {
            // Create new post as draft
            const newId = `#B${String(allBlogPosts.length + 1).padStart(3, "0")}`;
            const imageUrl = imagePreview || newBlogPost.image || "/assets/blog1.jpg";
            const now = new Date().toISOString();

            const blogPost: BlogPost = {
                id: newId,
                category: newBlogPost.category || "",
                title: newBlogPost.title || "",
                content: newBlogPost.content || "", // ReactQuill HTML content with formatting (bold, italic, etc.)
                image: imageUrl,
                status: "draft",
                tags: newBlogPost.tags || [],
                slug: newBlogPost.slug || generateSlug(newBlogPost.title || ""),
                seoTitle: newBlogPost.seoTitle || "",
                seoDescription: newBlogPost.seoDescription || "",
                seoKeywords: newBlogPost.seoKeywords || [],
                authorId: currentUserId,
                authorName: currentUserName,
                createdAt: now,
                updatedAt: now,
            };

            setAllBlogPosts(prev => [...prev, blogPost]);
            setCreateDialogOpen(false);
            setValidationErrors({});
            toast.success("Draft saved successfully");

            // Reset form
            setNewBlogPost({
                category: "",
                title: "",
                content: "",
                image: "/assets/blog1.jpg",
                tags: [],
                slug: "",
                seoTitle: "",
                seoDescription: "",
                seoKeywords: [],
                status: "draft",
            });
            setImagePreview(null);
        }
    };

    const handleSubmitForReview = () => {
        const errors = validateBlogPost(newBlogPost);
        if (Object.keys(errors).length > 0) {
            setValidationErrors(errors);
            toast.error("Please fix validation errors before submitting");
            return;
        }

        if (postToEdit) {
            // Update existing post
            const imageUrl = imagePreview || newBlogPost.image || postToEdit.image;
            setAllBlogPosts(prev => prev.map(post =>
                post.id === postToEdit.id
                    ? {
                        ...post,
                        category: newBlogPost.category || post.category,
                        title: newBlogPost.title || post.title,
                        content: newBlogPost.content || post.content, // ReactQuill HTML content with formatting preserved
                        image: imageUrl,
                        tags: newBlogPost.tags || post.tags,
                        slug: newBlogPost.slug || post.slug,
                        seoTitle: newBlogPost.seoTitle || post.seoTitle,
                        seoDescription: newBlogPost.seoDescription || post.seoDescription,
                        seoKeywords: newBlogPost.seoKeywords || post.seoKeywords,
                        status: postToEdit.status === "draft" ? "draft" : "pending_review", // Preserve draft status or submit for review
                        updatedAt: new Date().toISOString(),
                    }
                    : post
            ));
            setEditDialogOpen(false);
            setPostToEdit(null);
            setValidationErrors({});
            toast.success(postToEdit.status === "draft" ? "Draft updated successfully" : "Post submitted for review");
        } else {
            // Create new post
            const newId = `#B${String(allBlogPosts.length + 1).padStart(3, "0")}`;
            const imageUrl = imagePreview || newBlogPost.image || "/assets/blog1.jpg";
            const now = new Date().toISOString();

            const blogPost: BlogPost = {
                id: newId,
                category: newBlogPost.category || "",
                title: newBlogPost.title || "",
                content: newBlogPost.content || "",
                image: imageUrl,
                status: "pending_review",
                tags: newBlogPost.tags || [],
                slug: newBlogPost.slug || generateSlug(newBlogPost.title || ""),
                seoTitle: newBlogPost.seoTitle || "",
                seoDescription: newBlogPost.seoDescription || "",
                seoKeywords: newBlogPost.seoKeywords || [],
                authorId: currentUserId,
                authorName: currentUserName,
                createdAt: now,
                updatedAt: now,
            };

            setAllBlogPosts(prev => [...prev, blogPost]);
            setCreateDialogOpen(false);
            toast.success("Post submitted for review");
        }

        setValidationErrors({});

        // Reset form
        setNewBlogPost({
            category: "",
            title: "",
            content: "",
            image: "/assets/blog1.jpg",
            tags: [],
            slug: "",
            seoTitle: "",
            seoDescription: "",
            seoKeywords: [],
            status: "pending_review",
        });
        setImagePreview(null);
        setPostToEdit(null);
    };

    // Rich text editor modules configuration
    const quillModules = useMemo(() => ({
        toolbar: [
            [{ 'header': [1, 2, 3, false] }],
            ['bold', 'italic', 'underline', 'strike'],
            [{ 'list': 'ordered' }, { 'list': 'bullet' }],
            ['blockquote', 'code-block'],
            [{ 'link': true }],
            [{ 'color': [] }, { 'background': [] }],
            ['clean']
        ],
    }), []);

    // Inject Quill editor styles
    useEffect(() => {
        const style = document.createElement('style');
        style.textContent = `
            .blog-quill-editor .ql-container {
                min-height: 300px !important;
                border: none !important;
                font-size: 14px;
            }
            .blog-quill-editor .ql-editor {
                min-height: 300px !important;
            }
            .blog-quill-editor .ql-toolbar {
                border-bottom: 1px solid #e5e5e5 !important;
                border-top: none !important;
                border-left: none !important;
                border-right: none !important;
                background: #fafafa;
            }
            .blog-quill-editor .ql-container.ql-snow {
                border: none !important;
            }
            .blog-quill-editor .ql-editor.ql-blank::before {
                color: #bcbcbc;
                font-style: normal;
            }
            /* Content preview styles for table - proper rendering of lists, blockquotes, etc. */
            .blog-content-preview {
                max-height: 48px;
                overflow: hidden;
                position: relative;
            }
            .blog-content-preview::after {
                content: '';
                position: absolute;
                bottom: 0;
                right: 0;
                width: 30px;
                height: 16px;
                background: linear-gradient(to right, transparent, white);
            }
            .blog-content-preview p {
                margin: 0.25em 0;
                line-height: 1.4;
            }
            /* CRITICAL: Ensure ordered lists show numbers - even if inside paragraphs */
            .blog-content-preview ol,
            .blog-content-preview p ol {
                margin: 0.25em 0 !important;
                padding-left: 1.5em !important;
                line-height: 1.4 !important;
                display: block !important;
                list-style-type: decimal !important;
                list-style-position: outside !important;
            }
            .blog-content-preview ol li,
            .blog-content-preview p ol li {
                margin: 0.1em 0 !important;
                display: list-item !important;
                list-style-type: decimal !important;
                list-style-position: outside !important;
                padding-left: 0.25em !important;
            }
            /* CRITICAL: Ensure unordered lists show bullets - even if inside paragraphs */
            .blog-content-preview ul,
            .blog-content-preview p ul {
                margin: 0.25em 0 !important;
                padding-left: 1.5em !important;
                line-height: 1.4 !important;
                display: block !important;
                list-style-type: disc !important;
                list-style-position: outside !important;
            }
            .blog-content-preview ul li,
            .blog-content-preview p ul li {
                margin: 0.1em 0 !important;
                display: list-item !important;
                list-style-type: disc !important;
                list-style-position: outside !important;
                padding-left: 0.25em !important;
            }
            /* Blockquote styling */
            .blog-content-preview blockquote {
                margin: 0.25em 0 !important;
                padding-left: 0.75em !important;
                padding-top: 0.25em !important;
                padding-bottom: 0.25em !important;
                border-left: 3px solid #e5e5e5 !important;
                font-style: italic !important;
                line-height: 1.4 !important;
                display: block !important;
                background-color: #f9f9f9 !important;
            }
            .blog-content-preview h1,
            .blog-content-preview h2,
            .blog-content-preview h3,
            .blog-content-preview h4,
            .blog-content-preview h5,
            .blog-content-preview h6 {
                margin: 0.25em 0;
                font-weight: 600;
                line-height: 1.4;
                display: block;
            }
            .blog-content-preview strong {
                font-weight: 600;
            }
            .blog-content-preview em {
                font-style: italic;
            }
            .blog-content-preview code {
                background: #f5f5f5;
                padding: 2px 4px;
                border-radius: 3px;
                font-size: 0.9em;
            }
            /* Full content preview in dialog - ensure lists and blockquotes render */
            .blog-content-full ol {
                margin: 1em 0 !important;
                padding-left: 2em !important;
                list-style-type: decimal !important;
                list-style-position: outside !important;
            }
            .blog-content-full ol li {
                margin: 0.5em 0 !important;
                display: list-item !important;
                list-style-type: decimal !important;
            }
            .blog-content-full ul {
                margin: 1em 0 !important;
                padding-left: 2em !important;
                list-style-type: disc !important;
                list-style-position: outside !important;
            }
            .blog-content-full ul li {
                margin: 0.5em 0 !important;
                display: list-item !important;
                list-style-type: disc !important;
            }
            .blog-content-full blockquote {
                margin: 1em 0 !important;
                padding: 0.5em 1em !important;
                border-left: 4px solid #e5e5e5 !important;
                font-style: italic !important;
                background-color: #f9f9f9 !important;
            }
        `;
        document.head.appendChild(style);
        return () => {
            document.head.removeChild(style);
        };
    }, []);

    const handleDelete = (post: BlogPost) => {
        if (!canDelete) {
            setPermissionDeniedDialog(true);
            return;
        }
        setPostToDelete(post);
        setDeleteDialogOpen(true);
    };

    const handleEdit = (post: BlogPost) => {
        if (!canEditPost(post)) {
            setPermissionDeniedDialog(true);
            return;
        }
        setPostToEdit(post);
        setEditDialogOpen(true);
        setValidationErrors({});
        // Pre-fill form with existing data
        setNewBlogPost({
            category: post.category,
            title: post.title,
            content: post.content,
            image: post.image,
            tags: post.tags || [],
            slug: post.slug,
            seoTitle: post.seoTitle || "",
            seoDescription: post.seoDescription || "",
            seoKeywords: post.seoKeywords || [],
            status: post.status,
        });
        // If image is already a data URL, show preview; otherwise show the URL path
        if (post.image.startsWith('data:')) {
            setImagePreview(post.image);
        } else {
            // For URL paths, we'll show them in the preview too
            setImagePreview(post.image);
        }
    };

    const confirmDelete = () => {
        if (postToDelete) {
            setAllBlogPosts(prev => prev.filter(p => p.id !== postToDelete.id));
            setDeleteDialogOpen(false);
            setPostToDelete(null);
            toast.success("Post deleted successfully");
        }
    };

    // Approve/Reject handlers
    const handleApprove = (post: BlogPost) => {
        if (!canApprove) {
            setPermissionDeniedDialog(true);
            return;
        }
        setAllBlogPosts(prev => prev.map(p =>
            p.id === post.id
                ? { ...p, status: "approved" as BlogPostStatus, updatedAt: new Date().toISOString() }
                : p
        ));
        toast.success("Post approved successfully");
    };

    const handleReject = (post: BlogPost) => {
        if (!canApprove) {
            setPermissionDeniedDialog(true);
            return;
        }
        setAllBlogPosts(prev => prev.map(p =>
            p.id === post.id
                ? { ...p, status: "rejected" as BlogPostStatus, updatedAt: new Date().toISOString() }
                : p
        ));
        toast.success("Post rejected");
    };

    // Validate SEO checklist
    const validateSEOChecklist = useCallback((post: BlogPost): boolean => {
        const checklist = {
            hasTitle: !!(post.seoTitle && post.seoTitle.trim() !== ""),
            hasDescription: !!(post.seoDescription && post.seoDescription.trim() !== ""),
            hasKeywords: !!(post.seoKeywords && post.seoKeywords.length > 0),
            hasSlug: !!(post.slug && post.slug.trim() !== ""),
            hasImage: !!(post.image && post.image !== "/assets/blog1.jpg"),
        };
        setSeoChecklist(checklist);
        return Object.values(checklist).every(Boolean);
    }, []);

    // Open preview dialog
    const handlePreview = (post: BlogPost) => {
        setPostToPublish(post);
        validateSEOChecklist(post); // Validate and show checklist status
        setPreviewDialogOpen(true);
    };

    // Start publish flow
    const handleStartPublish = (post: BlogPost) => {
        if (!canPublish) {
            setPermissionDeniedDialog(true);
            return;
        }

        if (post.status !== "approved") {
            toast.error("Only approved posts can be published");
            return;
        }

        // Validate SEO checklist
        if (!validateSEOChecklist(post)) {
            toast.error("Please complete all SEO requirements before publishing");
            return;
        }

        setPostToPublish(post);
        setPublishConfirmDialogOpen(true);
    };

    // Confirm and publish
    const handleConfirmPublish = () => {
        if (!postToPublish) return;

        setIsPublishing(true);

        // Simulate publishing delay (10 seconds as per requirement)
        setTimeout(() => {
            setAllBlogPosts(prev => prev.map(p =>
                p.id === postToPublish.id
                    ? {
                        ...p,
                        status: "published" as BlogPostStatus,
                        publishedAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString(),
                    }
                    : p
            ));

            setIsPublishing(false);
            setPublishConfirmDialogOpen(false);
            setPostToPublish(null);
            setRollbackNote("");
            toast.success("Post published successfully! It will appear live within 10 seconds.");

            // Redirect to "All Posts" tab to see the published post
            setActiveTab("all");
        }, 10000); // 10 seconds delay
    };

    return (
        <div className="flex flex-col">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4 sm:mb-6">
                {/* Page Title and Role Badge */}
                <div className="flex items-center gap-3">
                    <h1 className="text-[20px] sm:text-[24px]/[30px] text-[#1C1C1C] font-semibold">
                        Blog
                    </h1>
                    {getRoleBadge(currentUserRole)}
                </div>
                {canCreate && (
                    <Button variant="primary" size="md" className="gap-2 bg-[#0D978B] hover:bg-[#0D978B]/90 text-white h-10 px-4 rounded-md w-full sm:w-28" onClick={handleCreate}>
                        <Plus className="size-4" />
                        Create
                    </Button>
                )}
            </div>

            {/* Tabs for All Posts and Review Dashboard */}
            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "all" | "review")} className="w-full">
                <TabsList className="mb-6">
                    <TabsTrigger value="all">All Posts</TabsTrigger>
                    {canReview && (
                        <TabsTrigger value="review">
                            Review Dashboard
                            {reviewPosts.filter(p => p.status === "pending_review").length > 0 && (
                                <Badge variant="secondary" className="ml-2 bg-yellow-100 text-yellow-700">
                                    {reviewPosts.filter(p => p.status === "pending_review").length}
                                </Badge>
                            )}
                        </TabsTrigger>
                    )}
                </TabsList>

                {/* All Posts Tab */}
                <TabsContent value="all" className="mt-0">
                    {/* Search and Action Bar */}
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 mb-4 sm:mb-6 sm:justify-between">
                        {/* Search Bar */}
                        <div className="relative flex-1 w-full sm:max-w-md">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 bg-transparent size-4 text-[#8F8F8F]" />
                            <Input
                                type="text"
                                placeholder="Search"
                                value={searchQuery}
                                onChange={(e) => {
                                    setSearchQuery(e.target.value);
                                    setAllPostsCurrentPage(1); // Reset to first page on search
                                }}
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
                                onFilterChange={() => setAllPostsCurrentPage(1)}
                            />
                        </div>
                    )}

                    {/* Mobile Card View */}
                    <div className="block md:hidden space-y-3">
                        {paginatedBlogPosts.map((post) => (
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
                                            <div
                                                className="text-xs text-[#8F8F8F] blog-content-preview"
                                                dangerouslySetInnerHTML={{ __html: post.content }}
                                            />
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
                                                {canEditPost(post) ? (
                                                    <DropdownMenuItem
                                                        onClick={() => handleEdit(post)}
                                                        className="cursor-pointer"
                                                    >
                                                        <Edit className="size-4 mr-2" />
                                                        Edit
                                                    </DropdownMenuItem>
                                                ) : (
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <div className="w-full">
                                                                <DropdownMenuItem disabled className="text-gray-400 cursor-not-allowed">
                                                                    <Edit className="size-4 mr-2" />
                                                                    Edit
                                                                </DropdownMenuItem>
                                                            </div>
                                                        </TooltipTrigger>
                                                        <TooltipContent>
                                                            <p>You can only edit your own posts</p>
                                                        </TooltipContent>
                                                    </Tooltip>
                                                )}
                                                {canDelete ? (
                                                    <DropdownMenuItem
                                                        onClick={() => handleDelete(post)}
                                                        variant="destructive"
                                                        className="cursor-pointer"
                                                    >
                                                        <Trash2 className="size-4 mr-2" />
                                                        Delete
                                                    </DropdownMenuItem>
                                                ) : (
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <div className="w-full">
                                                                <DropdownMenuItem disabled className="text-gray-400 cursor-not-allowed">
                                                                    <Trash2 className="size-4 mr-2" />
                                                                    Delete
                                                                </DropdownMenuItem>
                                                            </div>
                                                        </TooltipTrigger>
                                                        <TooltipContent>
                                                            <p>Only Admins can delete posts</p>
                                                        </TooltipContent>
                                                    </Tooltip>
                                                )}
                                                {!canEditPost(post) && !canDelete && (
                                                    <DropdownMenuItem disabled className="text-gray-400 cursor-not-allowed">
                                                        No actions available
                                                    </DropdownMenuItem>
                                                )}
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    {/* Table - Desktop View */}
                    <Card className="hidden md:block shadow-none">
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
                                            <TableHead className="px-2 sm:px-4 py-3 sm:py-4 text-center text-xs sm:text-sm font-medium text-[#353535] border-b border-[#e9e9e9] hidden lg:table-cell min-w-[100px]">
                                                <div className="flex items-center justify-center gap-2">
                                                    Status
                                                </div>
                                            </TableHead>
                                            <TableHead className="px-2 sm:px-4 py-3 sm:py-4 text-right text-xs sm:text-sm font-medium text-[#353535] border-b border-[#e9e9e9] min-w-[80px]">
                                                Actions
                                            </TableHead>
                                        </TableRow>
                                    </TableHeader>

                                    {/* Table Body */}
                                    <TableBody className="bg-white">
                                        {paginatedBlogPosts.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                                                    No posts found matching your search or filters.
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            paginatedBlogPosts.map((post, index) => (
                                                <TableRow
                                                    key={post.id}
                                                    className={cn(
                                                        "border-b border-[#e9e9e9] hover:bg-[#fafafa] transition-colors",
                                                        index === paginatedBlogPosts.length - 1 && "border-b-0"
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
                                                            <div
                                                                className="lg:hidden text-xs text-[#8F8F8F] blog-content-preview"
                                                                dangerouslySetInnerHTML={{ __html: post.content }}
                                                            />
                                                        </div>
                                                    </TableCell>

                                                    {/* Content Column */}
                                                    <TableCell className="px-2 sm:px-4 py-3 sm:py-4 text-xs sm:text-sm text-[#353535] hidden lg:table-cell">
                                                        <div
                                                            className="max-w-md blog-content-preview"
                                                            dangerouslySetInnerHTML={{ __html: post.content }}
                                                        />
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

                                                    {/* Status Column */}
                                                    <TableCell className="px-2 sm:px-4 py-3 sm:py-4 text-xs sm:text-sm text-[#353535] hidden lg:table-cell text-center">
                                                        <div className="flex items-center justify-center">
                                                            {getStatusBadge(post.status)}
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
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Pagination for All Posts */}
                    {allPostsTotalPages > 1 && (
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-4">
                            <div className="text-sm text-gray-600">
                                Showing {(allPostsCurrentPage - 1) * allPostsItemsPerPage + 1} to {Math.min(allPostsCurrentPage * allPostsItemsPerPage, blogPosts.length)} of {blogPosts.length} posts
                            </div>
                            <Pagination>
                                <PaginationContent>
                                    <PaginationItem>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setAllPostsCurrentPage(prev => Math.max(1, prev - 1))}
                                            disabled={allPostsCurrentPage === 1}
                                            className="h-8 px-3"
                                        >
                                            <ChevronLeft className="size-4" />
                                        </Button>
                                    </PaginationItem>
                                    {Array.from({ length: Math.min(5, allPostsTotalPages) }, (_, i) => {
                                        let pageNum;
                                        if (allPostsTotalPages <= 5) {
                                            pageNum = i + 1;
                                        } else if (allPostsCurrentPage <= 3) {
                                            pageNum = i + 1;
                                        } else if (allPostsCurrentPage >= allPostsTotalPages - 2) {
                                            pageNum = allPostsTotalPages - 4 + i;
                                        } else {
                                            pageNum = allPostsCurrentPage - 2 + i;
                                        }
                                        return (
                                            <PaginationItem key={pageNum}>
                                                <Button
                                                    variant={allPostsCurrentPage === pageNum ? "primary" : "outline"}
                                                    size="sm"
                                                    onClick={() => setAllPostsCurrentPage(pageNum)}
                                                    className={cn(
                                                        "h-8 min-w-8",
                                                        allPostsCurrentPage === pageNum && "bg-[#0D978B] hover:bg-[#0D978B]/90 text-white"
                                                    )}
                                                >
                                                    {pageNum}
                                                </Button>
                                            </PaginationItem>
                                        );
                                    })}
                                    <PaginationItem>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setAllPostsCurrentPage(prev => Math.min(allPostsTotalPages, prev + 1))}
                                            disabled={allPostsCurrentPage === allPostsTotalPages}
                                            className="h-8 px-3"
                                        >
                                            <ChevronRight className="size-4" />
                                        </Button>
                                    </PaginationItem>
                                </PaginationContent>
                            </Pagination>
                        </div>
                    )}
                </TabsContent>

                {/* Review Dashboard Tab */}
                {canReview && (
                    <TabsContent value="review" className="mt-0">
                        <div className="space-y-4">
                            {/* Review Dashboard Filters */}
                            <Card>
                                <CardContent className="p-4">
                                    <div className="flex flex-col gap-4">
                                        {/* Status Filter */}
                                        <div className="space-y-2">
                                            <Label className="text-sm font-semibold">Filter by Status</Label>
                                            <div className="flex flex-wrap gap-2">
                                                {(["draft", "pending_review", "approved", "rejected", "published"] as BlogPostStatus[]).map((status) => {
                                                    const statusLabels: Record<BlogPostStatus, string> = {
                                                        draft: "Draft",
                                                        pending_review: "Pending Review",
                                                        approved: "Approved",
                                                        rejected: "Rejected",
                                                        published: "Published",
                                                    };
                                                    return (
                                                        <button
                                                            key={status}
                                                            onClick={() => {
                                                                setReviewStatusFilter(prev =>
                                                                    prev.includes(status)
                                                                        ? prev.filter(s => s !== status)
                                                                        : [...prev, status]
                                                                );
                                                                setCurrentPage(1); // Reset to first page on filter change
                                                            }}
                                                            className={cn(
                                                                "px-3 py-1.5 rounded-md text-sm font-medium transition-colors",
                                                                reviewStatusFilter.includes(status)
                                                                    ? "bg-[#0D978B] text-white"
                                                                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                                            )}
                                                        >
                                                            {statusLabels[status]}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>

                                        {/* Author Filter */}
                                        <div className="space-y-2">
                                            <Label className="text-sm font-semibold">Filter by Author</Label>
                                            <Popover>
                                                <PopoverTrigger asChild>
                                                    <Button
                                                        variant="outline"
                                                        className="h-8 text-[#353535] font-medium text-sm px-4 flex items-center gap-2 bg-white border border-[#E9E9E9] hover:bg-[#fafafa]"
                                                    >
                                                        Authors{reviewAuthorFilter.length > 0 ? `: ${reviewAuthorFilter.length} selected` : ""}
                                                    </Button>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-56 p-2" align="start">
                                                    <div className="space-y-2">
                                                        {uniqueAuthors.map((author) => (
                                                            <div
                                                                key={author.id}
                                                                className="flex items-center space-x-2 cursor-pointer py-1.5 px-2 rounded hover:bg-[#fafafa]"
                                                                onClick={() => {
                                                                    setReviewAuthorFilter(prev =>
                                                                        prev.includes(author.id)
                                                                            ? prev.filter(id => id !== author.id)
                                                                            : [...prev, author.id]
                                                                    );
                                                                    setCurrentPage(1);
                                                                }}
                                                            >
                                                                <Checkbox
                                                                    id={`author-${author.id}`}
                                                                    checked={reviewAuthorFilter.includes(author.id)}
                                                                    onCheckedChange={() => {
                                                                        setReviewAuthorFilter(prev =>
                                                                            prev.includes(author.id)
                                                                                ? prev.filter(id => id !== author.id)
                                                                                : [...prev, author.id]
                                                                        );
                                                                        setCurrentPage(1);
                                                                    }}
                                                                />
                                                                <label
                                                                    htmlFor={`author-${author.id}`}
                                                                    className="text-sm text-[#353535] cursor-pointer flex-1"
                                                                >
                                                                    {author.name}
                                                                </label>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </PopoverContent>
                                            </Popover>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Review Dashboard Table */}
                            <Card className="shadow-none">
                                <CardContent className="p-0 overflow-hidden">
                                    <div className="overflow-x-auto !rounded-lg border border-gray-300">
                                        <Table>
                                            <TableHeader className="bg-[#eef3f2]">
                                                <TableRow className="border-b border-[#e9e9e9]">
                                                    <TableHead className="px-2 sm:px-4 py-3 sm:py-4 text-left text-xs sm:text-sm font-medium text-[#353535] border-b border-[#e9e9e9] min-w-[80px]">
                                                        ID
                                                    </TableHead>
                                                    <TableHead className="px-2 sm:px-4 py-3 sm:py-4 text-left text-xs sm:text-sm font-medium text-[#353535] border-b border-[#e9e9e9] min-w-[150px]">
                                                        Title
                                                    </TableHead>
                                                    <TableHead className="px-2 sm:px-4 py-3 sm:py-4 text-left text-xs sm:text-sm font-medium text-[#353535] border-b border-[#e9e9e9] min-w-[120px]">
                                                        Author
                                                    </TableHead>
                                                    <TableHead className="px-2 sm:px-4 py-3 sm:py-4 text-center text-xs sm:text-sm font-medium text-[#353535] border-b border-[#e9e9e9] min-w-[100px]">
                                                        Status
                                                    </TableHead>
                                                    <TableHead className="px-2 sm:px-4 py-3 sm:py-4 text-left text-xs sm:text-sm font-medium text-[#353535] border-b border-[#e9e9e9] min-w-[120px]">
                                                        Created
                                                    </TableHead>
                                                    <TableHead className="px-2 sm:px-4 py-3 sm:py-4 text-right text-xs sm:text-sm font-medium text-[#353535] border-b border-[#e9e9e9] min-w-[200px]">
                                                        Actions
                                                    </TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody className="bg-white">
                                                {paginatedReviewPosts.length === 0 ? (
                                                    <TableRow>
                                                        <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                                                            No posts found matching the selected filters.
                                                        </TableCell>
                                                    </TableRow>
                                                ) : (
                                                    paginatedReviewPosts.map((post) => (
                                                        <TableRow
                                                            key={post.id}
                                                            className="border-b border-[#e9e9e9] hover:bg-[#fafafa] transition-colors"
                                                        >
                                                            <TableCell className="px-2 sm:px-4 py-3 sm:py-4 text-xs sm:text-sm text-[#353535]">
                                                                {post.id}
                                                            </TableCell>
                                                            <TableCell className="px-2 sm:px-4 py-3 sm:py-4 text-xs sm:text-sm text-[#353535]">
                                                                <div className="font-medium">{post.title}</div>
                                                            </TableCell>
                                                            <TableCell className="px-2 sm:px-4 py-3 sm:py-4 text-xs sm:text-sm text-[#353535]">
                                                                {post.authorName}
                                                            </TableCell>
                                                            <TableCell className="px-2 sm:px-4 py-3 sm:py-4 text-xs sm:text-sm text-[#353535] text-center">
                                                                <div className="flex items-center justify-center">
                                                                    {getStatusBadge(post.status)}
                                                                </div>
                                                            </TableCell>
                                                            <TableCell className="px-2 sm:px-4 py-3 sm:py-4 text-xs sm:text-sm text-[#353535]">
                                                                {new Date(post.createdAt).toLocaleDateString()}
                                                            </TableCell>
                                                            <TableCell className="px-2 sm:px-4 py-3 sm:py-4">
                                                                <div className="flex items-center justify-end gap-2 flex-wrap">
                                                                    {post.status === "pending_review" && canApprove && (
                                                                        <>
                                                                            <Button
                                                                                size="sm"
                                                                                onClick={() => handleApprove(post)}
                                                                                className="bg-green-600 hover:bg-green-700 text-white h-8 px-3 text-xs"
                                                                            >
                                                                                <CheckCircle2 className="size-3 mr-1.5" />
                                                                                Approve
                                                                            </Button>
                                                                            <Button
                                                                                size="sm"
                                                                                variant="outline"
                                                                                onClick={() => handleReject(post)}
                                                                                className="border-red-300 text-red-600 hover:bg-red-50 h-8 px-3 text-xs"
                                                                            >
                                                                                <XCircle className="size-3 mr-1.5" />
                                                                                Reject
                                                                            </Button>
                                                                        </>
                                                                    )}
                                                                    {(post.status === "published" || post.status === "approved" || post.status === "pending_review") && (
                                                                        <Button
                                                                            size="sm"
                                                                            variant="outline"
                                                                            onClick={() => handlePreview(post)}
                                                                            className="h-8 px-3 text-xs"
                                                                        >
                                                                            <Eye className="size-3 mr-1.5" />
                                                                            Preview
                                                                        </Button>
                                                                    )}
                                                                    {post.status === "approved" && canPublish && (
                                                                        <Button
                                                                            size="sm"
                                                                            onClick={() => handleStartPublish(post)}
                                                                            className="bg-[#0D978B] hover:bg-[#0D978B]/90 text-white h-8 px-3 text-xs"
                                                                        >
                                                                            <Globe className="size-3 mr-1.5" />
                                                                            Publish
                                                                        </Button>
                                                                    )}
                                                                    {canEditPost(post) && (
                                                                        <Button
                                                                            size="sm"
                                                                            variant="outline"
                                                                            onClick={() => handleEdit(post)}
                                                                            className="h-8 px-3 text-xs"
                                                                        >
                                                                            <Edit className="size-3 mr-1.5" />
                                                                            Edit
                                                                        </Button>
                                                                    )}
                                                                </div>
                                                            </TableCell>
                                                        </TableRow>
                                                    ))
                                                )}
                                            </TableBody>
                                        </Table>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Pagination */}
                            {totalPages > 1 && (
                                <div className="flex items-center justify-between">
                                    <div className="text-sm text-gray-600">
                                        Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, reviewPosts.length)} of {reviewPosts.length} posts
                                    </div>
                                    <Pagination>
                                        <PaginationContent>
                                            <PaginationItem>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                                    disabled={currentPage === 1}
                                                    className="h-8 px-3"
                                                >
                                                    <ChevronLeft className="size-4" />
                                                </Button>
                                            </PaginationItem>
                                            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                                let pageNum;
                                                if (totalPages <= 5) {
                                                    pageNum = i + 1;
                                                } else if (currentPage <= 3) {
                                                    pageNum = i + 1;
                                                } else if (currentPage >= totalPages - 2) {
                                                    pageNum = totalPages - 4 + i;
                                                } else {
                                                    pageNum = currentPage - 2 + i;
                                                }
                                                return (
                                                    <PaginationItem key={pageNum}>
                                                        <Button
                                                            variant={currentPage === pageNum ? "primary" : "outline"}
                                                            size="sm"
                                                            onClick={() => setCurrentPage(pageNum)}
                                                            className={cn(
                                                                "h-8 min-w-8",
                                                                currentPage === pageNum && "bg-[#0D978B] hover:bg-[#0D978B]/90 text-white"
                                                            )}
                                                        >
                                                            {pageNum}
                                                        </Button>
                                                    </PaginationItem>
                                                );
                                            })}
                                            <PaginationItem>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                                    disabled={currentPage === totalPages}
                                                    className="h-8 px-3"
                                                >
                                                    <ChevronRight className="size-4" />
                                                </Button>
                                            </PaginationItem>
                                        </PaginationContent>
                                    </Pagination>
                                </div>
                            )}
                        </div>
                    </TabsContent>
                )}
            </Tabs>

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
                        tags: [],
                        slug: "",
                        seoTitle: "",
                        seoDescription: "",
                        seoKeywords: [],
                        status: "pending_review",
                    });
                    setImagePreview(null);
                    setValidationErrors({});
                }
            }}>
                <DialogContent className="max-w-5xl w-[calc(100vw-2rem)] sm:w-full max-h-[90vh] overflow-y-auto">
                    <DialogHeader className="pb-2 sm:pb-4">
                        <div className="flex items-center justify-between">
                            <DialogTitle className="text-base sm:text-lg md:text-xl">Create New Blog Post</DialogTitle>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setShowGuidedSidebar(!showGuidedSidebar)}
                                className="h-8 px-3 text-xs"
                            >
                                {showGuidedSidebar ? "Hide" : "Show"} Guide
                            </Button>
                        </div>
                    </DialogHeader>
                    <div className="flex gap-4">
                        {/* Main Form Content */}
                        <div className={cn("space-y-3 sm:space-y-4 py-2 sm:py-4 transition-all", showGuidedSidebar ? "flex-1" : "w-full")}>
                            {/* Category Select */}
                            <div className="space-y-2">
                                <Label htmlFor="category" className="text-sm sm:text-base">Category <span className="text-red-500">*</span></Label>
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
                                <Label htmlFor="title" className="text-sm sm:text-base">
                                    Title <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="title"
                                    value={newBlogPost.title}
                                    onChange={(e) => setNewBlogPost(prev => ({ ...prev, title: e.target.value }))}
                                    placeholder="Enter blog post title"
                                    className={cn(validationErrors.title && "border-red-500")}
                                />
                                {validationErrors.title && (
                                    <p className="text-sm text-red-500 flex items-center gap-1">
                                        <AlertCircle className="w-4 h-4" />
                                        {validationErrors.title}
                                    </p>
                                )}
                            </div>

                            {/* Slug Input */}
                            <div className="space-y-2">
                                <Label htmlFor="slug" className="text-sm sm:text-base">
                                    Slug <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="slug"
                                    value={newBlogPost.slug}
                                    onChange={(e) => setNewBlogPost(prev => ({ ...prev, slug: e.target.value }))}
                                    placeholder="url-friendly-slug"
                                    className={cn(validationErrors.slug && "border-red-500")}
                                />
                                {validationErrors.slug && (
                                    <p className="text-sm text-red-500 flex items-center gap-1">
                                        <AlertCircle className="w-4 h-4" />
                                        {validationErrors.slug}
                                    </p>
                                )}
                            </div>

                            {/* Rich Text Content Editor */}
                            <div className="space-y-2">
                                <Label htmlFor="content" className="text-sm sm:text-base">
                                    Content <span className="text-red-500">*</span>
                                </Label>
                                {typeof window !== 'undefined' && ReactQuill && (
                                    <div className={cn(
                                        "border border-input rounded-md overflow-hidden",
                                        validationErrors.content && "border-red-500"
                                    )}>
                                        <ReactQuill
                                            theme="snow"
                                            value={newBlogPost.content || ""}
                                            onChange={(value) => setNewBlogPost(prev => ({ ...prev, content: value }))}
                                            modules={quillModules}
                                            placeholder="Write your blog post content here..."
                                            className="bg-white blog-quill-editor"
                                        />
                                    </div>
                                )}
                                {validationErrors.content && (
                                    <p className="text-sm text-red-500 flex items-center gap-1">
                                        <AlertCircle className="w-4 h-4" />
                                        {validationErrors.content}
                                    </p>
                                )}
                            </div>

                            {/* Tags Input */}
                            <div className="space-y-2">
                                <Label className="text-sm sm:text-base">Tags</Label>
                                <TagInput
                                    tags={newBlogPost.tags || []}
                                    setTags={(tags) => setNewBlogPost(prev => ({ ...prev, tags }))}
                                />
                            </div>

                            {/* Featured Image Upload */}
                            <div className="space-y-2">
                                <Label className="text-sm sm:text-base">
                                    Featured Image <span className="text-red-500">*</span>
                                </Label>
                                <div
                                    {...getRootProps()}
                                    className={cn(
                                        "border-2 border-dashed rounded-md p-4 sm:p-6 md:p-8 text-center cursor-pointer transition-colors",
                                        isDragActive
                                            ? "border-[#0D978B] bg-[#0D978B]/5"
                                            : validationErrors.image
                                                ? "border-red-500 bg-red-50"
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
                                {validationErrors.image && (
                                    <p className="text-sm text-red-500 flex items-center gap-1">
                                        <AlertCircle className="w-4 h-4" />
                                        {validationErrors.image}
                                    </p>
                                )}
                            </div>

                            {/* SEO Section */}
                            <div className="pt-4 space-y-4">
                                <h3 className="text-sm font-semibold text-[#353535]">SEO Settings</h3>

                                {/* SEO Title */}
                                <div className="space-y-2">
                                    <Label htmlFor="seo-title" className="text-sm sm:text-base">SEO Title</Label>
                                    <Input
                                        id="seo-title"
                                        value={newBlogPost.seoTitle || ""}
                                        onChange={(e) => setNewBlogPost(prev => ({ ...prev, seoTitle: e.target.value }))}
                                        placeholder="SEO optimized title (optional)"
                                    />
                                </div>

                                {/* SEO Description */}
                                <div className="space-y-2">
                                    <Label htmlFor="seo-description" className="text-sm sm:text-base">SEO Description</Label>
                                    <Textarea
                                        id="seo-description"
                                        value={newBlogPost.seoDescription || ""}
                                        onChange={(e) => setNewBlogPost(prev => ({ ...prev, seoDescription: e.target.value }))}
                                        placeholder="Meta description for search engines (optional)"
                                        rows={3}
                                        className="resize-none"
                                    />
                                </div>

                                {/* SEO Keywords */}
                                <div className="space-y-2">
                                    <Label className="text-sm sm:text-base">SEO Keywords</Label>
                                    <TagInput
                                        tags={newBlogPost.seoKeywords || []}
                                        setTags={(keywords) => setNewBlogPost(prev => ({ ...prev, seoKeywords: keywords }))}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Guided Creation Sidebar */}
                        {showGuidedSidebar && (
                            <Card className="w-64 flex-shrink-0 h-fit sticky top-0">
                                <CardContent className="p-4">
                                    <h3 className="text-sm font-semibold text-[#353535] mb-4">Creation Guide</h3>
                                    <div className="space-y-3">
                                        {creationSteps.map((step) => {
                                            const isActive = currentStep === step.id;
                                            const isCompleted = step.id < currentStep;
                                            const stepFieldsCompleted = step.fields.every(field => {
                                                if (field === "category") return !!newBlogPost.category;
                                                if (field === "title") return !!newBlogPost.title;
                                                if (field === "slug") return !!newBlogPost.slug;
                                                if (field === "content") return !!(newBlogPost.content && newBlogPost.content !== "<p><br></p>");
                                                if (field === "image") return !!(imagePreview || (newBlogPost.image && newBlogPost.image !== "/assets/blog1.jpg"));
                                                if (field === "tags") return true; // Optional
                                                if (field === "seoTitle") return !!newBlogPost.seoTitle;
                                                if (field === "seoDescription") return !!newBlogPost.seoDescription;
                                                if (field === "seoKeywords") return !!(newBlogPost.seoKeywords && newBlogPost.seoKeywords.length > 0);
                                                return true;
                                            });

                                            return (
                                                <div
                                                    key={step.id}
                                                    className={cn(
                                                        "p-3 rounded-md border cursor-pointer transition-colors",
                                                        isActive ? "border-[#0D978B] bg-[#0D978B]/5" : "border-gray-200",
                                                        isCompleted && "bg-green-50 border-green-200"
                                                    )}
                                                    onClick={() => setCurrentStep(step.id)}
                                                >
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <div className={cn(
                                                            "size-6 rounded-full flex items-center justify-center text-xs font-semibold",
                                                            isCompleted ? "bg-green-500 text-white" : isActive ? "bg-[#0D978B] text-white" : "bg-gray-200 text-gray-600"
                                                        )}>
                                                            {isCompleted ? <CheckCircle2 className="size-4" /> : step.id}
                                                        </div>
                                                        <span className={cn(
                                                            "text-sm font-medium",
                                                            isActive ? "text-[#0D978B]" : "text-[#353535]"
                                                        )}>
                                                            {step.label}
                                                        </span>
                                                    </div>
                                                    <div className="text-xs text-gray-500 ml-8">
                                                        {stepFieldsCompleted ? (
                                                            <span className="text-green-600">✓ Completed</span>
                                                        ) : (
                                                            <span>In progress...</span>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                    <div className="mt-4 pt-4 border-t">
                                        <div className="text-xs text-gray-500 space-y-1">
                                            <p className="font-medium text-[#353535]">Current Status:</p>
                                            {getStatusBadge(newBlogPost.status || "draft")}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        )}
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
                                    tags: [],
                                    slug: "",
                                    seoTitle: "",
                                    seoDescription: "",
                                    seoKeywords: [],
                                    status: "pending_review",
                                });
                                setImagePreview(null);
                                setValidationErrors({});
                            }}
                            className="w-full sm:w-auto"
                        >
                            Cancel
                        </Button>
                        <div className="flex gap-2 w-full sm:w-auto">
                            <Button
                                variant="outline"
                                onClick={handleSaveAsDraft}
                                className="flex-1 sm:flex-initial gap-2"
                            >
                                <Save className="w-4 h-4" />
                                Save as Draft
                            </Button>
                            <Button
                                variant="primary"
                                onClick={handleSubmitForReview}
                                className="flex-1 sm:flex-initial gap-2 bg-[#0D978B] hover:bg-[#0D978B]/90"
                            >
                                <Send className="w-4 h-4" />
                                Submit for Review
                            </Button>
                        </div>
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
                        tags: [],
                        slug: "",
                        seoTitle: "",
                        seoDescription: "",
                        seoKeywords: [],
                        status: "pending_review",
                    });
                    setImagePreview(null);
                    setValidationErrors({});
                }
            }}>
                <DialogContent className="max-w-4xl w-[calc(100vw-2rem)] sm:w-full max-h-[90vh] overflow-y-auto">
                    <DialogHeader className="pb-2 sm:pb-4">
                        <DialogTitle className="text-base sm:text-lg md:text-xl">Edit Blog Post</DialogTitle>
                        {postToEdit && (
                            <div className="flex items-center gap-2 mt-2">
                                {getStatusBadge(postToEdit.status)}
                                <span className="text-xs text-gray-500">by {postToEdit.authorName}</span>
                            </div>
                        )}
                    </DialogHeader>
                    <div className="space-y-3 sm:space-y-4 py-2 sm:py-4">
                        {/* Category Select */}
                        <div className="space-y-2">
                            <Label htmlFor="edit-category" className="text-sm sm:text-base">Category <span className="text-red-500">*</span></Label>
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
                            <Label htmlFor="edit-title" className="text-sm sm:text-base">
                                Title <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="edit-title"
                                value={newBlogPost.title}
                                onChange={(e) => setNewBlogPost(prev => ({ ...prev, title: e.target.value }))}
                                placeholder="Enter blog post title"
                                className={cn(validationErrors.title && "border-red-500")}
                            />
                            {validationErrors.title && (
                                <p className="text-sm text-red-500 flex items-center gap-1">
                                    <AlertCircle className="w-4 h-4" />
                                    {validationErrors.title}
                                </p>
                            )}
                        </div>

                        {/* Slug Input */}
                        <div className="space-y-2">
                            <Label htmlFor="edit-slug" className="text-sm sm:text-base">
                                Slug <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="edit-slug"
                                value={newBlogPost.slug}
                                onChange={(e) => setNewBlogPost(prev => ({ ...prev, slug: e.target.value }))}
                                placeholder="url-friendly-slug"
                                className={cn(validationErrors.slug && "border-red-500")}
                            />
                            {validationErrors.slug && (
                                <p className="text-sm text-red-500 flex items-center gap-1">
                                    <AlertCircle className="w-4 h-4" />
                                    {validationErrors.slug}
                                </p>
                            )}
                        </div>

                        {/* Rich Text Content Editor */}
                        <div className="space-y-2">
                            <Label htmlFor="edit-content" className="text-sm sm:text-base">
                                Content <span className="text-red-500">*</span>
                            </Label>
                            {typeof window !== 'undefined' && ReactQuill && (
                                <div className={cn(
                                    "border border-input rounded-md overflow-hidden",
                                    validationErrors.content && "border-red-500"
                                )}>
                                    <ReactQuill
                                        theme="snow"
                                        value={newBlogPost.content || ""}
                                        onChange={(value) => setNewBlogPost(prev => ({ ...prev, content: value }))}
                                        modules={quillModules}
                                        placeholder="Write your blog post content here..."
                                        className="bg-white blog-quill-editor"
                                    />
                                </div>
                            )}
                            {validationErrors.content && (
                                <p className="text-sm text-red-500 flex items-center gap-1">
                                    <AlertCircle className="w-4 h-4" />
                                    {validationErrors.content}
                                </p>
                            )}
                        </div>

                        {/* Tags Input */}
                        <div className="space-y-2">
                            <Label className="text-sm sm:text-base">Tags</Label>
                            <TagInput
                                tags={newBlogPost.tags || []}
                                setTags={(tags) => setNewBlogPost(prev => ({ ...prev, tags }))}
                            />
                        </div>

                        {/* Featured Image Upload */}
                        <div className="space-y-2">
                            <Label className="text-sm sm:text-base">
                                Featured Image <span className="text-red-500">*</span>
                            </Label>
                            <div
                                {...getRootProps()}
                                className={cn(
                                    "border-2 border-dashed rounded-md p-4 sm:p-6 md:p-8 text-center cursor-pointer transition-colors",
                                    isDragActive
                                        ? "border-[#0D978B] bg-[#0D978B]/5"
                                        : validationErrors.image
                                            ? "border-red-500 bg-red-50"
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
                            {validationErrors.image && (
                                <p className="text-sm text-red-500 flex items-center gap-1">
                                    <AlertCircle className="w-4 h-4" />
                                    {validationErrors.image}
                                </p>
                            )}
                        </div>

                        {/* SEO Section */}
                        <div className="pt-4 space-y-4">
                            <h3 className="text-sm font-semibold text-[#353535]">SEO Settings</h3>

                            {/* SEO Title */}
                            <div className="space-y-2">
                                <Label htmlFor="edit-seo-title" className="text-sm sm:text-base">SEO Title</Label>
                                <Input
                                    id="edit-seo-title"
                                    value={newBlogPost.seoTitle || ""}
                                    onChange={(e) => setNewBlogPost(prev => ({ ...prev, seoTitle: e.target.value }))}
                                    placeholder="SEO optimized title (optional)"
                                />
                            </div>

                            {/* SEO Description */}
                            <div className="space-y-2">
                                <Label htmlFor="edit-seo-description" className="text-sm sm:text-base">SEO Description</Label>
                                <Textarea
                                    id="edit-seo-description"
                                    value={newBlogPost.seoDescription || ""}
                                    onChange={(e) => setNewBlogPost(prev => ({ ...prev, seoDescription: e.target.value }))}
                                    placeholder="Meta description for search engines (optional)"
                                    rows={3}
                                    className="resize-none"
                                />
                            </div>

                            {/* SEO Keywords */}
                            <div className="space-y-2">
                                <Label className="text-sm sm:text-base">SEO Keywords</Label>
                                <TagInput
                                    tags={newBlogPost.seoKeywords || []}
                                    setTags={(keywords) => setNewBlogPost(prev => ({ ...prev, seoKeywords: keywords }))}
                                />
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
                                    tags: [],
                                    slug: "",
                                    seoTitle: "",
                                    seoDescription: "",
                                    seoKeywords: [],
                                    status: "pending_review",
                                });
                                setImagePreview(null);
                                setValidationErrors({});
                            }}
                            className="w-full sm:w-auto"
                        >
                            Cancel
                        </Button>
                        <div className="flex gap-2 w-full sm:w-auto">
                            <Button
                                variant="outline"
                                onClick={handleSaveAsDraft}
                                className="flex-1 sm:flex-initial gap-2"
                            >
                                <Save className="w-4 h-4" />
                                Save as Draft
                            </Button>
                            <Button
                                variant="primary"
                                onClick={handleSubmitForReview}
                                className="flex-1 sm:flex-initial gap-2 bg-[#0D978B] hover:bg-[#0D978B]/90"
                            >
                                <Send className="w-4 h-4" />
                                Submit for Review
                            </Button>
                        </div>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog open={deleteDialogOpen} onOpenChange={(open) => {
                if (!open) {
                    setDeleteDialogOpen(false);
                    setPostToDelete(null);
                }
            }}>
                <DialogContent className="w-[calc(100vw-2rem)] sm:w-full max-w-md">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-semibold text-[#1C1C1C] text-left">
                            Delete Blog Post
                        </DialogTitle>
                        <DialogDescription className="text-sm text-[#8F8F8F] leading-relaxed mt-2">
                            Are you sure you want to delete <span className="font-medium text-[#353535]">&quot;{postToDelete?.title}&quot;</span>?
                            This action cannot be undone and the post will be permanently removed from your blog.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="mt-6">
                        <Button
                            variant="outline"
                            onClick={() => {
                                setDeleteDialogOpen(false);
                                setPostToDelete(null);
                            }}
                            className="w-full sm:w-auto"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={confirmDelete}
                            className="bg-red-600 hover:bg-red-700 text-white w-full sm:w-auto"
                        >
                            <Trash2 className="size-4 mr-2" />
                            Delete Post
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Preview Dialog */}
            <Dialog open={previewDialogOpen} onOpenChange={setPreviewDialogOpen}>
                <DialogContent className="max-w-4xl w-[calc(100vw-2rem)] sm:w-full max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-semibold text-[#1C1C1C] text-left">
                            Preview Blog Post
                        </DialogTitle>
                        <DialogDescription className="text-sm text-[#8F8F8F] mt-2">
                            This is how your post will appear to readers
                        </DialogDescription>
                    </DialogHeader>
                    {postToPublish && (
                        <div className="space-y-6 mt-4">
                            {/* Featured Image */}
                            <div className="w-full">
                                <img
                                    src={postToPublish.image}
                                    alt={postToPublish.title}
                                    className="w-full h-64 object-cover rounded-lg"
                                />
                            </div>

                            {/* Post Content */}
                            <div className="space-y-4">
                                <div>
                                    <div className="flex items-center gap-2 mb-2">
                                        <Badge variant="secondary" className="text-xs">
                                            {postToPublish.category}
                                        </Badge>
                                        <span className="text-xs text-gray-500">
                                            {new Date(postToPublish.createdAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <h1 className="text-3xl font-bold text-[#1C1C1C] mb-4">
                                        {postToPublish.title}
                                    </h1>
                                    <div className="flex items-center gap-2 mb-4">
                                        <span className="text-sm text-gray-600">By {postToPublish.authorName}</span>
                                    </div>
                                </div>

                                {/* Tags */}
                                {postToPublish.tags && postToPublish.tags.length > 0 && (
                                    <div className="flex flex-wrap gap-2">
                                        {postToPublish.tags.map((tag, index) => (
                                            <Badge key={index} variant="secondary" className="bg-blue-100 text-blue-700">
                                                {tag}
                                            </Badge>
                                        ))}
                                    </div>
                                )}

                                {/* Content */}
                                <div
                                    className="prose max-w-none blog-content-full"
                                    dangerouslySetInnerHTML={{ __html: postToPublish.content }}
                                />

                                {/* SEO Info */}
                                <div className="border-t pt-4 space-y-4">
                                    <h3 className="text-sm font-semibold text-[#353535]">SEO Information</h3>
                                    <div className="text-sm space-y-1">
                                        <p><span className="font-medium">SEO Title:</span> {postToPublish.seoTitle || "Not set"}</p>
                                        <p><span className="font-medium">SEO Description:</span> {postToPublish.seoDescription || "Not set"}</p>
                                        <p><span className="font-medium">Slug:</span> {postToPublish.slug}</p>
                                        {postToPublish.seoKeywords && postToPublish.seoKeywords.length > 0 && (
                                            <p><span className="font-medium">Keywords:</span> {postToPublish.seoKeywords.join(", ")}</p>
                                        )}
                                    </div>

                                    {/* SEO Checklist Status */}
                                    {(postToPublish.status === "published" || postToPublish.status === "approved" || postToPublish.status === "pending_review") && (
                                        <div className="bg-gray-50 rounded-md p-3 space-y-2">
                                            <h4 className="text-xs font-semibold text-[#353535]">SEO Checklist Status</h4>
                                            <div className="space-y-1.5">
                                                <div className={cn("flex items-center gap-2 text-xs", seoChecklist.hasTitle ? "text-green-700" : "text-red-700")}>
                                                    {seoChecklist.hasTitle ? (
                                                        <CheckCircle2 className="size-3" />
                                                    ) : (
                                                        <XCircle className="size-3" />
                                                    )}
                                                    <span>SEO Title {seoChecklist.hasTitle ? "✓" : "✗"}</span>
                                                </div>
                                                <div className={cn("flex items-center gap-2 text-xs", seoChecklist.hasDescription ? "text-green-700" : "text-red-700")}>
                                                    {seoChecklist.hasDescription ? (
                                                        <CheckCircle2 className="size-3" />
                                                    ) : (
                                                        <XCircle className="size-3" />
                                                    )}
                                                    <span>SEO Description {seoChecklist.hasDescription ? "✓" : "✗"}</span>
                                                </div>
                                                <div className={cn("flex items-center gap-2 text-xs", seoChecklist.hasKeywords ? "text-green-700" : "text-red-700")}>
                                                    {seoChecklist.hasKeywords ? (
                                                        <CheckCircle2 className="size-3" />
                                                    ) : (
                                                        <XCircle className="size-3" />
                                                    )}
                                                    <span>SEO Keywords {seoChecklist.hasKeywords ? "✓" : "✗"}</span>
                                                </div>
                                                <div className={cn("flex items-center gap-2 text-xs", seoChecklist.hasSlug ? "text-green-700" : "text-red-700")}>
                                                    {seoChecklist.hasSlug ? (
                                                        <CheckCircle2 className="size-3" />
                                                    ) : (
                                                        <XCircle className="size-3" />
                                                    )}
                                                    <span>URL Slug {seoChecklist.hasSlug ? "✓" : "✗"}</span>
                                                </div>
                                                <div className={cn("flex items-center gap-2 text-xs", seoChecklist.hasImage ? "text-green-700" : "text-red-700")}>
                                                    {seoChecklist.hasImage ? (
                                                        <CheckCircle2 className="size-3" />
                                                    ) : (
                                                        <XCircle className="size-3" />
                                                    )}
                                                    <span>Featured Image {seoChecklist.hasImage ? "✓" : "✗"}</span>
                                                </div>
                                            </div>
                                            {!Object.values(seoChecklist).every(Boolean) && postToPublish.status === "approved" && (
                                                <p className="text-xs text-red-600 mt-2">
                                                    Please complete all SEO requirements before publishing
                                                </p>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                    <DialogFooter className="mt-6">
                        <div className="flex items-center gap-2 w-full sm:w-auto">
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setPreviewDialogOpen(false);
                                    setPostToPublish(null);
                                }}
                            >
                                Close
                            </Button>
                            {postToPublish && (
                                <Button
                                    variant="outline"
                                    onClick={() => {
                                        // Open preview in new tab
                                        const previewWindow = window.open('', '_blank');
                                        if (previewWindow) {
                                            previewWindow.document.write(`
                                                <!DOCTYPE html>
                                                <html>
                                                <head>
                                                    <title>${postToPublish.title}</title>
                                                    <meta name="description" content="${postToPublish.seoDescription || ''}">
                                                    <meta name="keywords" content="${postToPublish.seoKeywords?.join(', ') || ''}">
                                                    <style>
                                                        body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
                                                        img { width: 100%; height: auto; border-radius: 8px; }
                                                        .prose { line-height: 1.6; }
                                                        .prose h1, .prose h2, .prose h3 { margin-top: 1.5em; margin-bottom: 0.5em; }
                                                        .prose p { margin-bottom: 1em; }
                                                        .prose ul, .prose ol { margin-left: 1.5em; margin-bottom: 1em; }
                                                        .badge { display: inline-block; padding: 4px 8px; border-radius: 4px; font-size: 12px; }
                                                    </style>
                                                </head>
                                                <body>
                                                    <img src="${postToPublish.image}" alt="${postToPublish.title}" />
                                                    <div style="margin-top: 20px;">
                                                        <span class="badge" style="background: #f0f0f0;">${postToPublish.category}</span>
                                                        <span style="color: #888; font-size: 14px; margin-left: 10px;">${new Date(postToPublish.createdAt).toLocaleDateString()}</span>
                                                    </div>
                                                    <h1 style="font-size: 2em; margin: 20px 0;">${postToPublish.title}</h1>
                                                    <p style="color: #666; margin-bottom: 20px;">By ${postToPublish.authorName}</p>
                                                    ${postToPublish.tags && postToPublish.tags.length > 0 ? `<div style="margin-bottom: 20px;">${postToPublish.tags.map(tag => `<span class="badge" style="background: #e3f2fd; margin-right: 8px;">${tag}</span>`).join('')}</div>` : ''}
                                                    <div class="prose">${postToPublish.content}</div>
                                                </body>
                                                </html>
                                            `);
                                            previewWindow.document.close();
                                        }
                                    }}
                                    className="gap-2"
                                >
                                    <Eye className="size-4" />
                                    Open in New Tab
                                </Button>
                            )}
                        </div>
                        {postToPublish && postToPublish.status === "approved" && canPublish && (
                            <Button
                                onClick={() => {
                                    if (!validateSEOChecklist(postToPublish)) {
                                        toast.error("Please complete all SEO requirements before publishing");
                                        return;
                                    }
                                    setPreviewDialogOpen(false);
                                    handleStartPublish(postToPublish);
                                }}
                                disabled={!Object.values(seoChecklist).every(Boolean)}
                                className="bg-[#0D978B] hover:bg-[#0D978B]/90 text-white disabled:opacity-50"
                            >
                                <Globe className="size-4 mr-2" />
                                Publish Now
                            </Button>
                        )}
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Publish Confirmation Dialog */}
            <Dialog open={publishConfirmDialogOpen} onOpenChange={(open) => {
                if (!open && !isPublishing) {
                    setPublishConfirmDialogOpen(false);
                    setPostToPublish(null);
                    setRollbackNote("");
                }
            }}>
                <DialogContent className="max-w-2xl w-[calc(100vw-2rem)] sm:w-full max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-semibold text-[#1C1C1C] text-left">
                            Confirm Publication
                        </DialogTitle>
                        <DialogDescription className="text-sm text-[#8F8F8F] mt-2">
                            Review the details below before publishing this post
                        </DialogDescription>
                    </DialogHeader>
                    {postToPublish && (
                        <div className="space-y-6 mt-4">
                            {/* Post Info */}
                            <Card>
                                <CardContent className="p-4 space-y-3">
                                    <div>
                                        <Label className="text-xs text-gray-500">Title</Label>
                                        <p className="text-sm font-medium text-[#353535]">{postToPublish.title}</p>
                                    </div>
                                    <div>
                                        <Label className="text-xs text-gray-500">Author</Label>
                                        <p className="text-sm text-[#353535]">{postToPublish.authorName}</p>
                                    </div>
                                    <div>
                                        <Label className="text-xs text-gray-500">Status</Label>
                                        <div className="mt-1">{getStatusBadge(postToPublish.status)}</div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* SEO Checklist */}
                            <Card>
                                <CardContent className="p-4">
                                    <h3 className="text-sm font-semibold text-[#353535] mb-3 flex items-center gap-2">
                                        <FileText className="size-4" />
                                        SEO Checklist
                                    </h3>
                                    <div className="space-y-2">
                                        <div className={cn("flex items-center gap-2 p-2 rounded", seoChecklist.hasTitle ? "bg-green-50" : "bg-red-50")}>
                                            {seoChecklist.hasTitle ? (
                                                <CheckCircle2 className="size-4 text-green-600" />
                                            ) : (
                                                <XCircle className="size-4 text-red-600" />
                                            )}
                                            <span className={cn("text-sm", seoChecklist.hasTitle ? "text-green-700" : "text-red-700")}>
                                                SEO Title: {postToPublish.seoTitle || "Not set"}
                                            </span>
                                        </div>
                                        <div className={cn("flex items-center gap-2 p-2 rounded", seoChecklist.hasDescription ? "bg-green-50" : "bg-red-50")}>
                                            {seoChecklist.hasDescription ? (
                                                <CheckCircle2 className="size-4 text-green-600" />
                                            ) : (
                                                <XCircle className="size-4 text-red-600" />
                                            )}
                                            <span className={cn("text-sm", seoChecklist.hasDescription ? "text-green-700" : "text-red-700")}>
                                                SEO Description: {postToPublish.seoDescription || "Not set"}
                                            </span>
                                        </div>
                                        <div className={cn("flex items-center gap-2 p-2 rounded", seoChecklist.hasKeywords ? "bg-green-50" : "bg-red-50")}>
                                            {seoChecklist.hasKeywords ? (
                                                <CheckCircle2 className="size-4 text-green-600" />
                                            ) : (
                                                <XCircle className="size-4 text-red-600" />
                                            )}
                                            <span className={cn("text-sm", seoChecklist.hasKeywords ? "text-green-700" : "text-red-700")}>
                                                SEO Keywords: {postToPublish.seoKeywords?.length || 0} keyword(s)
                                            </span>
                                        </div>
                                        <div className={cn("flex items-center gap-2 p-2 rounded", seoChecklist.hasSlug ? "bg-green-50" : "bg-red-50")}>
                                            {seoChecklist.hasSlug ? (
                                                <CheckCircle2 className="size-4 text-green-600" />
                                            ) : (
                                                <XCircle className="size-4 text-red-600" />
                                            )}
                                            <span className={cn("text-sm", seoChecklist.hasSlug ? "text-green-700" : "text-red-700")}>
                                                URL Slug: {postToPublish.slug || "Not set"}
                                            </span>
                                        </div>
                                        <div className={cn("flex items-center gap-2 p-2 rounded", seoChecklist.hasImage ? "bg-green-50" : "bg-red-50")}>
                                            {seoChecklist.hasImage ? (
                                                <CheckCircle2 className="size-4 text-green-600" />
                                            ) : (
                                                <XCircle className="size-4 text-red-600" />
                                            )}
                                            <span className={cn("text-sm", seoChecklist.hasImage ? "text-green-700" : "text-red-700")}>
                                                Featured Image: {seoChecklist.hasImage ? "Set" : "Not set"}
                                            </span>
                                        </div>
                                    </div>

                                    {/* SEO Tips Panel */}
                                    <div className="mt-4 pt-4 border-t bg-blue-50 rounded-md p-3">
                                        <h4 className="text-xs font-semibold text-[#353535] mb-2 flex items-center gap-2">
                                            <Globe className="size-3" />
                                            SEO Tips
                                        </h4>
                                        <ul className="text-xs text-gray-700 space-y-1.5">
                                            <li className="flex items-start gap-2">
                                                <span className="text-[#0D978B] mt-0.5">•</span>
                                                <span><strong>Title:</strong> Keep between 50-60 characters for optimal display</span>
                                            </li>
                                            <li className="flex items-start gap-2">
                                                <span className="text-[#0D978B] mt-0.5">•</span>
                                                <span><strong>Description:</strong> Aim for 150-160 characters with a clear call-to-action</span>
                                            </li>
                                            <li className="flex items-start gap-2">
                                                <span className="text-[#0D978B] mt-0.5">•</span>
                                                <span><strong>Keywords:</strong> Use 3-5 relevant keywords, avoid keyword stuffing</span>
                                            </li>
                                            <li className="flex items-start gap-2">
                                                <span className="text-[#0D978B] mt-0.5">•</span>
                                                <span><strong>Image Alt Text:</strong> Ensure images have descriptive alt text for accessibility</span>
                                            </li>
                                            <li className="flex items-start gap-2">
                                                <span className="text-[#0D978B] mt-0.5">•</span>
                                                <span><strong>Slug:</strong> Use lowercase, hyphens, and include main keywords</span>
                                            </li>
                                        </ul>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Rollback Note */}
                            <div className="space-y-2">
                                <Label htmlFor="rollback-note" className="text-sm font-semibold flex items-center gap-2">
                                    <Clock className="size-4" />
                                    Rollback Note (Optional)
                                </Label>
                                <Textarea
                                    id="rollback-note"
                                    value={rollbackNote}
                                    onChange={(e) => setRollbackNote(e.target.value)}
                                    placeholder="Add a note about this version for easy rollback if needed..."
                                    rows={3}
                                    className="resize-none"
                                />
                                <p className="text-xs text-gray-500">
                                    This note will help you identify this version if you need to rollback later.
                                </p>
                            </div>

                            {/* Warning */}
                            {isPublishing && (
                                <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
                                    <div className="flex items-center gap-2">
                                        <Clock className="size-4 text-yellow-600" />
                                        <p className="text-sm text-yellow-700">
                                            Publishing in progress... The post will appear live within 10 seconds.
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                    <DialogFooter className="mt-6">
                        <Button
                            variant="outline"
                            onClick={() => {
                                setPublishConfirmDialogOpen(false);
                                setPostToPublish(null);
                                setRollbackNote("");
                            }}
                            disabled={isPublishing}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleConfirmPublish}
                            disabled={isPublishing || !Object.values(seoChecklist).every(Boolean)}
                            className="bg-[#0D978B] hover:bg-[#0D978B]/90 text-white"
                        >
                            {isPublishing ? (
                                <>
                                    <Clock className="size-4 mr-2 animate-spin" />
                                    Publishing...
                                </>
                            ) : (
                                <>
                                    <Globe className="size-4 mr-2" />
                                    Confirm & Publish
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Permission Denied Dialog */}
            <Dialog open={permissionDeniedDialog} onOpenChange={setPermissionDeniedDialog}>
                <DialogContent className="w-[calc(100vw-2rem)] sm:w-full max-w-md">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-semibold text-[#1C1C1C] text-left">
                            Permission Required
                        </DialogTitle>
                        <DialogDescription className="text-sm text-[#8F8F8F] leading-relaxed mt-2">
                            You don&apos;t have permission to perform this action.
                            {currentUserRole === "author" && " Authors can only create and edit their own posts."}
                            {currentUserRole === "editor" && " Editors can create, edit, and review posts, but cannot delete them."}
                            {currentUserRole === "admin" && " Please contact your administrator if you believe this is an error."}
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="mt-6">
                        <Button
                            onClick={() => setPermissionDeniedDialog(false)}
                            className="w-full sm:w-auto bg-[#0D978B] hover:bg-[#0D978B]/90 text-white"
                        >
                            Got it
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
