import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Filter, Plus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Stage = "piglet" | "grower" | "finisher" | "sow" | "boar";
type HealthStatus = "healthy" | "treatment" | "watch";

interface Pig {
  id: string;
  pen: string;
  lastWeight: number;
  stage: Stage;
  health: HealthStatus;
  batch: string;
  slaughterEligible: boolean;
}

const stageBadge: Record<Stage, string> = {
  piglet: "bg-info/15 text-info",
  grower: "bg-primary/15 text-primary",
  finisher: "bg-success/15 text-success",
  sow: "bg-accent text-accent-foreground",
  boar: "bg-secondary text-secondary-foreground",
};

const healthBadge: Record<HealthStatus, string> = {
  healthy: "bg-success/15 text-success",
  treatment: "bg-destructive/15 text-destructive",
  watch: "bg-warning/15 text-warning",
};

const mockPigs: Pig[] = [
  { id: "PIG-001", pen: "A1", lastWeight: 95, stage: "finisher", health: "healthy", batch: "B-2024-03", slaughterEligible: true },
  { id: "PIG-002", pen: "A1", lastWeight: 88, stage: "finisher", health: "healthy", batch: "B-2024-03", slaughterEligible: true },
  { id: "PIG-003", pen: "A2", lastWeight: 42, stage: "grower", health: "watch", batch: "B-2024-04", slaughterEligible: false },
  { id: "PIG-004", pen: "B1", lastWeight: 15, stage: "piglet", health: "healthy", batch: "B-2024-05", slaughterEligible: false },
  { id: "PIG-005", pen: "B2", lastWeight: 65, stage: "grower", health: "treatment", batch: "B-2024-04", slaughterEligible: false },
  { id: "S-042", pen: "C1", lastWeight: 180, stage: "sow", health: "healthy", batch: "-", slaughterEligible: false },
  { id: "B-007", pen: "C2", lastWeight: 220, stage: "boar", health: "treatment", batch: "-", slaughterEligible: false },
  { id: "PIG-006", pen: "A3", lastWeight: 92, stage: "finisher", health: "healthy", batch: "B-2024-03", slaughterEligible: true },
];

export default function Pigs() {
  const [search, setSearch] = useState("");
  const [stageFilter, setStageFilter] = useState<string>("all");
  const navigate = useNavigate();

  const filtered = mockPigs.filter((pig) => {
    const matchesSearch = pig.id.toLowerCase().includes(search.toLowerCase()) ||
      pig.pen.toLowerCase().includes(search.toLowerCase());
    const matchesStage = stageFilter === "all" || pig.stage === stageFilter;
    return matchesSearch && matchesStage;
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold">Pigs</h1>
          <p className="text-sm text-muted-foreground">{mockPigs.length} animals registered</p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Add Pig
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by ID or pen..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8 h-9"
          />
        </div>
        <Select value={stageFilter} onValueChange={setStageFilter}>
          <SelectTrigger className="w-[140px] h-9">
            <Filter className="mr-1 h-3 w-3" />
            <SelectValue placeholder="Stage" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Stages</SelectItem>
            <SelectItem value="piglet">Piglet</SelectItem>
            <SelectItem value="grower">Grower</SelectItem>
            <SelectItem value="finisher">Finisher</SelectItem>
            <SelectItem value="sow">Sow</SelectItem>
            <SelectItem value="boar">Boar</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Pig List */}
      <div className="grid gap-2">
        {filtered.map((pig) => (
          <Card
            key={pig.id}
            className="cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => navigate(`/pigs/${pig.id}`)}
          >
            <CardContent className="flex items-center gap-4 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-sm font-bold">
                🐷
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-semibold">{pig.id}</span>
                  <Badge className={`text-[10px] px-1.5 py-0 ${stageBadge[pig.stage]}`}>
                    {pig.stage}
                  </Badge>
                  <Badge className={`text-[10px] px-1.5 py-0 ${healthBadge[pig.health]}`}>
                    {pig.health}
                  </Badge>
                  {pig.slaughterEligible && (
                    <Badge className="text-[10px] px-1.5 py-0 bg-success/15 text-success">
                      eligible
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  Pen {pig.pen} · {pig.lastWeight} kg · Batch {pig.batch}
                </p>
              </div>
              <span className="text-lg font-heading font-bold">{pig.lastWeight}<span className="text-xs text-muted-foreground ml-0.5">kg</span></span>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
