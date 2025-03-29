import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Home() {
  return (
    <div className="flex items-center justify-cente p-4">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Welcome to the Home Page</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">This is a basic React component template, styled with shadcn/ui.</p>
        </CardContent>
      </Card>
    </div>
  );
}
