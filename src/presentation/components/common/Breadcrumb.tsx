import React from "react";
import { useNavigate } from "react-router-dom";

interface BreadcrumbItem {
    label: string;
    path: string;
}

interface BreadcrumbProps {
    items: BreadcrumbItem[];
    className?: string;
}

export const Breadcrumb: React.FC<BreadcrumbProps> = ({ items, className = "" }) => {
    const navigate = useNavigate();

    return (
        <nav className={`flex items-center gap-2 text-sm mb-6 ${className}`}>
            {items.map((item, index) => (
                <React.Fragment key={index}>
                    {index > 0 && <span className="text-gray-500">›</span>}
                    <button
                        onClick={() => item.path && navigate(item.path)}
                        className={`transition-colors ${
                            item.path 
                                ? "text-cyan-400 hover:text-cyan-300 cursor-pointer" 
                                : "text-white cursor-default"
                        }`}
                        disabled={!item.path}
                    >
                        {item.label}
                    </button>
                </React.Fragment>
            ))}
        </nav>
    );
};