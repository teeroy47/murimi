import { Stethoscope, AlertCircle, BookOpen, Pill } from "lucide-react";
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

const treatments = [
  { animal: "PIG-005", medicine: "Amoxicillin", date: "2025-02-22", withdrawal: "5 days remaining" },
  { animal: "B-007", medicine: "Ivermectin", date: "2025-02-20", withdrawal: "14 days remaining" },
  { animal: "PIG-003", medicine: "Meloxicam", date: "2025-02-18", withdrawal: "Cleared" },
];

const symptoms = ["Coughing", "Lameness", "Diarrhea", "Loss of appetite", "Fever", "Skin lesions", "Nasal discharge"];

export default function Health() {
  return (
    <div className="space-y-4">
      <h1 className="font-heading text-2xl font-bold">Health</h1>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Card>
          <CardContent className="flex flex-col items-center gap-1 p-4">
            <Pill className="h-5 w-5 text-destructive" />
            <span className="text-2xl font-bold font-heading">3</span>
            <span className="text-xs text-muted-foreground">Active Treatments</span>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex flex-col items-center gap-1 p-4">
            <AlertCircle className="h-5 w-5 text-warning" />
            <span className="text-2xl font-bold font-heading">2</span>
            <span className="text-xs text-muted-foreground">Symptom Alerts</span>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex flex-col items-center gap-1 p-4">
            <Stethoscope className="h-5 w-5 text-info" />
            <span className="text-2xl font-bold font-heading">5</span>
            <span className="text-xs text-muted-foreground">Checkups Due</span>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex flex-col items-center gap-1 p-4">
            <BookOpen className="h-5 w-5 text-primary" />
            <span className="text-2xl font-bold font-heading">12</span>
            <span className="text-xs text-muted-foreground">KB Articles</span>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="treatments">
        <TabsList>
          <TabsTrigger value="treatments">Treatments</TabsTrigger>
          <TabsTrigger value="symptoms">Symptom Check</TabsTrigger>
          <TabsTrigger value="log">Log Treatment</TabsTrigger>
        </TabsList>

        <TabsContent value="treatments" className="mt-4 space-y-2">
          {treatments.map((t, i) => (
            <div key={i} className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <p className="text-sm font-medium">{t.animal} — {t.medicine}</p>
                <p className="text-xs text-muted-foreground">{t.date}</p>
              </div>
              <Badge className={`text-[10px] ${t.withdrawal === "Cleared" ? "bg-success/15 text-success" : "bg-warning/15 text-warning"}`}>
                {t.withdrawal}
              </Badge>
            </div>
          ))}
        </TabsContent>

        <TabsContent value="symptoms" className="mt-4">
          <Card>
            <CardHeader><CardTitle className="text-base">Symptom → Suggestion Tool</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <Select>
                <SelectTrigger><SelectValue placeholder="Select Stage" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="piglet">Piglet</SelectItem>
                  <SelectItem value="grower">Grower</SelectItem>
                  <SelectItem value="finisher">Finisher</SelectItem>
                  <SelectItem value="sow">Sow</SelectItem>
                </SelectContent>
              </Select>
              <div>
                <p className="text-sm font-medium mb-2">Select symptoms:</p>
                <div className="flex flex-wrap gap-2">
                  {symptoms.map((s) => (
                    <Badge key={s} variant="outline" className="cursor-pointer hover:bg-primary/10">{s}</Badge>
                  ))}
                </div>
              </div>
              <Button className="w-full">Check Conditions</Button>
              <p className="text-[10px] text-muted-foreground italic">⚠️ This is a suggestion tool only. Always consult a veterinarian.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="log" className="mt-4">
          <Card>
            <CardHeader><CardTitle className="text-base">Log Treatment</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <Input placeholder="Animal or Batch ID" />
              <Input placeholder="Medicine" />
              <div className="grid grid-cols-2 gap-3">
                <Input placeholder="Dosage" />
                <Input type="date" />
              </div>
              <div className="rounded-lg bg-warning/10 p-3 text-sm text-warning">
                Withdrawal period: calculated after medicine selection
              </div>
              <Button className="w-full">Save Treatment</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
