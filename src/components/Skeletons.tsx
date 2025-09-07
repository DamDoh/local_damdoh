import { Skeleton } from "@/components/ui/skeleton";

export function PageSkeleton() {
    return (
        <div className="grid md:grid-cols-12 gap-6 items-start">
            <aside className="hidden md:block md:col-span-3 lg:col-span-2">
                 <Skeleton className="h-[400px] w-full" />
            </aside>
            <div className="md:col-span-6 lg:col-span-7 space-y-6">
                <Skeleton className="h-28 w-full" />
                <Skeleton className="h-64 w-full" />
                <Skeleton className="h-56 w-full" />
            </div>
            <aside className="hidden lg:block md:col-span-3">
                 <Skeleton className="h-[400px] w-full" />
            </aside>
        </div>
    );
}
