import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, ArrowLeft } from "lucide-react";
import { useLocation } from "wouter";

interface AccessRestrictedProps {
  title?: string;
  description?: string;
  redirectPath?: string;
  redirectLabel?: string;
}

export default function AccessRestricted({
  title = "Access Restricted",
  description = "You don't have permission to access this page. This feature is only available to managers and administrators.",
  redirectPath = "/pos",
  redirectLabel = "Back to POS"
}: AccessRestrictedProps) {
  const [, setLocation] = useLocation();

  return (
    <div className="flex items-center justify-center min-h-[80vh]">
      <Card className="w-[400px] shadow-lg">
        <CardHeader className="text-center">
          <div className="mx-auto bg-amber-100 p-3 rounded-full w-16 h-16 flex items-center justify-center mb-4">
            <Shield className="h-8 w-8 text-amber-600" />
          </div>
          <CardTitle className="text-xl">{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent className="text-center text-muted-foreground">
          If you believe you should have access to this feature, please contact your system administrator.
        </CardContent>
        <CardFooter>
          <Button
            variant="default"
            className="w-full"
            onClick={() => setLocation(redirectPath)}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            {redirectLabel}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
} 