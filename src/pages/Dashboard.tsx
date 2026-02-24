import {
  Wheat,
  Droplets,
  Baby,
  Stethoscope,
  Scissors,
  AlertTriangle,
  Scale,
  Thermometer,
  Syringe,
  Heart,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const taskCards = [
  { label: "Feed Tasks Due", value: 12, icon: Wheat, color: "text-primary" },
  { label: "Water Checks Due", value: 4, icon: Droplets, color: "text-info" },
  { label: "Farrowing Due", value: 2, icon: Baby, color: "text-warning" },
  { label: "Treatments Due", value: 3, icon: Stethoscope, color: "text-destructive" },
  { label: "Slaughter Eligible", value: 18, icon: Scissors, color: "text-success" },
];

const alerts = [
  { message: "Pen B3: Poor weight gain detected (3 pigs below target)", severity: "warning" as const },
  { message: "Pen A1: Water check missed — overdue by 4 hours", severity: "destructive" as const },
  { message: "Sow #S042: Farrowing expected within 24 hours", severity: "info" as const },
  { message: "Boar #B007: Treatment withdrawal period active", severity: "warning" as const },
];

const quickActions = [
  { label: "Log Feed", icon: Wheat },
  { label: "Log Weight", icon: Scale },
  { label: "Record Heat", icon: Thermometer },
  { label: "Treatment", icon: Syringe },
  { label: "Mark Slaughter", icon: Scissors },
];

const severityStyles: Record<string, string> = {
  warning: "border-l-warning bg-warning/5",
  destructive: "border-l-destructive bg-destructive/5",
  info: "border-l-info bg-info/5",
};

export default function Dashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold">Good morning, John 🌾</h1>
        <p className="text-sm text-muted-foreground">Here's your farm overview for today</p>
      </div>

      {/* Task Cards */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-5">
        {taskCards.map((task) => (
          <Card key={task.label} className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="flex flex-col items-center gap-1 p-4 text-center">
              <task.icon className={`h-6 w-6 ${task.color}`} />
              <span className="text-2xl font-bold font-heading">{task.value}</span>
              <span className="text-xs text-muted-foreground">{task.label}</span>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {/* Alerts */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <AlertTriangle className="h-4 w-4 text-warning" />
              Active Alerts
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {alerts.map((alert, i) => (
              <div
                key={i}
                className={`rounded-lg border-l-4 p-3 text-sm ${severityStyles[alert.severity]}`}
              >
                {alert.message}
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-2">
            {quickActions.map((action) => (
              <Button
                key={action.label}
                variant="outline"
                className="h-auto flex-col gap-2 py-4 hover:bg-primary/5 hover:border-primary/30"
              >
                <action.icon className="h-5 w-5 text-primary" />
                <span className="text-xs">{action.label}</span>
              </Button>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Breeding Overview Mini */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Heart className="h-4 w-4 text-destructive" />
            Breeding Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {[
              { label: "In Heat", value: 3 },
              { label: "Serviced", value: 5 },
              { label: "Pregnant", value: 12 },
              { label: "Farrowing Soon", value: 2 },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-2xl font-bold font-heading">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
