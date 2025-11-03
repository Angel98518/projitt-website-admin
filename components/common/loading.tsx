import Image from 'next/image';

export default function Loading() {
    return (
        <div className="w-[100vw] h-[100vh] bg-[#fafafa] flex flex-col items-center justify-center relative overflow-y-auto overflow-x-hidden">
            <Image src="/images/logo.png" alt="Loading" width={200} height={50} className="h-[50px] animate-bounce" priority />
        </div>
    );
}