import { Scissors, AlertTriangle, CheckCircle, XCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const eligiblePigs = [
  { id: "PIG-001", weight: 95, age: "142d", withdrawal: "Clear", status: "eligible" as const },
  { id: "PIG-002", weight: 88, age: "140d", withdrawal: "Clear", status: "eligible" as const },
  { id: "PIG-006", weight: 92, age: "138d", withdrawal: "Clear", status: "eligible" as const },
  { id: "PIG-005", weight: 65, age: "120d", withdrawal: "Active (5d)", status: "blocked" as const },
  { id: "PIG-003", weight: 42, age: "95d", withdrawal: "Clear", status: "warning" as const },
];

const statusConfig: Record<string, { icon: React.ReactNode; className: string; label: string }> = {
  eligible: { icon: <CheckCircle className="h-4 w-4" />, className: "bg-success/15 text-success", label: "Eligible" },
  blocked: { icon: <XCircle className="h-4 w-4" />, className: "bg-destructive/15 text-destructive", label: "Blocked" },
  warning: { icon: <AlertTriangle className="h-4 w-4" />, className: "bg-warning/15 text-warning", label: "Warning" },
};

export default function Slaughter() {
  return (
    <div className="space-y-4">
      <h1 className="font-heading text-2xl font-bold">Slaughter & Sales</h1>

      <Tabs defaultValue="eligibility">
        <TabsList>
          <TabsTrigger value="eligibility">Eligibility</TabsTrigger>
          <TabsTrigger value="record">Mark Slaughter</TabsTrigger>
          <TabsTrigger value="rules">Rules (Admin)</TabsTrigger>
        </TabsList>

        <TabsContent value="eligibility" className="mt-4 space-y-2">
          {eligiblePigs.map((pig) => {
            const cfg = statusConfig[pig.status];
            return (
              <Card key={pig.id} className="hover:shadow-md transition-shadow">
                <CardContent className="flex items-center gap-4 p-4">
                  <div className={`flex h-8 w-8 items-center justify-center rounded-full ${cfg.className}`}>
                    {cfg.icon}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{pig.id}</span>
                      <Badge className={`text-[10px] ${cfg.className}`}>{cfg.label}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {pig.weight} kg · {pig.age} · Withdrawal: {pig.withdrawal}
                    </p>
                  </div>
                  <span className="text-lg font-heading font-bold">{pig.weight}<span className="text-xs text-muted-foreground ml-0.5">kg</span></span>
                </CardContent>
              </Card>
            );
          })}
        </TabsContent>

        <TabsContent value="record" className="mt-4">
          <Card>
            <CardHeader><CardTitle className="text-base">Mark Slaughter</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <Select>
                <SelectTrigger><SelectValue placeholder="Select Pig" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="PIG-001">PIG-001 (95 kg)</SelectItem>
                  <SelectItem value="PIG-002">PIG-002 (88 kg)</SelectItem>
                  <SelectItem value="PIG-006">PIG-006 (92 kg)</SelectItem>
                </SelectContent>
              </Select>
              <div className="grid grid-cols-2 gap-3">
                <Input placeholder="Pre-slaughter weight (kg)" type="number" />
                <Input placeholder="Carcass weight (kg)" type="number" />
              </div>
              <Input placeholder="Destination / Buyer" />
              <Input placeholder="Notes..." />
              <Button className="w-full">Confirm Slaughter</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rules" className="mt-4">
          <Card>
            <CardHeader><CardTitle className="text-base">Slaughter Rules</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium">Min Weight (kg)</label>
                  <Input type="number" defaultValue={80} />
                </div>
                <div>
                  <label className="text-sm font-medium">Max Weight (kg)</label>
                  <Input type="number" defaultValue={120} />
                </div>
              </div>
              <div className="space-y-2 text-sm">
                {[
                  "Require minimum age (120 days)",
                  "Require recent weight (within 7 days)",
                  "Block during active withdrawal",
                ].map((rule) => (
                  <label key={rule} className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" defaultChecked className="rounded border-input" />
                    {rule}
                  </label>
                ))}
              </div>
              <Button className="w-full">Save Rules</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
