"use client";
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DashboardStats from "./_components/dashboard-stats";

const StorePage = () => {
  const [selectedTab, setSelectedTab] = useState("this week");

  return (
    <Tabs
      orientation="vertical"
      defaultValue={selectedTab}
      className="space-y-4"
    >
      <div className="w-full overflow-x-auto pb-2">
        <TabsList>
          <TabsTrigger
            value="today"
            onClick={() => setSelectedTab("today")}
          >
            Today
          </TabsTrigger>
          <TabsTrigger
            value="this week"
            onClick={() => setSelectedTab("this week")}
          >
            This Week
          </TabsTrigger>
          <TabsTrigger
            value="this month"
            onClick={() => setSelectedTab("this month")}
          >
            This Month
          </TabsTrigger>
          <TabsTrigger
            value="this year"
            onClick={() => setSelectedTab("this year")}
          >
            This Year
          </TabsTrigger>
        </TabsList>
      </div>
      <TabsContent value={selectedTab} className="space-y-4">
        <DashboardStats timeframe={selectedTab} />
      </TabsContent>
    </Tabs>
  );
};

export default StorePage;
