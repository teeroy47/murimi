import { Wheat, Scale, Droplets, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const feedingPlans = [
  { name: "Starter Mix A", stage: "Piglet", protein: "22%", energy: "14.5 MJ/kg" },
  { name: "Grower Mix B", stage: "Grower", protein: "18%", energy: "13.8 MJ/kg" },
  { name: "Finisher Mix C", stage: "Finisher", protein: "15%", energy: "13.2 MJ/kg" },
  { name: "Sow Lactation", stage: "Sow", protein: "19%", energy: "14.0 MJ/kg" },
];

const waterChecks = [
  { pen: "A1", status: "ok", time: "08:30" },
  { pen: "A2", status: "ok", time: "08:32" },
  { pen: "A3", status: "missed", time: "-" },
  { pen: "B1", status: "ok", time: "08:45" },
  { pen: "B2", status: "issue", time: "08:50" },
  { pen: "C1", status: "ok", time: "09:00" },
];

const waterStyles: Record<string, string> = {
  ok: "bg-success/15 text-success",
  missed: "bg-destructive/15 text-destructive",
  issue: "bg-warning/15 text-warning",
};

export default function Nutrition() {
  return (
    <div className="space-y-4">
      <h1 className="font-heading text-2xl font-bold">Nutrition</h1>

      <Tabs defaultValue="feeding">
        <TabsList>
          <TabsTrigger value="feeding">Feeding Plans</TabsTrigger>
          <TabsTrigger value="log">Feed Log</TabsTrigger>
          <TabsTrigger value="fcr">FCR</TabsTrigger>
          <TabsTrigger value="water">Water Checks</TabsTrigger>
        </TabsList>

        <TabsContent value="feeding" className="mt-4 grid gap-3 sm:grid-cols-2">
          {feedingPlans.map((plan) => (
            <Card key={plan.name} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">{plan.name}</h3>
                  <Badge className="bg-primary/15 text-primary text-[10px]">{plan.stage}</Badge>
                </div>
                <div className="mt-2 grid grid-cols-2 gap-2 text-sm text-muted-foreground">
                  <span>Protein: {plan.protein}</span>
                  <span>Energy: {plan.energy}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="log" className="mt-4">
          <Card>
            <CardHeader><CardTitle className="text-base">Quick Feed Entry</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <Select>
                <SelectTrigger><SelectValue placeholder="Select Pen" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="A1">Pen A1</SelectItem>
                  <SelectItem value="A2">Pen A2</SelectItem>
                  <SelectItem value="B1">Pen B1</SelectItem>
                </SelectContent>
              </Select>
              <div className="grid grid-cols-2 gap-3">
                <Input placeholder="Amount (kg)" type="number" />
                <Input placeholder="Number of pigs" type="number" />
              </div>
              <div className="rounded-lg bg-muted p-3 text-sm">
                <span className="text-muted-foreground">Per pig: </span>
                <span className="font-medium">— kg</span>
              </div>
              <Button className="w-full">Log Feed</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="fcr" className="mt-4">
          <div className="grid gap-3 sm:grid-cols-3">
            <Card>
              <CardContent className="p-4 text-center">
                <Wheat className="mx-auto h-6 w-6 text-primary mb-1" />
                <p className="text-2xl font-bold font-heading">1,240 kg</p>
                <p className="text-xs text-muted-foreground">Feed Consumed</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <Scale className="mx-auto h-6 w-6 text-success mb-1" />
                <p className="text-2xl font-bold font-heading">480 kg</p>
                <p className="text-xs text-muted-foreground">Weight Gained</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <TrendingUp className="mx-auto h-6 w-6 text-info mb-1" />
                <p className="text-2xl font-bold font-heading">2.58</p>
                <p className="text-xs text-muted-foreground">FCR Score</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="water" className="mt-4 space-y-2">
          {waterChecks.map((check) => (
            <div key={check.pen} className="flex items-center justify-between rounded-lg border p-3">
              <div className="flex items-center gap-3">
                <Droplets className="h-4 w-4 text-info" />
                <span className="font-medium">Pen {check.pen}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">{check.time}</span>
                <Badge className={`text-[10px] ${waterStyles[check.status]}`}>{check.status}</Badge>
              </div>
            </div>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}
