const LoadingSkeleton = ({ className = '' }) => {
    return (
        <div className={`shimmer rounded-lg ${className}`} />
    );
};

export const CardSkeleton = () => {
    return (
        <div className="bg-white rounded-2xl p-6 shadow-lg">
            <LoadingSkeleton className="h-6 w-3/4 mb-4" />
            <LoadingSkeleton className="h-4 w-full mb-2" />
            <LoadingSkeleton className="h-4 w-5/6 mb-2" />
            <LoadingSkeleton className="h-4 w-4/6" />
        </div>
    );
};

export default LoadingSkeleton;