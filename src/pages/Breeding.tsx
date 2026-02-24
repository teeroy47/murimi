import { Heart, Calendar, Baby } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const breedingEvents = [
  { sow: "S-042", event: "Farrowing Due", date: "2025-02-26", status: "upcoming" },
  { sow: "S-038", event: "Heat Detected", date: "2025-02-23", status: "active" },
  { sow: "S-041", event: "Serviced", date: "2025-02-20", status: "done" },
  { sow: "S-035", event: "Farrowed — 12 alive, 1 still", date: "2025-02-15", status: "done" },
  { sow: "S-039", event: "Heat Detected", date: "2025-02-14", status: "done" },
];

const statusColors: Record<string, string> = {
  upcoming: "bg-warning/15 text-warning",
  active: "bg-info/15 text-info",
  done: "bg-muted text-muted-foreground",
};

export default function Breeding() {
  return (
    <div className="space-y-4">
      <h1 className="font-heading text-2xl font-bold">Breeding</h1>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {[
          { label: "In Heat", value: 3, icon: Heart, color: "text-destructive" },
          { label: "Serviced", value: 5, icon: Calendar, color: "text-info" },
          { label: "Pregnant", value: 12, icon: Heart, color: "text-primary" },
          { label: "Farrowing Soon", value: 2, icon: Baby, color: "text-warning" },
        ].map((s) => (
          <Card key={s.label}>
            <CardContent className="flex flex-col items-center gap-1 p-4">
              <s.icon className={`h-5 w-5 ${s.color}`} />
              <span className="text-2xl font-bold font-heading">{s.value}</span>
              <span className="text-xs text-muted-foreground">{s.label}</span>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="calendar">
        <TabsList>
          <TabsTrigger value="calendar">Calendar</TabsTrigger>
          <TabsTrigger value="heat">Record Heat</TabsTrigger>
          <TabsTrigger value="service">Service</TabsTrigger>
          <TabsTrigger value="farrowing">Farrowing</TabsTrigger>
        </TabsList>

        <TabsContent value="calendar" className="mt-4 space-y-2">
          {breedingEvents.map((ev, i) => (
            <div key={i} className="flex items-center gap-3 rounded-lg border p-3">
              <Badge className={`text-[10px] ${statusColors[ev.status]}`}>{ev.status}</Badge>
              <div className="flex-1">
                <p className="text-sm font-medium">{ev.sow}: {ev.event}</p>
                <p className="text-xs text-muted-foreground">{ev.date}</p>
              </div>
            </div>
          ))}
        </TabsContent>

        <TabsContent value="heat" className="mt-4">
          <Card>
            <CardHeader><CardTitle className="text-base">Record Heat</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <Select>
                <SelectTrigger><SelectValue placeholder="Select Sow" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="S-038">S-038</SelectItem>
                  <SelectItem value="S-039">S-039</SelectItem>
                  <SelectItem value="S-041">S-041</SelectItem>
                </SelectContent>
              </Select>
              <Input type="datetime-local" />
              <div className="space-y-1">
                <p className="text-sm font-medium">Signs observed:</p>
                <div className="flex flex-wrap gap-2">
                  {["Standing reflex", "Swollen vulva", "Restlessness", "Mounting others"].map((s) => (
                    <Badge key={s} variant="outline" className="cursor-pointer hover:bg-primary/10">{s}</Badge>
                  ))}
                </div>
              </div>
              <Button className="w-full">Save Heat Record</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="service" className="mt-4">
          <Card>
            <CardHeader><CardTitle className="text-base">Record Service</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <Select>
                <SelectTrigger><SelectValue placeholder="Select Sow" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="S-038">S-038</SelectItem>
                  <SelectItem value="S-039">S-039</SelectItem>
                </SelectContent>
              </Select>
              <Select>
                <SelectTrigger><SelectValue placeholder="Select Boar" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="B-007">B-007</SelectItem>
                  <SelectItem value="B-012">B-012</SelectItem>
                </SelectContent>
              </Select>
              <Input type="date" />
              <div className="rounded-lg bg-muted p-3 text-sm">
                <span className="text-muted-foreground">Expected Farrowing: </span>
                <span className="font-medium">~ 114 days after service</span>
              </div>
              <Button className="w-full">Save Service</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="farrowing" className="mt-4">
          <Card>
            <CardHeader><CardTitle className="text-base">Record Farrowing</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <Select>
                <SelectTrigger><SelectValue placeholder="Select Sow" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="S-042">S-042</SelectItem>
                </SelectContent>
              </Select>
              <div className="grid grid-cols-2 gap-3">
                <Input placeholder="Born alive" type="number" />
                <Input placeholder="Stillborn" type="number" />
              </div>
              <Input placeholder="Notes..." />
              <Button className="w-full">Save Farrowing</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
