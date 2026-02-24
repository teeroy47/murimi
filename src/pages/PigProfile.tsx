import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Calendar, Scale, MapPin } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function PigProfile() {
  const { id } = useParams();
  const navigate = useNavigate();

  // Mock data for the selected pig
  const pig = {
    id: id || "PIG-001",
    age: "142 days",
    stage: "Finisher",
    weight: 95,
    pen: "A1",
    batch: "B-2024-03",
    health: "healthy",
    breed: "Large White x Landrace",
    dob: "2024-10-05",
  };

  const timeline = [
    { date: "2025-02-20", event: "Weight recorded: 95 kg", type: "weight" },
    { date: "2025-02-18", event: "Feed ration adjusted to Finisher Mix B", type: "nutrition" },
    { date: "2025-02-15", event: "Weight recorded: 90 kg", type: "weight" },
    { date: "2025-02-10", event: "Moved to Pen A1", type: "movement" },
    { date: "2025-01-28", event: "Vaccination: PCV2", type: "health" },
    { date: "2025-01-15", event: "Stage changed: Grower → Finisher", type: "stage" },
  ];

  const typeColors: Record<string, string> = {
    weight: "bg-info/15 text-info",
    nutrition: "bg-primary/15 text-primary",
    movement: "bg-accent text-accent-foreground",
    health: "bg-destructive/15 text-destructive",
    stage: "bg-warning/15 text-warning",
  };

  return (
    <div className="space-y-4">
      <Button variant="ghost" size="sm" onClick={() => navigate("/pigs")} className="gap-1 -ml-2">
        <ArrowLeft className="h-4 w-4" />
        Back to Pigs
      </Button>

      {/* Header Card */}
      <Card>
        <CardContent className="flex flex-wrap items-center gap-6 p-6">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted text-3xl">
            🐷
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h1 className="font-heading text-2xl font-bold">{pig.id}</h1>
              <Badge className="bg-success/15 text-success">{pig.stage}</Badge>
              <Badge className="bg-success/15 text-success">{pig.health}</Badge>
            </div>
            <p className="text-sm text-muted-foreground mt-1">{pig.breed}</p>
          </div>
          <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-sm md:grid-cols-4">
            <div className="flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-muted-foreground">Age:</span>
              <span className="font-medium">{pig.age}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Scale className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-muted-foreground">Weight:</span>
              <span className="font-medium">{pig.weight} kg</span>
            </div>
            <div className="flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-muted-foreground">Pen:</span>
              <span className="font-medium">{pig.pen}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-muted-foreground">Batch:</span>
              <span className="font-medium">{pig.batch}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="timeline">
        <TabsList>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
          <TabsTrigger value="nutrition">Nutrition</TabsTrigger>
          <TabsTrigger value="breeding">Breeding</TabsTrigger>
          <TabsTrigger value="health">Health</TabsTrigger>
          <TabsTrigger value="slaughter">Slaughter</TabsTrigger>
        </TabsList>

        <TabsContent value="timeline" className="mt-4 space-y-2">
          {timeline.map((event, i) => (
            <div key={i} className="flex items-start gap-3 rounded-lg border p-3">
              <Badge className={`mt-0.5 text-[10px] ${typeColors[event.type]}`}>{event.type}</Badge>
              <div className="flex-1">
                <p className="text-sm">{event.event}</p>
                <p className="text-xs text-muted-foreground">{event.date}</p>
              </div>
            </div>
          ))}
        </TabsContent>

        <TabsContent value="nutrition" className="mt-4">
          <Card>
            <CardHeader><CardTitle className="text-base">Nutrition Data</CardTitle></CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Feeding history and growth charts coming soon.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="breeding" className="mt-4">
          <Card>
            <CardHeader><CardTitle className="text-base">Breeding Records</CardTitle></CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Breeding history and lineage data coming soon.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="health" className="mt-4">
          <Card>
            <CardHeader><CardTitle className="text-base">Health Records</CardTitle></CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Treatment logs and vaccination history coming soon.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="slaughter" className="mt-4">
          <Card>
            <CardHeader><CardTitle className="text-base">Slaughter Eligibility</CardTitle></CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Eligibility checks and slaughter records coming soon.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
