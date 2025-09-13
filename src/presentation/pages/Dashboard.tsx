import React from "react";
import { useNavigate } from "react-router-dom";
import { StatsCards } from "../components/dashboard/StatsCards";
import { PriceHighlights } from "../components/dashboard/PriceHighlights";
import { RecentGames } from "../components/dashboard/RecentGames";
import { useDashboardData } from "../hooks/useDashboardData";

export const Dashboard: React.FC = () => {
    const navigate = useNavigate();
    const dashboardData = useDashboardData();

    const handleHighlightClick = (gameIdentifier: string) => {
        navigate(`/collection/game/${gameIdentifier}`);
    };

    const handleRecentGameClick = (gameId: string) => {
        navigate(`/collection/game/${gameId}`);
    };


    return (
        <div className="w-full">
            <h1 className="text-3xl font-bold text-white mb-2">Dashboard</h1>
            <p className="text-gray-400 mb-8">Track and manage your game library</p>

            <StatsCards
                stats={dashboardData.stats}
                loading={dashboardData.statsLoading}
                error={dashboardData.statsError}
            />

            {dashboardData.isPriceChartingEnabled && (
                <PriceHighlights
                    highlights={dashboardData.highlights}
                    loading={dashboardData.highlightsLoading}
                    error={dashboardData.highlightsError}
                    onHighlightClick={handleHighlightClick}
                />
            )}

            <RecentGames
                recentGames={dashboardData.recentGames}
                loading={dashboardData.recentGamesLoading}
                error={dashboardData.recentGamesError}
                onGameClick={handleRecentGameClick}
            />
        </div>
    );
};