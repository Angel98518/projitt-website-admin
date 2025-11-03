// components/PdfViewer.jsx
"use client";

import { useEffect, useRef, useState } from "react";
import LoadingSpinner from "../common/loading-spinner";

interface PdfViewerProps {
    url: string;
}

export default function PdfViewer({ url }: PdfViewerProps) {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const renderPDF = async () => {
            try {
                setLoading(true);
                setError(null);

                // Use a different approach to load PDF.js
                const script = document.createElement('script');
                script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
                script.async = true;

                await new Promise((resolve, reject) => {
                    script.onload = resolve;
                    script.onerror = reject;
                    document.head.appendChild(script);
                });

                // Set up worker
                (window as any).pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

                const loadingTask = (window as any).pdfjsLib.getDocument(url);
                const pdf = await loadingTask.promise;

                // Load first page
                const page = await pdf.getPage(1);
                const viewport = page.getViewport({ scale: 0.5 }); // Smaller scale for preview

                const canvas = canvasRef.current;
                if (!canvas) return;

                const context = canvas.getContext("2d");
                if (!context) return;

                canvas.height = viewport.height;
                canvas.width = viewport.width;

                await page.render({
                    canvasContext: context,
                    viewport: viewport
                }).promise;

                setLoading(false);
            } catch (error) {
                console.error('Error loading PDF:', error);
                setError('Failed to load PDF');
                setLoading(false);
            }
        };

        if (url && typeof window !== 'undefined') {
            renderPDF();
        }
    }, [url]);

    if (error) {
        return (
            <div className="w-full h-full flex items-center justify-center bg-gray-100">
                <div className="text-center">
                    <p className="text-sm text-gray-500 mb-2">Failed to load PDF</p>
                    <p className="text-xs text-gray-400">{url}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full h-full relative">
            {loading && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                    <LoadingSpinner />
                </div>
            )}
            <canvas
                className="w-full h-full object-contain"
                ref={canvasRef}
                style={{ display: loading ? 'none' : 'block' }}
            />
        </div>
    );
}
