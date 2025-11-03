'use client'
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Linkedin, Send, Share2, Twitter } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Copy } from "lucide-react";
import { useState } from "react";

interface ShareProps {
    url: string;
    className?: string
}
export default function Share({ url, className }: ShareProps) {
    const [open, setOpen] = useState(false);
    const [shareMethod, setShareMethod] = useState<'telegram' | 'twitter' | 'linkedin'>('telegram');

    /**
     * Copies the job share URL to the clipboard and shows tooltip feedback.
     */
    const handleCopy = () => {
        navigator.clipboard.writeText(url).then(() => {
            setOpen(true);
            setTimeout(() => {
                setOpen(false);
            }, 2000);
        }).catch((err) => {
            console.error("Failed to copy: ", err);
        });
    };

    /**
     * Handles sharing to different social media platforms
     */
    const handleShare = (platform: 'telegram' | 'twitter' | 'linkedin') => {
        setShareMethod(platform);

        let shareUrl = '';
        const encodedUrl = encodeURIComponent(url);
        const encodedText = encodeURIComponent('Check out this job opportunity!');

        switch (platform) {
            case 'telegram':
                shareUrl = `https://t.me/share/url?url=${encodedUrl}&text=${encodedText}`;
                break;
            case 'twitter':
                shareUrl = `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedText}`;
                break;
            case 'linkedin':
                shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`;
                break;
        }

        // Open the share URL in a new window/tab
        if (shareUrl) {
            window.open(shareUrl, '_blank', 'width=600,height=400');
        }
    };
    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button
                    className={"w-[116px] h-[42px] text-white font-semibold rounded-[8px]" + className}
                    id="share-button" data-testid="share-button"
                >
                    <Share2 className="size-[17px]" />
                    Share
                </Button>
            </DialogTrigger>

            <DialogTitle />
            <DialogContent
                className="w-[90%] md:w-[392px] pl-0 pr-0 pt-0 pb-0 !rounded-[16px]"
                id="share-dialog" data-testid="share-dialog"
            >
                <div className="flex flex-col gap-[8px] py-[24px] px-[24px]">
                    <p className="text-[16px]/[20px] font-semibold text-[#353535]">Share with</p>
                    <div className="flex w-full justify-between mt-[36px] px-[18px]">
                        {/* Share options */}
                        {[
                            { icon: <Send className={`size-[24px] ${shareMethod === 'telegram' ? 'text-[#0d978b]' : 'text-[#4b4b4b] '}`} />, label: "Telegram", platform: 'telegram' as const },
                            { icon: <Twitter className={`size-[24px] ${shareMethod === 'twitter' ? 'text-[#0d978b]' : 'text-[#4b4b4b] '}`} />, label: "Twitter", platform: 'twitter' as const },
                            { icon: <Linkedin className={`size-[24px] ${shareMethod === 'linkedin' ? 'text-[#0d978b]' : 'text-[#4b4b4b] '}`} />, label: "LinkedIn", platform: 'linkedin' as const },
                        ].map(({ icon, label, platform }) => (
                            <div
                                key={label}
                                className="flex flex-col items-center gap-[8px] cursor-pointer"
                                id={`share-${label.toLowerCase()}`} data-testid={`share-${label.toLowerCase()}`}
                                onClick={() => handleShare(platform)}
                            >
                                <div className={`w-[72px] h-[72px]  rounded-full flex items-center justify-center ${shareMethod === platform ? 'bg-[#d6eeec]' : 'bg-[#f8f8f8]'}`}>
                                    {icon}
                                </div>
                                <p className={`text-[12px]/[15px] ${shareMethod === platform ? 'text-[#0d978b]' : 'text-[#4b4b4b] '}`}>{label}</p>
                            </div>
                        ))}
                    </div>

                    <p className="text-[12px]/[15px] text-[#787878] font-semibold mt-[46px] text-center">
                        Or share with link
                    </p>

                    <div
                        className="flex w-full justify-between items-center gap-[8px] bg-[#f8f8f8] rounded-[16px] px-[17px] py-[14px]"
                        id="share-link-container" data-testid="share-link-container"
                    >
                        <p className="w-[calc(100%-20px)] overflow-ellipsis overflow-hidden text-[14px]/[17.5px] text-[#8f8f8f]" id="share-url" data-testid="share-url">
                            {url}
                        </p>
                        <Tooltip open={open}>
                            <TooltipTrigger>
                                <Copy
                                    className="text-[#0d978b] size-[24px] cursor-pointer"
                                    onClick={handleCopy}
                                    id="copy-button" data-testid="copy-button"
                                />
                            </TooltipTrigger>
                            <TooltipContent>
                                Copy
                            </TooltipContent>
                        </Tooltip>
                    </div>
                </div>
            </DialogContent>
        </Dialog>)
}