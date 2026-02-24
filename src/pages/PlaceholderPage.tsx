import { Card, CardContent } from "@/components/ui/card";
import { Construction } from "lucide-react";

interface PlaceholderPageProps {
  title: string;
  description?: string;
}

export default function PlaceholderPage({ title, description }: PlaceholderPageProps) {
  return (
    <div className="space-y-4">
      <h1 className="font-heading text-2xl font-bold">{title}</h1>
      <Card>
        <CardContent className="flex flex-col items-center gap-3 py-16">
          <Construction className="h-12 w-12 text-muted-foreground" />
          <p className="text-lg font-heading font-semibold text-muted-foreground">Coming Soon</p>
          <p className="text-sm text-muted-foreground text-center max-w-md">
            {description || `The ${title} module is under development. Check back soon!`}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
