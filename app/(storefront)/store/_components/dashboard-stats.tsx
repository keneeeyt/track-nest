"use client";
import { DollarSign, ShoppingBag, PartyPopper, LoaderIcon } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useEffect, useState } from "react";
import { Overview } from "./dashboard-overview";
import { toast } from "sonner";
import axios from "axios";
import BestSeller from "./dashboard-best-seller";

const StatCard = ({
  title,
  icon: Icon,
  value,
  description,
  isLoading,
  color,
}: {
  title: string;
  icon: React.ElementType;
  value: string | number;
  description: string;
  isLoading: boolean;
  color: string;
}) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      <Icon className={`h-4 w-4 text-${color}-500`} />
    </CardHeader>
    <CardContent>
      {isLoading ? (
        <div className="flex justify-center mt-2">
          <LoaderIcon className="h-5 w-5 text-muted-foreground animate-spin" />
        </div>
      ) : (
        <>
          <div className="text-2xl font-bold">{value}</div>
          <p className="text-xs text-muted-foreground">{description}</p>
        </>
      )}
    </CardContent>
  </Card>
);

interface Stats {
  totalIncome: string;
  totalExpenses: string;
  totalBalance: string;
  chartData: any; // eslint-disable-line
  topBestSeller: any; // eslint-disable-line
}
const DashboardStats = ({ timeframe }: { timeframe: string }) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [data, setData] = useState<Stats>({
    totalIncome: "0",
    totalExpenses: "0",
    totalBalance: "0",
    chartData: {},
    topBestSeller: {},
  });

  useEffect(() => {
    const getData = async () => {
      setIsLoading(true);
      try {
        const resp = await axios.get(`/api/dashboard?timeframe=${timeframe}`);
        const data = resp.data;

        setData(data);
      } catch (err) {
        toast.error("Something went wrong. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };
    getData();
  }, [timeframe]);

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-1 lg:grid-cols-3">
        <StatCard
          title="Total Income"
          icon={DollarSign}
          value={`₱${data.totalIncome.toLocaleString()}`}
          description={`Total income for ${timeframe}`}
          isLoading={isLoading}
          color="green"
        />
        <StatCard
          title="Total Expenses"
          icon={ShoppingBag}
          value={`₱${data.totalExpenses.toLocaleString()}`}
          description={`Total expenses for ${timeframe}`}
          isLoading={isLoading}
          color="red"
        />
        <StatCard
          title="Total Balance"
          icon={PartyPopper}
          value={`₱${data.totalBalance.toLocaleString()}`}
          description={`Balance overview for ${timeframe}`}
          isLoading={isLoading}
          color="green"
        />
      </div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-7 mt-2">
        <Card className="col-span-1 lg:col-span-4">
          <CardHeader>
            <CardTitle>Overview</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <Overview chartData={data.chartData} />
          </CardContent>
        </Card>
        <Card className="col-span-1 lg:col-span-3">
          <CardHeader>
            <CardTitle>Best Seller</CardTitle>
            <CardDescription>Your top 5 best seller {timeframe}</CardDescription>
          </CardHeader>
          <CardContent>
            <BestSeller data={data.topBestSeller} isLoading={isLoading} />
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default DashboardStats;
