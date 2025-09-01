import React from 'react';
import { Star } from 'lucide-react';

interface StarRatingProps {
    rating: number;
    onRatingChange: (rating: number) => void;
    maxStars?: number;
    size?: number;
    readonly?: boolean;
    className?: string;
}

export const StarRating: React.FC<StarRatingProps> = ({
    rating,
    onRatingChange,
    maxStars = 5,
    size = 20,
    readonly = false,
    className = ""
}) => {
    const handleStarClick = (starIndex: number) => {
        if (readonly) return;
        onRatingChange(starIndex + 1);
    };

    return (
        <div className={`flex items-center gap-1 ${className}`}>
            {Array.from({ length: maxStars }, (_, index) => {
                const isFilled = index < rating;
                const isHoverable = !readonly && index < rating;
                
                return (
                    <button
                        key={index}
                        type="button"
                        onClick={() => handleStarClick(index)}
                        disabled={readonly}
                        className={`transition-colors ${
                            readonly 
                                ? 'cursor-default' 
                                : 'cursor-pointer hover:scale-110 transition-transform'
                        }`}
                        title={`${index + 1} star${index === 0 ? '' : 's'}`}
                    >
                        <Star
                            size={size}
                            className={`${
                                isFilled
                                    ? 'fill-yellow-400 text-yellow-400'
                                    : 'text-gray-400 hover:text-yellow-300'
                            } ${!readonly && 'hover:text-yellow-300'}`}
                        />
                    </button>
                );
            })}
        </div>
    );
};